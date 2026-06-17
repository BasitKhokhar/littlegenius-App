// ──────────────────────────────────────────────────────────────
// secureAuth — credential handling for Little Genius
//
// Compliance goals:
//  • NEVER store raw PIN/password (Google Play security + child PII).
//  • PINs are salted + SHA-256 hashed before storage.
//  • Auth token lives in the OS keystore via expo-secure-store.
//  • Account records (no plaintext secret) stay in AsyncStorage and
//    never leave the device.
// ──────────────────────────────────────────────────────────────
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const USERS_KEY = 'registeredUsers';
const TOKEN_KEY = 'accessToken';
const USER_DATA_KEY = 'userData';

// ── Hashing ───────────────────────────────────────────────────
const toHex = (bytes) =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

export const generateSalt = async () => {
  const bytes = await Crypto.getRandomBytesAsync(16);
  return toHex(bytes);
};

export const hashPin = async (pin, salt) =>
  Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}::${pin}`
  );

// ── Token storage (OS keystore) ───────────────────────────────
export const saveToken = async (token) => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (e) {
    console.warn('[secureAuth.saveToken]', e);
  }
};

export const getToken = async () => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (e) {
    console.warn('[secureAuth.getToken]', e);
    return null;
  }
};

export const clearToken = async () => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (e) {
    console.warn('[secureAuth.clearToken]', e);
  }
};

// ── User records (on-device only) ─────────────────────────────
export const getUsers = async () => {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
};

const saveUsers = async (users) =>
  AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));

export const saveSessionUser = async (publicUser) =>
  AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(publicUser));

export const getSessionUser = async () => {
  const raw = await AsyncStorage.getItem(USER_DATA_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const clearSessionUser = async () =>
  AsyncStorage.removeItem(USER_DATA_KEY);

// Public projection — what the app keeps in memory / session (no secret).
const toPublicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  age: u.age,
  avatar: u.avatar,
});

// ── Register ──────────────────────────────────────────────────
// Returns { ok, error?, user? }
export const registerUser = async ({ name, email, pin, age, avatar }) => {
  const users = await getUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some((u) => u.email === normalizedEmail)) {
    return { ok: false, error: 'This email is already used!' };
  }

  const salt = await generateSalt();
  const pinHash = await hashPin(pin, salt);

  const record = {
    id: `user_${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    age,
    avatar,
    salt,
    pinHash,
    createdAt: new Date().toISOString(),
  };

  users.push(record);
  await saveUsers(users);

  return { ok: true, user: toPublicUser(record) };
};

// ── Verify (login) ────────────────────────────────────────────
export const verifyUser = async ({ email, pin }) => {
  const users = await getUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const record = users.find((u) => u.email === normalizedEmail);

  if (!record) return { ok: false, error: 'Invalid email or PIN.' };

  // Backward-compat: migrate any legacy plaintext record on first login.
  if (record.password !== undefined && record.pinHash === undefined) {
    if (record.password !== pin) {
      return { ok: false, error: 'Invalid email or PIN.' };
    }
    const salt = await generateSalt();
    record.salt = salt;
    record.pinHash = await hashPin(pin, salt);
    delete record.password;
    await saveUsers(users);
    return { ok: true, user: toPublicUser(record) };
  }

  const candidate = await hashPin(pin, record.salt);
  if (candidate !== record.pinHash) {
    return { ok: false, error: 'Invalid email or PIN.' };
  }
  return { ok: true, user: toPublicUser(record) };
};

// ── Delete account + all associated on-device data ────────────
export const deleteUserAccount = async (userId) => {
  const users = await getUsers();
  const remaining = users.filter((u) => u.id !== userId);
  await saveUsers(remaining);
  await AsyncStorage.removeItem(`stars_${userId}`);
  await clearSessionUser();
  await clearToken();
};

export const makeToken = (userId) => `token_${userId}_${Date.now()}`;
