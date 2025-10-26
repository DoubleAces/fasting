/**
 * Entry Details Page
 * 
 * Server Component that fetches and displays comprehensive details for a single fasting entry.
 * Handles authentication, authorization, and 404 cases.
 * 
 * Performance Optimizations:
 * - Uses cached insights (30-minute TTL)
 * - Optimized aggregation pipeline (1 query vs 5+)
 * - ISR with 5-minute revalidation
 * - Performance logging enabled
 */

import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Entry from '@/lib/models/Entry';
import EntryDetailsView from '@/components/organisms/EntryDetailsView';
import { calculateInsights } from '@/lib/services/entryInsightsService';
import { settingsService } from '@/lib/services/settingsService';
import { performanceLogger } from '@/lib/utils/performanceLogger';
import Link from 'next/link';

// ISR Configuration: Revalidate every 5 minutes (300 seconds)
// This provides near-static performance while keeping data reasonably fresh
export const revalidate = 300;

// Generate static params for recent entries at build time
// This pre-renders the most commonly accessed entries
export async function generateStaticParams() {
  try {
    await connectDB();
    
    // Get the 10 most recent entries across all users
    // In production, you might want to limit this to specific users or criteria
    const recentEntries = await Entry.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('_id')
      .lean();
    
    return recentEntries.map((entry) => ({
      id: entry._id.toString(),
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return []; // Return empty array on error to prevent build failure
  }
}

export default async function EntryDetailsPage({ params }) {
  // Start performance tracking
  const perfLogger = performanceLogger('Page: Entry Details');
  let queryCount = 0;
  let cacheHit = false;
  
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
    queryCount++;
    const entry = await Entry.findById(entryId).lean();

    if (!entry) {
      notFound();
    }

    // Authorization check - ensure user owns this entry
    if (entry.userId.toString() !== userId) {
      redirect('/entries');
    }

    // Fetch user settings (cached with 1-hour TTL)
    queryCount++;
    const settingsStartTime = Date.now();
    const settings = await settingsService.getSettings(userId);
    const settingsTime = Date.now() - settingsStartTime;
    
    // Settings cache hit detection (<10ms = cached)
    const settingsCacheHit = settingsTime < 10;

    // Calculate insights for this entry (cached for 30 minutes)
    let insights = null;
    try {
      const insightsStartTime = Date.now();
      insights = await calculateInsights(entry, userId);
      const insightsTime = Date.now() - insightsStartTime;
      
      // If insights calculation was fast (<50ms), it was likely cached
      cacheHit = insightsTime < 50;
      
      // Count as query only if not cached
      if (!cacheHit) {
        queryCount++;
      }
    } catch (error) {
      console.error('Error calculating insights:', error);
      // Continue without insights - non-critical feature
    }

    // Log performance metrics
    perfLogger.end({
      userId,
      entryId,
      queryCount,
      cacheHit,
      hasInsights: insights !== null,
    });

    // Convert MongoDB documents to plain objects with string IDs
    const serializedEntry = {
      ...entry,
      _id: entry._id.toString(),
      userId: entry.userId.toString(),
      templateSource: entry.templateSource ? entry.templateSource.toString() : null,
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
        <div className="max-w-4xl mx-auto">
          {/* Back navigation */}
          <Link
            href="/entries"
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
            Back to Entries
          </Link>

          {/* Main content */}
          <EntryDetailsView
            entry={serializedEntry}
            settings={serializedSettings}
            insights={insights}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching entry details:', error);
    
    // Handle specific error types
    if (error.name === 'CastError') {
      notFound();
    }
    
    // Generic error - could be DB connection, etc.
    throw error;
  }
}

// Metadata for SEO
export async function generateMetadata({ params }) {
  return {
    title: 'Entry Details - Fasting Tracker',
    description: 'View detailed information about your fasting entry',
  };
}
