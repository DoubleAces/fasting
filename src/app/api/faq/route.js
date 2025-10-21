/**
 * FAQ API Route
 * GET /api/faq - Retrieve published FAQs with optional search and category filtering
 */

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import FAQItem from '@/lib/models/FAQItem';

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';

    let faqs;

    // Search by query
    if (query.trim()) {
      faqs = await FAQItem.searchFAQs(query.trim());
      
      // Further filter by category if provided
      if (category) {
        faqs = faqs.filter((faq) => faq.category === category);
      }

      return NextResponse.json({
        success: true,
        count: faqs.length,
        data: faqs,
      });
    }

    // Filter by category only
    if (category) {
      faqs = await FAQItem.getByCategory(category);
      
      return NextResponse.json({
        success: true,
        count: faqs.length,
        data: faqs,
      });
    }

    // Get all FAQs grouped by category
    const groupedFaqs = await FAQItem.getAllGrouped();

    return NextResponse.json({
      success: true,
      count: groupedFaqs.reduce((sum, section) => sum + section.questions.length, 0),
      data: groupedFaqs,
    });
  } catch (error) {
    console.error('FAQ API Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve FAQs',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
