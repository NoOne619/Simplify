import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { History as HistoryIcon, FileText, ExternalLink, Clock, BookOpen, TrendingUp, Info, Store, Trash2 } from "lucide-react";
import { useAuth } from "@/utils/auth";
import { getSummaryHistory, deleteSummary, SummaryHistoryItem } from "@/utils/api";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

const History = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [history, setHistory] = useState<SummaryHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<"card" | "table">("card");
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null); // Track which summary is being deleted

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate("/login");
      return;
    }

    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const data = await getSummaryHistory();
        setHistory(data);
        console.log("History data loaded:", data);
      } catch (error: any) {
        console.error("Error loading history:", error);
        toast({
          title: "No History Found",
          description: "Please generate and store summaries to view them",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && !authLoading) {
      loadHistory();
    }
  }, [isAuthenticated, authLoading, navigate, toast]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy • h:mm a");
    } catch {
      return "Invalid date";
    }
  };

  const handleViewDetails = (item: SummaryHistoryItem) => {
    const state = {
      summary: item.summary,
      topic: item.topic,
      sources: item.sources,
    };
    console.log("Navigating to /home with state:", state);
    navigate("/home", { state });
  };

  const handleDelete = async (summaryId: string) => {
    if (!confirm("Are you sure you want to delete this summary?")) return;

    setDeletingId(summaryId); // Set loading state for this specific deletion
    try {
      const response = await deleteSummary(summaryId);
      setHistory(history.filter((item) => item.id !== summaryId));
      toast({
        title: "Success",
        description:  "Summary deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete summary",
        variant: "destructive",
      });
      // Optionally refetch history to restore the UI state
      const data = await getSummaryHistory();
      setHistory(data);
    } finally {
      setDeletingId(null); // Clear loading state
    }
  };

  const userStats = {
    totalSummaries: history.length,
    topTopic: history.length > 0 ? history[0].topic : "None yet",
    readingTime: history.reduce((acc, item) => acc + (item.summary.length / 1000), 0).toFixed(1),
    lastActive: history.length > 0 ? formatDate(history[0].createdAt) : "No activity yet",
  };

  const summaryTips = [
    "Use specific topics to get more focused summaries",
    "Try different websites for diverse perspectives",
    "Shorter summaries are great for quick overviews, longer ones for depth",
    "Save your best summaries for quick reference later",
  ];

  return (
    <div className="summary-container">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <HistoryIcon className="mr-2 h-6 w-6" />
          <h1 className="page-title mb-0">Your Summary History</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={activeView === "card" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveView("card")}
          >
            <FileText className="h-4 w-4 mr-1" />
            Card View
          </Button>
          <Button
            variant={activeView === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveView("table")}
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            Table View
          </Button>
        </div>
      </div>

      <Card className="mb-6 bg-gradient-to-r from-secondary/30 to-primary/20 border-none shadow-md hover:shadow-lg transition-all">
        <CardHeader>
          <CardTitle className="text-gradient">Summary Dashboard</CardTitle>
          <CardDescription>Track your summarization journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="stats-card p-4 bg-card/80 rounded-md shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Total Summaries</h3>
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold">{userStats.totalSummaries}</p>
            </div>
            <div className="stats-card p-4 bg-card/80 rounded-md shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Top Topic</h3>
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <p className="text-lg font-semibold truncate">{userStats.topTopic}</p>
            </div>
            <div className="stats-card p-4 bg-card/80 rounded-md shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Reading Time Saved</h3>
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold">{userStats.readingTime} min</p>
            </div>
            <div className="stats-card p-4 bg-card/80 rounded-md shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Last Activity</h3>
                <HistoryIcon className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm font-medium">{userStats.lastActive}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading || authLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      ) : history.length === 0 ? (
        <div className="space-y-6">
          <Card className="card-hover">
            <CardContent className="pt-6 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4 animate-bounce-subtle" />
              <h3 className="text-xl font-semibold mb-2">No summaries yet</h3>
              <p className="text-muted-foreground mb-4">
                Generate your first blog summary to see it here
              </p>
              <Button onClick={() => navigate("/home")}>Generate Summary</Button>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-accent/20 to-background border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="h-5 w-5 mr-2 text-primary" />
                Pro Tips for Better Summaries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {summaryTips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/20 text-primary font-medium text-sm mr-3">
                      {index + 1}
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate("/home")}>
                Try These Tips Now
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : activeView === "card" ? (
        <div className="space-y-6">
          {history.map((item) => (
            <Card key={item.id} className="card-hover">
              <CardHeader>
                <CardTitle>{item.topic}</CardTitle>
                <CardDescription className="flex items-center">
                  <Clock className="mr-1 h-3.5 w-3.5" />
                  {formatDate(item.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 mb-4">{item.summary}</p>
                <div>
                  <h4 className="text-sm font-semibold mb-2">Sources:</h4>
                  <div className="space-y-1">
                    {item.sources.map((source, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <span className="text-muted-foreground">{source.website}:</span>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-primary hover:underline truncate"
                          title={source.url}
                        >
                          {source.url.length > 30
                            ? `${source.url.slice(0, Math.floor(source.url.length / 2))}...`
                            : source.url}
                          <ExternalLink className="h-3 w-3 ml-1 inline-block flex-shrink-0" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(item)}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                  >
                    {deletingId === item.id ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2" />
                        Deleting...
                      </div>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Topic</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Sources</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/40">
                    <TableCell className="font-medium">{item.topic}</TableCell>
                    <TableCell>{formatDate(item.createdAt)}</TableCell>
                    <TableCell>{item.sources.length} sources</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(item)}
                        >
                          View
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                        >
                          {deletingId === item.id ? (
                            <div className="flex items-center">
                              <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2" />
                              Deleting...
                            </div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default History;