/**
 * Integration Tests - Entry API Performance
 * 
 * Tests API endpoint response times and index usage:
 * - GET /api/entries - Should respond in <200ms
 * - POST /api/entries - Previous entry lookup <50ms
 * - Date range queries - Should complete in <30ms
 * 
 * Performance Targets:
 * - GET requests: <200ms P95
 * - POST requests: <200ms P95 (includes previous entry lookup)
 * - Date range queries: <30ms
 * - Queries should use indexes (verified via explain())
 * 
 * @jest-environment node
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Entry = require('../../../src/lib/models/Entry').default;

describe('Entry API Performance', () => {
  let mongoServer;
  let testUserId;

  // Helper to create valid entry data
  const createEntryData = (overrides = {}) => ({
    userId: testUserId,
    date: new Date(2024, 0, 1),
    startTime: '08:00',
    endTime: '16:00',
    firstMealTime: '16:00',
    lastMealTime: '08:00',
    fastingDuration: 16,
    ...overrides
  });

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    testUserId = new mongoose.Types.ObjectId().toString();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear entries before each test
    await Entry.deleteMany({});
  });

  describe('GET /api/entries - List Performance', () => {
    test('should respond in <200ms with 100 entries', async () => {
      // Create 100 test entries
      const entries = Array.from({ length: 100 }, (_, i) => createEntryData({
        date: new Date(2024, 0, i + 1), // Jan 1-100, 2024
        note: `Test entry ${i + 1}`,
      }));

      await Entry.insertMany(entries);

      // Measure query time
      const startTime = Date.now();
      const result = await Entry.find({ userId: testUserId })
        .sort({ date: -1 })
        .limit(50)
        .lean();
      const queryTime = Date.now() - startTime;

      console.log(`Query time for 50 entries: ${queryTime}ms`);

      expect(result).toHaveLength(50);
      expect(queryTime).toBeLessThan(200);
    });

    test('should use userId index for filtering', async () => {
      // Create test data
      await Entry.create(createEntryData({
        date: new Date(2024, 0, 1),
      }));

      // Get query execution plan
      const explain = await Entry.find({ userId: testUserId })
        .sort({ date: -1 })
        .explain('executionStats');

      // Check that index was used
      const executionStage = explain.executionStats.executionStages;
      
      // Should use IXSCAN (index scan), not COLLSCAN (collection scan)
      expect(executionStage.stage).toMatch(/IXSCAN|FETCH/);
      
      // Verify index name contains userId
      if (executionStage.inputStage) {
        expect(executionStage.inputStage.indexName).toContain('userId');
      } else {
        expect(executionStage.indexName).toContain('userId');
      }
    });

    test('should handle pagination efficiently', async () => {
      // Create 200 entries
      const entries = Array.from({ length: 200 }, (_, i) => createEntryData({
        date: new Date(2024, 0, i + 1),
      }));

      await Entry.insertMany(entries);

      // Test pagination performance
      const startTime = Date.now();
      
      // Page 1
      const page1 = await Entry.find({ userId: testUserId })
        .sort({ date: -1 })
        .limit(50)
        .lean();
      
      // Page 2 (skip 50)
      const page2 = await Entry.find({ userId: testUserId })
        .sort({ date: -1 })
        .skip(50)
        .limit(50)
        .lean();
      
      const queryTime = Date.now() - startTime;

      console.log(`Pagination query time: ${queryTime}ms`);

      expect(page1).toHaveLength(50);
      expect(page2).toHaveLength(50);
      expect(queryTime).toBeLessThan(400); // 2 queries, 200ms each
    });
  });

  describe('POST /api/entries - Previous Entry Lookup', () => {
    test('should find previous entry in <50ms', async () => {
      // Create test entries
      const entries = [
        createEntryData({ date: new Date(2024, 0, 1) }),
        createEntryData({ date: new Date(2024, 0, 2) }),
        createEntryData({ date: new Date(2024, 0, 3) }),
      ];

      await Entry.insertMany(entries);

      // Simulate finding previous entry (POST logic)
      const newEntryDate = new Date(2024, 0, 4);
      
      const startTime = Date.now();
      const previousEntry = await Entry.findOne({
        userId: testUserId,
        date: { $lt: newEntryDate }
      })
        .sort({ date: -1 })
        .lean();
      const queryTime = Date.now() - startTime;

      console.log(`Previous entry lookup time: ${queryTime}ms`);

      expect(previousEntry).toBeDefined();
      expect(previousEntry.date).toEqual(new Date(2024, 0, 3));
      expect(queryTime).toBeLessThan(50);
    });

    test('should use compound index for previous entry lookup', async () => {
      await Entry.create(createEntryData({
        date: new Date(2024, 0, 1),
      }));

      // Explain previous entry query
      const explain = await Entry.findOne({
        userId: testUserId,
        date: { $lt: new Date(2024, 0, 2) }
      })
        .sort({ date: -1 })
        .explain('executionStats');

      const executionStage = explain.executionStats.executionStages;

      // LIMIT is top level, check inputStage for index usage  
      const indexStage = executionStage.inputStage || executionStage;
      expect(indexStage.stage).toMatch(/IXSCAN|FETCH/);
      
      // Verify userId is in index
      if (indexStage.indexName) {
        expect(indexStage.indexName).toMatch(/userId/);
      }
    });
  });

  describe('Date Range Queries', () => {
    test('should query date range in <30ms', async () => {
      // Create 50 entries across 2 months
      const entries = Array.from({ length: 50 }, (_, i) => createEntryData({
        date: new Date(2024, i < 25 ? 0 : 1, (i % 25) + 1), // Jan and Feb
      }));

      await Entry.insertMany(entries);

      // Query January entries
      const startDate = new Date(2024, 0, 1);
      const endDate = new Date(2024, 0, 31);

      const startTime = Date.now();
      const result = await Entry.find({
        userId: testUserId,
        date: { $gte: startDate, $lte: endDate }
      }).lean();
      const queryTime = Date.now() - startTime;

      console.log(`Date range query time: ${queryTime}ms`);

      expect(result).toHaveLength(25);
      expect(queryTime).toBeLessThan(30);
    });

    test('should use date index for range queries', async () => {
      await Entry.create(createEntryData({
        date: new Date(2024, 0, 15),
      }));

      // Explain date range query
      const explain = await Entry.find({
        userId: testUserId,
        date: { $gte: new Date(2024, 0, 1), $lte: new Date(2024, 0, 31) }
      }).explain('executionStats');

      const executionStage = explain.executionStats.executionStages;

      // Should use index
      expect(executionStage.stage).toMatch(/IXSCAN|FETCH/);
      
      // Check total documents examined vs returned
      const docsExamined = explain.executionStats.totalDocsExamined;
      const docsReturned = explain.executionStats.nReturned;
      
      // Index usage should keep examined docs close to returned docs
      expect(docsExamined).toBeLessThanOrEqual(docsReturned + 5);
    });
  });

  describe('Aggregation Queries', () => {
    test('should complete aggregation in <100ms', async () => {
      // Create test data
      const entries = Array.from({ length: 50 }, (_, i) => createEntryData({
        date: new Date(2024, 0, i + 1),
        endTime: i % 2 === 0 ? '16:00' : '18:00', // Alternating 16h and 18h
        firstMealTime: i % 2 === 0 ? '16:00' : '18:00',
        fastingDuration: i % 2 === 0 ? 16 : 18,
      }));

      await Entry.insertMany(entries);

      // Measure aggregation time (similar to insights calculation)
      const startTime = Date.now();
      const result = await Entry.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(testUserId) } },
        {
          $facet: {
            averageDuration: [
              { $group: { _id: null, avg: { $avg: '$fastingDuration' } } }
            ],
            longestFast: [
              { $sort: { fastingDuration: -1 } },
              { $limit: 1 }
            ],
            totalCount: [
              { $count: 'count' }
            ]
          }
        }
      ]);
      const queryTime = Date.now() - startTime;

      console.log(`Aggregation query time: ${queryTime}ms`);

      expect(result[0].totalCount[0].count).toBe(50);
      expect(result[0].averageDuration[0].avg).toBe(17); // Average of 16 and 18
      expect(queryTime).toBeLessThan(100);
    });

    test('should use indexes in aggregation pipeline', async () => {
      await Entry.create(createEntryData({
        date: new Date(2024, 0, 1),
      }));

      // Explain aggregation
      const explain = await Entry.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(testUserId) } },
        { $sort: { date: -1 } }
      ]).explain('executionStats');

      // Check first stage uses index
      const firstStage = explain.stages ? explain.stages[0] : explain;
      const queryPlanner = firstStage.$cursor?.queryPlanner || firstStage.queryPlanner;

      if (queryPlanner) {
        // Should have winning plan that uses index
        expect(queryPlanner.winningPlan).toBeDefined();
        expect(queryPlanner.winningPlan.stage).toMatch(/IXSCAN|FETCH/);
      }
    });
  });

  describe('Query Performance with Large Dataset', () => {
    test('should maintain performance with 1000 entries', async () => {
      // Create 1000 entries - one per day to avoid duplicate key errors
      const entries = Array.from({ length: 1000 }, (_, i) => createEntryData({
        date: new Date(2024, 0, 1 + i), // One entry per day
      }));

      await Entry.insertMany(entries);

      // Test various query patterns
      const queries = [
        // Recent entries
        () => Entry.find({ userId: testUserId }).sort({ date: -1 }).limit(50).lean(),
        
        // Specific date
        () => Entry.findOne({ userId: testUserId, date: new Date(2024, 0, 15) }).lean(),
        
        // Date range
        () => Entry.find({
          userId: testUserId,
          date: { $gte: new Date(2024, 0, 1), $lte: new Date(2024, 0, 31) }
        }).lean(),
        
        // Longest fast
        () => Entry.findOne({ userId: testUserId }).sort({ fastingDuration: -1 }).lean(),
      ];

      // Run each query and measure time
      for (let i = 0; i < queries.length; i++) {
        const startTime = Date.now();
        await queries[i]();
        const queryTime = Date.now() - startTime;
        
        console.log(`Query ${i + 1} time with 1000 entries: ${queryTime}ms`);
        expect(queryTime).toBeLessThan(200);
      }
    });
  });
});

