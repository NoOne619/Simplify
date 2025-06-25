import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { BookOpen, Heart, ExternalLink, Users, Coffee, Search, Trash2 } from "lucide-react";
import { useAuth } from "@/utils/auth";
import { getFeedPosts, likePost, getUserPosts, deletePost } from "@/utils/api";

interface Source {
  title: string;
  url: string;
  website: string;
}

interface FeedSummary {
  id: string;
  topic: string;
  summary: string;
  sources: Source[];
  user: {
    name: string;
    avatar: string;
  };
  likes: number;
  createdAt: string;
  isLiked: boolean;
}

const Feed = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("community");
  const [searchTerm, setSearchTerm] = useState("");
  const [feedSummaries, setFeedSummaries] = useState<FeedSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        let posts: FeedSummary[];
        if (activeTab === "my" && isAuthenticated) {
          try {
            posts = await getUserPosts();
          } catch (err: any) {
            if (err.message.includes("No posts found") || err.response?.status === 404) {
              posts = [];
            } else {
              throw err;
            }
          }
        } else {
          posts = await getFeedPosts();
        }
        console.log("Fetched posts:", posts);
        setFeedSummaries(posts);
        setError(null);
      } catch (err: any) {
        console.error("Fetch posts error:", err);
        setError(err.message || "Failed to fetch posts");
        toast({
          title: "You have no posts yet",
          description: "Please create a summary to share with the community",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [activeTab, isAuthenticated, toast]);

  const handleLike = async (summaryId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please log in to like summaries",
        action: (
          <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
            Login
          </Button>
        ),
      });
      return;
    }

    const originalSummaries = [...feedSummaries];
    setFeedSummaries(prevSummaries =>
      prevSummaries.map(summary => {
        if (summary.id === summaryId) {
          const newIsLiked = !summary.isLiked;
          return {
            ...summary,
            isLiked: newIsLiked,
            likes: newIsLiked ? summary.likes + 1 : summary.likes - 1,
          };
        }
        return summary;
      })
    );

    try {
      const response = await likePost(summaryId);
      setFeedSummaries(prevSummaries =>
        prevSummaries.map(summary =>
          summary.id === summaryId
            ? { ...summary, likes: response.likes, isLiked: response.isLiked }
            : summary
        )
      );
      toast({
        title: "Success",
        description: response.isLiked ? "Post liked" : "Post unliked",
      });
    } catch (err: any) {
      setFeedSummaries(originalSummaries);
      toast({
        title: "Error",
        description: err.message || "Failed to update like",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    const originalSummaries = [...feedSummaries];
    setFeedSummaries(prevSummaries => prevSummaries.filter(summary => summary.id !== postId));

    try {
      const response = await deletePost(postId);
      toast({
        title: "Success",
        description: response.message || "Post deleted successfully",
      });
    } catch (err: any) {
      setFeedSummaries(originalSummaries); // Revert on error
      toast({
        title: "Error",
        description: err.message || "Failed to delete post",
        variant: "destructive",
      });
      // Refetch to restore state
      const posts = activeTab === "my" && isAuthenticated ? await getUserPosts() : await getFeedPosts();
      setFeedSummaries(posts);
    }
  };

  const filteredSummaries = feedSummaries.filter(summary =>
    summary.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    summary.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="summary-container">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0 text-gradient">Community Feed</h1>
        <div className="hidden sm:flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/")}
            className="card-hover"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Create Summary
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="md:col-span-3">
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Discover Summaries</CardTitle>
              </div>
              <CardDescription>
                Explore summaries shared by our community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search topics or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
              </div>

              <Tabs defaultValue="community" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="community" className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Community Feed
                  </TabsTrigger>
                  {isAuthenticated && (
                    <TabsTrigger value="my" className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      My Feed
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="community">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-4 text-muted-foreground">Loading summaries...</p>
                    </div>
                  ) : error ? (
                    <EmptyState
                      message="Failed to load summaries. Please try again later."
                      navigateTo={() => navigate("/")}
                    />
                  ) : filteredSummaries.length > 0 ? (
                    <div className="space-y-4">
                      {filteredSummaries.map((summary) => (
                        <UserSummaryCard
                          key={summary.id}
                          summary={summary}
                          onLike={() => handleLike(summary.id)}
                          onDelete={user?.name === summary.user.name ? () => handleDelete(summary.id) : undefined}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      message="Be the first to share a summary with the community. Create and share your own summaries to get started."
                      navigateTo={() => navigate("/")}
                    />
                  )}
                </TabsContent>

                <TabsContent value="my">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-4 text-muted-foreground">Loading summaries...</p>
                    </div>
                  ) : error ? (
                    <EmptyState
                      message="Failed to load your summaries. Please try again later."
                      navigateTo={() => navigate("/")}
                    />
                  ) : filteredSummaries.length > 0 ? (
                    <div className="space-y-4">
                      {filteredSummaries.map((summary) => (
                        <UserSummaryCard
                          key={summary.id}
                          summary={summary}
                          onLike={() => handleLike(summary.id)}
                          onDelete={user?.name === summary.user.name ? () => handleDelete(summary.id) : undefined}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      message="You haven't shared any summaries yet. Create and share your own summaries to get started."
                      navigateTo={() => navigate("/")}
                    />
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="hidden md:block">
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Popular Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                    #Technology
                  </Badge>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                    #AI
                  </Badge>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                    #Science
                  </Badge>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                    #Business
                  </Badge>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                    #Health
                  </Badge>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                    #Environment
                  </Badge>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                    #Programming
                  </Badge>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                    #Design
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Updated UserSummaryCard component
const UserSummaryCard = ({ summary, onLike, onDelete }: { summary: FeedSummary, onLike: () => void, onDelete?: () => void }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="card-hover animate-fade-in overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium">
              {summary.user.avatar}
            </div>
            <div>
              <CardTitle className="text-base">{summary.user.name}</CardTitle>
              <CardDescription className="text-xs">
                Shared on {new Date(summary.createdAt).toLocaleDateString()}
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="bg-primary/10 hover:bg-primary/20">
            {summary.sources.length} {summary.sources.length === 1 ? "source" : "sources"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-0">
        <h3 className="font-semibold text-lg mb-2">{summary.topic}</h3>
        <div className="prose prose-sm max-w-none text-muted-foreground">
          {expanded ? (
            <p>{summary.summary}</p>
          ) : (
            <p>
              {summary.summary.length > 180
                ? `${summary.summary.substring(0, 180)}...`
                : summary.summary}
            </p>
          )}
        </div>

        {summary.summary.length > 180 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-primary text-xs"
          >
            {expanded ? "Show less" : "Read more"}
          </Button>
        )}

        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2 flex items-center">
            <ExternalLink className="mr-2 h-3 w-3" /> Sources
          </h4>
          <div className="space-y-1">
            {summary.sources.map((source, idx) => (
              <div key={idx} className="text-xs text-muted-foreground flex items-center">
                <span className="truncate">{source.website}</span>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-primary hover:underline inline-flex items-center"
                >
                  View <ExternalLink className="h-2 w-2 ml-1" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <div className="flex items-center justify-between w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLike}
            className={`flex items-center gap-1 ${summary.isLiked ? "text-red-500" : ""}`}
          >
            <Heart className={`h-4 w-4 ${summary.isLiked ? "fill-red-500" : ""}`} />
            <span>{summary.likes}</span>
          </Button>
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

const EmptyState = ({ message, navigateTo }: { message?: string; navigateTo: () => void }) => (
  <div className="text-center py-12">
    <div className="bg-muted/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
      <Coffee className="h-8 w-8 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-medium">Nothing to see here yet</h3>
    <p className="text-muted-foreground mt-2 max-w-md mx-auto">
      {message || "Be the first to share a summary with the community. Create and share your own summaries to get started."}
    </p>
    <Button variant="outline" className="mt-4" onClick={navigateTo}>
      Create a Summary
    </Button>
  </div>
);

export default Feed;