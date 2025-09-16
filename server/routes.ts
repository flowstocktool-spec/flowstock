import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { emailService } from "./email";
import { parseStockReport } from "./stockParser";
import {
  insertUserSchema,
  insertSupplierSchema,
  insertProductSchema,
  insertStockReportSchema,
} from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const ext = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    cb(null, allowedTypes.includes(ext));
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post('/api/users', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: 'Invalid user data' });
    }
  });

  app.get('/api/users/:id', async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  app.put('/api/users/:id', async (req, res) => {
    try {
      const updates = req.body;
      const user = await storage.updateUser(req.params.id, updates);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update user' });
    }
  });

  // Supplier routes
  app.get('/api/suppliers', async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }
      const suppliers = await storage.getSuppliersByUserId(userId);
      
      // Enrich suppliers with product count
      const enrichedSuppliers = await Promise.all(
        suppliers.map(async (supplier) => {
          const products = await storage.getProductsBySupplier(supplier.id);
          return {
            ...supplier,
            productCount: products.length,
          };
        })
      );
      
      res.json(enrichedSuppliers);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch suppliers' });
    }
  });

  app.post('/api/suppliers', async (req, res) => {
    try {
      const supplierData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(supplierData);
      res.json(supplier);
    } catch (error) {
      res.status(400).json({ error: 'Invalid supplier data' });
    }
  });

  app.put('/api/suppliers/:id', async (req, res) => {
    try {
      const updates = req.body;
      const supplier = await storage.updateSupplier(req.params.id, updates);
      if (!supplier) {
        return res.status(404).json({ error: 'Supplier not found' });
      }
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update supplier' });
    }
  });

  app.delete('/api/suppliers/:id', async (req, res) => {
    try {
      const deleted = await storage.deleteSupplier(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Supplier not found' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete supplier' });
    }
  });

  // Product routes
  app.get('/api/products', async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }
      const products = await storage.getProductsByUserId(userId);

      // Enrich products with supplier information
      const enrichedProducts = await Promise.all(
        products.map(async (product) => {
          const supplier = await storage.getSupplier(product.supplierId);
          return {
            ...product,
            supplierName: supplier?.name || 'Unknown',
            supplierEmail: supplier?.email || '',
          };
        })
      );

      res.json(enrichedProducts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  app.post('/api/products', async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      res.status(400).json({ error: 'Invalid product data' });
    }
  });

  app.put('/api/products/:id', async (req, res) => {
    try {
      const updates = req.body;
      const product = await storage.updateProduct(req.params.id, updates);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Check if stock alert should be sent
      console.log(`\n🔍 PRODUCT UPDATE DEBUG:`);
      console.log(`Product: ${product.name} (${product.sku})`);
      console.log(`Current stock: ${product.currentStock}, Minimum: ${product.minimumQuantity}`);
      console.log(`Email service configured: ${emailService.isEmailConfigured()}`);
      console.log(`Should send alert: ${product.currentStock <= product.minimumQuantity}`);
      
      if (product.currentStock <= product.minimumQuantity) {
        console.log(`Low stock detected for ${product.name}`);
        
        if (!emailService.isEmailConfigured()) {
          console.log('Email service not configured - cannot send alerts');
        } else {
          try {
            // Get supplier and user information
            const supplier = await storage.getSupplier(product.supplierId);
            const user = await storage.getUser(product.userId);

            console.log(`Supplier found: ${supplier ? supplier.name : 'None'}`);
            console.log(`User found: ${user ? user.username : 'None'}`);
            console.log(`Supplier email: ${supplier?.email || 'None'}`);
            console.log(`User sender email: ${user?.senderEmail || 'None'}`);

            if (supplier && user && supplier.email && user.senderEmail) {
              console.log(`Attempting to send email to ${supplier.email}`);
              
              // Send email alert
              const emailSent = await emailService.sendLowStockAlert(
                product.name,
                product.sku,
                product.currentStock,
                product.minimumQuantity,
                supplier.email,
                user.senderEmail
              );

              if (emailSent) {
                // Create alert record
                await storage.createAlert(product.id, supplier.id, product.userId);
                console.log(`✅ Low stock alert sent for product: ${product.name} to ${supplier.email}`);
              } else {
                console.log(`❌ Failed to send alert for product: ${product.name}`);
              }
            } else {
              console.log('❌ Missing required information for sending alert:');
              console.log(`  - Supplier: ${supplier ? 'Found' : 'Missing'}`);
              console.log(`  - User: ${user ? 'Found' : 'Missing'}`);
              console.log(`  - Supplier email: ${supplier?.email ? 'Present' : 'Missing'}`);
              console.log(`  - User sender email: ${user?.senderEmail ? 'Present' : 'Missing'}`);
            }
          } catch (alertError) {
            console.error('❌ Error sending low stock alert:', alertError);
          }
        }
      } else {
        console.log('Stock level is above minimum threshold - no alert needed');
      }

      res.json(product);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update product' });
    }
  });

  app.delete('/api/products/:id', async (req, res) => {
    try {
      const deleted = await storage.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete product' });
    }
  });

  // Stock report upload and processing
  app.post('/api/stock-reports/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const userId = req.body.userId;
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      // Create stock report record
      const reportData = {
        filename: req.file.originalname,
        userId,
      };
      const report = await storage.createStockReport(reportData);

      // Parse the CSV file
      const csvContent = req.file.buffer.toString('utf-8');
      const parseResult = await parseStockReport(csvContent); // Corrected: make stock parsing async

      if (!parseResult.success) {
        return res.status(400).json({
          error: 'Failed to parse stock report',
          details: parseResult.errors,
        });
      }

      // Update product stock levels and send alerts
      let alertsGenerated = 0;
      const alertErrors: string[] = [];

      // Use batch update for much better performance
      const updates = parseResult.data.map(row => ({
        sku: row.sku,
        stock: row.stock,
        name: row.name
      }));

      const updatedCount = await storage.batchUpdateProductStock(userId, updates);

      for (const stockData of parseResult.data) {
        // Find products by SKU
        const products = await storage.getProductsBySku(stockData.sku);
        const userProducts = products.filter(p => p.userId === userId);

        for (const product of userProducts) {
          // Check if alert needed
          if (stockData.stock <= product.minimumQuantity) {
            try {
              // Get supplier and user information
              const supplier = await storage.getSupplier(product.supplierId);
              const user = await storage.getUser(userId);

              if (supplier && user) {
                // Send email alert
                const emailSent = await emailService.sendLowStockAlert(
                  product.name,
                  product.sku,
                  stockData.stock,
                  product.minimumQuantity,
                  supplier.email,
                  user.senderEmail
                );

                if (emailSent) {
                  // Create alert record
                  await storage.createAlert(product.id, supplier.id, userId);
                  alertsGenerated++;
                } else {
                  alertErrors.push(`Failed to send alert for ${product.name}`);
                }
              }
            } catch (error) {
              alertErrors.push(`Error processing alert for ${product.name}: ${error}`);
            }
          }
        }
      }

      // Mark report as processed
      await storage.updateStockReportProcessed(report.id, true);

      res.json({
        success: true,
        report,
        summary: {
          totalRows: parseResult.data.length,
          validRows: parseResult.data.length,
          updatedProducts: updatedCount,
          alertsGenerated,
          errors: [...parseResult.errors, ...alertErrors],
        },
      });
    } catch (error) {
      console.error("Error processing stock report:", error); // Added console logging for debugging
      res.status(500).json({ error: 'Failed to process stock report' });
    }
  });

  app.get('/api/stock-reports', async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }
      const reports = await storage.getStockReportsByUserId(userId);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch stock reports' });
    }
  });

  // Alert routes
  app.get('/api/alerts', async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }
      const alerts = await storage.getAlertsByUserId(userId);

      // Enrich alerts with product and supplier information
      const enrichedAlerts = await Promise.all(
        alerts.map(async (alert) => {
          const product = await storage.getProduct(alert.productId);
          const supplier = await storage.getSupplier(alert.supplierId);
          return {
            ...alert,
            productName: product?.name || 'Unknown',
            productSku: product?.sku || 'Unknown',
            supplierName: supplier?.name || 'Unknown',
            supplierEmail: supplier?.email || 'Unknown',
          };
        })
      );

      res.json(enrichedAlerts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  });

  // Save user settings (including sender email) - this replaces the duplicate route above
  app.put('/api/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Actually update the user in the database
      const user = await storage.updateUser(id, updates);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      console.log(`✅ User ${id} updated:`, { username: user.username, email: user.email, senderEmail: user.senderEmail });
      res.json(user);
    } catch (error) {
      console.error('Failed to update user:', error);
      res.status(500).json({ error: 'Failed to update user settings' });
    }
  });

  // Email configuration (simplified, per-user)
  app.post('/api/email/configure', async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Gmail username and App Password are required' });
      }

      const configured = await emailService.configure({ username, password });
      if (configured) {
        res.json({ success: true, message: 'Gmail SMTP configured successfully' });
      } else {
        res.status(400).json({ error: 'Failed to configure Gmail SMTP. Please check your credentials.' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to configure email service' });
    }
  });

  // Test email endpoint
  app.post('/api/email/test', async (req, res) => {
    try {
      const { toEmail, fromEmail } = req.body;
      if (!toEmail || !fromEmail) {
        return res.status(400).json({ error: 'Both toEmail and fromEmail are required' });
      }

      const sent = await emailService.sendTestEmail(toEmail, fromEmail);
      if (sent) {
        res.json({ success: true, message: 'Test email sent successfully' });
      } else {
        res.status(400).json({ error: 'Failed to send test email. Please check your email configuration.' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to send test email' });
    }
  });

  // Demo email configuration for testing
  app.post('/api/email/configure-demo', async (req, res) => {
    try {
      // Use a test Gmail account for demonstration
      const demoConfig = {
        username: 'stockalertdemo@gmail.com', // You can replace with your test email
        password: 'demo-app-password-here'     // You'll need to generate this
      };
      
      console.log('🧪 Configuring demo email service...');
      const configured = await emailService.configure(demoConfig);
      
      if (configured) {
        console.log('✅ Demo email service configured successfully');
        res.json({ 
          success: true, 
          message: 'Demo email service configured successfully',
          configured: emailService.isEmailConfigured()
        });
      } else {
        res.status(400).json({ error: 'Failed to configure demo email service' });
      }
    } catch (error) {
      console.error('Demo email configuration error:', error);
      res.status(500).json({ error: 'Failed to configure demo email service' });
    }
  });

  // Test low stock alert endpoint
  app.post('/api/test-alert/:productId', async (req, res) => {
    try {
      const { productId } = req.params;
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      console.log(`🧪 Testing alert for product: ${product.name}`);
      console.log(`Current stock: ${product.currentStock}, Minimum: ${product.minimumQuantity}`);
      
      if (!emailService.isEmailConfigured()) {
        return res.status(400).json({ error: 'Email service not configured' });
      }

      const supplier = await storage.getSupplier(product.supplierId);
      const user = await storage.getUser(product.userId);

      if (!supplier || !user) {
        return res.status(400).json({ error: 'Missing supplier or user information' });
      }

      if (!supplier.email || !user.senderEmail) {
        return res.status(400).json({ 
          error: 'Missing email addresses', 
          details: { 
            supplierEmail: supplier.email || 'Missing', 
            userSenderEmail: user.senderEmail || 'Missing' 
          }
        });
      }

      const emailSent = await emailService.sendLowStockAlert(
        product.name,
        product.sku,
        product.currentStock,
        product.minimumQuantity,
        supplier.email,
        user.senderEmail
      );

      if (emailSent) {
        await storage.createAlert(product.id, supplier.id, product.userId);
        res.json({ 
          success: true, 
          message: `Test alert sent for ${product.name} to ${supplier.email}` 
        });
      } else {
        res.status(500).json({ error: 'Failed to send test alert' });
      }
    } catch (error) {
      console.error('Test alert error:', error);
      res.status(500).json({ error: 'Failed to send test alert' });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const products = await storage.getProductsByUserId(userId);
      const suppliers = await storage.getSuppliersByUserId(userId);
      const alerts = await storage.getAlertsByUserId(userId);

      const lowStockItems = products.filter(p => p.currentStock <= p.minimumQuantity && p.currentStock > 0);
      const outOfStockItems = products.filter(p => p.currentStock === 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayAlerts = alerts.filter(a => a.sentAt && a.sentAt >= today);

      res.json({
        totalProducts: products.length,
        totalSuppliers: suppliers.length,
        lowStockItems: lowStockItems.length,
        outOfStockItems: outOfStockItems.length,
        alertsSentToday: todayAlerts.length,
        totalAlerts: alerts.length,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}