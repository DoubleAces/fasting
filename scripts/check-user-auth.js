import 'dotenv/config';
import connectDB from '../src/lib/db.js';
import User from '../src/lib/models/User.js';

async function checkUser() {
  try {
    await connectDB();
    
    const email = 'raido.purga@gmail.com';
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ User not found:', email);
    } else {
      console.log('✅ User found:');
      console.log('  Email:', user.email);
      console.log('  Name:', user.name);
      console.log('  Auth Method:', user.authMethod);
      console.log('  Active:', user.isActive);
      console.log('  Has Password:', !!user.password);
      console.log('  Created:', user.createdAt);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUser();
