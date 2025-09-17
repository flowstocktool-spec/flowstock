import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeDatabase } from "./database";
import { testDatabaseConnection } from "./db-test";
import { createSampleData } from "./db-init";
import { storage } from "./storage";
import { emailService } from "./email";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

async function restoreEmailConfiguration() {
  try {
    const demoUser = await storage.getUserByUsername('demo_user');
    if (demoUser && demoUser.gmailUsername && demoUser.gmailAppPassword) {
      console.log('🔧 Restoring email configuration...');
      const configured = await emailService.configure({
        username: demoUser.gmailUsername,
        password: demoUser.gmailAppPassword
      });
      if (configured) {
        console.log('✅ Email configuration restored successfully');
      } else {
        console.log('⚠️ Failed to restore email configuration - credentials may be invalid');
      }
    } else {
      console.log('ℹ️ No saved email configuration found');
    }
  } catch (error) {
    console.error('❌ Error restoring email configuration:', error);
  }
}

(async () => {
  // Initialize database
  await initializeDatabase();

  // Test database connection
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    console.error('Failed to connect to database - application may not work correctly');
  }

  // Create sample data for demo purposes
  try {
    await createSampleData();
    // Restore email configuration after database is ready
    await restoreEmailConfiguration();
  } catch (error) {
    console.log('Sample data already exists or creation failed - continuing...');
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();