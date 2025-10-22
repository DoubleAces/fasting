/**
 * EmptyDashboard Component
 * 
 * Welcome screen for admin dashboard with "Coming Soon" placeholder cards.
 */

export default function EmptyDashboard() {
  const placeholderFeatures = [
    {
      title: 'User Management',
      description: 'View and manage user accounts',
      icon: '👥',
    },
    {
      title: 'Content Management',
      description: 'Edit FAQs, pages, and content',
      icon: '📝',
    },
    {
      title: 'Analytics',
      description: 'View usage statistics and insights',
      icon: '📊',
    },
    {
      title: 'Settings',
      description: 'Configure application settings',
      icon: '⚙️',
    },
    {
      title: 'Notifications',
      description: 'Manage system notifications',
      icon: '🔔',
    },
    {
      title: 'Security',
      description: 'Monitor security and access logs',
      icon: '🔒',
    },
  ];

  return (
    <div className="max-w-6xl">
      {/* Welcome Message */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Admin features will be added soon. This is the foundation for your administrative control panel.
        </p>
      </div>

      {/* Coming Soon Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {placeholderFeatures.map((feature) => (
          <div
            key={feature.title}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            {/* Icon */}
            <div className="text-4xl mb-4">{feature.icon}</div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {feature.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4">{feature.description}</p>

            {/* Coming Soon Badge */}
            <span className="inline-block px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full">
              Coming Soon
            </span>
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-lg font-semibold text-blue-900 mb-2">
          🚀 Admin Area Ready
        </h4>
        <p className="text-blue-800">
          The admin area structure is in place and ready for feature development. 
          Each card above represents a planned feature that can be added incrementally.
        </p>
      </div>
    </div>
  );
}
