export interface JourneyMilestone {
  id: string;
  year: string;
  title: string;
  subtitle: string;
  description: string;
  type: 'success' | 'failure' | 'academic' | 'dream';
  story?: string;
  imageUrl?: string;
  images?: string[];
  createdAt: string;
}

export interface ArchivePhoto {
  id: string;
  url: string;
  images?: string[];
  location: string;
  title: string;
  description: string;
  story: string;
  category: 'travel' | 'photoshop';
  date: string;
  createdAt: string;
}

export interface Recommendation {
  id: string;
  name: string;
  role: string;
  company?: string;
  message: string;
  approved: boolean;
  date: string;
  createdAt: string;
}

export interface FollowerStats {
  github: number;
  facebook: number;
  twitter: number;
  subscribers: number;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  link?: string;
  githubUrl?: string;
  category: 'programming' | 'business';
  longDescription?: string;
  imageUrl?: string;
  images?: string[];
  createdAt: string;
}

export interface Comment {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  replies?: Comment[];
}

export interface SocialLink {
  id: string;
  platform: string; // e.g. Facebook, GitHub, LinkedIn, WhatsApp, Email, website
  url: string;
  label: string; // e.g. 'Facebook profile', 'GitHub repository'
  metric?: string; // e.g. '3.4k followers' or '114 stars'
  iconCode?: string; // e.g. 'Facebook', 'Github', 'Mail', 'Link', etc.
}

export interface CustomInstitution {
  id: string;
  title: string;
  name: string;
  link?: string;
  description?: string;
}

export interface ProfileDetails {
  name: string;
  tagline: string;
  email: string;
  altEmail: string;
  phone: string;
  whatsapp: string;
  aboutText: string;
  universityName: string;
  universityLink: string;
  highSchoolName: string;
  highSchoolLink: string;
  collegeName: string;
  collegeLink: string;
  targetMasterUni: string;
  targetMasterLink: string;
  coverUrl?: string;
  profilePictureUrl?: string;
  customInstitutions?: CustomInstitution[];
  cvDownloadUrl?: string;
  blogSectionTagline?: string;
  blogSectionTitle?: string;
  blogSectionDescription?: string;
}


export interface BlogPost {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  images?: string[];
  likes: number;
  dislikes: number;
  comments: Comment[];
  createdAt: string;
  category?: string;
  excerpt?: string;
}

export interface GalleryItem {
  id: string;
  description: string;
  imageUrl: string;
  images?: string[];
  likes: number;
  dislikes: number;
  comments: Comment[];
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface SecurityQuestion {
  id: string;
  question: string;
  answer: string;
}


