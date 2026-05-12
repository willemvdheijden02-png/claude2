export type StudioMode = "images" | "scripts" | "ideas" | "reports";

export type Attachment = {
  id: string;
  type: "image";
  name: string;
  dataUrl: string; // base64 data URL
};

export type Message =
  | { id: string; role: "user"; content: string; attachments?: Attachment[] }
  | { id: string; role: "assistant"; mode: "scripts" | "ideas" | "reports"; content: string }
  | { id: string; role: "assistant"; mode: "images"; images: GeneratedImage[]; intro?: string };

export type GeneratedImage = {
  id: string;
  format: "hero" | "story" | "feed" | "square";
  dimensions: string;
  overlayText: string;
  imageUrl?: string;
  prompt?: string;
  placeholder: { from: string; to: string };
};
