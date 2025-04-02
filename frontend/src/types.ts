export type UserRole = 'consumer' | 'creator' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  lastLogin?: string;
  createdAt: string;
  token?: string; // Token de autenticación
}

export interface Video {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  tags: string[];
  status: 'live' | 'recorded';
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Album {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  videoCount: number;
}