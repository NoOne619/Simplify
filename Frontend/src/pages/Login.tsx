import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import AuthForm from "@/components/auth/AuthForm";
import { useAuth } from "@/utils/auth";
import { FileText, Lock, ShieldCheck, CheckCircle, LayoutGrid } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleLoginSuccess = () => {
    toast({
      title: "Login Successful",
      description: "Welcome back! You are now logged in.",
    });
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  const features = [
    { icon: FileText, title: "Create Summaries", description: "Generate concise summaries from multiple sources" },
    { icon: LayoutGrid, title: "Community Feed", description: "Discover summaries shared by others" },
    { icon: ShieldCheck, title: "Secure Storage", description: "All your summaries are safely stored" },
    { icon: CheckCircle, title: "Premium Features", description: "Access advanced tools and analytics" }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-background to-secondary/5">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 items-center">
        <div className="w-full md:w-1/2 space-y-6">
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-3xl font-bold text-gradient">Welcome Back!</h1>
            <p className="text-muted-foreground">
              Log in to your account to access your summaries and personalized features
            </p>
          </div>

          <div className="hidden md:block space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-card rounded-lg border border-border animate-fade-in card-hover" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="mt-1 bg-primary/10 p-2 rounded-full">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Privacy Focused</h3>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                We respect your privacy and ensure your data is handled with care. Your summaries are only visible to you unless you choose to share them.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 max-w-md">
          <Card className="w-full shadow-lg border-primary/10 animate-fade-in">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center mb-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuthForm type="login" onSuccess={handleLoginSuccess} />
            </CardContent>
            <CardFooter className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm text-muted-foreground">
                Don't have an account? {" "}
                <Link
                  to="/register"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </Card>

          <div className="text-center text-xs text-muted-foreground mt-4">
            By logging in, you agree to our
            <Link to="#" className="text-primary hover:underline mx-1">Terms of Service</Link>
            and
            <Link to="#" className="text-primary hover:underline ml-1">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
