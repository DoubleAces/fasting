/**
 * Achievement Toast Utility
 * 
 * Formats unlocked achievement data from API responses into
 * user-friendly toast notification messages.
 * 
 * Feature: 034-achievement-unlock-toasts
 */

/**
 * Get emoji based on achievement rarity
 * 
 * @param {string} rarity - Achievement rarity (Common, Rare, Epic, Legendary)
 * @returns {string} Emoji character
 */
export function getRarityEmoji(rarity) {
  const rarityMap = {
    'Common': '🏆',
    'Rare': '⭐',
    'Epic': '🎉',
    'Legendary': '✨'
  };
  
  return rarityMap[rarity] || '🏆'; // Default to trophy
}

/**
 * Format unlocked achievements into toast message
 * 
 * Handles single achievements, multiple achievements (with truncation),
 * and malformed data gracefully.
 * 
 * @param {Array<Object>} achievements - Unlocked achievements from API
 * @returns {string|null} Formatted message or null if no valid achievements
 * 
 * @example
 * // Single achievement
 * formatAchievementToast([{ name: 'First Fast', points: 10, rarity: 'Common' }])
 * // Returns: "🏆 Achievement Unlocked! First Fast - 10 points (Common)"
 * 
 * @example
 * // Multiple achievements
 * formatAchievementToast([
 *   { name: 'First Fast', points: 10, rarity: 'Common' },
 *   { name: 'Week Warrior', points: 25, rarity: 'Rare' }
 * ])
 * // Returns: "⭐ 2 Achievements Unlocked! First Fast (10 pts) • Week Warrior (25 pts) (+35 pts total)"
 */
export function formatAchievementToast(achievements) {
  try {
    // Validate input
    if (!Array.isArray(achievements) || achievements.length === 0) {
      return null;
    }

    // Filter out invalid achievements
    const validAchievements = achievements.filter(ach => {
      const isValid = (
        ach &&
        typeof ach.name === 'string' &&
        ach.name.trim().length > 0 &&
        typeof ach.points === 'number' &&
        typeof ach.rarity === 'string'
      );
      
      if (!isValid) {
        console.warn('[AchievementToast] Malformed achievement data:', ach);
      }
      
      return isValid;
    });

    // Handle no valid achievements - show fallback
    if (validAchievements.length === 0) {
      console.warn('[AchievementToast] No valid achievements to display');
      return '🏆 Achievement Unlocked! View your achievements page for details.';
    }

    // Single achievement format
    if (validAchievements.length === 1) {
      const ach = validAchievements[0];
      const emoji = getRarityEmoji(ach.rarity);
      return `${emoji} Achievement Unlocked! ${ach.name} - ${ach.points} points (${ach.rarity})`;
    }

    // Multiple achievements format
    const totalPoints = validAchievements.reduce((sum, ach) => sum + ach.points, 0);
    
    // Show first 3 achievements, truncate rest
    const displayAchievements = validAchievements.slice(0, 3);
    const names = displayAchievements
      .map(ach => `${ach.name} (${ach.points} pts)`)
      .join(' • ');
    
    const remaining = validAchievements.length - 3;
    const suffix = remaining > 0 ? ` and ${remaining} more...` : '';
    
    // Use emoji from first (typically highest rarity) achievement
    const emoji = getRarityEmoji(validAchievements[0].rarity);
    
    return `${emoji} ${validAchievements.length} Achievements Unlocked! ${names}${suffix} (+${totalPoints} pts total)`;
    
  } catch (error) {
    console.error('[AchievementToast] Error formatting achievement toast:', error);
    return '🏆 Achievement Unlocked! View your achievements page for details.';
  }
}
