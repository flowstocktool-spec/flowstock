import * as XLSX from 'xlsx';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { XMLParser } from 'fast-xml-parser';

// Enhanced interface for parsed data
interface UniversalStockData {
  sku: string;
  currentStock: number;
  name?: string;
  price?: number;
  category?: string;
  platform?: string;
  supplier?: string;
  description?: string;
  weight?: number;
  dimensions?: string;
  location?: string;
  lastUpdated?: Date;
}

interface UniversalParseResult {
  success: boolean;
  data: UniversalStockData[];
  errors: string[];
  warnings: string[];
  metadata: {
    totalRows: number;
    validRows: number;
    skippedRows: number;
    detectedPlatform: string;
    detectedColumns: Record<string, string>;
    fileFormat: string;
    encoding: string;
    confidence: number;
    delimiter?: string;
    suggestions: {
      possibleSku: string[];
      possibleStock: string[];
      unmappedColumns: string[];
    };
  };
}

interface ColumnDefinition {
  field: string;
  patterns: string[];
  aliases: string[];
  fuzzyPatterns: RegExp[];
  validators: ((value: any) => boolean)[];
  transformers: ((value: any) => any)[];
}

export class UniversalFileParser {
  private readonly columnDefinitions: ColumnDefinition[] = [
    {
      field: 'sku',
      patterns: [
        'sku', 'SKU', 'product_sku', 'product-sku', 'seller-sku', 'seller_sku',
        'asin', 'ASIN', 'fnsku', 'FNSKU', 'upc', 'UPC', 'barcode', 'item_id',
        'item-id', 'product_id', 'product-id', 'variant_id', 'variant-id',
        'handle', 'listing_id', 'custom_label', 'custom-label', 'model',
        'part_number', 'part-number', 'mpn', 'MPN', 'gtin', 'GTIN',
        'code', 'item_code', 'product_code', 'reference', 'identifier'
      ],
      aliases: ['product code', 'item number', 'catalog number', 'stock code'],
      fuzzyPatterns: [
        /^.*sku.*$/i, /^.*code.*$/i, /^.*id.*$/i, /^.*asin.*$/i,
        /^.*barcode.*$/i, /^.*upc.*$/i, /^.*model.*$/i, /^.*part.*$/i
      ],
      validators: [(value) => typeof value === 'string' && value.trim().length > 0],
      transformers: [(value) => String(value).trim().toUpperCase()]
    },
    {
      field: 'currentStock',
      patterns: [
        'stock', 'Stock', 'quantity', 'Quantity', 'qty', 'Qty', 'QTY',
        'inventory', 'Inventory', 'available', 'Available', 'in_stock',
        'in-stock', 'stock_quantity', 'stock-quantity', 'current_stock',
        'current-stock', 'on_hand', 'on-hand', 'afn-fulfillable-quantity',
        'afn_fulfillable_quantity', 'variant-inventory-qty', 'variant_inventory_qty',
        'available_quantity', 'available-quantity', 'units_available',
        'units-available', 'inventory_level', 'inventory-level', 'count',
        'units', 'pieces', 'total_stock', 'stock_level'
      ],
      aliases: ['stock level', 'inventory count', 'units in stock', 'available units'],
      fuzzyPatterns: [
        /^.*stock.*$/i, /^.*qty.*$/i, /^.*quantity.*$/i, /^.*inventory.*$/i,
        /^.*available.*$/i, /^.*count.*$/i, /^.*units.*$/i
      ],
      validators: [(value) => !isNaN(Number(value)) && Number(value) >= 0],
      transformers: [(value) => Math.floor(Number(String(value).replace(/[^0-9.-]/g, '')))]
    },
    {
      field: 'name',
      patterns: [
        'name', 'Name', 'title', 'Title', 'product_name', 'product-name',
        'product_title', 'product-title', 'item_name', 'item-name',
        'listing_title', 'listing-title', 'description', 'Description',
        'product_description', 'product-description', 'label'
      ],
      aliases: ['product name', 'item name', 'product title'],
      fuzzyPatterns: [
        /^.*name.*$/i, /^.*title.*$/i, /^.*description.*$/i, /^.*label.*$/i
      ],
      validators: [(value) => typeof value === 'string' && value.trim().length > 0],
      transformers: [(value) => String(value).trim()]
    },
    {
      field: 'price',
      patterns: [
        'price', 'Price', 'cost', 'Cost', 'unit_price', 'unit-price',
        'regular_price', 'regular-price', 'sale_price', 'sale-price',
        'variant-price', 'variant_price', 'list_price', 'list-price',
        'amount', 'value', 'retail_price'
      ],
      aliases: ['unit price', 'retail price', 'selling price'],
      fuzzyPatterns: [
        /^.*price.*$/i, /^.*cost.*$/i, /^.*amount.*$/i, /^.*value.*$/i
      ],
      validators: [(value) => !isNaN(Number(value)) && Number(value) >= 0],
      transformers: [(value) => parseFloat(String(value).replace(/[^0-9.-]/g, ''))]
    },
    {
      field: 'category',
      patterns: [
        'category', 'Category', 'product_type', 'product-type',
        'item_type', 'item-type', 'tags', 'Tags', 'department',
        'section', 'group', 'class', 'family'
      ],
      aliases: ['product category', 'item category', 'product type'],
      fuzzyPatterns: [
        /^.*category.*$/i, /^.*type.*$/i, /^.*tags.*$/i, /^.*department.*$/i
      ],
      validators: [(value) => typeof value === 'string' && value.trim().length > 0],
      transformers: [(value) => String(value).trim()]
    }
  ];

  private readonly platformPatterns = {
    amazon: {
      indicators: ['asin', 'fnsku', 'seller-sku', 'afn-fulfillable-quantity', 'amazon'],
      confidence: 0.95
    },
    shopify: {
      indicators: ['handle', 'variant-id', 'variant-inventory-qty', 'variant-price', 'shopify'],
      confidence: 0.95
    },
    ebay: {
      indicators: ['item-id', 'custom-label', 'available-quantity', 'listing-title', 'ebay'],
      confidence: 0.90
    },
    etsy: {
      indicators: ['listing_id', 'quantity', 'etsy'],
      confidence: 0.85
    },
    woocommerce: {
      indicators: ['id', 'stock_quantity', 'regular_price', 'woocommerce', 'wordpress'],
      confidence: 0.90
    },
    magento: {
      indicators: ['entity_id', 'qty', 'magento'],
      confidence: 0.85
    },
    square: {
      indicators: ['square_id', 'item_variation_id', 'square'],
      confidence: 0.85
    },
    bigcommerce: {
      indicators: ['bigcommerce_id', 'inventory_level', 'bigcommerce'],
      confidence: 0.85
    },
    generic: {
      indicators: ['sku', 'stock', 'quantity', 'inventory'],
      confidence: 0.50
    }
  };

  async parseFile(fileBuffer: Buffer, filename: string): Promise<UniversalParseResult> {
    const result: UniversalParseResult = {
      success: false,
      data: [],
      errors: [],
      warnings: [],
      metadata: {
        totalRows: 0,
        validRows: 0,
        skippedRows: 0,
        detectedPlatform: 'unknown',
        detectedColumns: {},
        fileFormat: 'unknown',
        encoding: 'utf-8',
        confidence: 0,
        suggestions: {
          possibleSku: [],
          possibleStock: [],
          unmappedColumns: []
        }
      }
    };

    try {
      // Step 1: Detect file format and encoding
      const fileFormat = this.detectFileFormat(filename);
      const encoding = this.detectEncoding(fileBuffer);
      
      result.metadata.fileFormat = fileFormat;
      result.metadata.encoding = encoding;

      console.log(`🔍 Universal Parser - File: ${filename}`);
      console.log(`📄 Format: ${fileFormat}, Encoding: ${encoding}`);

      // Step 2: Parse raw data based on format
      let rawData: any[] = [];
      
      switch (fileFormat) {
        case 'excel':
          rawData = await this.parseExcelFile(fileBuffer);
          break;
        case 'csv':
        case 'tsv':
        case 'txt':
          rawData = await this.parseDelimitedFile(fileBuffer, fileFormat, encoding);
          break;
        case 'json':
          rawData = await this.parseJsonFile(fileBuffer, encoding);
          break;
        case 'xml':
          rawData = await this.parseXmlFile(fileBuffer, encoding);
          break;
        default:
          // Try to parse as text with intelligent format detection
          rawData = await this.parseAsText(fileBuffer, encoding);
      }

      if (rawData.length === 0) {
        result.errors.push('No data rows found in file');
        return result;
      }

      result.metadata.totalRows = rawData.length;
      console.log(`📊 Extracted ${rawData.length} raw data rows`);

      // Step 3: Intelligent column detection with fuzzy matching
      const headers = this.extractHeaders(rawData);
      const columnMapping = this.detectColumnsWithFuzzyMatching(headers);
      const platformDetection = this.detectPlatform(headers);

      result.metadata.detectedPlatform = platformDetection.platform;
      result.metadata.detectedColumns = columnMapping;
      result.metadata.confidence = platformDetection.confidence;

      // Step 4: Generate suggestions for unmapped columns
      this.generateSuggestions(headers, columnMapping, result.metadata.suggestions);

      console.log(`🎯 Platform: ${platformDetection.platform} (${Math.round(platformDetection.confidence * 100)}%)`);
      console.log(`📋 Mapped columns:`, columnMapping);

      // Step 5: Parse and validate data with intelligent error recovery
      const parsedData: UniversalStockData[] = [];

      for (let i = 0; i < rawData.length; i++) {
        try {
          const rowResult = this.parseDataRowWithRecovery(rawData[i], columnMapping, i + 1);
          
          if (rowResult.success && rowResult.data) {
            parsedData.push(rowResult.data);
            result.metadata.validRows++;
          } else {
            result.metadata.skippedRows++;
            if (rowResult.errors.length > 0) {
              result.warnings.push(...rowResult.errors);
            }
          }
        } catch (error) {
          result.metadata.skippedRows++;
          result.warnings.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      result.data = parsedData;
      result.success = parsedData.length > 0;

      if (!result.success) {
        result.errors.push('No valid data rows could be parsed');
      }

      console.log(`✅ Parsing complete: ${result.metadata.validRows} valid, ${result.metadata.skippedRows} skipped`);

    } catch (error) {
      console.error('❌ Universal parser error:', error);
      result.errors.push(`Parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  private detectFileFormat(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop() || '';
    
    const formatMap: Record<string, string> = {
      'xlsx': 'excel',
      'xls': 'excel',
      'csv': 'csv',
      'tsv': 'tsv',
      'txt': 'txt',
      'json': 'json',
      'xml': 'xml',
      'dat': 'txt',
      'tab': 'tsv'
    };

    return formatMap[ext] || 'unknown';
  }

  private detectEncoding(buffer: Buffer): string {
    // Simple encoding detection
    const sample = buffer.slice(0, 1024).toString();
    
    // Check for BOM
    if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
      return 'utf-8-bom';
    }
    
    // Basic detection - can be enhanced with libraries like chardet
    if (/[\u0100-\uFFFF]/.test(sample)) {
      return 'utf-8';
    }
    
    return 'utf-8';
  }

  private async parseExcelFile(buffer: Buffer): Promise<any[]> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer', cellText: false, cellDates: true });
      
      let allData: any[] = [];
      
      // Try to parse all sheets and find the one with most data
      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
          raw: false,
          dateNF: 'yyyy-mm-dd'
        });

        if (sheetData.length > allData.length) {
          allData = sheetData;
        }
      }

      if (allData.length < 2) {
        throw new Error('Excel file must contain at least a header row and one data row');
      }

      // Convert to object format
      const headers = allData[0] as string[];
      const dataRows = allData.slice(1) as any[][];

      return dataRows.map(row => {
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header || `Column_${index + 1}`] = row[index] || '';
        });
        return obj;
      });
    } catch (error) {
      throw new Error(`Excel parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async parseDelimitedFile(buffer: Buffer, format: string, encoding: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      let content: string;

      try {
        content = buffer.toString('utf8');
        // Remove BOM if present
        content = content.replace(/^\uFEFF/, '');
      } catch (error) {
        return reject(new Error(`Encoding error: ${error instanceof Error ? error.message : 'Unknown encoding error'}`));
      }

      // Auto-detect delimiter
      const delimiter = this.detectDelimiter(content, format);
      // Delimiter will be set in metadata
      
      console.log(`🔍 Detected delimiter: "${delimiter === '\t' ? '\\t' : delimiter}"`);

      const stream = Readable.from([content]);

      stream
        .pipe(csv({ 
          separator: delimiter
        }))
        .on('data', (data) => {
          // Normalize headers to handle case sensitivity
          const normalizedData: any = {};
          for (const [key, value] of Object.entries(data)) {
            const normalizedKey = key.trim();
            normalizedData[normalizedKey] = value;
          }
          
          // Filter out completely empty rows
          if (Object.values(normalizedData).some(value => value && String(value).trim() !== '')) {
            results.push(normalizedData);
          }
        })
        .on('end', () => resolve(results))
        .on('error', (error) => {
          // Try alternative parsing if CSV parser fails
          try {
            const manualParsed = this.manualDelimitedParse(content, delimiter);
            resolve(manualParsed);
          } catch (manualError) {
            reject(new Error(`Delimited file parsing failed: ${error.message}`));
          }
        });
    });
  }

  private async parseJsonFile(buffer: Buffer, encoding: string): Promise<any[]> {
    try {
      const content = buffer.toString('utf8');
      const jsonData = JSON.parse(content);

      if (Array.isArray(jsonData)) {
        return jsonData;
      } else if (typeof jsonData === 'object' && jsonData !== null) {
        // Handle single object
        return [jsonData];
      } else {
        throw new Error('JSON data must be an array or object');
      }
    } catch (error) {
      throw new Error(`JSON parsing failed: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
    }
  }

  private async parseXmlFile(buffer: Buffer, encoding: string): Promise<any[]> {
    try {
      const content = buffer.toString('utf8');
      
      const parser = new XMLParser({
        ignoreAttributes: false,
        removeNSPrefix: true,
        parseTagValue: true,
        trimValues: true,
        parseTrueNumberOnly: true
      });
      
      const result = parser.parse(content);
      
      // Extract array data from common XML structures
      let rows: any[] = [];
      
      // Common XML patterns for tabular data
      const possibleArrayPaths = [
        'root.items.item',
        'root.products.product', 
        'root.data.row',
        'root.records.record',
        'items.item',
        'products.product',
        'data.row',
        'records.record',
        'item',
        'product',
        'row',
        'record'
      ];
      
      for (const path of possibleArrayPaths) {
        const pathParts = path.split('.');
        let current = result;
        
        for (const part of pathParts) {
          if (current && typeof current === 'object' && part in current) {
            current = current[part];
          } else {
            current = null;
            break;
          }
        }
        
        if (current) {
          if (Array.isArray(current)) {
            rows = current;
            break;
          } else if (typeof current === 'object') {
            rows = [current];
            break;
          }
        }
      }
      
      // If no structured data found, try to flatten the entire result
      if (rows.length === 0 && result && typeof result === 'object') {
        const flatData = this.flattenXmlObject(result);
        if (Object.keys(flatData).length > 0) {
          rows = [flatData];
        }
      }

      return rows;
    } catch (error) {
      throw new Error(`XML parsing failed: ${error instanceof Error ? error.message : 'Invalid XML'}`);
    }
  }

  private flattenXmlObject(obj: any, prefix = ''): any {
    const flattened: any = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          Object.assign(flattened, this.flattenXmlObject(value, newKey));
        } else if (Array.isArray(value) && value.length > 0) {
          // Take first item from array for flattening
          if (typeof value[0] === 'object') {
            Object.assign(flattened, this.flattenXmlObject(value[0], newKey));
          } else {
            flattened[newKey] = value[0];
          }
        } else {
          flattened[newKey] = value;
        }
      }
    }
    
    return flattened;
  }

  private async parseAsText(buffer: Buffer, encoding: string): Promise<any[]> {
    const content = buffer.toString('utf8');
    const lines = content.split(/\r?\n/).filter(line => line.trim());

    if (lines.length < 2) {
      throw new Error('Text file must contain at least 2 lines');
    }

    // Try different delimiters
    const delimiters = ['\t', ',', ';', '|', ' '];
    let bestDelimiter = ',';
    let maxColumns = 0;

    for (const delimiter of delimiters) {
      const columnCount = lines[0].split(delimiter).length;
      if (columnCount > maxColumns && columnCount > 1) {
        maxColumns = columnCount;
        bestDelimiter = delimiter;
      }
    }

    return this.manualDelimitedParse(content, bestDelimiter);
  }

  private detectDelimiter(content: string, format: string): string {
    if (format === 'tsv') return '\t';
    
    const firstLines = content.split('\n').slice(0, 3).join('\n');
    const delimiters = [',', ';', '\t', '|'];
    let bestDelimiter = ',';
    let maxScore = 0;

    for (const delimiter of delimiters) {
      const lines = content.split('\n').slice(0, 5);
      const columnCounts = lines.map(line => line.split(delimiter).length);
      
      if (columnCounts.length > 1) {
        const avgColumns = columnCounts.reduce((a, b) => a + b, 0) / columnCounts.length;
        const consistency = 1 - (Math.max(...columnCounts) - Math.min(...columnCounts)) / avgColumns;
        const score = avgColumns * consistency;
        
        if (score > maxScore && avgColumns > 1) {
          maxScore = score;
          bestDelimiter = delimiter;
        }
      }
    }

    return bestDelimiter;
  }

  private manualDelimitedParse(content: string, delimiter: string): any[] {
    const lines = content.split(/\r?\n/).filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
    const results: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(delimiter).map(v => v.trim().replace(/^["']|["']$/g, ''));
      const obj: any = {};
      
      headers.forEach((header, index) => {
        obj[header || `Column_${index + 1}`] = values[index] || '';
      });
      
      results.push(obj);
    }

    return results;
  }

  private extractHeaders(rawData: any[]): string[] {
    if (rawData.length === 0) return [];
    
    const firstRow = rawData[0];
    if (typeof firstRow === 'object' && firstRow !== null) {
      return Object.keys(firstRow);
    }
    
    return [];
  }

  private detectColumnsWithFuzzyMatching(headers: string[]): Record<string, string> {
    const mapping: Record<string, string> = {};
    const usedHeaders = new Set<string>();

    for (const definition of this.columnDefinitions) {
      let bestMatch = '';
      let bestScore = 0;

      for (const header of headers) {
        if (usedHeaders.has(header)) continue;

        const score = this.calculateColumnMatchScore(header, definition);
        if (score > bestScore && score > 0.3) {
          bestScore = score;
          bestMatch = header;
        }
      }

      if (bestMatch) {
        mapping[definition.field] = bestMatch;
        usedHeaders.add(bestMatch);
      }
    }

    return mapping;
  }

  private calculateColumnMatchScore(header: string, definition: ColumnDefinition): number {
    const normalizedHeader = header.toLowerCase().trim();
    let maxScore = 0;

    // Exact matches
    for (const pattern of definition.patterns) {
      if (normalizedHeader === pattern.toLowerCase()) {
        return 1.0;
      }
    }

    // Substring matches
    for (const pattern of definition.patterns) {
      if (normalizedHeader.includes(pattern.toLowerCase()) || pattern.toLowerCase().includes(normalizedHeader)) {
        maxScore = Math.max(maxScore, 0.8);
      }
    }

    // Alias matches
    for (const alias of definition.aliases) {
      if (normalizedHeader.includes(alias.toLowerCase()) || alias.toLowerCase().includes(normalizedHeader)) {
        maxScore = Math.max(maxScore, 0.7);
      }
    }

    // Fuzzy regex matches
    for (const pattern of definition.fuzzyPatterns) {
      if (pattern.test(normalizedHeader)) {
        maxScore = Math.max(maxScore, 0.6);
      }
    }

    // Levenshtein distance for close matches
    for (const pattern of definition.patterns) {
      const distance = this.levenshteinDistance(normalizedHeader, pattern.toLowerCase());
      const similarity = 1 - distance / Math.max(normalizedHeader.length, pattern.length);
      if (similarity > 0.7) {
        maxScore = Math.max(maxScore, similarity * 0.5);
      }
    }

    return maxScore;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i += 1) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j += 1) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  private detectPlatform(headers: string[]): { platform: string; confidence: number } {
    let bestMatch = { platform: 'generic', confidence: 0 };

    for (const [platform, config] of Object.entries(this.platformPatterns)) {
      let matches = 0;
      const normalizedHeaders = headers.map(h => h.toLowerCase());

      for (const indicator of config.indicators) {
        if (normalizedHeaders.some(h => h.includes(indicator.toLowerCase()))) {
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

  private generateSuggestions(headers: string[], mapping: Record<string, string>, suggestions: any): void {
    const mappedHeaders = new Set(Object.values(mapping));
    const unmappedHeaders = headers.filter(h => !mappedHeaders.has(h));

    suggestions.unmappedColumns = unmappedHeaders;

    // Find potential SKU columns
    const skuDefinition = this.columnDefinitions.find(d => d.field === 'sku');
    if (skuDefinition && !mapping.sku) {
      suggestions.possibleSku = unmappedHeaders.filter(h => 
        this.calculateColumnMatchScore(h, skuDefinition) > 0.2
      );
    }

    // Find potential stock columns
    const stockDefinition = this.columnDefinitions.find(d => d.field === 'currentStock');
    if (stockDefinition && !mapping.currentStock) {
      suggestions.possibleStock = unmappedHeaders.filter(h => 
        this.calculateColumnMatchScore(h, stockDefinition) > 0.2
      );
    }
  }

  private parseDataRowWithRecovery(row: any, columnMapping: Record<string, string>, rowNumber: number): {
    success: boolean;
    data?: UniversalStockData;
    errors: string[];
  } {
    const errors: string[] = [];
    const result: any = {};

    for (const definition of this.columnDefinitions) {
      const columnName = columnMapping[definition.field];
      if (!columnName) {
        continue;
      }

      // Case-insensitive lookup for robust matching
      let rawValue = row[columnName];
      if (rawValue === undefined) {
        // Try case-insensitive fallback
        const rowKeys = Object.keys(row);
        const matchedKey = rowKeys.find(key => key.toLowerCase() === columnName.toLowerCase());
        if (matchedKey) {
          rawValue = row[matchedKey];
        }
      }

      if (rawValue === null || rawValue === undefined || rawValue === '') {
        if (definition.field === 'sku' || definition.field === 'currentStock') {
          errors.push(`Row ${rowNumber}: Missing required field '${definition.field}' (column: '${columnName}')`);
          continue;
        } else {
          continue; // Optional field
        }
      }

      try {
        // Apply transformers
        let transformedValue = rawValue;
        for (const transformer of definition.transformers) {
          transformedValue = transformer(transformedValue);
        }

        // Apply validators
        let isValid = true;
        for (const validator of definition.validators) {
          if (!validator(transformedValue)) {
            isValid = false;
            break;
          }
        }

        if (!isValid) {
          errors.push(`Row ${rowNumber}: Invalid value for '${definition.field}': '${rawValue}' (transformed: '${transformedValue}')`);
          continue;
        }

        result[definition.field] = transformedValue;
      } catch (error) {
        errors.push(`Row ${rowNumber}: Error processing '${definition.field}': ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Check if we have minimum required fields
    if (!result.sku || result.currentStock === undefined) {
      return { success: false, errors: errors.length > 0 ? errors : [`Row ${rowNumber}: Could not extract required data (SKU and stock)`] };
    }

    return { success: true, data: result as UniversalStockData, errors };
  }

  // Public method to get column suggestions for manual mapping
  getColumnSuggestions(headers: string[]): Record<string, { score: number; suggestions: string[] }> {
    const suggestions: Record<string, { score: number; suggestions: string[] }> = {};

    for (const definition of this.columnDefinitions) {
      const fieldSuggestions: { header: string; score: number }[] = [];

      for (const header of headers) {
        const score = this.calculateColumnMatchScore(header, definition);
        if (score > 0.1) {
          fieldSuggestions.push({ header, score });
        }
      }

      fieldSuggestions.sort((a, b) => b.score - a.score);
      
      suggestions[definition.field] = {
        score: fieldSuggestions.length > 0 ? fieldSuggestions[0].score : 0,
        suggestions: fieldSuggestions.slice(0, 3).map(s => s.header)
      };
    }

    return suggestions;
  }
}

export const universalParser = new UniversalFileParser();