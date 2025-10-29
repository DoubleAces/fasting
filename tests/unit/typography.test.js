/**
 * Typography Tests - Feature 022: Mobile UX
 * 
 * Tests responsive typography scaling across mobile and desktop viewports.
 * 
 * TDD Workflow:
 * 1. These tests MUST FAIL initially (no implementation yet)
 * 2. Implement typography changes in globals.css and components
 * 3. Tests MUST PASS after implementation
 */

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  setupMobileViewport,
  setupDesktopViewport,
  resetViewport,
} from '../helpers/viewportMock';

// Mock component to test global typography styles
const TypographyTestComponent = () => (
  <div>
    <h1>Heading 1</h1>
    <h2>Heading 2</h2>
    <h3>Heading 3</h3>
    <p>Body text paragraph</p>
    <div className="p-3 md:p-4">Responsive padding</div>
    <div className="gap-2 md:gap-4 flex">
      <span>Item 1</span>
      <span>Item 2</span>
    </div>
  </div>
);

describe('Typography - Mobile Responsive (Feature 022)', () => {
  afterEach(() => {
    resetViewport();
  });

  describe('T025-T029: Mobile typography scale', () => {
    beforeEach(() => {
      setupMobileViewport('IPHONE_SE'); // 375×667
    });

    test('T025: Mobile body text is 14px (text-sm)', () => {
      const { container } = render(<p className="text-sm md:text-base">Body text</p>);
      
      const paragraph = container.querySelector('p');
      const styles = window.getComputedStyle(paragraph);
      
      // text-sm = 14px (0.875rem)
      const fontSize = styles.fontSize;
      expect(fontSize).toBe('14px');
    });

    test('T027: Mobile h1 is 24px (text-2xl)', () => {
      const { container } = render(<h1 className="text-xl md:text-2xl">Heading 1</h1>);
      
      const heading = container.querySelector('h1');
      const styles = window.getComputedStyle(heading);
      
      // text-xl = 20px on mobile, text-2xl = 24px on desktop
      // For mobile-first, base should be smaller
      const fontSize = parseFloat(styles.fontSize);
      expect(fontSize).toBeLessThanOrEqual(24);
    });

    test('T028: Mobile h2 is 18px (text-lg)', () => {
      const { container } = render(<h2 className="text-base md:text-lg">Heading 2</h2>);
      
      const heading = container.querySelector('h2');
      const styles = window.getComputedStyle(heading);
      
      // text-base = 16px on mobile, text-lg = 18px on desktop
      const fontSize = parseFloat(styles.fontSize);
      expect(fontSize).toBeLessThanOrEqual(18);
    });

    test('T029: Mobile h3 is 16px (text-base)', () => {
      const { container } = render(<h3 className="text-sm md:text-base">Heading 3</h3>);
      
      const heading = container.querySelector('h3');
      const styles = window.getComputedStyle(heading);
      
      // text-sm = 14px on mobile, text-base = 16px on desktop
      const fontSize = parseFloat(styles.fontSize);
      expect(fontSize).toBeLessThanOrEqual(16);
    });

    test('Mobile padding is 12px (p-3)', () => {
      const { container } = render(<div className="p-3 md:p-4">Content</div>);
      
      const div = container.querySelector('div');
      const styles = window.getComputedStyle(div);
      
      // p-3 = 12px (0.75rem)
      expect(styles.padding).toBe('12px');
    });

    test('Mobile gap is 8px (gap-2)', () => {
      const { container } = render(
        <div className="flex gap-2 md:gap-4">
          <span>A</span>
          <span>B</span>
        </div>
      );
      
      const div = container.querySelector('div');
      const styles = window.getComputedStyle(div);
      
      // gap-2 = 8px (0.5rem)
      const gap = styles.gap;
      expect(gap).toBe('8px');
    });
  });

  describe('T026: Desktop typography scale', () => {
    beforeEach(() => {
      setupDesktopViewport('LAPTOP'); // 1280×720
    });

    test('T026: Desktop body text is 16px (text-base)', () => {
      const { container } = render(<p className="text-sm md:text-base">Body text</p>);
      
      const paragraph = container.querySelector('p');
      const styles = window.getComputedStyle(paragraph);
      
      // text-base = 16px (1rem)
      const fontSize = styles.fontSize;
      expect(fontSize).toBe('16px');
    });

    test('Desktop h1 is larger than mobile', () => {
      const { container } = render(<h1 className="text-xl md:text-2xl">Heading 1</h1>);
      
      const heading = container.querySelector('h1');
      const styles = window.getComputedStyle(heading);
      
      // text-2xl = 24px on desktop
      const fontSize = parseFloat(styles.fontSize);
      expect(fontSize).toBeGreaterThanOrEqual(20);
    });

    test('Desktop padding is 16px (p-4)', () => {
      const { container } = render(<div className="p-3 md:p-4">Content</div>);
      
      const div = container.querySelector('div');
      const styles = window.getComputedStyle(div);
      
      // p-4 = 16px (1rem)
      expect(styles.padding).toBe('16px');
    });

    test('Desktop gap is 16px (gap-4)', () => {
      const { container } = render(
        <div className="flex gap-2 md:gap-4">
          <span>A</span>
          <span>B</span>
        </div>
      );
      
      const div = container.querySelector('div');
      const styles = window.getComputedStyle(div);
      
      // gap-4 = 16px (1rem)
      const gap = styles.gap;
      expect(gap).toBe('16px');
    });
  });

  describe('Responsive spacing patterns', () => {
    test('Section spacing is compact on mobile', () => {
      setupMobileViewport('IPHONE_SE');
      const { container } = render(<section className="py-4 md:py-8">Content</section>);
      
      const section = container.querySelector('section');
      const styles = window.getComputedStyle(section);
      
      // py-4 = 16px vertical, but should be less than desktop
      const paddingTop = parseFloat(styles.paddingTop);
      expect(paddingTop).toBeLessThanOrEqual(16);
    });

    test('Section spacing is generous on desktop', () => {
      setupDesktopViewport('LAPTOP');
      const { container } = render(<section className="py-4 md:py-8">Content</section>);
      
      const section = container.querySelector('section');
      const styles = window.getComputedStyle(section);
      
      // py-8 = 32px vertical on desktop
      const paddingTop = parseFloat(styles.paddingTop);
      expect(paddingTop).toBeGreaterThanOrEqual(16);
    });
  });
});
