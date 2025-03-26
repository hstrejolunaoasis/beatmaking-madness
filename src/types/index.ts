import { BEAT_LICENSES } from "@/lib/config/constants";
import { Genre } from "./genre";

export type Beat = {
  id: string;
  title: string;
  producer: string;
  price: number;
  bpm: number;
  key: string;
  tags: string[];
  genreId: string;
  genre?: Genre;
  mood: string;
  imageUrl: string;
  audioUrl: string;
  waveformUrl: string;
  createdAt: Date;
  updatedAt: Date;
};

export type LicenseType = keyof typeof BEAT_LICENSES;

export type CartItem = {
  beatId: string;
  licenseType: LicenseType;
  price: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: "USER" | "ADMIN";
};

export type Order = {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: "PENDING" | "COMPLETED" | "FAILED";
  createdAt: Date;
  updatedAt: Date;
}; 