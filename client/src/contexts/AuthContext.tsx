import { createContext, useEffect, useState, ReactNode } from "react";
import { User } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Load authentication state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("skillhub_token");
    const storedUser = localStorage.getItem("skillhub_user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        // Clear invalid data
        localStorage.removeItem("skillhub_token");
        localStorage.removeItem("skillhub_user");
      }
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    // Store authentication data
    localStorage.setItem("skillhub_token", newToken);
    localStorage.setItem("skillhub_user", JSON.stringify(newUser));
    
    // Update state
    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    // Clear authentication data
    localStorage.removeItem("skillhub_token");
    localStorage.removeItem("skillhub_user");
    
    // Update state
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    
    // Clear cache
    queryClient.clear();
  };

  const updateUser = (updatedUser: User) => {
    // Update user in localStorage
    localStorage.setItem("skillhub_user", JSON.stringify(updatedUser));
    
    // Update state
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        token,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
