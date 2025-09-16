interface StockData {
  sku: string;
  currentStock: number;
}

interface ParseResult {
  success: boolean;
  data: StockData[];
  errors: string[];
  totalRows: number;
  validRows: number;
}

export function parseStockReport(csvContent: string): ParseResult {
  const result: ParseResult = {
    success: false,
    data: [],
    errors: [],
    totalRows: 0,
    validRows: 0,
  };

  try {
    const lines = csvContent.trim().split('\n');

    if (lines.length === 0) {
      result.errors.push("CSV file is empty");
      return result;
    }

    result.totalRows = lines.length - 1; // Exclude header row

    // Parse header to find column indices
    const header = lines[0].toLowerCase().split(',').map(col => col.trim());
    const skuIndex = header.findIndex(col =>
      col.includes('sku') || col.includes('product_code') || col.includes('code')
    );
    const stockIndex = header.findIndex(col =>
      col.includes('stock') || col.includes('quantity') || col.includes('qty')
    );

    if (skuIndex === -1) {
      result.errors.push("No SKU column found. Expected column names: 'sku', 'product_code', or 'code'");
      return result;
    }

    if (stockIndex === -1) {
      result.errors.push("No stock column found. Expected column names: 'stock', 'quantity', or 'qty'");
      return result;
    }

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      const columns = line.split(',').map(col => col.trim());

      if (columns.length <= Math.max(skuIndex, stockIndex)) {
        result.errors.push(`Row ${i + 1}: Insufficient columns`);
        continue;
      }

      const sku = columns[skuIndex]?.replace(/['"]/g, ''); // Remove quotes
      const stockStr = columns[stockIndex]?.replace(/['"]/g, '');

      if (!sku) {
        result.errors.push(`Row ${i + 1}: Empty SKU`);
        continue;
      }

      const currentStock = parseInt(stockStr, 10);
      if (isNaN(currentStock) || currentStock < 0) {
        result.errors.push(`Row ${i + 1}: Invalid stock value '${stockStr}'`);
        continue;
      }

      result.data.push({
        sku: sku.toUpperCase(), // Normalize SKU to uppercase
        currentStock,
      });
      result.validRows++;
    }

    result.success = result.validRows > 0;
    if (!result.success && result.errors.length === 0) {
      result.errors.push("No valid data rows found");
    }

  } catch (error) {
    result.errors.push(`Parse error: ${error instanceof Error ? error.message : String(error)}`);
  }

  return result;
}

export function validateStockReportFormat(csvContent: string): { valid: boolean; message: string } {
  try {
    const lines = csvContent.trim().split('\n');

    if (lines.length === 0) {
      return { valid: false, message: "File is empty" };
    }

    if (lines.length === 1) {
      return { valid: false, message: "File contains only headers, no data rows" };
    }

    const header = lines[0].toLowerCase().split(',').map(col => col.trim());
    const hasSku = header.some(col =>
      col.includes('sku') || col.includes('product_code') || col.includes('code')
    );
    const hasStock = header.some(col =>
      col.includes('stock') || col.includes('quantity') || col.includes('qty')
    );

    if (!hasSku) {
      return {
        valid: false,
        message: "Missing SKU column. Please include a column named 'sku', 'product_code', or 'code'"
      };
    }

    if (!hasStock) {
      return {
        valid: false,
        message: "Missing stock column. Please include a column named 'stock', 'quantity', or 'qty'"
      };
    }

    return { valid: true, message: "Format is valid" };
  } catch (error) {
    return {
      valid: false,
      message: `Format validation error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}