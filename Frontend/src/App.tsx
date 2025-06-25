
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/utils/auth";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import Navbar from "@/components/layout/Navbar";
import Index from "./pages/Index";
import History from "./pages/History";
import Feed from "./pages/Feed";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Navigate } from "react-router-dom";
import Chatbot from "./pages/Chatbot";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system">
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/home" element={<Index />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/feed" element={<Feed />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/chat" element={<Chatbot />} />                  
                  <Route path="*" element={<Navigate to="/home" replace />} />
                </Routes>
                <Toaster />
              </main>
            </div>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
