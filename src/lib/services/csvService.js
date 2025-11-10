/**
 * CSV Service
 * 
 * Handles export and import of achievement translations
 */

import Achievement from '@/lib/models/Achievement';

const csvService = {
  /**
   * Export achievement translations to CSV format
   * 
   * @returns {Promise<string>} CSV string with all achievements and translations
   */
  async exportTranslations() {
    // Fetch all achievements
    const achievements = await Achievement.find({})
      .sort({ order: 1, 'translations.en.name': 1 })
      .lean();

    // Define CSV headers
    const headers = [
      'achievementId',
      'language',
      'name',
      'description',
      'iconUrl',
      'category',
      'tier',
      'isActive'
    ];

    // Build CSV rows
    const rows = [headers.join(',')];

    // Supported languages
    const languages = ['en', 'es', 'fr', 'de', 'ar'];

    // Add a row for each achievement-language combination
    for (const achievement of achievements) {
      for (const lang of languages) {
        const translation = achievement.translations?.[lang] || {};
        
        // Escape CSV values (handle commas, quotes, newlines)
        const escapeCsvValue = (value) => {
          if (value === undefined || value === null) return '';
          const stringValue = String(value);
          // If contains comma, quote, or newline, wrap in quotes and escape existing quotes
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        };

        const row = [
          escapeCsvValue(achievement.achievementId),
          escapeCsvValue(lang),
          escapeCsvValue(translation.name || ''),
          escapeCsvValue(translation.description || ''),
          escapeCsvValue(translation.iconUrl || ''),
          escapeCsvValue(achievement.category),
          escapeCsvValue(achievement.tier),
          escapeCsvValue(achievement.isActive ? 'true' : 'false')
        ];

        rows.push(row.join(','));
      }
    }

    return rows.join('\n');
  },

  /**
   * Import achievement translations from CSV
   * 
   * @param {string} csvContent - CSV file content
   * @param {string} userId - Admin user ID for audit log
   * @param {string} ipAddress - Request IP
   * @param {string} userAgent - Request user agent
   * @returns {Promise<Object>} Import summary with processed count and errors
   */
  async importTranslations(csvContent, userId, ipAddress, userAgent) {
    const errors = [];
    let processedCount = 0;
    let updatedCount = 0;
    const updatedAchievements = new Set();

    try {
      // Parse CSV
      const lines = csvContent.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        throw new Error('CSV file is empty');
      }

      // Parse headers
      const headerLine = lines[0];
      const headers = this._parseCsvLine(headerLine);
      
      // Validate required columns
      const requiredColumns = ['achievementId', 'language', 'name', 'description'];
      const missingColumns = requiredColumns.filter(col => !headers.includes(col));
      
      if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
      }

      // Get column indices
      const getColumnIndex = (columnName) => headers.indexOf(columnName);
      const achievementIdIdx = getColumnIndex('achievementId');
      const languageIdx = getColumnIndex('language');
      const nameIdx = getColumnIndex('name');
      const descriptionIdx = getColumnIndex('description');
      const iconUrlIdx = getColumnIndex('iconUrl');

      // Process each row (skip header)
      for (let i = 1; i < lines.length; i++) {
        const lineNumber = i + 1;
        const line = lines[i].trim();
        
        if (!line) continue; // Skip empty lines

        try {
          const values = this._parseCsvLine(line);
          
          if (values.length !== headers.length) {
            errors.push({
              row: lineNumber,
              error: `Column count mismatch. Expected ${headers.length}, got ${values.length}`
            });
            continue;
          }

          const achievementId = values[achievementIdIdx]?.trim();
          const language = values[languageIdx]?.trim();
          const name = values[nameIdx]?.trim();
          const description = values[descriptionIdx]?.trim();
          const iconUrl = iconUrlIdx >= 0 ? values[iconUrlIdx]?.trim() : '';

          // Validate
          if (!achievementId) {
            errors.push({ row: lineNumber, error: 'achievementId is required' });
            continue;
          }

          if (!language || !['en', 'es', 'fr', 'de', 'ar'].includes(language)) {
            errors.push({ 
              row: lineNumber, 
              error: `Invalid language code: ${language}. Must be one of: en, es, fr, de, ar` 
            });
            continue;
          }

          if (!name) {
            errors.push({ row: lineNumber, error: 'name is required' });
            continue;
          }

          // Find achievement
          const achievement = await Achievement.findOne({ achievementId });
          
          if (!achievement) {
            errors.push({ 
              row: lineNumber, 
              error: `Achievement not found: ${achievementId}` 
            });
            continue;
          }

          // Update translation
          if (!achievement.translations) {
            achievement.translations = {};
          }
          
          achievement.translations[language] = {
            name,
            description: description || '',
            iconUrl: iconUrl || ''
          };

          await achievement.save();
          
          processedCount++;
          updatedCount++;
          updatedAchievements.add(achievementId);

        } catch (rowError) {
          errors.push({ 
            row: lineNumber, 
            error: rowError.message || 'Unknown error processing row' 
          });
        }
      }

      // Log import action
      if (userId) {
        const auditLogService = require('./auditLogService').default;
        await auditLogService.log({
          userId,
          action: 'csv-import',
          resource: 'achievement',
          changes: {
            summary: {
              totalRows: lines.length - 1,
              processed: processedCount,
              updated: updatedCount,
              errors: errors.length,
              achievementsAffected: updatedAchievements.size
            },
            errors: errors.slice(0, 10) // Log first 10 errors
          },
          ipAddress,
          userAgent
        });
      }

      return {
        success: true,
        totalRows: lines.length - 1,
        processedCount,
        updatedCount,
        errorCount: errors.length,
        errors,
        achievementsAffected: Array.from(updatedAchievements)
      };

    } catch (error) {
      throw new Error(`CSV import failed: ${error.message}`);
    }
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
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }

    // Add last value
    values.push(currentValue);

    return values;
  }
};

export default csvService;
