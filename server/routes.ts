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

// Helper function to automatically send stock alerts
async function sendAutomaticStockAlert(product: any) {
  const isLowStock = product.currentStock <= product.minimumQuantity;
  const isOutOfStock = product.currentStock === 0;
  
  console.log(`\n🔍 AUTO ALERT CHECK:`);
  console.log(`Product: ${product.name} (${product.sku})`);
  console.log(`Current stock: ${product.currentStock}, Minimum: ${product.minimumQuantity}`);
  console.log(`Is low stock: ${isLowStock}, Is out of stock: ${isOutOfStock}`);
  console.log(`Email service configured: ${emailService.isEmailConfigured()}`);
  
  if (isLowStock || isOutOfStock) {
    if (!emailService.isEmailConfigured()) {
      console.log('⚠️ Email service not configured - cannot send automatic alerts');
      return;
    }

    try {
      const supplier = await storage.getSupplier(product.supplierId);
      const user = await storage.getUser(product.userId);

      console.log(`Supplier: ${supplier?.name || 'None'} (${supplier?.email || 'No email'})`);
      console.log(`User: ${user?.username || 'None'} (sender: ${user?.senderEmail || 'No sender email'})`);

      if (supplier && user && supplier.email && user.senderEmail) {
        console.log(`📧 Sending automatic ${isOutOfStock ? 'OUT OF STOCK' : 'LOW STOCK'} alert to ${supplier.email}`);
        
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
          console.log(`✅ Automatic alert sent: ${product.name} to ${supplier.email}`);
        } else {
          console.log(`❌ Failed to send automatic alert for: ${product.name}`);
        }
      } else {
        console.log('❌ Cannot send alert - missing supplier email or user sender email');
      }
    } catch (error) {
      console.error('❌ Error sending automatic stock alert:', error);
    }
  } else {
    console.log('✅ Stock level is adequate - no alert needed');
  }
}

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


  // Get current user (demo user for now)
  app.get('/api/user/current', async (req, res) => {
    try {
      const user = await storage.getUserByUsername('demo_user');
      if (!user) {
        return res.status(404).json({ error: 'Demo user not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch current user' });
    }
  });

  // Supplier routes
  app.get('/api/suppliers', async (req, res) => {
    try {
      // Get current user ID from demo user
      const currentUser = await storage.getUserByUsername('demo_user');
      if (!currentUser) {
        return res.status(404).json({ error: 'Demo user not found' });
      }
      const suppliers = await storage.getSuppliersByUserId(currentUser.id);
      
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
      // Get current demo user for consistent userId
      const currentUser = await storage.getUserByUsername('demo_user');
      if (!currentUser) {
        return res.status(404).json({ error: 'Demo user not found' });
      }
      
      const supplierData = insertSupplierSchema.parse({
        ...req.body,
        userId: currentUser.id // Use demo user's ID consistently
      });
      
      const supplier = await storage.createSupplier(supplierData);
      console.log(`✅ New supplier created: ${supplier.name} (${supplier.email}) for user ${currentUser.id}`);
      res.json(supplier);
    } catch (error) {
      console.error('Error creating supplier:', error);
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
      // Get current user ID from demo user
      const currentUser = await storage.getUserByUsername('demo_user');
      if (!currentUser) {
        return res.status(404).json({ error: 'Demo user not found' });
      }
      const products = await storage.getProductsByUserId(currentUser.id);

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
      // Get current demo user for consistent userId
      const currentUser = await storage.getUserByUsername('demo_user');
      if (!currentUser) {
        return res.status(404).json({ error: 'Demo user not found' });
      }

      const productData = insertProductSchema.parse({
        ...req.body,
        userId: currentUser.id // Use demo user's ID consistently
      });
      
      const product = await storage.createProduct(productData);
      console.log(`✅ New product created: ${product.name} (${product.sku}) for user ${currentUser.id}`);
      
      // Automatically send alert if the new product is low stock or out of stock
      await sendAutomaticStockAlert(product);
      
      res.json(product);
    } catch (error) {
      console.error('Error creating product:', error);
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

      // Automatically send alert if stock is low or out of stock
      await sendAutomaticStockAlert(product);

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
        stock: row.currentStock,
        name: undefined
      }));

      const updatedCount = await storage.batchUpdateProductStock(userId, updates);

      for (const stockData of parseResult.data) {
        // Find products by SKU
        const products = await storage.getProductsBySku(stockData.sku);
        const userProducts = products.filter(p => p.userId === userId);

        for (const product of userProducts) {
          try {
            // Update the product with new stock level
            const updatedProduct = await storage.updateProduct(product.id, {
              currentStock: stockData.currentStock
            });
            
            if (updatedProduct) {
              // Send automatic alert if needed
              const isLowStock = stockData.currentStock <= product.minimumQuantity;
              const isOutOfStock = stockData.currentStock === 0;
              
              if (isLowStock || isOutOfStock) {
                const supplier = await storage.getSupplier(product.supplierId);
                const user = await storage.getUser(userId);

                if (supplier && user && supplier.email && user.senderEmail && emailService.isEmailConfigured()) {
                  console.log(`📧 CSV Upload: Sending ${isOutOfStock ? 'OUT OF STOCK' : 'LOW STOCK'} alert for ${product.name}`);
                  
                  const emailSent = await emailService.sendLowStockAlert(
                    product.name,
                    product.sku,
                    stockData.currentStock,
                    product.minimumQuantity,
                    supplier.email,
                    user.senderEmail
                  );

                  if (emailSent) {
                    await storage.createAlert(product.id, supplier.id, userId);
                    alertsGenerated++;
                    console.log(`✅ CSV Alert sent: ${product.name} to ${supplier.email}`);
                  } else {
                    alertErrors.push(`Failed to send alert for ${product.name}`);
                  }
                } else {
                  alertErrors.push(`Cannot send alert for ${product.name} - missing email configuration`);
                }
              }
            }
          } catch (error) {
            alertErrors.push(`Error processing alert for ${product.name}: ${error}`);
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
        // Save credentials to database for persistence
        const currentUser = await storage.getUserByUsername('demo_user');
        if (currentUser) {
          await storage.updateUser(currentUser.id, {
            gmailUsername: username,
            gmailAppPassword: password // In production, this should be encrypted
          });
        }
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

  // Check email configuration status
  app.get('/api/email/status', async (req, res) => {
    try {
      const isConfigured = emailService.isEmailConfigured();
      const currentUser = await storage.getUserByUsername('demo_user');
      
      res.json({ 
        configured: isConfigured,
        hasStoredCredentials: !!(currentUser?.gmailUsername && currentUser?.gmailAppPassword)
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to check email configuration status' });
    }
  });

  // Demo email configuration for testing
  app.post('/api/email/configure-demo', async (req, res) => {
    res.status(400).json({ 
      error: 'Demo email is not available. Please configure your own Gmail SMTP credentials.',
      message: 'Use your Gmail address and App Password in the Gmail SMTP Configuration section above.'
    });
  });

  // Test low stock alert endpoint
  app.post('/api/test-alert/:productId', async (req, res) => {
    try {
      const { productId } = req.params;
      const product = await storage.getProduct(productId);
      
      if (!product) {
        console.log(`❌ Product not found: ${productId}`);
        return res.status(404).json({ error: 'Product not found' });
      }

      console.log(`🧪 Testing alert for product: ${product.name} (${product.sku})`);
      console.log(`Current stock: ${product.currentStock}, Minimum: ${product.minimumQuantity}`);
      console.log(`Email service configured: ${emailService.isEmailConfigured()}`);
      
      if (!emailService.isEmailConfigured()) {
        console.log('❌ Email service not configured - please configure Gmail SMTP first');
        return res.status(400).json({ 
          error: 'Email service not configured',
          message: 'Please configure Gmail SMTP in Settings first'
        });
      }

      const supplier = await storage.getSupplier(product.supplierId);
      const user = await storage.getUser(product.userId);

      console.log(`Supplier found: ${supplier ? supplier.name : 'None'} (${supplier ? supplier.email : 'No email'})`);
      console.log(`User found: ${user ? user.username : 'None'} (sender: ${user ? user.senderEmail : 'No sender email'})`);

      if (!supplier) {
        console.log('❌ No supplier assigned to this product');
        return res.status(400).json({ 
          error: 'No supplier assigned',
          message: 'Please assign a supplier to this product first'
        });
      }

      if (!user) {
        console.log('❌ User not found');
        return res.status(400).json({ error: 'User not found' });
      }

      if (!supplier.email) {
        console.log('❌ Supplier has no email address');
        return res.status(400).json({ 
          error: 'Supplier email missing',
          message: `Please add an email address for supplier ${supplier.name}`
        });
      }

      if (!user.senderEmail) {
        console.log('❌ User has no sender email configured');
        return res.status(400).json({ 
          error: 'Sender email missing',
          message: 'Please set a sender email address in Settings'
        });
      }

      console.log(`✅ All checks passed - sending test alert to ${supplier.email}`);

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
        console.log(`✅ Test alert sent successfully to ${supplier.email}`);
        res.json({ 
          success: true, 
          message: `Test alert sent for ${product.name} to ${supplier.email}` 
        });
      } else {
        console.log('❌ Failed to send email - check email configuration');
        res.status(500).json({ 
          error: 'Failed to send email',
          message: 'Email sending failed - check your Gmail configuration'
        });
      }
    } catch (error) {
      console.error('❌ Test alert error:', error);
      res.status(500).json({ 
        error: 'Failed to send test alert',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
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