# StockAlert Pro - Inventory Management Tool

## Overview
StockAlert Pro is a stock alerts and forecasting tool designed for e-commerce sellers managing inventory across multiple platforms. The application automatically monitors stock levels and sends email notifications to suppliers when products are running low.

## Architecture
- **Frontend**: React + TypeScript with Tailwind CSS and Shadcn UI components
- **Backend**: Express.js with TypeScript
- **Storage**: In-memory storage (MemStorage) for MVP
- **Email**: Gmail SMTP using nodemailer (no external APIs)
- **File Processing**: CSV parsing with Papa Parse

## Core Features
1. **User Management**: Account creation with email configuration
2. **Product Catalog**: Manage products with SKU, stock levels, and minimum quantities
3. **Supplier Management**: Maintain supplier contacts and email addresses
4. **Stock Report Upload**: Parse CSV/Excel files from various e-commerce platforms
5. **Automated Alerts**: Send email notifications to suppliers when stock is low
6. **Dashboard**: Overview of inventory status and recent activity

## Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   └── lib/            # Utilities and configuration
├── server/                 # Express.js backend
│   ├── routes.ts          # API routes
│   ├── storage.ts         # In-memory data storage
│   ├── email.ts           # Gmail SMTP email service
│   └── stockParser.ts     # CSV parsing utilities
└── shared/                # Shared types and schemas
    └── schema.ts          # Database schema and types
```

## Email Configuration
The application uses Gmail SMTP for sending supplier notifications. Users need to:
1. Enable 2-factor authentication on their Gmail account
2. Generate an App Password for the application
3. Configure the email settings in the application

## CSV Format Support
The stock parser automatically detects columns for:
- **SKU**: sku, SKU, product_id, Product ID, item_id, Item ID, model, Model
- **Stock**: stock, Stock, quantity, Quantity, available, Available, inventory, Inventory, qty, Qty
- **Name**: name, Name, title, Title, product_name, Product Name (optional)

## Recent Changes
- Initial MVP implementation with complete frontend and backend
- Gmail SMTP integration for email notifications
- CSV parsing for multiple e-commerce platform formats
- Dark mode support and responsive design
- Automated stock level monitoring and alert generation