/**
 * FAQ Page
 * 
 * Public page with frequently asked questions about the Fasting Tracker.
 * Accessible to both authenticated and unauthenticated users.
 */

'use client';

import { useState } from 'react';
import styles from './faq.module.css';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          question: 'What is intermittent fasting?',
          answer: 'Intermittent fasting is an eating pattern that cycles between periods of fasting and eating. It doesn\'t specify which foods you should eat but rather when you should eat them. Common methods include the 16/8 method (fasting for 16 hours, eating within an 8-hour window) and the 5:2 diet (eating normally for 5 days, restricting calories for 2 days).',
        },
        {
          question: 'How do I get started with the Fasting Tracker?',
          answer: 'Getting started is easy! Simply sign up for a free account using your email or Google account. Once logged in, you can immediately start tracking your fasting periods by entering your start and end times. Our app will automatically calculate your fasting duration.',
        },
        {
          question: 'Is the Fasting Tracker free to use?',
          answer: 'Yes! Our fasting tracker is completely free to use. All core features including tracking your fasts, viewing your history, and managing your settings are available at no cost.',
        },
      ],
    },
    {
      category: 'Using the App',
      questions: [
        {
          question: 'How do I log a fasting period?',
          answer: 'Navigate to the "My Entries" page and click "Add Entry". Enter the date, your fasting start time, and end time. You can also add optional notes about how you felt or any observations. The app will automatically calculate your fasting duration.',
        },
        {
          question: 'Can I edit or delete past entries?',
          answer: 'Yes! You can view all your past fasting entries on the "My Entries" page. Click on any entry to view details, and you\'ll have options to edit or delete it. This gives you full control over your fasting history.',
        },
        {
          question: 'What information can I track?',
          answer: 'You can track the date of your fast, start time, end time, and add personal notes. The app automatically calculates and displays your fasting duration. You can also customize your settings to use different time formats (12h/24h) and measurement systems.',
        },
        {
          question: 'How is my fasting duration calculated?',
          answer: 'Your fasting duration is automatically calculated based on the start and end times you enter. The app accounts for fasts that span multiple days and displays the total duration in hours and minutes for easy understanding.',
        },
      ],
    },
    {
      category: 'Account & Security',
      questions: [
        {
          question: 'Is my data secure?',
          answer: 'Absolutely! We take your privacy and security seriously. All data is encrypted in transit and at rest. Your password is hashed using industry-standard bcrypt encryption. We never share your personal information with third parties.',
        },
        {
          question: 'Can I sign in with Google?',
          answer: 'Yes! We support Google OAuth for quick and secure sign-in. This means you don\'t need to remember another password, and you can use your existing Google account to access the app safely.',
        },
        {
          question: 'What if I forget my password?',
          answer: 'You can reset your password using the "Forgot Password" link on the login page. We\'ll send you a secure reset link to your email address. If you signed up with Google, you can simply use the "Sign in with Google" button instead.',
        },
        {
          question: 'Can I access my data from multiple devices?',
          answer: 'Yes! Your fasting data is stored securely in the cloud and automatically syncs across all your devices. Simply log in to your account from any device to access your complete fasting history.',
        },
      ],
    },
    {
      category: 'Health & Safety',
      questions: [
        {
          question: 'Is intermittent fasting safe?',
          answer: 'Intermittent fasting can be safe for many people, but it\'s not suitable for everyone. Before starting any fasting regimen, we recommend consulting with your healthcare provider, especially if you have any medical conditions, are pregnant, or are taking medications.',
        },
        {
          question: 'Should I consult a doctor before starting?',
          answer: 'Yes, we always recommend consulting with a healthcare professional before beginning any new diet or fasting program. This is especially important if you have diabetes, blood pressure issues, are pregnant or breastfeeding, or have a history of eating disorders.',
        },
        {
          question: 'Does the app provide medical advice?',
          answer: 'No. Our app is a tracking tool only and does not provide medical advice, diagnosis, or treatment. All health-related decisions should be made in consultation with qualified healthcare professionals.',
        },
      ],
    },
    {
      category: 'Technical Support',
      questions: [
        {
          question: 'Which browsers are supported?',
          answer: 'Our app works best on modern browsers including Google Chrome, Mozilla Firefox, Safari, and Microsoft Edge. We recommend using the latest version of your browser for the best experience.',
        },
        {
          question: 'Is there a mobile app?',
          answer: 'Currently, we offer a responsive web application that works great on mobile browsers. You can access it from any smartphone or tablet by visiting our website. A dedicated mobile app may be available in the future.',
        },
        {
          question: 'I found a bug. How do I report it?',
          answer: 'We appreciate your help in making the app better! Please contact our support team with details about the bug, including what you were doing when it occurred, your browser/device information, and any error messages you saw.',
        },
        {
          question: 'How can I suggest a new feature?',
          answer: 'We love hearing from our users! Send us your feature suggestions through our contact form. We carefully consider all feedback when planning future updates.',
        },
      ],
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Frequently Asked Questions</h1>
        <p className={styles.subtitle}>
          Find answers to common questions about the Fasting Tracker and intermittent fasting.
        </p>
      </div>

      <div className={styles.faqContainer}>
        {faqs.map((category, categoryIndex) => (
          <div key={categoryIndex} className={styles.category}>
            <h2 className={styles.categoryTitle}>{category.category}</h2>
            <div className={styles.questionsContainer}>
              {category.questions.map((faq, questionIndex) => {
                const globalIndex = categoryIndex * 100 + questionIndex;
                const isOpen = openIndex === globalIndex;

                return (
                  <div key={questionIndex} className={styles.faqItem}>
                    <button
                      className={`${styles.question} ${isOpen ? styles.questionOpen : ''}`}
                      onClick={() => toggleFAQ(globalIndex)}
                      aria-expanded={isOpen}
                    >
                      <span>{faq.question}</span>
                      <span className={styles.icon}>{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen && (
                      <div className={styles.answer}>
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.cta}>
        <h2 className={styles.ctaTitle}>Still Have Questions?</h2>
        <p className={styles.ctaText}>
          Can't find the answer you're looking for? We're here to help!
        </p>
        <div className={styles.ctaButtons}>
          <a href="/register" className={styles.primaryButton}>
            Get Started Free
          </a>
          <a href="/features" className={styles.secondaryButton}>
            View Features
          </a>
        </div>
      </div>
    </div>
  );
}
