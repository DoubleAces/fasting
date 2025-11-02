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
import EntryNavigationBar from '@/components/molecules/EntryNavigationBar';
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
  // Start performance tracking (Feature 016 + Feature 019 enhancement)
  const perfLogger = performanceLogger('Page: Entry Details');
  const pageStartTime = Date.now();
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
    const dbStartTime = Date.now();
    await connectDB();
    const dbConnectTime = Date.now() - dbStartTime;

    // Fetch entry
    queryCount++;
    const entryQueryStart = Date.now();
    const entry = await Entry.findById(entryId).lean();
    const entryQueryTime = Date.now() - entryQueryStart;

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
    let comparisons = null;
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

    // Calculate comparison statistics (User Story 3)
    try {
      const { calculateComparisons } = await import('@/lib/services/entryInsightsService');
      comparisons = await calculateComparisons(entry, userId);
    } catch (error) {
      console.error('Error calculating comparisons:', error);
      // Continue without comparisons - non-critical feature
    }

    // Calculate navigation data (User Story 4) - Previous/Next entries
    let navigation = null;
    let previousEntryData = null;
    try {
      // Get all user entries sorted by date (descending - newest first)
      const allEntries = await Entry.find({ userId })
        .select('_id date')
        .sort({ date: -1 })
        .lean();

      // Find current entry position
      const currentIndex = allEntries.findIndex(e => e._id.toString() === entryId);
      
      if (currentIndex !== -1) {
        navigation = {
          currentPosition: currentIndex + 1,
          totalEntries: allEntries.length,
          previousEntry: currentIndex < allEntries.length - 1 
            ? { id: allEntries[currentIndex + 1]._id.toString(), date: allEntries[currentIndex + 1].date }
            : null,
          nextEntry: currentIndex > 0
            ? { id: allEntries[currentIndex - 1]._id.toString(), date: allEntries[currentIndex - 1].date }
            : null,
          currentDate: entry.date
        };
        
        // Fetch full previous entry data for share functionality
        // Previous entry is the one BEFORE the current entry (chronologically earlier)
        if (navigation.previousEntry) {
          previousEntryData = await Entry.findById(navigation.previousEntry.id)
            .select('lastMealTime')
            .lean();
        }
      }
    } catch (error) {
      console.error('Error calculating navigation:', error);
      // Continue without navigation - non-critical feature
    }

    // Calculate total server processing time (Feature 019)
    const totalServerTime = Date.now() - pageStartTime;

    // Log performance metrics (enhanced with detailed timing - Feature 019)
    perfLogger.end({
      userId,
      entryId,
      queryCount,
      cacheHit,
      hasInsights: insights !== null,
      // Feature 019: Additional timing metrics
      dbConnectTime,
      entryQueryTime,
      settingsTime,
      settingsCacheHit,
      totalServerTime,
    });

    // Convert MongoDB documents to plain objects with string IDs
    const serializedEntry = {
      ...entry,
      _id: entry._id.toString(),
      userId: entry.userId.toString(),
      templateSource: entry.templateSource ? entry.templateSource.toString() : null,
      createdAt: entry.createdAt?.toISOString(),
      updatedAt: entry.updatedAt?.toISOString(),
      // Include previous entry's last meal time for accurate fast start time in share
      previousEntryLastMealTime: previousEntryData?.lastMealTime || null,
    };

    const serializedSettings = settings ? {
      timeFormat: settings.timeFormat || '24h',
      measurementSystem: settings.measurementSystem || 'metric',
    } : {
      timeFormat: '24h',
      measurementSystem: 'metric',
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Navigation Bar (User Story 4) */}
          {navigation && <EntryNavigationBar navigation={navigation} />}
          
          {/* Back navigation */}
          <Link
            href="/entries"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 transition-colors font-medium"
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
            comparisons={comparisons}
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
