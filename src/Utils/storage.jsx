import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Thin wrapper around AsyncStorage with JSON serialisation
 */
const Storage = {
  set: async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('[Storage.set]', e);
    }
  },

  get: async (key) => {
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('[Storage.get]', e);
      return null;
    }
  },

  remove: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.warn('[Storage.remove]', e);
    }
  },

  clear: async () => {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.warn('[Storage.clear]', e);
    }
  },

  multiRemove: async (keys = []) => {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (e) {
      console.warn('[Storage.multiRemove]', e);
    }
  },
};

export default Storage;
