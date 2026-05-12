export type StudioMode = "images" | "scripts" | "ideas" | "reports" | "video";

export type Attachment = {
  id: string;
  type: "image";
  name: string;
  dataUrl: string;
};

export type Message =
  | { id: string; role: "user"; content: string; attachments?: Attachment[] }
  | { id: string; role: "assistant"; mode: "scripts" | "ideas" | "reports"; content: string }
  | { id: string; role: "assistant"; mode: "images"; images: GeneratedImage[]; intro?: string }
  | { id: string; role: "assistant"; mode: "video"; videoRequest: VideoRequest };

export type GeneratedImage = {
  id: string;
  format: "hero" | "story" | "feed" | "square";
  dimensions: string;
  overlayText: string;
  imageUrl?: string;
  prompt?: string;
  placeholder: { from: string; to: string };
};

export type VideoRequest = {
  requestId: string;
  status: "pending" | "in_progress" | "done" | "failed";
  prompt: string;
  aspectRatio: "9:16" | "16:9" | "1:1";
  duration: number;
  videoUrl?: string;
  estimatedTurnaround: string;
};
