import Papa from 'papaparse';

export interface ParsedStockData {
  sku: string;
  name?: string;
  currentStock: number;
  [key: string]: any; // Allow additional fields
}

export interface ParseResult {
  success: boolean;
  data: ParsedStockData[];
  errors: string[];
  totalRows: number;
  validRows: number;
}

// Common column mappings for different e-commerce platforms
const COLUMN_MAPPINGS = {
  sku: ['sku', 'SKU', 'product_id', 'Product ID', 'item_id', 'Item ID', 'model', 'Model'],
  name: ['name', 'Name', 'title', 'Title', 'product_name', 'Product Name', 'item_name', 'Item Name'],
  stock: ['stock', 'Stock', 'quantity', 'Quantity', 'available', 'Available', 'inventory', 'Inventory', 'qty', 'Qty', 'stock_quantity', 'Stock Quantity']
};

function findColumnIndex(headers: string[], possibleNames: string[]): number {
  for (const name of possibleNames) {
    const index = headers.findIndex(header => 
      header.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(header.toLowerCase())
    );
    if (index !== -1) return index;
  }
  return -1;
}

function parseStockValue(value: any): number {
  if (typeof value === 'number') return Math.max(0, Math.floor(value));
  if (typeof value === 'string') {
    const parsed = parseInt(value.replace(/[^0-9]/g, ''), 10);
    return isNaN(parsed) ? 0 : Math.max(0, parsed);
  }
  return 0;
}

export function parseStockReport(csvContent: string): ParseResult {
  const result: ParseResult = {
    success: false,
    data: [],
    errors: [],
    totalRows: 0,
    validRows: 0
  };

  try {
    const parseResult = Papa.parse(csvContent, {
      header: false,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
    });

    if (parseResult.errors.length > 0) {
      result.errors = parseResult.errors.map(error => error.message);
    }

    const rows = parseResult.data as string[][];
    if (rows.length < 2) {
      result.errors.push('File must contain at least a header row and one data row');
      return result;
    }

    const headers = rows[0].map(h => (h || '').trim());
    const dataRows = rows.slice(1);
    result.totalRows = dataRows.length;

    // Find column indices
    const skuIndex = findColumnIndex(headers, COLUMN_MAPPINGS.sku);
    const nameIndex = findColumnIndex(headers, COLUMN_MAPPINGS.name);
    const stockIndex = findColumnIndex(headers, COLUMN_MAPPINGS.stock);

    if (skuIndex === -1) {
      result.errors.push('Could not find SKU column. Expected one of: ' + COLUMN_MAPPINGS.sku.join(', '));
      return result;
    }

    if (stockIndex === -1) {
      result.errors.push('Could not find stock/quantity column. Expected one of: ' + COLUMN_MAPPINGS.stock.join(', '));
      return result;
    }

    // Parse data rows
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const sku = (row[skuIndex] || '').trim();
      
      if (!sku) {
        result.errors.push(`Row ${i + 2}: Missing SKU`);
        continue;
      }

      const stockValue = parseStockValue(row[stockIndex]);
      const name = nameIndex !== -1 ? (row[nameIndex] || '').trim() : undefined;

      const parsedRow: ParsedStockData = {
        sku,
        currentStock: stockValue,
      };

      if (name) {
        parsedRow.name = name;
      }

      result.data.push(parsedRow);
      result.validRows++;
    }

    result.success = result.validRows > 0;
    return result;

  } catch (error) {
    result.errors.push(`Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
}