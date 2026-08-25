import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type AuthModalTab = "login" | "signup";

type AuthModalState = {
  isOpen: boolean;
  activeTab: AuthModalTab;
  open: (tab?: AuthModalTab) => void;
  close: () => void;
  setTab: (tab: AuthModalTab) => void;
};

const AuthModalContext = createContext<AuthModalState | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AuthModalTab>("login");

  const open = useCallback((tab: AuthModalTab = "login") => {
    setActiveTab(tab);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <AuthModalContext.Provider value={{ isOpen, activeTab, open, close, setTab: setActiveTab }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used inside AuthModalProvider");
  return ctx;
}
