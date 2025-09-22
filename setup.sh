#!/bin/bash
set -e

echo "🚀 Setting up Flowstock for production deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if DATABASE_URL exists
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not found. Please set up PostgreSQL database in Replit."
    echo "   1. Go to Database tab"
    echo "   2. Click 'Create Database'"
    echo "   3. Wait for provisioning to complete"
    echo "   4. Restart this setup"
    exit 1
fi

echo "✅ DATABASE_URL found: ${DATABASE_URL:0:30}..."

# Validate setup
echo "🔍 Validating database setup..."
node -r tsx/register server/validate-setup.ts

if [ $? -eq 0 ]; then
    echo "✅ Database validation passed!"
else
    echo "⚠️  Database validation failed. Running comprehensive setup..."
    # Run comprehensive database setup
    node -r tsx/register -e "
    import { setupDatabase } from './server/db-setup.js';
    setupDatabase().then(success => {
      if (success) {
        console.log('✅ Database setup completed successfully!');
        process.exit(0);
      } else {
        console.error('❌ Database setup failed!');
        process.exit(1);
      }
    }).catch(error => {
      console.error('❌ Setup error:', error);
      process.exit(1);
    });
    "
fi

echo ""
echo "🎉 Setup completed successfully!"
echo "🚀 Application is ready for deployment!"
echo ""
echo "📊 Demo login credentials:"
echo "   Username: demo_user"
echo "   Password: demo123"
echo ""
echo "🌐 To start development server:"
echo "   npm run dev"
echo ""
echo "🚀 To deploy in production:"
echo "   Click the Deploy button in Replit"
echo ""