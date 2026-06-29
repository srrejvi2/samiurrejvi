import React, { useState, useEffect } from 'react';
import { 
  X, Trash2, Plus, Check, Layers, CalendarCheck, MessageSquare, 
  BookOpen, Image as ImageIcon, Briefcase, Users, Heart, ThumbsDown, 
  MessageCircle, AlertCircle, Edit2, Globe, Mail, Phone, Award, School, Sparkles, Send, Link, Link2, Eye, ShieldAlert, ArrowLeft, LogOut,
  RefreshCw, ChevronDown, FileText
} from 'lucide-react';
import { ArchivePhoto, JourneyMilestone, Recommendation, FollowerStats, BlogPost, GalleryItem, ProjectItem, SocialLink, ProfileDetails, ContactMessage, SecurityQuestion } from '../types';

interface ImageUploaderProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
}

interface MultiImageUploaderProps {
  values: string[];
  onChange: (vals: string[]) => void;
  label?: string;
}

const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return resolve(file);
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Limits dimensions for high-resolution clear display but low storage size
        const MAX_DIM = 1200;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file);
        }
        
        // Use high-quality white background for JPEG conversion of transparent PNGs
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        
        // Quality 0.7 gives perfect clear resolution with extremely small storage footprint (under 100KB)
        canvas.toBlob((blob) => {
          if (!blob) {
            return resolve(file);
          }
          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
            type: "image/jpeg",
            lastModified: Date.now()
          });
          console.log(`[Image Compression] Original: ${file.size} bytes. Compressed: ${compressedFile.size} bytes.`);
          resolve(compressedFile);
        }, 'image/jpeg', 0.7);
      };
      img.onerror = () => {
        resolve(file);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      resolve(file);
    };
    reader.readAsDataURL(file);
  });
};

const uploadFileToCloudinary = async (file: File): Promise<string> => {
  console.log(`[Uploader] Compressing image client-side before upload...`);
  const compressedFile = await compressImage(file);
  const formData = new FormData();
  formData.append('image', compressedFile);
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to upload image.');
  }
  const data = await response.json();
  return data.secure_url;
};

export function MultiImageUploader({ values, onChange, label = "Upload Multiple Images" }: MultiImageUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFiles = async (fileList: FileList) => {
    const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) {
      alert('Please upload image files.');
      return;
    }
    setLoading(true);

    try {
      // Upload images in parallel via the express server proxy to Cloudinary
      const uploadPromises = files.map(file => uploadFileToCloudinary(file));
      const urls = await Promise.all(uploadPromises);
      onChange([...values, ...urls]);
    } catch (err: any) {
      console.error("Cloudinary upload failed:", err);
      alert(err.message || 'Failed to uploads images to the cloud.');
    } finally {
      setLoading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const onDragLeave = () => {
    setIsDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = (indexToRemove: number) => {
    onChange(values.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-2 text-left" id="multi-uploader-form">
      <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
        {label}
      </label>
      
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative border border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
          isDragActive 
            ? 'border-blue-500 bg-blue-50/30' 
            : 'border-slate-200 hover:border-slate-350 hover:bg-slate-50 bg-white'
        }`}
      >
        <input 
          type="file" 
          accept="image/*" 
          multiple
          onChange={handleFileInput} 
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
        
        {loading ? (
          <div className="flex flex-col items-center gap-1.5 font-mono text-xs text-slate-500">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
            <span>Uploading multiple images to Cloudinary...</span>
          </div>
        ) : (
          <div className="space-y-1.5 py-2 flex flex-col items-center">
            <span className="text-[11px] font-mono font-bold text-blue-600 block">⚡ Click or drag multiple image files to group upload</span>
            <span className="text-[9.5px] text-slate-400 block font-mono">Select multiple files (JPEG / PNG / WebP)</span>
          </div>
        )}
      </div>

      {values.length > 0 && (
        <div className="mt-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] font-mono uppercase text-slate-400 font-bold">Files Queue ({values.length})</span>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-[9px] text-rose-500 hover:text-rose-700 font-mono font-bold"
            >
              Clear All Queue
            </button>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
            {values.map((val, idx) => (
              <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 h-16 bg-white flex items-center justify-center shadow-xs">
                <img src={val} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-rose-500 text-white rounded-full p-0.5 hover:bg-rose-600 transition-colors shadow"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ImageUploader({ value, onChange, label = "Upload Image" }: ImageUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }
    setLoading(true);
    try {
      const url = await uploadFileToCloudinary(file);
      onChange(url);
    } catch (err: any) {
      console.error("Cloudinary upload failed:", err);
      alert(err.message || 'Error uploading image to Cloudinary.');
    } finally {
      setLoading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const onDragLeave = () => {
    setIsDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-2 text-left" id="admin-uploader">
      <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
        {label}
      </label>
      
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50/50 p-2.5 flex items-center justify-between gap-3">
          <img 
            src={value} 
            alt="Upload Preview" 
            className="w-12 h-12 rounded-lg object-cover border border-slate-200/80 shrink-0 bg-slate-100" 
            referrerPolicy="no-referrer"
          />
          <div className="flex-grow min-w-0 pr-1">
            <span className="text-[10px] font-mono text-emerald-600 font-bold block">✓ Image Selected</span>
            <span className="text-[9px] font-mono text-slate-500 truncate block">
              {value.startsWith('data:') ? 'Local Uploaded File' : value}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-1.5 rounded-lg transition-all cursor-pointer border border-rose-200/40 shrink-0"
            title="Clear and choose another"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-2 animate-fade-in">
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`relative border border-dashed rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
              isDragActive 
                ? 'border-blue-500 bg-blue-50/30' 
                : 'border-slate-205 border-slate-200 hover:border-slate-305 hover:bg-slate-50 bg-white'
            }`}
          >
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileInput} 
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            
            {loading ? (
              <span className="text-[10px] font-mono text-slate-500 animate-pulse py-1">Processing file...</span>
            ) : (
              <div className="space-y-0.5 text-center pointer-events-none">
                <p className="text-[10px] font-medium text-slate-700">
                  <span className="text-blue-600 font-semibold underline">Click to upload photo</span> or drag here
                </p>
                <p className="text-[8px] font-mono text-slate-400">Supports JPG, PNG, GIF, WebP</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-px bg-slate-200 flex-grow" />
            <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest font-bold">Or enter direct URL</span>
            <div className="h-px bg-slate-200 flex-grow" />
          </div>
          <input 
            type="text" 
            placeholder="paste image URL here..."
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
          />
        </div>
      )}
    </div>
  );
}

interface PdfUploaderProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
}

export function PdfUploader({ value, onChange, label = "Upload PDF/CV" }: PdfUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFile = async (file: File) => {
    // Support PDF, DOC, DOCX and generic document formats
    const isDoc = file.type === 'application/pdf' || 
                  file.type === 'application/msword' || 
                  file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                  file.name.endsWith('.pdf') || 
                  file.name.endsWith('.doc') || 
                  file.name.endsWith('.docx');
                  
    if (!isDoc) {
      alert('Please upload a document file (PDF, DOC, or DOCX).');
      return;
    }
    setLoading(true);
    try {
      const url = await uploadFileToCloudinary(file);
      onChange(url);
    } catch (err: any) {
      console.error("Cloudinary document upload failed:", err);
      alert(err.message || 'Error uploading document to Cloudinary.');
    } finally {
      setLoading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const onDragLeave = () => {
    setIsDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-1.5 text-left" id="pdf-uploader">
      <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
        {label}
      </label>
      
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-blue-50/10 p-2.5 flex items-center justify-between gap-3 animate-fade-in">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 shrink-0 border border-blue-200/40">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex-grow min-w-0 pr-1">
            <span className="text-[10px] font-mono text-emerald-600 font-bold block">✓ Document Selected</span>
            <span className="text-[9px] font-mono text-slate-500 truncate block">
              {value.startsWith('data:') ? 'Local Uploaded Attachment' : value}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-1.5 rounded-lg transition-all cursor-pointer border border-rose-200/40 shrink-0"
            title="Clear and choose another"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-2 animate-fade-in">
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`relative border border-dashed rounded-xl p-3.5 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
              isDragActive 
                ? 'border-blue-500 bg-blue-50/30' 
                : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50 bg-white'
            }`}
          >
            <input 
              type="file" 
              accept=".pdf,.doc,.docx" 
              onChange={handleFileInput} 
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            
            {loading ? (
              <span className="text-[10px] font-mono text-slate-500 animate-pulse py-1">Processing file...</span>
            ) : (
              <div className="space-y-1 text-center pointer-events-none flex flex-col items-center">
                <FileText className="w-5 h-5 text-slate-400 mb-1 animate-bounce" />
                <p className="text-[10px] font-medium text-slate-705">
                  <span className="text-blue-650 text-blue-600 font-semibold underline">Click to upload CV / Resume</span> or drag here
                </p>
                <p className="text-[8px] font-mono text-slate-400">Supports PDF, DOC, DOCX up to 10MB</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-px bg-slate-200 flex-grow" />
            <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest font-bold">Or enter direct URL</span>
            <div className="h-px bg-slate-200 flex-grow" />
          </div>
          <input 
            type="text" 
            placeholder="paste document URL here (Google Drive, Dropbox, etc.)..."
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-mono"
          />
        </div>
      )}
    </div>
  );
}

interface AdminPanelProps {
  // Photos / Maps
  photos: ArchivePhoto[];
  setPhotos: React.Dispatch<React.SetStateAction<ArchivePhoto[]>>;

  // Timeline
  milestones: JourneyMilestone[];
  setMilestones: React.Dispatch<React.SetStateAction<JourneyMilestone[]>>;

  // Blogs
  blogs: BlogPost[];
  setBlogs: React.Dispatch<React.SetStateAction<BlogPost[]>>;

  // Gallery
  galleryItems: GalleryItem[];
  setGalleryItems: React.Dispatch<React.SetStateAction<GalleryItem[]>>;

  // Projects
  projects: ProjectItem[];
  setProjects: React.Dispatch<React.SetStateAction<ProjectItem[]>>;

  // Dynamic Contact & Info Details
  socialLinks: SocialLink[];
  setSocialLinks: React.Dispatch<React.SetStateAction<SocialLink[]>>;
  profileDetails: ProfileDetails;
  setProfileDetails: React.Dispatch<React.SetStateAction<ProfileDetails>>;
  messages: ContactMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ContactMessage[]>>;

  // Recommendations / social proof
  recommendations: Recommendation[];
  onApproveRecommendation: (id: string) => void;
  onDeleteRecommendation: (id: string) => void;
  
  // Follower Base & Visitor Base Stats
  stats: FollowerStats;
  onUpdateSocialStats: (s: FollowerStats) => void;
  visitorBase: number;
  onClose: () => void;

  // Security Gatekeeper Questions
  securityQuestions: SecurityQuestion[];
  setSecurityQuestions: React.Dispatch<React.SetStateAction<SecurityQuestion[]>>;
}

type AdminTab = 'profile' | 'socials' | 'blogs' | 'projects' | 'gallery' | 'milestones' | 'portfolio' | 'reviews' | 'messages' | 'security';

export default function AdminPanel({
  photos, setPhotos,
  milestones, setMilestones,
  blogs, setBlogs,
  galleryItems, setGalleryItems,
  projects, setProjects,
  socialLinks, setSocialLinks,
  profileDetails, setProfileDetails,
  messages, setMessages,
  recommendations,
  onApproveRecommendation,
  onDeleteRecommendation,
  stats,
  onUpdateSocialStats,
  visitorBase,
  onClose,
  securityQuestions,
  setSecurityQuestions
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('profile');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshingMessages, setIsRefreshingMessages] = useState(false);
  const [initialBackup, setInitialBackup] = useState(() => ({
    photos: [...photos],
    milestones: [...milestones],
    blogs: [...blogs],
    galleryItems: [...galleryItems],
    projects: [...projects],
    socialLinks: [...socialLinks],
    profileDetails: { ...profileDetails },
    stats: { ...stats },
    securityQuestions: [...securityQuestions],
    messages: [...messages]
  }));

  const handleRefreshMessages = async () => {
    setIsRefreshingMessages(true);
    try {
      const response = await fetch("/api/site-data");
      if (!response.ok) throw new Error("Could not fetch latest telemetry.");
      const data = await response.json();
      if (data && data.messages) {
        setMessages(data.messages);
        setInitialBackup(prev => ({
          ...prev,
          messages: [...data.messages]
        }));
      }
    } catch (err) {
      console.error("Refresh messages failure:", err);
    } finally {
      setIsRefreshingMessages(false);
    }
  };

  // Cloud Sync Status Tracking Hook States
  const [syncStatus, setSyncStatus] = useState<{
    isFirestoreQuotaExceeded: boolean;
    isListeningToFirestore: boolean;
    firestoreEnabled: boolean;
    projectName: string | null;
  } | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  const fetchSyncStatus = async () => {
    try {
      const res = await fetch("/api/admin/sync-status");
      if (res.ok) {
        const data = await res.json();
        setSyncStatus(data);
      }
    } catch (e) {
      console.warn("Failed to fetch cloud sync status:", e);
    }
  };

  const handleForceSync = async () => {
    setSyncLoading(true);
    setSyncMessage(null);
    try {
      const res = await fetch("/api/admin/force-sync", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setSyncMessage("✓ Sync Success!");
        setSyncStatus({
          isFirestoreQuotaExceeded: data.isFirestoreQuotaExceeded,
          isListeningToFirestore: data.isListeningToFirestore,
          firestoreEnabled: true,
          projectName: syncStatus?.projectName || null
        });
      } else {
        setSyncMessage(`✗ Limit Exceeded`);
      }
    } catch (e: any) {
      setSyncMessage(`✗ Error: ${e.message || "Failed"}`);
    } finally {
      setSyncLoading(false);
      setTimeout(() => {
        setSyncMessage(null);
        fetchSyncStatus();
      }, 4000);
    }
  };

  const handleResetDatabase = async () => {
    const confirmFirst = window.confirm(
      "CRITICAL WARNING: Are you sure you want to completely wipe all portfolio content and database records? This will delete all your blogs, projects, milestone timelines, messages, and uploaded photos from both local storage cache and Google Cloud Firestore. This cannot be undone!"
    );
    if (!confirmFirst) return;

    const confirmSecond = window.confirm(
      "FINAL CONFIRMATION: This is your absolute last chance to cancel. Wipe all data?"
    );
    if (!confirmSecond) return;

    setResetLoading(true);
    setSyncMessage(null);
    try {
      const res = await fetch("/api/admin/reset-database", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Success: Database cache and Firestore wiped clean!");
        setSyncMessage("✓ Database Reset!");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        alert("Error resetting database: " + (data.error || "Unknown error"));
        setSyncMessage("✗ Reset Failed");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
      setSyncMessage(`✗ Error: ${e.message}`);
    } finally {
      setResetLoading(false);
    }
  };

  // Run on mount to initialize status and start interval
  useEffect(() => {
    fetchSyncStatus();
    const interval = setInterval(fetchSyncStatus, 25000); // 25s polling
    return () => clearInterval(interval);
  }, []);

  // Custom confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {}
  });

  const requestConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog(p => ({ ...p, isOpen: false }));
      }
    });
  };

  const handleRestoreBackupAndClose = () => {
    requestConfirm(
      "Confirm Log Out",
      "Are you sure you want to log out? Any unsaved edits will be discarded and the backup will be restored.",
      () => {
        setPhotos(initialBackup.photos);
        setMilestones(initialBackup.milestones);
        setBlogs(initialBackup.blogs);
        setGalleryItems(initialBackup.galleryItems);
        setProjects(initialBackup.projects);
        setSocialLinks(initialBackup.socialLinks);
        setProfileDetails(initialBackup.profileDetails);
        setSecurityQuestions(initialBackup.securityQuestions);
        onUpdateSocialStats(initialBackup.stats);
        setMessages(initialBackup.messages);
        setHasUnsavedChanges(false);
        onClose();
      }
    );
  };

  const handleMasterSaveSilent = async (
    currentPhotos = photos,
    currentMilestones = milestones,
    currentBlogs = blogs,
    currentGallery = galleryItems,
    currentProjects = projects,
    currentSocialLinks = socialLinks,
    currentProfileDetails = profileDetails,
    currentStats = stats,
    currentSecurityQuestions = securityQuestions,
    currentMessages = messages
  ) => {
    try {
      const response = await fetch("/api/admin/save-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photos: currentPhotos,
          milestones: currentMilestones,
          blogs: currentBlogs,
          gallery: currentGallery,
          projects: currentProjects,
          socialLinks: currentSocialLinks,
          profileDetails: currentProfileDetails,
          stats: currentStats,
          securityQuestions: currentSecurityQuestions,
          messages: currentMessages
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setInitialBackup({
            photos: [...currentPhotos],
            milestones: [...currentMilestones],
            blogs: [...currentBlogs],
            galleryItems: [...currentGallery],
            projects: [...currentProjects],
            socialLinks: [...currentSocialLinks],
            profileDetails: { ...currentProfileDetails },
            stats: { ...currentStats },
            securityQuestions: [...currentSecurityQuestions],
            messages: [...currentMessages]
          });
          setHasUnsavedChanges(false);
          console.log("[Auto-Save] Successfully saved all changes to live database in real-time.");
        }
      }
    } catch (err) {
      console.error("[Auto-Save] Silent save failure:", err);
    }
  };

  useEffect(() => {
    if (hasUnsavedChanges && !isSaving) {
      const timer = setTimeout(() => {
        handleMasterSaveSilent();
      }, 600); // 600ms debounce
      return () => clearTimeout(timer);
    }
  }, [photos, milestones, blogs, galleryItems, projects, socialLinks, profileDetails, stats, securityQuestions, messages, hasUnsavedChanges]);

  const handleMasterSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/save-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photos,
          milestones,
          blogs,
          gallery: galleryItems,
          projects,
          socialLinks,
          profileDetails,
          stats,
          securityQuestions,
          messages
        })
      });
      if (!response.ok) throw new Error("Save request rejected by server.");
      const data = await response.json();
      if (data.success) {
        setInitialBackup({
          photos: [...photos],
          milestones: [...milestones],
          blogs: [...blogs],
          galleryItems: [...galleryItems],
          projects: [...projects],
          socialLinks: [...socialLinks],
          profileDetails: { ...profileDetails },
          stats: { ...stats },
          securityQuestions: [...securityQuestions],
          messages: [...messages]
        });
        setHasUnsavedChanges(false);
        alert("Success! All changes saved permanently to the live database.");
      } else {
        throw new Error(data.error || "Unknown server error.");
      }
    } catch (err: any) {
      console.error("Master save failure:", err);
      alert("Failed to save changes permanently: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Editing state trackers for update layouts (when null, we add new; when loaded with an ID, we render edit system)
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Master Forms Draft States
  const [profileForm, setProfileForm] = useState<ProfileDetails>({ ...profileDetails });

  // Sync profile details if changed externally
  useEffect(() => {
    setProfileForm({ ...profileDetails });
  }, [profileDetails]);

  // Reset forms drafts on cancel or submit
  const [photoForm, setPhotoForm] = useState({
    url: '', location: '', title: '', description: '', story: '', category: 'travel' as 'travel' | 'photoshop', date: '', images: [] as string[]
  });

  const [blogForm, setBlogForm] = useState({
    title: '', content: '', imageUrl: '', category: '', excerpt: '', images: [] as string[]
  });

  const [galleryForm, setGalleryForm] = useState({
    description: '', imageUrl: '', images: [] as string[]
  });

  // Real-time batch/group photo additions state controls
  const [isGalleryMultiMode, setIsGalleryMultiMode] = useState(false);
  const [galleryMultiImages, setGalleryMultiImages] = useState<string[]>([]);
  const [isPortfolioMultiMode, setIsPortfolioMultiMode] = useState(false);
  const [portfolioMultiImages, setPortfolioMultiImages] = useState<string[]>([]);
  
  const [isBlogMultiMode, setIsBlogMultiMode] = useState(false);
  const [blogMultiImages, setBlogMultiImages] = useState<string[]>([]);
  const [isProjectMultiMode, setIsProjectMultiMode] = useState(false);
  const [projectMultiImages, setProjectMultiImages] = useState<string[]>([]);
  const [isMilestoneMultiMode, setIsMilestoneMultiMode] = useState(false);
  const [milestoneMultiImages, setMilestoneMultiImages] = useState<string[]>([]);

  const [projectForm, setProjectForm] = useState({
    title: '', description: '', longDescription: '', category: 'programming' as 'programming' | 'business', imageUrl: '', link: '', githubUrl: '', techStack: '', images: [] as string[]
  });

  const [milestoneForm, setMilestoneForm] = useState({
    year: '', title: '', subtitle: '', description: '', type: 'success' as 'success' | 'failure' | 'academic' | 'dream', story: '', imageUrl: '', images: [] as string[]
  });

  const [socialForm, setSocialForm] = useState({
    platform: 'Facebook', url: '', label: '', metric: '', iconCode: 'Facebook'
  });

  const [newCustomInst, setNewCustomInst] = useState({
    title: '', name: '', link: '', description: ''
  });

  // ----------------------------------------------------
  // PROFILE SUBMISSIONS ACTION HANDLER
  // ----------------------------------------------------
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileDetails(profileForm);
    setHasUnsavedChanges(true);
    alert("Bio & CV coordinates updated in draft preview! Click 'Live Preview' to inspect the look, or Save to make it permanently live.");
  };

  const handleAddCustomInst = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newCustomInst.title || !newCustomInst.name) {
      alert("Please provide at least a Coordinate Title (Category) and the Institution Name!");
      return;
    }
    const currentList = profileForm.customInstitutions || [];
    const updated = [
      ...currentList,
      {
        id: `inst-${Date.now()}`,
        title: newCustomInst.title,
        name: newCustomInst.name,
        link: newCustomInst.link,
        description: newCustomInst.description
      }
    ];
    setProfileForm(p => ({ ...p, customInstitutions: updated }));
    setNewCustomInst({ title: '', name: '', link: '', description: '' });
  };

  const handleDeleteCustomInst = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!profileForm.customInstitutions) return;
    const updated = profileForm.customInstitutions.filter(item => item.id !== id);
    setProfileForm(p => ({ ...p, customInstitutions: updated }));
  };

  // ----------------------------------------------------
  // SOCIAL LINKS ACTIONS
  // ----------------------------------------------------
  const handleAddOrEditSocial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialForm.platform || !socialForm.url) {
      alert("Channel platform and URL are required!");
      return;
    }
    const isEditing = editingItemId !== null;
    let updatedList: SocialLink[];
    if (isEditing) {
      updatedList = socialLinks.map(item => item.id === editingItemId ? { ...item, ...socialForm } : item);
    } else {
      const newItem: SocialLink = {
        id: "social-" + Date.now(),
        platform: socialForm.platform,
        url: socialForm.url,
        label: socialForm.label,
        metric: socialForm.metric,
        iconCode: socialForm.iconCode
      };
      updatedList = [...socialLinks, newItem];
    }
    setSocialLinks(updatedList);
    setSocialForm({ platform: 'Facebook', url: '', label: '', metric: '', iconCode: 'Facebook' });
    setEditingItemId(null);
    setHasUnsavedChanges(true);
    alert(isEditing ? "Social details updated in preview!" : "New social channel draft updated in preview!");
  };

  const handleStartEditSocial = (item: SocialLink) => {
    setEditingItemId(item.id);
    setSocialForm({
      platform: item.platform,
      url: item.url,
      label: item.label,
      metric: item.metric || '',
      iconCode: item.iconCode || 'Facebook'
    });
  };

  const handleDeleteSocial = (id: string) => {
    requestConfirm(
      "Remove Social Link",
      "Are you sure you want to disconnect and trash this social channel link in preview?",
      () => {
        const updatedList = socialLinks.filter(item => item.id !== id);
        setSocialLinks(updatedList);
        setHasUnsavedChanges(true);
      }
    );
  };

  // ----------------------------------------------------
  // BLOG POST ACTIONS
  // ----------------------------------------------------
  const handleAddOrEditBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogForm.title || !blogForm.content) {
      alert("Title and content are strictly required!");
      return;
    }
    
    const imageUrl = blogForm.images && blogForm.images.length > 0 ? blogForm.images[0] : blogForm.imageUrl;
    const imagesList = blogForm.images && blogForm.images.length > 0 ? blogForm.images : (imageUrl ? [imageUrl] : []);

    const isEditing = editingItemId !== null;
    let updatedList: BlogPost[];
    if (isEditing) {
      updatedList = blogs.map(item => item.id === editingItemId ? { 
        ...item, 
        title: blogForm.title,
        content: blogForm.content,
        imageUrl: imageUrl,
        images: imagesList,
        category: blogForm.category || 'Technology',
        excerpt: blogForm.excerpt || 'Read the analytical details of this document inside.'
      } : item);
    } else {
      const newItem: BlogPost = {
        id: "blog-" + Date.now(),
        title: blogForm.title,
        content: blogForm.content,
        imageUrl: imageUrl,
        images: imagesList,
        category: blogForm.category || 'Technology',
        excerpt: blogForm.excerpt || 'Read the analytical details of this document inside.',
        likes: 0,
        dislikes: 0,
        comments: [],
        createdAt: new Date().toISOString()
      };
      updatedList = [newItem, ...blogs];
    }
    setBlogs(updatedList);
    setBlogForm({ title: '', content: '', imageUrl: '', category: '', excerpt: '', images: [] });
    setEditingItemId(null);
    setHasUnsavedChanges(true);
    alert(isEditing ? "Story post updated in preview!" : "New story blog added in draft preview!");
  };

  const handleStartEditBlog = (item: BlogPost) => {
    setEditingItemId(item.id);
    setBlogForm({
      title: item.title,
      content: item.content,
      imageUrl: item.imageUrl || '',
      category: item.category || '',
      excerpt: item.excerpt || '',
      images: item.images || (item.imageUrl ? [item.imageUrl] : [])
    });
  };

  const handleDeleteBlog = (id: string) => {
    requestConfirm(
      "Delete Blog Post",
      "Are you sure you want to trash this narrative story from the draft preview?",
      () => {
        const updatedList = blogs.filter(item => item.id !== id);
        setBlogs(updatedList);
        setHasUnsavedChanges(true);
      }
    );
  };

  // ----------------------------------------------------
  // PROJECTS CATALOG ACTIONS
  // ----------------------------------------------------
  const handleAddOrEditProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title || !projectForm.description) {
      alert("Project title and descriptions are required parameters.");
      return;
    }

    const stack = projectForm.techStack ? projectForm.techStack.split(',').map(s => s.trim()).filter(Boolean) : [];
    
    const imageUrl = projectForm.images && projectForm.images.length > 0 ? projectForm.images[0] : projectForm.imageUrl;
    const imagesList = projectForm.images && projectForm.images.length > 0 ? projectForm.images : (imageUrl ? [imageUrl] : []);

    const isEditing = editingItemId !== null;
    let updatedList: ProjectItem[];
    if (isEditing) {
      updatedList = projects.map(item => item.id === editingItemId ? {
        ...item,
        ...projectForm,
        imageUrl: imageUrl,
        images: imagesList,
        techStack: stack
      } : item);
    } else {
      const newItem: ProjectItem = {
        id: "project-" + Date.now(),
        title: projectForm.title,
        description: projectForm.description,
        longDescription: projectForm.longDescription,
        category: projectForm.category,
        imageUrl: imageUrl,
        images: imagesList,
        link: projectForm.link,
        githubUrl: projectForm.githubUrl,
        techStack: stack,
        createdAt: new Date().toISOString()
      };
      updatedList = [newItem, ...projects];
    }
    setProjects(updatedList);
    setProjectForm({ title: '', description: '', longDescription: '', category: 'programming', imageUrl: '', link: '', githubUrl: '', techStack: '', images: [] });
    setEditingItemId(null);
    setHasUnsavedChanges(true);
    alert(isEditing ? "Project details written to preview!" : "Innovative new project mapped to draft preview!");
  };

  const handleStartEditProject = (item: ProjectItem) => {
    setEditingItemId(item.id);
    setProjectForm({
      title: item.title,
      description: item.description,
      longDescription: item.longDescription || '',
      category: item.category,
      imageUrl: item.imageUrl || '',
      link: item.link || '',
      githubUrl: item.githubUrl || '',
      techStack: item.techStack ? item.techStack.join(', ') : '',
      images: item.images || (item.imageUrl ? [item.imageUrl] : [])
    });
  };

  const handleDeleteProject = (id: string) => {
    requestConfirm(
      "Erase Project",
      "Are you sure you want to erase this project profile in preview?",
      () => {
        const updatedList = projects.filter(item => item.id !== id);
        setProjects(updatedList);
        setHasUnsavedChanges(true);
      }
    );
  };

  const handleAddOrEditGallery = (e: React.FormEvent) => {
    e.preventDefault();
    
    const imageUrl = galleryForm.images && galleryForm.images.length > 0 ? galleryForm.images[0] : galleryForm.imageUrl;
    const imagesList = galleryForm.images && galleryForm.images.length > 0 ? galleryForm.images : (imageUrl ? [imageUrl] : []);

    if (imagesList.length === 0) {
      alert("A real gallery node requires at least one image uploaded or pasted.");
      return;
    }
    const isEditing = editingItemId !== null;
    let updatedList: GalleryItem[];
    if (isEditing) {
      updatedList = galleryItems.map(item => item.id === editingItemId ? {
        ...item,
        description: galleryForm.description,
        imageUrl: imageUrl,
        images: imagesList
      } : item);
    } else {
      const newItem: GalleryItem = {
        id: "gallery-" + Date.now(),
        description: galleryForm.description,
        imageUrl: imageUrl,
        images: imagesList,
        likes: 0,
        dislikes: 0,
        comments: [],
        createdAt: new Date().toISOString()
      };
      updatedList = [newItem, ...galleryItems];
    }
    setGalleryItems(updatedList);
    setGalleryForm({ description: '', imageUrl: '', images: [] });
    setEditingItemId(null);
    setHasUnsavedChanges(true);
    alert(isEditing ? "Gallery item updated in preview!" : "New snapshot item added to preview!");
  };

  const handleStartEditGallery = (item: GalleryItem) => {
    setEditingItemId(item.id);
    setGalleryForm({
      description: item.description,
      imageUrl: item.imageUrl || '',
      images: item.images || (item.imageUrl ? [item.imageUrl] : [])
    });
  };

  const handleDeleteGallery = (id: string) => {
    requestConfirm(
      "Delete Snapshot",
      "Are you sure you want to delete this gallery snapshot in preview?",
      () => {
        const updatedList = galleryItems.filter(item => item.id !== id);
        setGalleryItems(updatedList);
        setHasUnsavedChanges(true);
      }
    );
  };

  // ----------------------------------------------------
  // CHRONOLOGY MILESTONES TIMELINE ACTIONS
  // ----------------------------------------------------
  const handleAddOrEditMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneForm.year || !milestoneForm.title || !milestoneForm.description) {
      alert("Milestone tracking year, title, and synopsis are mandatory parameters.");
      return;
    }

    const imageUrl = milestoneForm.images && milestoneForm.images.length > 0 ? milestoneForm.images[0] : milestoneForm.imageUrl;
    const imagesList = milestoneForm.images && milestoneForm.images.length > 0 ? milestoneForm.images : (imageUrl ? [imageUrl] : []);

    const isEditing = editingItemId !== null;
    let updatedList: JourneyMilestone[];
    if (isEditing) {
      updatedList = milestones.map(item => item.id === editingItemId ? {
        ...item,
        year: milestoneForm.year,
        title: milestoneForm.title,
        subtitle: milestoneForm.subtitle,
        description: milestoneForm.description,
        type: milestoneForm.type,
        story: milestoneForm.story,
        imageUrl: imageUrl,
        images: imagesList
      } : item);
    } else {
      const newItem: JourneyMilestone = {
        id: "milestone-" + Date.now(),
        year: milestoneForm.year,
        title: milestoneForm.title,
        subtitle: milestoneForm.subtitle,
        description: milestoneForm.description,
        type: milestoneForm.type,
        story: milestoneForm.story,
        imageUrl: imageUrl,
        images: imagesList,
        createdAt: new Date().toISOString()
      };
      updatedList = [...milestones, newItem];
    }
    setMilestones(updatedList);
    setMilestoneForm({ year: '', title: '', subtitle: '', description: '', type: 'success', story: '', imageUrl: '', images: [] });
    setEditingItemId(null);
    setHasUnsavedChanges(true);
    alert(isEditing ? "Timeline milestone updated in preview!" : "Timeline milestone drafted in preview!");
  };

  const handleStartEditMilestone = (item: JourneyMilestone) => {
    setEditingItemId(item.id);
    setMilestoneForm({
      year: item.year,
      title: item.title,
      subtitle: item.subtitle,
      description: item.description,
      type: item.type,
      story: item.story || '',
      imageUrl: item.imageUrl || '',
      images: item.images || (item.imageUrl ? [item.imageUrl] : [])
    });
  };

  const handleDeleteMilestone = (id: string) => {
    requestConfirm(
      "Remove Milestone",
      "Are you sure you want to remove this milestone entry in preview?",
      () => {
        const updatedList = milestones.filter(item => item.id !== id);
        setMilestones(updatedList);
        setHasUnsavedChanges(true);
      }
    );
  };

  // ----------------------------------------------------
  // MAP PHOTOS PORTFOLIO ACTIONS
  // ----------------------------------------------------
  const handleAddOrEditPhoto = (e: React.FormEvent) => {
    e.preventDefault();

    if (!photoForm.location || !photoForm.title) {
      alert("Location Name and Title are required.");
      return;
    }

    const url = photoForm.images && photoForm.images.length > 0 ? photoForm.images[0] : photoForm.url;
    const imagesList = photoForm.images && photoForm.images.length > 0 ? photoForm.images : (url ? [url] : []);

    if (imagesList.length === 0) {
      alert("An image file or URL is required.");
      return;
    }

    const isEditing = editingItemId !== null;
    let updatedList: ArchivePhoto[];
    if (isEditing) {
      updatedList = photos.map(item => item.id === editingItemId ? {
        ...item,
        location: photoForm.location,
        title: photoForm.title,
        description: photoForm.description,
        story: photoForm.story,
        category: photoForm.category,
        date: photoForm.date,
        url: url,
        images: imagesList
      } : item);
    } else {
      const newItem: ArchivePhoto = {
        id: "photo-" + Date.now(),
        url: url,
        images: imagesList,
        location: photoForm.location,
        title: photoForm.title,
        description: photoForm.description,
        story: photoForm.story,
        category: photoForm.category,
        date: photoForm.date,
        createdAt: new Date().toISOString()
      };
      updatedList = [...photos, newItem];
    }
    setPhotos(updatedList);
    setPhotoForm({ url: '', location: '', title: '', description: '', story: '', category: 'travel', date: '', images: [] });
    setEditingItemId(null);
    setHasUnsavedChanges(true);
    alert(isEditing ? "Map photo revised in preview!" : "Travel map pin drafted in preview!");
  };

  const handleStartEditPhoto = (item: ArchivePhoto) => {
    setEditingItemId(item.id);
    setPhotoForm({
      url: item.url || '',
      location: item.location,
      title: item.title,
      description: item.description,
      story: item.story || '',
      category: item.category,
      date: item.date || '',
      images: item.images || (item.url ? [item.url] : [])
    });
  };

  const handleDeletePhoto = (id: string) => {
    requestConfirm(
      "Delete Map Pin",
      "Are you sure you want to disconnect this map portfolio pin in preview?",
      () => {
        const updatedList = photos.filter(item => item.id !== id);
        setPhotos(updatedList);
        setHasUnsavedChanges(true);
      }
    );
  };

  // ----------------------------------------------------
  // CONTACT MESSAGE ACTIONS
  // ----------------------------------------------------
  const handleDeleteMessage = (id: string) => {
    requestConfirm(
      "Delete Viewer Message",
      "Are you sure you want to erase this received viewer email in preview?",
      () => {
        const updatedList = messages.filter(item => item.id !== id);
        setMessages(updatedList);
        setHasUnsavedChanges(true);
      }
    );
  };

  const handleClearEditing = () => {
    setEditingItemId(null);
    setPhotoForm({ url: '', location: '', title: '', description: '', story: '', category: 'travel', date: '', images: [] });
    setBlogForm({ title: '', content: '', imageUrl: '', category: '', excerpt: '', images: [] });
    setGalleryForm({ description: '', imageUrl: '', images: [] });
    setGalleryMultiImages([]);
    setPortfolioMultiImages([]);
    setIsBlogMultiMode(false);
    setBlogMultiImages([]);
    setIsProjectMultiMode(false);
    setProjectMultiImages([]);
    setIsMilestoneMultiMode(false);
    setMilestoneMultiImages([]);
    setProjectForm({ title: '', description: '', longDescription: '', category: 'programming', imageUrl: '', link: '', githubUrl: '', techStack: '', images: [] });
    setMilestoneForm({ year: '', title: '', subtitle: '', description: '', type: 'success', story: '', imageUrl: '', images: [] });
    setSocialForm({ platform: 'Facebook', url: '', label: '', metric: '', iconCode: 'Facebook' });
  };

  return (
    <>
      {isMinimized ? (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] bg-slate-950/95 text-white shadow-2xl rounded-2xl flex items-center gap-4 px-6 py-3.5 border border-slate-800 backdrop-blur-md pointer-events-auto shrink-0 select-none">
          <div className="flex items-center gap-2 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono font-medium tracking-wide">Live Preview Mode Active</span>
          </div>
          <button
            onClick={() => setIsMinimized(false)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all"
            title="Return to Back Office Editor Console"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Return to Editor</span>
          </button>

          <button
            onClick={handleMasterSave}
            disabled={isSaving}
            className={`${
              hasUnsavedChanges 
                ? "bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse" 
                : "bg-slate-800 hover:bg-slate-700 text-slate-300"
            } font-medium text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all`}
            title="Save draft modifications permanently to live server database"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isSaving ? "Saving..." : "Save Draft"}</span>
          </button>

          <button
            onClick={handleRestoreBackupAndClose}
            className="bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all"
            title="Exit Admin Panel and Return to live website"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      ) : (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-hidden" id="admin-panel-overlay">
      <div className="bg-white rounded-3xl w-full max-w-7xl h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100 relative">
        
        {/* Panel Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden xs:flex w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-600 text-white items-center justify-center text-xs font-mono font-bold shrink-0">BO</span>
            <div className="text-left">
              <h2 className="text-xs sm:text-sm font-serif font-black tracking-tight uppercase">Admin Console</h2>
              <p className="hidden md:block text-[10px] text-slate-400 font-mono">Control hub for global metadata and entities</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 pointer-events-auto">
            {/* Status light */}
            {hasUnsavedChanges && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-mono border border-yellow-500/20 mr-1.5 animate-pulse">
                ● Draft modifications pending
              </span>
            )}

            {/* Live Preview Button */}
            <button
              onClick={() => setIsMinimized(true)}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-medium text-[11px] px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl flex items-center gap-1 sm:gap-1.5 transition-all focus:outline-none cursor-pointer"
              title="Toggle interactive live preview of modifications on main screen"
            >
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Live Preview</span>
            </button>

              {/* Save Button */}
              <button
                onClick={handleMasterSave}
                disabled={isSaving}
                className={`${
                  hasUnsavedChanges 
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md cursor-pointer" 
                    : "bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed"
                } font-medium text-[11px] px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl flex items-center gap-1 sm:gap-1.5 transition-all focus:outline-none`}
                title="Save draft changes permanently to server"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>

              {/* Log Out Button */}
              <button 
                onClick={handleRestoreBackupAndClose}
                className="bg-rose-950/20 hover:bg-rose-600 border border-rose-900/30 text-rose-400 hover:text-white font-bold text-[11px] px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl flex items-center gap-1 sm:gap-1.5 transition-all ml-1.5 focus:outline-none cursor-pointer"
                title="Log out and return to the main website"
                id="logout-bo"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </div>
          </div>

        {/* Tab Navigation System & Core Working Canvas */}
        <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
          
          {/* Mobile Dropdown Select Navigation: visible on mobile, hidden on desktop */}
          <div className="lg:hidden w-full bg-slate-100 border-b border-slate-200 p-3 sm:p-4 shrink-0">
            <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 font-extrabold mb-1.5 text-left">
              Active Console Section
            </label>
            <div className="relative">
              <select
                value={activeTab}
                onChange={(e) => {
                  setActiveTab(e.target.value as AdminTab);
                  handleClearEditing();
                }}
                className="w-full bg-white border border-slate-250 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-mono font-bold focus:outline-none focus:border-blue-500 appearance-none shadow-sm cursor-pointer pr-10 text-left"
              >
                <option value="profile">🏫 Bio & CV Coordinates</option>
                <option value="socials">🌐 Social Coordinates ({socialLinks.length})</option>
                <option value="blogs">📝 Writing Blogs ({blogs.length})</option>
                <option value="projects">💼 Coded Projects ({projects.length})</option>
                <option value="milestones">📅 Milestones Timeline ({milestones.length})</option>
                <option value="portfolio">🥞 Visual Map Pins ({photos.length})</option>
                <option value="reviews">💬 Testimonials Approval ({recommendations.filter(r => !r.approved).length ? `Pending: ${recommendations.filter(r => !r.approved).length}` : "0"})</option>
                <option value="messages">✉️ Mail Envelope Inbox ({messages.length})</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Responsive Left Sticky Portal Navigation - Desktop Sidebar */}
          <div className="hidden lg:flex w-64 bg-slate-50 border-r border-slate-200 p-4 shrink-0 flex-col gap-1 overflow-y-auto">
            
            <button
              onClick={() => { setActiveTab('profile'); handleClearEditing(); }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-[10px] font-mono tracking-wider uppercase transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'profile' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/50'
              }`}
            >
              <School className="w-3.5 h-3.5" />
              <span>Bio & CV Coordinates</span>
            </button>

            <button
              onClick={() => { setActiveTab('socials'); handleClearEditing(); }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-[10px] font-mono tracking-wider uppercase transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'socials' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/50'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Social Coordinates ({socialLinks.length})</span>
            </button>

            <button
              onClick={() => { setActiveTab('blogs'); handleClearEditing(); }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-[10px] font-mono tracking-wider uppercase transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'blogs' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Writing Blogs ({blogs.length})</span>
            </button>

            <button
              onClick={() => { setActiveTab('projects'); handleClearEditing(); }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-[10px] font-mono tracking-wider uppercase transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'projects' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/50'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Coded Projects ({projects.length})</span>
            </button>

            <button
              onClick={() => { setActiveTab('milestones'); handleClearEditing(); }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-[10px] font-mono tracking-wider uppercase transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'milestones' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/50'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Milestones Timeline ({milestones.length})</span>
            </button>

            <button
              onClick={() => { setActiveTab('portfolio'); handleClearEditing(); }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-[10px] font-mono tracking-wider uppercase transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'portfolio' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Visual Map Pins ({photos.length})</span>
            </button>

            <button
              onClick={() => { setActiveTab('reviews'); handleClearEditing(); }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-[10px] font-mono tracking-wider uppercase transition-all flex items-center gap-2 shrink-0 relative ${
                activeTab === 'reviews' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/50'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Testimonials Approval</span>
              {recommendations.some(r => !r.approved) && (
                <span className="absolute right-3 top-4 bg-rose-500 rounded-full w-2 h-2 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => { setActiveTab('messages'); handleClearEditing(); }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-[10px] font-mono tracking-wider uppercase transition-all flex items-center gap-2 shrink-0 relative ${
                activeTab === 'messages' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/50'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Direct Mail Envelope Inbox ({messages.length})</span>
            </button>

            {/* Quick base numerical targets */}
            <div className="pt-4 mt-4 border-t border-slate-200 text-left space-y-3 shrink-0">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-bold">Platform Metrics</span>
              
              <div className="space-y-2">
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Visitor Base Count</label>
                    <span className="text-[7px] font-mono uppercase text-emerald-600 bg-emerald-50 px-1 rounded-sm leading-none border border-emerald-100">Live</span>
                  </div>
                  <div className="w-full bg-slate-100 border border-slate-250 rounded-lg px-2 py-1 text-xs text-slate-705 font-mono font-bold select-none">
                    📬 {visitorBase} total visitors
                  </div>
                </div>

                <div className="space-y-0.5">
                  <label className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Reach Stats: GitHub stars</label>
                  <input 
                    type="number" 
                    value={stats.github}
                    onChange={e => onUpdateSocialStats({ ...stats, github: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-0.5">
                  <label className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Reach Stats: FB Followers</label>
                  <input 
                    type="number" 
                    value={stats.facebook}
                    onChange={e => onUpdateSocialStats({ ...stats, facebook: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Cloud Sync Status & Forced Real-Time Override Controls */}
                <div className="pt-2.5 mt-2.5 border-t border-slate-200/80 space-y-1.5 text-left">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Firestore Sync</label>
                    {syncStatus?.isFirestoreQuotaExceeded ? (
                      <span className="text-[7.5px] font-mono uppercase text-rose-600 bg-rose-50 px-1 rounded-sm leading-none border border-rose-100 animate-pulse">Suspended</span>
                    ) : syncStatus?.isListeningToFirestore ? (
                      <span className="text-[7.5px] font-mono uppercase text-emerald-600 bg-emerald-50 px-1 rounded-sm leading-none border border-emerald-100">Live</span>
                    ) : (
                      <span className="text-[7.5px] font-mono uppercase text-amber-600 bg-amber-55 px-1 rounded-sm leading-none border border-amber-100">Offline</span>
                    )}
                  </div>

                  <div className="bg-slate-100/80 border border-slate-200 rounded-lg p-2 text-[10px] font-mono space-y-2">
                    <div className="flex flex-col gap-0.5 text-slate-600">
                      <div className="flex items-center justify-between">
                        <span>Database:</span>
                        <span className="font-bold text-slate-805">
                          {syncStatus?.firestoreEnabled ? "Cloud" : "Local"}
                        </span>
                      </div>
                      {syncStatus?.projectName && (
                        <div className="flex items-center justify-between">
                          <span>Id:</span>
                          <span className="font-semibold text-slate-500 truncate max-w-[120px]" title={syncStatus.projectName}>
                            {syncStatus.projectName}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span>Snapshot Feed:</span>
                        <span className={`font-semibold ${syncStatus?.isListeningToFirestore ? 'text-emerald-600' : 'text-slate-500'}`}>
                          {syncStatus?.isListeningToFirestore ? "Connected" : "Disconnected"}
                        </span>
                      </div>
                      {syncStatus?.isFirestoreQuotaExceeded && (
                        <p className="text-[8px] leading-tight text-rose-500 mt-1 font-sans">
                          ⚠️ Google daily Firestore quota limits reached. Try force-sync to reconnect.
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={syncLoading}
                      onClick={handleForceSync}
                      className="w-full bg-slate-900 text-white font-sans font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] rounded py-1 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {syncLoading ? (
                        <>
                          <span className="w-2 h-2 border border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Syncing...</span>
                        </>
                      ) : (
                        <span>⚡ Force Sync / Reconnect</span>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={resetLoading}
                      onClick={handleResetDatabase}
                      className="w-full bg-rose-600 text-white font-sans font-bold hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] rounded py-1 transition-all flex items-center justify-center gap-1 cursor-pointer mt-1"
                    >
                      {resetLoading ? (
                        <>
                          <span className="w-2 h-2 border border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Resetting...</span>
                        </>
                      ) : (
                        <span>🗑️ Reset All Website Data</span>
                      )}
                    </button>

                    {syncMessage && (
                      <div className={`text-[8.5px] text-center font-bold px-1 py-0.5 rounded leading-tight ${
                        syncMessage.includes("Success") ? "text-emerald-700 bg-emerald-50 border border-emerald-100" : "text-rose-700 bg-rose-50 border border-rose-100"
                      }`}>
                        {syncMessage}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Console Working Canvas Area */}
          <div className="flex-grow overflow-y-auto p-6 lg:p-8 bg-slate-50/50">
            
            {/* ====================================================
                TAB 1: BIO AND EDUCATIONAL DEMOGRAPHICS MAP
                ==================================================== */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-fade-in text-left">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
                  <div>
                    <h3 className="text-base font-serif font-black text-slate-950 uppercase tracking-tight">Biography, Academic Details & Educational Coordinates</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Fill in verified curriculum data, contact coordinates, school and university URLs directly saved to the database fallback</p>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-5">
                    {/* Cover Profile Background & Portrait Photo Uploaders */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-2">
                        <ImageUploader 
                          value={profileForm.coverUrl || ''}
                          onChange={val => setProfileForm(p => ({ ...p, coverUrl: val }))}
                          label="Personal Website Header & Hero Cover Background Image"
                        />
                        <p className="text-[10px] text-slate-500 font-mono">
                          💡 Upload an image file or enter an image URL to serve as the scenic background behind your sticky header / top hero section wrapper.
                        </p>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-2">
                        <ImageUploader 
                          value={profileForm.profilePictureUrl || ''}
                          onChange={val => setProfileForm(p => ({ ...p, profilePictureUrl: val }))}
                          label="Your Portrait Picture (Left Hero Column — Tim Ferriss style)"
                        />
                        <p className="text-[10px] text-slate-500 font-mono">
                          👤 Upload a high-resolution portrait or headshot to represent you on the main hero segment of the first page.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-500">Applicant Full Name</label>
                        <input 
                          type="text" 
                          value={profileForm.name}
                          onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                          className="w-full bg-white border border-slate-250 rounded-xl px-3 py-2 text-xs text-slate-850 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-500">Tagline / Direct Title</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            value={profileForm.tagline}
                            onChange={e => setProfileForm(p => ({ ...p, tagline: e.target.value }))}
                            className="w-full bg-white border border-[#e2e8f0] rounded-xl px-3 py-2 text-xs text-slate-850 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-500">Primary Email</label>
                        <input 
                          type="email" 
                          value={profileForm.email}
                          onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-500">Backup Email</label>
                        <input 
                          type="email" 
                          value={profileForm.altEmail}
                          onChange={e => setProfileForm(p => ({ ...p, altEmail: e.target.value }))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-500">Phone</label>
                        <input 
                          type="text" 
                          value={profileForm.phone}
                          onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-500">WhatsApp Number</label>
                        <input 
                          type="text" 
                          value={profileForm.whatsapp}
                          onChange={e => setProfileForm(p => ({ ...p, whatsapp: e.target.value }))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <PdfUploader 
                        label="● Digital CV / Resume (PDF / DOC / DOCX)"
                        value={profileForm.cvDownloadUrl || ''}
                        onChange={val => setProfileForm(p => ({ ...p, cvDownloadUrl: val }))}
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-mono uppercase text-slate-500">Narrative Bio Story / About Summary</label>
                      </div>
                      <textarea 
                        rows={4}
                        value={profileForm.aboutText}
                        onChange={e => setProfileForm(p => ({ ...p, aboutText: e.target.value }))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 leading-relaxed focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* ✍️ Blog Page Headers Customization Subsection */}
                    <div className="border-t border-dashed border-slate-200 pt-5 space-y-4">
                      <div>
                        <h4 className="text-xs font-mono font-extrabold uppercase text-blue-600 flex items-center gap-1">
                          <span>✍️ Blog Page Headers Customization (Writings Panel)</span>
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Configure the category tagline, section title, and description paragraph displayed at the top of your public "Writing Blogs" section.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-slate-500">Blog Category Tagline</label>
                          <input 
                            type="text" 
                            placeholder="Default: THE INTELLECTUAL INK"
                            value={profileForm.blogSectionTagline || ''}
                            onChange={e => setProfileForm(p => ({ ...p, blogSectionTagline: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-slate-500">Blog Section Title</label>
                          <input 
                            type="text" 
                            placeholder="Default: Writing Blogs"
                            value={profileForm.blogSectionTitle || ''}
                            onChange={e => setProfileForm(p => ({ ...p, blogSectionTitle: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-mono uppercase text-slate-500">Blog Section Description Paragraph</label>
                        </div>
                        <textarea 
                          rows={3}
                          placeholder="Default: My writings on software architectures, database security, Photoshop layouts, and student experiences. Support my words by voting or leaving feedback!"
                          value={profileForm.blogSectionDescription || ''}
                          onChange={e => setProfileForm(p => ({ ...p, blogSectionDescription: e.target.value }))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 leading-relaxed focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-5 space-y-4">
                      <h4 className="text-xs font-mono font-extrabold uppercase text-slate-400">Institutional Coordinates ({profileForm.universityName ? "Configured" : "Raw"})</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* University */}
                        <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                          <label className="text-[10px] font-mono uppercase text-emerald-700 font-bold">1. Current University Coordinates</label>
                          <input 
                            type="text" 
                            placeholder="University Name"
                            value={profileForm.universityName}
                            onChange={e => setProfileForm(p => ({ ...p, universityName: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                          />
                          <input 
                            type="text" 
                            placeholder="Academic Link Website"
                            value={profileForm.universityLink}
                            onChange={e => setProfileForm(p => ({ ...p, universityLink: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        {/* Master research target */}
                        <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                          <label className="text-[10px] font-mono uppercase text-blue-700 font-bold">2. Master Target Coordinates</label>
                          <input 
                            type="text" 
                            placeholder="Institution Name"
                            value={profileForm.targetMasterUni}
                            onChange={e => setProfileForm(p => ({ ...p, targetMasterUni: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                          />
                          <input 
                            type="text" 
                            placeholder="Research Laboratory Link"
                            value={profileForm.targetMasterLink}
                            onChange={e => setProfileForm(p => ({ ...p, targetMasterLink: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        {/* High school */}
                        <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                          <label className="text-[10px] font-mono uppercase text-amber-700 font-bold">3. Secondary High School Details</label>
                          <input 
                            type="text" 
                            placeholder="School name"
                            value={profileForm.highSchoolName}
                            onChange={e => setProfileForm(p => ({ ...p, highSchoolName: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                          />
                          <input 
                            type="text" 
                            placeholder="School profile website URL"
                            value={profileForm.highSchoolLink}
                            onChange={e => setProfileForm(p => ({ ...p, highSchoolLink: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        {/* College */}
                        <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                          <label className="text-[10px] font-mono uppercase text-indigo-700 font-bold font-extrabold">4. College Credentials Info</label>
                          <input 
                            type="text" 
                            placeholder="College board name"
                            value={profileForm.collegeName}
                            onChange={e => setProfileForm(p => ({ ...p, collegeName: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                          />
                          <input 
                            type="text" 
                            placeholder="College direct directory URL"
                            value={profileForm.collegeLink}
                            onChange={e => setProfileForm(p => ({ ...p, collegeLink: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Additional Dynamic Academic Institutions Manager */}
                      <div className="border-t border-slate-200/60 pt-5 mt-5 space-y-4 text-left">
                        <div>
                          <h4 className="text-xs font-mono font-extrabold uppercase text-slate-400">
                            Dynamic Academic Coordinates Manager
                          </h4>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Create, organize or prune additional academic institutions to showcase on the main portfolio page.
                          </p>
                        </div>

                        {/* List of custom institutions */}
                        {(profileForm.customInstitutions || []).length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(profileForm.customInstitutions || []).map((inst, index) => (
                              <div key={inst.id || index} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden group">
                                <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => handleDeleteCustomInst(inst.id, e)}
                                    type="button"
                                    className="p-1 px-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 border border-rose-200 flex items-center justify-center transition-all cursor-pointer"
                                    title="Delete Institution"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div className="space-y-1.5 pr-6">
                                  <span className="inline-block text-[9px] font-mono font-black text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded uppercase">
                                    {inst.title}
                                  </span>
                                  <h5 className="font-serif font-black text-slate-950 text-xs text-left">
                                    {inst.name}
                                  </h5>
                                  {inst.description && (
                                    <p className="text-[10px] text-slate-500 font-mono leading-relaxed text-left">
                                      {inst.description}
                                    </p>
                                  )}
                                  {inst.link && (
                                    <a
                                      href={inst.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-[10px] font-mono text-blue-600 hover:underline pt-1 font-bold"
                                    >
                                      <span>Website Link</span>
                                      <Link2 className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Input form for registering a new custom institution */}
                        <div className="bg-slate-50 border border-slate-200/85 rounded-2xl p-4 space-y-3">
                          <span className="text-[10px] font-mono uppercase text-blue-800 font-bold block">
                            Configure New Educational Institution
                          </span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-mono uppercase text-slate-400 font-bold">Category Title / Degree</label>
                              <input 
                                type="text" 
                                placeholder="e.g. Postgraduate Studies Target, German Language Certification"
                                value={newCustomInst.title}
                                onChange={e => setNewCustomInst(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-mono uppercase text-slate-400 font-bold">Institution / Board Name</label>
                              <input 
                                type="text" 
                                placeholder="e.g. University Of Dhaka, British Council"
                                value={newCustomInst.name}
                                onChange={e => setNewCustomInst(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-mono uppercase text-slate-400 font-bold">Academics Link URL (Optional)</label>
                              <input 
                                type="text" 
                                placeholder="e.g. https://www.du.ac.bd"
                                value={newCustomInst.link}
                                onChange={e => setNewCustomInst(prev => ({ ...prev, link: e.target.value }))}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-mono uppercase text-slate-400 font-bold">Coursework / Brief Details (Optional)</label>
                              <input 
                                type="text" 
                                placeholder="e.g. Specialized theoretical physics coursework and lab benchmarks."
                                value={newCustomInst.description}
                                onChange={e => setNewCustomInst(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={handleAddCustomInst}
                              className="bg-slate-900 hover:bg-slate-950 font-bold text-white px-4 py-2 rounded-xl text-[10px] font-mono uppercase tracking-wider shadow cursor-pointer transition-all flex items-center gap-1.5"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Coordinates Target</span>
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>

                    <div className="pt-4 flex justify-end">
                      <button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-700 font-bold text-white px-6 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider shadow-md cursor-pointer transition-all flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Save Profile coordinates</span>
                      </button>
                    </div>

                  </form>
                </div>
              </div>
            )}

            {/* ====================================================
                TAB 2: SOCIAL COORDINATES DIRECTORY
                ==================================================== */}
            {activeTab === 'socials' && (
              <div className="space-y-6 animate-fade-in text-left">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  
                  {/* Form widget */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 h-fit space-y-4">
                    <div>
                      <h4 className="text-sm font-serif font-black uppercase text-slate-900">
                        {editingItemId ? "✏️ Edit Social Link" : "➕ Add Social Coordinate"}
                      </h4>
                      <p className="text-[9.5px] font-mono text-slate-400">Update footer and contact grid channels instantly</p>
                    </div>

                    <form onSubmit={handleAddOrEditSocial} className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono uppercase text-slate-500">Platform Title</label>
                        <select 
                          value={socialForm.platform}
                          onChange={e => setSocialForm(s => ({ ...s, platform: e.target.value }))}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        >
                          <option value="Facebook">Facebook</option>
                          <option value="GitHub">GitHub</option>
                          <option value="LinkedIn">LinkedIn</option>
                          <option value="WhatsApp">WhatsApp</option>
                          <option value="Telegram">Telegram</option>
                          <option value="Twitter">Twitter / X</option>
                          <option value="YouTube">YouTube</option>
                          <option value="Website">Personal Website</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono uppercase text-slate-500">Profile URL</label>
                        <input 
                          type="text" 
                          placeholder="https://..."
                          value={socialForm.url}
                          onChange={e => setSocialForm(s => ({ ...s, url: e.target.value }))}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-850 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono uppercase text-slate-500">Card Button Label</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Facebook profile, GitHub archive"
                          value={socialForm.label}
                          onChange={e => setSocialForm(s => ({ ...s, label: e.target.value }))}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-805"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono uppercase text-slate-500">Profile Metric Stats (e.g. follower count)</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 3420 Followers, 114 Starts"
                          value={socialForm.metric}
                          onChange={e => setSocialForm(s => ({ ...s, metric: e.target.value }))}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                        />
                      </div>

                      <div className="pt-3 flex gap-2">
                        {editingItemId && (
                          <button 
                            type="button" 
                            onClick={handleClearEditing}
                            className="bg-slate-100 hover:bg-slate-200 hover:text-slate-900 border border-slate-250 text-slate-600 px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase"
                          >
                            Cancel
                          </button>
                        )}
                        <button 
                          type="submit" 
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-xs font-mono uppercase flex-grow tracking-wider transition-all"
                        >
                          {editingItemId ? "Apply correction" : "Save coordinate"}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* List directory view */}
                  <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">Dynamic active nodes</span>

                    {socialLinks.length === 0 ? (
                      <p className="text-slate-400 font-mono text-center text-xs py-10">No dynamic social channels compiled yet. Falls back to static original ones.</p>
                    ) : (
                      <div className="space-y-3">
                        {socialLinks.map(s => (
                          <div key={s.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200/70 flex items-center justify-between gap-4">
                            <div className="min-w-0 flex-grow text-left">
                              <div className="flex items-center gap-2">
                                <span className="bg-blue-600 rounded-md text-white text-[8.5px] font-mono font-bold px-1.5 uppercase leading-none py-0.5">{s.platform}</span>
                                <span className="text-slate-400 text-[10px] font-mono truncate max-w-[200px]">{s.url}</span>
                              </div>
                              <h5 className="font-serif font-black text-xs text-slate-950 mt-1">{s.label}</h5>
                              {s.metric && <p className="text-[9.5px] text-emerald-600 font-mono mt-0.5">● Dynamic Base: {s.metric}</p>}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button 
                                onClick={() => handleStartEditSocial(s)}
                                className="p-1.5 bg-sky-50 text-sky-600 border border-sky-200/40 hover:bg-sky-100 rounded-lg cursor-pointer"
                                title="Edit this node"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteSocial(s.id)}
                                className="p-1.5 bg-rose-50 text-rose-600 border border-rose-200/40 hover:bg-rose-100 rounded-lg cursor-pointer"
                                title="Delete coordinate"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* ====================================================
                TAB 3: NARRATIVE STORIES (BLOGS) PAGE
                ==================================================== */}
            {activeTab === 'blogs' && (
              <div className="space-y-6 animate-fade-in text-left">
                <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
                  
                  {/* Master Form Workspace toggle */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-serif font-black uppercase text-slate-900">
                          {editingItemId ? "✏️ Edit Blog Post" : "➕ Write New Narrative Story Post"}
                        </h4>
                        <p className="text-[9.5px] font-mono text-slate-400">Compose articles displayed inside narrative dynamic timeline explorer logs</p>
                      </div>
                      {editingItemId && (
                        <button 
                          onClick={handleClearEditing}
                          className="bg-slate-100 hover:bg-slate-200 hover:text-slate-900 border border-slate-250 text-slate-600 px-3 py-1 text-[10px] font-mono uppercase rounded-lg"
                        >
                          Cancel Edit Mode
                        </button>
                      )}
                    </div>

                    <form onSubmit={handleAddOrEditBlog} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-500">Story Title</label>
                        <input 
                          type="text" 
                          placeholder="Enter catchy headline..."
                          value={blogForm.title}
                          onChange={e => setBlogForm(b => ({ ...b, title: e.target.value }))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-[#cbd5e1]"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-slate-500">Blog Category Group</label>
                          <select
                            value={blogForm.category}
                            onChange={e => setBlogForm(b => ({ ...b, category: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-[#cbd5e1]"
                          >
                            <option value="">Choose category preset or type custom below...</option>
                            <option value="Technology">Technology</option>
                            <option value="Business">Business & Management</option>
                            <option value="Education">Education & Study</option>
                            <option value="Photoshop">Photoshop & Art</option>
                            <option value="Student Life">Student Life</option>
                            <option value="Personal">Thoughts & Ideas</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-slate-500">Or type custom category label</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Artificial Intelligence, Travel log, Career"
                            value={blogForm.category}
                            onChange={e => setBlogForm(b => ({ ...b, category: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-[#cbd5e1]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-500">Short Excerpt Summary (Displayed in list card preview)</label>
                        <input 
                          type="text" 
                          placeholder="Provide brief subtitle description / quick excerpt summary shown on blogs archive card..."
                          value={blogForm.excerpt}
                          onChange={e => setBlogForm(b => ({ ...b, excerpt: e.target.value }))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-[#cbd5e1]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-500">Blog post images (Upload multiple pictures or paste URLs)</label>
                        <MultiImageUploader 
                          values={blogForm.images || []}
                          onChange={val => setBlogForm(b => ({ ...b, images: val, imageUrl: val[0] || '' }))}
                          label="Featured blog photos (Supports multiple pictures in a single post)"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-mono uppercase text-slate-500">Markdown post content (or raw paragraph)</label>
                        </div>
                        <textarea 
                          rows={6}
                          placeholder="# Story headings\nType details narrative story here..."
                          value={blogForm.content}
                          onChange={e => setBlogForm(b => ({ ...b, content: e.target.value }))}
                          className="w-full bg-white border border-slate-205 rounded-xl px-3 py-2 text-xs text-slate-800 leading-relaxed font-mono"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button 
                          type="submit" 
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all"
                        >
                          {editingItemId ? "Update narrative post" : "Publish dynamic blog story"}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Blogs table list */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-extrabold block">Published catalog ({blogs.length})</span>
                    
                    {blogs.length === 0 ? (
                      <p className="text-slate-450 text-slate-400 font-mono text-center text-xs py-10">No published articles yet. Add coordinates above.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-400 font-mono text-left">
                              <th className="pb-2.5 font-bold uppercase">Featured Picture</th>
                              <th className="pb-2.5 font-bold uppercase">Blog Details</th>
                              <th className="pb-2.5 font-bold uppercase">Date Published</th>
                              <th className="pb-2.5 font-bold uppercase text-right">Settings</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {blogs.map(b => (
                              <tr key={b.id} className="hover:bg-slate-50/50">
                                <td className="py-2.5 pr-4 align-top">
                                  {b.imageUrl ? (
                                    <img 
                                      src={b.imageUrl} 
                                      alt="" 
                                      className="w-12 h-8 rounded-md object-cover border border-slate-200 shadow-xs" 
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <span className="text-[9px] text-slate-300 font-mono bg-slate-50 px-1 py-0.5 rounded border">No cover</span>
                                  )}
                                </td>
                                <td className="py-2.5 pr-4 align-top max-w-[320px]">
                                  <div className="font-serif font-black text-slate-900 truncate mb-1">{b.title}</div>
                                  <div className="flex gap-2 items-center mb-1">
                                    <span className="text-[9px] font-mono font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full border border-blue-100 uppercase">{b.category || 'Technology'}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-mono line-clamp-1 italic">{b.excerpt || 'No short excerpt provided.'}</div>
                                </td>
                                <td className="py-2.5 text-slate-500 font-mono pr-4 align-top whitespace-nowrap">{new Date(b.createdAt).toLocaleDateString()}</td>
                                <td className="py-2.5 text-right">
                                  <div className="inline-flex gap-1">
                                    <button 
                                      onClick={() => handleStartEditBlog(b)}
                                      className="p-1 px-2.5 bg-sky-50 text-sky-600 hover:bg-sky-100 rounded-md border border-sky-100 cursor-pointer"
                                      title="Edit story"
                                    >
                                      Edit
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteBlog(b.id)}
                                      className="p-1 px-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-md border border-rose-100 cursor-pointer"
                                      title="Trash story record"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* ====================================================
                TAB 4: CODED PROJECTS HUB CATALOG
                ==================================================== */}
            {activeTab === 'projects' && (
              <div className="space-y-6 animate-fade-in text-left">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-serif font-black uppercase text-slate-900">
                        {editingItemId ? "✏️ Edit Project Parameters" : "➕ Register Dynamic Coded Project"}
                      </h4>
                      <p className="text-[9.5px] font-mono text-slate-400">Publish professional applications linked inside portfolio dashboard grids</p>
                    </div>
                    {editingItemId && (
                      <button 
                        onClick={handleClearEditing}
                        className="bg-slate-100 hover:bg-slate-200 border text-slate-600 px-3 py-1 text-[10px] font-mono uppercase rounded-lg"
                      >
                        Cancel edit
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleAddOrEditProject} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-slate-500 block">Project Title</label>
                          <input 
                            type="text" 
                            placeholder="e.g. LinkVerse engine"
                            value={projectForm.title}
                            onChange={e => setProjectForm(p => ({ ...p, title: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-slate-500 block">Category sector</label>
                          <select 
                            value={projectForm.category}
                            onChange={e => setProjectForm(p => ({ ...p, category: e.target.value as 'programming' | 'business' }))}
                            className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:outline-none"
                          >
                            <option value="programming">Programming (Systems & Database)</option>
                            <option value="business">Business & Photoshop retouch composites</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-slate-500 block">Live Connection URL Link</label>
                          <input 
                            type="text" 
                            placeholder="https://..."
                            value={projectForm.link}
                            onChange={e => setProjectForm(p => ({ ...p, link: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-slate-500 block">Git Repository Code Hub</label>
                          <input 
                            type="text" 
                            placeholder="https://github.com/..."
                            value={projectForm.githubUrl}
                            onChange={e => setProjectForm(p => ({ ...p, githubUrl: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-slate-500 block">Project images (Upload multiple pictures or paste URLs)</label>
                          <MultiImageUploader 
                            values={projectForm.images || []}
                            onChange={val => setProjectForm(p => ({ ...p, images: val, imageUrl: val[0] || '' }))}
                            label="Featured project photos (Supports multiple pictures in a single project)"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-slate-500 block">Technology stack chips (comma-separated)</label>
                          <input 
                            type="text" 
                            placeholder="Node.js, Express, Supabase, TypeScript"
                            value={projectForm.techStack}
                            onChange={e => setProjectForm(p => ({ ...p, techStack: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none"
                          />
                        </div>
                      </div>

                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-slate-500 block">Short summary definition (one liner)</label>
                      <input 
                        type="text" 
                        placeholder="Bending photography compositing and database theories to shape speed."
                        value={projectForm.description}
                        onChange={e => setProjectForm(p => ({ ...p, description: e.target.value }))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 pr-10 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-mono uppercase text-slate-500">Detailed Narrative Story / Behind the Scenes development (optional)</label>
                      </div>
                      <textarea 
                        rows={3}
                        placeholder="Discuss lessons from defeat, memory pools, caching details encountered while compiling this application system."
                        value={projectForm.longDescription}
                        onChange={e => setProjectForm(p => ({ ...p, longDescription: e.target.value }))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider cursor-pointer font-extrabold shadow-md transition-all"
                      >
                        {editingItemId ? "Save project coordinates" : "Publish coded design project"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Projects listing layout */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">Current dynamic projects catalog ({projects.length})</span>

                  {projects.length === 0 ? (
                    <p className="text-slate-400 font-mono text-center text-xs py-10">Empty dynamic category. Add your first design above.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {projects.map(p => (
                        <div key={p.id} className="bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden p-4 flex flex-col justify-between gap-4">
                          <div className="space-y-2 text-left">
                            <div className="flex items-center justify-between shrink-0">
                              <span className="bg-emerald-50 text-emerald-800 text-[8px] font-mono font-extrabold px-1.5 py-0.5 border border-emerald-100 rounded-md uppercase leading-none">{p.category}</span>
                              <div className="flex gap-1">
                                <button 
                                  onClick={() => handleStartEditProject(p)} 
                                  className="text-sky-600 hover:text-sky-800 p-1 bg-white hover:bg-sky-55 rounded border border-slate-200 cursor-pointer"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteProject(p.id)} 
                                  className="text-rose-600 hover:text-rose-800 p-1 bg-white hover:bg-rose-55 rounded border border-slate-200 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <h5 className="font-serif font-black text-slate-950 text-sm">{p.title}</h5>
                            <p className="text-slate-550 text-slate-500 text-[11px] leading-relaxed line-clamp-2">{p.description}</p>
                            {p.techStack && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {p.techStack.map(t => (
                                  <span key={t} className="text-[8.5px] font-mono text-slate-400 bg-slate-200/50 rounded px-1">{t}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ====================================================
                TAB 5: DAILY LIFE PHOTO GALLERY
                ==================================================== */}
            {activeTab === 'gallery' && (
              <div className="space-y-6 animate-fade-in text-left">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  
                  {/* form widget */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 h-fit space-y-4">
                    <div>
                      <h4 className="text-sm font-serif font-black uppercase text-slate-900">
                        {editingItemId ? "✏️ Edit Photo Caption" : "➕ Upload Daily Life Photo"}
                      </h4>
                      <p className="text-[9.5px] font-mono text-slate-400">Add snapshots of active life directly to the visual grid</p>
                    </div>

                    <form onSubmit={handleAddOrEditGallery} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-500 block">Daily snap images (Upload multiple pictures or paste URLs)</label>
                        <MultiImageUploader 
                          values={galleryForm.images || []}
                          onChange={val => setGalleryForm(g => ({ ...g, images: val, imageUrl: val[0] || '' }))}
                          label="Featured gallery photos (Supports multiple pictures in a single item)"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-500 block">Short caption snapshot description </label>
                        <textarea 
                          rows={3}
                          placeholder="Reflecting on university architectures / design compositing workflows..."
                          value={galleryForm.description}
                          onChange={e => setGalleryForm(g => ({ ...g, description: e.target.value }))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                        />
                      </div>

                      <div className="pt-2 flex gap-2">
                        {editingItemId && (
                          <button 
                            type="button" 
                            onClick={handleClearEditing}
                            className="bg-slate-100 hover:bg-slate-250 border text-slate-600 px-3 py-1.5 rounded-lg text-xs font-mono uppercase"
                          >
                            Cancel
                          </button>
                        )}
                        <button 
                          type="submit" 
                          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-4 py-2 rounded-lg text-xs font-mono uppercase flex-grow tracking-wider shadow-md transition-all cursor-pointer"
                        >
                          {editingItemId ? "Apply correction" : "Verify and post snapshot"}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* snapshot grid */}
                  <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">Live dynamic gallery photos ({galleryItems.length})</span>

                    {galleryItems.length === 0 ? (
                      <p className="text-slate-400 font-mono text-center text-xs py-10 animate-pulse">No snapshots registered in active directories.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {galleryItems.map(g => (
                          <div key={g.id} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden p-3.5 flex items-center gap-3.5 relative group">
                            <img 
                              src={g.imageUrl} 
                              alt="" 
                              className="w-16 h-16 rounded-lg object-cover border border-slate-200" 
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0 flex-grow text-left">
                              <p className="text-slate-700 text-xs font-sans leading-relaxed line-clamp-2">{g.description}</p>
                              <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-[8.5px] font-mono text-red-650 bg-red-50 text-slate-500 font-bold px-1.5 py-0.2 rounded leading-none border border-slate-200">❤ {g.likes || 0} Likes</span>
                                <span className="text-[8.5px] font-mono text-slate-400 uppercase tracking-wider">{g.comments ? g.comments.length : 0} Comments</span>
                              </div>
                            </div>

                            <div className="flex flex-col gap-1 shrink-0">
                              <button 
                                onClick={() => handleStartEditGallery(g)}
                                className="p-1 px-1.5 bg-sky-50 text-sky-600 hover:bg-sky-100 rounded-md border text-[9px] font-mono uppercase cursor-pointer"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteGallery(g.id)}
                                className="p-1 px-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-md border text-[9px] font-mono uppercase cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* ====================================================
                TAB 6: CHRONIC MILESTONES TIMELINE WORKSPACE
                ==================================================== */}
            {activeTab === 'milestones' && (
              <div className="space-y-6 animate-fade-in text-left">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-serif font-black uppercase text-slate-900">
                        {editingItemId ? "✏️ Edit Chronology Milestone" : "➕ Record Timeline Milestone"}
                      </h4>
                      <p className="text-[9.5px] font-mono text-slate-400">Compose education coordinates, product releases, or personal narratives displayed in chronological scroll paths</p>
                    </div>
                    {editingItemId && (
                      <button 
                        onClick={handleClearEditing}
                        className="bg-slate-100 hover:bg-slate-200 border text-slate-600 px-3 py-1 text-[10px] font-mono uppercase rounded-lg"
                      >
                        Cancel Edit Mode
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleAddOrEditMilestone} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-500">Milestone Year Span / Date</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Late 2026, 2025"
                          value={milestoneForm.year}
                          onChange={e => setMilestoneForm(m => ({ ...m, year: e.target.value }))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-500">Chronicle Title</label>
                        <input 
                          type="text" 
                          placeholder="Academic Milestone: Degree Complete"
                          value={milestoneForm.title}
                          onChange={e => setMilestoneForm(m => ({ ...m, title: e.target.value }))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-500">Affiliation subtitle</label>
                        <input 
                          type="text" 
                          placeholder="Geomatika University, Malaysia"
                          value={milestoneForm.subtitle}
                          onChange={e => setMilestoneForm(m => ({ ...m, subtitle: e.target.value }))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-905"
                        />
                      </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-slate-500">Category coordinate node</label>
                          <select 
                            value={milestoneForm.type}
                            onChange={e => setMilestoneForm(m => ({ ...m, type: e.target.value as 'success' | 'failure' | 'academic' | 'dream' }))}
                            className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800"
                          >
                            <option value="success">Success Catalyst (Product Launch & releases)</option>
                            <option value="academic">Academic verification (School/University accolades)</option>
                            <option value="dream">Academic Dream Horizon ( Czech Republic masters relocations )</option>
                            <option value="failure">Learning from Defeats (Reset & re-engineering systems)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-slate-500">Synopsis short explanation</label>
                          <input 
                            type="text" 
                            placeholder="Complete Bachelor studying with standard software certificates..."
                            value={milestoneForm.description}
                            onChange={e => setMilestoneForm(m => ({ ...m, description: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-slate-500 block">Milestone images (Upload multiple pictures or paste URLs)</label>
                          <MultiImageUploader 
                            values={milestoneForm.images || []}
                            onChange={val => setMilestoneForm(m => ({ ...m, images: val, imageUrl: val[0] || '' }))}
                            label="Chronological photos (Supports multiple pictures in a single achievement)"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-slate-500 block">Behind the Scenes Narrative / Personal Story chapter</label>
                      <textarea 
                        rows={3}
                        placeholder="Write dynamic narrative story details. Focus on challenges, systems designed, or lessons compiled."
                        value={milestoneForm.story}
                        onChange={e => setMilestoneForm(m => ({ ...m, story: e.target.value }))}
                        className="w-full bg-white border border-[#e2e8f0] rounded-xl px-3 py-2 text-xs text-slate-800 leading-relaxed font-sans"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider shadow-md transition-all"
                      >
                        {editingItemId ? "Correct milestone log" : "Record chronology milestone"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Milestones dynamic lists */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#94a3b8] font-bold block">Current chronological timeline path ({milestones.length})</span>

                  {milestones.length === 0 ? (
                    <p className="text-slate-400 font-mono text-center text-xs py-10">No chronological milestones defined. Populate coordinates.</p>
                  ) : (
                    <div className="space-y-3">
                      {milestones.map(m => (
                        <div key={m.id} className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 flex items-center justify-between gap-4">
                          <div className="min-w-0 flex-grow text-left">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="bg-slate-900 rounded text-white text-[9px] font-mono font-bold px-2 py-0.5">{m.year}</span>
                              <span className="text-[8.5px] font-mono bg-blue-50 text-blue-800 font-bold px-1.5 py-0.2 border border-blue-105 rounded uppercase leading-none">{m.type}</span>
                              <span className="text-slate-400 text-xs font-mono">{m.subtitle}</span>
                            </div>
                            <h5 className="font-serif font-black text-slate-950 text-sm mt-1">{m.title}</h5>
                            <p className="text-slate-500 text-[10.5px] mt-0.5 leading-relaxed truncate">{m.description}</p>
                          </div>

                          <div className="flex gap-1 shrink-0">
                            <button 
                              onClick={() => handleStartEditMilestone(m)} 
                              className="p-1 px-2.5 bg-white border hover:bg-sky-50 text-sky-600 rounded-md text-[10px] font-mono uppercase cursor-pointer"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteMilestone(m.id)} 
                              className="p-1 px-1.5 bg-white border hover:bg-rose-50 text-rose-600 rounded-md cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ====================================================
                TAB 7: VISUAL PHOTOS MAP HUB
                ==================================================== */}
            {activeTab === 'portfolio' && (
              <div className="space-y-6 animate-fade-in text-left">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-serif font-black uppercase text-[#0f172a]">
                        {editingItemId ? "✏️ Edit Map Photo Item" : "➕ Deploy Visual Photo Map Node"}
                      </h4>
                      <p className="text-[9.5px] font-mono text-slate-400">Initialize coordinates, location narratives, and composite photos pinned on client maps</p>
                    </div>
                    {editingItemId && (
                      <button 
                        onClick={handleClearEditing}
                        className="bg-slate-100 hover:bg-slate-200 border text-slate-600 px-3 py-1 text-[10px] font-mono uppercase rounded-lg"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleAddOrEditPhoto} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-500 block">Map Location coordinate name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Kuala Lumpur, Malaysia"
                          value={photoForm.location}
                          onChange={e => setPhotoForm(p => ({ ...p, location: e.target.value }))}
                          className="w-full bg-white border border-[#cbd5e1]/70 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-500 block">Snapshot Title Banner</label>
                        <input 
                          type="text" 
                          placeholder="Urban Architecture Semesters"
                          value={photoForm.title}
                          onChange={e => setPhotoForm(p => ({ ...p, title: e.target.value }))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-500 block">Snapshot Date coordinate</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 2024-11, 2025-02"
                          value={photoForm.date}
                          onChange={e => setPhotoForm(p => ({ ...p, date: e.target.value }))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                        />
                      </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-slate-500 block">Creative category</label>
                          <select 
                            value={photoForm.category}
                            onChange={e => setPhotoForm(p => ({ ...p, category: e.target.value as 'travel' | 'photoshop' }))}
                            className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800"
                          >
                            <option value="travel">Travel exploration coordinate photo (pinned on global map)</option>
                            <option value="photoshop">Photoshop compositing masterpiece composite art</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-slate-500 block">Short description caption</label>
                          <input 
                            type="text" 
                            placeholder="Reflecting on the skyline of Kuala Lumpur during active study semesters..."
                            value={photoForm.description}
                            onChange={e => setPhotoForm(p => ({ ...p, description: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-805"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-slate-500 block">Snapshot images (Upload multiple pictures or paste URLs)</label>
                          <MultiImageUploader 
                            values={photoForm.images || []}
                            onChange={val => setPhotoForm(p => ({ ...p, images: val, url: val[0] || '' }))}
                            label="Composite / Map photos (Supports multiple pictures in a single pin)"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-slate-500">Behind the scenes composite / travel adventure story text</label>
                      <textarea 
                        rows={3}
                        placeholder="Detail exact spacing parameter rules, composite lighting layers blended, or mathematical matrices optimized here..."
                        value={photoForm.story}
                        onChange={e => setPhotoForm(p => ({ ...p, story: e.target.value }))}
                        className="w-full bg-white border border-slate-220 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider shadow-md cursor-pointer transition-all"
                      >
                        {editingItemId ? "Save coordinates pin" : "Deploy visual photo node"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Map photos catalog list */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">Current map photo files ({photos.length})</span>

                  {photos.length === 0 ? (
                    <p className="text-slate-450 text-slate-400 font-mono text-center text-xs py-10">Visual catalog directory empty. Upload nodes above.</p>
                  ) : (
                    <div className="divide-y divide-slate-150 space-y-3 divide-y-0">
                      {photos.map(p => (
                        <div key={p.id} className="bg-slate-55 bg-slate-50 border border-slate-210 rounded-xl p-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3.5 text-left min-w-0 flex-grow">
                            <img 
                              src={p.url} 
                              alt="" 
                              className="w-12 h-12 object-cover rounded-lg border border-slate-200" 
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0 flex-grow">
                              <div className="flex items-center gap-2">
                                <span className="bg-slate-900 rounded text-white text-[8.5px] font-mono font-bold px-2 py-0.5">{p.date}</span>
                                <span className="text-emerald-700 bg-emerald-50 text-[8px] font-mono uppercase font-bold border rounded px-1.5 leading-none">{p.category}</span>
                                <span className="text-slate-450 text-[10.5px] font-mono truncate">{p.location}</span>
                              </div>
                              <h5 className="font-serif font-black text-slate-950 text-xs mt-1">{p.title}</h5>
                            </div>
                          </div>

                          <div className="inline-flex gap-1.5 shrink-0">
                            <button 
                              onClick={() => handleStartEditPhoto(p)}
                              className="p-1.5 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-md border border-sky-150 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeletePhoto(p.id)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-md border border-rose-150 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ====================================================
                TAB 8: RECOMMENDATIONS TESTIMONIAL APPROVALS
                ==================================================== */}
            {activeTab === 'reviews' && (
              <div className="space-y-6 animate-fade-in text-left">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                  <div>
                    <h3 className="text-base font-serif font-black text-[#0f172a] uppercase">Testimonial Reviews Approbations Hub</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Approve reader submissions before they display inside active portfolio recommendations slider panels</p>
                  </div>

                  {recommendations.length === 0 ? (
                    <p className="text-slate-400 font-mono text-center text-xs py-10">No recommendation submissions recorded.</p>
                  ) : (
                    <div className="space-y-4">
                      {recommendations.map(r => (
                        <div key={r.id} className={`p-5 rounded-2xl border ${r.approved ? 'bg-emerald-50/20 border-emerald-100' : 'bg-rose-50/15 border-slate-200 shadow-xs'} text-left space-y-3`}>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-serif font-black text-slate-950 text-sm">{r.name}</h4>
                                <span className={`text-[8.5px] font-mono px-2 py-0.5 rounded-full uppercase font-bold leading-none ${r.approved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                  {r.approved ? '● Approved & live' : '● Pending approbation'}
                                </span>
                              </div>
                              <p className="text-[10.5px] font-mono text-slate-500 uppercase tracking-tight mt-0.5">{r.role} {r.company ? `@ ${r.company}` : ''}</p>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {!r.approved && (
                                <button
                                  onClick={() => onApproveRecommendation(r.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 font-bold text-white px-3.5 py-1.5 rounded-xl text-[10px] font-mono uppercase tracking-widest cursor-pointer shadow-sm transition-all"
                                >
                                  Approve Live
                                </button>
                              )}
                              <button
                                onClick={() => onDeleteRecommendation(r.id)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-1.5 rounded-xl border border-rose-200 cursor-pointer"
                                title="Delete coordinate recommendation"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-slate-650 text-slate-705 italic leading-relaxed font-sans pr-10">"{r.message}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ====================================================
                TAB 9: INBOX RECEIVED TELEMETRY MESSAGES
                ==================================================== */}
            {activeTab === 'messages' && (
              <div className="space-y-6 animate-fade-in text-left">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 animate-slide-up">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-serif font-black text-[#0f172a] uppercase">Inbox telemetry visitor message logs</h3>
                      <p className="text-[10px] text-slate-400 font-mono">Review or prune messages transmitted via user contact portals. Kept entirely server-side</p>
                    </div>
                    <button
                      onClick={handleRefreshMessages}
                      disabled={isRefreshingMessages}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[10px] font-mono font-bold text-slate-700 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingMessages ? 'animate-spin' : ''}`} />
                      <span>{isRefreshingMessages ? 'REFRESHING...' : 'REFRESH'}</span>
                    </button>
                  </div>

                  {messages.length === 0 ? (
                    <div className="py-20 text-center space-y-2 border-2 border-dashed border-slate-200 rounded-2xl">
                      <Mail className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-slate-400 font-mono text-xs">Direct mail index is currently empty. No visitor submissions registered.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map(m => (
                        <div key={m.id} className="p-5 rounded-2xl border border-slate-250 bg-white shadow-2xs hover:shadow-sm text-left space-y-4">
                          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-serif font-black text-slate-950 text-sm">{m.name}</h4>
                                <a href={`mailto:${m.email}`} className="text-[10px] font-mono text-blue-600 hover:underline">{m.email}</a>
                              </div>
                              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-1">Subject: <strong className="text-slate-800 font-extrabold">{m.subject}</strong></p>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <span className="text-[9px] font-mono text-slate-420 text-slate-400">{new Date(m.createdAt).toLocaleString()}</span>
                              <button 
                                onClick={() => handleDeleteMessage(m.id)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-1.5 rounded-xl border border-rose-250 cursor-pointer"
                                title="Delete message file"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="bg-slate-50/55 p-4 rounded-xl border border-slate-100 text-slate-700 text-xs leading-relaxed font-sans whitespace-pre-wrap">
                            {m.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ====================================================
                TAB 10: IDENTITY VERIFICATION GATEKEEPER QUESTIONS
                ==================================================== */}
            {activeTab === 'security' && (
              <div className="space-y-6 animate-fade-in text-left pb-12">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 animate-slide-up h-full overflow-y-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-base font-serif font-black text-[#0f172a] uppercase flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-amber-500 animate-pulse" />
                        <span>Identity verification gatekeeper inquiries ({securityQuestions ? securityQuestions.length : 0})</span>
                      </h3>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">
                        Configure the security challenge pool. Under BO Access, three random questions are shown. Correct answers grant entry.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        requestConfirm(
                          "Restore Default Security Questions",
                          "Are you sure you want to reset all 20 questions back to their default values and answers?",
                          () => {
                            const DEFAULT_SECURITY_QUESTIONS = [
                              { id: "sq-1", question: "What is your Date of Birth? (Format: DD/MM/YYYY)", answer: "15/08/2002" },
                              { id: "sq-2", question: "What is your Place of Birth?", answer: "Dhaka" },
                              { id: "sq-3", question: "On which date did you arrive in Malaysia? (Format: DD/MM/YYYY)", answer: "10/10/2023" },
                              { id: "sq-4", question: "What is the name of your first school?", answer: "Primary" },
                              { id: "sq-5", question: "What is your mother's maiden name?", answer: "Begum" },
                              { id: "sq-6", question: "What was your childhood nickname?", answer: "Rejvi" },
                              { id: "sq-7", question: "What is your favorite programming language?", answer: "TypeScript" },
                              { id: "sq-8", question: "Which city did you grow up in?", answer: "Dhaka" },
                              { id: "sq-9", question: "What is your favorite food?", answer: "Biryani" },
                              { id: "sq-10", question: "What is the name of your target Master's university?", answer: "APU" },
                              { id: "sq-11", question: "What is your father's middle name?", answer: "Rahaman" },
                              { id: "sq-12", question: "What was the name of your first pet?", answer: "Tommy" },
                              { id: "sq-13", question: "Who is your favorite historical scientist?", answer: "Einstein" },
                              { id: "sq-14", question: "What was your childhood dream job?", answer: "Software Engineer" },
                              { id: "sq-15", question: "What is your favorite book of all time?", answer: "Harry Potter" },
                              { id: "sq-16", question: "In which year did you graduate high school?", answer: "2020" },
                              { id: "sq-17", question: "What is your blood group (with sign)?", answer: "O+" },
                              { id: "sq-18", question: "What is your favorite outdoor sport?", answer: "Cricket" },
                              { id: "sq-19", question: "What is your favorite hobby to do in free time?", answer: "Coding" },
                              { id: "sq-20", question: "What is the name of your favorite tech company?", answer: "Google" }
                            ];
                            setSecurityQuestions(DEFAULT_SECURITY_QUESTIONS);
                            setHasUnsavedChanges(true);
                          }
                        );
                      }}
                      className="bg-slate-800 hover:bg-slate-900 border border-slate-750 hover:border-slate-800 text-white font-mono uppercase tracking-widest text-[9px] px-3.5 py-2 rounded-xl transition-all font-bold flex items-center gap-1.5 focus:outline-none cursor-pointer self-start"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Reset all to default</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                    {securityQuestions && securityQuestions.map((q, idx) => (
                      <div 
                        key={q.id} 
                        className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50/20 text-left space-y-3.5 transition-all"
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                          <span className="text-[10px] font-mono uppercase tracking-wide font-black text-slate-500 flex items-center gap-1">
                            <span className="w-5 h-5 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[9px]">
                              {idx + 1}
                            </span>
                            Question Block ID: #{q.id.toUpperCase()}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                            Challenge Query English Text
                          </label>
                          <input 
                            type="text"
                            required
                            value={q.question}
                            onChange={e => {
                              const updated = [...securityQuestions];
                              updated[idx] = { ...updated[idx], question: e.target.value };
                              setSecurityQuestions(updated);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-sans"
                            placeholder="Enter the questions text"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                            Expected Correct Answer
                          </label>
                          <input 
                            type="text"
                            required
                            value={q.answer}
                            onChange={e => {
                              const updated = [...securityQuestions];
                              updated[idx] = { ...updated[idx], answer: e.target.value };
                              setSecurityQuestions(updated);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-mono"
                            placeholder="Provide the case-insensitive answer"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4" id="custom-confirmation-dialog-overlay">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-left animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-serif font-black tracking-tight text-white uppercase flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 animate-pulse" />
              <span>{confirmDialog.title}</span>
            </h3>
            <p className="mt-3 text-xs text-slate-300 font-sans leading-relaxed">
              {confirmDialog.message}
            </p>
            <div className="mt-6 flex items-center justify-end gap-3.5">
              <button
                type="button"
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-755 hover:bg-slate-700 text-slate-300 font-bold text-[11px] rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-xl transition-all shadow-md shadow-rose-950/40 cursor-pointer"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
