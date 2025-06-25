import { Button } from "@/components/ui/button";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { FileText, History, LogIn, LogOut, User, Users, Menu, X } from "lucide-react";
import { useAuth } from "@/utils/auth";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Debug logging
  console.log("Navbar - isAuthenticated:", isAuthenticated);
  console.log("Navbar - user:", user);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Avatar logic: Get first two initials, uppercase (e.g., "Abdullah Mehmood" -> "AM")
  const getAvatar = (name: string | undefined) => {
    if (!name) return "U";
    const initials = name
      .split(" ")
      .map(n => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    return initials || "U";
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-border sticky top-0 z-10 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <FileText className="h-8 w-8 text-primary group-hover:animate-bounce-subtle" />
              <span className="ml-2 text-xl font-bold text-gradient">
                Simplify
              </span>
            </Link>
            
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
              <Button
                variant={isActive("/") ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate("/")}
                className="flex items-center"
              >
                <FileText className="mr-2 h-4 w-4" />
                Create
              </Button>
              
              <Button
                variant={isActive("/feed") ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate("/feed")}
                className="flex items-center"
              >
                <Users className="mr-2 h-4 w-4" />
                Feed
              </Button>
              
              {isAuthenticated && (
                <Button
                  variant={isActive("/history") ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigate("/history")}
                  className="flex items-center"
                >
                  <History className="mr-2 h-4 w-4" />
                  History
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            <div className="hidden md:flex md:items-center md:space-x-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center mr-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium">
                      {getAvatar(user?.name)}
                    </div>
                    <span className="ml-2 text-sm font-medium hidden lg:block">
                      {user?.name || 'User'}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="flex items-center hover:bg-primary/10 dark:hover:bg-primary/20"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/login")}
                    className="flex items-center hover:bg-primary/10 dark:hover:bg-primary/20"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/register")}
                    className="flex items-center hover:shadow-md transition-shadow"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Register
                  </Button>
                </>
              )}
            </div>
            
            <div className="md:hidden flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                className="p-1"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-t border-border animate-fade-in">
          <div className="pt-2 pb-4 space-y-1 px-4">
            <Button
              variant={isActive("/") ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                navigate("/");
                setMobileMenuOpen(false);
              }}
            >
              <FileText className="mr-2 h-4 w-4" />
              Create Summary
            </Button>
            
            <Button
              variant={isActive("/feed") ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                navigate("/feed");
                setMobileMenuOpen(false);
              }}
            >
              <Users className="mr-2 h-4 w-4" />
              Community Feed
            </Button>
            
            {isAuthenticated && (
              <Button
                variant={isActive("/history") ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  navigate("/history");
                  setMobileMenuOpen(false);
                }}
              >
                <History className="mr-2 h-4 w-4" />
                History
              </Button>
            )}
            
            <div className="pt-2 mt-2 border-t border-border">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center py-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium">
                      {getAvatar(user?.name)}
                    </div>
                    <span className="ml-2 text-sm font-medium">
                      {user?.name || 'User'}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate("/login");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start mt-2"
                    onClick={() => {
                      navigate("/register");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Register
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;