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
  signUpWithEmail: (email: string, password: string) => Promise<boolean>;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
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

  useEffect(() => {
    const supabase = getSupabaseClient();

    if (!user) {
      return;
    }

    const syncUser = async () => {
      const email = user.email ?? null;

      if (!email) {
        return;
      }

      const storageKey = `zanari-user-known:${email}`;
      const isBrowser = typeof window !== "undefined";
      const hasSeenUserBefore =
        isBrowser && window.localStorage.getItem(storageKey) === "1";

      const { data: existing, error: selectError } = await supabase
        .from("users")
        .select("id, is_deleted")
        .eq("email", email)
        .maybeSingle();

      if (selectError) {
        console.error("Failed to check user record", selectError.message);
        return;
      }

      if (existing?.is_deleted) {
        setAuthError(
          "Your account has been removed. If this does not seem right, please contact us right away so we can help.",
        );
        await supabase.auth.signOut();
        return;
      }

      if (!existing && hasSeenUserBefore) {
        if (isBrowser) {
          window.localStorage.removeItem(storageKey);
        }

        setAuthError(
          "Your account has been removed. If this does not seem right, please contact us right away so we can help.",
        );
        await supabase.auth.signOut();
        return;
      }

      const isVerified = Boolean(
        (user as { email_confirmed_at?: string | null }).email_confirmed_at,
      );

      const { error: upsertError } = await supabase
        .from("users")
        .upsert(
          {
            id: user.id,
            email,
            is_email_verified: isVerified,
            password_hash: "managed-by-supabase",
          },
          { onConflict: "email" },
        );

      if (upsertError) {
        console.error("Failed to sync user record", upsertError.message);
        return;
      }

      if (isBrowser && !hasSeenUserBefore) {
        window.localStorage.setItem(storageKey, "1");
      }
    };

    void syncUser();
  }, [user]);

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
        setIsLoading(false);
        return false;
      }

      let nextSession = data.session ?? null;
      let nextUser = data.user ?? null;

      if (!nextSession) {
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (!signInError) {
          nextSession = signInData.session ?? nextSession;
          nextUser = signInData.user ?? nextUser;
        } else {
          setAuthError(signInError.message);
          setIsLoading(false);
          return false;
        }
      }

      if (!nextSession || !nextUser) {
        setAuthError(
          "We created your account, but could not sign you in. Try logging in with your email and password.",
        );
        setIsLoading(false);
        return false;
      }

      setSession(nextSession);
      setUser(nextUser);
      setAuthMessage(null);
      setIsLoading(false);

      return true;
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
        let message = error.message;

        try {
          const { data: existing, error: userError } = await supabase
            .from("users")
            .select("id")
            .eq("email", email.toLowerCase())
            .maybeSingle();

          if (!userError && !existing) {
            message = "No account is found for this email. Try signing up instead.";
          } else if (!userError && existing) {
            message = "Invalid login credentials. Check your password and try again.";
          }
        } catch {
        }

        setAuthError(message);
        setIsLoading(false);
        return false;
      }

      setSession(data.session ?? null);
      setUser(data.user ?? null);
      setIsLoading(false);

      return true;
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
