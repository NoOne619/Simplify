import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/utils/auth";

const AuthForm = ({ type, onSuccess }: { type: "login" | "register"; onSuccess?: () => void }) => {
  const { login, register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (type === "register") {
        await register(formData.name, formData.email, formData.password);
      } else {
        await login(formData.email, formData.password);
      }
      // Reset form on success
      setFormData({ name: "", email: "", password: "" });
      // Trigger onSuccess callback
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {type === "register" && (
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
            disabled={isLoading}
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          required
          disabled={isLoading}
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Processing..." : type === "register" ? "Sign Up" : "Sign In"}
      </Button>
    </form>
  );
};

export default AuthForm;