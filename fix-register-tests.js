const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'tests/components/organisms/RegisterForm.test.js');
let content = fs.readFileSync(filePath, 'utf8');

// Helper function at the top
const helper = `
// Helper function to check terms checkbox
const checkTermsCheckbox = async (user) => {
  const termsCheckbox = screen.getByRole('checkbox', { name: /terms and conditions/i });
  await user.click(termsCheckbox);
};
`;

// Insert helper after the describe statement
content = content.replace(
  /(describe\('RegisterForm Component', \(\) => \{[\s\S]*?afterEach.*?\}\);)/,
  `$1${helper}`
);

// Pattern 1: Add terms checkbox before "create account" button click
// But NOT in tests that already have it or are just checking rendering
const patterns = [
  // Pattern: await user.click(screen.getByRole('button', { name: /create account/i }));
  // Add terms checkbox before if not already there
  {
    find: /(await user\.type\(screen\.getByLabelText\(\/confirm password\/i\), '[^']+'\);)\s*\n(\s+)(await user\.click\(screen\.getByRole\('button', \{ name: \/create account\/i \}\)\);)/g,
    replace: '$1\n$2await checkTermsCheckbox(user);\n$2$3'
  }
];

patterns.forEach(({ find, replace }) => {
  content = content.replace(find, replace);
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Fixed RegisterForm.test.js - added terms checkbox checks');
