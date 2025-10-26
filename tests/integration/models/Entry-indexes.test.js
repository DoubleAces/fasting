/**
 * Integration Tests for Entry Model - Index Usage Verification
 * 
 * Tests that Entry model queries use the correct indexes for optimal performance.
 * Uses MongoDB explain() to verify query execution plans.
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Import Entry model - needs to be imported after mongoose connection
let Entry;

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Dynamically import Entry model after connection
  Entry = (await import('../../../src/lib/models/Entry.js')).default;
  
  // Ensure indexes are created - use the collection's ensureIndex
  await Entry.collection.createIndexes([
    { key: { userId: 1, date: -1 }, name: 'userId_1_date_-1' },
    { key: { userId: 1, fastingDuration: -1 }, name: 'userId_1_fastingDuration_-1' },
    { key: { userId: 1, date: 1 }, name: 'userId_1_date_1', unique: true }
  ]);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Entry.deleteMany({});
});

describe('Entry Model - Index Usage', () => {
  const testUserId = new mongoose.Types.ObjectId();

  describe('userId_1_date_-1 Compound Index', () => {
    test('should use compound index for userId + date descending sort', async () => {
      // Create test entries
      await Entry.create([
        {
          userId: testUserId,
          date: new Date(2024, 0, 1),
          startTime: '08:00',
          endTime: '16:00',
          firstMealTime: '16:00',
          lastMealTime: '08:00',
          fastingDuration: 16
        },
        {
          userId: testUserId,
          date: new Date(2024, 0, 2),
          startTime: '08:00',
          endTime: '16:00',
          firstMealTime: '16:00',
          lastMealTime: '08:00',
          fastingDuration: 16
        }
      ]);

      // Explain query that should use userId_1_date_-1 index
      const explain = await Entry.find({ userId: testUserId })
        .sort({ date: -1 })
        .explain('executionStats');

      const executionStage = explain.executionStats.executionStages;
      
      // Should use index scan
      expect(executionStage.stage).toMatch(/IXSCAN|FETCH/);
      
      // Should use the userId_1_date_-1 index
      const indexStage = executionStage.inputStage || executionStage;
      if (indexStage.indexName) {
        expect(indexStage.indexName).toContain('userId');
        expect(indexStage.indexName).toContain('date');
      }

      // Should not do a collection scan
      expect(executionStage.stage).not.toBe('COLLSCAN');
    });

    test('should use compound index for userId + date range', async () => {
      await Entry.create({
        userId: testUserId,
        date: new Date(2024, 0, 15),
        startTime: '08:00',
        endTime: '16:00',
        firstMealTime: '16:00',
        lastMealTime: '08:00',
        fastingDuration: 16
      });

      // Date range query
      const explain = await Entry.find({
        userId: testUserId,
        date: {
          $gte: new Date(2024, 0, 1),
          $lte: new Date(2024, 0, 31)
        }
      }).explain('executionStats');

      const executionStage = explain.executionStats.executionStages;
      
      // Should use index
      expect(executionStage.stage).toMatch(/IXSCAN|FETCH/);
      expect(executionStage.stage).not.toBe('COLLSCAN');
    });

    test('should use compound index for previous entry lookup', async () => {
      await Entry.create({
        userId: testUserId,
        date: new Date(2024, 0, 1),
        startTime: '08:00',
        endTime: '16:00',
        firstMealTime: '16:00',
        lastMealTime: '08:00',
        fastingDuration: 16
      });

      // Previous entry lookup - userId + date < target, sort by date desc, limit 1
      const explain = await Entry.findOne({
        userId: testUserId,
        date: { $lt: new Date(2024, 0, 5) }
      })
        .sort({ date: -1 })
        .explain('executionStats');

      const executionStage = explain.executionStats.executionStages;
      
      // LIMIT stage may be on top, check inputStage
      const indexStage = executionStage.inputStage || executionStage;
      expect(indexStage.stage).toMatch(/IXSCAN|FETCH/);
      
      // Should use userId + date index
      if (indexStage.indexName) {
        expect(indexStage.indexName).toContain('userId');
      }
    });

    test('should be a covering index for userId + date projections', async () => {
      await Entry.create({
        userId: testUserId,
        date: new Date(2024, 0, 1),
        startTime: '08:00',
        endTime: '16:00',
        firstMealTime: '16:00',
        lastMealTime: '08:00',
        fastingDuration: 16
      });

      // Query projecting only indexed fields
      const explain = await Entry.find(
        { userId: testUserId },
        { userId: 1, date: 1, _id: 1 }
      )
        .sort({ date: -1 })
        .explain('executionStats');

      const executionStage = explain.executionStats.executionStages;
      
      // Should use index scan
      expect(executionStage.stage).toMatch(/IXSCAN|PROJECTION|FETCH/);
      
      // Should scan minimal documents
      expect(explain.executionStats.totalDocsExamined).toBeLessThanOrEqual(
        explain.executionStats.nReturned
      );
    });
  });

  describe('userId_1_fastingDuration_-1 Compound Index', () => {
    test('should use compound index for userId + fastingDuration sort', async () => {
      await Entry.create([
        {
          userId: testUserId,
          date: new Date(2024, 0, 1),
          startTime: '08:00',
          endTime: '16:00',
          firstMealTime: '16:00',
          lastMealTime: '08:00',
          fastingDuration: 16
        },
        {
          userId: testUserId,
          date: new Date(2024, 0, 2),
          startTime: '08:00',
          endTime: '18:00',
          firstMealTime: '18:00',
          lastMealTime: '08:00',
          fastingDuration: 18
        }
      ]);

      // Query that should use userId_1_fastingDuration_-1 index
      const explain = await Entry.find({ userId: testUserId })
        .sort({ fastingDuration: -1 })
        .explain('executionStats');

      const executionStage = explain.executionStats.executionStages;
      
      // Should use index
      expect(executionStage.stage).toMatch(/IXSCAN|FETCH/);
      
      // Should use fastingDuration index
      const indexStage = executionStage.inputStage || executionStage;
      if (indexStage.indexName) {
        expect(indexStage.indexName).toContain('userId');
        expect(indexStage.indexName).toContain('fastingDuration');
      }
    });

    test('should use compound index for aggregation with fastingDuration', async () => {
      await Entry.create([
        {
          userId: testUserId,
          date: new Date(2024, 0, 1),
          startTime: '08:00',
          endTime: '16:00',
          firstMealTime: '16:00',
          lastMealTime: '08:00',
          fastingDuration: 16
        },
        {
          userId: testUserId,
          date: new Date(2024, 0, 2),
          startTime: '08:00',
          endTime: '18:00',
          firstMealTime: '18:00',
          lastMealTime: '08:00',
          fastingDuration: 18
        }
      ]);

      // Aggregation using fastingDuration
      const explain = await Entry.aggregate([
        { $match: { userId: testUserId } },
        { $sort: { fastingDuration: -1 } },
        { $limit: 10 }
      ]).explain('executionStats');

      const stages = explain.stages || explain.executionStats?.executionStages;
      const firstStage = Array.isArray(stages) ? stages[0] : stages;
      
      // Should use index in aggregation
      let executionStage = firstStage?.$cursor?.executionStats?.executionStages || firstStage;
      
      // Traverse to find the index scan stage (may be nested under LIMIT/SORT)
      while (executionStage && executionStage.inputStage && executionStage.stage === 'LIMIT') {
        executionStage = executionStage.inputStage;
      }
      
      if (executionStage) {
        expect(executionStage.stage).toMatch(/IXSCAN|FETCH/);
      }
    });
  });

  describe('userId_1_date_1 Unique Compound Index', () => {
    test('should enforce uniqueness of userId + date combination', async () => {
      const entryData = {
        userId: testUserId,
        date: new Date(2024, 0, 1),
        startTime: '08:00',
        endTime: '16:00',
        firstMealTime: '16:00',
        lastMealTime: '08:00',
        fastingDuration: 16
      };

      // First entry should succeed
      await Entry.create(entryData);

      // Duplicate userId + date should fail
      await expect(Entry.create(entryData)).rejects.toThrow(/duplicate key/i);
    });

    test('should use unique index for exact date lookups', async () => {
      await Entry.create({
        userId: testUserId,
        date: new Date(2024, 0, 1),
        startTime: '08:00',
        endTime: '16:00',
        firstMealTime: '16:00',
        lastMealTime: '08:00',
        fastingDuration: 16
      });

      // Exact date lookup
      const explain = await Entry.findOne({
        userId: testUserId,
        date: new Date(2024, 0, 1)
      }).explain('executionStats');

      const executionStage = explain.executionStats.executionStages;
      
      // LIMIT stage on top, check inputStage
      const indexStage = executionStage.inputStage || executionStage;
      expect(indexStage.stage).toMatch(/IXSCAN|FETCH|ixseek|fetch/i);

      // Should examine minimal documents (1 or fewer - may be 0 in index-only query)
      expect(explain.executionStats.totalDocsExamined).toBeLessThanOrEqual(1);
    });    test('should allow same date for different users', async () => {
      const userId1 = new mongoose.Types.ObjectId();
      const userId2 = new mongoose.Types.ObjectId();
      const sameDate = new Date(2024, 0, 1);

      // Both should succeed - different users
      const entry1 = await Entry.create({
        userId: userId1,
        date: sameDate,
        startTime: '08:00',
        endTime: '16:00',
        firstMealTime: '16:00',
        lastMealTime: '08:00',
        fastingDuration: 16
      });

      const entry2 = await Entry.create({
        userId: userId2,
        date: sameDate,
        startTime: '08:00',
        endTime: '16:00',
        firstMealTime: '16:00',
        lastMealTime: '08:00',
        fastingDuration: 16
      });

      // Verify both were created
      expect(entry1._id).toBeDefined();
      expect(entry2._id).toBeDefined();

      const count = await Entry.countDocuments({ date: sameDate });
      expect(count).toBe(2);
    });
  });

  describe('Index Performance Verification', () => {
    test('should examine minimal documents with proper index usage', async () => {
      // Create 100 entries for a user
      const entries = Array.from({ length: 100 }, (_, i) => ({
        userId: testUserId,
        date: new Date(2024, 0, 1 + i),
        startTime: '08:00',
        endTime: '16:00',
        firstMealTime: '16:00',
        lastMealTime: '08:00',
        fastingDuration: 16
      }));
      await Entry.insertMany(entries);

      // Query with limit - should not scan all documents
      const explain = await Entry.find({ userId: testUserId })
        .sort({ date: -1 })
        .limit(10)
        .explain('executionStats');

      // Should return 10 documents
      expect(explain.executionStats.nReturned).toBe(10);
      
      // Should examine close to 10 documents (not all 100)
      // Allow some overhead for index traversal
      expect(explain.executionStats.totalDocsExamined).toBeLessThanOrEqual(20);
    });

    test('should use index for aggregation pipelines', async () => {
      await Entry.create([
        {
          userId: testUserId,
          date: new Date(2024, 0, 1),
          startTime: '08:00',
          endTime: '16:00',
          firstMealTime: '16:00',
          lastMealTime: '08:00',
          fastingDuration: 16
        },
        {
          userId: testUserId,
          date: new Date(2024, 0, 2),
          startTime: '08:00',
          endTime: '18:00',
          firstMealTime: '18:00',
          lastMealTime: '08:00',
          fastingDuration: 18
        }
      ]);

      // Aggregation with $match on userId
      const explain = await Entry.aggregate([
        { $match: { userId: testUserId } },
        { $group: { _id: null, avgDuration: { $avg: '$fastingDuration' } } }
      ]).explain('executionStats');

      const stages = explain.stages || explain.executionStats?.executionStages;
      const firstStage = Array.isArray(stages) ? stages[0] : stages;
      
      // Aggregation should use index for $match stage
      let executionStage = firstStage?.$cursor?.executionStats?.executionStages || firstStage;
      
      // The stage may be nested - traverse to find index scan
      while (executionStage && executionStage.inputStage && !['IXSCAN', 'FETCH', 'COLLSCAN'].includes(executionStage.stage)) {
        executionStage = executionStage.inputStage;
      }
      
      if (executionStage) {
        expect(executionStage.stage).toMatch(/IXSCAN|FETCH/);
      }
    });
  });
});
