import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles, Award, MapPin, Calendar, Heart, ShieldAlert,
  Send, Lock, Globe, ExternalLink, Menu, X, ArrowUpRight, Download,
  Eye, Check, LockOpen, ArrowRight, ArrowLeft, SendHorizontal, MailCheck,
  ThumbsDown, MessageCircle, User, Mail, BookOpen, Layers, Briefcase, ThumbsUp,
  ChevronDown, ChevronUp, MessageSquare, GraduationCap, Printer, FileText, Phone, RefreshCcw,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { ArchivePhoto, JourneyMilestone, Recommendation, FollowerStats, ProjectItem, BlogPost, GalleryItem, SocialLink, ProfileDetails, ContactMessage, SecurityQuestion, Comment } from "./types";
import { 
  INITIAL_PHOTOS, 
  INITIAL_MILESTONES, 
  INITIAL_PROJECTS, 
  INITIAL_RECOMMENDATIONS, 
  INITIAL_STATS 
} from "./data/initialData";
import Lightbox from "./components/Lightbox";
import AdminPanel from "./components/AdminPanel";

interface ItemImageCarouselProps {
  images?: string[];
  fallbackUrl: string;
  altText: string;
  className?: string;
  imageClassName?: string;
}

function ItemImageCarousel({ images, fallbackUrl, altText, className = "w-full h-full relative bg-slate-950", imageClassName = "" }: ItemImageCarouselProps) {
  const list = (images && images.length > 0 ? images : [fallbackUrl]).filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);

  const renderSlideImage = (src: string, indexStr: string) => {
    // Strip layout-distorting classes like object-cover, w-full, h-full to keep it beautifully self-adjusted
    const cleanedClassName = imageClassName
      .replace(/\b(w-full|h-full|object-cover)\b/g, '')
      .trim();

    return (
      <div 
        onClick={() => setShowFullscreen(true)}
        className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden cursor-zoom-in"
      >
        {/* Background layer: heavily blurred and semi-opaque for ambient backing */}
        <img 
          src={src} 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover blur-md opacity-35 scale-110 select-none pointer-events-none"
          referrerPolicy="no-referrer"
        />
        {/* Foreground layer: sharp, non-cropped fully contained image */}
        <img 
          src={src} 
          alt={`${altText} ${indexStr}`} 
          className={`relative z-10 max-w-[96%] max-h-[96%] object-contain select-none transition-transform duration-350 hover:scale-[1.01] ${cleanedClassName}`}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  };

  if (list.length === 0) {
    return null;
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveIndex((prev) => (prev === 0 ? list.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveIndex((prev) => (prev === list.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={className}>
      {renderSlideImage(list[activeIndex], list.length > 1 ? `- slide ${activeIndex + 1}` : "")}
      
      {/* Navigation arrows */}
      {list.length > 1 && (
        <>
          <button 
            onClick={handlePrev}
            type="button"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/85 text-white p-1 rounded-full border border-white/10 transition-colors focus:outline-none z-20 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={handleNext}
            type="button"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/85 text-white p-1 rounded-full border border-white/10 transition-colors focus:outline-none z-20 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Indicator Dots */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1 z-20 bg-black/35 px-2 py-0.5 rounded-full items-center">
            {list.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setActiveIndex(idx);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === activeIndex ? 'bg-white scale-110' : 'bg-white/45 hover:bg-white/70'}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Modern, non-cropped Full size view Lightbox modal */}
      {showFullscreen && (
        <div 
          className="fixed inset-0 bg-slate-950/98 backdrop-blur-md z-[9999] flex flex-col items-center justify-center p-4 sm:p-6 animate-fadeIn"
          onClick={() => setShowFullscreen(false)}
        >
          {/* Controls bar */}
          <div className="absolute top-4 right-4 flex items-center gap-4 z-[10000]">
            <span className="text-white/60 font-mono text-xs bg-black/50 px-3 py-1.5 rounded-full border border-white/10 select-none">
              {activeIndex + 1} / {list.length}
            </span>
            <button 
              onClick={() => setShowFullscreen(false)}
              className="text-white hover:text-rose-400 bg-white/10 hover:bg-white/20 p-2 text-slate-200 rounded-full cursor-pointer transition-all border border-white/10 shadow-lg"
              title="Close Full View"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Full Screen Image */}
          <div 
            className="relative max-w-full max-h-[85vh] flex items-center justify-center" 
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={list[activeIndex]} 
              alt={`${altText} snap`}
              className="max-w-[95vw] max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/5 animate-scaleUp"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Navigation Controls in Lightbox */}
          {list.length > 1 && (
            <div 
              className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-[10000]" 
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={handlePrev}
                className="bg-black/60 hover:bg-black/85 text-white p-2.5 rounded-full hover:scale-105 active:scale-95 transition-all border border-white/10 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-white/80 font-mono text-xs select-none bg-black/40 px-3 py-1 rounded-md">
                Slideshow Mode
              </span>
              <button 
                onClick={handleNext}
                className="bg-black/60 hover:bg-black/85 text-white p-2.5 rounded-full hover:scale-105 active:scale-95 transition-all border border-white/10 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const DEFAULT_SECURITY_QUESTIONS: SecurityQuestion[] = [
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

// Facebook Comment Layout helper functions
const getFacebookAvatarColor = (name: string): string => {
  const colors = [
    "bg-rose-500 text-white",
    "bg-blue-500 text-white",
    "bg-emerald-500 text-white",
    "bg-amber-500 text-white",
    "bg-violet-500 text-white",
    "bg-fuchsia-500 text-white",
    "bg-pink-500 text-white",
    "bg-slate-600 text-white",
    "bg-orange-500 text-white",
    "bg-red-500 text-white",
    "bg-indigo-500 text-white",
    "bg-teal-500 text-white",
  ];
  if (!name) return "bg-blue-600 text-white";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const formatFacebookDate = (createdAtStr?: string): string => {
  if (!createdAtStr) return 'Just now';
  try {
    const dateVal = isNaN(Number(createdAtStr)) ? new Date(createdAtStr) : new Date(createdAtStr);
    if (isNaN(dateVal.getTime())) return 'Just now';
    
    const diffMs = Date.now() - dateVal.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return dateVal.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'Just now';
  }
};

const getBlogInputVal = (blogId: string, blogCommentInputs: Record<string, { name: string, email: string, message: string }>) => {
  const current = blogCommentInputs[blogId];
  return {
    name: current?.name !== undefined ? current.name : (localStorage.getItem("fb_commenter_name") || ""),
    email: current?.email !== undefined ? current.email : (localStorage.getItem("fb_commenter_email") || ""),
    message: current?.message || ""
  };
};

const getGalleryInputVal = (itemId: string, galleryCommentInputs: Record<string, { name: string, email: string, message: string }>) => {
  const current = galleryCommentInputs[itemId];
  return {
    name: current?.name !== undefined ? current.name : (localStorage.getItem("fb_commenter_name") || ""),
    email: current?.email !== undefined ? current.email : (localStorage.getItem("fb_commenter_email") || ""),
    message: current?.message || ""
  };
};

interface RecursiveCommentNodeProps {
  key?: string | number;
  comment: Comment;
  postId: string;
  onReplySubmit: (parentId: string, name: string, email: string, message: string) => Promise<void>;
  replyingToId: string | null;
  setReplyingToId: React.Dispatch<React.SetStateAction<string | null>>;
  level?: number;
}

function RecursiveCommentNode({
  comment,
  postId,
  onReplySubmit,
  replyingToId,
  setReplyingToId,
  level = 0
}: RecursiveCommentNodeProps) {
  const [replyName, setReplyName] = useState(() => localStorage.getItem("fb_commenter_name") || "");
  const [replyEmail, setReplyEmail] = useState(() => localStorage.getItem("fb_commenter_email") || "");
  const [replyMessage, setReplyMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isReplying = replyingToId === comment.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyName.trim() || !replyEmail.trim() || !replyMessage.trim()) {
      alert("Name, email and reply message are required.");
      return;
    }
    setSubmitting(true);
    try {
      await onReplySubmit(comment.id, replyName.trim(), replyEmail.trim(), replyMessage.trim());
      localStorage.setItem("fb_commenter_name", replyName.trim());
      localStorage.setItem("fb_commenter_email", replyEmail.trim());
      setReplyMessage("");
      setReplyingToId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to submit reply. Keep server live.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${level > 0 ? 'ml-3 sm:ml-5 pl-3 border-l border-slate-200/60 dark:border-slate-800' : ''}`}>
      <div className="flex gap-2.5 items-start text-left font-sans text-xs">
        {/* User Avatar Circle */}
        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-200/50 ${getFacebookAvatarColor(comment.name)} font-bold flex items-center justify-center shrink-0 uppercase select-none text-xs`}>
          {comment.name ? comment.name.charAt(0) : 'U'}
        </div>
        {/* Bubble content */}
        <div className="flex-1 min-w-0">
          <div className="bg-slate-150/60 dark:bg-slate-800 rounded-2xl px-3.5 py-2 inline-block max-w-full">
            <span className="font-semibold text-slate-900 dark:text-slate-100 hover:underline cursor-pointer text-xs block leading-tight">
              {comment.name}
            </span>
            <p className="text-slate-800 dark:text-slate-200 text-xs mt-1 leading-relaxed whitespace-pre-wrap select-text break-words">
              {comment.message}
            </p>
          </div>
          {/* Action line */}
          <div className="flex items-center gap-2 mt-1 ml-2 text-[10px] text-slate-500 font-semibold select-none">
            <button 
              type="button" 
              onClick={() => {
                if (isReplying) {
                  setReplyingToId(null);
                } else {
                  setReplyingToId(comment.id);
                }
              }}
              className={`hover:underline cursor-pointer ${isReplying ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-blue-600'}`}
            >
              Reply
            </button>
            <span className="text-slate-300 font-normal">·</span>
            <span className="text-slate-400 font-normal">
              {formatFacebookDate(comment.createdAt)}
            </span>
          </div>

          {/* Inline Reply Box in thread bubble hierarchy */}
          {isReplying && (
            <form onSubmit={handleSubmit} className="mt-3 p-3 bg-slate-100/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-2.5 animate-fadeIn">
              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                Replying to {comment.name}
              </span>
              <div className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="text"
                  required
                  placeholder="Your Name"
                  value={replyName}
                  onChange={e => setReplyName(e.target.value)}
                  className="flex-1 px-3 py-1 bg-white dark:bg-slate-800 border dark:border-slate-700 text-[11px] rounded-full text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-slate-300"
                />
                <input 
                  type="email"
                  required
                  placeholder="Your Email"
                  value={replyEmail}
                  onChange={e => setReplyEmail(e.target.value)}
                  className="flex-1 px-3 py-1 bg-white dark:bg-slate-800 border dark:border-slate-700 text-[11px] rounded-full text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-slate-300"
                />
              </div>

              <div className="flex gap-2 items-center">
                <textarea
                  rows={1}
                  required
                  placeholder="Write a reply..."
                  value={replyMessage}
                  onChange={e => setReplyMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e as any);
                    }
                  }}
                  className="flex-1 bg-white dark:bg-slate-800 border dark:border-slate-700 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none resize-none leading-normal min-h-[30px]"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-slate-200/50 dark:hover:bg-slate-750 rounded-full cursor-pointer shrink-0 disabled:opacity-50"
                  title="Post Reply"
                >
                  <Send className="w-3.5 h-3.5 fill-blue-100 text-blue-600" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Render sub-replies recursively (Unlimited level replies support) */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="flex flex-col gap-3 mt-1 pl-1">
          {comment.replies.map((subReply) => (
            <RecursiveCommentNode
              key={subReply.id}
              comment={subReply}
              postId={postId}
              onReplySubmit={onReplySubmit}
              replyingToId={replyingToId}
              setReplyingToId={setReplyingToId}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

let hasRegisteredVisitThisBundleLoad = false;

export default function App() {
  const isBOMode = typeof window !== "undefined" && (
    window.location.pathname === "/bo" || 
    window.location.pathname === "/admin" || 
    window.location.hash === "#/bo" || 
    window.location.hash === "#/admin"
  );

  // UI States
  const [currentView, setCurrentView] = useState<'about' | 'chronology' | 'projects' | 'gallery' | 'blogs' | 'contact'>('about');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [galleryFilter, setGalleryFilter] = useState<'all' | 'travel' | 'photoshop'>('all');
  const [projectCategoryFilter, setProjectCategoryFilter] = useState<'all' | 'programming' | 'business'>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  
  // Security Verification States
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Security Gatekeeper States (3-Gear mechanical combination lock)
  const [securityQuestions, setSecurityQuestions] = useState<SecurityQuestion[]>([]);
  const [isGatekeeperOpen, setIsGatekeeperOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      const hash = window.location.hash;
      return path === "/bo" || path === "/admin" || hash === "#/bo" || hash === "#/admin";
    }
    return false;
  });
  const [gearValues, setGearValues] = useState<[number, number, number]>([0, 0, 0]);
  const [gearUnlockSuccess, setGearUnlockSuccess] = useState(false);
  const [consecutiveAttempts, setConsecutiveAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState<number>(0);
  const [gatekeeperError, setGatekeeperError] = useState<string | null>(null);
  
  // Dynamic Secure CAPTCHA States
  const [captchaText, setCaptchaText] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Expanded blog/gallery dynamic interaction states
  const [expandedBlogs, setExpandedBlogs] = useState<Record<string, boolean>>({});
  const [expandedBlogComments, setExpandedBlogComments] = useState<Record<string, boolean>>({});
  const [expandedGalleryComments, setExpandedGalleryComments] = useState<Record<string, boolean>>({});
  
  // Testimonial submission inputs
  const [newTestimony, setNewTestimony] = useState({ name: "", role: "", company: "", message: "" });

  const t = (text: string): string => text;

  // Database States loaded from server, falling back to static seeds if needed
  const [photos, setPhotos] = useState<ArchivePhoto[]>(() => {
    const saved = localStorage.getItem("rejvi_photos");
    return saved ? JSON.parse(saved) : INITIAL_PHOTOS;
  });

  const [milestones, setMilestones] = useState<JourneyMilestone[]>(() => {
    const saved = localStorage.getItem("rejvi_milestones");
    return saved ? JSON.parse(saved) : INITIAL_MILESTONES;
  });

  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>(() => INITIAL_PROJECTS);

  const [recommendations, setRecommendations] = useState<Recommendation[]>(INITIAL_RECOMMENDATIONS);
  const [stats, setStats] = useState<FollowerStats>(INITIAL_STATS);
  const [visitorBase, setVisitorBase] = useState<number>(0);
  const [liveCounter, setLiveCounter] = useState(0);

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  
  const [userVotes, setUserVotes] = useState<Record<string, 'like' | 'dislike' | null>>(() => {
    try {
      const saved = localStorage.getItem("rejvi_user_votes");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem("rejvi_user_votes", JSON.stringify(userVotes));
  }, [userVotes]);
  const [profileDetails, setProfileDetails] = useState<ProfileDetails>({
    name: "",
    tagline: "",
    email: "",
    altEmail: "",
    phone: "",
    whatsapp: "",
    aboutText: "",
    universityName: "",
    universityLink: "",
    highSchoolName: "",
    highSchoolLink: "",
    collegeName: "",
    collegeLink: "",
    targetMasterUni: "",
    targetMasterLink: "",
    coverUrl: "",
    profilePictureUrl: "",
    customInstitutions: [],
    cvDownloadUrl: "",
    blogSectionTagline: "",
    blogSectionTitle: "",
    blogSectionDescription: ""
  });


  // Sync to local storage for photos (visual map)
  useEffect(() => {
    localStorage.setItem("rejvi_photos", JSON.stringify(photos));
  }, [photos]);

  // Shared state applying helper
  const applyDataToStates = (siteData: any) => {
    if (siteData) {
      if (siteData.visitorCount !== undefined) {
        setVisitorBase(siteData.visitorCount);
        setLiveCounter(siteData.visitorCount);
      }
      if (siteData.recommendations) {
        setRecommendations(siteData.recommendations);
      }
      if (siteData.stats) {
        setStats(siteData.stats);
      }
      if (siteData.blogs) {
        setBlogs(siteData.blogs);
      }
      if (siteData.gallery) {
        setGalleryItems(siteData.gallery);
      }
      if (siteData.projects) {
        setProjects(siteData.projects);
      }
      if (siteData.milestones) {
        setMilestones(siteData.milestones);
      }
      if (siteData.photos) {
        setPhotos(siteData.photos);
      }
      if (siteData.socialLinks) {
        setSocialLinks(siteData.socialLinks);
      }
      if (siteData.profileDetails) {
        setProfileDetails(siteData.profileDetails);
      }
      if (siteData.messages) {
        setMessages(siteData.messages);
      }
      if (siteData.securityQuestions) {
        setSecurityQuestions(siteData.securityQuestions);
      }
    }
  };

  // Shared site data fetcher
  const fetchData = () => {
    fetch("/api/site-data")
      .then(res => res.json())
      .then(siteData => {
        if (siteData) {
          try {
            localStorage.setItem("rejvi_cache_sitedata_en", JSON.stringify(siteData));
          } catch (e) {
            console.warn("Storage limits surpassed, continuing without saving local cache", e);
          }
          applyDataToStates(siteData);
        }
      })
      .catch(err => {
        console.error("Failed to fetch site data:", err);
      });
  };

  // Visitor and core database details dynamic loading on page mount
  useEffect(() => {
    // Check offline Cache for immediate state hydration
    const cachedSiteData = localStorage.getItem("rejvi_cache_sitedata_en");

    if (cachedSiteData) {
      try {
        const parsedSite = JSON.parse(cachedSiteData);
        applyDataToStates(parsedSite);
      } catch (e) {
        console.error("Local schema cache parsing failed, fetching from backend...", e);
      }
    }

    // First initial fetch
    fetchData();
  }, []);

  // Establish persistent SSE real-time sync stream ONLY for administrators
  // Regular public visitors read cached and loaded data statically, saving 99.9% Render bandwidth and Firestore daily write quotas!
  useEffect(() => {
    const isURLAdmin = window.location.pathname === "/admin" || 
                       window.location.hash === "#/admin" || 
                       window.location.pathname === "/bo" || 
                       window.location.hash === "#/bo";

    if (!isAdminOpen && !isURLAdmin) {
      return; // Skip connecting for standard public users
    }

    console.log("[SSE] Connecting persistent administrative live-sync updates channel...");
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource("/api/realtime-updates");
      eventSource.onmessage = (event) => {
        if (event.data === "update") {
          console.log("[SSE Real-Time Sync] Backend database change detected. Re-fetching site details automatically...");
          fetchData();
        }
      };
    } catch (e) {
      console.error("Failed to connect to backend voice/realtime channels:", e);
    }

    return () => {
      if (eventSource) {
        console.log("[SSE] Disconnecting admin real-time sync stream.");
        eventSource.close();
      }
    };
  }, [isAdminOpen]);

  // Dynamically update document tab title based on profile
  useEffect(() => {
    const baseName = profileDetails.name ? profileDetails.name : "samiurrahaman rejvi";
    const baseTagline = profileDetails.tagline ? profileDetails.tagline : "Academic Curricular Portfolio & Creative Art Repository";
    
    // Capitalize name helper for cleaner display
    const formatName = (str: string) => {
      if (!str) return "";
      return str.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    };

    document.title = `${formatName(baseName)} | ${baseTagline}`;
  }, [profileDetails.name, profileDetails.tagline]);

  // Track visitor counts and register real-world page loads on mount
  useEffect(() => {
    const registerVisit = async () => {
      if (hasRegisteredVisitThisBundleLoad) {
        return; // Guard against StrictMode double-render on the same load
      }
      hasRegisteredVisitThisBundleLoad = true;

      fetch("/api/click-visit", {
        method: "POST"
      })
        .then(res => res.json())
        .then(data => {
          if (data.visitorCount !== undefined) {
            setVisitorBase(data.visitorCount);
            setLiveCounter(data.visitorCount);
          }
        })
        .catch(err => console.error("Failed to register page visit", err));
    };

    registerVisit();
  }, []);

  const [testimonySubmitted, setTestimonySubmitted] = useState(false);
  
  // Input comment forms
  const [blogCommentInputs, setBlogCommentInputs] = useState<Record<string, { name: string, email: string, message: string }>>({});
  const [galleryCommentInputs, setGalleryCommentInputs] = useState<Record<string, { name: string, email: string, message: string }>>({});

  // Email Newsletter sign state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Custom interactive Biography & CV Tab State
  const [activeBioTab, setActiveBioTab] = useState<'story' | 'cv'>('story');
  const [cvFilter, setCvFilter] = useState<'all' | 'education' | 'experience' | 'skills' | 'info'>('all');
  const [narrativeChapter, setNarrativeChapter] = useState<'all' | 'chapter1' | 'chapter2' | 'chapter3'>('all');

  // Contact Form Submission Action States
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactError, setContactError] = useState("");

  // Hero Slider Autoplay Ref
  const sliderIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const heroSlides = projects.length > 0 
    ? projects.map((p) => ({
        label: p.category === 'programming' ? "PROGRAMMING PROJECT SPOTLIGHT" : "CREATIVE WORK SPOTLIGHT",
        title: p.title,
        italic: p.techStack && p.techStack.length > 0 ? p.techStack.join(" • ") : "Custom Project Space",
        desc: p.description,
        projectLink: p.link || p.githubUrl || "#projects",
        buttonText: p.link ? "Launch Production App" : "View Code Repository",
        bgImage: p.imageUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80"
      }))
    : [
        {
          label: "PORTFOLIO SPOTLIGHT",
          title: profileDetails.name ? `Welcome to ${profileDetails.name}'s Space` : "Welcome to My Space",
          italic: "Curated achievements, narrative story, portfolio dashboard, insights journal",
          desc: profileDetails.tagline || "Open the Admin Panel to customize this message, upload cover/avatar artwork, and add active projects or articles dynamically.",
          projectLink: "#about",
          buttonText: "Browse Portfolio Sections",
          bgImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80"
        }
      ];

  // Slider Autoplay functions
  const startAutoplay = () => {
    stopAutoplay();
    sliderIntervalRef.current = setInterval(() => {
      setSliderIndex(prev => (prev + 1) % heroSlides.length);
    }, 5000);
  };

  const stopAutoplay = () => {
    if (sliderIntervalRef.current) {
      clearInterval(sliderIntervalRef.current);
    }
  };

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, []);

  const handleSliderManual = (index: number) => {
    stopAutoplay();
    setSliderIndex(index);
    startAutoplay();
  };

  // Gallery calculations
  const filteredPhotos = photos.filter(p => {
    if (galleryFilter === 'all') return true;
    return p.category === galleryFilter;
  });

  const handleOpenLightbox = (photoId: string) => {
    const globalIdx = photos.findIndex(p => p.id === photoId);
    if (globalIdx !== -1) setLightboxIndex(globalIdx);
  };

  const handleNextLightbox = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % photos.length);
    }
  };

  const handlePrevLightbox = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length);
    }
  };

  // Dynamic secure CAPTCHA generation helper
  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(code);
    setCaptchaInput("");
  };

  useEffect(() => {
    if (isLoginModalOpen) {
      generateCaptcha();
    }
  }, [isLoginModalOpen]);

  // Security Gatekeeper Lockout Timer Effect
  useEffect(() => {
    if (lockoutTimer <= 0) return;
    const interval = setInterval(() => {
      setLockoutTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  // Pointer tracking refs for smooth physical drag swipe controls
  const dragStartY = useRef<number | null>(null);
  const dragGearIndex = useRef<number | null>(null);

  // Launch pre-verification 3-Gear Combination Lock
  const handleOpenGatekeeperChallenge = () => {
    setGearValues([0, 0, 0]);
    setGearUnlockSuccess(false);
    setConsecutiveAttempts(0);
    setLockoutTimer(0);
    setGatekeeperError(null);
    setIsGatekeeperOpen(true);
  };

  const rotateGear = (gearIndex: number, direction: 'up' | 'down') => {
    if (lockoutTimer > 0 || gearUnlockSuccess) return;
    setGearValues(prev => {
      const next = [...prev] as [number, number, number];
      if (direction === 'up') {
        next[gearIndex] = (next[gearIndex] + 1) % 100;
      } else {
        next[gearIndex] = (next[gearIndex] + 99) % 100;
      }
      return next;
    });
    setGatekeeperError(null);
  };

  const handleGearWheel = (e: React.WheelEvent, gearIndex: number) => {
    e.preventDefault();
    if (lockoutTimer > 0 || gearUnlockSuccess) return;
    if (e.deltaY < 0) {
      rotateGear(gearIndex, 'up');
    } else if (e.deltaY > 0) {
      rotateGear(gearIndex, 'down');
    }
  };

  const handleGearPointerDown = (e: React.PointerEvent, index: number) => {
    if (lockoutTimer > 0 || gearUnlockSuccess) return;
    dragStartY.current = e.clientY;
    dragGearIndex.current = index;
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch (err) {}
  };

  const handleGearPointerMove = (e: React.PointerEvent) => {
    if (dragStartY.current === null || dragGearIndex.current === null) return;
    const deltaY = e.clientY - dragStartY.current;
    if (Math.abs(deltaY) > 25) { // pixels drag threshold
      const direction = deltaY > 0 ? 'down' : 'up';
      rotateGear(dragGearIndex.current, direction);
      dragStartY.current = e.clientY;
    }
  };

  const handleGearPointerUp = (e: React.PointerEvent) => {
    dragStartY.current = null;
    dragGearIndex.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (err) {}
  };

  const handleVerifyCombination = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (lockoutTimer > 0 || gearUnlockSuccess) return;
    setGatekeeperError(null);

    try {
      const response = await fetch("/api/admin/verify-combination", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ combination: gearValues })
      });

      if (response.ok) {
        setGearUnlockSuccess(true);
        setConsecutiveAttempts(0);
        setTimeout(() => {
          setIsGatekeeperOpen(false);
          setIsLoginModalOpen(true); // reveals standard login
          setGearUnlockSuccess(false);
        }, 1200);
      } else {
        const errData = await response.json();
        const nextAttempts = consecutiveAttempts + 1;
        setConsecutiveAttempts(nextAttempts);
        
        if (nextAttempts >= 3) {
          setLockoutTimer(2);
          setGatekeeperError("Security lockdown active: Cyber-vault security system has auto-frozen due to multiple alignment failures. Try again in 2s.");
        } else {
          setGatekeeperError(errData.error || "Lock system reject: Mechanical combination aligned incorrectly.");
        }
      }
    } catch (err) {
      // Fallback verification using Client-side Cryptographic Subtle SHA-256
      const combinationStr = gearValues.join("");
      const msgBuffer = new TextEncoder().encode(combinationStr);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      const targetHash = "9ea8a37aaadadd2e04edf3161db85add4f075e3459acba9b0fe2320c5215b101"; // Default SHA-256 for "777358"
      
      if (hashHex === targetHash) {
        setGearUnlockSuccess(true);
        setConsecutiveAttempts(0);
        setTimeout(() => {
          setIsGatekeeperOpen(false);
          setIsLoginModalOpen(true);
          setGearUnlockSuccess(false);
        }, 1200);
      } else {
        const nextAttempts = consecutiveAttempts + 1;
        setConsecutiveAttempts(nextAttempts);
        if (nextAttempts >= 3) {
          setLockoutTimer(2);
          setGatekeeperError("Security lockdown active: Cyber-vault security system has auto-frozen due to multiple alignment failures. Try again in 2s.");
        } else {
          setGatekeeperError("Lock system reject: Mechanical combination aligned incorrectly.");
        }
      }
    }
  };

  // Handling Admin Login
  const handleAdminVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    
    // Verify CAPTCHA first
    if (captchaInput.trim().toUpperCase() !== captchaText) {
      setLoginError("Verification failed: The security CAPTCHA verification code is incorrect.");
      generateCaptcha(); // force regeneration for immediate safety
      return;
    }

    if (loginForm.username === "Rejvi2023" && loginForm.password === "@SRRejvi77735803") {
      setIsLoginModalOpen(false);
      setIsAdminOpen(true);
      setLoginForm({ username: "", password: "" });
      setCaptchaInput("");
    } else {
      setLoginError("Verification failed: Invalid administrative staff user ID or security password.");
      generateCaptcha(); // force regeneration for immediate safety
    }
  };

  // Handling recommendation submission
  const handleSubmitTestimony = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestimony.name || !newTestimony.message || !newTestimony.role) {
      alert("Fields marked as mandatory are required.");
      return;
    }

    const recPayload = {
      name: newTestimony.name,
      role: newTestimony.role,
      company: newTestimony.company || "Academic Partner",
      message: newTestimony.message
    };

    fetch("/api/recommendations/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(recPayload)
    })
      .then(res => {
        if (!res.ok) throw new Error("Could not submit review");
        return res.json();
      })
      .then(newRec => {
        setRecommendations(prev => [...prev, newRec]);
        setTestimonySubmitted(true);
        setNewTestimony({ name: "", role: "", company: "", message: "" });
        setTimeout(() => setTestimonySubmitted(false), 6000);
      })
      .catch(err => {
        console.error("Testimony submission failed:", err);
        alert("Failed to submit feedback. Please try again.");
      });
  };

  // Handling Contact Form Submissions
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      setContactError("Please fill out all mandatory fields.");
      return;
    }
    setContactSubmitting(true);
    setContactError("");

    fetch("/api/contact/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contactForm)
    })
      .then(res => {
        if (!res.ok) throw new Error("Could not dispatch contact payload.");
        return res.json();
      })
      .then(() => {
        setContactSubmitted(true);
        setContactForm({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setContactSubmitted(false), 8000);
      })
      .catch(err => {
        console.error("Transmit submit error:", err);
        setContactError("Unable to submit message. Please try again.");
      })
      .finally(() => {
        setContactSubmitting(false);
      });
  };

  // Subscriber submission
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      fetch("/api/subscribe", { method: "POST" })
        .then(res => {
          if (!res.ok) throw new Error("Could not subscribe");
          return res.json();
        })
        .then(data => {
          if (data.subscribers) {
            setStats(prev => ({ ...prev, subscribers: data.subscribers }));
          }
          setNewsletterSubscribed(true);
          setNewsletterEmail("");
          setTimeout(() => setNewsletterSubscribed(false), 5000);
        })
        .catch(err => {
          console.error("Subscriber submission failed:", err);
          // Fallback gracefully on styling
          setNewsletterSubscribed(true);
          setNewsletterEmail("");
          setTimeout(() => setNewsletterSubscribed(false), 5000);
        });
    }
  };

  // Blog / Gallery interaction handlers
  const handleBlogVote = async (id: string, type: 'like' | 'dislike') => {
    const currentVote = userVotes[id];

    try {
      if (currentVote === type) {
        // Undo previous vote (decrement)
        const res = await fetch(`/api/blogs/${type}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, decrement: true })
        });
        if (!res.ok) throw new Error("Undo vote failed");
        const updated = await res.json();
        setBlogs(updated);
        setUserVotes(prev => ({ ...prev, [id]: null }));
      } else if (currentVote && currentVote !== type) {
        // Toggle vote (decrement old, increment new)
        // 1. Decrement old vote
        const resOld = await fetch(`/api/blogs/${currentVote}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, decrement: true })
        });
        if (!resOld.ok) throw new Error("Undo previous vote failed");
        
        // 2. Increment new vote
        const resNew = await fetch(`/api/blogs/${type}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, decrement: false })
        });
        if (!resNew.ok) throw new Error("New vote failed");
        const updated = await resNew.json();
        setBlogs(updated);
        setUserVotes(prev => ({ ...prev, [id]: type }));
      } else {
        // New vote (increment)
        const res = await fetch(`/api/blogs/${type}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, decrement: false })
        });
        if (!res.ok) throw new Error("Vote failed");
        const updated = await res.json();
        setBlogs(updated);
        setUserVotes(prev => ({ ...prev, [id]: type }));
      }
    } catch (err) {
      console.error("Error voting on blog:", err);
    }
  };

  const handleBlogComment = (e: React.FormEvent, blogId: string) => {
    e.preventDefault();
    const input = getBlogInputVal(blogId, blogCommentInputs);
    if (!input || !input.name || !input.email || !input.message) {
      alert("Name, Email and Comment text are required.");
      return;
    }

    fetch("/api/blogs/comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: blogId,
        name: input.name,
        email: input.email,
        message: input.message
      })
    })
      .then(res => {
        if (!res.ok) throw new Error("Comment failed");
        return res.json();
      })
      .then(updatedBlogsList => {
        setBlogs(updatedBlogsList);
        // Persist commenter details on success
        localStorage.setItem("fb_commenter_name", input.name);
        localStorage.setItem("fb_commenter_email", input.email);
        // Clear message only
        setBlogCommentInputs(prev => ({
          ...prev,
          [blogId]: { name: input.name, email: input.email, message: '' }
        }));
      })
      .catch(err => {
        console.error("Error commenting on blog:", err);
        alert("Failed to submit comment. Ensure server is active.");
      });
  };

  const handleGalleryVote = async (id: string, type: 'like' | 'dislike') => {
    const currentVote = userVotes[id];

    try {
      if (currentVote === type) {
        // Undo previous vote (decrement)
        const res = await fetch(`/api/gallery/${type}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, decrement: true })
        });
        if (!res.ok) throw new Error("Undo vote failed");
        const updated = await res.json();
        setGalleryItems(updated);
        setUserVotes(prev => ({ ...prev, [id]: null }));
      } else if (currentVote && currentVote !== type) {
        // Toggle vote (decrement old, increment new)
        // 1. Decrement old vote
        const resOld = await fetch(`/api/gallery/${currentVote}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, decrement: true })
        });
        if (!resOld.ok) throw new Error("Undo previous vote failed");
        
        // 2. Increment new vote
        const resNew = await fetch(`/api/gallery/${type}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, decrement: false })
        });
        if (!resNew.ok) throw new Error("New vote failed");
        const updated = await resNew.json();
        setGalleryItems(updated);
        setUserVotes(prev => ({ ...prev, [id]: type }));
      } else {
        // New vote (increment)
        const res = await fetch(`/api/gallery/${type}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, decrement: false })
        });
        if (!res.ok) throw new Error("Vote failed");
        const updated = await res.json();
        setGalleryItems(updated);
        setUserVotes(prev => ({ ...prev, [id]: type }));
      }
    } catch (err) {
      console.error("Error voting on gallery item:", err);
    }
  };

  const handleGalleryComment = (e: React.FormEvent, itemId: string) => {
    e.preventDefault();
    const input = getGalleryInputVal(itemId, galleryCommentInputs);
    if (!input || !input.name || !input.email || !input.message) {
      alert("Name, Email and Comment text are required.");
      return;
    }

    fetch("/api/gallery/comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: itemId,
        name: input.name,
        email: input.email,
        message: input.message
      })
    })
      .then(res => {
        if (!res.ok) throw new Error("Comment failed");
        return res.json();
      })
      .then(updatedGalleryList => {
        setGalleryItems(updatedGalleryList);
        // Persist commenter details on success
        localStorage.setItem("fb_commenter_name", input.name);
        localStorage.setItem("fb_commenter_email", input.email);
        // Clear message only
        setGalleryCommentInputs(prev => ({
          ...prev,
          [itemId]: { name: input.name, email: input.email, message: '' }
        }));
      })
      .catch(err => {
        console.error("Error commenting on gallery item:", err);
        alert("Failed to submit comment. Ensure server is active.");
      });
  };

  const handleBlogReplySubmit = async (blogId: string, parentId: string, name: string, email: string, message: string) => {
    const res = await fetch("/api/blogs/comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: blogId, parentId, name, email, message })
    });
    if (!res.ok) throw new Error("Network failure");
    const updatedBlogsList = await res.json();
    setBlogs(updatedBlogsList);
  };

  const handleGalleryReplySubmit = async (itemId: string, parentId: string, name: string, email: string, message: string) => {
    const res = await fetch("/api/gallery/comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: itemId, parentId, name, email, message })
    });
    if (!res.ok) throw new Error("Network failure");
    const updatedGalleryList = await res.json();
    setGalleryItems(updatedGalleryList);
  };

  // Approval handler for admin moderation
  const handleApproveRecommendation = (id: string) => {
    fetch("/api/recommendations/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    })
      .then(res => {
        if (!res.ok) throw new Error("Approval failed");
        return res.json();
      })
      .then(updatedList => {
        setRecommendations(updatedList);
      })
      .catch(err => console.error("Error approving feedback on server:", err));
  };

  // Deletion handler for admin moderation
  const handleDeleteRecommendation = (id: string) => {
    if (window.confirm("Verify review rejection/deletion in database?")) {
      fetch("/api/recommendations/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      })
        .then(res => {
          if (!res.ok) throw new Error("Deletion failed");
          return res.json();
        })
        .then(updatedList => {
          setRecommendations(updatedList);
        })
        .catch(err => console.error("Error deleting feedback on server:", err));
    }
  };

  // Social Stats updater for admin change requests
  const handleUpdateSocialStats = (updatedStats: FollowerStats) => {
    fetch("/api/admin/update-social-stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        github: updatedStats.github,
        facebook: updatedStats.facebook,
        twitter: updatedStats.twitter
      })
    })
      .then(res => {
        if (!res.ok) throw new Error("Stats update failed");
        return res.json();
      })
      .then(savedStats => {
        setStats(prev => ({ ...prev, ...savedStats }));
      })
      .catch(err => console.error("Error updating stats on server:", err));
  };

  // Navigation switcher and smoother mapping
  const handleScrollToSegment = (id: string) => {
    const sectionToViewMap: Record<string, 'about' | 'chronology' | 'projects' | 'gallery' | 'blogs' | 'contact'> = {
      'bio': 'about',
      'hero-top': 'about',
      'journey': 'chronology',
      'projects': 'projects',
      'gallery': 'gallery',
      'archive': 'gallery',
      'blogs': 'blogs',
      'contact': 'contact',
      'newsletter': 'contact'
    };
    
    const targetView = sectionToViewMap[id];
    if (targetView) {
      setCurrentView(targetView);
    }
    setMobileMenuOpen(false);
    
    // We allow React to re-render the corresponding view page first, then scroll cleanly
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 60);
  };

  // Active Approved quotes
  const approvedTestimonials = recommendations.filter(r => r.approved);

  if (isBOMode) {
    if (isAdminOpen) {
      return (
        <AdminPanel  
          photos={photos}
          setPhotos={setPhotos}
          milestones={milestones}
          setMilestones={setMilestones}
          blogs={blogs}
          setBlogs={setBlogs}
          galleryItems={galleryItems}
          setGalleryItems={setGalleryItems}
          projects={projects}
          setProjects={setProjects}
          socialLinks={socialLinks}
          setSocialLinks={setSocialLinks}
          profileDetails={profileDetails}
          setProfileDetails={setProfileDetails}
          messages={messages}
          setMessages={setMessages}
          recommendations={recommendations}
          onApproveRecommendation={handleApproveRecommendation}
          onDeleteRecommendation={handleDeleteRecommendation}
          stats={stats}
          onUpdateSocialStats={handleUpdateSocialStats}
          visitorBase={visitorBase}
          onClose={() => {
            setIsAdminOpen(false);
            setIsLoginModalOpen(false);
            setIsGatekeeperOpen(true);
          }}
          securityQuestions={securityQuestions}
          setSecurityQuestions={setSecurityQuestions}
        />
      );
    }

    if (isLoginModalOpen) {
      return (
        <div className="bg-[#020617] text-slate-100 min-h-screen flex items-center justify-center font-sans relative p-6">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none" />
          <div className="w-full max-w-md bg-slate-900/40 border-2 border-slate-800/80 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.85)] text-left select-none relative animate-fade-in z-10 p-6 sm:p-8 backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.06),transparent_50%)] pointer-events-none" />
            <div className="space-y-6">
              <div className="space-y-2 text-center pb-2 border-b border-slate-800/80">
                <div className="inline-flex p-3 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 mb-2">
                  <Lock className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold font-mono uppercase tracking-wider text-slate-150">
                  Secure Access Terminal
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">
                  Stage 2/2: Input Administrative Security Credentials
                </p>
              </div>

              {loginError && (
                <div className="bg-red-950/40 border border-red-800/80 p-3.5 rounded-xl text-xs text-red-200 flex items-start gap-2.5 animate-bounce">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-left">
                    <p className="font-bold text-red-300">Authentication Failed</p>
                    <p className="opacity-90 font-sans leading-relaxed text-red-350">{loginError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleAdminVerify} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    Staff Identity Token
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 flex items-center justify-center text-slate-500">
                      <User className="w-4 h-4" />
                    </span>
                    <input 
                      type="text" 
                      required
                      placeholder="Username ID"
                      value={loginForm.username}
                      onChange={e => {
                        setLoginError(null);
                        setLoginForm(prev => ({ ...prev, username: e.target.value }));
                      }}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    Security Lock Key
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 flex items-center justify-center text-slate-500">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input 
                      type={showAdminPassword ? "text" : "password"} 
                      required
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={e => {
                        setLoginError(null);
                        setLoginForm(prev => ({ ...prev, password: e.target.value }));
                      }}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-350 focus:outline-none cursor-pointer p-1 rounded-md hover:bg-slate-800/50"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* High-Fidelity Interactive Security CAPTCHA Check */}
                <div className="space-y-2 border-t border-b border-slate-800/40 py-4 my-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Anti-Robot Verification
                    </label>
                    <span className="text-[8px] font-sans text-emerald-400 uppercase font-black tracking-wider">
                      Required*
                    </span>
                  </div>

                  <div className="flex items-stretch gap-2 font-sans">
                    <div className="flex-1 bg-slate-950/90 border border-slate-800 rounded-xl flex items-center justify-center gap-1.5 select-none relative overflow-hidden shadow-inner py-2.5">
                      <div className="absolute inset-x-0 top-1/2 h-1 bg-blue-500/10 skew-y-3 pointer-events-none" />
                      <div className="absolute inset-x-0 top-[25%] h-1 bg-indigo-500/10 -skew-y-6 pointer-events-none" />
                      {captchaText.split("").map((char, index) => {
                        const rotation = (index % 2 === 0 ? "rotate-6" : "-rotate-6");
                        const translation = (index % 2 === 0 ? "translate-y-0.5" : "-translate-y-0.5");
                        const textStyles = [
                          "text-blue-400 drop-shadow-[0_2px_4px_rgba(59,130,246,0.3)]",
                          "text-indigo-400 drop-shadow-[0_2px_4px_rgba(129,140,248,0.3)]",
                          "text-emerald-400 drop-shadow-[0_2px_4px_rgba(52,211,153,0.3)]",
                          "text-pink-400 drop-shadow-[0_2px_4px_rgba(244,114,182,0.3)]"
                        ];
                        const selectedColor = textStyles[index % textStyles.length];

                        return (
                          <span 
                            key={index} 
                            className={`inline-block font-mono font-black text-sm tracking-wider transform ${rotation} ${translation} ${selectedColor}`}
                          >
                            {char}
                          </span>
                        );
                      })}
                    </div>
                    <button 
                      type="button" 
                      onClick={generateCaptcha}
                      className="bg-slate-800 hover:bg-slate-755 border border-slate-750 px-3.5 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center focus:outline-none"
                      title="Regenerate dynamic defense key"
                    >
                      <RefreshCcw className="w-3.5 h-3.5 animate-spin-once" />
                    </button>
                  </div>

                  <input 
                    type="text" 
                    required
                    placeholder="Enter CAPTCHA value"
                    value={captchaInput}
                    onChange={e => {
                      setLoginError(null);
                      setCaptchaInput(e.target.value);
                    }}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 px-4 text-xs font-mono text-center tracking-widest text-white placeholder-slate-705 uppercase focus:outline-none focus:border-indigo-500 transition-all font-mono"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-550 font-mono uppercase tracking-widest text-xs py-3.5 rounded-xl transition-all cursor-pointer font-bold flex items-center justify-center gap-2 shadow-lg focus:outline-none border border-blue-500/20"
                  >
                    <LockOpen className="w-3.5 h-3.5" />
                    <span>Verify & Enter Console</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsLoginModalOpen(false);
                      setIsGatekeeperOpen(true);
                      setLoginError(null);
                    }}
                    className="w-full bg-slate-800 hover:bg-slate-750 text-slate-350 hover:text-white font-mono uppercase tracking-widest text-[9px] py-2 rounded-xl transition-all cursor-pointer font-bold flex items-center justify-center gap-1.5 focus:outline-none border border-slate-700/60"
                  >
                    Back to Gatekeeper
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      );
    }

    // Default: Show administrative gatekeeper combination lock
    return (
      <div className="bg-[#020617] text-slate-100 min-h-screen flex items-center justify-center font-sans relative p-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none" />
        <div className="w-full max-w-md bg-slate-900/40 border-2 border-slate-800/80 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.85)] text-left select-none relative animate-fade-in z-10 backdrop-blur-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,119,6,0.06),transparent_50%)] pointer-events-none" />
          <div className="h-1.5 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 animate-pulse" />
          
          <div className="px-6 py-5 border-b border-slate-800/80 flex justify-between items-center bg-slate-900/60 backdrop-blur-sm">
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span className="text-[9px] font-mono tracking-widest text-amber-500 uppercase font-black">
                  Secured Back-Office Portal
                </span>
              </div>
              <h2 className="text-md font-bold font-mono text-slate-100 tracking-wider">
                STAGE 1: INTERLOCK SWITCH
              </h2>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <p className="text-[11px] text-slate-400 font-mono leading-relaxed bg-slate-950/65 border border-slate-850 p-3 rounded-xl">
              🔑 Align the 3-gear mechanical cyber-combination lock dials to the correct administrative security alignment sequence.
            </p>

            <div className="flex items-center justify-around py-4 bg-slate-950/40 rounded-2xl border border-slate-850 p-4">
              {gearValues.map((val, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2.5">
                  <button 
                    type="button"
                    disabled={lockoutTimer > 0 || gearUnlockSuccess}
                    onClick={() => rotateGear(idx, 'up')}
                    className="p-1 px-2.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-30 cursor-pointer focus:outline-none"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <div className="w-14 h-16 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center font-mono font-black text-2xl text-amber-500 shadow-inner select-none relative overflow-hidden">
                    <span className="relative z-10">{val}</span>
                  </div>
                  <button 
                    type="button"
                    disabled={lockoutTimer > 0 || gearUnlockSuccess}
                    onClick={() => rotateGear(idx, 'down')}
                    className="p-1 px-2.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-30 cursor-pointer focus:outline-none"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {gatekeeperError && (
              <div className="bg-red-950/40 border border-red-800/80 p-3.5 rounded-xl text-xs text-red-200 flex items-start gap-2.5 animate-bounce">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-left">
                  <p className="font-bold text-red-300">Vault Locking State Safeguard</p>
                  <p className="opacity-90 font-sans leading-relaxed">{gatekeeperError}</p>
                </div>
              </div>
            )}

            {lockoutTimer > 0 && (
              <div className="bg-amber-950/40 border border-amber-800/80 p-3 rounded-xl text-xs text-amber-200 flex items-center justify-center gap-2 animate-pulse">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span className="font-mono font-black uppercase tracking-wider text-[10px]">
                  SAFE LOCKOUT RE-ATTEMPT COOLDOWN ({lockoutTimer}s)
                </span>
              </div>
            )}

            <div className="space-y-2">
              <button 
                type="button" 
                disabled={lockoutTimer > 0 || gearUnlockSuccess}
                onClick={() => handleVerifyCombination()}
                className={`w-full font-mono uppercase tracking-widest text-xs py-3.5 rounded-xl transition-all cursor-pointer font-bold flex items-center justify-center gap-2 shadow-lg focus:outline-none border-2 border-slate-850 ${
                  gearUnlockSuccess
                    ? "bg-emerald-600 border-emerald-500 text-white animate-pulse"
                    : lockoutTimer > 0
                      ? "bg-slate-950 border-slate-900 text-slate-650 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-white hover:shadow-[0_0_20px_rgba(217,119,6,0.35)] shadow-black/80"
                }`}
              >
                {gearUnlockSuccess ? (
                  <>
                    <LockOpen className="w-4 h-4 animate-bounce" />
                    <span>DECOUPLERS SECUREMENT OFF • SUCCESS</span>
                  </>
                ) : lockoutTimer > 0 ? (
                  <>
                    <Lock className="w-4 h-4 text-slate-700" />
                    <span>LOCK PENALTY COOLDOWN ({lockoutTimer}s)</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-amber-900" />
                    <span>DISENGAGE COMBINATION LOCK</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F5] text-slate-900 min-h-screen flex flex-col font-sans relative antialiased selection:bg-blue-100 selection:text-blue-900">
      
      {/* Editorial Top Border Accent */}
      <div className="h-1 text-xs select-none bg-blue-600 block w-full" />

      {/* Primary Sticky Header */}
      <header className={`sticky top-0 z-30 transition-all backdrop-blur-md border-b border-slate-200/60 ${profileDetails.coverUrl ? "bg-white/85 shadow-sm" : "bg-[#FAF9F5]/90"}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 sm:h-20 flex items-center justify-between">
          <button 
            onClick={() => handleScrollToSegment('hero-top')}
            className="flex items-baseline gap-2 group cursor-pointer text-left focus:outline-none"
          >
            <span className="font-serif font-black text-lg sm:text-2xl tracking-tight text-slate-950 transition-colors group-hover:text-blue-600">
              {profileDetails.name ? profileDetails.name.toUpperCase() : "PORTFOLIO OWNER"}
            </span>
            <span className="hidden md:inline-block font-mono text-[10px] uppercase text-slate-400 tracking-widest bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded">
              {profileDetails.tagline || "Professional Digital Space"}
            </span>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-mono tracking-widest uppercase">
            <button 
              onClick={() => handleScrollToSegment('bio')} 
              className={`cursor-pointer transition-all focus:outline-none font-bold pb-1 border-b-2 ${
                currentView === 'about' ? 'text-blue-600 border-blue-600' : 'text-slate-600 hover:text-blue-600 border-transparent'
              }`}
            >
              {t("About Me")}
            </button>
            <button 
              onClick={() => handleScrollToSegment('journey')} 
              className={`cursor-pointer transition-all focus:outline-none font-bold pb-1 border-b-2 ${
                currentView === 'chronology' ? 'text-blue-600 border-blue-600' : 'text-slate-600 hover:text-blue-600 border-transparent'
              }`}
            >
              {t("History & Chronology")}
            </button>
            <button 
              onClick={() => handleScrollToSegment('projects')} 
              className={`cursor-pointer transition-all focus:outline-none font-bold pb-1 border-b-2 ${
                currentView === 'projects' ? 'text-blue-600 border-blue-600' : 'text-slate-600 hover:text-blue-600 border-transparent'
              }`}
            >
              {t("Creative Repo Projects")}
            </button>
            <button 
              onClick={() => handleScrollToSegment('blogs')} 
              className={`cursor-pointer transition-all focus:outline-none font-bold pb-1 border-b-2 ${
                currentView === 'blogs' ? 'text-blue-600 border-blue-600' : 'text-slate-600 hover:text-blue-600 border-transparent'
              }`}
            >
              {t("Insights Journal Blogs")}
            </button>
            <button 
              onClick={() => handleScrollToSegment('contact')} 
              className={`cursor-pointer transition-all focus:outline-none font-bold pb-1 border-b-2 ${
                currentView === 'contact' ? 'text-blue-600 border-blue-600' : 'text-slate-600 hover:text-blue-600 border-transparent'
              }`}
            >
              {t("Contact")}
            </button>
          </nav>

          {/* Mobile Menu layout toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-850 hover:text-blue-600 transition-colors focus:outline-none"
              title="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-[#FAF9F5] border-b border-slate-200 px-6 py-6 space-y-4 shadow-xl flex flex-col text-sm font-semibold tracking-wider font-mono">
            <button 
              onClick={() => handleScrollToSegment('bio')} 
              className={`text-left py-2 border-b border-slate-100 ${
                currentView === 'about' ? 'text-blue-600 font-bold' : 'text-slate-700 hover:text-blue-600'
              }`}
            >
              {t("About Me")}
            </button>
            <button 
              onClick={() => handleScrollToSegment('journey')} 
              className={`text-left py-2 border-b border-slate-100 ${
                currentView === 'chronology' ? 'text-blue-600 font-bold' : 'text-slate-700 hover:text-blue-600'
              }`}
            >
              {t("History & Chronology")}
            </button>
            <button 
              onClick={() => handleScrollToSegment('projects')} 
              className={`text-left py-2 border-b border-slate-100 ${
                currentView === 'projects' ? 'text-blue-600 font-bold' : 'text-slate-700 hover:text-blue-600'
              }`}
            >
              {t("Creative Repo Projects")}
            </button>
            <button 
              onClick={() => handleScrollToSegment('blogs')} 
              className={`text-left py-2 border-b border-slate-100 ${
                currentView === 'blogs' ? 'text-blue-600 font-bold' : 'text-slate-700 hover:text-blue-600'
              }`}
            >
              {t("Insights Journal Blogs")}
            </button>
            <button 
              onClick={() => handleScrollToSegment('contact')} 
              className={`text-left py-2 ${
                currentView === 'contact' ? 'text-blue-600 font-bold' : 'text-slate-700 hover:text-blue-600'
              }`}
            >
              {t("Contact")}
            </button>
          </div>
        )}
      </header>

      {/* Main Orchestrator Container */}
      <main className="flex-grow">
        
        {currentView === 'about' && (
          <div className="animate-fade-in">
            {/* SECTION 1: HERO SLIDER TIMELINE (with auto-playing indicators) */}
        <section 
          id="hero-top" 
          className="border-b border-slate-200 relative overflow-hidden transition-all duration-500 bg-[#FAF9F5]"
        >
          {/* Cover Photo Banner (LinkedIn/Twitter Style) */}
          {profileDetails.coverUrl && (
            <div className="relative w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[550px] overflow-hidden bg-slate-900 border-b border-slate-200/50">
              <img 
                src={profileDetails.coverUrl} 
                alt="Profile Cover Background" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-slate-950/15" />
            </div>
          )}

          <div className={`max-w-7xl mx-auto px-6 relative z-10 ${
            profileDetails.coverUrl ? 'py-10 sm:py-16' : 'py-10 sm:py-16'
          }`}>
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xl lg:min-h-[460px] flex flex-col md:flex-row">
              
              {/* Slider Left side: High impact image context */}
              <div className="w-full md:w-1/2 relative bg-slate-950 h-[380px] md:h-auto flex flex-col justify-between overflow-hidden">
                <div className="relative flex-grow h-0 overflow-hidden bg-slate-950">
                  <img 
                    src={projects.length > 0 ? (heroSlides[sliderIndex].bgImage || profileDetails.profilePictureUrl) : (profileDetails.profilePictureUrl || heroSlides[sliderIndex].bgImage)} 
                    alt="" 
                    className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-35 select-none pointer-events-none"
                    referrerPolicy="no-referrer"
                  />
                  <img 
                    src={projects.length > 0 ? (heroSlides[sliderIndex].bgImage || profileDetails.profilePictureUrl) : (profileDetails.profilePictureUrl || heroSlides[sliderIndex].bgImage)} 
                    alt={projects.length > 0 ? heroSlides[sliderIndex].title : (profileDetails.profilePictureUrl ? "Personal Portrait" : heroSlides[sliderIndex].title)}
                    className="relative z-10 w-full h-full object-contain select-none pointer-events-none transition-transform duration-1000 scale-102 hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-slate-950/20 z-20 pointer-events-none" />
                </div>
                
                {/* Active slider metadata indicators - moved down below the image */}
                <div className="bg-slate-950 py-3 px-6 flex items-center justify-between border-t border-slate-800 text-white select-none">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                    <span className="text-[10px] font-mono tracking-widest uppercase text-slate-200">
                      {projects.length === 0 && profileDetails.profilePictureUrl ? "OFFICIAL PORTRAIT CARD" : `ACTIVE PORTFOLIO RADAR — SLIDE ${sliderIndex + 1}/${heroSlides.length}`}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 hidden sm:inline font-bold">
                    PORTFOLIO SYSTEM
                  </span>
                </div>
              </div>

              {/* Slider Right side: premium editorial content (tim.blog layout) */}
              <div className="w-full md:w-1/2 p-8 sm:p-12 md:p-16 flex flex-col justify-between space-y-8 bg-white">
                <div className="space-y-4">
                  <span className="text-[10px] font-mono tracking-widest text-blue-600 uppercase font-black block">
                    {heroSlides[sliderIndex].label}
                  </span>
                  
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-slate-950 tracking-tight leading-none">
                    {heroSlides[sliderIndex].title}
                  </h1>
                  
                  <p className="text-base sm:text-lg font-serif italic text-slate-800 leading-relaxed font-normal">
                    "{heroSlides[sliderIndex].italic}"
                  </p>
                  
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                    {heroSlides[sliderIndex].desc}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-4 border-t border-slate-100">
                  {heroSlides[sliderIndex].projectLink.startsWith('http') ? (
                    <a 
                      href={heroSlides[sliderIndex].projectLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-slate-900 hover:bg-blue-600 text-white font-mono text-xs px-5 py-3 rounded-xl transition-all font-bold shadow-md cursor-pointer tracking-wider shrink-0 max-w-fit"
                    >
                      <span>{heroSlides[sliderIndex].buttonText}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <button 
                      onClick={() => handleScrollToSegment(heroSlides[sliderIndex].projectLink.substring(1))}
                      className="inline-flex items-center gap-2 bg-slate-900 hover:bg-blue-600 text-white font-mono text-xs px-5 py-3 rounded-xl transition-all font-bold shadow-md cursor-pointer tracking-wider shrink-0 max-w-fit"
                    >
                      <span>{heroSlides[sliderIndex].buttonText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Manual pagination indicator badges */}
                  <div className="flex items-center gap-2.5">
                    {heroSlides.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSliderManual(idx)}
                        className={`h-2 rounded-full cursor-pointer transition-all ${
                          idx === sliderIndex ? "bg-blue-600 w-8" : "bg-slate-200 hover:bg-slate-400 w-2"
                        }`}
                        title={`Slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>


        {/* SECTION 2: HUMANIZED BIO — "CHRONICLE OF RESILIENCE" */}
        <section id="bio" className="py-16 sm:py-24 bg-[#FAF9F5] border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              
              {/* Left Column: Big pull quote emphasizing design craftsmanship */}
              <div className="lg:col-span-4 space-y-6">
                <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold block">PHILOSOPHY & ROOT</span>
                <blockquote className="space-y-4">
                  <p className="text-3xl sm:text-4xl font-serif font-bold text-slate-950 leading-tight">
                    "True craftsmanship is built on the ruins of initial failures. Every schema design, every typography rule is forged through iteration."
                  </p>
                  <footer className="font-mono text-xs tracking-wider uppercase text-blue-600 font-bold block">
                    — {profileDetails.name || "Portfolio Candidate"}
                  </footer>
                </blockquote>
                
                {/* Micro educational details block */}
                <div className="bg-white border rounded-2xl p-5 shadow-sm border-slate-200/60 text-xs text-left">
                  <h4 className="font-bold text-slate-900 font-mono text-[11px] uppercase tracking-widest mb-2 flex items-center gap-1.5 text-blue-600">
                    <Award className="w-4 h-4" />
                    <span>Academic Context</span>
                  </h4>
                  <p className="leading-relaxed text-slate-650 text-left">
                    {profileDetails.name || "This candidate"} is pursuing computational science and engineering studies at <strong>{profileDetails.universityName || "their University"}</strong>. The focus blends database schema construction with frontend interface design.
                  </p>
                </div>

                {/* Relocation Context Box */}
                <div className="bg-white border rounded-2xl p-5 shadow-sm border-slate-200/60 text-xs text-left">
                  <h4 className="font-bold text-slate-900 font-mono text-[11px] uppercase tracking-widest mb-2 flex items-center gap-1.5 text-blue-600">
                    <Globe className="w-4 h-4" />
                    <span>Postgraduate Goals</span>
                  </h4>
                  <p className="leading-relaxed text-slate-650 text-left">
                    Primary objective is target admissions at <strong>{profileDetails.targetMasterUni || "their Target Postgraduate Institution"}</strong> to specialize in advanced software paradigms, systems engineering, and advanced database architectures.
                  </p>
                </div>
              </div>

              {/* Right Column: Narrative detailing academic growth and resilience or CV Scorecard */}
              <div className="lg:col-span-8 space-y-6 text-left">
                
                {/* Tab Switcher Headers */}
                <div className="flex border-b border-slate-200 gap-6 sm:gap-10">
                  <button
                    onClick={() => setActiveBioTab('story')}
                    className={`pb-3 font-mono text-[11px] sm:text-xs tracking-widest uppercase font-extrabold border-b-2 transition-all cursor-pointer focus:outline-none ${
                      activeBioTab === 'story' 
                        ? 'border-blue-600 text-blue-600 font-black' 
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    📖 Narrative Story
                  </button>
                  <button
                    onClick={() => setActiveBioTab('cv')}
                    className={`pb-3 font-mono text-[11px] sm:text-xs tracking-widest uppercase font-extrabold border-b-2 transition-all cursor-pointer focus:outline-none ${
                      activeBioTab === 'cv' 
                        ? 'border-blue-600 text-blue-600 font-black' 
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    💼 Professional CV Details
                  </button>
                </div>

                {activeBioTab === 'story' ? (
                  <div className="space-y-6 text-slate-700 text-sm sm:text-base leading-relaxed font-sans font-normal animate-fadeIn text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-[10px] font-mono tracking-widest text-[#2563eb] uppercase font-bold block">BIOGRAPHICAL CHRONICLE</span>
                        <h3 className="text-2xl font-serif font-black text-slate-950 tracking-tight">Narrative Story</h3>
                      </div>
                    </div>

                    {!profileDetails.aboutText && milestones.length === 0 ? (
                      <div className="text-center py-16 bg-slate-50 border border-slate-200/60 rounded-2xl p-6">
                        <div className="max-w-md mx-auto space-y-3">
                          <BookOpen className="w-8 h-8 text-slate-300 mx-auto" strokeWidth={1} />
                          <h4 className="text-base font-serif font-black text-slate-900">Journey Narrative is Empty</h4>
                          <p className="text-xs text-slate-500 leading-relaxed font-sans">
                            There is no biographical narrative summary or journey milestone of life registered yet. Log into the Back-Office Panel with authorize parameters to write an about summary or register highlights!
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6 animate-fadeIn">
                        {profileDetails.aboutText && (
                          <div className="bg-[#FAF9F5]/40 border border-slate-200/60 rounded-2xl p-6 space-y-3">
                            <span className="text-[10px] font-mono text-blue-600 uppercase tracking-wider font-extrabold block">● PROFILE SUMMARY</span>
                            <div className="text-slate-705 font-sans leading-relaxed text-xs sm:text-sm whitespace-pre-wrap">
                              {profileDetails.aboutText}
                            </div>
                          </div>
                        )}

                        {milestones.length > 0 && (
                          <div className="space-y-4">
                            <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full font-bold uppercase tracking-wider inline-block">
                              Registered Journey Milestones ({milestones.length})
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {milestones.map((milestone) => (
                                <div key={milestone.id} className="bg-white border border-slate-200/60 rounded-2xl p-5 hover:border-slate-300 transition-all space-y-3">
                                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                    <span className="text-[10px] font-mono bg-slate-100 text-slate-750 border px-2 py-0.5 rounded-md uppercase font-bold">
                                      {milestone.year}
                                    </span>
                                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">{milestone.type}</span>
                                  </div>
                                  <h4 className="text-sm font-serif font-black text-slate-900">{milestone.title}</h4>
                                  <p className="text-xs text-slate-500 leading-relaxed font-sans">{milestone.subtitle}</p>
                                  <p className="text-xs text-slate-655 font-sans leading-relaxed pt-1 border-t border-slate-50 mt-1 whitespace-pre-wrap">{milestone.description}</p>
                                  {milestone.story && (
                                    <p className="text-[11px] text-slate-500 italic font-sans bg-slate-50 p-2.5 rounded-lg border border-slate-100/60 leading-relaxed mt-2 whitespace-pre-wrap">
                                      {milestone.story}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6 text-slate-700 animate-fadeIn font-sans text-left">
                    <div id="printable-cv-content" className="space-y-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs print:p-0 print:border-none print:shadow-none text-left">
                      
                      {/* CV Top Segment */}
                      <div className="flex flex-col lg:flex-row justify-between items-start gap-6 border-b border-slate-100 pb-6">
                        <div className="space-y-2 text-left animate-fadeIn">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                              ● Interactive Curriculum Vitae
                            </span>
                          </div>
                          <h3 className="text-3xl font-serif font-black text-slate-950 tracking-tight">
                            {profileDetails.name || "Portfolio Candidate"}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-655 leading-relaxed font-sans text-left uppercase font-mono font-bold tracking-wider text-blue-600">
                            {profileDetails.tagline || "Professional Digital Profile"}
                          </p>
                        </div>
                        
                        {/* Interactive CV Controls & Print */}
                        <div className="flex flex-wrap gap-2 self-start lg:self-center">
                          <button
                            onClick={() => window.print()}
                            className="bg-slate-950 hover:bg-blue-600 hover:shadow-md text-white px-3.5 py-2' rounded-xl text-[10px] font-mono uppercase font-black transition-all flex items-center gap-1.5 cursor-pointer focus:outline-none"
                            title="Export PDF of CV"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Export / Print CV</span>
                          </button>
                        </div>
                      </div>

                      {/* Filter Controls for Interactive CV Scorecard */}
                      <div className="flex flex-wrap gap-1.5 border-b border-slate-100 pb-4">
                        {(['all', 'education', 'experience', 'skills', 'info'] as const).map((filter) => (
                          <button
                            key={filter}
                            onClick={() => setCvFilter(filter)}
                            className={`px-3 py-1.5 rounded-lg text-[10.5px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer focus:outline-none ${
                              cvFilter === filter
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/50'
                            }`}
                          >
                            {filter === 'all' ? 'Show All' : filter === 'education' ? '🎓 Academic History' : filter === 'experience' ? '💼 Professional Work' : filter === 'skills' ? '⚙️ Tech Stack' : '👤 Profile Details'}
                          </button>
                        ))}
                      </div>

                      {/* 1. ACADEMIC CREDENTIAL TIMELINE */}
                      {(cvFilter === 'all' || cvFilter === 'education') && (
                        <div className="space-y-4 animate-fadeIn text-left">
                          <h4 className="text-[11px] font-mono text-slate-900 font-extrabold uppercase tracking-widest border-l-4 border-blue-600 pl-2.5 flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-blue-600" />
                            <span>Institutional Pedigree & Education</span>
                          </h4>
                          
                          {!profileDetails.universityName && !profileDetails.collegeName && !profileDetails.highSchoolName && !profileDetails.targetMasterUni && (!profileDetails.customInstitutions || profileDetails.customInstitutions.length === 0) ? (
                            <p className="text-slate-400 italic font-mono text-xs text-center py-8 bg-slate-50 border border-slate-200/60 rounded-2xl w-full">
                              No academic institutions entered yet. Access the Back-Office Panel to input educational history!
                            </p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                              {/* Geomatika */}
                              {profileDetails.universityName && (
                                <div className="bg-[#FAF9F5]/40 border border-slate-200/80 rounded-2xl p-5 hover:bg-[#FAF9F5] transition-all space-y-3 text-left">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9.5px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-md font-bold uppercase">
                                      Current University Study
                                    </span>
                                  </div>
                                  <h5 className="font-serif font-black text-slate-950 text-sm">{profileDetails.universityName}</h5>
                                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                                    Analytical software systems coursework, database scaling structures, algorithmic logic under active curriculum paths.
                                  </p>
                                  {profileDetails.universityLink && (
                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                                      <a 
                                        href={profileDetails.universityLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-[10.5px] font-mono text-blue-600 hover:underline flex items-center gap-1 font-bold"
                                      >
                                        <span>Website link</span>
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Charles University */}
                              {profileDetails.targetMasterUni && (
                                <div className="bg-[#FAF9F5]/40 border border-slate-200/80 rounded-2xl p-5 hover:bg-[#FAF9F5] transition-all space-y-3 text-left">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9.5px] font-mono text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-md font-bold uppercase">
                                      Postgrad Studies Target
                                    </span>
                                  </div>
                                  <h5 className="font-serif font-black text-slate-950 text-sm">{profileDetails.targetMasterUni}</h5>
                                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                                    Master of Science objectives focusing on high concurrency, cloud architectures and relational database indices.
                                  </p>
                                  {profileDetails.targetMasterLink && (
                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                                      <a 
                                        href={profileDetails.targetMasterLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-[10.5px] font-mono text-blue-600 hover:underline flex items-center gap-1 font-bold"
                                      >
                                        <span>Website link</span>
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Dhaka College */}
                              {profileDetails.collegeName && (
                                <div className="bg-[#FAF9F5]/40 border border-slate-200/85 rounded-2xl p-5 hover:bg-[#FAF9F5] transition-all space-y-3 text-left">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9.5px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md font-bold uppercase">
                                      Higher Secondary College
                                    </span>
                                  </div>
                                  <h5 className="font-serif font-black text-slate-950 text-sm">{profileDetails.collegeName}</h5>
                                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                                    Acquired higher level scientific benchmarks, analytical concepts of mathematics and computational basics.
                                  </p>
                                  {profileDetails.collegeLink && (
                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                                      <a 
                                        href={profileDetails.collegeLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-[10.5px] font-mono text-blue-600 hover:underline flex items-center gap-1 font-bold"
                                      >
                                        <span>Website link</span>
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Motijheel Gov Boys */}
                              {profileDetails.highSchoolName && (
                                <div className="bg-[#FAF9F5]/40 border border-slate-200/80 rounded-2xl p-5 hover:bg-[#FAF9F5] transition-all space-y-3 text-left">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9.5px] font-mono text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-md font-bold uppercase">
                                      Secondary High School
                                    </span>
                                  </div>
                                  <h5 className="font-serif font-black text-slate-950 text-sm">{profileDetails.highSchoolName}</h5>
                                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                                    Foundational scientific methodologies, algebraic structures, geometric layout calculations and initial IT logic.
                                  </p>
                                  {profileDetails.highSchoolLink && (
                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                                      <a 
                                        href={profileDetails.highSchoolLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-[10.5px] font-mono text-blue-600 hover:underline flex items-center gap-1 font-bold"
                                      >
                                        <span>Website link</span>
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Custom Dynamic Institutions */}
                              {profileDetails.customInstitutions && profileDetails.customInstitutions.map((inst, idx) => (
                                <div key={inst.id || idx} className="bg-[#FAF9F5]/40 border border-slate-200/80 rounded-2xl p-5 hover:bg-[#FAF9F5] transition-all space-y-3 text-left">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9.5px] font-mono text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-md font-bold uppercase">
                                      {inst.title || "Academic Coordinate"}
                                    </span>
                                  </div>
                                  <h5 className="font-serif font-black text-slate-950 text-sm">{inst.name}</h5>
                                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                                    {inst.description || "Studies, coursework coordinates, and academic pursuits logged under secure credentials profile."}
                                  </p>
                                  {inst.link && (
                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                                      <a 
                                        href={inst.link} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-[10.5px] font-mono text-blue-600 hover:underline flex items-center gap-1 font-bold"
                                      >
                                        <span>Website link</span>
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 2. PROFESSIONAL EXP TIMELINE */}
                      {(cvFilter === 'all' || cvFilter === 'experience') && (
                        <div className="space-y-4 animate-fadeIn text-left pt-2">
                          <h4 className="text-[11px] font-mono text-slate-900 font-extrabold uppercase tracking-widest border-l-4 border-blue-600 pl-2.5 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-blue-600" />
                            <span>Professional Roles & Practical Outputs</span>
                          </h4>
                          
                          {milestones.length === 0 ? (
                            <p className="text-slate-400 italic font-mono text-xs text-center py-8 bg-slate-50 border border-slate-200/60 rounded-2xl w-full">
                              No professional milestones or achievements recorded yet. Access the Back-Office to input your journey milestones!
                            </p>
                          ) : (
                            <div className="space-y-4">
                              {milestones.map((m) => (
                                <div key={m.id} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 hover:bg-slate-100/50 transition-all text-left">
                                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2 border-b border-slate-200/40 pb-3 mb-3">
                                    <div>
                                      <h5 className="font-serif font-black text-slate-950 text-base">{m.title}</h5>
                                      <span className="text-xs text-slate-500 font-mono">{m.subtitle || "Journey Chronicle"}</span>
                                    </div>
                                    <span className={`text-xs border px-3 py-1 rounded-full font-mono font-bold py-0.5 ${
                                      m.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-150' :
                                      m.type === 'failure' ? 'bg-amber-50 text-amber-800 border-amber-150' :
                                      m.type === 'academic' ? 'bg-blue-50 text-blue-800 border-blue-150' :
                                      'bg-indigo-50 text-indigo-800 border-indigo-150'
                                    }`}>
                                      {m.year} | {m.type.toUpperCase()}
                                    </span>
                                  </div>
                                  <p className="text-xs sm:text-sm text-slate-650 leading-relaxed font-sans whitespace-pre-wrap">
                                    {m.description}
                                  </p>
                                  {m.story && (
                                    <div className="mt-3 text-xs bg-white/70 p-3 rounded-lg border border-slate-100 font-mono text-slate-500 whitespace-pre-wrap">
                                      <span className="font-bold block mb-1 uppercase text-[9px] text-blue-600">Contextual Narrative:</span>
                                      {m.story}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 3. TECH STACK INTERACTIVE INVENTORY */}
                      {(cvFilter === 'all' || cvFilter === 'skills') && (
                        <div className="space-y-4 animate-fadeIn text-left pt-2">
                          <h4 className="text-[11px] font-mono text-slate-900 font-extrabold uppercase tracking-widest border-l-4 border-blue-600 pl-2.5 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-blue-600" />
                            <span>System Core Tech Stack & Tools</span>
                          </h4>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans text-xs">
                            {/* Skills Card 1 */}
                            <div className="bg-white border rounded-xl p-4 border-slate-200/80 text-left">
                              <span className="w-2 h-2 rounded-full bg-blue-600 inline-block mr-1.5" />
                              <span className="font-mono text-[10px] font-black uppercase text-slate-800 tracking-wider">Backend Systems & DB</span>
                              
                              <div className="mt-4 space-y-3">
                                <div>
                                  <div className="flex justify-between items-center text-[11px] mb-1">
                                    <span className="text-slate-700 font-bold">Node.js / Express</span>
                                    <span className="font-mono font-extrabold text-blue-600">95%</span>
                                  </div>
                                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '95%' }} />
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between items-center text-[11px] mb-1">
                                    <span className="text-slate-700 font-bold">PostgreSQL / Supabase</span>
                                    <span className="font-mono font-extrabold text-blue-600">88%</span>
                                  </div>
                                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '88%' }} />
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between items-center text-[11px] mb-1">
                                    <span className="text-slate-700 font-bold">REST API Design</span>
                                    <span className="font-mono font-extrabold text-blue-600">92%</span>
                                  </div>
                                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '92%' }} />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Skills Card 2 */}
                            <div className="bg-white border rounded-xl p-4 border-slate-200/80 text-left">
                              <span className="w-2 h-2 rounded-full bg-[#10b981] inline-block mr-1.5" />
                              <span className="font-mono text-[10px] font-black uppercase text-slate-800 tracking-wider">Frontend Interface</span>
                              
                              <div className="mt-4 space-y-3">
                                <div>
                                  <div className="flex justify-between items-center text-[11px] mb-1">
                                    <span className="text-slate-700 font-bold">React 19 Hooks</span>
                                    <span className="font-mono font-extrabold text-[#10b981]">90%</span>
                                  </div>
                                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#10b981] rounded-full" style={{ width: '90%' }} />
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between items-center text-[11px] mb-1">
                                    <span className="text-slate-700 font-bold">Vite & TypeScript</span>
                                    <span className="font-mono font-extrabold text-[#10b981]">85%</span>
                                  </div>
                                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#10b981] rounded-full" style={{ width: '85%' }} />
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between items-center text-[11px] mb-1">
                                    <span className="text-slate-700 font-bold">Tailwind CSS (V3/V4)</span>
                                    <span className="font-mono font-extrabold text-[#10b981]">98%</span>
                                  </div>
                                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#10b981] rounded-full" style={{ width: '98%' }} />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Skills Card 3 */}
                            <div className="bg-white border rounded-xl p-4 border-slate-200/80 text-left">
                              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block mr-1.5" />
                              <span className="font-mono text-[10px] font-black uppercase text-slate-800 tracking-wider">Graphics & Typography</span>
                              
                              <div className="mt-4 space-y-3">
                                <div>
                                  <div className="flex justify-between items-center text-[11px] mb-1">
                                    <span className="text-slate-700 font-bold">Adobe Photoshop</span>
                                    <span className="font-mono font-extrabold text-amber-500">99%</span>
                                  </div>
                                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '99%' }} />
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between items-center text-[11px] mb-1">
                                    <span className="text-slate-700 font-bold">Vector Illustrator</span>
                                    <span className="font-mono font-extrabold text-amber-500">90%</span>
                                  </div>
                                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '90%' }} />
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between items-center text-[11px] mb-1">
                                    <span className="text-slate-700 font-bold">Symmetric Typographic Art</span>
                                    <span className="font-mono font-extrabold text-amber-500">95%</span>
                                  </div>
                                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '95%' }} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 4. DESIGN DEMOGRAPHICS & IDENTITY INFO */}
                      {(cvFilter === 'all' || cvFilter === 'info') && (
                        <div className="space-y-4 animate-fadeIn text-left pt-2">
                          <h4 className="text-[11px] font-mono text-slate-900 font-extrabold uppercase tracking-widest border-l-4 border-blue-600 pl-2.5 flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-600" />
                            <span>Biographical Demographics & Contact</span>
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                            <div className="bg-slate-50 border p-4 rounded-xl text-left space-y-2">
                              <h5 className="font-mono text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Demographical Context</h5>
                              <div className="grid grid-cols-2 gap-y-1.5 text-slate-650 text-left">
                                <span className="font-bold text-slate-900 text-left">Date of Birth:</span>
                                <span className="text-left">10 June 2002</span>
                                <span className="font-bold text-slate-900 text-left">Gender / Pronouns:</span>
                                <span className="text-left">Male (he/him)</span>
                                <span className="font-bold text-slate-900 text-left">Hometown:</span>
                                <span className="text-left">Pabna, Bangladesh</span>
                                <span className="font-bold text-slate-900 text-left">Current Location:</span>
                                <span className="text-left">Kuala Lumpur, Malaysia</span>
                                <span className="font-bold text-slate-900 text-left">Hobbies & Interests:</span>
                                <span className="text-left font-semibold text-blue-600">Researching</span>
                                <span className="font-bold text-slate-900 text-left">Languages:</span>
                                <span className="text-left">English / Bangla (Native)</span>
                              </div>
                            </div>

                            <div className="bg-slate-50 border p-4 rounded-xl text-left space-y-2">
                              <h5 className="font-mono text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Direct Coordinates</h5>
                              <div className="grid grid-cols-2 gap-y-1.5 text-slate-655 text-left">
                                <span className="font-bold text-slate-900 text-left">Primary Email:</span>
                                <span className="underline text-blue-650 break-all text-left">{profileDetails.email || "samiurrahamanrejvi@gmail.com"}</span>
                                <span className="font-bold text-slate-900 text-left">CEO Business Role:</span>
                                <span className="text-slate-700 text-left">Cotton and Peace Ltd.</span>
                                <span className="font-bold text-slate-900 text-left">Phone Number:</span>
                                <span className="font-mono text-slate-850 font-bold text-left">{profileDetails.phone || "+880 1339-654727"}</span>
                                <span className="font-bold text-slate-900 text-left">Primary WhatsApp:</span>
                                <span className="font-mono text-slate-800 text-left">{profileDetails.whatsapp || "+880 1339-654727"}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>
        </section>
        </div>
        )}


        {/* SECTION 3: CORE JOURNEY TIMELINE CHRONOLOGY */}
        {currentView === 'chronology' && (
          <div className="animate-fade-in">
            <section id="journey" className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center space-y-4 max-w-xl mx-auto mb-16">
              <span className="text-[10px] font-mono tracking-widest text-blue-600 uppercase font-black block">THE TIMELINE</span>
              <h2 className="text-3xl sm:text-4xl font-serif font-black text-slate-950 tracking-tight">Milestones & Failure Lessons</h2>
              <div className="h-0.5 w-12 bg-slate-300 mx-auto" />
              <p className="text-xs sm:text-sm text-slate-500 font-sans">
                A granular, transparent look at successes, academic progress, and failures that catalyzed architectural restarts.
              </p>
            </div>

            <div className="max-w-4xl mx-auto relative border-l-2 border-slate-200 pl-6 sm:pl-10 space-y-12 py-4 text-left">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="relative group">
                  {/* Timeline point beacon */}
                  <span className={`absolute -left-[31px] sm:-left-[47px] top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-md transition-all ${
                    milestone.type === 'failure' 
                      ? 'bg-amber-500 group-hover:scale-125' 
                      : milestone.type === 'academic'
                      ? 'bg-blue-600 group-hover:scale-125'
                      : milestone.type === 'dream'
                      ? 'bg-purple-600 group-hover:scale-125'
                      : 'bg-emerald-600 group-hover:scale-125'
                  }`} />

                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-slate-400">{milestone.year}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono tracking-widest uppercase border ${
                        milestone.type === 'failure' 
                          ? 'bg-amber-50/70 text-amber-600 border-amber-100' 
                          : milestone.type === 'academic'
                          ? 'bg-blue-50/70 text-blue-600 border-blue-100'
                          : milestone.type === 'dream'
                          ? 'bg-purple-50/70 text-purple-600 border-purple-100'
                          : 'bg-emerald-50/70 text-emerald-600 border-emerald-100'
                      }`}>
                        {milestone.type === 'failure' ? 'Failure Lesson' : milestone.type === 'dream' ? 'Projected Future' : milestone.type}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-950">
                      {milestone.title}
                    </h3>

                    <p className="text-xs sm:text-sm font-sans font-medium text-slate-500">
                      {milestone.subtitle}
                    </p>

                    <p className="text-sm font-sans text-slate-600 leading-relaxed max-w-2xl">
                      {milestone.description}
                    </p>

                    {(milestone.imageUrl || (milestone.images && milestone.images.length > 0)) && (
                      <div className="mt-4 max-w-xl rounded-xl overflow-hidden border border-slate-200/60 bg-slate-50 shadow-xs h-80 relative">
                        <ItemImageCarousel 
                          images={milestone.images}
                          fallbackUrl={milestone.imageUrl || ''}
                          altText={milestone.title}
                          className="w-full h-full relative"
                          imageClassName="w-full h-full object-cover hover:scale-[1.01] transition-all duration-300 bg-slate-100"
                        />
                      </div>
                    )}

                    {milestone.story && (
                      <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-xl text-xs sm:text-sm text-slate-600 max-w-2xl mt-4 font-sans leading-relaxed italic">
                        {milestone.story}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
        </div>
        )}


        {/* SECTION 4: PROJECTS SHOWCASE */}
        {currentView === 'projects' && (
          <div className="animate-fade-in">
            <section id="projects" className="py-16 sm:py-24 bg-[#FAF9F5] border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center space-y-4 max-w-xl mx-auto mb-10">
              <span className="text-[10px] font-mono tracking-widest text-blue-600 uppercase font-black block">THE CREATIVE REPO</span>
              <h2 className="text-3xl sm:text-4xl font-serif font-black text-slate-950 tracking-tight">Coded & Designed Masterpieces</h2>
              <div className="h-0.5 w-12 bg-slate-300 mx-auto" />
              <p className="text-xs sm:text-sm text-slate-500 font-sans">
                Reviewing foundational releases combining high-performance databases with sleek vector and pixel visual assets.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
              <button 
                onClick={() => setProjectCategoryFilter('all')}
                className={`px-4 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  projectCategoryFilter === 'all' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-white border text-slate-650 text-slate-600 border-slate-200/80 hover:bg-slate-105'
                }`}
              >
                All Projects
              </button>
              <button 
                onClick={() => setProjectCategoryFilter('programming')}
                className={`px-4 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  projectCategoryFilter === 'programming' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-white border text-slate-650 text-slate-600 border-slate-200/80 hover:bg-slate-105'
                }`}
              >
                Computer Science & Programming
              </button>
              <button 
                onClick={() => setProjectCategoryFilter('business')}
                className={`px-4 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  projectCategoryFilter === 'business' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-white border text-slate-650 text-slate-600 border-slate-200/80 hover:bg-slate-105'
                }`}
              >
                Business Ventures
              </button>
            </div>

            {projects.filter(p => projectCategoryFilter === 'all' || p.category === projectCategoryFilter).length === 0 ? (
              <p className="text-slate-400 italic font-mono text-xs text-center py-8">No matching active projects recorded. Publish some in the dashboard!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {projects.filter(p => projectCategoryFilter === 'all' || p.category === projectCategoryFilter).map((proj) => (
                  <article key={proj.id} className="bg-white border text-left border-slate-200/75 rounded-2xl p-5 hover:p-6 shadow-sm hover:shadow-lg hover:border-slate-350 transition-all flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      {(proj.imageUrl || (proj.images && proj.images.length > 0)) && (
                        <div className="w-full h-36 rounded-xl overflow-hidden border border-slate-200/60 bg-slate-50 shrink-0 relative">
                          <ItemImageCarousel 
                            images={proj.images}
                            fallbackUrl={proj.imageUrl || ''}
                            altText={proj.title}
                            imageClassName="w-full h-full object-cover bg-slate-100 hover:scale-102 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <span className="inline-block text-[9px] font-mono tracking-wider uppercase text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full font-bold">
                        {proj.category === 'programming' ? 'Computer Science' : 'Business Venture'}
                      </span>
                      
                      <h3 className="text-lg font-serif font-bold text-slate-950">{proj.title}</h3>
                      
                      <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed whitespace-pre-wrap">
                        {proj.description}
                      </p>

                      {proj.longDescription && (
                        <p className="text-xs text-slate-500 italic pl-2 border-l border-slate-300 whitespace-pre-wrap">
                          {proj.longDescription}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {proj.techStack.map((tech, idx) => (
                          <span key={idx} className="bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[9px] px-2 py-0.5 rounded-md">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      {proj.githubUrl && (
                        <a 
                          href={proj.githubUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs font-mono font-bold text-slate-800 hover:text-blue-600 inline-flex items-center gap-1 focus:outline-none"
                        >
                          <span>GitHub Source</span>
                          <ArrowUpRight className="w-3" />
                        </a>
                      )}
                      {proj.link && (
                        <a 
                          href={proj.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs font-mono font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 focus:outline-none ml-auto"
                        >
                          <span>Live Preview</span>
                          <ExternalLink className="w-3" />
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
        </div>
        )}


        {/* SECTION 5: THE VISUAL PHOTO ARCHIVE */}
        {currentView === 'gallery' && (
          <div className="animate-fade-in">
            <section id="archive" className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-6">
            
            {/* Header controls layout */}
            <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-6 pb-6 border-b border-slate-200/80 mb-12">
              <div className="text-left space-y-2">
                <span className="text-[10px] font-mono tracking-widest text-blue-600 uppercase font-black block">VISUAL HISTORY</span>
                <h2 className="text-3xl sm:text-4xl font-serif font-black text-slate-950 tracking-tight">The Visual Journey</h2>
                <p className="text-xs text-slate-500 max-w-xl font-sans">
                  Photos from my travels around Malaysia, Thailand, Cambodia, and Vietnam, integrated alongside composite graphic design. Click any item to explore stories of lessons learned.
                </p>
              </div>

              {/* Filtering pill bar */}
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                <button
                  onClick={() => setGalleryFilter('all')}
                  className={`px-4 py-2 rounded-xl border transition-all cursor-pointer ${
                    galleryFilter === 'all' 
                      ? 'bg-slate-950 border-slate-900 text-white font-bold' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All Archive ({photos.length})
                </button>
                <button
                  onClick={() => setGalleryFilter('travel')}
                  className={`px-4 py-2 rounded-xl border transition-all cursor-pointer ${
                    galleryFilter === 'travel' 
                      ? 'bg-slate-950 border-slate-900 text-white font-bold' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Travel Chronicles ({photos.filter(p => p.category === 'travel').length})
                </button>
                <button
                  onClick={() => setGalleryFilter('photoshop')}
                  className={`px-4 py-2 rounded-xl border transition-all cursor-pointer ${
                    galleryFilter === 'photoshop' 
                      ? 'bg-slate-950 border-slate-900 text-white font-bold' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Photoshop Composites ({photos.filter(p => p.category === 'photoshop').length})
                </button>
              </div>
            </div>

            {/* Responsive grid archive */}
            {filteredPhotos.length === 0 ? (
              <div className="bg-slate-50 rounded-2xl border p-12 text-center text-slate-500 font-mono text-xs italic">
                No items found for filter "{galleryFilter}".
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 justify-center">
                {filteredPhotos.map((photo) => (
                  <article 
                    key={photo.id}
                    onClick={() => handleOpenLightbox(photo.id)}
                    className="group bg-[#FAF9F5] border border-slate-200/50 rounded-2xl overflow-hidden cursor-pointer shadow-xs hover:shadow-lg transition-all text-left flex flex-col justify-between"
                  >
                    <div className="relative bg-slate-950 aspect-video overflow-hidden">
                      {/* Blurred backdrop mirror */}
                      <img 
                        src={photo.url} 
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover blur-md opacity-40 select-none pointer-events-none"
                        loading="lazy"
                      />
                      {/* Sharp contained frontend */}
                      <img 
                        src={photo.url} 
                        alt={photo.title}
                        className="relative z-10 w-full h-full object-contain transition-transform duration-700 group-hover:scale-[1.01] pointer-events-none select-none"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/20 transition-all duration-300 z-20 pointer-events-none" />
                      
                      {/* Interactive hover eye focus */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100 z-30">
                        <span className="bg-white/95 text-slate-950 px-4 py-2 rounded-full font-mono text-[10px] uppercase font-bold tracking-widest shadow-md flex items-center gap-1.5 border border-slate-200">
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span>View Chronicle</span>
                        </span>
                      </div>

                      {/* Location pill */}
                      <span className="absolute bottom-3 left-3 bg-slate-950/80 text-white font-mono text-[8px] sm:text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0 z-30">
                        <MapPin className="w-2.5 h-2.5 text-blue-400" />
                        <span>{photo.location}</span>
                      </span>
                    </div>

                    <div className="p-5 space-y-2">
                      <span className="text-[9px] text-slate-400 font-mono block uppercase tracking-wider">{photo.date}</span>
                      <h3 className="font-serif font-black text-slate-950 text-base group-hover:text-blue-600 transition-colors line-clamp-1">{photo.title}</h3>
                      <p className="text-xs text-slate-600 font-sans leading-relaxed line-clamp-2 whitespace-pre-wrap">{photo.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}

          </div>
        </section>


        {/* SECTION 6: DAILY LIFE GALLERY (গ্যালারি) WITH INTERACTIVE LIKES, DISLIKES, AND REVIEWS */}
        <section id="gallery" className="py-16 sm:py-24 bg-white border-b border-slate-200/80 text-slate-900">
          <div className="max-w-7xl mx-auto px-6">
            
            <div className="text-center space-y-4 max-w-xl mx-auto mb-16">
              <span className="text-[10px] font-mono tracking-widest text-[#2563eb] uppercase font-black block">VISUAL LIFE LOGGER</span>
              <h2 className="text-3xl sm:text-4xl font-serif font-black text-slate-950 tracking-tight">Daily Life Gallery</h2>
              <div className="h-0.5 w-12 bg-slate-300 mx-auto" />
              <p className="text-xs sm:text-sm text-slate-500 font-sans">
                A visual window into travel highlights, creative design snippets, and workspace compositions. Leave feedback or vote on items live!
              </p>
            </div>

            {galleryItems.length === 0 ? (
              <div className="p-12 border border-dashed rounded-3xl text-center text-slate-400 italic font-mono bg-slate-50/50 max-w-4xl mx-auto">
                No gallery snapshots recorded yet. Log into the BO Console using administrative parameters to configure and upload photos!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {galleryItems.map((item) => (
                  <article key={item.id} className="bg-[#FAF9F5]/45 border border-slate-200/70 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      {/* Interactive responsive cover */}
                      <div className="relative group w-full h-[260px] bg-slate-100 overflow-hidden border-b border-slate-100">
                        <ItemImageCarousel 
                          images={item.images}
                          fallbackUrl={item.imageUrl}
                          altText={`${profileDetails.name || "Candidate"} Life snapshot`}
                          imageClassName="w-full h-full object-cover transition-transform duration-75 hover:scale-[1.01]"
                        />
                        <div className="absolute top-3 left-3 bg-slate-950/80 text-[8px] font-mono tracking-wider uppercase text-slate-200 px-2.5 py-1 rounded-full border border-white/5 z-10 pointer-events-none">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, {month: 'short', year: 'numeric'}) : 'Daily Snap'}
                        </div>
                      </div>

                      <div className="p-5 space-y-4">
                        <p className="text-sm text-slate-705 leading-relaxed text-slate-700 min-h-[50px]">
                          {item.description || 'No description recorded.'}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-slate-200/60 bg-white">
                      {/* Voting and Comment panel trigger actions */}
                      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => handleGalleryVote(item.id, 'like')}
                            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all focus:outline-none cursor-pointer border ${
                              userVotes[item.id] === 'like'
                                ? 'bg-rose-600 text-white border-rose-600 shadow-xs hover:bg-rose-700'
                                : 'bg-rose-50/50 hover:bg-rose-50 text-rose-600 border-rose-100'
                            }`}
                            title="Love photo"
                          >
                            <Heart className={`w-3.5 h-3.5 ${userVotes[item.id] === 'like' ? 'text-white fill-white' : 'text-rose-500 fill-rose-50'}`} />
                            <span>{item.likes}</span>
                          </button>

                          <button
                            onClick={() => handleGalleryVote(item.id, 'dislike')}
                            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all focus:outline-none cursor-pointer border ${
                              userVotes[item.id] === 'dislike'
                                ? 'bg-slate-750 text-white border-slate-750 shadow-xs hover:bg-slate-850'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200/60'
                            }`}
                            title="Dislike / Skip"
                          >
                            <ThumbsDown className={`w-3.5 h-3.5 ${userVotes[item.id] === 'dislike' ? 'text-white' : 'text-slate-400'}`} />
                            <span>{item.dislikes}</span>
                          </button>
                        </div>

                        <button
                          onClick={() => setExpandedGalleryComments(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-mono text-xs font-bold focus:outline-none cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{item.comments?.length || 0} Comments</span>
                        </button>
                      </div>

                      {/* Comments Drawer panel wrapper */}
                      {expandedGalleryComments[item.id] && (
                        <div className="p-5 bg-[#FAF9F5]/70 border-t border-slate-150 space-y-4 text-left font-sans animate-fadeIn">
                          
                          {/* Comments List Queue */}
                          <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                            {(!item.comments || item.comments.length === 0) ? (
                              <p className="text-slate-400 font-mono text-[10px] italic">Be the first to comment on this photo!</p>
                            ) : (
                              item.comments.map((comm, idx) => (
                                <RecursiveCommentNode
                                  key={comm.id || `cmt-${idx}`}
                                  comment={comm}
                                  postId={item.id}
                                  onReplySubmit={(parentId, name, email, message) => 
                                    handleGalleryReplySubmit(item.id, parentId, name, email, message)
                                  }
                                  replyingToId={replyingToId}
                                  setReplyingToId={setReplyingToId}
                                />
                              ))
                            )}
                          </div>

                          {/* Interactive comments submission form in Facebook Style */}
                          <form onSubmit={(e) => handleGalleryComment(e, item.id)} className="space-y-3 pt-3 border-t border-slate-200/60 font-sans">
                            {/* Small Credentials Input row if name or email isn't set yet */}
                            <div className="flex flex-col sm:flex-row gap-2">
                              <div className="relative flex-1">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
                                  <User className="w-3.5 h-3.5" />
                                </span>
                                <input 
                                  type="text"
                                  required
                                  placeholder="Your Name"
                                  value={galleryCommentInputs[item.id]?.name !== undefined ? galleryCommentInputs[item.id].name : (localStorage.getItem("fb_commenter_name") || '')}
                                  onChange={e => setGalleryCommentInputs(prev => ({
                                    ...prev,
                                    [item.id]: { ...(prev[item.id] || { name: '', email: '', message: '' }), name: e.target.value }
                                  }))}
                                  className="w-full pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border focus:border-slate-300 focus:bg-white text-xs rounded-full focus:ring-1 focus:ring-blue-500 text-slate-800 focus:outline-none placeholder-slate-400 font-sans"
                                />
                              </div>
                              <div className="relative flex-1">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
                                  <Mail className="w-3.5 h-3.5" />
                                </span>
                                <input 
                                  type="email"
                                  required
                                  placeholder="Your Email"
                                  value={galleryCommentInputs[item.id]?.email !== undefined ? galleryCommentInputs[item.id].email : (localStorage.getItem("fb_commenter_email") || '')}
                                  onChange={e => setGalleryCommentInputs(prev => ({
                                    ...prev,
                                    [item.id]: { ...(prev[item.id] || { name: '', email: '', message: '' }), email: e.target.value }
                                  }))}
                                  className="w-full pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border focus:border-slate-300 focus:bg-white text-xs rounded-full focus:ring-1 focus:ring-blue-500 text-slate-800 focus:outline-none placeholder-slate-400 font-sans"
                                />
                              </div>
                            </div>

                            {/* Main Facebook style comment bar */}
                            <div className="flex gap-2 items-start pt-1">
                              {/* Standard Local avatar */}
                              <div className={`w-8 h-8 rounded-full ${getFacebookAvatarColor(galleryCommentInputs[item.id]?.name || localStorage.getItem("fb_commenter_name") || "G")} border border-slate-200/50 flex items-center justify-center font-bold text-xs shrink-0 select-none uppercase`}>
                                {(galleryCommentInputs[item.id]?.name || localStorage.getItem("fb_commenter_name") || "G")[0]}
                              </div>
                              <div className="flex-1 relative bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/50 flex items-center pr-3 py-1 focus-within:bg-white focus-within:ring-1 focus-within:ring-blue-500">
                                <textarea
                                  rows={1}
                                  required
                                  placeholder="Write a comment..."
                                  value={galleryCommentInputs[item.id]?.message || ''}
                                  onChange={e => setGalleryCommentInputs(prev => ({
                                    ...prev,
                                      [item.id]: { ...(prev[item.id] || { name: '', email: '', message: '' }), message: e.target.value }
                                  }))}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleGalleryComment(e as any, item.id);
                                    }
                                  }}
                                  className="w-full bg-transparent px-3 py-1 text-xs text-slate-800 focus:outline-none resize-none placeholder-slate-400 font-sans pr-8 leading-normal min-h-[28px] max-h-[120px]"
                                />
                                <button
                                  type="submit"
                                  className="absolute right-2.5 text-blue-600 hover:text-blue-800 transition-colors p-1 hover:bg-slate-200/50 rounded-full cursor-pointer"
                                  title="Post Comment"
                                >
                                  <Send className="w-3.5 h-3.5 fill-blue-100 text-blue-600" />
                                </button>
                              </div>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Testimonials recommendation timeline below */}
            <div className="mt-16 pt-16 border-t border-slate-200/80">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                
                {/* Left Column: Registering a testimony */}
                <div className="lg:col-span-5 text-left space-y-6">
                  <span className="text-[10px] font-mono tracking-widest text-blue-600 uppercase font-black block">TESTIMONIALS MODERATION</span>
                  <h3 className="text-2xl sm:text-3xl font-serif font-black text-slate-950 tracking-tight leading-none">Recommendation Engine</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                    Leave a review if we have worked on database configurations, Supabase API setups, or Photoshop composition layouts together. It will instantly pop into our Back Office Queue waiting for administrator authorization keys.
                  </p>

                  <div className="bg-slate-50 border rounded-2xl p-40 p-5 shadow-xs border-slate-205 flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">Total Unique Visitors</span>
                    <p className="text-xl font-mono font-bold text-slate-950">{liveCounter.toLocaleString()}</p>
                  </div>

                  {/* Submission box */}
                  <form onSubmit={handleSubmitTestimony} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 text-xs font-mono">
                    {testimonySubmitted ? (
                      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center text-emerald-800 space-y-2">
                        <Check className="w-5 h-5 text-emerald-650 mx-auto" />
                        <p className="font-bold">Testimonial registered!</p>
                        <p className="text-[10px]">Your feedback is securely loaded on the back office queue. Authorize it inside the BO console using your administrative credentials.</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-3.5 text-left">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Your Name *</label>
                            <input 
                              type="text" 
                              required
                              placeholder="e.g. Dr. Fauzi"
                              value={newTestimony.name}
                              onChange={e => setNewTestimony(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full bg-[#FAF9F5]/45 border rounded-lg p-2 focus:outline-none focus:border-blue-500 text-slate-850"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Title / Institution *</label>
                            <input 
                              type="text" 
                              required
                              placeholder="e.g. Lecturer"
                              value={newTestimony.role}
                              onChange={e => setNewTestimony(prev => ({ ...prev, role: e.target.value }))}
                              className="w-full bg-[#FAF9F5]/45 border rounded-lg p-2 focus:outline-none focus:border-blue-500 text-slate-850"
                            />
                          </div>
                        </div>

                        <div className="space-y-1 text-left">
                          <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Company / Affiliation</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Geomatika University"
                            value={newTestimony.company}
                            onChange={e => setNewTestimony(prev => ({ ...prev, company: e.target.value }))}
                            className="w-full bg-[#FAF9F5]/45 border border-slate-200 rounded-lg p-2 focus:outline-none text-slate-850"
                          />
                        </div>

                        <div className="space-y-1 text-left">
                          <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Review message *</label>
                          <textarea 
                            rows={3}
                            required
                            placeholder="Write technical rating reviews..."
                            value={newTestimony.message}
                            onChange={e => setNewTestimony(prev => ({ ...prev, message: e.target.value }))}
                            className="w-full bg-[#FAF9F5]/45 border border-slate-200 rounded-lg p-2 focus:outline-none font-sans text-slate-850"
                          />
                        </div>

                        <button 
                          type="submit" 
                          className="w-full bg-blue-600 hover:bg-slate-900 text-white font-bold py-2.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Queue Recommendation</span>
                        </button>
                      </>
                    )}
                  </form>
                </div>

                {/* Right Column: Approved quotes */}
                <div className="lg:col-span-7 space-y-6 text-left">
                  <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-black block">ENDORSEMENTS TIMELINE</span>
                  <h4 className="text-lg font-serif font-black text-slate-900 uppercase">Live Testimonials ({approvedTestimonials.length})</h4>
                  
                  {approvedTestimonials.length === 0 ? (
                    <p className="font-mono text-xs text-slate-400 italic">No approved testimonials yet. Open BO Console and write or approve recommendations logs!</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-sans">
                      {approvedTestimonials.map(t => (
                        <div key={t.id} className="bg-[#FAF9F5]/45 border rounded-2xl p-5 hover:p-6 transition-all shadow-xs flex flex-col justify-between">
                          <p className="text-xs sm:text-sm italic text-slate-700 leading-relaxed whitespace-pre-wrap">"{t.message}"</p>
                          <div className="mt-4 pt-4 border-t border-slate-205 flex items-center gap-3">
                            <div className="bg-blue-50 border text-blue-600 font-black rounded-full w-8 h-8 flex items-center justify-center text-xs shrink-0 select-none">
                              {t.name[0]}
                            </div>
                            <div className="min-w-0">
                              <h5 className="font-bold text-xs text-slate-900 truncate leading-tight">{t.name}</h5>
                              <p className="text-[8.5px] font-mono uppercase tracking-wider text-slate-400 truncate leading-none mt-1">{t.role} {t.company ? `— ${t.company}` : ''}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        </section>
        </div>
        )}


        {/* SECTION 9: WRITINGS BLOG OPTION (ব্লগ) — TECHNOLOGY & BUSINESS INSIGHTS */}
        {currentView === 'blogs' && (
          <div className="animate-fade-in">
            <section id="blogs" className="py-16 sm:py-24 bg-[#FAF9F5] border-b border-slate-200/80 text-slate-900">
          <div className="max-w-7xl mx-auto px-6">
            
            <div className="text-center space-y-4 max-w-xl mx-auto mb-16">
              <span className="text-[10px] font-mono tracking-widest text-[#2563eb] uppercase font-black block">
                {profileDetails.blogSectionTagline || "THE INTELLECTUAL INK"}
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-black text-slate-950 tracking-tight">
                {profileDetails.blogSectionTitle || "Writing Blogs"}
              </h2>
              <div className="h-0.5 w-12 bg-slate-300 mx-auto" />
              <p className="text-xs sm:text-sm text-slate-500 font-sans">
                {profileDetails.blogSectionDescription || "My writings on software architectures, database security, Photoshop layouts, and student experiences. Support my words by voting or leaving feedback!"}
              </p>
            </div>

            {blogs.length === 0 ? (
              <div className="p-12 border border-dashed rounded-3xl text-center text-slate-400 italic font-mono bg-white shadow-sm max-w-4xl mx-auto">
                No blog articles published yet. Authenticate inside the secure BO Console for active administrative content creation!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
                {blogs.map((blog) => (
                  <article key={blog.id} className="bg-white border text-left border-slate-200/70 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      {/* Responsive image banner */}
                      {(blog.imageUrl || (blog.images && blog.images.length > 0)) && (
                        <div className="w-full h-48 sm:h-56 bg-slate-100 overflow-hidden border-b border-slate-100 relative">
                          <ItemImageCarousel 
                            images={blog.images}
                            fallbackUrl={blog.imageUrl || ''}
                            altText={blog.title}
                            imageClassName="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                          />
                        </div>
                      )}
                      
                      <div className="p-6 sm:p-8 space-y-4">
                        <div className="flex items-center gap-3">
                          <span className="bg-blue-50 text-blue-600 font-mono text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full border border-blue-100">
                            {blog.category || 'Technology'}
                          </span>
                          <span className="text-slate-400 text-[10px] font-mono">
                            {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString(undefined, {day: 'numeric', month: 'short', year: 'numeric'}) : 'Article Log'}
                          </span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-serif font-black text-slate-950 leading-snug">
                          {blog.title}
                        </h3>

                        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-sans font-normal whitespace-pre-wrap">
                          {blog.excerpt || 'Read the analytical details of this document inside.'}
                        </p>

                        {/* Expandable main article body */}
                        {expandedBlogs[blog.id] && (
                          <div className="pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans space-y-4 whitespace-pre-wrap animate-fadeIn">
                            {blog.content}
                          </div>
                        )}

                        <button
                          onClick={() => setExpandedBlogs(prev => ({ ...prev, [blog.id]: !prev[blog.id] }))}
                          className="text-xs font-mono font-bold text-slate-900 hover:text-blue-600 flex items-center gap-1 focus:outline-none cursor-pointer"
                        >
                          <span>{expandedBlogs[blog.id] ? 'COLLAPSE TEXT' : 'READ FULL ARTICLE'}</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedBlogs[blog.id] ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 bg-slate-50/50">
                      {/* Voting triggers and comments list trigger */}
                      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-205">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleBlogVote(blog.id, 'like')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all focus:outline-none cursor-pointer shadow-2xs border ${
                              userVotes[blog.id] === 'like'
                                ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                                : 'bg-white hover:bg-emerald-50 text-emerald-600 border-slate-200 hover:border-emerald-200'
                            }`}
                            title="I like this writer"
                          >
                            <span className={userVotes[blog.id] === 'like' ? '' : 'text-emerald-500'}>👍</span>
                            <span>{blog.likes}</span>
                          </button>

                          <button
                            onClick={() => handleBlogVote(blog.id, 'dislike')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all focus:outline-none cursor-pointer shadow-2xs border ${
                              userVotes[blog.id] === 'dislike'
                                ? 'bg-rose-600 text-white border-rose-600 hover:bg-rose-700'
                                : 'bg-white hover:bg-rose-50/50 text-rose-600 border-slate-200 hover:border-rose-100'
                            }`}
                            title="I dislike this topic"
                          >
                            <span className={userVotes[blog.id] === 'dislike' ? '' : 'text-rose-505'}>👎</span>
                            <span>{blog.dislikes}</span>
                          </button>
                        </div>

                        <button
                          onClick={() => setExpandedBlogComments(prev => ({ ...prev, [blog.id]: !prev[blog.id] }))}
                          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-mono text-xs font-extrabold focus:outline-none cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                          <span>Show Comments ({blog.comments?.length || 0})</span>
                        </button>
                      </div>

                      {/* Blog comments wrapper */}
                      {expandedBlogComments[blog.id] && (
                        <div className="p-6 bg-slate-50/50 border-t border-slate-200/80 space-y-4 text-left font-sans animate-fadeIn">
                          
                          {/* List comments */}
                          <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                            {(!blog.comments || blog.comments.length === 0) ? (
                              <p className="text-slate-400 font-mono text-[11px] italic">No reviews registered. Be the first to express opinion under this blog!</p>
                            ) : (
                              blog.comments.map((comm, idx) => (
                                <RecursiveCommentNode
                                  key={comm.id || `cmt-${idx}`}
                                  comment={comm}
                                  postId={blog.id}
                                  onReplySubmit={(parentId, name, email, message) =>
                                    handleBlogReplySubmit(blog.id, parentId, name, email, message)
                                  }
                                  replyingToId={replyingToId}
                                  setReplyingToId={setReplyingToId}
                                />
                              ))
                            )}
                          </div>

                          {/* Interactive comments submission form in Facebook Style */}
                          <form onSubmit={(e) => handleBlogComment(e, blog.id)} className="space-y-3 pt-4 border-t border-slate-200">
                            {/* Small Credentials Input row if name or email isn't set yet */}
                            <div className="flex flex-col sm:flex-row gap-2.5">
                              <div className="relative flex-1">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                  <User className="w-3.5 h-3.5" />
                                </span>
                                <input 
                                  type="text"
                                  required
                                  placeholder="Your Name"
                                  value={blogCommentInputs[blog.id]?.name !== undefined ? blogCommentInputs[blog.id].name : (localStorage.getItem("fb_commenter_name") || '')}
                                  onChange={e => setBlogCommentInputs(prev => ({
                                    ...prev,
                                    [blog.id]: { ...(prev[blog.id] || { name: '', email: '', message: '' }), name: e.target.value }
                                  }))}
                                  className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border focus:border-slate-300 focus:bg-white text-xs rounded-full focus:ring-1 focus:ring-blue-500 text-slate-800 focus:outline-none placeholder-slate-400 font-sans"
                                />
                              </div>
                              <div className="relative flex-1">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                  <Mail className="w-3.5 h-3.5" />
                                </span>
                                <input 
                                  type="email"
                                  required
                                  placeholder="Your Email"
                                  value={blogCommentInputs[blog.id]?.email !== undefined ? blogCommentInputs[blog.id].email : (localStorage.getItem("fb_commenter_email") || '')}
                                  onChange={e => setBlogCommentInputs(prev => ({
                                    ...prev,
                                    [blog.id]: { ...(prev[blog.id] || { name: '', email: '', message: '' }), email: e.target.value }
                                  }))}
                                  className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border focus:border-slate-300 focus:bg-white text-xs rounded-full focus:ring-1 focus:ring-blue-500 text-slate-800 focus:outline-none placeholder-slate-400 font-sans"
                                />
                              </div>
                            </div>

                            {/* Main Facebook style comment bar */}
                            <div className="flex gap-2 items-start pt-1">
                              {/* Standard Local avatar */}
                              <div className={`w-8 h-8 rounded-full ${getFacebookAvatarColor(blogCommentInputs[blog.id]?.name || localStorage.getItem("fb_commenter_name") || "G")} border border-slate-200/50 flex items-center justify-center font-bold text-xs shrink-0 select-none uppercase`}>
                                {(blogCommentInputs[blog.id]?.name || localStorage.getItem("fb_commenter_name") || "G")[0]}
                              </div>
                              <div className="flex-1 relative bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/50 flex items-center pr-3 py-1 bg-slate-100 focus-within:bg-white focus-within:ring-1 focus-within:ring-blue-500">
                                <textarea
                                  rows={1}
                                  required
                                  placeholder="Write a comment..."
                                  value={blogCommentInputs[blog.id]?.message || ''}
                                  onChange={e => setBlogCommentInputs(prev => ({
                                    ...prev,
                                      [blog.id]: { ...(prev[blog.id] || { name: '', email: '', message: '' }), message: e.target.value }
                                  }))}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleBlogComment(e as any, blog.id);
                                    }
                                  }}
                                  className="w-full bg-transparent px-3 py-1 text-xs text-slate-800 focus:outline-none resize-none placeholder-slate-400 font-sans pr-8 leading-normal min-h-[28px] max-h-[120px]"
                                />
                                <button
                                  type="submit"
                                  className="absolute right-2.5 text-blue-600 hover:text-blue-800 transition-colors p-1 hover:bg-slate-200/50 rounded-full cursor-pointer"
                                  title="Post Comment"
                                >
                                  <Send className="w-3.5 h-3.5 fill-blue-100 text-blue-600" />
                                </button>
                              </div>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}

          </div>
        </section>
        </div>
        )}


        {/* SECTION 7: HYBRID ACTION SECTION (CV DOWNLOAD & NEWSLETTER) */}
        {currentView === 'contact' && (
          <div className="animate-fade-in">
            <section id="newsletter" className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
              <div className="max-w-6xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  
                  {/* Left Column: Context / Branding */}
                  <div className="lg:col-span-5 space-y-5 text-left">
                    <span id="stay-connected-tag" className="text-[10px] font-mono tracking-widest text-[#2563eb] uppercase font-black block">
                      STAY CONNECTED
                    </span>
                    <h2 id="hybrid-section-title" className="text-3xl sm:text-4xl font-serif font-black text-slate-950 tracking-tight leading-tight">
                      Let's Build the Future Together
                    </h2>
                    <p id="hybrid-section-subtext" className="text-xs sm:text-sm text-slate-500 font-sans leading-relaxed">
                      Download my latest CV for professional collaborations, or subscribe to get direct insights on my tech projects, business ventures, and upcoming life adventures.
                    </p>
                  </div>
                  
                  {/* Right Column: Interactive Hybrid Actions */}
                  <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* CV Download Card */}
                    <div id="cv-download-card" className="bg-[#FAF9F5] border border-slate-200/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs hover:border-blue-200 transition-all text-left">
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                          <FileText className="w-5 h-5" />
                        </div>
                        <h4 className="font-serif font-black text-lg text-slate-950 pt-2">Curriculum Vitae</h4>
                        <p className="text-[11px] text-slate-500 font-sans leading-normal">
                          Access my complete professional experience, certified skillsets, and academic credentials.
                        </p>
                      </div>
                      <a 
                        id="download-cv-btn"
                        href={profileDetails.cvDownloadUrl || "#"} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-slate-950 hover:bg-blue-600 text-white font-mono text-[11px] uppercase tracking-wider font-bold py-3.5 px-5 rounded-xl transition-all flex items-center justify-center gap-2 hover:shadow-md cursor-pointer text-center"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download CV PDF</span>
                      </a>
                    </div>
                    
                    {/* Newsletter Subscription Card */}
                    <div id="newsletter-subscription-card" className="bg-[#FAF9F5] border border-slate-200/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs hover:border-blue-200 transition-all text-left">
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                          <MailCheck className="w-5 h-5" />
                        </div>
                        <h4 className="font-serif font-black text-lg text-slate-950 pt-2">Journey Newsletter</h4>
                        <p className="text-[11px] text-slate-500 font-sans leading-normal">
                          Get occasional, customized updates regarding tech research and life milestones straight to your inbox.
                        </p>
                      </div>
                      
                      <form onSubmit={handleSubscribe} className="space-y-3">
                        {newsletterSubscribed ? (
                          <div className="w-full bg-emerald-50 border border-emerald-100 text-emerald-800 p-2 py-3 rounded-xl text-[10.5px] font-mono font-bold flex items-center justify-center gap-2 text-center">
                            <span>Success! Registered!</span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <input 
                              id="newsletter-email-input"
                              type="email" 
                              required
                              placeholder="Your professional email"
                              value={newsletterEmail}
                              onChange={e => setNewsletterEmail(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-[11px] focus:outline-none focus:border-blue-500 text-slate-900 font-sans"
                            />
                            <button 
                              id="newsletter-submit-btn"
                              type="submit" 
                              className="w-full bg-slate-900 hover:bg-blue-600 text-white font-mono text-[11px] uppercase tracking-wider font-bold py-3.5 px-5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                            >
                              <span>Subscribe</span>
                              <SendHorizontal className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </form>
                    </div>
                  </div>

                </div>
              </div>
            </section>


        {/* SECTION 8: DETAILED CONTACT METHOD BLOCK */}
        <section id="contact" className="py-16 sm:py-24 bg-[#FAF9F5] text-slate-900">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-white border rounded-3xl p-8 sm:p-12 border-slate-200 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
              
              {/* Left Column (Coordinates & Direct Social Anchors) */}
              <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
                <div className="space-y-6">
                  <span className="text-[10px] font-mono tracking-widest text-[#2563eb] uppercase font-black block">OFFICIAL CORRESPONDENCE</span>
                  <h3 className="text-3xl font-serif font-black text-slate-950 tracking-tight leading-none text-left">Connect with {profileDetails.name || "Us"}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans font-normal text-left">
                    Whether discussing backend application frameworks, software engineering challenges, creative photography layers, or coordinating admission guidelines, please transmit a message or utilize the networks listed below.
                  </p>

                  <div className="space-y-4 font-mono text-xs text-slate-700">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <Globe className="w-3.5 h-3.5" />
                      </span>
                      <span>Primary WhatsApp: <strong className="text-slate-950">{profileDetails.whatsapp || "+880 1339-654727"}</strong></span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <Mail className="w-3.5 h-3.5" />
                      </span>
                      <span>Primary Email: <strong className="text-slate-950">{profileDetails.email || "samiurrahamanrejvi@gmail.com"}</strong></span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <MapPin className="w-3.5 h-3.5" />
                      </span>
                      <span>Coordinates: {profileDetails.universityName ? `${profileDetails.universityName}, Kuala Lumpur` : "Kuala Lumpur, Malaysia"}</span>
                    </div>
                  </div>
                </div>

                {/* Direct links panel */}
                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <h4 className="text-[10px] font-extrabold font-mono text-slate-400 uppercase tracking-widest text-left">Active Net Coordinates</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* GitHub Connection Card */}
                    <a 
                      href="https://github.com/srrejvi2002" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="bg-slate-50 hover:bg-slate-900 group/git p-4 rounded-2xl border border-slate-200/80 flex flex-col justify-between gap-3 transition-all duration-300 shadow-2xs hover:shadow-md hover:-translate-y-0.5 text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <div className="flex items-start justify-between">
                        <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 group-hover/git:bg-blue-600 transition-colors">
                          git
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover/git:text-blue-500 transition-colors" />
                      </div>
                      <div>
                        <h4 className="font-serif font-black text-slate-950 group-hover/git:text-white text-xs tracking-tight">GitHub Developer Hub</h4>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="text-[9px] font-mono text-slate-500 group-hover/git:text-slate-400 uppercase tracking-wider">
                            {stats?.github || 114} stargazers & reps
                          </span>
                        </div>
                      </div>
                    </a>

                    {/* Facebook Connection Card */}
                    <a 
                      href="https://www.facebook.com/srrejvi2002" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="bg-slate-50 hover:bg-slate-900 group/fb p-4 rounded-2xl border border-slate-200/80 flex flex-col justify-between gap-3 transition-all duration-300 shadow-2xs hover:shadow-md hover:-translate-y-0.5 text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <div className="flex items-start justify-between">
                        <span className="w-8 h-8 rounded-xl bg-blue-650 bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          f
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover/fb:text-blue-500 transition-colors" />
                      </div>
                      <div>
                        <h4 className="font-serif font-black text-slate-950 group-hover/fb:text-white text-xs tracking-tight">Facebook Profile Connection</h4>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <span className="text-[9px] font-mono text-slate-500 group-hover/fb:text-slate-400 uppercase tracking-wider">
                            {stats?.facebook?.toLocaleString() || "3,420"} active followers
                          </span>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Column (Dynamic Inquiry Message Form) */}
              <div className="lg:col-span-7 bg-slate-50 border border-slate-200/70 rounded-2xl p-6 sm:p-8 space-y-4 text-left">
                <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-black block text-left">INBOX TRANSMISSION</span>
                <h4 className="text-lg font-serif font-black text-slate-950 text-left">Send a Secure Message</h4>
                
                <form onSubmit={handleContactSubmit} className="space-y-4 text-xs font-mono">
                  {contactSubmitted ? (
                    <div className="bg-emerald-50 border border-emerald-250 p-6 rounded-xl text-center space-y-3 font-mono animate-fadeIn">
                      <Check className="w-7 h-7 text-emerald-600 mx-auto" />
                      <p className="font-bold text-emerald-950 uppercase tracking-wide text-xs">Transmission Dispatched!</p>
                      <p className="text-[10.5px] text-emerald-700 leading-relaxed font-sans normal-case font-normal text-center">
                        Thank you for your contact query. Your letter has been securely queued inside the Back Office message pool. {profileDetails.name || "The candidate"} will review it shortly.
                      </p>
                    </div>
                  ) : (
                    <>
                      {contactError && (
                        <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-left text-rose-700 text-[10px] leading-relaxed font-normal">
                          ⚠️ {contactError}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 text-left">
                          <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Your Name *</label>
                          <input 
                            type="text"
                            required
                            placeholder="e.g. Professor Smith"
                            value={contactForm.name}
                            onChange={e => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-white border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500 text-slate-900 font-sans font-normal"
                          />
                        </div>
                        <div className="space-y-1.5 text-left">
                          <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Email Address *</label>
                          <input 
                            type="email"
                            required
                            placeholder="e.g. smith@university.edu"
                            value={contactForm.email}
                            onChange={e => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full bg-white border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500 text-slate-900 font-sans font-normal"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Subject Option</label>
                        <input 
                          type="text"
                          placeholder="e.g. Master's Studies 2027 / LinkVerse Collaboration"
                          value={contactForm.subject}
                          onChange={e => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                          className="w-full bg-white border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500 text-slate-900 font-sans font-normal"
                        />
                      </div>

                      <div className="space-y-1.5 text-left font-mono">
                        <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Inquiry Message *</label>
                        <textarea 
                          rows={4}
                          required
                          placeholder="Write key parameters, collaboration queries, or references... *"
                          value={contactForm.message}
                          onChange={e => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                          className="w-full bg-white border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500 font-sans text-slate-850 text-xs text-slate-905 font-normal"
                        />
                      </div>

                      <button 
                        type="submit"
                        disabled={contactSubmitting}
                        className="w-full bg-slate-900 hover:bg-blue-600 disabled:bg-slate-450 text-white font-bold py-3 rounded-xl uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none"
                      >
                        {contactSubmitting ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Transmitting...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Dispatch Letter</span>
                          </>
                        )}
                      </button>
                    </>
                  )}
                </form>
              </div>

            </div>
          </div>
        </section>

        {/* ACADEMIC HISTORY & EDUCATIONAL INSTITUTIONS */}
        <section className="py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 space-y-12">
            <div className="text-center sm:text-left space-y-3 max-w-2xl">
              <span className="text-[10px] font-mono tracking-widest text-[#2563eb] uppercase font-black block">VERIFICATION OF INSTITUTIONAL PEDIGREE</span>
              <h3 className="text-3xl font-serif font-black text-slate-950 tracking-tight text-left">Academic Credentials & History</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-sans font-normal text-left">
                Verified educational hubs, universities, and schools that shaped {profileDetails.name || "Samiur"}'s systemic programming principles and mathematical frameworks. Click on any link to review primary institutional domains.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              {/* Card 1: Geomatika University Malaysia */}
              <div className="bg-[#FAF9F5]/50 hover:bg-[#FAF9F5] border border-slate-200 hover:border-slate-350 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between group shadow-2xs hover:shadow-md">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[8.5px] font-mono tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 font-bold px-2 py-0.5 rounded-full uppercase">
                      ● Active University
                    </span>
                    <Award className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h4 className="text-base font-serif font-black text-slate-950 group-hover:text-blue-600 transition-colors">{profileDetails.universityName || "Geomatika University"}</h4>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mt-1">Kuala Lumpur, Malaysia</span>
                  </div>
                  <p className="text-xs text-slate-600 font-sans leading-relaxed pt-1">
                    Pursuing a <strong>Bachelor of Science in Computer Science (BSCS)</strong>. Specializing in transaction speed, database indices, and clean Node.js backends.
                  </p>
                </div>
                <div className="pt-5 border-t border-slate-100 mt-5 flex items-center justify-between">
                  <span className="text-[9.5px] font-mono text-slate-500">Graduating: Late 2026</span>
                  {profileDetails.universityLink && (
                    <a 
                      href={profileDetails.universityLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[10.5px] font-mono text-blue-600 font-bold hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Card 2: Charles University Prague */}
              <div className="bg-[#FAF9F5]/50 hover:bg-[#FAF9F5] border border-slate-200 hover:border-slate-355 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between group shadow-2xs hover:shadow-md">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[8.5px] font-mono tracking-wider text-blue-600 bg-blue-50 border border-blue-100 font-bold px-2 py-0.5 rounded-full uppercase">
                      ● Future transition
                    </span>
                    <Sparkles className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h4 className="text-base font-serif font-black text-slate-950 group-hover:text-blue-600 transition-colors">{profileDetails.targetMasterUni || "Charles University"}</h4>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mt-1">Prague, Czech Republic</span>
                  </div>
                  <p className="text-xs text-slate-600 font-sans leading-relaxed pt-1">
                    Targeting a research oriented <strong>Master’s in Computer Science & Machine Learning (MSc)</strong>. Planning algorithms optimization and advanced systems.
                  </p>
                </div>
                <div className="pt-5 border-t border-slate-100 mt-5 flex items-center justify-between">
                  <span className="text-[9.5px] font-mono text-slate-500">Timeline: Starts 2027</span>
                  {profileDetails.targetMasterLink && (
                    <a 
                      href={profileDetails.targetMasterLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[10.5px] font-mono text-blue-600 font-bold hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Card 3: Dhaka College Bangladesh */}
              <div className="bg-[#FAF9F5]/50 hover:bg-[#FAF9F5] border border-slate-200 hover:border-slate-355 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between group shadow-2xs hover:shadow-md">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[8.5px] font-mono tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 font-bold px-2 py-0.5 rounded-full uppercase">
                      ● Graduated College
                    </span>
                    <BookOpen className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h4 className="text-base font-serif font-black text-slate-950 group-hover:text-blue-600 transition-colors">{profileDetails.collegeName || "Dhaka College"}</h4>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mt-1">Dhaka, Bangladesh</span>
                  </div>
                  <p className="text-xs text-slate-600 font-sans leading-relaxed pt-1">
                    Completed <strong>Higher Secondary School Certificate (HSC)</strong> in Science with distinctions. Extensive analytic training in mathematics and physics.
                  </p>
                </div>
                <div className="pt-5 border-t border-slate-100 mt-5 flex items-center justify-between">
                  <span className="text-[9.5px] font-mono text-slate-500">Session: 2019 - 2021</span>
                  {profileDetails.collegeLink && (
                    <a 
                      href={profileDetails.collegeLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[10.5px] font-mono text-blue-600 font-bold hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Card 4: Motijheel Government Boys' High School */}
              <div className="bg-[#FAF9F5]/50 hover:bg-[#FAF9F5] border border-slate-200 hover:border-slate-355 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between group shadow-2xs hover:shadow-md">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[8.5px] font-mono tracking-wider text-amber-800 bg-amber-50 border border-amber-100 font-bold px-2 py-0.5 rounded-full uppercase">
                      ● Completed School
                    </span>
                    <Calendar className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h4 className="text-base font-serif font-black text-slate-950 group-hover:text-blue-600 transition-colors">{profileDetails.highSchoolName || "Motijheel Gov Boys"}</h4>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mt-1">Dhaka, Bangladesh</span>
                  </div>
                  <p className="text-xs text-slate-600 font-sans leading-relaxed pt-1">
                    Acquired <strong>Secondary School Certificate (SSC)</strong> in Science. Built crucial primary logical bases, algorithmic routines, and calculations.
                  </p>
                </div>
                <div className="pt-5 border-t border-slate-100 mt-5 flex items-center justify-between">
                  <span className="text-[9.5px] font-mono text-slate-500">Session: 2014 - 2019</span>
                  {profileDetails.highSchoolLink && (
                    <a 
                      href={profileDetails.highSchoolLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[10.5px] font-mono text-blue-600 font-bold hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
          </div>
        )}

      </main>

      {/* Editorial Footer Grid */}
      <footer className="bg-slate-950 text-slate-400 py-16 px-6 border-t border-slate-800 text-sm font-mono tracking-wider text-left">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Top Section of Footer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-10 border-b border-slate-800/60">
            {/* Bio info */}
            <div className="lg:col-span-5 space-y-4">
              <h4 className="text-white text-base font-serif font-black tracking-tight uppercase">{profileDetails.name || "Portfolio Owner"}</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-sans normal-case">
                {profileDetails.tagline || "Computer science study portfolios and creative composition visual galleries."} {profileDetails.universityName ? `Affiliated with ${profileDetails.universityName}.` : ""}
              </p>
            </div>

            {/* Quick Links Map */}
            <div className="lg:col-span-3 space-y-4">
              <h5 className="text-xs text-slate-300 font-extrabold uppercase font-mono tracking-widest">Sitemaps</h5>
              <div className="flex flex-col gap-2.5 text-[10px] uppercase font-bold text-slate-500">
                <button onClick={() => { setCurrentView('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-blue-400 font-bold transition-colors text-left focus:outline-none cursor-pointer">About {profileDetails.name || "Me"}</button>
                <button onClick={() => { setCurrentView('chronology'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-blue-400 font-bold transition-colors text-left focus:outline-none cursor-pointer">History & Chronology</button>
                <button onClick={() => { setCurrentView('projects'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-blue-400 font-bold transition-colors text-left focus:outline-none cursor-pointer">Creative Repo Projects</button>
                <button onClick={() => { setCurrentView('blogs'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-blue-400 font-bold transition-colors text-left focus:outline-none cursor-pointer">Insights Journal Blogs</button>
              </div>
            </div>
          </div>

          {/* Bottom section (Copyright & Social networks) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-3">
            <div className="text-center sm:text-left space-y-1.5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div>
                <p className="text-white text-xs font-bold uppercase tracking-widest">COPYRIGHT {profileDetails.name ? profileDetails.name.toUpperCase() : "PORTFOLIO OWNER"} @ 2026</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-[10px] text-slate-600">Handcrafted typography personal-archive. Highly modular and authenticated server pathways.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-5 items-center justify-center text-[10px] uppercase font-bold text-slate-500">
              {socialLinks && socialLinks.length > 0 ? (
                socialLinks.map((s, idx) => (
                  <React.Fragment key={s.id}>
                    {idx > 0 && <span className="text-slate-800">•</span>}
                    <a 
                      href={s.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:text-blue-400 transition-all flex items-center gap-1"
                    >
                      <span>{s.label || s.platform}</span>
                      <ArrowUpRight className="w-3" />
                    </a>
                  </React.Fragment>
                ))
              ) : (
                <>
                  <a 
                    href="https://www.facebook.com/srrejvi2002" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-blue-400 transition-all flex items-center gap-1"
                  >
                    <span>Facebook social</span>
                    <ArrowUpRight className="w-3 h-3 text-blue-500" />
                  </a>
                  <span className="text-slate-800">•</span>
                  <a 
                    href="https://github.com/srrejvi2002" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-blue-400 transition-all flex items-center gap-1"
                  >
                    <span>GitHub archive</span>
                    <ArrowUpRight className="w-3 h-3 text-blue-400" />
                  </a>
                </>
              )}
            </div>
          </div>

        </div>
      </footer>

      {/* SUB-MODAL 1: LIGHTBOX SYSTEM */}
      {lightboxIndex !== null && (
        <Lightbox 
          photo={photos[lightboxIndex]}
          onClose={() => setLightboxIndex(null)}
          onNext={handleNextLightbox}
          onPrev={handlePrevLightbox}
        />
      )}

      {/* SUB-MODAL 1.5: SECURE GEAR-COMBINATION SECURITY LOCK */}
      {isGatekeeperOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/95 backdrop-blur-lg z-50 flex items-center justify-center p-4 transition-all duration-300 pointer-events-auto"
          id="gatekeeper-overlay"
          onClick={e => {
            if ((e.target as HTMLElement).id === "gatekeeper-overlay") {
              setIsGatekeeperOpen(false);
              setGatekeeperError(null);
            }
          }}
        >
          <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl w-full max-w-md overflow-hidden text-slate-100 shadow-[0_0_50px_rgba(0,0,0,0.85)] text-left select-none relative animate-fade-in">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,119,6,0.06),transparent_50%)] pointer-events-none" />
            
            {/* Top decorative security beam */}
            <div className="h-1.5 bg-gradient-to-r from-amber-600 via-yellow-505 to-amber-600 animate-pulse" />
            
            <div className="px-6 py-5 border-b border-slate-800/80 flex justify-between items-center bg-slate-900/60 backdrop-blur-sm">
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <span className="text-[9px] font-mono tracking-widest text-amber-500 uppercase font-black">
                    Secured Back-Office Portal
                  </span>
                </div>
                <h3 className="text-base font-serif font-black tracking-tight text-white flex items-center gap-2">
                  <Lock className="w-4.5 h-4.5 text-amber-500" />
                  <span>3-Gear Mechanical Gatekeeper</span>
                </h3>
              </div>
              <button 
                onClick={() => {
                  setIsGatekeeperOpen(false);
                  setGatekeeperError(null);
                }}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer bg-slate-800 hover:bg-slate-700 p-2 rounded-full border border-slate-700/60 shadow-lg focus:outline-none"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              
              {/* Gear Lock Mechanism Display */}
              <div className="bg-slate-950/85 border border-slate-800/80 p-5 rounded-2xl flex flex-col items-center justify-center space-y-4 relative">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:14px_14px] pointer-events-none rounded-2xl" />
                
                <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase font-bold">
                  SIGHT ALIGNMENT BAR
                </span>

                {/* Dials row */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full py-4 relative z-10">
                  {gearValues.map((val, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      {/* Interactive Rotary Dial with Chrome Bezel */}
                      <div 
                        className="relative w-32 h-32 rounded-full p-[3px] bg-gradient-to-tr from-stone-500 via-stone-100 to-stone-600 shadow-[0_10px_25px_rgba(0,0,0,0.7)] flex items-center justify-center group select-none touch-none"
                        onWheel={e => handleGearWheel(e, idx)}
                        onPointerDown={e => handleGearPointerDown(e, idx)}
                        onPointerMove={handleGearPointerMove}
                        onPointerUp={handleGearPointerUp}
                        onPointerLeave={handleGearPointerUp}
                      >
                        {/* Inner gold frame highlights */}
                        <div className="absolute inset-0.5 rounded-full border border-stone-200/40 pointer-events-none" />
                        
                        {/* Red Indicator Mark (Pointer Decoupler) */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-4 bg-red-600 rounded-b-md z-30 shadow-[0_0_8px_rgba(239,68,68,0.8)] pointer-events-none" />
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-600 rotate-45 z-20 pointer-events-none" />

                        {/* Top Snap Button */}
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); rotateGear(idx, 'up'); }}
                          className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 p-1 rounded-full bg-slate-900 border border-slate-700/80 text-amber-500 hover:text-white hover:bg-slate-800 transition-all cursor-pointer shadow-md opacity-25 group-hover:opacity-100 focus:outline-none"
                          title="Turn Dial Clockwise"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>

                        {/* Base of black grip wheel (Rotated state) */}
                        <div 
                          className="w-[114px] h-[114px] rounded-full bg-gradient-to-b from-neutral-800 to-neutral-950 border-2 border-neutral-900 flex items-center justify-center select-none shadow-[inset_0_4px_10px_rgba(0,0,0,0.9),0_6px_12px_rgba(0,0,0,0.4)] relative cursor-ns-resize"
                          style={{ 
                            transform: `rotate(${-val * 3.6}deg)`, 
                            transition: dragGearIndex.current === idx ? 'none' : 'transform 250ms cubic-bezier(0.25, 1, 0.5, 1)'
                          }}
                        >
                          {/* Inner dial frame line */}
                          <div className="absolute inset-2.5 rounded-full border border-neutral-800 pointer-events-none" />

                          {/* Standard pad numbers at every 10 notches */}
                          {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map((num) => {
                            const angle = num * 3.6;
                            return (
                              <div
                                key={num}
                                className="absolute text-[8px] font-mono text-zinc-300 font-extrabold select-none pointer-events-none"
                                style={{
                                  transform: `rotate(${angle}deg) translateY(-36px)`,
                                  transformOrigin: 'center 0px',
                                  top: 'calc(50% - 4px)',
                                  left: 'calc(50% - 6px)',
                                  width: '12px',
                                  textAlign: 'center'
                                }}
                              >
                                {num}
                              </div>
                            );
                          })}

                          {/* Tick Marks around Dial (Every 5 units) */}
                          {Array.from({ length: 20 }).map((_, i) => {
                            const tickNum = i * 5;
                            const angle = tickNum * 3.6;
                            const isMajor = tickNum % 10 === 0;
                            return (
                              <div
                                key={`tick-${idx}-${tickNum}`}
                                className={`absolute origin-top ${isMajor ? 'h-2 w-[1.2px] bg-zinc-300' : 'h-1 w-[0.8px] bg-zinc-500'}`}
                                style={{
                                  transform: `rotate(${angle}deg) translateY(-44px)`,
                                  top: '50%',
                                  left: 'calc(50% - 0.6px)'
                                }}
                              />
                            );
                          })}
                        </div>

                        {/* Brass central Core knob (Fixed to remain upright, doesn't rotate) */}
                        <div className="absolute w-[44px] h-[44px] rounded-full bg-gradient-to-tr from-amber-700 via-amber-400 to-amber-800 border-2 border-amber-300 flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.6)] z-20 pointer-events-none">
                          {/* Keyhole details */}
                          <div className="w-2.5 h-6 bg-neutral-950 rounded-xs flex flex-col justify-between items-center py-0.5 border border-amber-955 shadow-inner">
                            <div className="w-2.5 h-2.5 bg-gradient-to-tr from-amber-100 to-amber-400 rounded-full border border-amber-700 shadow-sm" />
                            <div className="w-1.2 h-2.5 bg-neutral-900 rounded-xs" />
                          </div>
                        </div>

                        {/* Bottom Snap Button */}
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); rotateGear(idx, 'down'); }}
                          className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-30 p-1 rounded-full bg-slate-900 border border-slate-700/80 text-amber-500 hover:text-white hover:bg-slate-800 transition-all cursor-pointer shadow-md opacity-25 group-hover:opacity-100 focus:outline-none"
                          title="Turn Dial Counter-Clockwise"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Digit Readout display */}
                      <div className="mt-3 font-mono text-xs bg-slate-950/90 border border-slate-800/80 px-2.5 py-1 text-amber-500 rounded-lg shadow-inner flex items-center gap-1">
                        <span className="text-slate-500 text-[10px]">DIAL:</span>
                        <span className="font-bold text-center w-6">{String(val).padStart(2, '0')}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <span className="text-[10px] text-slate-500 font-mono text-center leading-relaxed">
                  Hover & scroll, click arrows, or drag to rotate dials to the correct secure combination.
                </span>
              </div>

              {/* Secure status error panel */}
              {gatekeeperError && (
                <div className="bg-red-950/40 border border-red-800/80 p-3.5 rounded-xl text-xs text-red-200 flex items-start gap-2.5 animate-bounce">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-left">
                    <p className="font-bold text-red-300">Vault Locking State Safeguard</p>
                    <p className="opacity-90 font-sans leading-relaxed">{gatekeeperError}</p>
                  </div>
                </div>
              )}

              {/* Automatic brute-force freeze indicator */}
              {lockoutTimer > 0 && (
                <div className="bg-amber-950/40 border border-amber-800/80 p-3 rounded-xl text-xs text-amber-200 flex items-center justify-center gap-2 animate-pulse">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <span className="font-mono font-black uppercase tracking-wider text-[10px]">
                    SAFE LOCKOUT RE-ATTEMPT COOLDOWN ({lockoutTimer}s)
                  </span>
                </div>
              )}

              {/* Lever Triggers */}
              <div className="space-y-2">
                <button 
                  type="button" 
                  disabled={lockoutTimer > 0 || gearUnlockSuccess}
                  onClick={() => handleVerifyCombination()}
                  className={`w-full font-mono uppercase tracking-widest text-xs py-3.5 rounded-xl transition-all cursor-pointer font-bold flex items-center justify-center gap-2 shadow-lg focus:outline-none border-2 border-slate-850 ${
                    gearUnlockSuccess
                      ? "bg-emerald-600 border-emerald-500 text-white animate-pulse"
                      : lockoutTimer > 0
                        ? "bg-slate-950 border-slate-900 text-slate-650 cursor-not-allowed"
                        : "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-white hover:shadow-[0_0_20px_rgba(217,119,6,0.35)] shadow-black/80"
                  }`}
                >
                  {gearUnlockSuccess ? (
                    <>
                      <LockOpen className="w-4 h-4 animate-bounce" />
                      <span>DECOUPLERS SECUREMENT OFF • SUCCESS</span>
                    </>
                  ) : lockoutTimer > 0 ? (
                    <>
                      <Lock className="w-4 h-4 text-slate-700" />
                      <span>LOCK PENALTY COOLDOWN ({lockoutTimer}s)</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-amber-900" />
                      <span>DISENGAGE COMBINATION LOCK</span>
                    </>
                  )}
                </button>
                
                <button 
                  type="button" 
                  onClick={() => {
                    setIsGatekeeperOpen(false);
                    setGatekeeperError(null);
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-750 text-slate-350 hover:text-white font-mono uppercase tracking-widest text-[9px] py-2.5 rounded-xl transition-all cursor-pointer font-bold flex items-center justify-center gap-1.5 focus:outline-none border border-slate-700/60"
                >
                  Concede Portal Access
                </button>
              </div>

              {/* Cyber-Security Verification Note Footer */}
              <div className="pt-3.5 border-t border-slate-800/80 flex flex-col gap-1 text-center">
                <span className="text-[8px] text-slate-500 font-mono tracking-wide block uppercase">
                  CONFIdential SECURE ENDPOINT ACCESS DIRECTIVE. PENALTIES APPLY TO OUTSIDE TAMPERING.
                </span>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 2: SECURE BACK OFFICE LOGIN */}
      {isLoginModalOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300"
          id="login-overlay"
          onClick={e => {
            if ((e.target as HTMLElement).id === "login-overlay") {
              setIsLoginModalOpen(false);
              setLoginError(null);
            }
          }}
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden text-slate-100 shadow-2xl animate-fade-in text-left">
            {/* Top Security Gradient Accent Bar */}
            <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />
            
            {/* Header section with brand and secure state */}
            <div className="px-6 py-6 border-b border-slate-800 flex justify-between items-center text-left">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[9px] font-mono tracking-widest text-emerald-400 uppercase font-bold">
                    SSL Encrypted Security Pathway
                  </span>
                </div>
                <h3 className="text-base font-serif font-black tracking-tight text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-500" />
                  <span>Administrative Gateway</span>
                </h3>
              </div>
              <button 
                onClick={() => {
                  setIsLoginModalOpen(false);
                  setLoginError(null);
                }}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer bg-slate-800 hover:bg-slate-700/80 p-1.5 rounded-full border border-slate-700/60 shadow-xs focus:outline-none"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Verification Form */}
            <form onSubmit={handleAdminVerify} className="p-6 space-y-4 text-left">
              
              {/* Dynamic Error Status Alerts */}
              {loginError && (
                <div className="bg-red-950/40 border border-red-800/80 p-3.5 rounded-xl text-xs text-red-200 flex items-start gap-2.5 animate-bounce">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-red-300">Access Denied</p>
                    <p className="opacity-90 font-sans leading-relaxed">{loginError}</p>
                  </div>
                </div>
              )}

              {/* Username field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  Staff Username
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 flex items-center justify-center text-slate-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input 
                    type="text" 
                    required
                    placeholder="Enter official credentials ID"
                    value={loginForm.username}
                    onChange={e => {
                      setLoginError(null);
                      setLoginForm(prev => ({ ...prev, username: e.target.value }));
                    }}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Password field with Eye toggle */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  Security Lock Key
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 flex items-center justify-center text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input 
                    type={showAdminPassword ? "text" : "password"} 
                    required
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={e => {
                      setLoginError(null);
                      setLoginForm(prev => ({ ...prev, password: e.target.value }));
                    }}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-350 focus:outline-none cursor-pointer p-1 rounded-md hover:bg-slate-800/50"
                    title={showAdminPassword ? "Hide lock key" : "Show lock key"}
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* High-Fidelity Interactive Security CAPTCHA Check */}
              <div className="space-y-2 border-t border-b border-slate-800/60 py-4 my-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    Anti-Robot Verification
                  </label>
                  <span className="text-[8px] font-sans text-emerald-400 uppercase font-black tracking-wider">
                    Required*
                  </span>
                </div>

                <div className="flex items-stretch gap-2">
                  {/* Dynamic Styled CAPTCHA Display Box with Secure Visual Noise styling */}
                  <div className="flex-1 bg-slate-950/90 border border-slate-800 rounded-xl flex items-center justify-center gap-1.5 select-none relative overflow-hidden py-2 shadow-inner group py-2.5">
                    {/* Security Lines simulation backdrop */}
                    <div className="absolute inset-x-0 top-1/2 h-1 bg-blue-500/10 skew-y-3 pointer-events-none" />
                    <div className="absolute inset-x-0 top-[25%] h-1 bg-indigo-500/10 -skew-y-6 pointer-events-none" />
                    <div className="absolute inset-x-0 bottom-[30%] h-1 bg-emerald-500/10 skew-y-12 pointer-events-none" />
                    
                    {/* CAPTCHA Characters */}
                    {captchaText.split("").map((char, index) => {
                      // Apply random rotation & shifts for simulation of a realistic captcha barrier
                      const rotation = (index % 2 === 0 ? "rotate-6" : "-rotate-6");
                      const translation = (index % 2 === 0 ? "translate-y-0.5" : "-translate-y-0.5");
                      const textStyles = [
                        "text-blue-400 drop-shadow-[0_2px_4px_rgba(59,130,246,0.3)]",
                        "text-indigo-400 drop-shadow-[0_2px_4px_rgba(129,140,248,0.3)]",
                        "text-emerald-400 drop-shadow-[0_2px_4px_rgba(52,211,153,0.3)]",
                        "text-pink-400 drop-shadow-[0_2px_4px_rgba(244,114,182,0.3)]"
                      ];
                      const selectedColor = textStyles[index % textStyles.length];

                      return (
                        <span 
                          key={index}
                          className={`inline-block font-mono text-base font-black tracking-widest ${rotation} ${translation} ${selectedColor}`}
                          style={{ textDecoration: index % 3 === 0 ? 'line-through' : 'none' }}
                        >
                          {char}
                        </span>
                      );
                    })}
                  </div>

                  {/* Refresh Triggers */}
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    className="bg-slate-800 hover:bg-slate-700/80 hover:text-white border border-slate-700 text-slate-350 p-3 rounded-xl transition-all cursor-pointer flex items-center justify-center focus:outline-none"
                    title="Generate direct new captcha code"
                  >
                    <RefreshCcw className="w-4 h-4 animate-hover-spin" />
                  </button>
                </div>

                {/* Input verification entry field */}
                <input 
                  type="text" 
                  required
                  placeholder="Enter the security code above"
                  value={captchaInput}
                  onChange={e => {
                    setLoginError(null);
                    setCaptchaInput(e.target.value);
                  }}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-4 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all font-mono text-center tracking-widest uppercase font-bold"
                />
              </div>

              {/* Submit Trigger - Production Black Slate Button styling */}
              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono uppercase tracking-widest text-[11px] py-3.5 rounded-xl transition-all duration-200 cursor-pointer font-bold flex items-center justify-center gap-2 mt-4 shadow-md hover:shadow-blue-500/10 focus:outline-none"
              >
                <LockOpen className="w-3.5 h-3.5" />
                <span>Verify & Enter Console</span>
              </button>

              {/* Professional Secure Footer Note */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono tracking-wide">
                  <span>Session Status: Active (AES-256)</span>
                  <span>Port: Internal SSL</span>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL 3: FULL SCREEN ADMIN PANEL (GCP SECURED) */}
      {isAdminOpen && (
        <AdminPanel  
          photos={photos}
          setPhotos={setPhotos}
          milestones={milestones}
          setMilestones={setMilestones}
          blogs={blogs}
          setBlogs={setBlogs}
          galleryItems={galleryItems}
          setGalleryItems={setGalleryItems}
          projects={projects}
          setProjects={setProjects}
          socialLinks={socialLinks}
          setSocialLinks={setSocialLinks}
          profileDetails={profileDetails}
          setProfileDetails={setProfileDetails}
          messages={messages}
          setMessages={setMessages}
          recommendations={recommendations}
          onApproveRecommendation={handleApproveRecommendation}
          onDeleteRecommendation={handleDeleteRecommendation}
          stats={stats}
          onUpdateSocialStats={handleUpdateSocialStats}
          visitorBase={visitorBase}
          onClose={() => setIsAdminOpen(false)}
          securityQuestions={securityQuestions}
          setSecurityQuestions={setSecurityQuestions}
        />
      )}

    </div>
  );
}
