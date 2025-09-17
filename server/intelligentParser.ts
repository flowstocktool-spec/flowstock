
import * as XLSX from 'xlsx';
import * as csv from 'csv-parser';
import { Readable } from 'stream';

interface ParsedStockData {
  sku: string;
  currentStock: number;
  name?: string;
  price?: number;
  category?: string;
  platform?: string;
}

interface IntelligentParseResult {
  success: boolean;
  data: ParsedStockData[];
  errors: string[];
  metadata: {
    totalRows: number;
    validRows: number;
    detectedPlatform: string;
    detectedColumns: Record<string, string>;
    fileFormat: string;
    confidence: number;
  };
}

interface ColumnMapping {
  sku: string[];
  stock: string[];
  name: string[];
  price: string[];
  category: string[];
}

export class IntelligentStockParser {
  private platformPatterns = {
    amazon: {
      indicators: ['asin', 'fnsku', 'seller-sku', 'afn-fulfillable-quantity'],
      confidence: 0.9
    },
    shopify: {
      indicators: ['handle', 'variant-id', 'variant-inventory-qty', 'variant-price'],
      confidence: 0.9
    },
    ebay: {
      indicators: ['item-id', 'custom-label', 'available-quantity', 'listing-title'],
      confidence: 0.85
    },
    etsy: {
      indicators: ['listing_id', 'sku', 'quantity', 'title'],
      confidence: 0.8
    },
    woocommerce: {
      indicators: ['id', 'sku', 'stock_quantity', 'name', 'regular_price'],
      confidence: 0.85
    },
    magento: {
      indicators: ['entity_id', 'sku', 'qty', 'name', 'price'],
      confidence: 0.8
    },
    generic: {
      indicators: ['sku', 'stock', 'quantity', 'inventory'],
      confidence: 0.5
    }
  };

  private columnMappings: ColumnMapping = {
    sku: [
      'sku', 'SKU', 'product_sku', 'product-sku', 'seller-sku', 'seller_sku',
      'asin', 'ASIN', 'fnsku', 'FNSKU', 'upc', 'UPC', 'barcode', 'item_id',
      'item-id', 'product_id', 'product-id', 'variant_id', 'variant-id',
      'handle', 'listing_id', 'custom_label', 'custom-label', 'model',
      'part_number', 'part-number', 'mpn', 'MPN', 'gtin', 'GTIN'
    ],
    stock: [
      'stock', 'Stock', 'quantity', 'Quantity', 'qty', 'Qty', 'QTY',
      'inventory', 'Inventory', 'available', 'Available', 'in_stock',
      'in-stock', 'stock_quantity', 'stock-quantity', 'current_stock',
      'current-stock', 'on_hand', 'on-hand', 'afn-fulfillable-quantity',
      'afn_fulfillable_quantity', 'variant-inventory-qty', 'variant_inventory_qty',
      'available_quantity', 'available-quantity', 'units_available',
      'units-available', 'inventory_level', 'inventory-level'
    ],
    name: [
      'name', 'Name', 'title', 'Title', 'product_name', 'product-name',
      'product_title', 'product-title', 'item_name', 'item-name',
      'listing_title', 'listing-title', 'description', 'Description',
      'product_description', 'product-description'
    ],
    price: [
      'price', 'Price', 'cost', 'Cost', 'unit_price', 'unit-price',
      'regular_price', 'regular-price', 'sale_price', 'sale-price',
      'variant-price', 'variant_price', 'list_price', 'list-price'
    ],
    category: [
      'category', 'Category', 'product_type', 'product-type',
      'item_type', 'item-type', 'tags', 'Tags'
    ]
  };

  async parseFile(fileBuffer: Buffer, filename: string): Promise<IntelligentParseResult> {
    try {
      const fileFormat = this.detectFileFormat(filename);
      console.log(`🔍 Detected file format: ${fileFormat}`);
      
      let rawData: any[];
      
      switch (fileFormat) {
        case 'excel':
          rawData = await this.parseExcelFile(fileBuffer);
          break;
        case 'csv':
          rawData = await this.parseCsvFile(fileBuffer);
          break;
        default:
          throw new Error(`Unsupported file format: ${fileFormat}`);
      }

      console.log(`📊 Raw data extracted: ${rawData.length} rows`);

      if (rawData.length === 0) {
        return {
          success: false,
          data: [],
          errors: ['No data found in file'],
          metadata: {
            totalRows: 0,
            validRows: 0,
            detectedPlatform: 'unknown',
            detectedColumns: {},
            fileFormat,
            confidence: 0
          }
        };
      }

      // Detect platform and columns
      const headers = Object.keys(rawData[0]).map(h => h.toLowerCase().trim());
      const platformDetection = this.detectPlatform(headers);
      const columnMapping = this.detectColumns(headers);
      
      console.log(`🎯 Detected platform: ${platformDetection.platform} (${platformDetection.confidence})`);
      console.log(`📋 Column mapping:`, columnMapping);

      // Parse and validate data
      const parsedData: ParsedStockData[] = [];
      const errors: string[] = [];

      for (let i = 0; i < rawData.length; i++) {
        try {
          const row = rawData[i];
          const parsedRow = this.parseDataRow(row, columnMapping, platformDetection.platform);
          
          if (parsedRow) {
            parsedData.push(parsedRow);
          } else {
            errors.push(`Row ${i + 2}: Could not extract required data (SKU and stock)`);
          }
        } catch (error) {
          errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return {
        success: parsedData.length > 0,
        data: parsedData,
        errors,
        metadata: {
          totalRows: rawData.length,
          validRows: parsedData.length,
          detectedPlatform: platformDetection.platform,
          detectedColumns: columnMapping,
          fileFormat,
          confidence: platformDetection.confidence
        }
      };

    } catch (error) {
      console.error('❌ Parse error:', error);
      return {
        success: false,
        data: [],
        errors: [error instanceof Error ? error.message : 'Unknown parsing error'],
        metadata: {
          totalRows: 0,
          validRows: 0,
          detectedPlatform: 'unknown',
          detectedColumns: {},
          fileFormat: 'unknown',
          confidence: 0
        }
      };
    }
  }

  private detectFileFormat(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop() || '';
    
    if (['xlsx', 'xls'].includes(ext)) {
      return 'excel';
    } else if (ext === 'csv') {
      return 'csv';
    } else if (['txt', 'tsv'].includes(ext)) {
      return 'csv'; // Treat as CSV with different delimiter
    }
    
    return 'unknown';
  }

  private async parseExcelFile(buffer: Buffer): Promise<any[]> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON with header row
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
        raw: false
      });

      if (jsonData.length < 2) {
        throw new Error('Excel file must contain at least a header row and one data row');
      }

      // Convert array format to object format
      const headers = jsonData[0] as string[];
      const dataRows = jsonData.slice(1) as any[][];
      
      return dataRows.map(row => {
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });
    } catch (error) {
      throw new Error(`Excel parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async parseCsvFile(buffer: Buffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const content = buffer.toString('utf-8');
      
      // Auto-detect delimiter
      const delimiter = this.detectDelimiter(content);
      console.log(`🔍 Detected CSV delimiter: "${delimiter}"`);
      
      const stream = Readable.from([content]);
      
      stream
        .pipe(csv({ 
          separator: delimiter,
          skipEmptyLines: true,
          headers: true
        }))
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(new Error(`CSV parsing failed: ${error.message}`)));
    });
  }

  private detectDelimiter(content: string): string {
    const firstLine = content.split('\n')[0];
    const delimiters = [',', ';', '\t', '|'];
    let maxCount = 0;
    let bestDelimiter = ',';
    
    for (const delimiter of delimiters) {
      const count = (firstLine.match(new RegExp(`\\${delimiter}`, 'g')) || []).length;
      if (count > maxCount) {
        maxCount = count;
        bestDelimiter = delimiter;
      }
    }
    
    return bestDelimiter;
  }

  private detectPlatform(headers: string[]): { platform: string; confidence: number } {
    let bestMatch = { platform: 'generic', confidence: 0 };
    
    for (const [platform, config] of Object.entries(this.platformPatterns)) {
      let matches = 0;
      
      for (const indicator of config.indicators) {
        if (headers.some(h => h.includes(indicator.toLowerCase()))) {
          matches++;
        }
      }
      
      const confidence = (matches / config.indicators.length) * config.confidence;
      
      if (confidence > bestMatch.confidence) {
        bestMatch = { platform, confidence };
      }
    }
    
    return bestMatch;
  }

  private detectColumns(headers: string[]): Record<string, string> {
    const mapping: Record<string, string> = {};
    
    for (const [field, possibleNames] of Object.entries(this.columnMappings)) {
      for (const header of headers) {
        const normalizedHeader = header.toLowerCase().trim();
        
        if (possibleNames.some(name => 
          normalizedHeader === name.toLowerCase() || 
          normalizedHeader.includes(name.toLowerCase()) ||
          name.toLowerCase().includes(normalizedHeader)
        )) {
          mapping[field] = header;
          break;
        }
      }
    }
    
    return mapping;
  }

  private parseDataRow(row: any, columnMapping: Record<string, string>, platform: string): ParsedStockData | null {
    const skuColumn = columnMapping.sku;
    const stockColumn = columnMapping.stock;
    
    if (!skuColumn || !stockColumn) {
      return null;
    }
    
    const sku = this.cleanValue(row[skuColumn]);
    const stockStr = this.cleanValue(row[stockColumn]);
    
    if (!sku) {
      return null;
    }
    
    // Parse stock with intelligent number extraction
    const stock = this.parseNumber(stockStr);
    if (stock === null || stock < 0) {
      return null;
    }
    
    const result: ParsedStockData = {
      sku: sku.toUpperCase(),
      currentStock: stock,
      platform
    };
    
    // Add optional fields if available
    if (columnMapping.name) {
      const name = this.cleanValue(row[columnMapping.name]);
      if (name) result.name = name;
    }
    
    if (columnMapping.price) {
      const price = this.parseNumber(row[columnMapping.price]);
      if (price !== null && price >= 0) result.price = price;
    }
    
    if (columnMapping.category) {
      const category = this.cleanValue(row[columnMapping.category]);
      if (category) result.category = category;
    }
    
    return result;
  }

  private cleanValue(value: any): string {
    if (value === null || value === undefined) return '';
    return String(value).trim().replace(/^["']|["']$/g, '');
  }

  private parseNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    
    const str = String(value).trim();
    
    // Remove common non-numeric characters but keep decimal points
    const cleaned = str.replace(/[^0-9.-]/g, '');
    
    if (!cleaned) return null;
    
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : Math.floor(num); // Floor for stock quantities
  }

  // Method to get suggested column mappings for manual review
  getSuggestedMappings(headers: string[]): Record<string, string[]> {
    const suggestions: Record<string, string[]> = {};
    
    for (const [field, possibleNames] of Object.entries(this.columnMappings)) {
      const matches: string[] = [];
      
      for (const header of headers) {
        const normalizedHeader = header.toLowerCase().trim();
        
        for (const name of possibleNames) {
          if (normalizedHeader.includes(name.toLowerCase()) || 
              name.toLowerCase().includes(normalizedHeader)) {
            matches.push(header);
            break;
          }
        }
      }
      
      if (matches.length > 0) {
        suggestions[field] = matches;
      }
    }
    
    return suggestions;
  }
}

export const intelligentParser = new IntelligentStockParser();
