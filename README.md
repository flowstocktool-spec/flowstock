
# StockAlert Pro - Inventory Management System

A comprehensive inventory management system for e-commerce sellers with automated stock alerts and supplier notifications.

## 🚀 Quick Start on Replit

1. **Fork or Import this Repl**
2. **Set up PostgreSQL Database:**
   - Click on the "Database" tab in Replit
   - Click "Create Database"
   - DATABASE_URL will be automatically added to your environment

3. **Run Setup:**
   ```bash
   chmod +x setup.sh && ./setup.sh
   ```

4. **Start the application:**
   ```bash
   npm run dev
   ```

## 🏗️ Architecture

- **Frontend**: React + TypeScript with Tailwind CSS and Shadcn UI
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Email**: Gmail SMTP integration
- **File Processing**: CSV parsing with Papa Parse

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   └── lib/            # Utilities and configuration
├── server/                 # Express.js backend
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   ├── database.ts        # Database connection
│   ├── email.ts           # Email service
│   └── stockParser.ts     # CSV parsing utilities
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database schema
├── migrations/            # Database migrations
└── setup.sh              # Automated setup script
```

## 🔧 Environment Variables

The following environment variables are automatically set by Replit:

- `DATABASE_URL` - PostgreSQL connection string (set by Replit Database)
- `PORT` - Application port (default: 5000)

## 🎯 Features

### Core Features
- ✅ User authentication and management
- ✅ Product catalog with SKU tracking
- ✅ Supplier management with email notifications
- ✅ Stock level monitoring and alerts
- ✅ CSV file upload and processing
- ✅ Automated email notifications to suppliers
- ✅ Dashboard with inventory overview

### Email Configuration
To enable email notifications:
1. Go to Settings page in the application
2. Configure Gmail SMTP settings
3. Use App Password for authentication (not regular password)

### CSV Format Support
The system automatically detects columns for:
- **SKU**: sku, SKU, product_id, Product ID, item_id, Item ID, model, Model
- **Stock**: stock, Stock, quantity, Quantity, available, Available, inventory, Inventory
- **Name**: name, Name, title, Title, product_name, Product Name (optional)

## 🚀 Deployment

This project is configured for Replit deployment:

1. **Development**: `npm run dev`
2. **Production Build**: `npm run build`
3. **Production Start**: `npm run start`
4. **Deploy**: Use Replit's deployment features

## 📊 Database Schema

### Users
- id, username, email, senderEmail, password, createdAt

### Suppliers
- id, name, email, userId, createdAt

### Products
- id, name, sku, minimumQuantity, currentStock, supplierId, userId, lastUpdated

### Stock Reports
- id, filename, uploadedAt, processed, userId

### Alerts
- id, productId, supplierId, userId, sentAt

## 🔍 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Suppliers
- `GET /api/suppliers` - List suppliers
- `POST /api/suppliers` - Create supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier

### Stock Reports
- `POST /api/stock/upload` - Upload stock report
- `GET /api/stock/reports` - List reports

### Alerts
- `GET /api/alerts` - List alerts
- `POST /api/alerts/send` - Send alert to supplier

## 🛠️ Development

### Prerequisites
- Node.js 20+
- PostgreSQL database (automatically provided by Replit)

### Local Development Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run database migrations
npm run db:push

# Type checking
npm run check
```

### Database Operations
```bash
# Push schema changes to database
npm run db:push

# Generate migration files (if needed)
npx drizzle-kit generate

# Apply migrations manually
npx drizzle-kit migrate
```

## 🔒 Security

- Passwords are hashed using bcryptjs
- Database queries use prepared statements via Drizzle ORM
- Environment variables for sensitive configuration
- Session-based authentication

## 📧 Email Setup Guide

1. Enable 2FA on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the generated password in the application settings

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure DATABASE_URL is set in environment
- Check PostgreSQL database is created in Replit
- Verify migrations have been applied

### Email Issues
- Verify Gmail App Password is correct
- Check sender email matches Gmail account
- Ensure 2FA is enabled on Gmail account

### File Upload Issues
- Check file format is CSV
- Verify column headers match expected format
- Check file size limits

## 📄 License

MIT License - see LICENSE file for details
