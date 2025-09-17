
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle, AlertCircle, Brain, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UploadSummary {
  totalRows: number;
  validRows: number;
  updatedProducts: number;
  productsCreated: number;
  productsUpdated: number;
  alertsGenerated: number;
  detectedPlatform: string;
  platformConfidence: number;
  fileFormat: string;
  detectedColumns: Record<string, string>;
  errors: string[];
}

export default function StockUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSummary, setUploadSummary] = useState<UploadSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = async (file: File) => {
    console.log('File selected:', file.name);
    setUploadedFile(file);
    setIsProcessing(true);
    setError(null);
    setUploadSummary(null);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', 'test-user-1'); // This should be dynamic in production
    
    try {
      const response = await fetch('/api/stock-reports/upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setUploadSummary(result.summary);
        console.log('✅ Upload successful:', result.summary);
      } else {
        setError(result.error || 'Upload failed');
        console.error('❌ Upload failed:', result);
      }
    } catch (error) {
      setError('Network error during upload');
      console.error('❌ Upload error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const getPlatformBadgeColor = (confidence: number) => {
    if (confidence >= 80) return 'default';
    if (confidence >= 60) return 'secondary';
    return 'outline';
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setUploadSummary(null);
    setError(null);
  };

  return (
    <Card data-testid="card-stock-upload">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Intelligent Stock Report Upload
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Automatically detects and processes reports from Amazon, Shopify, eBay, Etsy, WooCommerce, and more
        </p>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          data-testid="dropzone-upload"
        >
          {isProcessing ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <Zap className="h-6 w-6 ml-2 text-primary animate-pulse" />
              </div>
              <div>
                <p className="text-lg font-medium">AI is analyzing your stock report...</p>
                <p className="text-sm text-muted-foreground">
                  Detecting platform, format, and extracting data
                </p>
              </div>
            </div>
          ) : uploadSummary ? (
            <div className="space-y-6">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
              <div>
                <p className="text-lg font-medium text-green-600">Analysis Complete!</p>
                <p className="text-sm text-muted-foreground">{uploadedFile?.name}</p>
              </div>
              
              {/* Platform Detection */}
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Platform Detection</h4>
                  <Badge variant={getPlatformBadgeColor(uploadSummary.platformConfidence)}>
                    {uploadSummary.platformConfidence}% confidence
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <strong className="capitalize">{uploadSummary.detectedPlatform}</strong>
                  <span className="text-sm text-muted-foreground">({uploadSummary.fileFormat.toUpperCase()})</span>
                </div>
                
                {/* Column Mappings */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(uploadSummary.detectedColumns).map(([field, column]) => (
                    <div key={field} className="flex justify-between">
                      <span className="capitalize text-muted-foreground">{field}:</span>
                      <span className="font-mono text-xs">{column}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Processing Results */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Rows:</span>
                    <span className="font-medium">{uploadSummary.totalRows}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valid Rows:</span>
                    <span className="font-medium text-green-600">{uploadSummary.validRows}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Updated Products:</span>
                    <span className="font-medium">{uploadSummary.updatedProducts}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Alerts Sent:</span>
                    <span className="font-medium text-orange-600">{uploadSummary.alertsGenerated}</span>
                  </div>
                  {uploadSummary.errors.length > 0 && (
                    <div className="flex justify-between">
                      <span>Errors:</span>
                      <span className="font-medium text-red-600">{uploadSummary.errors.length}</span>
                    </div>
                  )}
                </div>
              </div>

              {uploadSummary.errors.length > 0 && (
                <details className="text-left">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                    View Errors ({uploadSummary.errors.length})
                  </summary>
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-xs">
                    {uploadSummary.errors.slice(0, 5).map((error, idx) => (
                      <p key={idx} className="text-red-700">{error}</p>
                    ))}
                    {uploadSummary.errors.length > 5 && (
                      <p className="text-red-600">... and {uploadSummary.errors.length - 5} more</p>
                    )}
                  </div>
                </details>
              )}
              
              <Button onClick={resetUpload} variant="outline" data-testid="button-upload-another">
                Upload Another File
              </Button>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
              <div>
                <p className="text-lg font-medium text-red-600">Upload Failed</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button onClick={resetUpload} variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">Drop your stock report here</p>
                <p className="text-sm text-muted-foreground">
                  Supports CSV, Excel files from any e-commerce platform
                </p>
              </div>
              
              {/* Supported Platforms */}
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {['Amazon', 'Shopify', 'eBay', 'Etsy', 'WooCommerce', 'Magento'].map(platform => (
                  <Badge key={platform} variant="outline" className="text-xs">
                    {platform}
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-4 justify-center">
                <Button asChild data-testid="button-browse-files">
                  <label>
                    Browse Files
                    <input
                      type="file"
                      className="hidden"
                      accept=".csv,.xlsx,.xls,.txt,.tsv"
                      onChange={handleFileInput}
                    />
                  </label>
                </Button>
                <Button variant="outline" data-testid="button-sample-format">
                  <FileText className="mr-2 h-4 w-4" />
                  Download Sample Format
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Intelligence Features */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Brain className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-medium text-blue-800">Auto Platform Detection</h3>
            <p className="text-xs text-blue-600">Identifies Amazon, Shopify, eBay, and more</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Zap className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <h3 className="font-medium text-green-800">Smart Column Mapping</h3>
            <p className="text-xs text-green-600">Automatically finds SKU, stock, and price columns</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <h3 className="font-medium text-purple-800">Format Flexibility</h3>
            <p className="text-xs text-purple-600">Works with CSV, Excel, TSV, and custom formats</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
