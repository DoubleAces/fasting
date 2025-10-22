/**
 * useDebounce Hook
 * 
 * Debounces a value by delaying its update until after a specified delay period
 * has passed without the value changing. Commonly used for search inputs to
 * reduce API calls while user is typing.
 * 
 * Features:
 * - Automatically cleans up timeout on unmount
 * - Resets timer on each value change
 * - Configurable delay period
 * 
 * Performance:
 * - Reduces server load by batching rapid input changes
 * - Default 300ms delay provides responsive feel while reducing requests
 * 
 * @example
 * // Basic usage for search input
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 300);
 * 
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     // API call with debounced value
 *     fetchResults(debouncedSearchTerm);
 *   }
 * }, [debouncedSearchTerm]);
 * 
 * @example
 * // In filter component
 * function FilterBar() {
 *   const [nameInput, setNameInput] = useState('');
 *   const debouncedName = useDebounce(nameInput, 300);
 *   
 *   // Only triggers after user stops typing for 300ms
 *   useEffect(() => {
 *     onFilterChange({ name: debouncedName });
 *   }, [debouncedName]);
 * }
 */

import { useState, useEffect } from 'react';

/**
 * Debounce a value
 * 
 * @param {*} value - The value to debounce (can be any type)
 * @param {number} delay - Delay in milliseconds before updating (default: 300ms)
 * @returns {*} The debounced value
 */
export function useDebounce(value, delay = 300) {
  // State to hold the debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up a timer to update debounced value after delay
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function: clear timeout if value changes or component unmounts
    // This ensures we only update after the user stops changing the value
    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]); // Re-run effect when value or delay changes

  return debouncedValue;
}

export default useDebounce;
