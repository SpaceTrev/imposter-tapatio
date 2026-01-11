import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Hook for persistent storage using AsyncStorage
 */
export function useStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial value from storage
  useEffect(() => {
    async function loadValue() {
      try {
        const item = await AsyncStorage.getItem(key);
        if (item !== null) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.warn(`Error loading ${key} from storage:`, error);
      } finally {
        setIsLoading(false);
      }
    }
    loadValue();
  }, [key]);

  // Save value to storage
  const setValue = useCallback(async (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error saving ${key} to storage:`, error);
    }
  }, [key, storedValue]);

  // Remove value from storage
  const removeValue = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing ${key} from storage:`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, isLoading, removeValue];
}

/**
 * Hook for players storage
 */
export function usePlayers() {
  return useStorage('imposter_players', []);
}

/**
 * Hook for game settings storage
 */
export function useGameSettings() {
  return useStorage('imposter_settings', {
    language: 'es',
    theme: 'system',
    allowAdult: false,
    sendHintToImposter: false,
    useImposterWord: false,
  });
}
