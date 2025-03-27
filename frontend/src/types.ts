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