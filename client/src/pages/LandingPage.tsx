
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, AlertTriangle, TrendingUp, Users, ArrowRight, CheckCircle } from "lucide-react";

export default function LandingPage() {
  const [, navigate] = useLocation();

  const features = [
    {
      icon: Package,
      title: "Smart Inventory Tracking",
      description: "Track stock levels across multiple platforms in real-time"
    },
    {
      icon: AlertTriangle,
      title: "Automated Alerts",
      description: "Get notified when stock runs low or goes out of stock"
    },
    {
      icon: TrendingUp,
      title: "Easy CSV Upload",
      description: "Import inventory data from Amazon, Shopify, eBay and more"
    },
    {
      icon: Users,
      title: "Supplier Management",
      description: "Organize and manage your supplier relationships"
    }
  ];

  return (
    <div className="min-h-svh bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">Flowstock</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/login")}
              data-testid="button-sign-in"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate("/register")}
              data-testid="button-try-free"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Try for Free
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Inventory Management Without the
            <span className="text-blue-600"> ERP Complexity</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Small and medium businesses struggle with costly ERPs, complex setups, and steep learning curves. 
            Flowstock delivers cloud-based inventory management with automatic supplier alerts - simple, affordable, and ready to use.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={() => navigate("/register")}
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6"
              data-testid="button-hero-try-free"
            >
              Try for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Everything you need to manage inventory
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Powerful features designed to streamline your inventory management workflow
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <feature.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-50 dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Why choose Flowstock?
            </h2>
            <div className="space-y-4">
              {[
                "No ERP setup required - works instantly in your browser",
                "Zero learning curve with intuitive user-friendly interface",
                "Cloud-based SaaS - access anywhere, no installation needed",
                "Affordable pricing designed for small and medium businesses"
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 text-left">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Start managing your inventory today
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Join businesses who trust Flowstock to keep their inventory organized and profitable.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/register")}
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6"
            data-testid="button-cta-try-free"
          >
            Try for Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Package className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Flowstock</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            © 2025 Flowstock. Smart inventory management made simple.
          </p>
        </div>
      </footer>
    </div>
  );
}
