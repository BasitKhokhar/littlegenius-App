import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const ProgressContext = createContext(null);

const DEFAULT_STREAK = { count: 0, lastActiveDate: null };

// Milestone badges — flat rule table, no generic "achievement engine".
// Evaluated whenever stars/streak/lessonsCompleted/gamesPlayed change.
const BADGE_RULES = [
  { id: 'first_lesson', label: 'First Lesson', icon: '📖', check: (p) => p.lessonsCompleted >= 1 },
  { id: 'first_game', label: 'First Game', icon: '🎮', check: (p) => p.gamesPlayed >= 1 },
  { id: 'streak_3', label: '3-Day Streak', icon: '🔥', check: (p) => p.streak >= 3 },
  { id: 'streak_7', label: '7-Day Streak', icon: '🔥', check: (p) => p.streak >= 7 },
  { id: 'lessons_10', label: '10 Lessons', icon: '🏅', check: (p) => p.lessonsCompleted >= 10 },
  { id: 'games_10', label: '10 Games', icon: '🏅', check: (p) => p.gamesPlayed >= 10 },
  { id: 'stars_50', label: '50 Stars', icon: '⭐', check: (p) => p.stars >= 50 },
  { id: 'stars_100', label: '100 Stars', icon: '⭐', check: (p) => p.stars >= 100 },
];

// A day is "consecutive" by calendar date, not a rolling 24h window — so a
// child playing at 11pm and again at 6am the next morning still keeps the
// streak, and playing twice in the same day never double-counts it.
const touchStreak = (prev) => {
  const today = new Date().toDateString();
  if (prev.lastActiveDate === today) return prev;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const count = prev.lastActiveDate === yesterday ? prev.count + 1 : 1;
  return { count, lastActiveDate: today };
};

export const ProgressProvider = ({ children }) => {
  const { user, stars } = useAuth();
  const [streak, setStreak] = useState(DEFAULT_STREAK);
  const [xp, setXp] = useState(0);
  const [lessonsCompleted, setLessonsCompleted] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [badges, setBadges] = useState([]);
  const [lastLesson, setLastLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  // Badge evaluation reads the latest counters via a ref so the effect
  // below can stay keyed on the primitives that actually change it,
  // without re-running for reasons unrelated to badge rules.
  const latest = useRef({ stars, streak: streak.count, lessonsCompleted, gamesPlayed });
  latest.current = { stars, streak: streak.count, lessonsCompleted, gamesPlayed };

  const resetToDefaults = () => {
    setStreak(DEFAULT_STREAK);
    setXp(0);
    setLessonsCompleted(0);
    setGamesPlayed(0);
    setBadges([]);
    setLastLesson(null);
  };

  useEffect(() => {
    const load = async () => {
      if (!user?.id) {
        resetToDefaults();
        setLoading(false);
        return;
      }
      try {
        const [
          storedStreak,
          storedXp,
          storedLessons,
          storedGames,
          storedBadges,
          storedLastLesson,
        ] = await Promise.all([
          AsyncStorage.getItem(`streak_${user.id}`),
          AsyncStorage.getItem(`xp_${user.id}`),
          AsyncStorage.getItem(`lessonsCompleted_${user.id}`),
          AsyncStorage.getItem(`gamesPlayed_${user.id}`),
          AsyncStorage.getItem(`badges_${user.id}`),
          AsyncStorage.getItem(`lastLesson_${user.id}`),
        ]);
        setStreak(storedStreak ? JSON.parse(storedStreak) : DEFAULT_STREAK);
        setXp(storedXp ? parseInt(storedXp, 10) : 0);
        setLessonsCompleted(storedLessons ? parseInt(storedLessons, 10) : 0);
        setGamesPlayed(storedGames ? parseInt(storedGames, 10) : 0);
        setBadges(storedBadges ? JSON.parse(storedBadges) : []);
        setLastLesson(storedLastLesson ? JSON.parse(storedLastLesson) : null);
      } catch (error) {
        console.error('Failed to load progress state:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.id]);

  // Shared by recordLessonComplete/recordGameComplete — touches the streak
  // and adds xp exactly once per completion event.
  const touchActivity = useCallback((xpAmount) => {
    if (!user) return;
    setStreak((prev) => {
      const next = touchStreak(prev);
      if (next !== prev) {
        AsyncStorage.setItem(`streak_${user.id}`, JSON.stringify(next)).catch((error) => {
          console.warn('Failed to save streak:', error);
        });
      }
      return next;
    });
    setXp((prev) => {
      const next = prev + xpAmount;
      AsyncStorage.setItem(`xp_${user.id}`, next.toString()).catch((error) => {
        console.warn('Failed to save xp:', error);
      });
      return next;
    });
  }, [user]);

  const recordLessonComplete = useCallback(({ xpAmount = 0, mod, packId, packTitle } = {}) => {
    if (!user) return;
    touchActivity(xpAmount);
    setLessonsCompleted((prev) => {
      const next = prev + 1;
      AsyncStorage.setItem(`lessonsCompleted_${user.id}`, next.toString()).catch((error) => {
        console.warn('Failed to save lessonsCompleted:', error);
      });
      return next;
    });
    if (mod) {
      const pointer = { mod, packId, packTitle, ts: Date.now() };
      setLastLesson(pointer);
      AsyncStorage.setItem(`lastLesson_${user.id}`, JSON.stringify(pointer)).catch((error) => {
        console.warn('Failed to save lastLesson:', error);
      });
    }
  }, [user, touchActivity]);

  const recordGameComplete = useCallback(({ xpAmount = 0 } = {}) => {
    if (!user) return;
    touchActivity(xpAmount);
    setGamesPlayed((prev) => {
      const next = prev + 1;
      AsyncStorage.setItem(`gamesPlayed_${user.id}`, next.toString()).catch((error) => {
        console.warn('Failed to save gamesPlayed:', error);
      });
      return next;
    });
  }, [user, touchActivity]);

  // Badge unlocks are a pure function of the latest stats — re-evaluate
  // whenever any of them change and persist only if something new unlocked.
  useEffect(() => {
    if (!user?.id || loading) return;
    const stats = latest.current;
    const newlyUnlocked = BADGE_RULES.filter((rule) => !badges.includes(rule.id) && rule.check(stats)).map((r) => r.id);
    if (newlyUnlocked.length === 0) return;
    setBadges((prev) => {
      const next = [...prev, ...newlyUnlocked];
      AsyncStorage.setItem(`badges_${user.id}`, JSON.stringify(next)).catch((error) => {
        console.warn('Failed to save badges:', error);
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, loading, stars, streak.count, lessonsCompleted, gamesPlayed]);

  const value = {
    streak: streak.count,
    xp,
    lessonsCompleted,
    gamesPlayed,
    badges,
    lastLesson,
    loading,
    recordLessonComplete,
    recordGameComplete,
  };

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

export default ProgressContext;
