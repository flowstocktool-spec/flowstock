
# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### 🗄️ Database Issues

#### "Cannot find package 'postgres'"
**Error**: 
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'postgres'
```

**Solution**:
```bash
npm install
```

#### "DATABASE_URL is required"
**Error**: 
```
Error: DATABASE_URL is required
```

**Solutions**:
1. **Create PostgreSQL Database in Replit**:
   - Click "Database" tab
   - Click "Create Database"
   - Wait for provisioning

2. **Check Environment Variables**:
   - Go to "Secrets" tab in Replit
   - Verify `DATABASE_URL` exists

3. **Manual Setup** (if needed):
   ```bash
   echo $DATABASE_URL
   ```

#### Migration Failures
**Error**:
```
Error: relation "users" does not exist
```

**Solution**:
```bash
npm run db:push
```

### 🔧 Application Issues

#### Port Already in Use
**Error**:
```
Error: Port 5000 is already in use
```

**Solution**:
- Replit automatically manages ports
- Restart your Repl
- The application should bind to port 5000

#### Slow Performance
**Symptoms**: Application loads slowly or times out

**Solutions**:
1. **Database Connection Issues**:
   ```bash
   # Test database connection
   node -e "
   import('./server/db-test.js').then(m => m.testDatabase())
   .then(result => console.log('DB Test:', result))
   "
   ```

2. **Check Database Status**:
   - Go to "Database" tab
   - Verify database is running
   - Check connection status

3. **Restart Application**:
   - Stop the current process
   - Run `npm run dev` again

### 📧 Email Issues

#### Gmail Authentication Failed
**Error**: Authentication failed when sending emails

**Solutions**:
1. **Enable 2-Factor Authentication** on Gmail
2. **Generate App Password**:
   - Google Account → Security → 2-Step Verification
   - App passwords → Generate new password
3. **Use App Password** (not regular password) in settings

#### Emails Not Sending
**Symptoms**: No error but emails don't arrive

**Solutions**:
1. **Check Spam Folder**
2. **Verify Sender Email** matches Gmail account
3. **Check Email Settings** in application
4. **Test Email Configuration**

### 📁 File Upload Issues

#### CSV Upload Fails
**Error**: File upload doesn't process correctly

**Solutions**:
1. **Check File Format**:
   - Must be CSV format
   - Check file encoding (UTF-8 recommended)

2. **Verify Column Headers**:
   ```
   Supported headers:
   - SKU: sku, SKU, product_id, Product ID
   - Stock: stock, Stock, quantity, Quantity
   - Name: name, Name, title, Title (optional)
   ```

3. **Check File Size**:
   - Large files may timeout
   - Try smaller batches

### 🚀 Deployment Issues

#### Build Failures
**Error**: Build process fails during deployment

**Solutions**:
1. **Check TypeScript Errors**:
   ```bash
   npm run check
   ```

2. **Clear Node Modules**:
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Update Dependencies**:
   ```bash
   npm update
   ```

#### Application Won't Start
**Error**: Application fails to start in production

**Solutions**:
1. **Check Build Output**:
   ```bash
   npm run build
   ```

2. **Verify Production Environment**:
   ```bash
   NODE_ENV=production npm run start
   ```

3. **Check Logs** in Replit console

### 🔍 Debug Steps

#### Enable Debug Logging
Add to your code temporarily:
```javascript
console.log('Debug info:', { 
  DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT 
});
```

#### Database Connection Test
```bash
node -e "
const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL);
sql\`SELECT version()\`.then(console.log).finally(() => process.exit());
"
```

#### Check API Endpoints
Test API endpoints manually:
```bash
curl http://localhost:5000/api/products
curl http://localhost:5000/api/suppliers
```

### 🆘 Getting Help

If none of these solutions work:

1. **Check Application Logs**:
   - Look at console output in Replit
   - Check for error messages

2. **Verify Prerequisites**:
   - Node.js version (should be 20+)
   - PostgreSQL database created
   - All environment variables set

3. **Reset Environment**:
   ```bash
   # Clean install
   rm -rf node_modules package-lock.json
   npm install
   
   # Reset database (if needed)
   npm run db:push
   ```

4. **Contact Support**:
   - Include error messages
   - Describe steps taken
   - Share relevant logs
