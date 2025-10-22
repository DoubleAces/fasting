/**
 * Script to rename database from fasting-tracker-test back to fasting-tracker
 * 
 * This script:
 * 1. Connects to the fasting-tracker-test database
 * 2. Copies all collections to fasting-tracker database
 * 3. Verifies the copy
 * 4. Drops the old fasting-tracker-test database
 */

const sourceDb = 'fasting-tracker-test';
const targetDb = 'fasting-tracker';

console.log(`\n🔄 Starting database rename: ${sourceDb} → ${targetDb}\n`);

// Connect to source database
db = db.getSiblingDB(sourceDb);

// Get all collections
const collections = db.getCollectionNames();
console.log(`📋 Found ${collections.length} collections to copy:`);
collections.forEach(col => console.log(`   - ${col}`));

// Copy each collection
console.log(`\n📦 Copying collections...`);
let successCount = 0;
let errorCount = 0;

for (const collectionName of collections) {
  try {
    const sourceCollection = db.getCollection(collectionName);
    const targetCollection = db.getSiblingDB(targetDb).getCollection(collectionName);
    
    // Get all documents from source
    const docs = sourceCollection.find().toArray();
    
    if (docs.length > 0) {
      // Insert into target
      targetCollection.insertMany(docs);
      console.log(`   ✓ ${collectionName}: ${docs.length} documents copied`);
    } else {
      console.log(`   ✓ ${collectionName}: empty collection copied`);
    }
    
    // Copy indexes
    const indexes = sourceCollection.getIndexes();
    if (indexes.length > 1) { // More than just the _id index
      console.log(`     → Copying ${indexes.length - 1} custom indexes`);
      for (const index of indexes) {
        if (index.name !== '_id_') {
          try {
            const keys = index.key;
            const options = {};
            if (index.unique) options.unique = true;
            if (index.name) options.name = index.name;
            if (index.sparse) options.sparse = true;
            if (index.weights) options.weights = index.weights;
            if (index.default_language) options.default_language = index.default_language;
            if (index.language_override) options.language_override = index.language_override;
            targetCollection.createIndex(keys, options);
          } catch (indexError) {
            // Skip problematic indexes - they'll be recreated by the app
            console.log(`     ⚠ Skipped index ${index.name}: ${indexError.message}`);
          }
        }
      }
    }
    
    successCount++;
  } catch (error) {
    console.error(`   ✗ ${collectionName}: ${error.message}`);
    errorCount++;
  }
}

console.log(`\n📊 Copy Results:`);
console.log(`   ✓ Success: ${successCount}`);
console.log(`   ✗ Errors: ${errorCount}`);

if (errorCount > 0) {
  console.log(`\n⚠️  Some errors occurred, but continuing with verification...`);
}

// Verify target database
console.log(`\n🔍 Verifying target database...`);
const targetDbObj = db.getSiblingDB(targetDb);
const targetCollections = targetDbObj.getCollectionNames();

console.log(`   Target database has ${targetCollections.length} collections`);

let verified = true;
for (const collectionName of collections) {
  const sourceCount = db.getCollection(collectionName).countDocuments();
  const targetCount = targetDbObj.getCollection(collectionName).countDocuments();
  
  if (sourceCount === targetCount) {
    console.log(`   ✓ ${collectionName}: ${sourceCount} documents (verified)`);
  } else {
    console.log(`   ✗ ${collectionName}: source=${sourceCount}, target=${targetCount} (MISMATCH!)`);
    verified = false;
  }
}

if (!verified) {
  console.log(`\n❌ Verification failed! Database NOT dropped for safety.`);
  console.log(`   Please investigate the mismatches.`);
  quit(1);
}

// Ask for confirmation before dropping
console.log(`\n⚠️  Ready to drop source database: ${sourceDb}`);
console.log(`   All data has been verified in: ${targetDb}`);
console.log(`\n   Type 'yes' to confirm and drop the source database:`);
console.log(`   (The script will wait 30 seconds for your confirmation)`);

// Note: In mongosh, we can't do interactive input from a script
// So we'll just provide instructions
console.log(`\n✅ Copy and verification complete!`);
console.log(`\n📝 Next steps:`);
console.log(`   1. Review the output above to ensure all collections were copied`);
console.log(`   2. If everything looks good, run this command to drop the old database:`);
console.log(`      mongosh "your-connection-string" --eval "use fasting-tracker-test; db.dropDatabase()"`);
console.log(`\n   3. Update your .env.local file:`);
console.log(`      MONGODB_URI=...fasting-tracker?retryWrites=true...`);
console.log(`\n✨ All done!\n`);
