
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, File } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface DownloadOptionsProps {
  summaryText: string;
  title: string;
  onDownload: (text: string, title: string, format: "txt" | "pdf" | "docx") => Promise<void>;
}

const DownloadOptions = ({ summaryText, title, onDownload }: DownloadOptionsProps) => {
  const [format, setFormat] = useState<"txt" | "pdf" | "docx">("pdf");
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!summaryText) return;
    
    setIsDownloading(true);
    try {
      await onDownload(summaryText, title, format);
      toast.success(`Summary downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error downloading summary:', error);
      toast.error('Failed to download summary');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!summaryText) return null;

  return (
    <Card className="overflow-hidden border-t-4 border-primary transition-all duration-300 hover:shadow-md dark:bg-gray-800 dark:border-blue-400">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent dark:from-blue-500/20 dark:to-transparent">
        <CardTitle className="flex items-center">
          <Download className="mr-2 h-5 w-5" />
          Download Summary
        </CardTitle>
        <CardDescription className="dark:text-gray-300">
          Save the summary to your device in various formats
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <RadioGroup value={format} onValueChange={(value) => setFormat(value as any)} className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2 transition-transform hover:scale-105">
              <RadioGroupItem value="pdf" id="pdf" />
              <Label htmlFor="pdf" className="flex items-center cursor-pointer">
                <File className="mr-2 h-4 w-4 text-red-500" />
                PDF
              </Label>
            </div>
            <div className="flex items-center space-x-2 transition-transform hover:scale-105">
              <RadioGroupItem value="docx" id="docx" />
              <Label htmlFor="docx" className="flex items-center cursor-pointer">
                <File className="mr-2 h-4 w-4 text-blue-500" />
                Word (DOCX)
              </Label>
            </div>
            <div className="flex items-center space-x-2 transition-transform hover:scale-105">
              <RadioGroupItem value="txt" id="txt" />
              <Label htmlFor="txt" className="flex items-center cursor-pointer">
                <FileText className="mr-2 h-4 w-4 text-gray-500" />
                Text (TXT)
              </Label>
            </div>
          </RadioGroup>

          <Button 
            onClick={handleDownload} 
            disabled={isDownloading || !summaryText}
            className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary transition-all duration-300 dark:from-blue-500 dark:to-blue-600"
          >
            {isDownloading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-primary-foreground animate-spin mr-2" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4 animate-bounce-subtle" />
                Download
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DownloadOptions;
