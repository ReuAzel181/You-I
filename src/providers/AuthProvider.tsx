"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabaseClient";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  authError: string | null;
  authMessage: string | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const supabase = getSupabaseClient();

    setIsLoading(true);
    setAuthError(null);
    setAuthMessage(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });

    if (error) {
      setAuthError(error.message);
    }

    setIsLoading(false);
  }, []);

  const signUpWithEmail = useCallback(
    async (email: string, password: string) => {
      const supabase = getSupabaseClient();

      setIsLoading(true);
      setAuthError(null);
       setAuthMessage(null);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setAuthError(error.message);
      } else {
        setSession(data.session ?? null);
        setUser(data.user ?? null);
        if (!data.session) {
          setAuthMessage("Check your email for a verification link to complete signup.");
        }
      }

      setIsLoading(false);
    },
    [],
  );

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const supabase = getSupabaseClient();

      setIsLoading(true);
      setAuthError(null);
      setAuthMessage(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthError(error.message);
      } else {
        setSession(data.session ?? null);
        setUser(data.user ?? null);
      }

      setIsLoading(false);
    },
    [],
  );

  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient();

    setIsLoading(true);
    setAuthError(null);
    setAuthMessage(null);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error(error.message);
    }

    setIsLoading(false);
  }, []);

  const value: AuthContextValue = {
    user,
    session,
    isLoading,
    signInWithGoogle,
    signOut,
    signUpWithEmail,
    signInWithEmail,
    authError,
    authMessage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
