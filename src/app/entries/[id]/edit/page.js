/**
 * Edit Entry Page
 * 
 * Server Component that fetches entry data and renders the edit form.
 * Handles authentication, authorization, and 404 cases.
 */

import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Entry from '@/lib/models/Entry';
import Settings from '@/lib/models/Settings';
import EntryFormWrapper from './EntryFormWrapper';
import Link from 'next/link';

export default async function EditEntryPage({ params }) {
  // Await params (Next.js 15 requirement)
  const { id } = await params;
  
  // Get authenticated session
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/entries');
  }

  const userId = session.user.id;
  const entryId = id;

  // Validate ObjectId format
  if (!/^[0-9a-fA-F]{24}$/.test(entryId)) {
    notFound();
  }

  try {
    // Connect to database
    await connectDB();

    // Fetch entry
    const entry = await Entry.findById(entryId).lean();

    if (!entry) {
      notFound();
    }

    // Authorization check - ensure user owns this entry
    if (entry.userId.toString() !== userId) {
      redirect('/entries');
    }

    // Fetch user settings
    const settings = await Settings.findOne({ userId }).lean();

    // Convert MongoDB documents to plain objects with string IDs
    const serializedEntry = {
      ...entry,
      _id: entry._id.toString(),
      userId: entry.userId.toString(),
      date: entry.date?.toISOString().split('T')[0], // YYYY-MM-DD format
      createdAt: entry.createdAt?.toISOString(),
      updatedAt: entry.updatedAt?.toISOString(),
    };

    const serializedSettings = settings ? {
      timeFormat: settings.timeFormat || '24h',
      measurementSystem: settings.measurementSystem || 'metric',
    } : {
      timeFormat: '24h',
      measurementSystem: 'metric',
    };

    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Back navigation */}
          <Link
            href={`/entries/${entryId}`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Entry Details
          </Link>

          {/* Page title */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Entry
            </h1>
            <p className="text-gray-600 mt-1">
              Update your fasting entry for {new Date(entry.date).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <EntryFormWrapper
              entry={serializedEntry}
              settings={serializedSettings}
              entryId={entryId}
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading entry for edit:', error);
    notFound();
  }
}

export const metadata = {
  title: 'Edit Entry - Fasting Tracker',
  description: 'Edit your fasting entry',
};
