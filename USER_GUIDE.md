# 📚 Flowstock User Guide

## Table of Contents
1. [Dashboard](#dashboard)
2. [Products](#products)
3. [Suppliers](#suppliers)
4. [Stock Reports](#stock-reports)
5. [Alerts](#alerts)
6. [Settings](#settings)

---

## 🏠 Dashboard

### What is the Dashboard?
The Dashboard provides a quick overview of your entire inventory management system at a glance.

### Key Features:
- **Product Summary**: View total products, low stock items, and out-of-stock items
- **Supplier Overview**: See total suppliers and recent activity
- **Alert Statistics**: Track alerts sent today, this week, and total
- **Recent Activity**: Monitor latest uploads and system activities

### How to Use:
1. **Monitor Stock Health**: Check the colored cards to quickly identify issues
   - 🟢 Green numbers = Good stock levels
   - 🟡 Orange numbers = Low stock alerts
   - 🔴 Red numbers = Out of stock items

2. **Quick Actions**: Use the dashboard to decide your next steps
   - High "Low Stock" count → Time to upload new stock reports
   - Zero suppliers → Add suppliers first
   - No recent alerts → System is running smoothly

### Best Practices:
- Check the dashboard daily to stay on top of inventory health
- Use it as your starting point each morning
- Address red (out-of-stock) items immediately

---

## 📦 Products

### What is Products?
The Products section is where you manage your entire product catalog, including stock levels, SKUs, and supplier assignments.

### Key Features:
- **Product Catalog**: View all products in an organized table
- **Stock Levels**: See current stock vs minimum thresholds
- **Manual Product Creation**: Add individual products
- **Bulk Stock Updates**: Upload CSV files to update multiple products
- **Supplier Assignment**: Link products to specific suppliers

### How to Use:

#### Adding Products Manually:
1. Click **"Add Product"** button
2. Fill in the form:
   - **SKU**: Unique product identifier (e.g., "TSHIRT-001")
   - **Name**: Descriptive product name
   - **Current Stock**: How many units you currently have
   - **Minimum Quantity**: Threshold for low stock alerts
   - **Supplier**: Choose from your supplier list
3. Click **"Save Product"**

#### Uploading Stock Reports:
1. Click **"Upload Stock Report"** button
2. Select your CSV file (supports multiple formats)
3. The system will:
   - Auto-detect the file format (Amazon, Shopify, eBay, etc.)
   - Map columns automatically
   - Create new products or update existing ones
   - Send automatic alerts for low stock items

#### Managing Existing Products:
- **Edit**: Click the edit icon to modify product details
- **View Supplier**: Click supplier name to see contact info
- **Stock Status**: Products are color-coded:
  - 🟢 Good Stock (above minimum)
  - 🟡 Low Stock (at or below minimum)
  - 🔴 Out of Stock (zero inventory)

### Best Practices:
- Set realistic minimum quantities based on your sales velocity
- Use consistent SKU naming conventions
- Upload stock reports regularly (daily/weekly)
- Review and update minimum thresholds periodically

### Supported File Formats:
- **Amazon**: Inventory reports with SKU and Quantity columns
- **Shopify**: Export files with Handle and Inventory columns
- **eBay**: Listing reports with SKU and Stock columns
- **Generic CSV**: Any CSV with SKU, Stock/Quantity, and Name columns

---

## 👥 Suppliers

### What is Suppliers?
The Suppliers section manages your vendor contacts and their information for automated communication.

### Key Features:
- **Supplier Directory**: Maintain contact information for all vendors
- **Email Integration**: Store email addresses for automated alerts
- **Product Assignment**: See which products are linked to each supplier
- **Direct Communication**: Quick email access to suppliers

### How to Use:

#### Adding a New Supplier:
1. Click **"Add Supplier"** button
2. Fill in the form:
   - **Name**: Company or contact name (e.g., "TechParts Supplier")
   - **Email**: Primary contact email for orders/alerts
3. Click **"Save Supplier"**

#### Managing Suppliers:
- **Edit**: Update supplier information using the edit icon
- **Email**: Click the mail icon to open your email client
- **View Products**: See how many products are assigned to each supplier
- **Delete**: Remove suppliers (only if no products are assigned)

#### Assigning Products to Suppliers:
- Products are assigned to suppliers when creating/editing products
- Each product must have a supplier for alerts to work
- You can reassign products to different suppliers anytime

### Best Practices:
- Add suppliers before importing products
- Use the primary ordering email address
- Keep supplier information updated
- Organize suppliers by product category if you have many

### Email Requirements:
- Suppliers must have valid email addresses for alerts to work
- Test email functionality in Settings before relying on automated alerts
- Consider creating dedicated ordering email addresses with suppliers

---

## 📊 Stock Reports

### What is Stock Reports?
The Stock Reports section shows your upload history and provides access to the bulk upload functionality.

### Key Features:
- **Upload History**: View all previously processed files
- **Processing Results**: See how many products were created/updated
- **Platform Detection**: Automatic recognition of different e-commerce formats
- **Error Tracking**: Identify and resolve upload issues

### How to Use:

#### Uploading Stock Reports:
1. Navigate to **Products** page
2. Click **"Upload Stock Report"**
3. Choose your file:
   - Drag and drop the file
   - Or click to browse and select
4. Monitor the upload progress
5. Review the results summary

#### Understanding Upload Results:
- **Total Rows**: How many products were in your file
- **Valid Rows**: Successfully processed entries
- **Products Created**: New products added to your catalog
- **Products Updated**: Existing products with updated stock levels
- **Alerts Generated**: Automatic low-stock notifications sent
- **Errors**: Any issues that need attention

#### Viewing Upload History:
- See all previous uploads with timestamps
- Check processing status and results
- Identify patterns in your upload frequency

### Best Practices:
- Upload reports regularly (daily for active businesses)
- Review error messages to improve data quality
- Keep file names descriptive with dates
- Maintain consistent column headers across uploads

### Supported Platforms:
- **Amazon Seller Central**: Inventory reports
- **Shopify Admin**: Product exports
- **eBay Seller Hub**: Listing reports
- **Etsy**: Shop inventory files
- **WooCommerce**: Product exports
- **Custom CSV**: Any format with SKU and stock columns

### File Requirements:
- Maximum file size: 25MB
- Supported formats: CSV, Excel (.xlsx, .xls), TSV
- Required columns: SKU and Stock/Quantity
- Optional columns: Product Name, Price

---

## 🔔 Alerts

### What is Alerts?
The Alerts section tracks all notifications sent to suppliers about low stock or out-of-stock situations.

### Key Features:
- **Alert History**: View all sent notifications
- **Alert Statistics**: Track daily, weekly, and monthly alert counts
- **Supplier Communication**: See which suppliers received alerts
- **Status Tracking**: Monitor delivery status of alerts

### How to Use:

#### Viewing Alert History:
- **Recent Alerts**: See the most recent notifications sent
- **Alert Details**: View product, supplier, and timestamp information
- **Status Badges**: Confirm alerts were sent successfully

#### Understanding Alert Statistics:
- **Today**: Alerts sent in the last 24 hours
- **This Week**: Weekly alert count
- **This Month**: Monthly alert volume
- **Total Sent**: All-time alert count

#### Monitoring Alert Effectiveness:
- High alert volumes may indicate:
  - Need for better stock management
  - Overly aggressive minimum quantity settings
  - Supply chain issues requiring attention

### How Alerts Are Triggered:
1. **Automatic Triggers**:
   - Stock level reaches or goes below minimum quantity
   - Product goes out of stock (zero inventory)
   - During stock report uploads

2. **Manual Triggers**:
   - Test alerts from product management
   - Individual product alert testing

### Best Practices:
- Monitor alert frequency to avoid overwhelming suppliers
- Adjust minimum quantities if alerts are too frequent
- Follow up with suppliers who receive multiple alerts
- Use alert data to improve inventory planning

### Alert Content:
Alerts include:
- Product name and SKU
- Current stock level
- Minimum quantity threshold
- Supplier contact information
- Timestamp of alert

---

## ⚙️ Settings

### What is Settings?
The Settings section configures your account, email notifications, and system preferences.

### Key Features:
- **Profile Management**: Update account information
- **Email Configuration**: Set up automated notifications
- **Security Settings**: Manage passwords and access
- **Theme Preferences**: Switch between light and dark modes

### How to Use:

#### Profile Settings:
1. **Username**: View your current username (read-only in demo)
2. **Email Address**: Update your contact email
3. **Sender Email**: Set the "from" address for supplier alerts
4. Click **"Save Profile"** to apply changes

#### Email Configuration:
This is crucial for automated alerts to work properly.

**Step 1: Configure Gmail SMTP**
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account → Security → 2-Step Verification
   - Click "App passwords"
   - Generate a 16-character password
3. **Enter Configuration**:
   - Gmail Username: Your full Gmail address
   - Gmail App Password: The 16-character code
4. Click **"Configure Email"**

**Step 2: Set Sender Email**
- Use a professional email address (e.g., alerts@yourstore.com)
- This appears as the sender in all supplier notifications
- Can be different from your Gmail username

**Step 3: Test Configuration**
1. Enter a test email address
2. Click **"Send Test Email"**
3. Check that the email is received successfully

#### Security Settings:
- **Current Password**: Enter your existing password
- **New Password**: Create a secure new password
- **Confirm Password**: Verify the new password
- Click **"Update Password"** to save changes

#### Appearance Settings:
- **Dark Mode Toggle**: Switch between light and dark themes
- Preference is saved automatically

### Best Practices:
- **Email Setup**: This is essential for the system to work properly
- **Sender Email**: Use a professional domain email if possible
- **Test Regularly**: Send test emails monthly to ensure functionality
- **Security**: Use strong passwords and change them periodically

### Troubleshooting Email Issues:
1. **App Password Not Working**:
   - Ensure 2-factor authentication is enabled
   - Generate a new app password
   - Use the full Gmail address as username

2. **Test Emails Not Received**:
   - Check spam/junk folders
   - Verify sender email is properly configured
   - Try a different test email address

3. **Alerts Not Sending**:
   - Verify email configuration is complete
   - Check that suppliers have valid email addresses
   - Review error messages in upload results

### Gmail App Password Setup:
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click "Security" in left sidebar
3. Under "Signing in to Google", click "2-Step Verification"
4. Scroll down and click "App passwords"
5. Select "Mail" and your device
6. Google will generate a 16-character password
7. Use this password in the Flowstock settings

---

## 🚀 Getting Started Workflow

### For New Users:
1. **Start with Settings**: Configure email first
2. **Add Suppliers**: Create your vendor contacts
3. **Upload Products**: Use CSV upload or manual entry
4. **Test Alerts**: Verify email notifications work
5. **Monitor Dashboard**: Check daily for stock issues

### Daily Workflow:
1. **Check Dashboard**: Review overnight changes
2. **Upload Stock Reports**: Process latest inventory data
3. **Review Alerts**: Monitor automated notifications
4. **Address Issues**: Handle out-of-stock items

### Weekly Tasks:
- Review alert history and trends
- Update supplier contact information
- Adjust minimum quantity thresholds
- Clean up outdated products

Remember: The system works best when email is properly configured and stock reports are uploaded regularly!