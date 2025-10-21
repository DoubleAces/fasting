/**
 * Seed FAQ Data Script
 * Run with: node scripts/seed-faq.js
 * 
 * Seeds the database with initial FAQ questions organized by category
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Import model (we'll need to connect first)
const FAQItemSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    keywords: {
      type: [String],
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

FAQItemSchema.index({ question: 'text', answer: 'text', keywords: 'text' });
FAQItemSchema.index({ category: 1, order: 1 });

const FAQItem = mongoose.models.FAQItem || mongoose.model('FAQItem', FAQItemSchema);

// FAQ data organized by category
const faqData = [
  // Getting Started
  {
    category: 'Getting Started',
    order: 1,
    question: 'What is intermittent fasting?',
    answer: "Intermittent fasting is an eating pattern that cycles between periods of fasting and eating. It doesn't specify which foods you should eat but rather when you should eat them. Common methods include the 16/8 method (fasting for 16 hours, eating within an 8-hour window) and the 5:2 diet (eating normally for 5 days, restricting calories for 2 days).",
    keywords: ['intermittent fasting', 'what is', 'introduction', 'basics', '16/8', '5:2'],
  },
  {
    category: 'Getting Started',
    order: 2,
    question: 'How do I get started with the Fasting Tracker?',
    answer: 'Getting started is easy! Simply sign up for a free account using your email or Google account. Once logged in, you can immediately start tracking your fasting periods by entering your start and end times. Our app will automatically calculate your fasting duration.',
    keywords: ['get started', 'sign up', 'registration', 'how to use', 'begin'],
  },
  {
    category: 'Getting Started',
    order: 3,
    question: 'Is the Fasting Tracker free to use?',
    answer: 'Yes! Our fasting tracker is completely free to use. All core features including tracking your fasts, viewing your history, and managing your settings are available at no cost.',
    keywords: ['free', 'pricing', 'cost', 'payment'],
  },

  // Using the App
  {
    category: 'Using the App',
    order: 1,
    question: 'How do I log a fasting period?',
    answer: 'Navigate to the "My Entries" page and click "Add Entry". Enter the date, your fasting start time, and end time. You can also add optional notes about how you felt or any observations. The app will automatically calculate your fasting duration.',
    keywords: ['log', 'add entry', 'track', 'record', 'create entry'],
  },
  {
    category: 'Using the App',
    order: 2,
    question: 'Can I edit or delete past entries?',
    answer: "Yes! You can view all your past fasting entries on the \"My Entries\" page. Click on any entry to view details, and you'll have options to edit or delete it. This gives you full control over your fasting history.",
    keywords: ['edit', 'delete', 'modify', 'remove', 'update entry'],
  },
  {
    category: 'Using the App',
    order: 3,
    question: 'What information is tracked for each fast?',
    answer: 'For each fasting period, we track the start date and time, end date and time, and the total duration. You can also add optional notes to record how you felt, what you learned, or any other observations.',
    keywords: ['data', 'information', 'tracked', 'recorded', 'entries'],
  },

  // Account & Security
  {
    category: 'Account & Security',
    order: 1,
    question: 'Is my data secure?',
    answer: 'Yes! We take your privacy and security seriously. All data is encrypted in transit using HTTPS, and sensitive information like passwords is securely hashed. We never share your personal information with third parties.',
    keywords: ['security', 'privacy', 'safe', 'data protection', 'encryption'],
  },
  {
    category: 'Account & Security',
    order: 2,
    question: 'Can I use Google to sign in?',
    answer: 'Yes! We support Google OAuth authentication, which allows you to sign in quickly and securely using your Google account. This eliminates the need to remember another password while maintaining security.',
    keywords: ['google', 'oauth', 'sign in', 'login', 'authentication'],
  },
  {
    category: 'Account & Security',
    order: 3,
    question: 'How do I reset my password?',
    answer: 'If you\'ve forgotten your password, click the "Forgot Password?" link on the login page. Enter your email address, and we\'ll send you a secure link to reset your password. The link expires after 24 hours for security.',
    keywords: ['password', 'reset', 'forgot', 'recovery', 'email'],
  },

  // Health & Safety
  {
    category: 'Health & Safety',
    order: 1,
    question: 'Is intermittent fasting safe?',
    answer: "Intermittent fasting is generally safe for most healthy adults. However, it's not suitable for everyone, including pregnant or breastfeeding women, children, people with certain medical conditions, or those with a history of eating disorders. Always consult with your healthcare provider before starting any new diet or fasting regimen.",
    keywords: ['safe', 'safety', 'health', 'medical', 'doctor', 'risks'],
  },
  {
    category: 'Health & Safety',
    order: 2,
    question: 'What are the benefits of intermittent fasting?',
    answer: 'Research suggests potential benefits including weight loss, improved metabolic health, better blood sugar control, reduced inflammation, and enhanced brain function. However, individual results may vary, and fasting should be combined with a healthy diet and lifestyle.',
    keywords: ['benefits', 'advantages', 'health benefits', 'weight loss', 'metabolism'],
  },

  // Technical Support
  {
    category: 'Technical Support',
    order: 1,
    question: 'Which browsers are supported?',
    answer: 'Our app works best on modern browsers including Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated to the latest version for the best experience and security.',
    keywords: ['browsers', 'compatibility', 'chrome', 'firefox', 'safari', 'edge'],
  },
  {
    category: 'Technical Support',
    order: 2,
    question: 'Can I access my data on multiple devices?',
    answer: 'Yes! Your fasting data is stored securely in the cloud and syncs across all your devices. Just log in with the same account on any device to access your complete fasting history.',
    keywords: ['devices', 'sync', 'multiple devices', 'cloud', 'mobile', 'desktop'],
  },
];

async function seedFAQ() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env.local');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing FAQ data
    console.log('🗑️  Clearing existing FAQ data...');
    await FAQItem.deleteMany({});
    console.log('✅ Cleared existing data');

    // Insert new FAQ data
    console.log('📝 Seeding FAQ data...');
    const result = await FAQItem.insertMany(faqData);
    console.log(`✅ Successfully seeded ${result.length} FAQ items`);

    // Display summary by category
    const categories = [...new Set(faqData.map((item) => item.category))];
    console.log('\n📊 Summary by Category:');
    for (const category of categories) {
      const count = faqData.filter((item) => item.category === category).length;
      console.log(`   ${category}: ${count} questions`);
    }

    console.log('\n🎉 FAQ seeding complete!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding FAQ data:', error);
    process.exit(1);
  }
}

// Run the seed function
seedFAQ();
