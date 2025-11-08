require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const User = require('../src/lib/models/User').default;
const Entry = require('../src/lib/models/Entry').default;

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Checking all users and their entries...\n');
  
  const users = await User.find({}).select('email name _id').lean();
  
  console.log('Users and entry counts:\n');
  for (const user of users) {
    const count = await Entry.countDocuments({ userId: user._id });
    console.log(`${user.email.padEnd(35)} | ${count} entries`);
  }
  
  process.exit(0);
});
