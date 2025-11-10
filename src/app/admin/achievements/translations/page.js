'use client';

import { useState } from 'react';
import AchievementsLayout from '@/components/admin/achievements/AchievementsLayout';

/**
 * Translations Management Page
 * 
 * Admin page for managing achievement translations
 * Supports CSV export and import
 * 
 * @returns {JSX.Element} Translations page
 */
export default function TranslationsPage() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);

  const handleExport = async () => {
    try {
      setExporting(true);
      setError(null);

      const response = await fetch('/api/admin/achievements/translations/export');

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to export translations');
      }

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') 
        || 'achievement-translations.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err) {
      setError(err.message);
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      setError(null);
      setImportResult(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/achievements/translations/import', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok && response.status !== 207) {
        throw new Error(data.error || 'Failed to import translations');
      }

      setImportResult(data);

    } catch (err) {
      setError(err.message);
    } finally {
      setImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <AchievementsLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Translation Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Export and import achievement translations in CSV format
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="ml-auto flex-shrink-0 inline-flex text-red-400 hover:text-red-500"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Import Result */}
        {importResult && (
          <div className={`border-l-4 rounded-md p-4 ${
            importResult.errorCount === 0 
              ? 'bg-green-50 border-green-400' 
              : 'bg-yellow-50 border-yellow-400'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                <svg 
                  className={`h-5 w-5 ${importResult.errorCount === 0 ? 'text-green-400' : 'text-yellow-400'}`}
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className={`text-sm font-medium ${importResult.errorCount === 0 ? 'text-green-800' : 'text-yellow-800'}`}>
                  {importResult.message}
                </h3>
                <div className="mt-2 text-sm">
                  <ul className={`list-disc pl-5 space-y-1 ${importResult.errorCount === 0 ? 'text-green-700' : 'text-yellow-700'}`}>
                    <li>Total rows: {importResult.totalRows}</li>
                    <li>Processed: {importResult.processedCount}</li>
                    <li>Updated: {importResult.updatedCount}</li>
                    <li>Errors: {importResult.errorCount}</li>
                    <li>Achievements affected: {importResult.achievementsAffected?.length || 0}</li>
                  </ul>
                </div>
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-yellow-800">Errors:</p>
                    <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                      {importResult.errors.slice(0, 10).map((err, idx) => (
                        <li key={idx}>Row {err.row}: {err.error}</li>
                      ))}
                      {importResult.errors.length > 10 && (
                        <li>... and {importResult.errors.length - 10} more errors</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setImportResult(null)}
                className={`ml-auto flex-shrink-0 inline-flex ${
                  importResult.errorCount === 0 ? 'text-green-400 hover:text-green-500' : 'text-yellow-400 hover:text-yellow-500'
                }`}
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Export Section */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Export Translations</h2>
            <p className="mt-1 text-sm text-gray-600">
              Download all achievement translations as a CSV file
            </p>
          </div>
          <div className="px-6 py-5">
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Export Format</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• CSV file with all achievements and translations</li>
                  <li>• Includes all 5 languages: English, Spanish, French, German, Arabic</li>
                  <li>• One row per achievement-language combination</li>
                  <li>• Columns: achievementId, language, name, description, iconUrl, category, tier, isActive</li>
                </ul>
              </div>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exporting ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent mr-2"></span>
                    Exporting...
                  </>
                ) : (
                  <>
                    <svg className="inline-block w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export to CSV
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Import Section */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Import Translations</h2>
            <p className="mt-1 text-sm text-gray-600">
              Upload a CSV file to update achievement translations
            </p>
          </div>
          <div className="px-6 py-5">
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-yellow-800 mb-2">Import Requirements</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Maximum file size: 5MB</li>
                  <li>• Maximum rows: 500</li>
                  <li>• Required columns: achievementId, language, name, description</li>
                  <li>• Valid languages: en, es, fr, de, ar</li>
                  <li>• Existing translations will be overwritten</li>
                </ul>
              </div>
              <div>
                <label className="block">
                  <span className="sr-only">Choose CSV file</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleImport}
                    disabled={importing}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-medium
                      file:bg-purple-50 file:text-purple-700
                      hover:file:bg-purple-100
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </label>
                {importing && (
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-purple-600 border-r-transparent mr-2"></span>
                    Importing translations...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">How to Use</h3>
          <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
            <li>Click "Export to CSV" to download all current translations</li>
            <li>Open the CSV file in Excel, Google Sheets, or a text editor</li>
            <li>Add or modify translations in the name, description, and iconUrl columns</li>
            <li>Save the file (ensure it remains a .csv file)</li>
            <li>Use the file upload above to import your changes</li>
            <li>Review the import summary for any errors</li>
          </ol>
        </div>
      </div>
    </AchievementsLayout>
  );
}
