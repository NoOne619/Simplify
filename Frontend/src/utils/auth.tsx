import { useState, useEffect, createContext, useContext } from "react";
import axios from "axios";

interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const STORAGE_KEY = "blog_summary_auth";
const TOKEN_KEY = "blog_summary_token";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY);

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && typeof parsedUser === "object" && parsedUser.name && parsedUser.email) {
          // Verify token with backend
          axios.get("http://localhost:5000/api/auth/verify", {
            headers: { Authorization: `Bearer ${storedToken}` },
          })
            .then(response => {
              setUser(parsedUser);
              setIsLoading(false);
            })
            .catch(error => {
              console.warn("Token verification failed:", error.response?.data);
              localStorage.removeItem(STORAGE_KEY);
              localStorage.removeItem(TOKEN_KEY);
              setIsLoading(false);
            });
        } else {
          console.warn("Invalid user data in localStorage, clearing...");
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(TOKEN_KEY);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to parse user data from localStorage:", error);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TOKEN_KEY);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      const { token, user } = response.data;
      console.log("Login response:", { token, user });

      setUser(user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(TOKEN_KEY, token);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
      });
      const { token, user } = response.data;
      console.log("Register response:", { token, user });

      setUser(user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(TOKEN_KEY, token);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};