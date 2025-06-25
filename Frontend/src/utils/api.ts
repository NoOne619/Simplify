
import axios from "axios";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { jsPDF } from "jspdf";

const API_Summary_URL = "http://localhost:8000"; // FastAPI for summaries
const API_TTS_URL = "http://localhost:8004"; // FastAPI for TTS
const API_BACKEND_URL = "http://localhost:5000"; // Node.js backend
const API_Chat_URL = "http://localhost:8002"; // FastAPI for chat
interface Source {
  title: string;
  url: string;
  website: string;
}

interface SummaryResponse {
  summary: string;
  sources: Source[];
}
export interface SummaryHistoryItem {
  id: string;
  topic: string;
  website: string;
  summary: string;
  sources: Source[];
  createdAt: string;
}
export interface FeedSummary {
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

interface RAGQueryResponse {
  answer: string;
  context: { content: string; metadata: { index: number } }[];
}
const API_DELAY = 1000; // Simulated delay for API calls

export const generateAudio = async (text: string, voiceId: string): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("text", text);
    formData.append("speaker", voiceId);

    const response = await axios.post(`${API_TTS_URL}/generate_audio`, formData, {
      headers: {
        // Axios sets this automatically for FormData; no need to manually set it
        //"Content-Type": "multipart/form-data",
      },
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "audio/wav" });

    // Revoke previous URLs if needed (optional memory safety)
    const audioUrl = URL.createObjectURL(blob);
    return audioUrl;
  } catch (error: any) {
    console.error("Generate Audio Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(error.message || "Failed to generate audio");
  }
};

export const getArticleSummary = async ({
  websites,
  topic,
}: {
  websites: string[];
  topic: string;
}): Promise<SummaryResponse> => {
  try {
    if (!Array.isArray(websites)) {
      console.error("Invalid websites parameter:", websites);
      throw new Error("Websites must be an array");
    }

    const sites = websites.length > 0 ? websites.join(",") : "medium,wix,devto";
    console.log("Sending API request:", { keyword: topic, sites });

    const response = await axios.get(`${API_Summary_URL}/scrape-and-summarize`, {
      params: {
        keyword: topic,
        sites,
      },
    });

    console.log("API response:", response.data);
    const data = response.data.results;
    if (!data || typeof data !== "object") {
      console.error("Invalid response format:", response.data);
      throw new Error("Invalid response format: 'results' missing or not an object");
    }

    let combinedSummary = "";
    let combinedSources: Source[] = [];

    for (const website of websites) {
      if (data[website] && !data[website].error) {
        const { summary, sources } = data[website];
        combinedSummary += (combinedSummary ? "\n\n" : "") + (summary || `No summary available for ${website}.`);
        combinedSources = [...combinedSources, ...(Array.isArray(sources) ? sources : [])];
      } else {
        console.warn(`No data for website: ${website}`, data[website]);
        combinedSummary += (combinedSummary ? "\n\n" : "") + `No summary available for ${website}.`;
      }
    }

    if (!combinedSummary) {
      throw new Error("No summaries available for selected websites");
    }

    return {
      summary: combinedSummary,
      sources: combinedSources,
    };
  } catch (error: any) {
    console.error("API Error Details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config,
      request: error.request,
    });
    throw new Error(error.message || "Failed to fetch summary");
  }
};

export const storeSummary = async (
  content: string,
  sources: Source[],
  topic: string
): Promise<{ summary_id: number; blogLinks: { BlogLinkID: number; URL: string; websiteName: string }[] }> => {
  try {
    const token = localStorage.getItem('blog_summary_token');
    console.log('Token:', token);
    if (!token) {
      throw new Error('No authentication token found. Please log in.');
    }

    if (!content || content.trim() === '') {
      throw new Error('Content is required and cannot be empty');
    }
    if (!sources || !Array.isArray(sources) || sources.length === 0) {
      throw new Error('Sources must be a non-empty array');
    }

    const blogLinks = sources.map(source => {
      if (!source.url || !source.website) {
        throw new Error('Each source must have url and website');
      }
      return {
        url: source.url,
        websiteName: source.website,
      };
    });

    console.log('Sending request:', JSON.stringify({ content, blogLinks, topic }, null, 2));
    const response = await axios.post(
      `${API_BACKEND_URL}/api/summaries`,
      { content, blogLinks, topic },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    console.log('Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Store Summary Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
    });
    throw new Error(error.response?.data?.message || error.message || 'Failed to store summary');
  }
};



export const getSummaryHistory = async (): Promise<SummaryHistoryItem[]> => {
  try {
    const token = localStorage.getItem('blog_summary_token');
    if (!token) {
      throw new Error('No authentication token found. Please log in.');
    }

    const response = await axios.get(`${API_BACKEND_URL}/api/summaries`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('Summary history response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Get Summary History Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch summary history');
  }
};

export const downloadSummary = async (
  text: string,
  title: string,
  format: "txt" | "pdf" | "docx"
): Promise<void> => {
  try {
    const sanitizedTitle = title
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .toLowerCase() || "summary";
    const filename = `${sanitizedTitle}_summary.${format}`;
    const displayTitle = title
      ? `${title.charAt(0).toUpperCase() + title.slice(1).toLowerCase()} Summary`
      : "Summary";

    let blob: Blob;
    if (format === "txt") {
      const content = `**${displayTitle}**\n\n${text}`;
      blob = new Blob([content], { type: "text/plain" });
    } else if (format === "pdf") {
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(displayTitle, 10, 10);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      const lines = doc.splitTextToSize(text, 180);
      doc.text(lines, 10, 20);
      blob = doc.output("blob");
    } else if (format === "docx") {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              children: [
                new TextRun({
                  text: displayTitle,
                  bold: true,
                  size: 32,
                }),
              ],
            }),
            new Paragraph({
              children: [new TextRun("")],
            }),
            new Paragraph({
              children: [new TextRun(text)],
            }),
          ],
        }],
      });
      blob = await Packer.toBlob(doc);
    } else {
      throw new Error("Unsupported format");
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error: any) {
    console.error("Download Summary Error:", error);
    throw new Error(error.message || "Failed to download summary");
  }
};

export const sharePost = async (
  content: string,
  topic: string,
  urls: string[]
): Promise<{ post_id: number; topic: string; content: string; name: string; created_at: string; urls: { url: string }[] }> => {
  try {
    const token = localStorage.getItem('blog_summary_token');
    if (!token) {
      throw new Error('No authentication token found. Please log in.');
    }

    if (!content || content.trim() === '') {
      throw new Error('Content is required and cannot be empty');
    }
    if (!topic || topic.trim() === '') {
      throw new Error('Topic is required and cannot be empty');
    }
    if (!Array.isArray(urls)) {
      throw new Error('URLs must be an array');
    }
    if (urls.some(url => !url || typeof url !== 'string' || !url.trim())) {
      throw new Error('All URLs must be non-empty strings');
    }

    console.log('Sending post request:', JSON.stringify({ content, topic, urls }, null, 2));
    const response = await axios.post(
      `${API_BACKEND_URL}/api/posts`,
      { content, topic, urls },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    console.log('Post response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Share Post Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(error.response?.data?.message || error.message || 'Failed to share post');
  }
};

export const likePost = async (postId: string): Promise<{ postId: string; likes: number; isLiked: boolean }> => {
  try {
    const token = localStorage.getItem('blog_summary_token');
    if (!token) {
      throw new Error('No authentication token found. Please log in.');
    }

    if (!postId || typeof postId !== 'string' || !postId.trim()) {
      throw new Error('Post ID is required and must be a non-empty string');
    }

    console.log('Sending like request for postId:', postId);
    const response = await axios.post(
      `${API_BACKEND_URL}/api/posts/${postId}/like`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    console.log('Like response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Like Post Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(error.response?.data?.message || error.message || 'Failed to like post');
  }
};

export const getFeedPosts = async (): Promise<FeedSummary[]> => {
  try {
    const token = localStorage.getItem('blog_summary_token');
    const headers = token
      ? {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      : {
          'Content-Type': 'application/json',
        };

    console.log('Fetching feed posts');
    const response = await axios.get(`${API_BACKEND_URL}/api/posts/feed`, { headers });

    console.log('Feed posts response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Get Feed Posts Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch feed posts');
  }
};
export const getUserPosts = async (): Promise<FeedSummary[]> => {
  try {
    const token = localStorage.getItem('blog_summary_token');
    if (!token) {
      throw new Error('No authentication token found. Please log in.');
    }

    console.log('Fetching user posts');
    const response = await axios.get(`${API_BACKEND_URL}/api/posts/user`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('User posts response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Get User Posts Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch user posts');
  }
};

export const storeSummariesToRAG = async (summaries: string[]): Promise<{ message: string }> => {
  try {
    if (!Array.isArray(summaries) || summaries.length === 0) {
      throw new Error('Summaries must be a non-empty array of strings');
    }
    if (summaries.some(summary => !summary || typeof summary !== 'string' || !summary.trim())) {
      throw new Error('All summaries must be non-empty strings');
    }

    console.log('Sending summaries to RAG API:', summaries);
    const response = await axios.post(
      `${API_Chat_URL}/summaries`,
      { summaries },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('RAG summaries response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Store Summaries to RAG Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(error.response?.data?.detail || error.message || 'Failed to store summaries to RAG');
  }
};

export const queryRAG = async (query: string): Promise<RAGQueryResponse> => {
  try {
    if (!query || typeof query !== 'string' || !query.trim()) {
      throw new Error('Query must be a non-empty string');
    }

    console.log('Sending query to RAG API:', query);
    const response = await axios.post(
      `${API_Chat_URL}/query`,
      { query },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('RAG query response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Query RAG Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    if (error.response?.status === 401 && error.response?.data?.detail?.includes('Session expired')) {
      throw new Error('Session expired, please log in again');
    }
    if (error.response?.status === 400 && error.response?.data?.detail?.includes('No summaries stored')) {
      throw new Error('No summaries available. Please generate or fetch summaries first.');
    }
    throw new Error(error.response?.data?.detail || error.message || 'Failed to query RAG');
  }
};

// In utils/api.ts

export const deleteSummary = async (summaryId: string): Promise<{ message: string; summary_id: string }> => {
  try {
    const token = localStorage.getItem("blog_summary_token");
    if (!token) {
      throw new Error("No authentication token found. Please log in.");
    }

    if (!summaryId || typeof summaryId !== "string" || !summaryId.trim()) {
      throw new Error("Summary ID is required and must be a non-empty string");
    }

    console.log("Sending delete request for summaryId:", summaryId);
    const response = await axios.delete(`${API_BACKEND_URL}/api/summaries/${summaryId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Delete summary response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Delete Summary Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(error.response?.data?.message || error.message || "Failed to delete summary");
  }
};
// In utils/api.ts

export const deletePost = async (postId: string): Promise<{ message: string; post_id: string }> => {
  try {
    const token = localStorage.getItem("blog_summary_token");
    if (!token) {
      throw new Error("No authentication token found. Please log in.");
    }

    if (!postId || typeof postId !== "string" || !postId.trim()) {
      throw new Error("Post ID is required and must be a non-empty string");
    }

    console.log("Sending delete request for postId:", postId);
    const response = await axios.delete(`${API_BACKEND_URL}/api/posts/${postId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Delete post response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Delete Post Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(error.response?.data?.message || error.message || "Failed to delete post");
  }
};