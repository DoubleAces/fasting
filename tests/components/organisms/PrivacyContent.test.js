/**
 * @jest-environment jsdom
 */

import { render, screen, within } from '@testing-library/react';
import PrivacyContent from '@/components/organisms/PrivacyContent';

// Mock PrivacySection component
jest.mock('@/components/atoms/PrivacySection', () => {
  return function MockPrivacySection({ id, title, children }) {
    return (
      <section data-testid={`section-${id}`}>
        <h2 id={id}>{title}</h2>
        <div>{children}</div>
      </section>
    );
  };
});

describe('PrivacyContent', () => {
  describe('Metadata', () => {
    it('should display effective date', () => {
      render(<PrivacyContent />);
      
      expect(screen.getByText(/Effective Date:/i)).toBeInTheDocument();
      // Date appears multiple times, just check it exists
      const dates = screen.getAllByText(/October 21, 2025/);
      expect(dates.length).toBeGreaterThan(0);
    });

    it('should display last updated date', () => {
      render(<PrivacyContent />);
      
      // "Last Updated" appears multiple times, just check it exists
      const lastUpdatedLabels = screen.getAllByText(/Last Updated:/i);
      expect(lastUpdatedLabels.length).toBeGreaterThan(0);
    });
  });

  describe('Required Sections (FR-003a through FR-003j)', () => {
    it('should render all 10 required sections', () => {
      const { container } = render(<PrivacyContent />);
      
      // Check all 10 section IDs are present
      const expectedSections = [
        'information-we-collect',
        'how-we-use-your-information',
        'data-storage-and-security',
        'data-sharing-and-disclosure',
        'your-privacy-rights',
        'cookies-and-tracking',
        'health-information',
        'childrens-privacy',
        'international-users',
        'contact-information',
      ];
      
      expectedSections.forEach((sectionId) => {
        const section = container.querySelector(`[data-testid="section-${sectionId}"]`);
        expect(section).toBeInTheDocument();
      });
    });

    it('should have unique section IDs', () => {
      const { container } = render(<PrivacyContent />);
      
      const sections = container.querySelectorAll('section[data-testid^="section-"]');
      const ids = Array.from(sections).map(s => s.getAttribute('data-testid'));
      const uniqueIds = new Set(ids);
      
      expect(ids.length).toBe(uniqueIds.size);
      expect(ids.length).toBe(10);
    });
  });

  describe('Section Content', () => {
    it('should include "Information We Collect" section (FR-003a)', () => {
      render(<PrivacyContent />);
      
      expect(screen.getByText('Information We Collect')).toBeInTheDocument();
      // Check for specific content unique to this section
      expect(screen.getByText(/Third-Party Authentication:/)).toBeInTheDocument();
    });

    it('should include "How We Use Your Information" section (FR-003b)', () => {
      render(<PrivacyContent />);
      
      expect(screen.getByText('How We Use Your Information')).toBeInTheDocument();
    });

    it('should include "Data Storage and Security" section (FR-003c)', () => {
      render(<PrivacyContent />);
      
      expect(screen.getByText('Data Storage and Security')).toBeInTheDocument();
    });

    it('should include "Data Sharing and Disclosure" section (FR-003d)', () => {
      render(<PrivacyContent />);
      
      expect(screen.getByText('Data Sharing and Disclosure')).toBeInTheDocument();
    });

    it('should include "Your Privacy Rights" section (FR-003e)', () => {
      render(<PrivacyContent />);
      
      expect(screen.getByText('Your Privacy Rights')).toBeInTheDocument();
    });

    it('should include "Cookies and Tracking" section (FR-003f)', () => {
      render(<PrivacyContent />);
      
      expect(screen.getByText('Cookies and Tracking')).toBeInTheDocument();
    });

    it('should include "Health Information" section (FR-003g)', () => {
      render(<PrivacyContent />);
      
      // Use the exact heading text which is unique
      const healthHeading = screen.getByRole('heading', { name: /Health Information/i });
      expect(healthHeading).toBeInTheDocument();
    });

    it('should include "Children\'s Privacy" section (FR-003h)', () => {
      render(<PrivacyContent />);
      
      expect(screen.getByText(/Children.*Privacy/i)).toBeInTheDocument();
    });

    it('should include "International Users" section (FR-003i)', () => {
      render(<PrivacyContent />);
      
      expect(screen.getByText('International Users')).toBeInTheDocument();
    });

    it('should include "Contact Information" section (FR-003j)', () => {
      render(<PrivacyContent />);
      
      expect(screen.getByText('Contact Information')).toBeInTheDocument();
      // Check for section presence, email appears multiple times
      const contactSection = screen.getByTestId('section-contact-information');
      expect(contactSection).toBeInTheDocument();
    });
  });

  describe('Health Information Disclaimer', () => {
    it('should include specific health data information', () => {
      render(<PrivacyContent />);
      
      // Health section should mention health-related aspects  
      const healthSection = screen.getByTestId('section-health-information');
      expect(healthSection).toBeInTheDocument();
      expect(within(healthSection).getByText(/Medical Disclaimer:/)).toBeInTheDocument();
    });
  });

  describe('GDPR/CCPA Compliance', () => {
    it('should mention user rights to access data', () => {
      render(<PrivacyContent />);
      
      const rightsSection = screen.getByTestId('section-your-privacy-rights');
      expect(within(rightsSection).getByText(/Right to access:/)).toBeInTheDocument();
    });

    it('should mention user rights to delete data', () => {
      render(<PrivacyContent />);
      
      const rightsSection = screen.getByTestId('section-your-privacy-rights');
      expect(within(rightsSection).getByText(/Right to deletion:/)).toBeInTheDocument();
    });

    it('should mention data export capability', () => {
      render(<PrivacyContent />);
      
      const rightsSection = screen.getByTestId('section-your-privacy-rights');
      expect(within(rightsSection).getByText(/Right to data portability:/)).toBeInTheDocument();
    });
  });

  describe('Contact Information', () => {
    it('should provide privacy contact email', () => {
      render(<PrivacyContent />);
      
      // Email appears multiple times, so use getAllByText
      const emails = screen.getAllByText(/privacy@fastingtracker\.app/i);
      expect(emails.length).toBeGreaterThan(0);
    });
  });
});
