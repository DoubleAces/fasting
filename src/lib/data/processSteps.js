/**
 * Process Steps Data
 * 
 * 3-step "How It Works" process demonstrating app usage flow.
 * Simple, linear progression showing barrier-to-entry reduction.
 */

const processSteps = [
  {
    id: 'set-goal',
    number: 1,
    title: 'Set Your Goal',
    description: 'Choose your fasting schedule (16:8, 18:6, or custom) and set your daily goal. No complicated setup required.',
    screenshot: '/images/homepage/steps/set-goal.png',
  },
  {
    id: 'start-timer',
    number: 2,
    title: 'Start Your Timer',
    description: 'One tap to start tracking. See your progress in real-time with a clean, intuitive interface.',
    screenshot: '/images/homepage/steps/start-timer.png',
  },
  {
    id: 'build-streak',
    number: 3,
    title: 'Build Your Streak',
    description: 'Complete fasts to build your streak. Track patterns, celebrate milestones, and watch your consistency grow.',
    screenshot: '/images/homepage/steps/build-streak.png',
  },
];

export default processSteps;
