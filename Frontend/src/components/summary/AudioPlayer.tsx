import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Headphones, Play, Pause, Download, Rewind, FastForward } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/utils/auth";

interface Voice {
  id: string;
  name: string;
  preview?: string;
}

const voices: Voice[] = [
  { id: "en_112", name: "John (Male)" },
  { id: "en_8", name: "Emma (Female)" },
  { id: "en_63", name: "Michael (Male)" },
  { id: "en_0", name: "Sarah (Female)" },
];

interface AudioPlayerProps {
  summaryText: string;
  searchTopic: string;
  onGenerateAudio: (text: string, voiceId: string) => Promise<string>;
}

const AudioPlayer = ({ summaryText, searchTopic, onGenerateAudio }: AudioPlayerProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedVoice, setSelectedVoice] = useState(voices[0].id);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (audioElement) {
        audioElement.pause();
        audioElement.remove();
      }
    };
  }, [audioUrl, audioElement]);

  const handleGenerateAudio = async () => {
    if (!summaryText) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No summary text available to generate audio.",
      });
      return;
    }

    // Sanitize and validate summary text
    const sanitizedText = summaryText
      .replace(/[^\x20-\x7E\n]/g, " ") // Replace non-ASCII with space
      .replace(/\s+/g, " ") // Normalize spaces
      .trim();

    if (!sanitizedText) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Summary text is empty after removing invalid characters.",
      });
      return;
    }

    console.log('AudioPlayer sending text:', {
      text: sanitizedText.slice(0, 50) + (sanitizedText.length > 50 ? '...' : ''),
      length: sanitizedText.length
    });

    setIsGenerating(true);
    try {
      const url = await onGenerateAudio(sanitizedText, selectedVoice);
      setAudioUrl(url);

      const audio = new Audio(url);
      audio.playbackRate = playbackRate;
      setAudioElement(audio);

      audio.addEventListener("ended", () => setIsPlaying(false));
      audio.addEventListener("pause", () => setIsPlaying(false));
      audio.addEventListener("play", () => setIsPlaying(true));

      let emailSent = false;
      if (user?.email) {
        await sendEmailNotification(user.email, searchTopic);
        emailSent = true;
      }

      toast({
        title: "Audio Generated",
        description: emailSent
          ? "The summary audio is ready to play. An email notification has been sent."
          : "The summary audio is ready to play.",
      });
    } catch (error: any) {
      console.error("Error generating audio:", error);
      toast({
        variant: "destructive",
        title: "Error Generating Audio",
        description: error.message || "Failed to generate audio. Try saving the summary first.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.playbackRate = playbackRate;
      audioElement.play().catch((error) => {
        console.error("Playback error:", error);
        toast({
          variant: "destructive",
          title: "Playback Error",
          description: "Unable to play audio. Please try generating again.",
        });
      });
    }
  };

  const handleSeek = (seconds: number) => {
    if (!audioElement) return;

    const newTime = Math.max(0, Math.min(audioElement.duration, audioElement.currentTime + seconds));
    audioElement.currentTime = newTime;
  };

  const handleDownload = () => {
    if (!audioUrl) return;

    const sanitizedTopic = searchTopic
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .toLowerCase() || "summary";
    const filename = `${sanitizedTopic}_summary.wav`;

    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download Started",
      description: `Downloading audio as ${filename}`,
    });
  };

  const sendEmailNotification = async (email: string, topic: string) => {
    try {
      const response = await fetch("http://localhost:5000/api/email/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: email,
          subject: `Summary Generation Completed for ${topic}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
              <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">Summary Generation Completed</h1>
              <p style="color: #555; font-size: 16px; line-height: 1.5;">
                Hello,<br><br>
                Your summary generation for "<strong>${topic}</strong>" has been completed successfully. You can now listen to the audio.<br><br>
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

  if (!summaryText) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Headphones className="mr-2 h-5 w-5" />
          Listen to Summary
        </CardTitle>
        <CardDescription>
          Convert the summary to speech using different voices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-full sm:w-48">
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger>
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      {voice.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerateAudio}
              disabled={isGenerating || !summaryText}
              className="w-full sm:w-auto"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-primary-foreground animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Headphones className="mr-2 h-4 w-4" />
                  Generate Audio
                </>
              )}
            </Button>
          </div>

          {audioUrl && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleSeek(-10)}
                  disabled={!audioUrl}
                  title="Rewind 10 seconds"
                >
                  <Rewind className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={togglePlayPause}
                  disabled={!audioUrl}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleSeek(10)}
                  disabled={!audioUrl}
                  title="Forward 10 seconds"
                >
                  <FastForward className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDownload}
                  disabled={!audioUrl}
                  title="Download audio"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <div className="w-24">
                  <Select value={playbackRate.toString()} onValueChange={(value) => setPlaybackRate(parseFloat(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Speed" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1x</SelectItem>
                      <SelectItem value="2">2x</SelectItem>
                      <SelectItem value="3">3x</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <audio controls className="w-full hidden">
                <source src={audioUrl} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioPlayer;