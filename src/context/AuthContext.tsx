"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "@/lib/supabase/client";

type User = {
  name: string;
  email: string;
};

type PendingAction = (() => void) | null;

type AuthContextValue = {
  user: User | null;
  isModalOpen: boolean;
  modalMode: "login" | "signup";
  openAuthModal: (mode?: "login" | "signup") => void;
  closeAuthModal: () => void;
  // Runs `action` immediately if logged in, otherwise opens the auth
  // modal and stashes `action` to run right after a successful login/signup.
  requireAuth: (action: () => void) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ needsConfirmation: boolean }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"login" | "signup">("login");
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  // Restore session on mount, then stay in sync with Supabase's own
  // auth state (handles token refresh, logout in another tab, etc.).
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          name: session.user.user_metadata?.full_name ?? session.user.email!.split("@")[0],
          email: session.user.email!,
        });
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser({
            name:
              session.user.user_metadata?.full_name ??
              session.user.email!.split("@")[0],
            email: session.user.email!,
          });
        } else {
          setUser(null);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const openAuthModal = useCallback((mode: "login" | "signup" = "login") => {
    setModalMode(mode);
    setIsModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsModalOpen(false);
    setPendingAction(null);
  }, []);

  const requireAuth = useCallback(
    (action: () => void) => {
      if (user) {
        action();
      } else {
        setPendingAction(() => action);
        openAuthModal("login");
      }
    },
    [user, openAuthModal]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setIsModalOpen(false);
      pendingAction?.();
      setPendingAction(null);
    },
    [pendingAction]
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) throw error;

      // If email confirmation is enabled in Supabase (Auth > Providers >
      // Email), signUp succeeds but returns no session until the user
      // clicks the confirmation link — don't close the modal or run the
      // pending action in that case, or it'll look like login worked
      // when the user actually isn't authenticated yet.
      if (!data.session) {
        return { needsConfirmation: true };
      }

      setIsModalOpen(false);
      pendingAction?.();
      setPendingAction(null);
      return { needsConfirmation: false };
    },
    [pendingAction]
  );

  const logout = useCallback(() => {
    supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isModalOpen,
        modalMode,
        openAuthModal,
        closeAuthModal,
        requireAuth,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
