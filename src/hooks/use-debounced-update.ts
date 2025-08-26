"use client";

import { useCallback, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";

type UpdateFunction<T> = (updates: T) => void;

/**
 * Custom hook for debounced updates
 * Delays executing the update function until the user stops typing for the specified delay
 */
export function useDebouncedUpdate<T>(
  updateFn: UpdateFunction<T>,
  delay = 500
) {
  const debouncedUpdate = useDebouncedCallback(
    useCallback(
      (updates: T) => {
        updateFn(updates);
      },
      [updateFn]
    ),
    delay,
    {
      leading: false,
      trailing: true,
    }
  );

  return debouncedUpdate;
}

/**
 * Hook for managing local state with debounced updates
 * Provides immediate local updates for UI responsiveness while debouncing server updates
 */
export function useDebouncedField<T>(
  value: T,
  updateFn: (value: T) => void,
  delay = 500
) {
  const localValueRef = useRef(value);

  const debouncedUpdate = useDebouncedCallback(
    useCallback(
      (newValue: T) => {
        updateFn(newValue);
      },
      [updateFn]
    ),
    delay,
    {
      leading: false,
      trailing: true,
    }
  );

  const handleChange = useCallback(
    (newValue: T) => {
      localValueRef.current = newValue;
      debouncedUpdate(newValue);
    },
    [debouncedUpdate]
  );

  return {
    value: localValueRef.current,
    onChange: handleChange,
  };
}
