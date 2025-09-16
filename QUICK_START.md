
# 🚀 Quick Start Guide

Get StockAlert Pro running in under 5 minutes!

## Step 1: Set up Database
1. Click **"Database"** tab in Replit
2. Click **"Create Database"**
3. Wait for provisioning to complete

## Step 2: Run Setup
```bash
chmod +x setup.sh && ./setup.sh
```

## Step 3: Start Application
```bash
npm run dev
```

## Step 4: Access Your App
- Click the URL that appears in the console
- Register a new account
- Start managing your inventory!

## 🎯 First Steps After Setup

### 1. Create Your Account
- Go to the application URL
- Click "Register" 
- Fill in your details

### 2. Add a Supplier
- Navigate to "Suppliers" page
- Click "Add Supplier"
- Enter supplier name and email

### 3. Add Products
- Go to "Products" page
- Click "Add Product"
- Enter product details and assign to supplier

### 4. Upload Stock Report
- Navigate to "Upload" page
- Upload a CSV file with stock data
- Columns supported: SKU, Stock/Quantity, Name

### 5. Configure Email (Optional)
- Go to "Settings" page
- Set up Gmail SMTP for supplier notifications

## 📋 Sample Data
During setup, choose "y" to create sample data including:
- Sample user account
- Example supplier
- Test product with low stock alert

## 🔧 Common Commands
```bash
# Start development
npm run dev

# Build for production
npm run build

# Push database changes
npm run db:push

# Check types
npm run check
```

That's it! Your inventory management system is ready to use.
