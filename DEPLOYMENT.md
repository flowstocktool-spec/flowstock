
# Deployment Guide for Replit

This guide will help you deploy StockAlert Pro on Replit successfully.

## 📋 Prerequisites

1. **Replit Account**: Ensure you have a Replit account
2. **PostgreSQL Database**: Required for data persistence

## 🚀 Deployment Steps

### Step 1: Import/Fork the Project
- Fork this Repl or import from GitHub
- All dependencies are defined in `package.json`

### Step 2: Set up PostgreSQL Database
1. Click on the **"Database"** tab in your Replit sidebar
2. Click **"Create Database"**
3. Replit will automatically:
   - Provision a PostgreSQL database
   - Set the `DATABASE_URL` environment variable
   - Configure connection settings

### Step 3: Run Setup
Execute the setup script:
```bash
chmod +x setup.sh && ./setup.sh
```

This will:
- Install all npm dependencies
- Verify database connection
- Run database migrations
- Optionally create sample data

### Step 4: Start the Application
```bash
npm run dev
```

The application will be available at your Repl's URL.

## 🔧 Configuration

### Environment Variables
The following are automatically configured by Replit:
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Application port (5000)
- `NODE_ENV` - Environment setting

### Manual Configuration (if needed)
If you need to manually set environment variables:
1. Go to the **Secrets** tab in Replit
2. Add the following variables:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   PORT=5000
   NODE_ENV=production
   ```

## 📊 Database Migration

### Automatic Migration
The setup script automatically runs migrations. If you need to run them manually:

```bash
npm run db:push
```

### Manual Migration
If automatic migration fails:
1. Check database connection
2. Verify `DATABASE_URL` in environment
3. Run migrations manually:
   ```bash
   npx drizzle-kit push
   ```

## 🎯 Production Deployment

### Using Replit Deployments
1. Click **"Deploy"** in your Repl
2. Choose deployment type:
   - **Autoscale**: For production applications
   - **Reserved VM**: For consistent performance

### Build Configuration
The project includes optimized build settings in `.replit`:
```toml
[deployment]
deploymentTarget = "autoscale"
build = ["npm", "run", "build"]
run = ["npm", "run", "start"]
```

## 🔍 Monitoring and Logs

### Application Logs
Monitor application logs in the Replit console:
- Database connection status
- API request logs
- Error messages

### Database Monitoring
1. Use the **Database** tab to view:
   - Connection status
   - Query performance
   - Storage usage

### Health Checks
The application includes built-in health checks:
- Database connectivity test
- API endpoint availability
- Email service status

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Failed
```
Error: Cannot find package 'postgres'
```
**Solution**: Run `npm install` to ensure all dependencies are installed.

#### Migration Errors
```
Error: relation "users" does not exist
```
**Solution**: Run database migrations:
```bash
npm run db:push
```

#### Port Binding Issues
```
Error: Port 5000 is already in use
```
**Solution**: Replit automatically handles port assignment. Ensure you're using port 5000.

#### Missing Environment Variables
```
Error: DATABASE_URL is required
```
**Solution**: 
1. Ensure PostgreSQL database is created in Replit
2. Check **Secrets** tab for `DATABASE_URL`
3. Restart the application

### Performance Optimization

#### Database Performance
- Connection pooling is automatically configured
- Indexes are created for frequently queried columns
- Database connection lifecycle is managed

#### Application Performance
- Static assets are served efficiently
- API responses are optimized
- Database queries use prepared statements

## 🔒 Security Considerations

### Database Security
- Connection strings use SSL by default
- Database access is restricted to your Repl
- Prepared statements prevent SQL injection

### Application Security
- Passwords are hashed using bcryptjs
- Session-based authentication
- Environment variables for sensitive data

## 📈 Scaling

### Replit Autoscale
The deployment is configured for Replit's autoscale feature:
- Automatic scaling based on demand
- Load balancing across instances
- Zero-downtime deployments

### Database Scaling
Replit PostgreSQL includes:
- Connection pooling
- Automatic backup
- Performance monitoring

## 🔄 Updates and Maintenance

### Code Updates
1. Make changes to your code
2. The application will automatically restart in development
3. For production, redeploy through Replit's interface

### Database Updates
1. Modify schema in `shared/schema.ts`
2. Run `npm run db:push` to apply changes
3. Test changes in development before production deployment

### Dependencies Updates
```bash
npm update
npm audit fix
```

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review application logs in Replit console
3. Verify database connection in Database tab
4. Check environment variables in Secrets tab

For Replit-specific issues, consult the [Replit Documentation](https://docs.replit.com/).
