/**
 * Achievement Data Definitions
 * 
 * Contains all 81 achievement definitions organized by category.
 * Imported by seed-achievements.js
 */

export const achievementsData = [
  // ============================================
  // GETTING STARTED CATEGORY (8 achievements)
  // ============================================
  {
    achievementId: 'first-entry',
    translations: {
      en: {
        name: 'First Step',
        description: 'Record your first fasting entry',
        shortDescription: 'First entry'
      },
      es: {
        name: 'Primer Paso',
        description: 'Registra tu primera entrada de ayuno',
        shortDescription: 'Primera entrada'
      }
    },
    badgeImage: {
      locked: '/badges/first-entry-locked.png',
      unlocked: '/badges/first-entry-unlocked.png'
    },
    icon: '🌱',
    iconColor: '#10B981',
    category: 'getting-started',
    points: 5,
    rarity: 'common',
    order: 5,
    criteria: { type: 'entry-count', params: { count: 1 } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'three-entries',
    translations: {
      en: {
        name: 'Getting Started',
        description: 'Complete your first 3 fasting entries',
        shortDescription: '3 entries'
      },
      es: {
        name: 'Comenzando',
        description: 'Completa tus primeras 3 entradas de ayuno',
        shortDescription: '3 entradas'
      }
    },
    badgeImage: {
      locked: '/badges/three-entries-locked.png',
      unlocked: '/badges/three-entries-unlocked.png'
    },
    icon: '🌿',
    iconColor: '#10B981',
    category: 'getting-started',
    points: 10,
    rarity: 'common',
    order: 10,
    criteria: { type: 'entry-count', params: { count: 3 } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'ten-entries',
    translations: {
      en: {
        name: 'Consistency Champion',
        description: 'Complete 10 fasting entries',
        shortDescription: '10 entries'
      },
      es: {
        name: 'Campeón de Consistencia',
        description: 'Completa 10 entradas de ayuno',
        shortDescription: '10 entradas'
      }
    },
    badgeImage: {
      locked: '/badges/ten-entries-locked.png',
      unlocked: '/badges/ten-entries-unlocked.png'
    },
    icon: '✨',
    iconColor: '#10B981',
    category: 'getting-started',
    points: 20,
    rarity: 'common',
    order: 15,
    criteria: { type: 'entry-count', params: { count: 10 } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'twentyfive-entries',
    translations: {
      en: {
        name: 'Building Momentum',
        description: 'Complete 25 fasting entries',
        shortDescription: '25 entries'
      },
      es: {
        name: 'Construyendo Impulso',
        description: 'Completa 25 entradas de ayuno',
        shortDescription: '25 entradas'
      }
    },
    badgeImage: {
      locked: '/badges/twentyfive-entries-locked.png',
      unlocked: '/badges/twentyfive-entries-unlocked.png'
    },
    icon: '🚀',
    iconColor: '#10B981',
    category: 'getting-started',
    points: 25,
    rarity: 'common',
    order: 20,
    criteria: { type: 'entry-count', params: { count: 25 } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'fifty-entries',
    translations: {
      en: {
        name: 'Halfway Hero',
        description: 'Complete 50 fasting entries',
        shortDescription: '50 entries'
      },
      es: {
        name: 'Héroe a Mitad de Camino',
        description: 'Completa 50 entradas de ayuno',
        shortDescription: '50 entradas'
      }
    },
    badgeImage: {
      locked: '/badges/fifty-entries-locked.png',
      unlocked: '/badges/fifty-entries-unlocked.png'
    },
    icon: '⭐',
    iconColor: '#10B981',
    category: 'getting-started',
    points: 50,
    rarity: 'rare',
    order: 25,
    criteria: { type: 'entry-count', params: { count: 50 } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'hundred-entries',
    translations: {
      en: {
        name: 'Century Mark',
        description: 'Complete 100 fasting entries',
        shortDescription: '100 entries'
      },
      es: {
        name: 'Marca del Siglo',
        description: 'Completa 100 entradas de ayuno',
        shortDescription: '100 entradas'
      }
    },
    badgeImage: {
      locked: '/badges/hundred-entries-locked.png',
      unlocked: '/badges/hundred-entries-unlocked.png'
    },
    icon: '💯',
    iconColor: '#10B981',
    category: 'getting-started',
    points: 50,
    rarity: 'rare',
    order: 30,
    criteria: { type: 'entry-count', params: { count: 100 } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'twofifty-entries',
    translations: {
      en: {
        name: 'Veteran Faster',
        description: 'Complete 250 fasting entries',
        shortDescription: '250 entries'
      },
      es: {
        name: 'Veterano del Ayuno',
        description: 'Completa 250 entradas de ayuno',
        shortDescription: '250 entradas'
      }
    },
    badgeImage: {
      locked: '/badges/twofifty-entries-locked.png',
      unlocked: '/badges/twofifty-entries-unlocked.png'
    },
    icon: '🏆',
    iconColor: '#10B981',
    category: 'getting-started',
    points: 100,
    rarity: 'epic',
    order: 35,
    criteria: { type: 'entry-count', params: { count: 250 } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'fivehundred-entries',
    translations: {
      en: {
        name: 'Legendary Logger',
        description: 'Complete 500 fasting entries',
        shortDescription: '500 entries'
      },
      es: {
        name: 'Registrador Legendario',
        description: 'Completa 500 entradas de ayuno',
        shortDescription: '500 entradas'
      }
    },
    badgeImage: {
      locked: '/badges/fivehundred-entries-locked.png',
      unlocked: '/badges/fivehundred-entries-unlocked.png'
    },
    icon: '👑',
    iconColor: '#10B981',
    category: 'getting-started',
    points: 150,
    rarity: 'epic',
    order: 40,
    criteria: { type: 'entry-count', params: { count: 500 } },
    isActive: true,
    isSecret: false
  },

  // ============================================
  // DURATION CATEGORY (12 achievements)
  // ============================================
  {
    achievementId: 'twelve-hour-start',
    translations: {
      en: {
        name: 'Twelve Hour Start',
        description: 'Complete a 12-hour fast',
        shortDescription: '12hr fast'
      },
      es: {
        name: 'Inicio de Doce Horas',
        description: 'Completa un ayuno de 12 horas',
        shortDescription: 'Ayuno de 12h'
      }
    },
    badgeImage: {
      locked: '/badges/twelve-hour-locked.png',
      unlocked: '/badges/twelve-hour-unlocked.png'
    },
    icon: '🌅',
    iconColor: '#4F46E5',
    category: 'duration',
    points: 10,
    rarity: 'common',
    order: 45,
    criteria: { type: 'duration-milestone', params: { hours: 12 } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'sweet-sixteen',
    translations: {
      en: {
        name: 'Sweet Sixteen',
        description: 'Complete your first 16-hour fast',
        shortDescription: '16hr fast'
      },
      es: {
        name: 'Dulce Dieciséis',
        description: 'Completa tu primer ayuno de 16 horas',
        shortDescription: 'Ayuno de 16h'
      }
    },
    badgeImage: {
      locked: '/badges/sweet-sixteen-locked.png',
      unlocked: '/badges/sweet-sixteen-unlocked.png'
    },
    icon: '🎯',
    iconColor: '#4F46E5',
    category: 'duration',
    points: 15,
    rarity: 'common',
    order: 50,
    criteria: { type: 'duration-milestone', params: { hours: 16 } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'eighteen-hour-hero',
    translations: {
      en: {
        name: 'Eighteen Hour Hero',
        description: 'Complete an 18-hour fast',
        shortDescription: '18hr fast'
      },
      es: {
        name: 'Héroe de Dieciocho Horas',
        description: 'Completa un ayuno de 18 horas',
        shortDescription: 'Ayuno de 18h'
      }
    },
    badgeImage: {
      locked: '/badges/eighteen-hour-locked.png',
      unlocked: '/badges/eighteen-hour-unlocked.png'
    },
    icon: '💪',
    iconColor: '#8B5CF6',
    category: 'duration',
    points: 20,
    rarity: 'common',
    order: 55,
    criteria: { type: 'duration-milestone', params: { hours: 18 } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'twenty-hour-warrior',
    translations: {
      en: {
        name: 'Twenty Hour Warrior',
        description: 'Complete a 20-hour fast',
        shortDescription: '20hr fast'
      },
      es: {
        name: 'Guerrero de Veinte Horas',
        description: 'Completa un ayuno de 20 horas',
        shortDescription: 'Ayuno de 20h'
      }
    },
    badgeImage: {
      locked: '/badges/twenty-hour-locked.png',
      unlocked: '/badges/twenty-hour-unlocked.png'
    },
    icon: '⚔️',
    iconColor: '#8B5CF6',
    category: 'duration',
    points: 25,
    rarity: 'common',
    order: 60,
    criteria: { type: 'duration-milestone', params: { hours: 20 } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'twentyfour-hour-master',
    translations: {
      en: {
        name: 'Twenty Four Hour Master',
        description: 'Complete a full 24-hour fast',
        shortDescription: '24hr fast'
      },
      es: {
        name: 'Maestro de Veinticuatro Horas',
        description: 'Completa un ayuno completo de 24 horas',
        shortDescription: 'Ayuno de 24h'
      }
    },
    badgeImage: {
      locked: '/badges/twentyfour-hour-locked.png',
      unlocked: '/badges/twentyfour-hour-unlocked.png'
    },
    icon: '👑',
    iconColor: '#F59E0B',
    category: 'duration',
    points: 80,
    rarity: 'epic',
    order: 65,
    criteria: { type: 'duration-milestone', params: { hours: 24 } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'thirtysix-hour-legend',
    translations: {
      en: {
        name: 'Thirty Six Hour Legend',
        description: 'Complete a 36-hour fast',
        shortDescription: '36hr fast'
      },
      es: {
        name: 'Leyenda de Treinta y Seis Horas',
        description: 'Completa un ayuno de 36 horas',
        shortDescription: 'Ayuno de 36h'
      }
    },
    badgeImage: {
      locked: '/badges/thirtysix-hour-locked.png',
      unlocked: '/badges/thirtysix-hour-unlocked.png'
    },
    icon: '🌟',
    iconColor: '#F59E0B',
    category: 'duration',
    points: 80,
    rarity: 'epic',
    order: 70,
    criteria: { type: 'duration-milestone', params: { hours: 36 } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'fortyeight-hour-titan',
    translations: {
      en: {
        name: 'Forty Eight Hour Titan',
        description: 'Complete a 48-hour fast',
        shortDescription: '48hr fast'
      },
      es: {
        name: 'Titán de Cuarenta y Ocho Horas',
        description: 'Completa un ayuno de 48 horas',
        shortDescription: 'Ayuno de 48h'
      }
    },
    badgeImage: {
      locked: '/badges/fortyeight-hour-locked.png',
      unlocked: '/badges/fortyeight-hour-unlocked.png'
    },
    icon: '⚡',
    iconColor: '#F59E0B',
    category: 'duration',
    points: 200,
    rarity: 'legendary',
    order: 75,
    criteria: { type: 'duration-milestone', params: { hours: 48 } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'seventytwo-hour-champion',
    translations: {
      en: {
        name: 'Seventy Two Hour Champion',
        description: 'Complete a 72-hour fast',
        shortDescription: '72hr fast'
      },
      es: {
        name: 'Campeón de Setenta y Dos Horas',
        description: 'Completa un ayuno de 72 horas',
        shortDescription: 'Ayuno de 72h'
      }
    },
    badgeImage: {
      locked: '/badges/seventytwo-hour-locked.png',
      unlocked: '/badges/seventytwo-hour-unlocked.png'
    },
    icon: '🔥',
    iconColor: '#EF4444',
    category: 'duration',
    points: 200,
    rarity: 'legendary',
    order: 80,
    criteria: { type: 'duration-milestone', params: { hours: 72 } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'ninetysix-hour-elite',
    translations: {
      en: {
        name: 'Ninety Six Hour Elite',
        description: 'Complete a 96-hour fast',
        shortDescription: '96hr fast'
      },
      es: {
        name: 'Élite de Noventa y Seis Horas',
        description: 'Completa un ayuno de 96 horas',
        shortDescription: 'Ayuno de 96h'
      }
    },
    badgeImage: {
      locked: '/badges/ninetysix-hour-locked.png',
      unlocked: '/badges/ninetysix-hour-unlocked.png'
    },
    icon: '💎',
    iconColor: '#EF4444',
    category: 'duration',
    points: 150,
    rarity: 'epic',
    order: 85,
    criteria: { type: 'duration-milestone', params: { hours: 96 } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'fiveday-master',
    translations: {
      en: {
        name: 'Five Day Master',
        description: 'Complete a 5-day (120-hour) fast',
        shortDescription: '5-day fast'
      },
      es: {
        name: 'Maestro de Cinco Días',
        description: 'Completa un ayuno de 5 días (120 horas)',
        shortDescription: 'Ayuno de 5 días'
      }
    },
    badgeImage: {
      locked: '/badges/fiveday-locked.png',
      unlocked: '/badges/fiveday-unlocked.png'
    },
    icon: '🏔️',
    iconColor: '#EF4444',
    category: 'duration',
    points: 150,
    rarity: 'epic',
    order: 90,
    criteria: { type: 'duration-milestone', params: { hours: 120 } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'week-long-legend',
    translations: {
      en: {
        name: 'Week Long Legend',
        description: 'Complete a 7-day (168-hour) fast',
        shortDescription: '7-day fast'
      },
      es: {
        name: 'Leyenda de Una Semana',
        description: 'Completa un ayuno de 7 días (168 horas)',
        shortDescription: 'Ayuno de 7 días'
      }
    },
    badgeImage: {
      locked: '/badges/weeklong-locked.png',
      unlocked: '/badges/weeklong-unlocked.png'
    },
    icon: '🌠',
    iconColor: '#EF4444',
    category: 'duration',
    points: 300,
    rarity: 'legendary',
    order: 95,
    criteria: { type: 'duration-milestone', params: { hours: 168 } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'extended-master',
    translations: {
      en: {
        name: 'Extended Fast Master',
        description: 'Complete a 10-day (240-hour) fast',
        shortDescription: '10-day fast'
      },
      es: {
        name: 'Maestro del Ayuno Extendido',
        description: 'Completa un ayuno de 10 días (240 horas)',
        shortDescription: 'Ayuno de 10 días'
      }
    },
    badgeImage: {
      locked: '/badges/extended-master-locked.png',
      unlocked: '/badges/extended-master-unlocked.png'
    },
    icon: '🦅',
    iconColor: '#EF4444',
    category: 'duration',
    points: 500,
    rarity: 'legendary',
    order: 100,
    criteria: { type: 'duration-milestone', params: { hours: 240 } },
    isActive: true,
    isSecret: true
  },

  // ============================================
  // STREAK CATEGORY (10 achievements)
  // ============================================
  {
    achievementId: 'three-day-streak',
    translations: {
      en: {
        name: 'Three Day Streak',
        description: 'Fast for 3 consecutive days',
        shortDescription: '3-day streak'
      },
      es: {
        name: 'Racha de Tres Días',
        description: 'Ayuna durante 3 días consecutivos',
        shortDescription: 'Racha de 3 días'
      }
    },
    badgeImage: {
      locked: '/badges/three-day-streak-locked.png',
      unlocked: '/badges/three-day-streak-unlocked.png'
    },
    icon: '🔥',
    iconColor: '#F59E0B',
    category: 'streak',
    points: 10,
    rarity: 'common',
    order: 105,
    criteria: { type: 'streak', params: { days: 3 } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'week-warrior',
    translations: {
      en: {
        name: 'Week Warrior',
        description: 'Maintain a 7-day fasting streak',
        shortDescription: '7-day streak'
      },
      es: {
        name: 'Guerrero Semanal',
        description: 'Mantén una racha de ayuno de 7 días',
        shortDescription: 'Racha de 7 días'
      }
    },
    badgeImage: {
      locked: '/badges/week-warrior-locked.png',
      unlocked: '/badges/week-warrior-unlocked.png'
    },
    icon: '⚔️',
    iconColor: '#F59E0B',
    category: 'streak',
    points: 20,
    rarity: 'common',
    order: 110,
    criteria: { type: 'streak', params: { days: 7 } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'twoweek-champion',
    translations: {
      en: {
        name: 'Two Week Champion',
        description: 'Maintain a 14-day fasting streak',
        shortDescription: '14-day streak'
      },
      es: {
        name: 'Campeón de Dos Semanas',
        description: 'Mantén una racha de ayuno de 14 días',
        shortDescription: 'Racha de 14 días'
      }
    },
    badgeImage: {
      locked: '/badges/twoweek-champion-locked.png',
      unlocked: '/badges/twoweek-champion-unlocked.png'
    },
    icon: '🏆',
    iconColor: '#F59E0B',
    category: 'streak',
    points: 80,
    rarity: 'epic',
    order: 115,
    criteria: { type: 'streak', params: { days: 14 } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'month-master',
    translations: {
      en: {
        name: 'Month Master',
        description: 'Maintain a 30-day fasting streak',
        shortDescription: '30-day streak'
      },
      es: {
        name: 'Maestro del Mes',
        description: 'Mantén una racha de ayuno de 30 días',
        shortDescription: 'Racha de 30 días'
      }
    },
    badgeImage: {
      locked: '/badges/month-master-locked.png',
      unlocked: '/badges/month-master-unlocked.png'
    },
    icon: '📅',
    iconColor: '#EC4899',
    category: 'streak',
    points: 100,
    rarity: 'epic',
    order: 120,
    criteria: { type: 'streak', params: { days: 30 } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'ninety-day-legend',
    translations: {
      en: {
        name: 'Ninety Day Legend',
        description: 'Maintain a 90-day fasting streak',
        shortDescription: '90-day streak'
      },
      es: {
        name: 'Leyenda de Noventa Días',
        description: 'Mantén una racha de ayuno de 90 días',
        shortDescription: 'Racha de 90 días'
      }
    },
    badgeImage: {
      locked: '/badges/ninety-day-locked.png',
      unlocked: '/badges/ninety-day-unlocked.png'
    },
    icon: '💎',
    iconColor: '#EC4899',
    category: 'streak',
    points: 100,
    rarity: 'epic',
    order: 125,
    criteria: { type: 'streak', params: { days: 90 } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'hundred-day-elite',
    translations: {
      en: {
        name: 'Hundred Day Elite',
        description: 'Maintain a 100-day fasting streak',
        shortDescription: '100-day streak'
      },
      es: {
        name: 'Élite de Cien Días',
        description: 'Mantén una racha de ayuno de 100 días',
        shortDescription: 'Racha de 100 días'
      }
    },
    badgeImage: {
      locked: '/badges/hundred-day-locked.png',
      unlocked: '/badges/hundred-day-unlocked.png'
    },
    icon: '💯',
    iconColor: '#EC4899',
    category: 'streak',
    points: 120,
    rarity: 'epic',
    order: 130,
    criteria: { type: 'streak', params: { days: 100 } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'halfyear-hero',
    translations: {
      en: {
        name: 'Half Year Hero',
        description: 'Maintain a 180-day fasting streak',
        shortDescription: '180-day streak'
      },
      es: {
        name: 'Héroe de Medio Año',
        description: 'Mantén una racha de ayuno de 180 días',
        shortDescription: 'Racha de 180 días'
      }
    },
    badgeImage: {
      locked: '/badges/halfyear-hero-locked.png',
      unlocked: '/badges/halfyear-hero-unlocked.png'
    },
    icon: '🌟',
    iconColor: '#EC4899',
    category: 'streak',
    points: 150,
    rarity: 'epic',
    order: 135,
    criteria: { type: 'streak', params: { days: 180 } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'year-legend',
    translations: {
      en: {
        name: 'Year Long Legend',
        description: 'Maintain a 365-day fasting streak',
        shortDescription: '365-day streak'
      },
      es: {
        name: 'Leyenda de Un Año',
        description: 'Mantén una racha de ayuno de 365 días',
        shortDescription: 'Racha de 365 días'
      }
    },
    badgeImage: {
      locked: '/badges/year-legend-locked.png',
      unlocked: '/badges/year-legend-unlocked.png'
    },
    icon: '👑',
    iconColor: '#EC4899',
    category: 'streak',
    points: 300,
    rarity: 'legendary',
    order: 140,
    criteria: { type: 'streak', params: { days: 365 } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'fivehundred-day-titan',
    translations: {
      en: {
        name: 'Five Hundred Day Titan',
        description: 'Maintain a 500-day fasting streak',
        shortDescription: '500-day streak'
      },
      es: {
        name: 'Titán de Quinientos Días',
        description: 'Mantén una racha de ayuno de 500 días',
        shortDescription: 'Racha de 500 días'
      }
    },
    badgeImage: {
      locked: '/badges/fivehundred-day-locked.png',
      unlocked: '/badges/fivehundred-day-unlocked.png'
    },
    icon: '⚡',
    iconColor: '#EC4899',
    category: 'streak',
    points: 75,
    rarity: 'rare',
    order: 145,
    criteria: { type: 'streak', params: { days: 500 } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'thousand-day-immortal',
    translations: {
      en: {
        name: 'Thousand Day Immortal',
        description: 'Maintain a 1000-day fasting streak',
        shortDescription: '1000-day streak'
      },
      es: {
        name: 'Inmortal de Mil Días',
        description: 'Mantén una racha de ayuno de 1000 días',
        shortDescription: 'Racha de 1000 días'
      }
    },
    badgeImage: {
      locked: '/badges/thousand-day-locked.png',
      unlocked: '/badges/thousand-day-unlocked.png'
    },
    icon: '🦅',
    iconColor: '#EC4899',
    category: 'streak',
    points: 50,
    rarity: 'rare',
    order: 150,
    criteria: { type: 'streak', params: { days: 1000 } },
    isActive: true,
    isSecret: true
  },

  // ============================================
  // GOAL CATEGORY (8 achievements)
  // ============================================
  {
    achievementId: 'goal-setter',
    translations: {
      en: {
        name: 'Goal Setter',
        description: 'Set your first fasting goal',
        shortDescription: 'First goal'
      },
      es: {
        name: 'Establecedor de Metas',
        description: 'Establece tu primera meta de ayuno',
        shortDescription: 'Primera meta'
      }
    },
    badgeImage: {
      locked: '/badges/goal-setter-locked.png',
      unlocked: '/badges/goal-setter-unlocked.png'
    },
    icon: '🎯',
    iconColor: '#06B6D4',
    category: 'goal',
    points: 10,
    rarity: 'common',
    order: 155,
    criteria: { type: 'custom', params: { requirement: 'setFirstGoal' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'first-goal-reached',
    translations: {
      en: {
        name: 'First Goal Reached',
        description: 'Complete your first fasting goal',
        shortDescription: 'Goal completed'
      },
      es: {
        name: 'Primera Meta Alcanzada',
        description: 'Completa tu primera meta de ayuno',
        shortDescription: 'Meta completada'
      }
    },
    badgeImage: {
      locked: '/badges/first-goal-locked.png',
      unlocked: '/badges/first-goal-unlocked.png'
    },
    icon: '✅',
    iconColor: '#06B6D4',
    category: 'goal',
    points: 20,
    rarity: 'common',
    order: 160,
    criteria: { type: 'custom', params: { requirement: 'completeFirstGoal' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'three-goals',
    translations: {
      en: {
        name: 'Three Goals Strong',
        description: 'Complete 3 fasting goals',
        shortDescription: '3 goals'
      },
      es: {
        name: 'Tres Metas Fuertes',
        description: 'Completa 3 metas de ayuno',
        shortDescription: '3 metas'
      }
    },
    badgeImage: {
      locked: '/badges/three-goals-locked.png',
      unlocked: '/badges/three-goals-unlocked.png'
    },
    icon: '🎪',
    iconColor: '#06B6D4',
    category: 'goal',
    points: 20,
    rarity: 'common',
    order: 165,
    criteria: { type: 'custom', params: { requirement: 'completeThreeGoals' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'five-goals',
    translations: {
      en: {
        name: 'Five Goal Champion',
        description: 'Complete 5 fasting goals',
        shortDescription: '5 goals'
      },
      es: {
        name: 'Campeón de Cinco Metas',
        description: 'Completa 5 metas de ayuno',
        shortDescription: '5 metas'
      }
    },
    badgeImage: {
      locked: '/badges/five-goals-locked.png',
      unlocked: '/badges/five-goals-unlocked.png'
    },
    icon: '🏅',
    iconColor: '#06B6D4',
    category: 'goal',
    points: 60,
    rarity: 'rare',
    order: 170,
    criteria: { type: 'custom', params: { requirement: 'completeFiveGoals' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'ten-goals',
    translations: {
      en: {
        name: 'Ten Goal Master',
        description: 'Complete 10 fasting goals',
        shortDescription: '10 goals'
      },
      es: {
        name: 'Maestro de Diez Metas',
        description: 'Completa 10 metas de ayuno',
        shortDescription: '10 metas'
      }
    },
    badgeImage: {
      locked: '/badges/ten-goals-locked.png',
      unlocked: '/badges/ten-goals-unlocked.png'
    },
    icon: '🎖️',
    iconColor: '#06B6D4',
    category: 'goal',
    points: 50,
    rarity: 'rare',
    order: 175,
    criteria: { type: 'custom', params: { requirement: 'completeTenGoals' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'twentyfive-goals',
    translations: {
      en: {
        name: 'Twenty Five Goal Legend',
        description: 'Complete 25 fasting goals',
        shortDescription: '25 goals'
      },
      es: {
        name: 'Leyenda de Veinticinco Metas',
        description: 'Completa 25 metas de ayuno',
        shortDescription: '25 metas'
      }
    },
    badgeImage: {
      locked: '/badges/twentyfive-goals-locked.png',
      unlocked: '/badges/twentyfive-goals-unlocked.png'
    },
    icon: '🌟',
    iconColor: '#06B6D4',
    category: 'goal',
    points: 25,
    rarity: 'common',
    order: 180,
    criteria: { type: 'custom', params: { requirement: 'completeTwentyfiveGoals' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'perfect-month',
    translations: {
      en: {
        name: 'Perfect Month',
        description: 'Meet your daily goals for 30 consecutive days',
        shortDescription: '30-day perfect'
      },
      es: {
        name: 'Mes Perfecto',
        description: 'Cumple tus metas diarias durante 30 días consecutivos',
        shortDescription: '30 días perfectos'
      }
    },
    badgeImage: {
      locked: '/badges/perfect-month-locked.png',
      unlocked: '/badges/perfect-month-unlocked.png'
    },
    icon: '💎',
    iconColor: '#06B6D4',
    category: 'goal',
    points: 75,
    rarity: 'rare',
    order: 185,
    criteria: { type: 'custom', params: { requirement: 'perfectMonthGoals' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'ambitious-achiever',
    translations: {
      en: {
        name: 'Ambitious Achiever',
        description: 'Complete a goal that was 20+ hours',
        shortDescription: 'Ambitious goal'
      },
      es: {
        name: 'Logrador Ambicioso',
        description: 'Completa una meta que fue de 20+ horas',
        shortDescription: 'Meta ambiciosa'
      }
    },
    badgeImage: {
      locked: '/badges/ambitious-locked.png',
      unlocked: '/badges/ambitious-unlocked.png'
    },
    icon: '🚀',
    iconColor: '#06B6D4',
    category: 'goal',
    points: 75,
    rarity: 'rare',
    order: 190,
    criteria: { type: 'custom', params: { requirement: 'complete20HourGoal' } },
    isActive: true,
    isSecret: false
  },

  // ============================================
  // WEIGHT CATEGORY (8 achievements)
  // ============================================
  {
    achievementId: 'weight-tracker',
    translations: {
      en: {
        name: 'Weight Tracker',
        description: 'Log your weight for the first time',
        shortDescription: 'First weight log'
      },
      es: {
        name: 'Rastreador de Peso',
        description: 'Registra tu peso por primera vez',
        shortDescription: 'Primer registro de peso'
      }
    },
    badgeImage: {
      locked: '/badges/weight-tracker-locked.png',
      unlocked: '/badges/weight-tracker-unlocked.png'
    },
    icon: '⚖️',
    iconColor: '#8B5CF6',
    category: 'weight',
    points: 5,
    rarity: 'common',
    order: 195,
    criteria: { type: 'custom', params: { requirement: 'logFirstWeight' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'five-pounds',
    translations: {
      en: {
        name: 'Five Pound Victory',
        description: 'Lose 5 pounds',
        shortDescription: '5 lbs lost'
      },
      es: {
        name: 'Victoria de Cinco Libras',
        description: 'Pierde 5 libras',
        shortDescription: '5 lbs perdidas'
      }
    },
    badgeImage: {
      locked: '/badges/five-pounds-locked.png',
      unlocked: '/badges/five-pounds-unlocked.png'
    },
    icon: '🎉',
    iconColor: '#8B5CF6',
    category: 'weight',
    points: 20,
    rarity: 'common',
    order: 200,
    criteria: { type: 'custom', params: { requirement: 'lose5Pounds' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'ten-pounds',
    translations: {
      en: {
        name: 'Ten Pound Triumph',
        description: 'Lose 10 pounds',
        shortDescription: '10 lbs lost'
      },
      es: {
        name: 'Triunfo de Diez Libras',
        description: 'Pierde 10 libras',
        shortDescription: '10 lbs perdidas'
      }
    },
    badgeImage: {
      locked: '/badges/ten-pounds-locked.png',
      unlocked: '/badges/ten-pounds-unlocked.png'
    },
    icon: '🎊',
    iconColor: '#8B5CF6',
    category: 'weight',
    points: 20,
    rarity: 'common',
    order: 205,
    criteria: { type: 'custom', params: { requirement: 'lose10Pounds' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'twentyfive-pounds',
    translations: {
      en: {
        name: 'Twenty Five Pound Champion',
        description: 'Lose 25 pounds',
        shortDescription: '25 lbs lost'
      },
      es: {
        name: 'Campeón de Veinticinco Libras',
        description: 'Pierde 25 libras',
        shortDescription: '25 lbs perdidas'
      }
    },
    badgeImage: {
      locked: '/badges/twentyfive-pounds-locked.png',
      unlocked: '/badges/twentyfive-pounds-unlocked.png'
    },
    icon: '🏆',
    iconColor: '#8B5CF6',
    category: 'weight',
    points: 25,
    rarity: 'common',
    order: 210,
    criteria: { type: 'custom', params: { requirement: 'lose25Pounds' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'fifty-pounds',
    translations: {
      en: {
        name: 'Fifty Pound Hero',
        description: 'Lose 50 pounds',
        shortDescription: '50 lbs lost'
      },
      es: {
        name: 'Héroe de Cincuenta Libras',
        description: 'Pierde 50 libras',
        shortDescription: '50 lbs perdidas'
      }
    },
    badgeImage: {
      locked: '/badges/fifty-pounds-locked.png',
      unlocked: '/badges/fifty-pounds-unlocked.png'
    },
    icon: '💪',
    iconColor: '#8B5CF6',
    category: 'weight',
    points: 75,
    rarity: 'rare',
    order: 215,
    criteria: { type: 'custom', params: { requirement: 'lose50Pounds' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'seventyfive-pounds',
    translations: {
      en: {
        name: 'Seventy Five Pound Legend',
        description: 'Lose 75 pounds',
        shortDescription: '75 lbs lost'
      },
      es: {
        name: 'Leyenda de Setenta y Cinco Libras',
        description: 'Pierde 75 libras',
        shortDescription: '75 lbs perdidas'
      }
    },
    badgeImage: {
      locked: '/badges/seventyfive-pounds-locked.png',
      unlocked: '/badges/seventyfive-pounds-unlocked.png'
    },
    icon: '🌟',
    iconColor: '#8B5CF6',
    category: 'weight',
    points: 50,
    rarity: 'rare',
    order: 220,
    criteria: { type: 'custom', params: { requirement: 'lose75Pounds' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'hundred-pounds',
    translations: {
      en: {
        name: 'Hundred Pound Titan',
        description: 'Lose 100 pounds',
        shortDescription: '100 lbs lost'
      },
      es: {
        name: 'Titán de Cien Libras',
        description: 'Pierde 100 libras',
        shortDescription: '100 lbs perdidas'
      }
    },
    badgeImage: {
      locked: '/badges/hundred-pounds-locked.png',
      unlocked: '/badges/hundred-pounds-unlocked.png'
    },
    icon: '👑',
    iconColor: '#8B5CF6',
    category: 'weight',
    points: 75,
    rarity: 'rare',
    order: 225,
    criteria: { type: 'custom', params: { requirement: 'lose100Pounds' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'goal-weight',
    translations: {
      en: {
        name: 'Goal Weight Achieved',
        description: 'Reach your target weight goal',
        shortDescription: 'Goal weight'
      },
      es: {
        name: 'Peso Meta Alcanzado',
        description: 'Alcanza tu meta de peso objetivo',
        shortDescription: 'Peso meta'
      }
    },
    badgeImage: {
      locked: '/badges/goal-weight-locked.png',
      unlocked: '/badges/goal-weight-unlocked.png'
    },
    icon: '🎯',
    iconColor: '#8B5CF6',
    category: 'weight',
    points: 75,
    rarity: 'rare',
    order: 230,
    criteria: { type: 'custom', params: { requirement: 'reachGoalWeight' } },
    isActive: true,
    isSecret: false
  },

  // ============================================
  // CONSISTENCY CATEGORY (12 achievements)
  // ============================================
  {
    achievementId: 'weekend-warrior',
    translations: {
      en: {
        name: 'Weekend Warrior',
        description: 'Fast on both Saturday and Sunday',
        shortDescription: 'Weekend fast'
      },
      es: {
        name: 'Guerrero del Fin de Semana',
        description: 'Ayuna tanto el sábado como el domingo',
        shortDescription: 'Ayuno de fin de semana'
      }
    },
    badgeImage: {
      locked: '/badges/weekend-warrior-locked.png',
      unlocked: '/badges/weekend-warrior-unlocked.png'
    },
    icon: '🏖️',
    iconColor: '#06B6D4',
    category: 'consistency',
    points: 10,
    rarity: 'common',
    order: 235,
    criteria: { type: 'custom', params: { requirement: 'fastBothWeekendDays' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'weekday-champion',
    translations: {
      en: {
        name: 'Weekday Champion',
        description: 'Fast Monday through Friday in one week',
        shortDescription: 'Weekday fast'
      },
      es: {
        name: 'Campeón de Días Laborales',
        description: 'Ayuna de lunes a viernes en una semana',
        shortDescription: 'Ayuno de días laborales'
      }
    },
    badgeImage: {
      locked: '/badges/weekday-champion-locked.png',
      unlocked: '/badges/weekday-champion-unlocked.png'
    },
    icon: '💼',
    iconColor: '#06B6D4',
    category: 'consistency',
    points: 30,
    rarity: 'rare',
    order: 240,
    criteria: { type: 'custom', params: { requirement: 'fastAllWeekdays' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'perfect-week',
    translations: {
      en: {
        name: 'Perfect Week',
        description: 'Fast every day for a full week',
        shortDescription: '7/7 days'
      },
      es: {
        name: 'Semana Perfecta',
        description: 'Ayuna todos los días durante una semana completa',
        shortDescription: '7/7 días'
      }
    },
    badgeImage: {
      locked: '/badges/perfect-week-locked.png',
      unlocked: '/badges/perfect-week-unlocked.png'
    },
    icon: '✨',
    iconColor: '#06B6D4',
    category: 'consistency',
    points: 60,
    rarity: 'rare',
    order: 245,
    criteria: { type: 'custom', params: { requirement: 'fastAllSevenDays' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'early-bird',
    translations: {
      en: {
        name: 'Early Bird',
        description: 'Start 10 fasts before 6 AM',
        shortDescription: '10 early starts'
      },
      es: {
        name: 'Madrugador',
        description: 'Comienza 10 ayunos antes de las 6 AM',
        shortDescription: '10 inicios tempranos'
      }
    },
    badgeImage: {
      locked: '/badges/early-bird-locked.png',
      unlocked: '/badges/early-bird-unlocked.png'
    },
    icon: '🌅',
    iconColor: '#06B6D4',
    category: 'consistency',
    points: 20,
    rarity: 'common',
    order: 250,
    criteria: { type: 'custom', params: { requirement: 'tenEarlyStarts' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'night-owl',
    translations: {
      en: {
        name: 'Night Owl',
        description: 'Start 10 fasts after 10 PM',
        shortDescription: '10 late starts'
      },
      es: {
        name: 'Búho Nocturno',
        description: 'Comienza 10 ayunos después de las 10 PM',
        shortDescription: '10 inicios tardíos'
      }
    },
    badgeImage: {
      locked: '/badges/night-owl-locked.png',
      unlocked: '/badges/night-owl-unlocked.png'
    },
    icon: '🦉',
    iconColor: '#06B6D4',
    category: 'consistency',
    points: 35,
    rarity: 'rare',
    order: 255,
    criteria: { type: 'custom', params: { requirement: 'tenLateStarts' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'sixteen-hour-standard',
    translations: {
      en: {
        name: 'Sixteen Hour Standard',
        description: 'Complete 20 fasts of 16+ hours',
        shortDescription: '20 x 16+ hrs'
      },
      es: {
        name: 'Estándar de Dieciséis Horas',
        description: 'Completa 20 ayunos de 16+ horas',
        shortDescription: '20 x 16+ hrs'
      }
    },
    badgeImage: {
      locked: '/badges/sixteen-standard-locked.png',
      unlocked: '/badges/sixteen-standard-unlocked.png'
    },
    icon: '📊',
    iconColor: '#06B6D4',
    category: 'consistency',
    points: 25,
    rarity: 'common',
    order: 260,
    criteria: { type: 'custom', params: { requirement: 'twenty16HourFasts' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'eighteen-hour-routine',
    translations: {
      en: {
        name: 'Eighteen Hour Routine',
        description: 'Complete 15 fasts of 18+ hours',
        shortDescription: '15 x 18+ hrs'
      },
      es: {
        name: 'Rutina de Dieciocho Horas',
        description: 'Completa 15 ayunos de 18+ horas',
        shortDescription: '15 x 18+ hrs'
      }
    },
    badgeImage: {
      locked: '/badges/eighteen-routine-locked.png',
      unlocked: '/badges/eighteen-routine-unlocked.png'
    },
    icon: '🔄',
    iconColor: '#06B6D4',
    category: 'consistency',
    points: 80,
    rarity: 'epic',
    order: 265,
    criteria: { type: 'custom', params: { requirement: 'fifteen18HourFasts' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'omad-master',
    translations: {
      en: {
        name: 'OMAD Master',
        description: 'Complete 10 one-meal-a-day (23+ hour) fasts',
        shortDescription: '10 OMAD fasts'
      },
      es: {
        name: 'Maestro OMAD',
        description: 'Completa 10 ayunos de una comida al día (23+ horas)',
        shortDescription: '10 ayunos OMAD'
      }
    },
    badgeImage: {
      locked: '/badges/omad-master-locked.png',
      unlocked: '/badges/omad-master-unlocked.png'
    },
    icon: '🍽️',
    iconColor: '#06B6D4',
    category: 'consistency',
    points: 75,
    rarity: 'rare',
    order: 270,
    criteria: { type: 'custom', params: { requirement: 'tenOMADFasts' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'monthly-milestones',
    translations: {
      en: {
        name: 'Monthly Milestones',
        description: 'Fast at least 20 days in a calendar month',
        shortDescription: '20 days/month'
      },
      es: {
        name: 'Hitos Mensuales',
        description: 'Ayuna al menos 20 días en un mes calendario',
        shortDescription: '20 días/mes'
      }
    },
    badgeImage: {
      locked: '/badges/monthly-milestones-locked.png',
      unlocked: '/badges/monthly-milestones-unlocked.png'
    },
    icon: '📅',
    iconColor: '#06B6D4',
    category: 'consistency',
    points: 75,
    rarity: 'rare',
    order: 275,
    criteria: { type: 'custom', params: { requirement: 'twentyDaysInMonth' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'quarterly-champion',
    translations: {
      en: {
        name: 'Quarterly Champion',
        description: 'Fast at least 60 days in a 90-day period',
        shortDescription: '60/90 days'
      },
      es: {
        name: 'Campeón Trimestral',
        description: 'Ayuna al menos 60 días en un período de 90 días',
        shortDescription: '60/90 días'
      }
    },
    badgeImage: {
      locked: '/badges/quarterly-champion-locked.png',
      unlocked: '/badges/quarterly-champion-unlocked.png'
    },
    icon: '📈',
    iconColor: '#06B6D4',
    category: 'consistency',
    points: 75,
    rarity: 'rare',
    order: 280,
    criteria: { type: 'custom', params: { requirement: 'sixtyDaysInQuarter' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'yearly-legend',
    translations: {
      en: {
        name: 'Yearly Legend',
        description: 'Fast at least 300 days in a calendar year',
        shortDescription: '300/365 days'
      },
      es: {
        name: 'Leyenda Anual',
        description: 'Ayuna al menos 300 días en un año calendario',
        shortDescription: '300/365 días'
      }
    },
    badgeImage: {
      locked: '/badges/yearly-legend-locked.png',
      unlocked: '/badges/yearly-legend-unlocked.png'
    },
    icon: '🏆',
    iconColor: '#06B6D4',
    category: 'consistency',
    points: 300,
    rarity: 'legendary',
    order: 285,
    criteria: { type: 'custom', params: { requirement: 'threehundredDaysInYear' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'century-club',
    translations: {
      en: {
        name: 'Century Club',
        description: 'Complete 100 total fasting entries',
        shortDescription: '100 total'
      },
      es: {
        name: 'Club del Centenario',
        description: 'Completa 100 entradas de ayuno en total',
        shortDescription: '100 total'
      }
    },
    badgeImage: {
      locked: '/badges/century-club-locked.png',
      unlocked: '/badges/century-club-unlocked.png'
    },
    icon: '💯',
    iconColor: '#06B6D4',
    category: 'consistency',
    points: 100,
    rarity: 'epic',
    order: 290,
    criteria: { type: 'entry-count', params: { count: 100 } },
    isActive: true,
    isSecret: false
  },

  // ============================================
  // SPECIAL CATEGORY (15 achievements)
  // ============================================
  {
    achievementId: 'birthday-faster',
    translations: {
      en: {
        name: 'Birthday Faster',
        description: 'Fast on your birthday',
        shortDescription: 'Birthday fast'
      },
      es: {
        name: 'Ayunador de Cumpleaños',
        description: 'Ayuna en tu cumpleaños',
        shortDescription: 'Ayuno de cumpleaños'
      }
    },
    badgeImage: {
      locked: '/badges/birthday-faster-locked.png',
      unlocked: '/badges/birthday-faster-unlocked.png'
    },
    icon: '🎂',
    iconColor: '#EC4899',
    category: 'special',
    points: 50,
    rarity: 'rare',
    order: 295,
    criteria: { type: 'custom', params: { requirement: 'fastOnBirthday' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'holiday-dedication',
    translations: {
      en: {
        name: 'Holiday Dedication',
        description: 'Fast on a major holiday',
        shortDescription: 'Holiday fast'
      },
      es: {
        name: 'Dedicación Festiva',
        description: 'Ayuna en un día festivo importante',
        shortDescription: 'Ayuno festivo'
      }
    },
    badgeImage: {
      locked: '/badges/holiday-dedication-locked.png',
      unlocked: '/badges/holiday-dedication-unlocked.png'
    },
    icon: '🎄',
    iconColor: '#EC4899',
    category: 'special',
    points: 25,
    rarity: 'common',
    order: 300,
    criteria: { type: 'custom', params: { requirement: 'fastOnHoliday' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'new-year-resolution',
    translations: {
      en: {
        name: 'New Year Resolution',
        description: 'Start fasting on January 1st',
        shortDescription: 'Jan 1 fast'
      },
      es: {
        name: 'Resolución de Año Nuevo',
        description: 'Comienza a ayunar el 1 de enero',
        shortDescription: 'Ayuno 1 de ene'
      }
    },
    badgeImage: {
      locked: '/badges/new-year-locked.png',
      unlocked: '/badges/new-year-unlocked.png'
    },
    icon: '🎆',
    iconColor: '#EC4899',
    category: 'special',
    points: 30,
    rarity: 'rare',
    order: 305,
    criteria: { type: 'custom', params: { requirement: 'fastJanuary1' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'midnight-faster',
    translations: {
      en: {
        name: 'Midnight Faster',
        description: 'Start a fast exactly at midnight',
        shortDescription: 'Midnight start'
      },
      es: {
        name: 'Ayunador de Medianoche',
        description: 'Comienza un ayuno exactamente a medianoche',
        shortDescription: 'Inicio a medianoche'
      }
    },
    badgeImage: {
      locked: '/badges/midnight-faster-locked.png',
      unlocked: '/badges/midnight-faster-unlocked.png'
    },
    icon: '🌙',
    iconColor: '#EC4899',
    category: 'special',
    points: 10,
    rarity: 'common',
    order: 310,
    criteria: { type: 'custom', params: { requirement: 'startAtMidnight' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'social-sharer',
    translations: {
      en: {
        name: 'Social Sharer',
        description: 'Share your achievement on social media',
        shortDescription: 'Social share'
      },
      es: {
        name: 'Compartidor Social',
        description: 'Comparte tu logro en redes sociales',
        shortDescription: 'Compartir social'
      }
    },
    badgeImage: {
      locked: '/badges/social-sharer-locked.png',
      unlocked: '/badges/social-sharer-unlocked.png'
    },
    icon: '📱',
    iconColor: '#EC4899',
    category: 'special',
    points: 10,
    rarity: 'common',
    order: 315,
    criteria: { type: 'custom', params: { requirement: 'shareOnSocial' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'profile-perfectionist',
    translations: {
      en: {
        name: 'Profile Perfectionist',
        description: 'Complete your profile with all information',
        shortDescription: 'Complete profile'
      },
      es: {
        name: 'Perfeccionista de Perfil',
        description: 'Completa tu perfil con toda la información',
        shortDescription: 'Perfil completo'
      }
    },
    badgeImage: {
      locked: '/badges/profile-perfectionist-locked.png',
      unlocked: '/badges/profile-perfectionist-unlocked.png'
    },
    icon: '👤',
    iconColor: '#EC4899',
    category: 'special',
    points: 15,
    rarity: 'common',
    order: 320,
    criteria: { type: 'custom', params: { requirement: 'completeProfile' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'motivational-note',
    translations: {
      en: {
        name: 'Motivational Note',
        description: 'Add personal notes to 10 fasting entries',
        shortDescription: '10 notes'
      },
      es: {
        name: 'Nota Motivacional',
        description: 'Agrega notas personales a 10 entradas de ayuno',
        shortDescription: '10 notas'
      }
    },
    badgeImage: {
      locked: '/badges/motivational-note-locked.png',
      unlocked: '/badges/motivational-note-unlocked.png'
    },
    icon: '📝',
    iconColor: '#EC4899',
    category: 'special',
    points: 15,
    rarity: 'common',
    order: 325,
    criteria: { type: 'custom', params: { requirement: 'tenNotesAdded' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'sunrise-finisher',
    translations: {
      en: {
        name: 'Sunrise Finisher',
        description: 'End a fast at sunrise (5-7 AM)',
        shortDescription: 'Sunrise end'
      },
      es: {
        name: 'Finalizador del Amanecer',
        description: 'Termina un ayuno al amanecer (5-7 AM)',
        shortDescription: 'Fin al amanecer'
      }
    },
    badgeImage: {
      locked: '/badges/sunrise-finisher-locked.png',
      unlocked: '/badges/sunrise-finisher-unlocked.png'
    },
    icon: '🌄',
    iconColor: '#EC4899',
    category: 'special',
    points: 10,
    rarity: 'common',
    order: 330,
    criteria: { type: 'custom', params: { requirement: 'endAtSunrise' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'comeback-champion',
    translations: {
      en: {
        name: 'Comeback Champion',
        description: 'Return to fasting after a 30+ day break',
        shortDescription: 'Comeback'
      },
      es: {
        name: 'Campeón del Regreso',
        description: 'Vuelve al ayuno después de una pausa de 30+ días',
        shortDescription: 'Regreso'
      }
    },
    badgeImage: {
      locked: '/badges/comeback-champion-locked.png',
      unlocked: '/badges/comeback-champion-unlocked.png'
    },
    icon: '↩️',
    iconColor: '#EC4899',
    category: 'special',
    points: 25,
    rarity: 'common',
    order: 335,
    criteria: { type: 'custom', params: { requirement: 'comebackAfter30Days' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'secret-hunter',
    translations: {
      en: {
        name: 'Secret Hunter',
        description: 'Unlock 5 secret achievements',
        shortDescription: '5 secrets'
      },
      es: {
        name: 'Cazador de Secretos',
        description: 'Desbloquea 5 logros secretos',
        shortDescription: '5 secretos'
      }
    },
    badgeImage: {
      locked: '/badges/secret-hunter-locked.png',
      unlocked: '/badges/secret-hunter-unlocked.png'
    },
    icon: '🔍',
    iconColor: '#EC4899',
    category: 'special',
    points: 25,
    rarity: 'common',
    order: 340,
    criteria: { type: 'custom', params: { requirement: 'fiveSecretAchievements' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'all-rounder',
    translations: {
      en: {
        name: 'All Rounder',
        description: 'Earn at least one achievement from every category',
        shortDescription: 'All categories'
      },
      es: {
        name: 'Todoterreno',
        description: 'Gana al menos un logro de cada categoría',
        shortDescription: 'Todas las categorías'
      }
    },
    badgeImage: {
      locked: '/badges/all-rounder-locked.png',
      unlocked: '/badges/all-rounder-unlocked.png'
    },
    icon: '🌈',
    iconColor: '#EC4899',
    category: 'special',
    points: 100,
    rarity: 'epic',
    order: 345,
    criteria: { type: 'custom', params: { requirement: 'oneFromEachCategory' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'completionist',
    translations: {
      en: {
        name: 'Completionist',
        description: 'Unlock all non-secret achievements',
        shortDescription: 'All unlocked'
      },
      es: {
        name: 'Completista',
        description: 'Desbloquea todos los logros no secretos',
        shortDescription: 'Todos desbloqueados'
      }
    },
    badgeImage: {
      locked: '/badges/completionist-locked.png',
      unlocked: '/badges/completionist-unlocked.png'
    },
    icon: '🏅',
    iconColor: '#EC4899',
    category: 'special',
    points: 150,
    rarity: 'epic',
    order: 350,
    criteria: { type: 'custom', params: { requirement: 'allNonSecretAchievements' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'master-faster',
    translations: {
      en: {
        name: 'Master Faster',
        description: 'Unlock ALL achievements including secrets',
        shortDescription: 'Complete master'
      },
      es: {
        name: 'Maestro del Ayuno',
        description: 'Desbloquea TODOS los logros incluyendo secretos',
        shortDescription: 'Maestro completo'
      }
    },
    badgeImage: {
      locked: '/badges/master-faster-locked.png',
      unlocked: '/badges/master-faster-unlocked.png'
    },
    icon: '🎖️',
    iconColor: '#EC4899',
    category: 'special',
    points: 500,
    rarity: 'legendary',
    order: 355,
    criteria: { type: 'custom', params: { requirement: 'allAchievements' } },
    isActive: true,
    isSecret: true
  },
  {
    achievementId: 'lucky-thirteen',
    translations: {
      en: {
        name: 'Lucky Thirteen',
        description: 'Complete a 13-hour fast on Friday the 13th',
        shortDescription: 'Friday 13th'
      },
      es: {
        name: 'Trece de Suerte',
        description: 'Completa un ayuno de 13 horas en viernes 13',
        shortDescription: 'Viernes 13'
      }
    },
    badgeImage: {
      locked: '/badges/lucky-thirteen-locked.png',
      unlocked: '/badges/lucky-thirteen-unlocked.png'
    },
    icon: '🍀',
    iconColor: '#EC4899',
    category: 'special',
    points: 100,
    rarity: 'epic',
    order: 360,
    criteria: { type: 'custom', params: { requirement: 'fastFriday13th' } },
    isActive: true,
    isSecret: true
  },
  {
    achievementId: 'night-stalker',
    translations: {
      en: {
        name: 'Night Stalker',
        description: 'Complete a 48+ hour fast that spans two midnights',
        shortDescription: 'Two midnights'
      },
      es: {
        name: 'Acechador Nocturno',
        description: 'Completa un ayuno de 48+ horas que abarque dos medianoches',
        shortDescription: 'Dos medianoches'
      }
    },
    badgeImage: {
      locked: '/badges/night-stalker-locked.png',
      unlocked: '/badges/night-stalker-unlocked.png'
    },
    icon: '🦇',
    iconColor: '#EC4899',
    category: 'special',
    points: 100,
    rarity: 'epic',
    order: 365,
    criteria: { type: 'custom', params: { requirement: 'twoMidnightFast' } },
    isActive: true,
    isSecret: true
  },

  // ============================================
  // KNOWLEDGE CATEGORY (8 achievements)
  // ============================================
  {
    achievementId: 'faq-explorer',
    translations: {
      en: {
        name: 'FAQ Explorer',
        description: 'Read 5 FAQ articles about fasting',
        shortDescription: '5 FAQs read'
      },
      es: {
        name: 'Explorador de Preguntas',
        description: 'Lee 5 artículos de preguntas frecuentes sobre ayuno',
        shortDescription: '5 preguntas leídas'
      }
    },
    badgeImage: {
      locked: '/badges/faq-explorer-locked.png',
      unlocked: '/badges/faq-explorer-unlocked.png'
    },
    icon: '📚',
    iconColor: '#10B981',
    category: 'knowledge',
    points: 15,
    rarity: 'common',
    order: 370,
    criteria: { type: 'custom', params: { requirement: 'readFiveFAQs' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'knowledge-seeker',
    translations: {
      en: {
        name: 'Knowledge Seeker',
        description: 'Read 10 FAQ articles about fasting',
        shortDescription: '10 FAQs read'
      },
      es: {
        name: 'Buscador de Conocimiento',
        description: 'Lee 10 artículos de preguntas frecuentes sobre ayuno',
        shortDescription: '10 preguntas leídas'
      }
    },
    badgeImage: {
      locked: '/badges/knowledge-seeker-locked.png',
      unlocked: '/badges/knowledge-seeker-unlocked.png'
    },
    icon: '🔍',
    iconColor: '#10B981',
    category: 'knowledge',
    points: 20,
    rarity: 'common',
    order: 375,
    criteria: { type: 'custom', params: { requirement: 'readTenFAQs' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'autophagy-aware',
    translations: {
      en: {
        name: 'Autophagy Aware',
        description: 'Learn about autophagy by reading the FAQ',
        shortDescription: 'Autophagy FAQ'
      },
      es: {
        name: 'Consciente de Autofagia',
        description: 'Aprende sobre autofagia leyendo las preguntas frecuentes',
        shortDescription: 'Preguntas de autofagia'
      }
    },
    badgeImage: {
      locked: '/badges/autophagy-aware-locked.png',
      unlocked: '/badges/autophagy-aware-unlocked.png'
    },
    icon: '🧬',
    iconColor: '#10B981',
    category: 'knowledge',
    points: 20,
    rarity: 'common',
    order: 380,
    criteria: { type: 'custom', params: { requirement: 'readAutophagyFAQ' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'safety-first',
    translations: {
      en: {
        name: 'Safety First',
        description: 'Read safety guidelines and contraindications',
        shortDescription: 'Safety guide'
      },
      es: {
        name: 'Seguridad Primero',
        description: 'Lee las pautas de seguridad y contraindicaciones',
        shortDescription: 'Guía de seguridad'
      }
    },
    badgeImage: {
      locked: '/badges/safety-first-locked.png',
      unlocked: '/badges/safety-first-unlocked.png'
    },
    icon: '🛡️',
    iconColor: '#10B981',
    category: 'knowledge',
    points: 30,
    rarity: 'rare',
    order: 385,
    criteria: { type: 'custom', params: { requirement: 'readSafetyGuidelines' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'hydration-hero',
    translations: {
      en: {
        name: 'Hydration Hero',
        description: 'Learn about proper hydration during fasting',
        shortDescription: 'Hydration FAQ'
      },
      es: {
        name: 'Héroe de Hidratación',
        description: 'Aprende sobre hidratación adecuada durante el ayuno',
        shortDescription: 'Preguntas de hidratación'
      }
    },
    badgeImage: {
      locked: '/badges/hydration-hero-locked.png',
      unlocked: '/badges/hydration-hero-unlocked.png'
    },
    icon: '💧',
    iconColor: '#10B981',
    category: 'knowledge',
    points: 25,
    rarity: 'common',
    order: 390,
    criteria: { type: 'custom', params: { requirement: 'readHydrationFAQ' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'method-master',
    translations: {
      en: {
        name: 'Method Master',
        description: 'Learn about different fasting methods (16:8, OMAD, etc.)',
        shortDescription: 'Methods FAQ'
      },
      es: {
        name: 'Maestro de Métodos',
        description: 'Aprende sobre diferentes métodos de ayuno (16:8, OMAD, etc.)',
        shortDescription: 'Preguntas de métodos'
      }
    },
    badgeImage: {
      locked: '/badges/method-master-locked.png',
      unlocked: '/badges/method-master-unlocked.png'
    },
    icon: '📖',
    iconColor: '#10B981',
    category: 'knowledge',
    points: 35,
    rarity: 'rare',
    order: 395,
    criteria: { type: 'custom', params: { requirement: 'readMethodsFAQ' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'science-scholar',
    translations: {
      en: {
        name: 'Science Scholar',
        description: 'Read all science-based FAQ articles',
        shortDescription: 'All science FAQs'
      },
      es: {
        name: 'Erudito de Ciencia',
        description: 'Lee todos los artículos de preguntas basadas en ciencia',
        shortDescription: 'Todas las preguntas científicas'
      }
    },
    badgeImage: {
      locked: '/badges/science-scholar-locked.png',
      unlocked: '/badges/science-scholar-unlocked.png'
    },
    icon: '🔬',
    iconColor: '#10B981',
    category: 'knowledge',
    points: 50,
    rarity: 'rare',
    order: 400,
    criteria: { type: 'custom', params: { requirement: 'readAllScienceFAQs' } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'fasting-encyclopedia',
    translations: {
      en: {
        name: 'Fasting Encyclopedia',
        description: 'Read every single FAQ article available',
        shortDescription: 'All FAQs'
      },
      es: {
        name: 'Enciclopedia del Ayuno',
        description: 'Lee cada artículo de preguntas frecuentes disponible',
        shortDescription: 'Todas las preguntas'
      }
    },
    badgeImage: {
      locked: '/badges/fasting-encyclopedia-locked.png',
      unlocked: '/badges/fasting-encyclopedia-unlocked.png'
    },
    icon: '📜',
    iconColor: '#10B981',
    category: 'knowledge',
    points: 100,
    rarity: 'epic',
    order: 405,
    criteria: { type: 'custom', params: { requirement: 'readAllFAQs' } },
    isActive: true,
    isSecret: false
  }
];

// CommonJS export for Jest compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { achievementsData };
}
