import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link, Share2, Heart, Copy, CheckCircle, MessageCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/utils/auth";
import { sharePost } from "@/utils/api";

interface ShareOptionsProps {
  summaryText: string;
  title: string;
  sources: { title: string; url: string; website: string }[];
}

const ShareOptions = ({ 
  summaryText, 
  title, 
  sources,
}: ShareOptionsProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [copied, setCopied] = useState(false);
  const truncatedSummary = summaryText.length > 100 
    ? summaryText.substring(0, 100) + "..." 
    : summaryText;

  const shareUrl = window.location.href;
  const encodedText = encodeURIComponent(`Check out this summary about "${title}": ${truncatedSummary} ${shareUrl}`);

  const socialLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodedText}`,
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({
      title: "Link copied to clipboard",
      description: "You can now share this summary with others",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareToFeed = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please log in to share posts",
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
      return;
    }

    try {
      const urls = sources.map(source => source.url);
      await sharePost(summaryText, title, urls);
      toast({
        title: "Success",
        description: "Post shared to community feed",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to share post",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full card-hover">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Share2 className="mr-2 h-5 w-5 text-primary" />
          Share This Summary
        </CardTitle>
        <CardDescription>
          Share this summary with others or on social media
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="social" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="link">Copy Link</TabsTrigger>
          </TabsList>

          <TabsContent value="social" className="pt-4">
            <div className="flex justify-center space-x-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={socialLinks.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366] transition-colors hover:bg-[#25D366]/20"
                      aria-label="Share on WhatsApp"
                    >
                      <MessageCircle className="h-5 w-5" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share on WhatsApp</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </TabsContent>

          <TabsContent value="link" className="pt-4">
            <div className="flex space-x-2">
              <Input 
                value={shareUrl} 
                readOnly 
                className="flex-1 bg-muted/50"
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyToClipboard}
                className="min-w-[100px]"
              >
                {copied ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" /> Copy
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="flex items-center justify-center space-x-4">
          <Button 
            variant="default" 
            size="sm"
            className="bg-primary/80 hover:bg-primary"
            onClick={handleShareToFeed}
          >
            <Share2 className="mr-1 h-4 w-4" />
            Share to Feed
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShareOptions;
