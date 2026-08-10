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
  address: string;
  phone: string;
  phoneVerified: boolean;
  avatarUrl: string;
};

type PendingAction = (() => void) | null;

type AuthContextValue = {
  user: User | null;
  isAdmin: boolean;
  isModalOpen: boolean;
  modalMode: "login" | "signup";
  openAuthModal: (mode?: "login" | "signup") => void;
  closeAuthModal: () => void;
  requireAuth: (action: () => void) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ needsConfirmation: boolean; alreadyRegistered: boolean }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function checkIsAdmin(accessToken: string) {
  try {
    const res = await fetch("/api/admin/check", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    return Boolean(data.isAdmin);
  } catch {
    return false;
  }
}

function mapUser(supabaseUser: NonNullable<
  Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]
>["user"]): User {
  return {
    name: supabaseUser.user_metadata?.full_name ?? supabaseUser.email!.split("@")[0],
    email: supabaseUser.email!,
    address: supabaseUser.user_metadata?.address ?? "",
    phone: supabaseUser.user_metadata?.phone ?? "",
    phoneVerified: Boolean(supabaseUser.user_metadata?.phone_verified),
    avatarUrl: supabaseUser.user_metadata?.avatar_url ?? "",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"login" | "signup">("login");
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(mapUser(session.user));
        checkIsAdmin(session.access_token).then(setIsAdmin);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(mapUser(session.user));
          checkIsAdmin(session.access_token).then(setIsAdmin);
        } else {
          setUser(null);
          setIsAdmin(false);
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

      if (error) {
        // Supabase returns a real error for this in some configs.
        if (/already registered|already exists/i.test(error.message)) {
          return { needsConfirmation: false, alreadyRegistered: true };
        }
        throw error;
      }

      // With "Confirm email" on, Supabase intentionally returns success
      // (not an error) for an already-registered email, to avoid leaking
      // which emails exist. The tell is an empty identities array.
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        return { needsConfirmation: false, alreadyRegistered: true };
      }

      if (!data.session) {
        return { needsConfirmation: true, alreadyRegistered: false };
      }

      setIsModalOpen(false);
      pendingAction?.();
      setPendingAction(null);
      return { needsConfirmation: false, alreadyRegistered: false };
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
        isAdmin,
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
