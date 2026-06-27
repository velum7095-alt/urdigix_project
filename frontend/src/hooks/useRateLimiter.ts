/**
 * Rate Limiter Hook
 * =================
 * Client-side rate limiting for login attempts and other sensitive operations.
 * 
 * Security Features:
 * - Tracks failed attempts in sessionStorage (cleared on browser close)
 * - Progressive lockout periods
 * - Prevents brute force attacks
 * 
 * Note: This is client-side protection only. Server-side rate limiting
 * should also be implemented via Supabase Edge Functions for full protection.
 */

import { useState, useCallback } from 'react';

interface RateLimitState {
    attempts: number;
    lockoutUntil: number | null;
    lastAttempt: number;
}

interface RateLimiterConfig {
    maxAttempts: number;           // Max attempts before lockout
    lockoutDurations: number[];    // Progressive lockout durations in ms
    windowMs: number;              // Time window for counting attempts
    storageKey: string;            // Key for sessionStorage
}

const DEFAULT_CONFIG: RateLimiterConfig = {
    maxAttempts: 5,
    lockoutDurations: [
        30 * 1000,      // 30 seconds after 1st lockout
        60 * 1000,      // 1 minute after 2nd lockout
        5 * 60 * 1000,  // 5 minutes after 3rd lockout
        15 * 60 * 1000, // 15 minutes after 4th+ lockout
    ],
    windowMs: 15 * 60 * 1000, // 15 minute window
    storageKey: 'auth_rate_limit',
};

const getStoredState = (key: string): RateLimitState => {
    try {
        const stored = sessionStorage.getItem(key);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch {
        // Ignore parsing errors
    }
    return { attempts: 0, lockoutUntil: null, lastAttempt: 0 };
};

const setStoredState = (key: string, state: RateLimitState): void => {
    try {
        sessionStorage.setItem(key, JSON.stringify(state));
    } catch {
        // Ignore storage errors
    }
};

export const useRateLimiter = (config: Partial<RateLimiterConfig> = {}) => {
    const fullConfig = { ...DEFAULT_CONFIG, ...config };
    const [state, setState] = useState<RateLimitState>(() => 
        getStoredState(fullConfig.storageKey)
    );

    const isLocked = useCallback((): boolean => {
        if (!state.lockoutUntil) return false;
        if (Date.now() > state.lockoutUntil) {
            // Lockout expired, reset
            const newState = { ...state, lockoutUntil: null };
            setState(newState);
            setStoredState(fullConfig.storageKey, newState);
            return false;
        }
        return true;
    }, [state, fullConfig.storageKey]);

    const getRemainingLockoutTime = useCallback((): number => {
        if (!state.lockoutUntil) return 0;
        const remaining = state.lockoutUntil - Date.now();
        return Math.max(0, remaining);
    }, [state.lockoutUntil]);

    const recordAttempt = useCallback((success: boolean): void => {
        const now = Date.now();
        
        if (success) {
            // Reset on successful attempt
            const newState: RateLimitState = { 
                attempts: 0, 
                lockoutUntil: null, 
                lastAttempt: now 
            };
            setState(newState);
            setStoredState(fullConfig.storageKey, newState);
            return;
        }

        // Failed attempt
        let newAttempts = state.attempts + 1;
        
        // Reset count if outside window
        if (now - state.lastAttempt > fullConfig.windowMs) {
            newAttempts = 1;
        }

        let newLockoutUntil: number | null = null;
        
        if (newAttempts >= fullConfig.maxAttempts) {
            // Calculate which lockout duration to use
            const lockoutIndex = Math.min(
                Math.floor((newAttempts - fullConfig.maxAttempts) / fullConfig.maxAttempts),
                fullConfig.lockoutDurations.length - 1
            );
            const lockoutDuration = fullConfig.lockoutDurations[lockoutIndex];
            newLockoutUntil = now + lockoutDuration;
        }

        const newState: RateLimitState = {
            attempts: newAttempts,
            lockoutUntil: newLockoutUntil,
            lastAttempt: now,
        };
        
        setState(newState);
        setStoredState(fullConfig.storageKey, newState);
    }, [state, fullConfig]);

    const reset = useCallback((): void => {
        const newState: RateLimitState = { 
            attempts: 0, 
            lockoutUntil: null, 
            lastAttempt: 0 
        };
        setState(newState);
        setStoredState(fullConfig.storageKey, newState);
    }, [fullConfig.storageKey]);

    return {
        isLocked: isLocked(),
        attempts: state.attempts,
        remainingLockoutMs: getRemainingLockoutTime(),
        recordAttempt,
        reset,
    };
};
