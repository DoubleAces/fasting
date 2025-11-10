/**
 * CSV Validator
 * 
 * Validates CSV files for translation import
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_ROWS = 500;
const VALID_LANGUAGES = ['en', 'es', 'fr', 'de', 'ar'];
const REQUIRED_COLUMNS = ['achievementId', 'language', 'name', 'description'];

const csvValidator = {
  /**
   * Validate CSV file before import
   * 
   * @param {string|Buffer} fileContent - File content
   * @param {number} [fileSize] - File size in bytes
   * @returns {Object} Validation result with success flag and errors
   */
  validate(fileContent, fileSize) {
    const errors = [];

    // Validate file size
    if (fileSize && fileSize > MAX_FILE_SIZE) {
      errors.push(`File size ${(fileSize / 1024 / 1024).toFixed(2)}MB exceeds maximum of 5MB`);
    }

    // Convert to string if buffer
    const content = fileContent instanceof Buffer 
      ? fileContent.toString('utf-8') 
      : fileContent;

    if (!content || content.trim().length === 0) {
      errors.push('File is empty');
      return { success: false, errors };
    }

    // Parse lines
    const lines = content.split('\n').filter(line => line.trim());

    if (lines.length === 0) {
      errors.push('File contains no data');
      return { success: false, errors };
    }

    // Validate row count (excluding header)
    const dataRows = lines.length - 1;
    if (dataRows > MAX_ROWS) {
      errors.push(`File contains ${dataRows} rows, exceeding maximum of ${MAX_ROWS}`);
    }

    // Parse and validate headers
    const headerLine = lines[0];
    const headers = this._parseCsvLine(headerLine);

    // Check required columns
    const missingColumns = REQUIRED_COLUMNS.filter(col => 
      !headers.some(h => h.toLowerCase() === col.toLowerCase())
    );

    if (missingColumns.length > 0) {
      errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    // Validate at least one data row
    if (dataRows === 0) {
      errors.push('File must contain at least one data row');
    }

    // Sample validate a few rows for basic format
    const sampleSize = Math.min(5, dataRows);
    for (let i = 1; i <= sampleSize; i++) {
      const values = this._parseCsvLine(lines[i]);
      if (values.length !== headers.length) {
        errors.push(`Row ${i + 1}: Column count mismatch (expected ${headers.length}, got ${values.length})`);
      }
    }

    return {
      success: errors.length === 0,
      errors,
      stats: {
        totalRows: dataRows,
        fileSize: fileSize || content.length,
        columns: headers
      }
    };
  },

  /**
   * Validate a single translation row
   * 
   * @param {Object} row - Row data
   * @param {number} rowNumber - Row number for error reporting
   * @returns {Object} Validation result
   */
  validateRow(row, rowNumber) {
    const errors = [];

    // Validate achievementId
    if (!row.achievementId || row.achievementId.trim().length === 0) {
      errors.push('achievementId is required');
    } else if (!/^[a-z0-9-]+$/.test(row.achievementId)) {
      errors.push('achievementId must contain only lowercase letters, numbers, and hyphens');
    }

    // Validate language
    if (!row.language || row.language.trim().length === 0) {
      errors.push('language is required');
    } else if (!VALID_LANGUAGES.includes(row.language.toLowerCase())) {
      errors.push(`Invalid language code: ${row.language}. Must be one of: ${VALID_LANGUAGES.join(', ')}`);
    }

    // Validate name
    if (!row.name || row.name.trim().length === 0) {
      errors.push('name is required');
    } else if (row.name.length > 100) {
      errors.push('name must be 100 characters or less');
    }

    // Validate description (optional but has max length)
    if (row.description && row.description.length > 500) {
      errors.push('description must be 500 characters or less');
    }

    // Validate iconUrl (optional but has max length)
    if (row.iconUrl && row.iconUrl.length > 200) {
      errors.push('iconUrl must be 200 characters or less');
    }

    return {
      valid: errors.length === 0,
      errors: errors.map(error => ({ row: rowNumber, error }))
    };
  },

  /**
   * Parse a CSV line handling quoted values
   * 
   * @param {string} line - CSV line
   * @returns {Array<string>} Array of values
   * @private
   */
  _parseCsvLine(line) {
    const values = [];
    let currentValue = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          // Escaped quote
          currentValue += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote mode
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        // End of value
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }

    // Add last value
    values.push(currentValue.trim());

    return values;
  }
};

export default csvValidator;
