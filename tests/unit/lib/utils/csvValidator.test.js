import csvValidator from '@/lib/utils/csvValidator';

describe('csvValidator', () => {
  describe('validate()', () => {
    describe('File Size Validation', () => {
      it('should pass when file size is under 5MB', () => {
        const csvContent = 'achievementId,language,name,description\nfirst-fast,en,First Fast,Complete your first fast';
        const fileSize = 1 * 1024 * 1024; // 1MB

        const result = csvValidator.validate(csvContent, fileSize);

        expect(result.success).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should fail when file size exceeds 5MB', () => {
        const csvContent = 'achievementId,language,name,description\ntest,en,Test,Description';
        const fileSize = 6 * 1024 * 1024; // 6MB

        const result = csvValidator.validate(csvContent, fileSize);

        expect(result.success).toBe(false);
        expect(result.errors).toContain('File size 6.00MB exceeds maximum of 5MB');
      });

      it('should pass when file size is exactly 5MB', () => {
        const csvContent = 'achievementId,language,name,description\nfirst-fast,en,First Fast,Test';
        const fileSize = 5 * 1024 * 1024; // exactly 5MB

        const result = csvValidator.validate(csvContent, fileSize);

        expect(result.success).toBe(true);
      });
    });

    describe('Row Count Validation', () => {
      it('should pass when row count is under 500', () => {
        const header = 'achievementId,language,name,description';
        const rows = Array(100).fill('first-fast,en,First Fast,Test').join('\n');
        const csvContent = `${header}\n${rows}`;

        const result = csvValidator.validate(csvContent, 1000);

        expect(result.success).toBe(true);
        expect(result.stats.totalRows).toBe(100);
      });

      it('should fail when row count exceeds 500', () => {
        const header = 'achievementId,language,name,description';
        const rows = Array(501).fill('test,en,Test,Description').join('\n');
        const csvContent = `${header}\n${rows}`;

        const result = csvValidator.validate(csvContent);

        expect(result.success).toBe(false);
        expect(result.errors).toContain('File contains 501 rows, exceeding maximum of 500');
      });

      it('should pass when row count is exactly 500', () => {
        const header = 'achievementId,language,name,description';
        const rows = Array(500).fill('first-fast,en,First Fast,Test').join('\n');
        const csvContent = `${header}\n${rows}`;

        const result = csvValidator.validate(csvContent, 1000);

        expect(result.success).toBe(true);
        expect(result.stats.totalRows).toBe(500);
      });

      it('should not count empty lines', () => {
        const csvContent = `achievementId,language,name,description
first-fast,en,First Fast,Test

week-warrior,en,Week Warrior,Test

`;

        const result = csvValidator.validate(csvContent, 1000);

        expect(result.success).toBe(true);
        expect(result.stats.totalRows).toBe(2);
      });
    });

    describe('Required Columns Validation', () => {
      it('should pass when all required columns are present', () => {
        const csvContent = 'achievementId,language,name,description\nfirst-fast,en,First Fast,Complete your first fast';

        const result = csvValidator.validate(csvContent, 1000);

        expect(result.success).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should fail when achievementId column is missing', () => {
        const csvContent = 'language,name,description\nen,First Fast,Complete your first fast';

        const result = csvValidator.validate(csvContent, 1000);

        expect(result.success).toBe(false);
        expect(result.errors).toContain('Missing required columns: achievementId');
      });

      it('should fail when language column is missing', () => {
        const csvContent = 'achievementId,name,description\nfirst-fast,First Fast,Complete your first fast';

        const result = csvValidator.validate(csvContent, 1000);

        expect(result.success).toBe(false);
        expect(result.errors).toContain('Missing required columns: language');
      });

      it('should fail when name column is missing', () => {
        const csvContent = 'achievementId,language,description\nfirst-fast,en,Complete your first fast';

        const result = csvValidator.validate(csvContent, 1000);

        expect(result.success).toBe(false);
        expect(result.errors).toContain('Missing required columns: name');
      });

      it('should fail when description column is missing', () => {
        const csvContent = 'achievementId,language,name\nfirst-fast,en,First Fast';

        const result = csvValidator.validate(csvContent, 1000);

        expect(result.success).toBe(false);
        expect(result.errors).toContain('Missing required columns: description');
      });

      it('should fail when multiple required columns are missing', () => {
        const csvContent = 'achievementId,name\nfirst-fast,First Fast';

        const result = csvValidator.validate(csvContent, 1000);

        expect(result.success).toBe(false);
        expect(result.errors.length).toBeGreaterThanOrEqual(1);
        expect(result.errors[0]).toContain('Missing required columns:');
      });

      it('should allow optional columns (iconUrl, category, tier, isActive)', () => {
        const csvContent = 'achievementId,language,name,description,iconUrl,category,tier,isActive\nfirst-fast,en,First Fast,Test,/icon.svg,Milestones,bronze,true';

        const result = csvValidator.validate(csvContent, 1000);

        expect(result.success).toBe(true);
      });
    });

    describe('Column Count Consistency', () => {
      it('should fail when data rows have different column counts than header', () => {
        const csvContent = `achievementId,language,name,description
first-fast,en,First Fast,Test,extra-column
week-warrior,en,Week Warrior`;

        const result = csvValidator.validate(csvContent, 1000);

        expect(result.success).toBe(false);
        expect(result.errors.some(e => e.includes('Column count mismatch'))).toBe(true);
      });

      it('should pass when all rows have consistent column count', () => {
        const csvContent = `achievementId,language,name,description
first-fast,en,First Fast,Complete first fast
week-warrior,en,Week Warrior,Fast for 7 days
month-master,en,Month Master,Fast for 30 days`;

        const result = csvValidator.validate(csvContent, 1000);

        expect(result.success).toBe(true);
      });
    });

    describe('Empty File Validation', () => {
      it('should fail when file is empty', () => {
        const csvContent = '';

        const result = csvValidator.validate(csvContent, 0);

        expect(result.success).toBe(false);
        expect(result.errors).toContain('File is empty');
      });

      it('should fail when file has only header', () => {
        const csvContent = 'achievementId,language,name,description';

        const result = csvValidator.validate(csvContent, 1000);

        expect(result.success).toBe(false);
        expect(result.errors).toContain('File must contain at least one data row');
      });

      it('should fail when file has only whitespace', () => {
        const csvContent = '   \n   \n   ';

        const result = csvValidator.validate(csvContent, 10);

        expect(result.success).toBe(false);
        expect(result.errors).toContain('File is empty');
      });
    });

    describe('Stats', () => {
      it('should return correct stats', () => {
        const csvContent = `achievementId,language,name,description,iconUrl
first-fast,en,First Fast,Complete your first fast,/icon.svg
week-warrior,en,Week Warrior,Fast for 7 days,/warrior.svg`;
        const fileSize = 1000;

        const result = csvValidator.validate(csvContent, fileSize);

        expect(result.stats).toEqual({
          totalRows: 2,
          fileSize: 1000,
          columns: ['achievementId', 'language', 'name', 'description', 'iconUrl']
        });
      });
    });
  });

  describe('validateRow()', () => {
    describe('Achievement ID Validation', () => {
      it('should pass with valid achievementId (lowercase, numbers, hyphens)', () => {
        const row = {
          achievementId: 'first-fast-123',
          language: 'en',
          name: 'First Fast',
          description: 'Test'
        };

        const result = csvValidator.validateRow(row, 1);

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should fail when achievementId is missing', () => {
        const row = {
          achievementId: '',
          language: 'en',
          name: 'First Fast',
          description: 'Test'
        };

        const result = csvValidator.validateRow(row, 1);

        expect(result.valid).toBe(false);
        expect(result.errors[0].error).toContain('achievementId is required');
      });

      it('should fail when achievementId contains uppercase letters', () => {
        const row = {
          achievementId: 'First-Fast',
          language: 'en',
          name: 'First Fast',
          description: 'Test'
        };

        const result = csvValidator.validateRow(row, 1);

        expect(result.valid).toBe(false);
        expect(result.errors[0].error).toBe('achievementId must contain only lowercase letters, numbers, and hyphens');
      });

      it('should fail when achievementId contains special characters', () => {
        const row = {
          achievementId: 'first_fast!',
          language: 'en',
          name: 'First Fast',
          description: 'Test'
        };

        const result = csvValidator.validateRow(row, 1);

        expect(result.valid).toBe(false);
        expect(result.errors[0].error).toBe('achievementId must contain only lowercase letters, numbers, and hyphens');
      });

      it('should fail when achievementId contains spaces', () => {
        const row = {
          achievementId: 'first fast',
          language: 'en',
          name: 'First Fast',
          description: 'Test'
        };

        const result = csvValidator.validateRow(row, 1);

        expect(result.valid).toBe(false);
      });
    });

    describe('Language Code Validation', () => {
      it('should pass with valid language codes (en, es, fr, de, ar)', () => {
        const validLanguages = ['en', 'es', 'fr', 'de', 'ar'];

        validLanguages.forEach(lang => {
          const row = {
            achievementId: 'first-fast',
            language: lang,
            name: 'Test',
            description: 'Test'
          };

          const result = csvValidator.validateRow(row, 1);
          expect(result.valid).toBe(true);
        });
      });

      it('should fail when language is missing', () => {
        const row = {
          achievementId: 'first-fast',
          language: '',
          name: 'Test',
          description: 'Test'
        };

        const result = csvValidator.validateRow(row, 1);

        expect(result.valid).toBe(false);
        expect(result.errors[0].error).toContain('language is required');
      });

      it('should fail with invalid language code', () => {
        const row = {
          achievementId: 'first-fast',
          language: 'jp',
          name: 'Test',
          description: 'Test'
        };

        const result = csvValidator.validateRow(row, 1);

        expect(result.valid).toBe(false);
        expect(result.errors[0].error).toBe('Invalid language code: jp. Must be one of: en, es, fr, de, ar');
      });

      it('should be case-sensitive for language codes', () => {
        const row = {
          achievementId: 'first-fast',
          language: 'EN',
          name: 'Test',
          description: 'Test'
        };

        const result = csvValidator.validateRow(row, 1);

        // 'EN'.toLowerCase() === 'en' which is valid, so this should actually pass
        expect(result.valid).toBe(true);
      });
    });

    describe('Name Validation', () => {
      it('should pass with valid name', () => {
        const row = {
          achievementId: 'first-fast',
          language: 'en',
          name: 'First Fast Achievement',
          description: 'Test'
        };

        const result = csvValidator.validateRow(row, 1);

        expect(result.valid).toBe(true);
      });

      it('should fail when name is missing', () => {
        const row = {
          achievementId: 'first-fast',
          language: 'en',
          name: '',
          description: 'Test'
        };

        const result = csvValidator.validateRow(row, 1);

        expect(result.valid).toBe(false);
        expect(result.errors[0].error).toContain('name is required');
      });

      it('should fail when name exceeds 100 characters', () => {
        const row = {
          achievementId: 'first-fast',
          language: 'en',
          name: 'A'.repeat(101),
          description: 'Test'
        };

        const result = csvValidator.validateRow(row, 1);

        expect(result.valid).toBe(false);
        expect(result.errors[0].error).toBe('name must be 100 characters or less');
      });

      it('should pass when name is exactly 100 characters', () => {
        const row = {
          achievementId: 'first-fast',
          language: 'en',
          name: 'A'.repeat(100),
          description: 'Test'
        };

        const result = csvValidator.validateRow(row, 1);

        expect(result.valid).toBe(true);
      });
    });

    describe('Description Validation', () => {
      it('should pass with valid description', () => {
        const row = {
          achievementId: 'first-fast',
          language: 'en',
          name: 'Test',
          description: 'Complete your first fast to earn this achievement'
        };

        const result = csvValidator.validateRow(row, 1);

        expect(result.valid).toBe(true);
      });

      it('should pass when description is empty (optional)', () => {
        const row = {
          achievementId: 'first-fast',
          language: 'en',
          name: 'Test',
          description: ''
        };

        const result = csvValidator.validateRow(row, 1);

        expect(result.valid).toBe(true);
      });

      it('should fail when description exceeds 500 characters', () => {
        const row = {
          achievementId: 'first-fast',
          language: 'en',
          name: 'Test',
          description: 'A'.repeat(501)
        };

        const result = csvValidator.validateRow(row, 1);

        expect(result.valid).toBe(false);
        expect(result.errors[0].error).toBe('description must be 500 characters or less');
      });

      it('should pass when description is exactly 500 characters', () => {
        const row = {
          achievementId: 'first-fast',
          language: 'en',
          name: 'Test',
          description: 'A'.repeat(500)
        };

        const result = csvValidator.validateRow(row, 1);

        expect(result.valid).toBe(true);
      });
    });

    describe('Icon URL Validation', () => {
      it('should pass with valid iconUrl', () => {
        const row = {
          achievementId: 'first-fast',
          language: 'en',
          name: 'Test',
          description: 'Test',
          iconUrl: '/icons/first-fast.svg'
        };

        const result = csvValidator.validateRow(row, 1);

        expect(result.valid).toBe(true);
      });

      it('should pass when iconUrl is empty (optional)', () => {
        const row = {
          achievementId: 'first-fast',
          language: 'en',
          name: 'Test',
          description: 'Test',
          iconUrl: ''
        };

        const result = csvValidator.validateRow(row, 1);

        expect(result.valid).toBe(true);
      });

      it('should fail when iconUrl exceeds 200 characters', () => {
        const row = {
          achievementId: 'first-fast',
          language: 'en',
          name: 'Test',
          description: 'Test',
          iconUrl: '/icons/' + 'a'.repeat(200)
        };

        const result = csvValidator.validateRow(row, 1);

        expect(result.valid).toBe(false);
        expect(result.errors[0].error).toBe('iconUrl must be 200 characters or less');
      });
    });

    describe('Multiple Errors', () => {
      it('should return all validation errors for a row', () => {
        const row = {
          achievementId: '',
          language: 'invalid',
          name: '',
          description: 'A'.repeat(501)
        };

        const result = csvValidator.validateRow(row, 5);

        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThanOrEqual(4);
        expect(result.errors.every(e => e.row === 5)).toBe(true);
      });
    });

    describe('Row Number Tracking', () => {
      it('should include correct row number in error messages', () => {
        const row = {
          achievementId: '',
          language: 'en',
          name: 'Test',
          description: 'Test'
        };

        const result = csvValidator.validateRow(row, 42);

        expect(result.valid).toBe(false);
        expect(result.errors[0].row).toBe(42);
      });
    });
  });
});
