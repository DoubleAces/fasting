/**
 * Integration tests for entry API timezone handling
 * Regression tests for date validation across timezones (BUG-007)
 */

const request = require('supertest');
const { connectDB, closeDB } = require('@/lib/db');
const User = require('@/lib/models/User');
const Entry = require('@/lib/models/Entry');
const { generateTestToken } = require('../helpers/authHelper');

describe('POST /api/entries - Timezone Handling', () => {
  let testUser;
  let authToken;
  let app;

  beforeAll(async () => {
    await connectDB();
    
    // Create test user
    testUser = await User.create({
      email: 'timezone-test@example.com',
      name: 'Timezone Test',
      password: 'hashedpassword123',
    });

    authToken = generateTestToken(testUser._id);
    
    // Import Next.js app for testing
    app = require('../../src/app');
  });

  afterAll(async () => {
    if (testUser) {
      await Entry.deleteMany({ userId: testUser._id });
      await User.findByIdAndDelete(testUser._id);
    }
    await closeDB();
  });

  afterEach(async () => {
    await Entry.deleteMany({ userId: testUser._id });
  });

  describe('Date validation with timezone differences (BUG-007)', () => {
    it('should accept date at noon UTC for today', async () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayAtNoon = `${year}-${month}-${day}T12:00:00.000Z`;

      const response = await request(app)
        .post('/api/entries')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: todayAtNoon,
          firstMealTime: '09:30',
          lastMealTime: '16:10',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.date).toBeDefined();
    });

    it('should accept date for users in UTC+12 (ahead of server)', async () => {
      // Simulate user in UTC+12 where it's already tomorrow
      const serverNow = new Date(); // Server time (UTC)
      const userTomorrow = new Date(serverNow);
      userTomorrow.setDate(userTomorrow.getDate() + 1);
      
      const year = userTomorrow.getFullYear();
      const month = String(userTomorrow.getMonth() + 1).padStart(2, '0');
      const day = String(userTomorrow.getDate()).padStart(2, '0');
      const tomorrowAtNoon = `${year}-${month}-${day}T12:00:00.000Z`;

      const response = await request(app)
        .post('/api/entries')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: tomorrowAtNoon,
          firstMealTime: '09:30',
          lastMealTime: '16:10',
        });

      // Should accept because user might be in a timezone where it's already that day
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
    });

    it('should reject date more than 1 day in future', async () => {
      const serverNow = new Date();
      const dayAfterTomorrow = new Date(serverNow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
      
      const year = dayAfterTomorrow.getFullYear();
      const month = String(dayAfterTomorrow.getMonth() + 1).padStart(2, '0');
      const day = String(dayAfterTomorrow.getDate()).padStart(2, '0');
      const futureDate = `${year}-${month}-${day}T12:00:00.000Z`;

      const response = await request(app)
        .post('/api/entries')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: futureDate,
          firstMealTime: '09:30',
          lastMealTime: '16:10',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/date.*future/i);
    });

    it('should compare only date part, not time component', async () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      
      // Send at different times of day
      const testTimes = [
        `${year}-${month}-${day}T00:00:00.000Z`, // Midnight
        `${year}-${month}-${day}T06:00:00.000Z`, // 6am
        `${year}-${month}-${day}T12:00:00.000Z`, // Noon
        `${year}-${month}-${day}T18:00:00.000Z`, // 6pm
        `${year}-${month}-${day}T23:59:59.999Z`, // End of day
      ];

      for (const testDate of testTimes) {
        await Entry.deleteMany({ userId: testUser._id });
        
        const response = await request(app)
          .post('/api/entries')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            date: testDate,
            firstMealTime: '09:30',
            lastMealTime: '16:10',
          });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('_id');
      }
    });

    it('should display correct date regardless of time component', async () => {
      // Create entry at noon UTC
      const targetDate = '2025-10-25';
      const dateAtNoon = `${targetDate}T12:00:00.000Z`;

      const response = await request(app)
        .post('/api/entries')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: dateAtNoon,
          firstMealTime: '09:30',
          lastMealTime: '16:10',
        });

      expect(response.status).toBe(201);
      
      // When fetched, should show as Oct 25th regardless of timezone
      const entryDate = new Date(response.body.date);
      expect(entryDate.getUTCDate()).toBe(25);
      expect(entryDate.getUTCMonth()).toBe(9); // October (0-indexed)
      expect(entryDate.getUTCFullYear()).toBe(2025);
    });
  });

  describe('Optional fields validation (BUG-003)', () => {
    it('should accept entry with only required fields', async () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayAtNoon = `${year}-${month}-${day}T12:00:00.000Z`;

      const response = await request(app)
        .post('/api/entries')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: todayAtNoon,
          firstMealTime: '09:30',
          lastMealTime: '16:10',
          // Optional fields omitted (not sent as null)
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.morningWeight).toBeNull();
      expect(response.body.hoursOfSleep).toBeNull();
    });

    it('should reject null values for optional fields', async () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayAtNoon = `${year}-${month}-${day}T12:00:00.000Z`;

      const response = await request(app)
        .post('/api/entries')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: todayAtNoon,
          firstMealTime: '09:30',
          lastMealTime: '16:10',
          morningWeight: null, // Explicitly null
          hungerLevel: null,
          energyLevel: null,
        });

      // Should reject because null doesn't match type validation
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('Date filtering (BUG-006)', () => {
    beforeEach(async () => {
      // Create entries for different dates
      await Entry.create([
        {
          userId: testUser._id,
          date: new Date('2025-10-23T12:00:00.000Z'),
          firstMealTime: '09:00',
          lastMealTime: '17:00',
        },
        {
          userId: testUser._id,
          date: new Date('2025-10-24T12:00:00.000Z'),
          firstMealTime: '09:30',
          lastMealTime: '16:30',
        },
        {
          userId: testUser._id,
          date: new Date('2025-10-25T12:00:00.000Z'),
          firstMealTime: '10:00',
          lastMealTime: '18:00',
        },
      ]);
    });

    it('should filter entries by specific date', async () => {
      const response = await request(app)
        .get('/api/entries?date=2025-10-24')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.entries).toHaveLength(1);
      
      const returnedDate = new Date(response.body.entries[0].date);
      expect(returnedDate.getUTCDate()).toBe(24);
    });

    it('should return all entries when date filter not provided', async () => {
      const response = await request(app)
        .get('/api/entries')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.entries.length).toBeGreaterThanOrEqual(3);
    });

    it('should return empty array for date with no entries', async () => {
      const response = await request(app)
        .get('/api/entries?date=2025-10-26')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.entries).toHaveLength(0);
    });
  });
});
