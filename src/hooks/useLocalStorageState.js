/**
 * Local Storage State Hook
 *
 * Custom React hook that provides persistent state management using browser localStorage.
 * Synchronizes React state with localStorage, persisting data across browser sessions.
 *
 * @module useLocalStorageState
 */

import { useState, useEffect } from "react";

/**
 * Creates a stateful value that persists in browser localStorage.
 *
 * This hook combines React's useState with localStorage for persistent state management:
 * - Initializes state from localStorage if available, otherwise uses provided initial value
 * - Automatically saves state to localStorage whenever it changes
 * - Data is JSON serialized/deserialized for complex objects
 * - Survives page refreshes and browser restarts
 *
 * Common use cases:
 * - User preferences (theme, language, display settings)
 * - Form draft data
 * - UI state (sidebar collapsed/expanded, selected tabs)
 * - Temporary cache for non-sensitive data
 *
 * Important notes:
 * - Only stores data in current browser (not synced across devices)
 * - Not suitable for sensitive information (localStorage is not encrypted)
 * - Storage limit typically 5-10MB depending on browser
 * - Data persists until explicitly cleared or browser cache is cleared
 *
 * @param {*} initialState - Default value used when no stored value exists
 * @param {string} key - Unique localStorage key to store the value under
 * @returns {Array} Tuple containing [currentValue, setValueFunction] (same API as useState)
 *
 * @example
 * // Store user's theme preference
 * function ThemeToggle() {
 *   const [theme, setTheme] = useLocalStorageState('light', 'app-theme');
 *
 *   return (
 *     <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
 *       Current theme: {theme}
 *     </button>
 *   );
 * }
 *
 * @example
 * // Store complex object (form state)
 * function FormWithAutoSave() {
 *   const [formData, setFormData] = useLocalStorageState(
 *     { name: '', email: '' },
 *     'draft-form'
 *   );
 *
 *   return (
 *     <form>
 *       <input
 *         value={formData.name}
 *         onChange={(e) => setFormData({ ...formData, name: e.target.value })}
 *       />
 *       <input
 *         value={formData.email}
 *         onChange={(e) => setFormData({ ...formData, email: e.target.value })}
 *       />
 *     </form>
 *   );
 * }
 */
export function useLocalStorageState(initialState, key) {
  const [value, setValue] = useState(function () {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : initialState;
  });

  useEffect(
    function () {
      localStorage.setItem(key, JSON.stringify(value));
    },
    [value, key]
  );

  return [value, setValue];
}
