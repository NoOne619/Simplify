import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Maximize2, Minimize2, BookOpen, Edit, Check, X, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/utils/auth";
import { storeSummary } from "@/utils/api";

interface Source {
  title: string;
  url: string;
  website: string;
}

interface SummaryDisplayProps {
  summary: string;
  sources: Source[] | undefined;
  topic: string;
  onSummaryUpdate?: (updatedSummary: string, updatedTopic: string) => void;
}

const SummaryDisplay = ({ summary, sources = [], topic, onSummaryUpdate }: SummaryDisplayProps) => {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState(summary);
  const [editedTopic, setEditedTopic] = useState(topic);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  if (!summary) return null;

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const startEditing = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please log in to edit summaries",
        variant: "destructive",
      });
      return;
    }
    setEditedSummary(summary);
    setEditedTopic(topic);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setEditedSummary(summary);
    setEditedTopic(topic);
  };

  const saveEdits = () => {
    if (!editedTopic.trim()) {
      toast({
        title: "Invalid topic",
        description: "Topic cannot be empty",
        variant: "destructive",
      });
      return;
    }
    if (onSummaryUpdate) {
      onSummaryUpdate(editedSummary, editedTopic);
    }
    setEditing(false);
    toast({
      title: "Summary updated",
      description: "Your changes have been saved successfully",
    });
  };

  const handleStoreSummary = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please log in to store summaries",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await storeSummary(editedSummary, sources, editedTopic);
      toast({
        title: "Summary stored",
        description: `Summary saved successfully!`,
      });
    } catch (error: any) {
      toast({
        title: "Error storing summary",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const paragraphs = summary.split('\n');
  const displayParagraphs = expanded ? paragraphs : paragraphs.slice(0, 2);
  const hasMoreParagraphs = paragraphs.length > 2;

  return (
    <div className="space-y-6 mt-6 animate-fade-in">
      <Card className="gradient-border-card">
        <div className="inner-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="outline" className="mb-2 bg-primary/10 hover:bg-primary/20">
                  {sources.length} {sources.length === 1 ? 'source' : 'sources'}
                </Badge>
                <CardTitle className="text-2xl">
                  {editing ? (
                    <Input
                      value={editedTopic}
                      onChange={(e) => setEditedTopic(e.target.value)}
                      className="text-2xl font-bold"
                      placeholder="Enter topic"
                    />
                  ) : (
                    `Summary: ${editedTopic}`
                  )}
                </CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <BookOpen className="mr-1 h-3.5 w-3.5" />
                  Based on top articles about this topic
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                {isAuthenticated && (
                  <>
                    {!editing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={startEditing}
                        className="hover:bg-secondary"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleStoreSummary}
                      className="hover:bg-secondary"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Store Summary
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-4">
                <Textarea
                  value={editedSummary}
                  onChange={(e) => setEditedSummary(e.target.value)}
                  className="min-h-[300px] font-sans"
                  placeholder="Edit your summary..."
                />
                <Alert>
                  <AlertDescription>
                    You are editing this summary and topic. Your changes will be visible to anyone you share this with.
                  </AlertDescription>
                </Alert>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={cancelEditing}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button onClick={saveEdits}>
                    <Check className="h-4 w-4 mr-1" />
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="prose prose-blue dark:prose-invert max-w-none">
                {displayParagraphs.map((paragraph, index) => (
                  <p key={index} className="mb-4 leading-relaxed">{paragraph}</p>
                ))}
                {hasMoreParagraphs && !expanded && (
                  <div className="text-center mt-2 pb-2">
                    <span className="text-muted-foreground text-sm">
                      {paragraphs.length - 2} more {paragraphs.length - 2 === 1 ? 'paragraph' : 'paragraphs'}
                    </span>
                  </div>
                )}
              </div>
            )}

            <Separator className="my-6" />

            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <ExternalLink className="mr-2 h-4 w-4" /> Sources
              </h3>
              {sources.length > 0 ? (
                <div className="space-y-3">
                  {sources.map((source, index) => (
                    <div key={index} className="flex items-start animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                      <Badge variant="outline" className="mr-2 mt-1 bg-secondary">
                        {index + 1}
                      </Badge>
                      <div className="flex-1">
                        <h4 className="font-medium">{source.title}</h4>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span>{source.website}</span>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 flex items-center text-primary hover:underline"
                          >
                            Visit <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No sources available.</p>
              )}
            </div>
          </CardContent>
          {hasMoreParagraphs && !editing && (
            <CardFooter className="pt-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleExpand}
                className="ml-auto text-primary"
              >
                {expanded ? (
                  <>
                    <Minimize2 className="mr-1 h-4 w-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <Maximize2 className="mr-1 h-4 w-4" />
                    Read More
                  </>
                )}
              </Button>
            </CardFooter>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SummaryDisplay;