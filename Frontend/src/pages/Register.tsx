import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import AuthForm from "@/components/auth/AuthForm";
import { useAuth } from "@/utils/auth";
import { Separator } from "@/components/ui/separator";
import { FileText, Shield, Gift, Star, CheckCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const Register = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect if already authenticated (e.g., on page load)
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Handle successful registration
  const handleRegisterSuccess = () => {
    toast({
      title: "Registration Successful",
      description: "Your account has been created!",
    });
    // Navigate to login after a delay to show toast
   
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-background to-secondary/5">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 items-center">
        <div className="w-full md:w-1/2 space-y-6">
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-3xl font-bold text-gradient">Join Our Community</h1>
            <p className="text-muted-foreground">
              Create an account to start summarizing content, sharing with others, and growing your knowledge
            </p>
          </div>
          
          <div className="hidden md:block space-y-6">
            <div className="space-y-4">
              <div className="bg-card rounded-lg border border-border p-5 card-hover animate-fade-in">
                <div className="flex items-center mb-4">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <Gift className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Benefits of Joining</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Create unlimited summaries from top blogs</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Save and organize your summary history</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Share summaries with the community</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Access audio versions of your summaries</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-primary/5 rounded-lg border border-primary/20 p-5 animate-fade-in" style={{ animationDelay: "200ms" }}>
                <div className="flex items-center mb-4">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <Star className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Featured Reviews</h3>
                </div>
                <div className="space-y-3">
                  <div className="bg-background/40 p-3 rounded-md">
                    <div className="flex items-center">
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-current" />
                        ))}
                      </div>
                      <span className="text-sm font-medium ml-2">Alex P.</span>
                    </div>
                    <p className="text-sm mt-1">
                      "This tool has completely transformed how I keep up with industry news. The summaries are accurate and save me hours each week."
                    </p>
                  </div>
                  <div className="bg-background/40 p-3 rounded-md">
                    <div className="flex items-center">
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-current" />
                        ))}
                      </div>
                      <span className="text-sm font-medium ml-2">Maria T.</span>
                    </div>
                    <p className="text-sm mt-1">
                      "The audio feature lets me listen to summaries while commuting. Great for busy professionals!"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-1/2 max-w-md">
          <Card className="w-full shadow-lg border-primary/10 animate-fade-in">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center mb-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
              <CardDescription className="text-center">
                Enter your information to create your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuthForm type="register" onSuccess={handleRegisterSuccess} />
              
              <div className="relative my-6">
                <Separator />
                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-2 bg-card text-xs text-muted-foreground">OR SIGN UP WITH</span>
              </div>
              
              
            </CardContent>
            <CardFooter className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Sign in
                </Link>
              </div>
            
            </CardFooter>
          </Card>
          
          <div className="flex items-center justify-center space-x-2 mt-6 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30">
              <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs text-muted-foreground">
              Secure, encrypted registration process
            </span>
          </div>
          
          <div className="text-center text-xs text-muted-foreground mt-4">
            By creating an account, you agree to our
            <Link to="#" className="text-primary hover:underline mx-1">Terms of Service</Link>
            and
            <Link to="#" className="text-primary hover:underline ml-1">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;