import nodemailer from 'nodemailer';

interface EmailConfig {
  username: string;
  password: string;
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  async configure(config: EmailConfig) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.username,
        pass: config.password, // This should be an app password, not the regular password
      },
    });

    // Verify the connection
    try {
      if (this.transporter) {
        await this.transporter.verify();
        console.log('Gmail SMTP connection verified successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Gmail SMTP verification failed:', error);
      return false;
    }
  }

  async sendEmail(params: EmailParams): Promise<boolean> {
    if (!this.transporter) {
      console.error('Email service not configured');
      return false;
    }

    try {
      const info = await this.transporter.sendMail({
        from: params.from,
        to: params.to,
        subject: params.subject,
        text: params.text,
        html: params.html,
      });

      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendLowStockAlert(productName: string, sku: string, currentStock: number, minimumQuantity: number, supplierEmail: string, senderEmail: string): Promise<boolean> {
    const subject = `Low Stock Alert: ${productName} (${sku})`;
    const text = `
Dear Supplier,

This is an automated notification that the following product is running low on stock:

Product: ${productName}
SKU: ${sku}
Current Stock: ${currentStock}
Minimum Quantity: ${minimumQuantity}

Please arrange for restocking at your earliest convenience.

Best regards,
StockAlert Pro System
    `;

    const html = `
      <h2>Low Stock Alert</h2>
      <p>Dear Supplier,</p>
      <p>This is an automated notification that the following product is running low on stock:</p>
      <ul>
        <li><strong>Product:</strong> ${productName}</li>
        <li><strong>SKU:</strong> ${sku}</li>
        <li><strong>Current Stock:</strong> ${currentStock}</li>
        <li><strong>Minimum Quantity:</strong> ${minimumQuantity}</li>
      </ul>
      <p>Please arrange for restocking at your earliest convenience.</p>
      <p>Best regards,<br>StockAlert Pro System</p>
    `;

    return this.sendEmail({
      to: supplierEmail,
      from: senderEmail,
      subject,
      text,
      html,
    });
  }
}

export const emailService = new EmailService();