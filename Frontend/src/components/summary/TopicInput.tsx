// src/components/summary/TopicInput.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface TopicInputProps {
  onSearch: (topic: string) => void;
  isLoading: boolean;
}

const TopicInput = ({ onSearch, isLoading }: TopicInputProps) => {
  const [topic, setTopic] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onSearch(topic.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
      <label htmlFor="topic-input" className="text-sm font-medium">
        Enter Topic
      </label>
      <div className="flex space-x-2">
        <Input
          id="topic-input"
          placeholder="e.g., Artificial Intelligence, Climate Change, Nutrition"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !topic.trim()}>
          {isLoading ? (
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-primary-foreground animate-spin mr-2" />
              Searching
            </div>
          ) : (
            <div className="flex items-center">
              <Search className="mr-2 h-4 w-4" />
              Search
            </div>
          )}
        </Button>
      </div>
    </form>
  );
};

export default TopicInput;