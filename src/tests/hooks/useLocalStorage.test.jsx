import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLocalStorageState } from "../../hooks/useLocalStorageState";

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Replace global localStorage with mock
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("useLocalStorageState Hook", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ==================== INITIAL STATE ====================

  it("returns initial state when localStorage is empty", () => {
    // ARRANGE: Define initial state
    const initialState = "default value";
    const key = "testKey";

    // ACT: Render the hook
    const { result } = renderHook(() =>
      useLocalStorageState(initialState, key)
    );

    // ASSERT: Should return initial state
    const [value] = result.current;
    expect(value).toBe(initialState);
  });

  it("returns value from localStorage if it exists", () => {
    // ARRANGE: Set up localStorage with existing data
    const key = "testKey";
    const storedValue = "stored value";
    localStorage.setItem(key, JSON.stringify(storedValue));

    const initialState = "default value";

    // ACT: Render the hook
    const { result } = renderHook(() =>
      useLocalStorageState(initialState, key)
    );

    // ASSERT: Should return stored value, not initial state
    const [value] = result.current;
    expect(value).toBe(storedValue);
  });

  // ==================== UPDATING STATE ====================

  it("updates state and saves to localStorage", () => {
    // ARRANGE: Set up hook with initial state
    const initialState = "initial";
    const key = "testKey";
    const { result } = renderHook(() =>
      useLocalStorageState(initialState, key)
    );

    // ACT: Update the state
    const newValue = "updated value";
    act(() => {
      const [, setValue] = result.current;
      setValue(newValue);
    });

    // ASSERT: State is updated
    const [value] = result.current;
    expect(value).toBe(newValue);

    // ASSERT: localStorage is updated
    const storedValue = localStorage.getItem(key);
    expect(storedValue).toBe(JSON.stringify(newValue));
  });

  // ==================== COMPLEX DATA TYPES ====================

  it("handles objects correctly", () => {
    // ARRANGE: Use object as initial state
    const initialState = { name: "John", age: 30 };
    const key = "userKey";

    // ACT: Render hook
    const { result } = renderHook(() =>
      useLocalStorageState(initialState, key)
    );

    // ASSERT: Initial object is set
    const [value] = result.current;
    expect(value).toEqual(initialState);

    // ACT: Update with new object
    const newValue = { name: "Jane", age: 25 };
    act(() => {
      const [, setValue] = result.current;
      setValue(newValue);
    });

    // ASSERT: New object is stored correctly
    const [updatedValue] = result.current;
    expect(updatedValue).toEqual(newValue);
    expect(localStorage.getItem(key)).toBe(JSON.stringify(newValue));
  });

  it("handles arrays correctly", () => {
    // ARRANGE: Use array as initial state
    const initialState = [1, 2, 3];
    const key = "arrayKey";

    // ACT: Render hook
    const { result } = renderHook(() =>
      useLocalStorageState(initialState, key)
    );

    // ASSERT: Initial array is set
    const [value] = result.current;
    expect(value).toEqual(initialState);

    // ACT: Update array
    const newValue = [4, 5, 6];
    act(() => {
      const [, setValue] = result.current;
      setValue(newValue);
    });

    // ASSERT: New array is stored
    const [updatedValue] = result.current;
    expect(updatedValue).toEqual(newValue);
  });

  // ==================== MULTIPLE INSTANCES ====================

  it("handles multiple keys independently", () => {
    // ARRANGE: Create two hooks with different keys
    const key1 = "key1";
    const key2 = "key2";
    const initialValue1 = "value1";
    const initialValue2 = "value2";

    // ACT: Render both hooks
    const { result: result1 } = renderHook(() =>
      useLocalStorageState(initialValue1, key1)
    );
    const { result: result2 } = renderHook(() =>
      useLocalStorageState(initialValue2, key2)
    );

    // ASSERT: Both hooks have correct values
    expect(result1.current[0]).toBe(initialValue1);
    expect(result2.current[0]).toBe(initialValue2);

    // ACT: Update first hook
    act(() => {
      result1.current[1]("updated1");
    });

    // ASSERT: Only first hook is updated
    expect(result1.current[0]).toBe("updated1");
    expect(result2.current[0]).toBe(initialValue2);
  });

  // ==================== EDGE CASES ====================

  it("handles empty string as initial value", () => {
    // ARRANGE
    const initialState = "";
    const key = "emptyKey";

    // ACT
    const { result } = renderHook(() =>
      useLocalStorageState(initialState, key)
    );

    // ASSERT
    expect(result.current[0]).toBe("");
  });

  it("handles null as initial value", () => {
    // ARRANGE
    const initialState = null;
    const key = "nullKey";

    // ACT
    const { result } = renderHook(() =>
      useLocalStorageState(initialState, key)
    );

    // ASSERT
    expect(result.current[0]).toBeNull();
  });

  it("handles boolean values", () => {
    // ARRANGE
    const initialState = false;
    const key = "boolKey";

    // ACT
    const { result } = renderHook(() =>
      useLocalStorageState(initialState, key)
    );

    // ASSERT
    expect(result.current[0]).toBe(false);

    // ACT: Update to true
    act(() => {
      result.current[1](true);
    });

    // ASSERT
    expect(result.current[0]).toBe(true);
    expect(localStorage.getItem(key)).toBe(JSON.stringify(true));
  });

  // ==================== PERSISTENCE ====================

  it("persists data across hook re-renders", () => {
    // ARRANGE
    const key = "persistKey";
    const initialValue = "initial";

    // ACT: First render
    const { result: result1, unmount } = renderHook(() =>
      useLocalStorageState(initialValue, key)
    );

    act(() => {
      result1.current[1]("persisted");
    });

    // Unmount first hook
    unmount();

    // ACT: Second render (new hook instance)
    const { result: result2 } = renderHook(() =>
      useLocalStorageState(initialValue, key)
    );

    // ASSERT: Data persisted from first render
    expect(result2.current[0]).toBe("persisted");
  });
});
