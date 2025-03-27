import React, { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import type { Video } from '../types';

export default function ManageVideos() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<'live' | 'recorded'>('recorded');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Video creation logic will be implemented here
      toast.success('Video added successfully');
    } catch (error) {
      toast.error('Failed to add video');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Add New Video</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-700">
              YouTube URL
            </label>
            <input
              type="url"
              id="youtubeUrl"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'live' | 'recorded')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="live">Live</option>
              <option value="recorded">Recorded</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Video
          </button>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Your Videos</h2>
        <div className="space-y-4">
          {/* Videos will be populated here */}
          <div className="text-gray-500">No videos found</div>
        </div>
      </div>
    </div>
  );
}