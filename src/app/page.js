'use client';

import { useState, useEffect } from 'react';
import EntryList from '@/components/organisms/EntryList';
import EntryForm from '@/components/organisms/EntryForm';
import Button from '@/components/atoms/Button';

/**
 * HomePage - Main Dashboard
 * 
 * Displays recent fasting entries and provides ability to add/edit/delete entries.
 * Fetches the 5 most recent entries on mount.
 */
export default function Home() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  // Fetch entries on mount
  useEffect(() => {
    fetchEntries();
  }, []);

  // Fetch recent entries
  const fetchEntries = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/entries?limit=5');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load entries');
      }

      setEntries(data.entries || []);
    } catch (err) {
      setError(err.message || 'Failed to load entries');
    } finally {
      setLoading(false);
    }
  };

  // Handle add entry button
  const handleAddEntry = () => {
    setEditingEntry(null);
    setShowForm(true);
  };

  // Handle edit entry
  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  // Handle delete entry
  const handleDeleteEntry = async (entryId) => {
    try {
      const response = await fetch(`/api/entries/${entryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete entry');
      }

      // Refresh list
      await fetchEntries();
    } catch (err) {
      setError(err.message || 'Failed to delete entry');
    }
  };

  // Handle form success
  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingEntry(null);
    // Refresh list
    await fetchEntries();
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingEntry(null);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Fasting Tracker
          </h1>
          <p className="text-lg text-gray-600">
            Track your intermittent fasting journey
          </p>
        </div>

        {/* Add Entry Button */}
        {!showForm && (
          <div className="mb-6">
            <Button
              variant="primary"
              onClick={handleAddEntry}
            >
              Add Entry
            </Button>
          </div>
        )}

        {/* Entry Form */}
        {showForm && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {editingEntry ? 'Edit Entry' : 'Add New Entry'}
            </h2>
            <EntryForm
              entry={editingEntry}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        )}

        {/* Recent Entries Section */}
        {!showForm && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Recent Entries
            </h2>
            <EntryList
              entries={entries}
              loading={loading}
              error={error}
              onEdit={handleEditEntry}
              onDelete={handleDeleteEntry}
            />
          </div>
        )}
      </div>
    </main>
  );
}

