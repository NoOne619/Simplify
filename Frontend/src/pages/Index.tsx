import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import WebsiteSelector from "@/components/summary/WebsiteSelector";
import TopicInput from "@/components/summary/TopicInput";
import SummaryDisplay from "@/components/summary/SummaryDisplay";
import AudioPlayer from "@/components/summary/AudioPlayer";
import DownloadOptions from "@/components/summary/DownloadOptions";
import ShareOptions from "@/components/summary/ShareOptions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/utils/auth";
import { getArticleSummary, generateAudio, downloadSummary } from "@/utils/api";
import { FileText, AlertCircle, TrendingUp, BookOpen, History, Sparkles, Users, Zap, Star, Award, Bookmark, Loader2, MessageSquare } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

interface Source {
  title: string;
  url: string;
  website: string;
}

interface NavigationState {
  summary: string;
  topic: string;
  sources: Source[];
}

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth(); // Added user to get email
  const { toast } = useToast();
  const [selectedWebsites, setSelectedWebsites] = useState<string[]>([]);
  const [searchTopic, setSearchTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [navState, setNavState] = useState<NavigationState | null>(null);

  useEffect(() => {
    console.log("Index useEffect - Location:", location);
    console.log("Index useEffect - location.state:", location.state);

    if (location.state) {
      const { summary, topic, sources } = location.state as {
        summary?: string;
        topic?: string;
        sources?: Source[];
      };
      
      if (summary && topic && sources) {
        console.log("Applying state:", { summary, topic, sources });
        setNavState({ summary, topic, sources });
        setSummary(summary);
        setSearchTopic(topic);
        setSources(sources);
        setSelectedWebsites(sources.map((source) => source.website));
        setIsLiked(false);
        setLikesCount(Math.floor(Math.random() * 50));
      } else {
        console.log("Incomplete state data:", { summary, topic, sources });
      }
    } else {
      console.log("No location.state provided");
    }

    console.log("Current component state:", { summary, searchTopic, sources, selectedWebsites, navState });
  }, [location]);

  const handleClearNavState = () => {
    console.log("Clearing navState");
    setNavState(null);
  };

  const trendingTopics = [
    "AI Ethics",
    "Sustainable Energy",
    "Remote Work",
    "Quantum Computing",
    "Mental Health",
    "Blockchain",
  ];

  const sendEmailNotification = async (email: string, topic: string) => {
    try {
      const response = await fetch("http://localhost:5000/api/email/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: email,
          subject: `Summary Generated for ${topic}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
              <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">Summary Generated</h1>
              <p style="color: #555; font-size: 16px; line-height: 1.5;">
                Hello,<br><br>
                Your summary for "<strong>${topic}</strong>" has been generated successfully. Check it out in the Simplify app.<br><br>
                Best regards,<br>
                <strong>Team Simplify</strong>
              </p>
            </div>
          `,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send email notification");
      }
    } catch (error: any) {
      console.error("Email notification error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send email notification. Please try again later.",
      });
      throw error;
    }
  };

  const handleSearch = async (topic: string) => {
    if (selectedWebsites.length === 0) {
      setError("Please select at least one website.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select at least one website.",
      });
      return;
    }

    console.log("handleSearch called:", { topic, selectedWebsites });
    setIsLoading(true);
    setError(null);
    handleClearNavState();
    try {
      const result = await getArticleSummary({
        websites: selectedWebsites || [],
        topic: topic,
      });

      setSummary(result.summary);
      setSources(result.sources || []);
      setSearchTopic(topic);

      setIsLiked(false);
      setLikesCount(Math.floor(Math.random() * 50));

      // Send email notification if user is authenticated
      let emailSent = false;
      if (isAuthenticated && user?.email) {
        await sendEmailNotification(user.email, topic);
        emailSent = true;
      }

      toast({
        title: "Summary generated successfully!",
        description: emailSent
          ? `We've compiled insights from ${selectedWebsites.join(", ")}. An email notification has been sent.`
          : `We've compiled insights from ${selectedWebsites.join(", ")}.`,
      });
    } catch (error: any) {
      console.error("Error fetching summary:", error);
      setError(error.message || "Failed to generate summary. Please try again.");
      toast({
        variant: "destructive",
        title: "Error generating summary",
        description: error.message || "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummaryUpdate = (updatedSummary: string, updatedTopic: string) => {
    console.log("handleSummaryUpdate called:", { updatedSummary, updatedTopic });
    setSummary(updatedSummary);
    setSearchTopic(updatedTopic);
  };

  const handleGenerateAudio = async (text: string, voiceId: string) => {
    return await generateAudio(text, voiceId);
  };

  const handleDownload = async (
    text: string,
    title: string,
    format: "txt" | "pdf" | "docx"
  ) => {
    try {
      await downloadSummary(text, title, format);
    } catch (error: any) {
      console.error("Handle Download Error:", error);
      throw error;
    }
  };

  const handleLike = () => {
    if (isAuthenticated) {
      setIsLiked(!isLiked);
      setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    } else {
      toast({
        title: "Login required",
        description: "Please log in to like summaries",
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
        ),
      });
    }
  };

  const handleChatWithSummary = () => {
    navigate("/chat", { state: { summary, topic: searchTopic, sources } });
  };

  const handleBookmarkTopic = (topic: string) => {
    if (isAuthenticated) {
      toast({
        title: "Topic bookmarked",
        description: `"${topic}" has been added to your bookmarks.`,
      });
    } else {
      toast({
        title: "Login required",
        description: "Please log in to bookmark topics",
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
        ),
      });
    }
  };

  return (
    <div className="summary-container">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0 text-gradient">Simplify</h1>
        <div className="hidden sm:flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/feed")}
            className="card-hover"
          >
            <Users className="mr-2 h-4 w-4" />
            Community Feed
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/history")}
            className="card-hover"
          >
            <History className="mr-2 h-4 w-4" />
            View History
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="md:col-span-2 card-hover">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Generate Blog Summary
            </CardTitle>
            <CardDescription>
              Select websites and enter a topic to generate a summary of relevant blog posts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <WebsiteSelector
              onWebsiteSelect={setSelectedWebsites}
              selectedWebsites={selectedWebsites}
            />
            <TopicInput onSearch={handleSearch} isLoading={isLoading} />
            {!isAuthenticated && (
              <Alert
                variant="default"
                className="bg-secondary/50 dark:bg-secondary/20"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Login required for full features</AlertTitle>
                <AlertDescription className="flex items-center">
                  To save summaries, access history, and enable downloads, please
                  <Button
                    variant="link"
                    className="p-0 h-auto font-semibold ml-1"
                    onClick={() => navigate("/login")}
                  >
                    log in
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Sparkles className="mr-2 h-5 w-5 text-primary" />
              Why Use Our Summaries?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 rounded-full bg-primary/10 p-1">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium">Save Time</h3>
                <p className="text-sm text-muted-foreground">
                  Get key insights without reading entire articles
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 rounded-full bg-primary/10 p-1">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium">Multiple Sources</h3>
                <p className="text-sm text-muted-foreground">
                  Insights combined from various reputable blogs
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 rounded-full bg-primary/10 p-1">
                <History className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium">Stay Updated</h3>
                <p className="text-sm text-muted-foreground">
                  Access your summary history anytime
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <Card className="mb-6 animate-pulse">
          <CardContent className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Generating summary...</span>
          </CardContent>
        </Card>
      )}

      {!isLoading && !summary && (
        <Card className="mb-6 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="mr-2 h-5 w-5 text-primary" />
              Trending Topics
            </CardTitle>
            <CardDescription>
              Explore popular topics our community is summarizing right now
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="topics">
              

              <TabsContent value="topics">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {trendingTopics.map((topic, index) => (
                    <Card key={index} className="card-hover cursor-pointer">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-sm">{topic}</h3>
                          <p className="text-xs text-muted-foreground">
                            {Math.floor(Math.random() * 50) + 10} summaries
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSearch(topic);
                            }}
                          >
                            <Zap className="h-3.5 w-3.5" />
                          </Button>
                         
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/feed")}
            >
              <Users className="mr-2 h-4 w-4" />
              Explore Community Feed
            </Button>
          </CardFooter>
        </Card>
      )}

      {!isLoading && summary && (
        <SummaryDisplay
          summary={summary}
          sources={sources}
          topic={searchTopic}
          onSummaryUpdate={handleSummaryUpdate}
        />
      )}
      {summary && !isLoading && (
        <div className="mt-6 space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AudioPlayer
              summaryText={summary}
              searchTopic={searchTopic}
              onGenerateAudio={handleGenerateAudio}
            />
            <DownloadOptions
              summaryText={summary}
              title={searchTopic}
              onDownload={handleDownload}
            />
          </div>
          <div className="flex space-x-4">
            <ShareOptions
              summaryText={summary}
              title={searchTopic || "Summary"}
              sources={sources}
            />
            <Button
              onClick={handleChatWithSummary}
              className="card-hover"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat with Summary
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;