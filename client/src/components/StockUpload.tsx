import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle } from "lucide-react";

export default function StockUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleFileSelect = (file: File) => {
    console.log('File selected:', file.name);
    setUploadedFile(file);
    
    // Simulate processing
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      console.log('File processing completed');
    }, 2000);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <Card data-testid="card-stock-upload">
      <CardHeader>
        <CardTitle>Upload Stock Report</CardTitle>
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
              <div className="h-12 w-12 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-lg font-medium">Processing your stock report...</p>
            </div>
          ) : uploadedFile ? (
            <div className="space-y-4">
              <CheckCircle className="h-12 w-12 mx-auto text-chart-1" />
              <div>
                <p className="text-lg font-medium text-chart-1">File uploaded successfully!</p>
                <p className="text-sm text-muted-foreground">{uploadedFile.name}</p>
              </div>
              <Button 
                onClick={() => setUploadedFile(null)}
                variant="outline"
                data-testid="button-upload-another"
              >
                Upload Another File
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">Drop your stock report here</p>
                <p className="text-sm text-muted-foreground">
                  Supports CSV, Excel, and other common formats
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <Button asChild data-testid="button-browse-files">
                  <label>
                    Browse Files
                    <input
                      type="file"
                      className="hidden"
                      accept=".csv,.xlsx,.xls"
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

        {uploadedFile && !isProcessing && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Processing Summary</h4>
            <div className="text-sm space-y-1">
              <p>• 156 products found</p>
              <p>• 12 low stock alerts generated</p>
              <p>• 3 out of stock notifications sent</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}