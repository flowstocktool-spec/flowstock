
#!/bin/bash

echo "🚀 Setting up StockAlert Pro..."

# Check if we're in a Replit environment
if [ -z "$REPLIT" ]; then
  echo "⚠️  This setup script is designed for Replit environments"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if DATABASE_URL exists
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not found!"
  echo "📋 Please set up PostgreSQL database in Replit:"
  echo "   1. Open Database tab in Replit"
  echo "   2. Click 'Create Database'"
  echo "   3. Your DATABASE_URL will be automatically set"
  exit 1
fi

# Run database migrations
echo "🗃️  Running database migrations..."
npm run db:push

# Create sample data (optional)
echo "🌱 Do you want to create sample data? (y/n)"
read -r create_sample
if [ "$create_sample" = "y" ]; then
  echo "Creating sample data..."
  node -e "
    import('./server/db-init.js').then(module => {
      return module.createSampleData();
    }).then(() => {
      console.log('✅ Sample data created successfully');
      process.exit(0);
    }).catch(err => {
      console.error('❌ Failed to create sample data:', err);
      process.exit(1);
    });
  "
fi

echo "✅ Setup complete!"
echo "🎯 Run 'npm run dev' to start the application"
