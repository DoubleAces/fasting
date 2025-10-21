'use client';

import { useState } from 'react';

export default function FAQClient() {
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
          question: 'What information is tracked for each fast?',
          answer: 'For each fasting period, we track the start date and time, end date and time, and the total duration. You can also add optional notes to record how you felt, what you learned, or any other observations.',
        },
      ],
    },
    {
      category: 'Account & Security',
      questions: [
        {
          question: 'Is my data secure?',
          answer: 'Yes! We take your privacy and security seriously. All data is encrypted in transit using HTTPS, and sensitive information like passwords is securely hashed. We never share your personal information with third parties.',
        },
        {
          question: 'Can I use Google to sign in?',
          answer: 'Yes! We support Google OAuth authentication, which allows you to sign in quickly and securely using your Google account. This eliminates the need to remember another password while maintaining security.',
        },
        {
          question: 'How do I reset my password?',
          answer: 'If you\'ve forgotten your password, click the "Forgot Password?" link on the login page. Enter your email address, and we\'ll send you a secure link to reset your password. The link expires after 24 hours for security.',
        },
      ],
    },
    {
      category: 'Health & Safety',
      questions: [
        {
          question: 'Is intermittent fasting safe?',
          answer: 'Intermittent fasting is generally safe for most healthy adults. However, it\'s not suitable for everyone, including pregnant or breastfeeding women, children, people with certain medical conditions, or those with a history of eating disorders. Always consult with your healthcare provider before starting any new diet or fasting regimen.',
        },
        {
          question: 'What are the benefits of intermittent fasting?',
          answer: 'Research suggests potential benefits including weight loss, improved metabolic health, better blood sugar control, reduced inflammation, and enhanced brain function. However, individual results may vary, and fasting should be combined with a healthy diet and lifestyle.',
        },
      ],
    },
    {
      category: 'Technical Support',
      questions: [
        {
          question: 'Which browsers are supported?',
          answer: 'Our app works best on modern browsers including Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated to the latest version for the best experience and security.',
        },
        {
          question: 'Can I access my data on multiple devices?',
          answer: 'Yes! Your fasting data is stored securely in the cloud and syncs across all your devices. Just log in with the same account on any device to access your complete fasting history.',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h1>
          <p className="text-xl text-gray-600">
            Everything you need to know about our fasting tracker
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {faqs.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-white rounded-2xl p-8 shadow-soft">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {section.category}
              </h2>
              <div className="space-y-4">
                {section.questions.map((faq, questionIndex) => {
                  const globalIndex = `${sectionIndex}-${questionIndex}`;
                  const isOpen = openIndex === globalIndex;
                  
                  return (
                    <div
                      key={questionIndex}
                      className="border-b border-gray-200 last:border-0 pb-4 last:pb-0"
                    >
                      <button
                        onClick={() => toggleFAQ(globalIndex)}
                        className="w-full text-left flex items-center justify-between py-4 text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors duration-200"
                      >
                        <span>{faq.question}</span>
                        <svg
                          className={`w-5 h-5 text-primary-500 transform transition-transform duration-200 flex-shrink-0 ml-4 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {isOpen && (
                        <div className="pb-4 pr-12">
                          <p className="text-gray-600 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center bg-white rounded-2xl p-8 shadow-soft">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-6">
            Ready to start your fasting journey? Sign up now and join thousands of users achieving their health goals.
          </p>
          <a
            href="/register"
            className="inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-primary-500 to-accent-600 rounded-2xl shadow-soft-lg hover:shadow-soft-xl hover:scale-105 transition-all duration-300"
          >
            Get Started Free
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
