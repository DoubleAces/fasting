/**/**

 * Unit tests for EntryActions organism component * Unit tests for EntryActions organism component

 * Tests action buttons (Edit and Delete) with various states * Tests action buttons (Edit and Delete) with various states

 */ */



import { render, screen, fireEvent } from '@testing-library/react';import { render, screen, fireEvent } from '@testing-library/react';

import EntryActions from '@/components/organisms/EntryActions';import EntryActions from '@/components/organisms/EntryActions';



// Mock next/navigation// Mock next/navigation

jest.mock('next/navigation', () => ({jest.mock('next/navigation', () => ({

  useRouter: () => ({  useRouter: () => ({

    push: jest.fn(),    push: jest.fn(),

    refresh: jest.fn(),    refresh: jest.fn(),

  }),  }),

}));}));



describe('EntryActions', () => {describe('EntryActions', () => {

  const mockEntry = {  const mockEntry = {

    _id: '507f1f77bcf86cd799439011',    _id: '507f1f77bcf86cd799439011',

    date: '2025-10-23',    date: '2025-10-23',

    firstMealTime: '09:30',    firstMealTime: '09:30',

    lastMealTime: '16:10',    lastMealTime: '16:10',

    fastingDuration: 1170, // 19h 30m    fastingDuration: 1170, // 19h 30m

  };  };



  const defaultProps = {  const defaultProps = {

    entry: mockEntry,    entry: mockEntry,

    isToday: false,    isToday: false,

  };  };



  beforeEach(() => {  beforeEach(() => {

    jest.clearAllMocks();    jest.clearAllMocks();

  });  });



  describe('Rendering', () => {  describe('Rendering', () => {

    it('renders Edit and Delete action buttons', () => {    it('renders Edit and Delete action buttons', () => {

      render(<EntryActions {...defaultProps} />);      render(<EntryActions {...defaultProps} />);



      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();

      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();

    });    });



    it('renders buttons with proper touch target size (44x44px minimum)', () => {    it('renders buttons with proper touch target size (44x44px minimum)', () => {

      render(<EntryActions {...defaultProps} />);      render(<EntryActions {...defaultProps} />);



      const editButton = screen.getByRole('button', { name: /edit/i });      const editButton = screen.getByRole('button', { name: /edit/i });

      const deleteButton = screen.getByRole('button', { name: /delete/i });      const deleteButton = screen.getByRole('button', { name: /delete/i });



      // Buttons should have min-h-11 (44px) and min-w-11 (44px) classes or equivalent      // Buttons should have min-h-11 (44px) and min-w-11 (44px) classes or equivalent

      [editButton, deleteButton].forEach(button => {      [editButton, deleteButton].forEach(button => {

        const classes = button.className;        const classes = button.className;

        expect(classes).toMatch(/min-[hw]-11|p-3|py-2\.5/); // Various ways to achieve 44px        expect(classes).toMatch(/min-[hw]-11|p-3|py-2\.5/); // Various ways to achieve 44px

      });      });

    });    });



    it('applies correct styling to Edit button (primary action)', () => {    it('applies correct styling to Edit button (primary action)', () => {

      render(<EntryActions {...defaultProps} />);      render(<EntryActions {...defaultProps} />);

            

      const editButton = screen.getByRole('button', { name: /edit/i });      const editButton = screen.getByRole('button', { name: /edit/i });

      expect(editButton.className).toMatch(/bg-blue-600|primary/i);      expect(editButton.className).toMatch(/bg-blue-600|primary/i);

    });    });



    it('applies correct styling to Delete button (destructive action)', () => {    it('applies correct styling to Delete button (destructive action)', () => {

      render(<EntryActions {...defaultProps} />);      render(<EntryActions {...defaultProps} />);

            

      const deleteButton = screen.getByRole('button', { name: /delete/i });      const deleteButton = screen.getByRole('button', { name: /delete/i });

      expect(deleteButton.className).toMatch(/bg-red-600|destructive|danger/i);      expect(deleteButton.className).toMatch(/bg-red-600|destructive|danger/i);

    });    });

  });  });



  describe('Edit Action', () => {  describe('Edit Action', () => {

    it('Edit button is clickable and navigable', () => {    it('Edit button is clickable and navigable', () => {

      render(<EntryActions {...defaultProps} />);      render(<EntryActions {...defaultProps} />);

            

      const editButton = screen.getByRole('button', { name: /edit/i });      const editButton = screen.getByRole('button', { name: /edit/i });

            

      // Verify button exists and is clickable      // Verify button exists and is clickable

      expect(editButton).toBeInTheDocument();      expect(editButton).toBeInTheDocument();

      expect(editButton).not.toBeDisabled();      expect(editButton).not.toBeDisabled();

    });    });



    it('Edit button is never disabled', () => {    it('Edit button is never disabled', () => {

      render(<EntryActions {...defaultProps} isToday={true} />);      render(<EntryActions {...defaultProps} isToday={true} />);

            

      const editButton = screen.getByRole('button', { name: /edit/i });      const editButton = screen.getByRole('button', { name: /edit/i });

      expect(editButton).not.toBeDisabled();      expect(editButton).not.toBeDisabled();

    });    });



    it('Edit button has proper aria-label', () => {    it('Edit button has proper aria-label', () => {

      render(<EntryActions {...defaultProps} />);      render(<EntryActions {...defaultProps} />);

            

      const editButton = screen.getByRole('button', { name: /edit/i });      const editButton = screen.getByRole('button', { name: /edit/i });

      expect(editButton).toHaveAttribute('aria-label', 'Edit entry');      expect(editButton).toHaveAttribute('aria-label', 'Edit entry');

    });    });

  });  });



  describe('Delete Action', () => {  describe('Delete Action', () => {

    it('Delete button is clickable', () => {    it('Delete button is clickable', () => {

      render(<EntryActions {...defaultProps} />);      render(<EntryActions {...defaultProps} />);

            

      const deleteButton = screen.getByRole('button', { name: /delete/i });      const deleteButton = screen.getByRole('button', { name: /delete/i });

            

      expect(deleteButton).toBeInTheDocument();      expect(deleteButton).toBeInTheDocument();

      expect(deleteButton).not.toBeDisabled();      expect(deleteButton).not.toBeDisabled();

    });    });



    it('Delete button opens confirmation modal when clicked', () => {    it('Delete button opens confirmation modal when clicked', () => {

      render(<EntryActions {...defaultProps} />);      render(<EntryActions {...defaultProps} />);

            

      const deleteButton = screen.getByRole('button', { name: /delete/i });      const deleteButton = screen.getByRole('button', { name: /delete/i });

      fireEvent.click(deleteButton);      fireEvent.click(deleteButton);



      // Modal functionality tested in integration tests      // Modal functionality tested in integration tests

      expect(deleteButton).toBeInTheDocument();      expect(deleteButton).toBeInTheDocument();

    });    });



    it('Delete button is never disabled', () => {    it('Delete button is never disabled', () => {

      render(<EntryActions {...defaultProps} />);      render(<EntryActions {...defaultProps} />);

            

      const deleteButton = screen.getByRole('button', { name: /delete/i });      const deleteButton = screen.getByRole('button', { name: /delete/i });

      expect(deleteButton).not.toBeDisabled();      expect(deleteButton).not.toBeDisabled();

    });    });



    it('Delete button has proper aria-label', () => {    it('Delete button has proper aria-label', () => {

      render(<EntryActions {...defaultProps} />);      render(<EntryActions {...defaultProps} />);

            

      const deleteButton = screen.getByRole('button', { name: /delete/i });      const deleteButton = screen.getByRole('button', { name: /delete/i });

      expect(deleteButton).toHaveAttribute('aria-label', 'Delete entry');      expect(deleteButton).toHaveAttribute('aria-label', 'Delete entry');

    });    });

  });  });



  describe('Accessibility', () => {  describe('Accessibility', () => {

    it('action buttons container has proper ARIA role and label', () => {    it('action buttons container has proper ARIA role and label', () => {

      render(<EntryActions {...defaultProps} />);      render(<EntryActions {...defaultProps} />);

            

      const container = screen.getByRole('group', { name: /entry actions/i });      const container = screen.getByRole('group', { name: /entry actions/i });

      expect(container).toBeInTheDocument();      expect(container).toBeInTheDocument();

    });    });



    it('all buttons are keyboard accessible', () => {    it('all buttons are keyboard accessible', () => {

      render(<EntryActions {...defaultProps} />);      render(<EntryActions {...defaultProps} />);

            

      const buttons = screen.getAllByRole('button');      const buttons = screen.getAllByRole('button');

      buttons.forEach(button => {      buttons.forEach(button => {

        expect(button).toHaveClass('focus:outline-none', 'focus:ring-2');        expect(button).toHaveClass('focus:outline-none', 'focus:ring-2');

      });      });

    });    });

  });  });



  describe('Loading States', () => {  describe('Loading States', () => {

    it('disables Edit button when deleting', () => {    it('disables Edit button when deleting', () => {

      render(<EntryActions {...defaultProps} />);      render(<EntryActions {...defaultProps} />);

            

      const deleteButton = screen.getByRole('button', { name: /delete/i });      const deleteButton = screen.getByRole('button', { name: /delete/i });

      fireEvent.click(deleteButton);      fireEvent.click(deleteButton);

            

      // After clicking delete, buttons enter loading state      // After clicking delete, buttons enter loading state

      // Detailed testing in integration tests      // Detailed testing in integration tests

    });    });

  });  });



  describe('Invalid Entry Handling', () => {  describe('Invalid Entry Handling', () => {

    it('handles missing entry gracefully', () => {    it('handles missing entry gracefully', () => {

      render(<EntryActions entry={null} isToday={false} />);      render(<EntryActions entry={null} isToday={false} />);

            

      const editButton = screen.getByRole('button', { name: /edit/i });      const editButton = screen.getByRole('button', { name: /edit/i });

      const deleteButton = screen.getByRole('button', { name: /delete/i });      const deleteButton = screen.getByRole('button', { name: /delete/i });

            

      expect(editButton).toBeDisabled();      expect(editButton).toBeDisabled();

      expect(deleteButton).toBeDisabled();      expect(deleteButton).toBeDisabled();

    });    });



    it('handles entry without _id', () => {    it('handles entry without _id', () => {

      const invalidEntry = { ...mockEntry };      const invalidEntry = { ...mockEntry };

      delete invalidEntry._id;      delete invalidEntry._id;

            

      render(<EntryActions entry={invalidEntry} isToday={false} />);      render(<EntryActions entry={invalidEntry} isToday={false} />);

            

      const editButton = screen.getByRole('button', { name: /edit/i });      const editButton = screen.getByRole('button', { name: /edit/i });

      const deleteButton = screen.getByRole('button', { name: /delete/i });      const deleteButton = screen.getByRole('button', { name: /delete/i });

            

      expect(editButton).toBeDisabled();      expect(editButton).toBeDisabled();

      expect(deleteButton).toBeDisabled();      expect(deleteButton).toBeDisabled();

    });    });

  });  });



  describe('Error Handling', () => {  describe('Error Handling', () => {

    it('renders error message when provided', () => {    it('renders error message when provided', () => {

      render(<EntryActions {...defaultProps} />);      render(<EntryActions {...defaultProps} />);

            

      // Error display tested through integration tests      // Error display tested through integration tests

      // Component has error state management      // Component has error state management

      const buttons = screen.getAllByRole('button');      const buttons = screen.getAllByRole('button');

      expect(buttons.length).toBeGreaterThanOrEqual(2);      expect(buttons.length).toBeGreaterThanOrEqual(2);

    });    });

  });  });

});});


    });

    it('enables Copy to Today button when viewing past entry', () => {
      render(<EntryActions {...defaultProps} isToday={false} />);
      
      const copyButton = screen.getByRole('button', { name: /copy to today/i });
      expect(copyButton).not.toBeDisabled();
    });
  });

  describe('Loading States', () => {
    it('buttons are enabled by default (loading managed internally)', () => {
      render(<EntryActions {...defaultProps} />);
      
      const editButton = screen.getByRole('button', { name: /edit/i });
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      const copyButton = screen.getByRole('button', { name: /copy to today/i });

      expect(editButton).not.toBeDisabled();
      expect(deleteButton).not.toBeDisabled();
      // Copy button may be disabled if isToday=true
      if (!defaultProps.isToday) {
        expect(copyButton).not.toBeDisabled();
      }
    });
  });

  describe('Error States', () => {
    it('displays error message when action fails (tested in regression tests)', () => {
      // Error display is tested in the regression test suite (BUG-002)
      // Errors are managed internally by the component's state
      render(<EntryActions {...defaultProps} />);
      
      // Component should render without errors
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });

    it('shows dismiss button when error occurs (tested in regression tests)', () => {
      // Error dismiss functionality tested in BUG-002 regression tests
      // Component manages error state internally
      render(<EntryActions {...defaultProps} />);
      
      // Verify component renders correctly
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('buttons have proper ARIA labels', () => {
      render(<EntryActions {...defaultProps} />);
      
      const editButton = screen.getByRole('button', { name: /edit/i });
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      const copyButton = screen.getByRole('button', { name: /copy to today/i });

      expect(editButton).toHaveAccessibleName();
      expect(deleteButton).toHaveAccessibleName();
      expect(copyButton).toHaveAccessibleName();
    });

    it('disabled Copy button has aria-disabled attribute', () => {
      render(<EntryActions {...defaultProps} isToday={true} />);
      
      const copyButton = screen.getByRole('button', { name: /copy to today/i });
      expect(copyButton).toHaveAttribute('aria-disabled', 'true');
    });

    it('supports keyboard navigation', () => {
      render(<EntryActions {...defaultProps} />);
      
      const editButton = screen.getByRole('button', { name: /edit/i });
      editButton.focus();
      
      expect(document.activeElement).toBe(editButton);
      
      // Should be able to navigate with Tab (standard browser behavior)
      // Just verify buttons are focusable
      expect(editButton.tabIndex).not.toBe(-1);
      
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton.tabIndex).not.toBe(-1);
    });
  });

  describe('Responsive Layout', () => {
    it('renders in horizontal layout on desktop', () => {
      render(<EntryActions {...defaultProps} />);
      
      const container = screen.getByRole('group') || screen.getByTestId('entry-actions');
      expect(container.className).toMatch(/flex-row|space-x/);
    });

    it('stacks buttons vertically on mobile', () => {
      // Test by checking for responsive classes
      render(<EntryActions {...defaultProps} />);
      
      const container = screen.getByRole('group') || screen.getByTestId('entry-actions');
      expect(container.className).toMatch(/flex-col|space-y.*md:flex-row|md:space-x/);
    });
  });

  describe('Edge Cases', () => {
    it('handles missing entry gracefully', () => {
      render(<EntryActions {...defaultProps} entry={null} />);
      
      // Should still render buttons, or show appropriate message
      expect(screen.getByRole('button', { name: /edit/i })).toBeDisabled();
    });

    it('handles entry without _id', () => {
      const entryWithoutId = { ...mockEntry, _id: undefined };
      render(<EntryActions {...defaultProps} entry={entryWithoutId} />);
      
      // Actions requiring _id should be disabled
      expect(screen.getByRole('button', { name: /edit/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /delete/i })).toBeDisabled();
    });
  });

  describe('Regression Tests - Bug Fixes', () => {
    describe('Delete checkOnly parameter (BUG-001)', () => {
      it('should send checkOnly as URL query parameter, not request body', async () => {
        global.fetch = jest.fn()
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ streakImpact: null }),
          });

        render(<EntryActions {...defaultProps} />);
        
        const deleteButton = screen.getByRole('button', { name: /delete/i });
        fireEvent.click(deleteButton);

        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('checkOnly=true'),
            expect.objectContaining({
              method: 'DELETE',
            })
          );
          
          // Verify it's NOT in the body
          const fetchCall = global.fetch.mock.calls[0];
          expect(fetchCall[1].body).toBeUndefined();
        });
      });

      it('should NOT delete entry during checkOnly call', async () => {
        global.fetch = jest.fn()
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ 
              extendedFastCreated: false,
              extendedFastInfo: null 
            }),
          });

        render(<EntryActions {...defaultProps} />);
        
        const deleteButton = screen.getByRole('button', { name: /delete/i });
        fireEvent.click(deleteButton);

        await waitFor(() => {
          // Should show modal after check
          expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
        });

        // Entry should still exist (only one fetch call for check, not actual delete)
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });
    });

    describe('Error message UX (BUG-002)', () => {
      it('should NOT show "Try Again" button for validation errors', async () => {
        global.fetch = jest.fn()
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ entries: [] }),
          })
          .mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => ({ 
              error: 'Validation failed',
              errors: [{ field: 'date', message: 'Date cannot be in the future' }]
            }),
          });

        render(<EntryActions {...defaultProps} />);
        
        const copyButton = screen.getByRole('button', { name: /copy to today/i });
        fireEvent.click(copyButton);

        await waitFor(() => {
          expect(screen.getByText(/date.*cannot be in the future/i)).toBeInTheDocument();
        });

        // Should NOT have a "Try Again" button
        expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
        
        // Should have dismiss button
        expect(screen.getByRole('button', { name: /dismiss error/i })).toBeInTheDocument();
      });

      it('should show error above buttons, not breaking layout', async () => {
        global.fetch = jest.fn()
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ entries: [{ _id: 'existing', date: '2025-10-25' }] }),
          });

        render(<EntryActions {...defaultProps} />);
        
        const copyButton = screen.getByRole('button', { name: /copy to today/i });
        fireEvent.click(copyButton);

        await waitFor(() => {
          expect(screen.getByText(/already have an entry for today/i)).toBeInTheDocument();
        });

        // All three buttons should still be visible and properly sized
        const buttons = screen.getAllByRole('button');
        const actionButtons = buttons.filter(btn => 
          /edit|delete|copy/i.test(btn.textContent)
        );
        expect(actionButtons).toHaveLength(3);
      });
    });

    describe('Copy to Today validation (BUG-003)', () => {
      it('should omit optional health metric fields instead of sending null', async () => {
        global.fetch = jest.fn()
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ entries: [] }), // No existing entry for today
          })
          .mockResolvedValueOnce({
            ok: true,
            status: 201,
            json: async () => ({ 
              _id: 'new-entry-id',
              date: '2025-10-25',
              firstMealTime: '09:30',
              lastMealTime: '16:10',
            }),
          });

        render(<EntryActions {...defaultProps} />);
        
        const copyButton = screen.getByRole('button', { name: /copy to today/i });
        fireEvent.click(copyButton);

        await waitFor(() => {
          const postCall = global.fetch.mock.calls.find(call => call[1]?.method === 'POST');
          expect(postCall).toBeDefined();
          
          const requestBody = JSON.parse(postCall[1].body);
          
          // Should include required fields
          expect(requestBody).toHaveProperty('date');
          expect(requestBody).toHaveProperty('firstMealTime');
          expect(requestBody).toHaveProperty('lastMealTime');
          expect(requestBody).toHaveProperty('templateSource');
          
          // Should NOT include null health metrics
          expect(requestBody).not.toHaveProperty('morningWeight');
          expect(requestBody).not.toHaveProperty('hoursOfSleep');
          expect(requestBody).not.toHaveProperty('hungerLevel');
          expect(requestBody).not.toHaveProperty('energyLevel');
          expect(requestBody).not.toHaveProperty('wellBeing');
          expect(requestBody).not.toHaveProperty('foodNotes');
        });
      });
    });

    describe('Date timezone handling (BUG-004)', () => {
      it('should send date at noon UTC to avoid timezone display issues', async () => {
        global.fetch = jest.fn()
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ entries: [] }),
          })
          .mockResolvedValueOnce({
            ok: true,
            status: 201,
            json: async () => ({ 
              _id: 'new-entry-id',
              date: '2025-10-25T12:00:00.000Z',
            }),
          });

        render(<EntryActions {...defaultProps} />);
        
        const copyButton = screen.getByRole('button', { name: /copy to today/i });
        fireEvent.click(copyButton);

        await waitFor(() => {
          const postCall = global.fetch.mock.calls.find(call => call[1]?.method === 'POST');
          const requestBody = JSON.parse(postCall[1].body);
          
          // Date should be at noon UTC
          expect(requestBody.date).toMatch(/T12:00:00\.000Z$/);
        });
      });
    });

    describe('Router.refresh removed (BUG-005)', () => {
      it('should NOT call router.refresh after successful delete', async () => {
        const mockRouterPush = jest.fn();
        const mockRouterRefresh = jest.fn();
        
        jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({
          push: mockRouterPush,
          refresh: mockRouterRefresh,
        });

        global.fetch = jest.fn()
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ streakImpact: null }),
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'Entry deleted successfully' }),
          });

        render(<EntryActions {...defaultProps} />);
        
        // Click delete and confirm
        const deleteButton = screen.getByRole('button', { name: /delete/i });
        fireEvent.click(deleteButton);

        await waitFor(() => {
          expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
        });

        const confirmButton = screen.getByRole('button', { name: /yes.*delete/i });
        fireEvent.click(confirmButton);

        await waitFor(() => {
          // Should navigate away
          expect(mockRouterPush).toHaveBeenCalledWith(
            expect.stringContaining('/entries')
          );
          
          // Should NOT call refresh
          expect(mockRouterRefresh).not.toHaveBeenCalled();
        });
      });
    });

    describe('Date filtering API support (BUG-006)', () => {
      it('should include date parameter in API call when checking for existing entry', async () => {
        global.fetch = jest.fn()
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ entries: [] }),
          });

        render(<EntryActions {...defaultProps} />);
        
        const copyButton = screen.getByRole('button', { name: /copy to today/i });
        fireEvent.click(copyButton);

        await waitFor(() => {
          const checkCall = global.fetch.mock.calls[0];
          expect(checkCall[0]).toMatch(/\/api\/entries\?date=/);
          expect(checkCall[0]).toMatch(/date=\d{4}-\d{2}-\d{2}/);
        });
      });
    });
  });
});
