'use client';

import { useRouter } from 'next/navigation';
import EntryForm from '@/components/organisms/EntryForm';

/**
 * Client-side wrapper for EntryForm
 * Handles form submission and navigation
 */
export default function EntryFormWrapper({ entry, settings, entryId }) {
  const router = useRouter();

  const handleSuccess = () => {
    // Navigate back to entry details after successful update
    router.push(`/entries/${entryId}?message=Entry updated successfully`);
    router.refresh();
  };

  const handleCancel = () => {
    // Navigate back to entry details
    router.push(`/entries/${entryId}`);
  };

  return (
    <EntryForm
      entry={entry}
      settings={settings}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}
