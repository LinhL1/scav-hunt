export interface User {
  id: string;
  name: string;
  avatar: string;
}

export interface Submission {
  id: string;
  userId: string;
  prompt?: string;           // Keep for backwards compatibility with mock data
  promptText?: string;       // Add this - what Firebase stores
  promptId?: string;         // Add this too
  promptDate?: string;       // And this
  photoUrl: string;
  caption?: string;
  aiFeedback: string;
  altText: string;
  createdAt: Date | any;     // Can be Date or Firebase Timestamp
  username?: string;         // Add this - Firebase stores it
  userAvatar?: string;       // Add this too
  isValid?: boolean;         // Add this
  likes?: number;            // Add this
  likedBy?: string[];        // Add this
}

export const currentUser: User = {
  id: "user-1",
  name: "You",
  avatar: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=100&h=100&fit=crop&crop=face",
};

export const friends: User[] = [
  { id: "friend-1", name: "Maya", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" },
  { id: "friend-2", name: "Sam", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" },
  { id: "friend-3", name: "Jordan", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" },
  { id: "friend-4", name: "Kai", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" },
];

export const mockPrompts: string[] = [
  "Your view",
  "Something tiny",
  "Golden hour",
  "Favorite texture",
  "A heart shaped...",
  "Warm light",
  "Still life",
  "Morning sky",
  "A design fail",
  "Stranger's art",
  "Soft shadow",
  "A buddy",
  "Best snack",
  "Your hands",
];

export const mockFeedSubmissions: Submission[] = [
  {
    id: "sub-1",
    userId: "friend-1",
    prompt: "Golden hour",
    photoUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=600&fit=crop",
    caption: "The park near my house",
    aiFeedback: "Beautiful golden tones! You really captured the warmth of this moment perfectly.",
    altText: "A park scene bathed in warm golden sunlight with long shadows stretching across green grass.",
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "sub-2",
    userId: "friend-2",
    prompt: "Golden hour",
    photoUrl: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=600&h=600&fit=crop",
    caption: "Found these on my walk",
    aiFeedback: "What a lovely find! The colors in this shot are absolutely gorgeous.",
    altText: "Close-up of vibrant orange flowers catching the warm evening light.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: "sub-3",
    userId: "friend-3",
    prompt: "Golden hour",
    photoUrl: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&h=600&fit=crop",
    aiFeedback: "Stunning perspective! This really captures the magic of golden hour.",
    altText: "A sweeping landscape view with rolling hills illuminated by warm, low-angle sunlight.",
    createdAt: new Date(Date.now() - 1000 * 60 * 90),
  },
  {
    id: "sub-4",
    userId: "friend-4",
    prompt: "Golden hour",
    photoUrl: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=600&h=600&fit=crop",
    caption: "My backyard right now",
    aiFeedback: "The light in this photo is incredible. What a peaceful scene to end the day with!",
    altText: "A backyard with trees silhouetted against a golden sunset sky, soft warm tones throughout.",
    createdAt: new Date(Date.now() - 1000 * 60 * 120),
  },
];

export const mockEncouragements = [
  "Love this interpretation! You have such a creative eye.",
  "What a beautiful moment to capture! This really tells a story.",
  "This is wonderful! The way you framed this is really special.",
  "Such a thoughtful response to the prompt. You nailed it!",
  "Beautiful! This photo radiates warmth and joy.",
];

export function getUserById(id: string): User | undefined {
  if (id === currentUser.id) return currentUser;
  return friends.find((f) => f.id === id);
}

// ─── User submission store ────────────────────────────────────────────────────
// A simple in-memory array that acts as the user's own posts.
// Consumers should call getFeedSubmissions() instead of reading
// mockFeedSubmissions directly so they always get the merged + sorted list.

export const userSubmissions: Submission[] = [];

export function addUserSubmission(submission: Submission): void {
  userSubmissions.unshift(submission);
}

/** Returns all submissions (user + friends) sorted newest-first. */
export function getFeedSubmissions(): Submission[] {
  return [...userSubmissions, ...mockFeedSubmissions].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}