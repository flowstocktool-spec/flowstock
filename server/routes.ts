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
      res.json(suppliers);
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
      const parseResult = parseStockReport(csvContent);

      if (!parseResult.success) {
        return res.status(400).json({
          error: 'Failed to parse stock report',
          details: parseResult.errors,
        });
      }

      // Update product stock levels and send alerts
      let updatedCount = 0;
      let alertsGenerated = 0;
      const alertErrors: string[] = [];

      for (const stockData of parseResult.data) {
        // Find products by SKU
        const products = await storage.getProductsBySku(stockData.sku);
        const userProducts = products.filter(p => p.userId === userId);

        for (const product of userProducts) {
          // Update stock level
          await storage.updateProductStock(product.id, stockData.currentStock);
          updatedCount++;

          // Check if alert needed
          if (stockData.currentStock <= product.minimumQuantity) {
            try {
              // Get supplier and user information
              const supplier = await storage.getSupplier(product.supplierId);
              const user = await storage.getUser(userId);

              if (supplier && user) {
                // Send email alert
                const emailSent = await emailService.sendLowStockAlert(
                  product.name,
                  product.sku,
                  stockData.currentStock,
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
          totalRows: parseResult.totalRows,
          validRows: parseResult.validRows,
          updatedProducts: updatedCount,
          alertsGenerated,
          errors: [...parseResult.errors, ...alertErrors],
        },
      });
    } catch (error) {
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

  // Email configuration
  app.post('/api/email/configure', async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      const configured = await emailService.configure({ username, password });
      if (configured) {
        res.json({ success: true, message: 'Email service configured successfully' });
      } else {
        res.status(400).json({ error: 'Failed to configure email service' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to configure email service' });
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
