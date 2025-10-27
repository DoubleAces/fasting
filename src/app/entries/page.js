/**
 * Entries Page - Fasting Tracker Dashboard
 * 
 * Main dashboard for logged-in users to view and manage their fasting entries.
 * This is the default landing page after successful authentication.
 */

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import EntryList from '@/components/organisms/EntryList';
import EntryForm from '@/components/organisms/EntryForm';
import Button from '@/components/atoms/Button';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import FastingTimerCard from '@/components/organisms/FastingTimerCard';
import { getActiveFast } from '@/lib/utils/fastingTimerUtils';

export default function EntriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [settings, setSettings] = useState(null);
  
  // Modal state for delete confirmation
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    entryId: null,
    extendedFastInfo: null,
    isDeleting: false
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch entries and settings when authenticated
  useEffect(() => {
    if (session?.user) {
      fetchEntries();
      fetchSettings();
    }
  }, [session]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/entries');
      
      if (!response.ok) {
        throw new Error('Failed to fetch entries');
      }
      
      const data = await response.json();
      setEntries(data.entries || []);
    } catch (err) {
      console.error('Error fetching entries:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  // Detect active or completed fast from any entry
  const activeFast = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return getActiveFast(entries, today);
  }, [entries]);

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleDelete = async (entryId) => {
    try {
      // First, check if deletion would create an extended fast
      const checkResponse = await fetch(`/api/entries/${entryId}?checkOnly=true`, {
        method: 'DELETE',
      });

      if (!checkResponse.ok) {
        throw new Error('Failed to check entry');
      }

      const checkData = await checkResponse.json();
      
      // Open modal with extended fast info (if any)
      setDeleteModal({
        isOpen: true,
        entryId,
        extendedFastInfo: checkData.extendedFastCreated ? checkData.extendedFastInfo : null,
        isDeleting: false
      });
    } catch (err) {
      console.error('Error checking entry:', err);
      alert('Failed to check entry. Please try again.');
    }
  };

  const handleConfirmDelete = async ({ createExtendedFast }) => {
    const { entryId } = deleteModal;
    
    // Update modal to show loading state
    setDeleteModal(prev => ({ ...prev, isDeleting: true }));

    try {
      // Build URL with query parameter if user made a choice about extended fast
      let url = `/api/entries/${entryId}`;
      if (createExtendedFast !== null) {
        url += `?createExtendedFast=${createExtendedFast}`;
      }

      const response = await fetch(url, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete entry');
      }

      // Close modal and refresh entries
      setDeleteModal({
        isOpen: false,
        entryId: null,
        extendedFastInfo: null,
        isDeleting: false
      });

      await fetchEntries();
    } catch (err) {
      console.error('Error deleting entry:', err);
      alert('Failed to delete entry. Please try again.');
      
      // Reset loading state but keep modal open
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleCloseDeleteModal = () => {
    if (!deleteModal.isDeleting) {
      setDeleteModal({
        isOpen: false,
        entryId: null,
        extendedFastInfo: null,
        isDeleting: false
      });
    }
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingEntry(null);
    await fetchEntries();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingEntry(null);
  };

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Don't render until we have a session
  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, <span className="gradient-text">{session.user.name || 'there'}</span>!
          </h1>
          <p className="text-lg text-gray-600">
            Track your fasting journey and monitor your progress.
          </p>
        </div>

        {/* Live Fasting Timer */}
        {activeFast && (
          <FastingTimerCard 
            lastMealTime={activeFast.lastMealTime}
            date={activeFast.date}
            isActive={activeFast.isActive}
          />
        )}

        {/* Create/Edit Entry Form */}
        {showForm ? (
          <div className="bg-white rounded-2xl shadow-soft p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingEntry ? 'Edit Entry' : 'Create New Entry'}
            </h2>
            <EntryForm
              entry={editingEntry}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        ) : (
          <div className="mb-8">
            <Button
              variant="primary"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Entry
            </Button>
          </div>
        )}

        {/* Entries List */}
        <div className="bg-white rounded-2xl shadow-soft p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Fasting Entries</h2>
          <EntryList
            entries={entries}
            settings={settings}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
            error={error}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        extendedFastInfo={deleteModal.extendedFastInfo}
        isDeleting={deleteModal.isDeleting}
      />
    </div>
  );
}
