
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

interface EmailConfig {
  username: string;
  password: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private isConfigured = false;

  async configure(config: EmailConfig): Promise<boolean> {
    try {
      this.transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: config.username,
          pass: config.password, // This should be an app password, not regular password
        },
      });

      // Verify the connection
      await this.transporter!.verify();
      this.isConfigured = true;
      console.log("Email service configured successfully");
      return true;
    } catch (error) {
      console.error("Failed to configure email service:", error);
      this.isConfigured = false;
      return false;
    }
  }

  async sendLowStockAlert(
    productName: string,
    sku: string,
    currentStock: number,
    minimumQuantity: number,
    supplierEmail: string,
    senderEmail: string
  ): Promise<boolean> {
    console.log('📧 SendLowStockAlert called with:');
    console.log(`  Product: ${productName} (${sku})`);
    console.log(`  Stock: ${currentStock}/${minimumQuantity}`);
    console.log(`  To: ${supplierEmail}`);
    console.log(`  From: ${senderEmail}`);
    console.log(`  Service configured: ${this.isConfigured}`);
    
    if (!this.isConfigured || !this.transporter) {
      console.error("❌ Email service not configured");
      return false;
    }

    try {
      const subject = `Low Stock Alert: ${productName} (SKU: ${sku})`;
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Low Stock Alert</h2>
          <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin: 0 0 12px 0; color: #991b1b;">Product Information</h3>
            <p><strong>Product Name:</strong> ${productName}</p>
            <p><strong>SKU:</strong> ${sku}</p>
            <p><strong>Current Stock:</strong> ${currentStock} units</p>
            <p><strong>Minimum Required:</strong> ${minimumQuantity} units</p>
            <p><strong>Stock Shortage:</strong> ${minimumQuantity - currentStock} units</p>
          </div>
          <p>Please arrange to restock this product as soon as possible to avoid stockouts.</p>
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #6b7280;">
            This is an automated alert from your Inventory Management System.
          </p>
        </div>
      `;

      const textContent = `
Low Stock Alert: ${productName} (SKU: ${sku})

Product Information:
- Product Name: ${productName}
- SKU: ${sku}
- Current Stock: ${currentStock} units
- Minimum Required: ${minimumQuantity} units
- Stock Shortage: ${minimumQuantity - currentStock} units

Please arrange to restock this product as soon as possible to avoid stockouts.

This is an automated alert from your Inventory Management System.
      `;

      const mailOptions = {
        from: senderEmail,
        to: supplierEmail,
        subject: subject,
        text: textContent,
        html: htmlContent,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Low stock alert sent for ${productName} to ${supplierEmail}`);
      return true;
    } catch (error) {
      console.error("❌ Failed to send low stock alert:", error);
      return false;
    }
  }

  async sendTestEmail(toEmail: string, fromEmail: string): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.error("Email service not configured");
      return false;
    }

    try {
      const mailOptions = {
        from: fromEmail,
        to: toEmail,
        subject: "Test Email from Inventory Management System",
        text: "This is a test email to verify your email configuration is working correctly.",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">Email Configuration Test</h2>
            <p>This is a test email to verify your email configuration is working correctly.</p>
            <p>If you received this email, your Gmail SMTP configuration is set up properly.</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Test email sent to ${toEmail}`);
      return true;
    } catch (error) {
      console.error("Failed to send test email:", error);
      return false;
    }
  }

  isEmailConfigured(): boolean {
    return this.isConfigured;
  }
}

export const emailService = new EmailService();
