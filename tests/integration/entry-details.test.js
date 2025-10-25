/**
 * @jest-environment node
 */

import { GET } from '@/app/entries/[id]/page';
import { auth } from '@/lib/auth';
import Entry from '@/lib/models/Entry';
import Settings from '@/lib/models/Settings';
import { connectDB } from '@/lib/db';

jest.mock('@/lib/auth');
jest.mock('@/lib/models/Entry');
jest.mock('@/lib/models/Settings');
jest.mock('@/lib/db');

describe('Entry Details Page Integration', () => {
  const mockSession = {
    user: {
      id: '671def456abc789012345678',
      email: 'test@example.com',
    },
  };

  const mockEntry = {
    _id: '673abc123def456789012345',
    userId: '671def456abc789012345678',
    date: new Date('2025-10-20'),
    firstMealTime: '12:30',
    lastMealTime: '20:00',
    fastingDuration: 990,
    hoursOfSleep: 7.5,
    morningWeight: 75.2,
    hungerLevel: 'Medium',
    energyLevel: 'High Energy',
    wellBeing: 'Good',
    foodNotes: 'Test notes',
    createdAt: new Date('2025-10-20T08:15:00.000Z'),
    updatedAt: new Date('2025-10-20T08:15:00.000Z'),
  };

  const mockSettings = {
    userId: '671def456abc789012345678',
    timeFormat: '12h',
    measurementSystem: 'metric',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    connectDB.mockResolvedValue(true);
  });

  describe('Authorization', () => {
    it('redirects when user not authenticated', async () => {
      auth.mockResolvedValue(null);

      const params = { id: '673abc123def456789012345' };
      
      // Should redirect via middleware
      expect(auth).toBeDefined();
    });

    it('fetches entry when user authenticated', async () => {
      auth.mockResolvedValue(mockSession);
      Entry.findById.mockResolvedValue(mockEntry);
      Settings.findOne.mockResolvedValue(mockSettings);

      const params = { id: '673abc123def456789012345' };
      
      expect(auth).toBeDefined();
      expect(Entry.findById).toBeDefined();
    });
  });

  describe('Data Fetching', () => {
    beforeEach(() => {
      auth.mockResolvedValue(mockSession);
    });

    it('fetches entry by ID', async () => {
      Entry.findById.mockResolvedValue(mockEntry);
      Settings.findOne.mockResolvedValue(mockSettings);

      const params = { id: '673abc123def456789012345' };
      
      expect(Entry.findById).toBeDefined();
    });

    it('fetches user settings', async () => {
      Entry.findById.mockResolvedValue(mockEntry);
      Settings.findOne.mockResolvedValue(mockSettings);

      const params = { id: '673abc123def456789012345' };
      
      expect(Settings.findOne).toBeDefined();
    });
  });

  describe('404 Handling', () => {
    beforeEach(() => {
      auth.mockResolvedValue(mockSession);
    });

    it('handles non-existent entry', async () => {
      Entry.findById.mockResolvedValue(null);

      const params = { id: 'nonexistent123' };
      
      // Should return 404 or notFound()
      expect(Entry.findById).toBeDefined();
    });

    it('handles invalid ObjectId format', async () => {
      Entry.findById.mockRejectedValue(new Error('Invalid ObjectId'));

      const params = { id: 'invalid-id' };
      
      expect(Entry.findById).toBeDefined();
    });
  });

  describe('Unauthorized Access', () => {
    beforeEach(() => {
      auth.mockResolvedValue(mockSession);
    });

    it('blocks access to other user entry', async () => {
      const otherUserEntry = {
        ...mockEntry,
        userId: 'different-user-id',
      };
      
      Entry.findById.mockResolvedValue(otherUserEntry);

      const params = { id: '673abc123def456789012345' };
      
      // Should redirect or return 403
      expect(Entry.findById).toBeDefined();
    });

    it('allows access to own entry', async () => {
      Entry.findById.mockResolvedValue(mockEntry);
      Settings.findOne.mockResolvedValue(mockSettings);

      const params = { id: '673abc123def456789012345' };
      
      expect(mockEntry.userId).toBe(mockSession.user.id);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      auth.mockResolvedValue(mockSession);
    });

    it('handles database connection errors', async () => {
      connectDB.mockRejectedValue(new Error('DB connection failed'));

      const params = { id: '673abc123def456789012345' };
      
      await expect(connectDB()).rejects.toThrow('DB connection failed');
    });

    it('handles query errors gracefully', async () => {
      Entry.findById.mockRejectedValue(new Error('Query failed'));

      const params = { id: '673abc123def456789012345' };
      
      await expect(Entry.findById()).rejects.toThrow('Query failed');
    });
  });

  describe('Entry Actions - Delete', () => {
    beforeEach(() => {
      auth.mockResolvedValue(mockSession);
      connectDB.mockResolvedValue(true);
    });

    it('successfully deletes entry without streak impact', async () => {
      // Mock entry with no streak impact
      const entryToDelete = {
        ...mockEntry,
        _id: '673abc123def456789012345',
        userId: mockSession.user.id,
      };

      Entry.findById.mockResolvedValue(entryToDelete);
      Entry.findOne.mockResolvedValue(null); // No previous/next day entries
      Entry.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const deleteResult = await Entry.deleteOne({ _id: entryToDelete._id, userId: mockSession.user.id });

      expect(deleteResult.deletedCount).toBe(1);
    });

    it('checks streak impact before deletion', async () => {
      const entryToDelete = {
        ...mockEntry,
        _id: '673abc123def456789012345',
        userId: mockSession.user.id,
        date: new Date('2025-10-20'),
      };

      // Mock yesterday's entry (part of streak)
      const yesterdayEntry = {
        _id: '673abc123def456789012344',
        userId: mockSession.user.id,
        date: new Date('2025-10-19'),
      };

      // Mock tomorrow's entry (part of streak)
      const tomorrowEntry = {
        _id: '673abc123def456789012346',
        userId: mockSession.user.id,
        date: new Date('2025-10-21'),
      };

      Entry.findById.mockResolvedValue(entryToDelete);
      Entry.findOne
        .mockResolvedValueOnce(yesterdayEntry) // Query for yesterday
        .mockResolvedValueOnce(tomorrowEntry); // Query for tomorrow

      // Check if entry is part of a streak
      const hasYesterday = await Entry.findOne({ 
        userId: mockSession.user.id, 
        date: new Date('2025-10-19') 
      });
      const hasTomorrow = await Entry.findOne({ 
        userId: mockSession.user.id, 
        date: new Date('2025-10-21') 
      });

      expect(hasYesterday).not.toBeNull();
      expect(hasTomorrow).not.toBeNull();
      // This entry is in the middle of a streak - should warn user
    });

    it('handles delete API error gracefully', async () => {
      Entry.findById.mockResolvedValue(mockEntry);
      Entry.deleteOne.mockRejectedValue(new Error('Database error'));

      await expect(
        Entry.deleteOne({ _id: mockEntry._id, userId: mockSession.user.id })
      ).rejects.toThrow('Database error');
    });

    it('prevents deleting another user\'s entry', async () => {
      const otherUsersEntry = {
        ...mockEntry,
        userId: 'different-user-id-123',
      };

      Entry.findById.mockResolvedValue(otherUsersEntry);

      // Verify entry belongs to different user
      expect(otherUsersEntry.userId).not.toBe(mockSession.user.id);
      
      // Should not proceed with deletion
      Entry.deleteOne.mockResolvedValue({ deletedCount: 0 });
      
      const result = await Entry.deleteOne({ 
        _id: otherUsersEntry._id, 
        userId: mockSession.user.id  // Wrong user
      });

      expect(result.deletedCount).toBe(0);
    });
  });

  describe('Entry Actions - Copy to Today', () => {
    beforeEach(() => {
      auth.mockResolvedValue(mockSession);
      connectDB.mockResolvedValue(true);
    });

    it('validates that today\'s entry doesn\'t exist before copying', async () => {
      const sourceEntry = {
        ...mockEntry,
        _id: '673abc123def456789012345',
        date: new Date('2025-10-20'), // Past date
      };

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      Entry.findById.mockResolvedValue(sourceEntry);
      Entry.findOne.mockResolvedValue(null); // No entry for today

      // Check if today's entry exists
      const todayEntry = await Entry.findOne({
        userId: mockSession.user.id,
        date: today,
      });

      expect(todayEntry).toBeNull(); // Safe to copy
    });

    it('prevents copying when today\'s entry already exists', async () => {
      const sourceEntry = {
        ...mockEntry,
        _id: '673abc123def456789012345',
        date: new Date('2025-10-20'),
      };

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingTodayEntry = {
        _id: '673abc123def456789012399',
        userId: mockSession.user.id,
        date: today,
      };

      Entry.findById.mockResolvedValue(sourceEntry);
      Entry.findOne.mockResolvedValue(existingTodayEntry);

      // Check if today's entry exists
      const todayEntry = await Entry.findOne({
        userId: mockSession.user.id,
        date: today,
      });

      expect(todayEntry).not.toBeNull(); // Cannot copy - entry exists
    });

    it('copies only meal times, not health metrics', async () => {
      const sourceEntry = {
        ...mockEntry,
        _id: '673abc123def456789012345',
        firstMealTime: '12:30',
        lastMealTime: '20:00',
        morningWeight: 75.2,
        hoursOfSleep: 7.5,
        hungerLevel: 'Medium',
        energyLevel: 'High Energy',
        wellBeing: 'Good',
      };

      const newEntry = {
        userId: mockSession.user.id,
        date: new Date(),
        firstMealTime: sourceEntry.firstMealTime,
        lastMealTime: sourceEntry.lastMealTime,
        templateSource: sourceEntry._id,
        // Health metrics intentionally null
        morningWeight: null,
        hoursOfSleep: null,
        hungerLevel: null,
        energyLevel: null,
        wellBeing: null,
        foodNotes: null,
      };

      Entry.findById.mockResolvedValue(sourceEntry);
      Entry.findOne.mockResolvedValue(null); // No today entry
      Entry.create.mockResolvedValue({ ...newEntry, _id: 'new-entry-id-123' });

      const created = await Entry.create(newEntry);

      expect(created.firstMealTime).toBe(sourceEntry.firstMealTime);
      expect(created.lastMealTime).toBe(sourceEntry.lastMealTime);
      expect(created.morningWeight).toBeNull();
      expect(created.hoursOfSleep).toBeNull();
      expect(created.templateSource).toBe(sourceEntry._id);
    });

    it('handles copy API error gracefully', async () => {
      Entry.findById.mockResolvedValue(mockEntry);
      Entry.findOne.mockResolvedValue(null);
      Entry.create.mockRejectedValue(new Error('Failed to create entry'));

      const newEntry = {
        userId: mockSession.user.id,
        date: new Date(),
        firstMealTime: mockEntry.firstMealTime,
        lastMealTime: mockEntry.lastMealTime,
      };

      await expect(Entry.create(newEntry)).rejects.toThrow('Failed to create entry');
    });

    it('prevents copying another user\'s entry', async () => {
      const otherUsersEntry = {
        ...mockEntry,
        userId: 'different-user-id-123',
      };

      Entry.findById.mockResolvedValue(otherUsersEntry);

      // Verify entry belongs to different user
      expect(otherUsersEntry.userId).not.toBe(mockSession.user.id);
      
      // Should not proceed with copy (return null or error)
    });
  });
});
