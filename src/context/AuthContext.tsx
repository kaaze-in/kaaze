'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  memberSince: string;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    country: string;
    postalCode: string;
    coordinates?: string;
  };
  sizingMatrix: {
    chest: string;
    waist: string;
    inseam: string;
    footwear: string;
    preferredFit: string;
  };
}

interface AuthResponse {
  success: boolean;
  needsEmailConfirmation?: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isConfigured: boolean;
  pendingVerificationEmail: string | null;
  setPendingVerificationEmail: (email: string | null) => void;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signInWithGoogle: () => Promise<AuthResponse>;
  signUp: (email: string, password: string, meta: { firstName: string; lastName: string }) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResponse>;
  resendVerification: (email: string) => Promise<AuthResponse>;
  updateProfile: (updatedData: Partial<UserProfile>) => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConfigured, setIsConfigured] = useState<boolean>(isSupabaseConfigured);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);

  const getSiteUrl = (): string => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  };

  const loadProfile = async (currentUser: User) => {
    const supabase = getSupabase();
    const email = currentUser.email || '';
    const meta = currentUser.user_metadata || {};
    const createdYear = new Date(currentUser.created_at).getFullYear() || 2026;

    // Handle Google OAuth metadata as well as standard signup metadata
    const rawFullName = meta.full_name || meta.name || '';
    const rawFirstName =
      meta.first_name ||
      meta.given_name ||
      (rawFullName ? rawFullName.split(' ')[0] : '') ||
      email.split('@')[0] ||
      'Customer';
    const rawLastName =
      meta.last_name ||
      meta.family_name ||
      (rawFullName && rawFullName.includes(' ')
        ? rawFullName.split(' ').slice(1).join(' ')
        : '');

    const fallbackProfile: UserProfile = {
      id: currentUser.id,
      firstName: rawFirstName.toUpperCase(),
      lastName: rawLastName.toUpperCase(),
      email,
      phone: meta.phone || '',
      memberSince: `${createdYear} // ARCH-EDTN`,
      shippingAddress: {
        name: `${rawFirstName} ${rawLastName}`.trim() || 'CLIENT ARCHIVE',
        street: '',
        city: 'MANGALURU',
        country: 'INDIA',
        postalCode: '',
        coordinates: '12.9141° N, 74.8560° E',
      },
      sizingMatrix: {
        chest: 'STANDARD',
        waist: 'STANDARD',
        inseam: 'STANDARD',
        footwear: 'STANDARD',
        preferredFit: 'RELAXED',
      },
    };

    if (!supabase) {
      setProfile(fallbackProfile);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error || !data) {
        setProfile(fallbackProfile);
        // Persist initial profile record in profiles table if not present
        try {
          await supabase.from('profiles').upsert(
            {
              id: currentUser.id,
              first_name: fallbackProfile.firstName,
              last_name: fallbackProfile.lastName,
              email: currentUser.email,
              phone: fallbackProfile.phone,
              shipping_address: fallbackProfile.shippingAddress,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );
        } catch {
          // Non-blocking
        }
        return;
      }

      setProfile({
        id: data.id,
        firstName: data.first_name || fallbackProfile.firstName,
        lastName: data.last_name || fallbackProfile.lastName,
        email: data.email || fallbackProfile.email,
        phone: data.phone || fallbackProfile.phone,
        memberSince: `${new Date(data.created_at).getFullYear()} // ARCH-EDTN`,
        shippingAddress: {
          name: data.shipping_address?.name || fallbackProfile.shippingAddress.name,
          street: data.shipping_address?.street || '',
          city: data.shipping_address?.city || 'MANGALURU',
          country: data.shipping_address?.country || 'INDIA',
          postalCode: data.shipping_address?.postal_code || '',
          coordinates: data.shipping_address?.coordinates || '12.9141° N, 74.8560° E',
        },
        sizingMatrix: data.sizing_matrix || fallbackProfile.sizingMatrix,
      });
    } catch (err) {
      console.error('Error loading Supabase profile:', err);
      setProfile(fallbackProfile);
    }
  };

  useEffect(() => {
    const supabase = getSupabase();
    setIsConfigured(Boolean(supabase));
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Initialize session from Supabase client
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user);
      }
      setIsLoading(false);
    });

    // Listen for auth state changes (sign in, sign out, token refreshed)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadProfile(session.user);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    const supabase = getSupabase();
    if (!supabase) {
      return {
        success: false,
        error: 'Supabase authentication is not configured yet. Please configure your project keys in .env.local.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        // Handle unconfirmed email specifically
        if (
          error.message.toLowerCase().includes('email not confirmed') ||
          error.message.toLowerCase().includes('unconfirmed')
        ) {
          setPendingVerificationEmail(email.trim());
          return {
            success: false,
            needsEmailConfirmation: true,
            error: 'Email verification required. Please verify your email before accessing your account.',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }

      setPendingVerificationEmail(null);
      setSession(data.session);
      setUser(data.user);
      if (data.user) {
        await loadProfile(data.user);
      }
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: (err as Error)?.message || 'Authentication error encountered.',
      };
    }
  };

  const signInWithGoogle = async (): Promise<AuthResponse> => {
    const supabase = getSupabase();
    if (!supabase) {
      return {
        success: false,
        error: 'Supabase authentication is not configured yet. Please configure your project keys in .env.local.',
      };
    }

    try {
      const redirectUrl = `${getSiteUrl()}/auth/callback?next=/account`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      if (data?.url) {
        window.location.href = data.url;
      }

      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: (err as Error)?.message || 'Google sign-in request failed.',
      };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    meta: { firstName: string; lastName: string }
  ): Promise<AuthResponse> => {
    const supabase = getSupabase();
    if (!supabase) {
      return {
        success: false,
        error: 'Supabase authentication is not configured yet. Please configure your project keys in .env.local.',
      };
    }

    try {
      const redirectUrl = `${getSiteUrl()}/auth/callback?next=/account`;
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            first_name: meta.firstName.trim().toUpperCase(),
            last_name: meta.lastName.trim().toUpperCase(),
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      // Check if email confirmation is required by Supabase Auth project settings
      const requiresConfirmation =
        data.user && (!data.user.email_confirmed_at || !data.session);

      if (requiresConfirmation) {
        setPendingVerificationEmail(email.trim());
        return {
          success: true,
          needsEmailConfirmation: true,
        };
      }

      // If email confirmation is disabled in Supabase, customer is immediately authenticated
      setPendingVerificationEmail(null);
      setSession(data.session);
      setUser(data.user);
      if (data.user) {
        await loadProfile(data.user);
      }
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: (err as Error)?.message || 'Registration error encountered.',
      };
    }
  };

  const signOut = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setUser(null);
    setProfile(null);
    setPendingVerificationEmail(null);
  };

  const resetPassword = async (email: string): Promise<AuthResponse> => {
    const supabase = getSupabase();
    if (!supabase) {
      return {
        success: false,
        error: 'Supabase authentication is not configured yet. Please configure your project keys in .env.local.',
      };
    }

    try {
      const redirectUrl = `${getSiteUrl()}/auth/callback?next=/account`;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: (err as Error)?.message || 'Password reset transmission failed.',
      };
    }
  };

  const resendVerification = async (email: string): Promise<AuthResponse> => {
    const supabase = getSupabase();
    if (!supabase) {
      return {
        success: false,
        error: 'Supabase authentication is not configured yet.',
      };
    }

    try {
      const redirectUrl = `${getSiteUrl()}/auth/callback?next=/account`;
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: (err as Error)?.message || 'Failed to dispatch verification email.',
      };
    }
  };

  const updateProfile = async (updatedData: Partial<UserProfile>): Promise<AuthResponse> => {
    if (!user) {
      return { success: false, error: 'No authenticated customer session found.' };
    }

    const supabase = getSupabase();
    if (!supabase) {
      setProfile((prev) => (prev ? { ...prev, ...updatedData } : null));
      return { success: true };
    }

    try {
      const payload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (updatedData.firstName !== undefined) payload.first_name = updatedData.firstName;
      if (updatedData.lastName !== undefined) payload.last_name = updatedData.lastName;
      if (updatedData.phone !== undefined) payload.phone = updatedData.phone;
      if (updatedData.shippingAddress !== undefined) payload.shipping_address = updatedData.shippingAddress;
      if (updatedData.sizingMatrix !== undefined) payload.sizing_matrix = updatedData.sizingMatrix;

      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, ...payload });

      if (error) {
        return { success: false, error: error.message };
      }

      await loadProfile(user);
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error)?.message || 'Profile update error.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isConfigured,
        pendingVerificationEmail,
        setPendingVerificationEmail,
        signIn,
        signInWithGoogle,
        signUp,
        signOut,
        resetPassword,
        resendVerification,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
