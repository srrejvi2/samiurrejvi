import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import crypto from "crypto";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import os from "os";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, setLogLevel, onSnapshot, collection, getDocs, deleteDoc } from "firebase/firestore";
import { put } from "@vercel/blob";
import localDbStore from "./src/data/db_store.json";

dotenv.config();

// Silence verbose internal Firebase Stream warnings
setLogLevel("silent");

// Configure Cloudinary Services with Environment Credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Setup Multer temporary file storage using OS tmpdir
const upload = multer({ dest: os.tmpdir() });

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Persistent database store configurations
const STORE_PATH = path.join(process.cwd(), "src", "data", "db_store.json");

interface ArchivePhoto {
  id: string;
  url: string;
  location: string;
  title: string;
  description: string;
  story: string;
  category: 'travel' | 'photoshop';
  date: string;
  createdAt: string;
}

interface Recommendation {
  id: string;
  name: string;
  role: string;
  company: string;
  message: string;
  approved: boolean;
  date: string;
  imageUrl?: string;
  createdAt: string;
}

interface FollowerStats {
  github: number;
  facebook: number;
  twitter: number;
  subscribers: number;
}

interface Comment {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  replies?: Comment[];
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  likes: number;
  dislikes: number;
  comments: Comment[];
  createdAt: string;
}

interface GalleryItem {
  id: string;
  description: string;
  imageUrl: string;
  likes: number;
  dislikes: number;
  comments: Comment[];
  createdAt: string;
}

interface ProjectItem {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  link?: string;
  githubUrl?: string;
  category: 'programming' | 'business';
  longDescription?: string;
  imageUrl?: string;
  createdAt: string;
}

interface JourneyMilestone {
  id: string;
  year: string;
  title: string;
  subtitle: string;
  description: string;
  type: 'success' | 'failure' | 'academic' | 'dream';
  story?: string;
  imageUrl?: string;
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

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  label: string;
  metric?: string;
  iconCode?: string;
}

export interface SecurityQuestion {
  id: string;
  question: string;
  answer: string;
}

interface CustomInstitution {
  id: string;
  title: string;
  name: string;
  link?: string;
  description?: string;
}

interface ProfileDetails {
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

interface DbStore {
  visitorCount: number;
  stats: FollowerStats;
  recommendations: Recommendation[];
  blogs: BlogPost[];
  gallery: GalleryItem[];
  projects: ProjectItem[];
  milestones: JourneyMilestone[];
  messages: ContactMessage[];
  socialLinks: SocialLink[];
  profileDetails: ProfileDetails;
  photos: ArchivePhoto[];
  securityQuestions: SecurityQuestion[];
}

const DEFAULT_STORE: DbStore = {
  visitorCount: 0,
  stats: {
    github: 0,
    facebook: 0,
    twitter: 0,
    subscribers: 0
  },
  messages: [],
  socialLinks: [
    {
      id: "sl-1",
      platform: "Facebook",
      url: "https://www.facebook.com/srrejvi2002",
      label: "srrejvi2002",
      metric: "Official Profile",
      iconCode: "Facebook"
    },
    {
      id: "sl-2",
      platform: "Twitter",
      url: "https://twitter.com/SrRejvi",
      label: "@SrRejvi",
      metric: "Twitter / X",
      iconCode: "Twitter"
    },
    {
      id: "sl-3",
      platform: "Instagram",
      url: "https://www.instagram.com/sr10062002",
      label: "sr10062002 / srrejvi2",
      metric: "Instagram Feed",
      iconCode: "Instagram"
    },
    {
      id: "sl-4",
      platform: "TikTok",
      url: "https://www.tiktok.com/@rejvi2002",
      label: "@rejvi2002",
      metric: "TikTok Profile",
      iconCode: "Globe"
    },
    {
      id: "sl-5",
      platform: "WeChat",
      url: "#wechat-SRrejvi1",
      label: "SRrejvi1",
      metric: "WeChat ID",
      iconCode: "MessageCircle"
    },
    {
      id: "sl-6",
      platform: "Snapchat",
      url: "https://www.snapchat.com/add/srrejvi1",
      label: "srrejvi1",
      metric: "Snapchat ID",
      iconCode: "Link"
    }
  ],
  profileDetails: {
    name: "Samiur Rahaman Rejvi",
    tagline: "BDMYTH",
    email: "samiurrahamanrejvi@gmail.com",
    altEmail: "",
    phone: "+880 1339-654727",
    whatsapp: "+880 1339-654727",
    aboutText: "I am a full-stack system researcher, technology enthusiast, and entrepreneur. Serving as the Founder, Owner, and CEO of 'Cotton and Peace' since February 3, 2022, I specialize in combining business strategy with scalable administrative software solutions. Alongside my commercial role, I am currently pursuing a Bachelors of Computer Science (BCS) at the University Of Geomatika Malaysia in Kuala Lumpur to further sharpen my research in secure algorithms and robust relational databases. Originally from Pabna, Bangladesh, I am passionate about deep-dive researching in software architectures and security protocols. I effectively communicate in English and Bangla.",
    universityName: "University Of Geomatika Malaysia",
    universityLink: "https://www.geomatika.edu.my",
    highSchoolName: "Jagir Hossain Academy, Pabna",
    highSchoolLink: "",
    collegeName: "Pabna Islamia College",
    collegeLink: "",
    targetMasterUni: "Advanced Computer Science Academics",
    targetMasterLink: "",
    coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    profilePictureUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    customInstitutions: [],
    cvDownloadUrl: "",
    blogSectionTagline: "THE INTELLECTUAL INK",
    blogSectionTitle: "Writing Blogs",
    blogSectionDescription: "My writings on software architectures, database security, Photoshop layouts, and student experiences. Support my words by voting or leaving feedback!"
  },
  recommendations: [],
  blogs: [],
  gallery: [],
  projects: [],
  milestones: [],
  photos: [],
  securityQuestions: [
    { id: "sq-1", question: "What is your Date of Birth? (Format: DD/MM/YYYY)", answer: "10/06/2002" },
    { id: "sq-2", question: "What is your Place of Birth?", answer: "Pabna" },
    { id: "sq-3", question: "On which date did you arrive in Malaysia? (Format: DD/MM/YYYY)", answer: "10/10/2023" },
    { id: "sq-4", question: "What is the name of your first school?", answer: "Jagir Hossain Academy" },
    { id: "sq-5", question: "What is your mother's maiden name?", answer: "Begum" },
    { id: "sq-6", question: "What was your childhood nickname?", answer: "Rejvi" },
    { id: "sq-7", question: "What is your favorite programming language?", answer: "TypeScript" },
    { id: "sq-8", question: "Which city did you grow up in?", answer: "Pabna" },
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
    { id: "sq-19", question: "What is your favorite hobby to do in free time?", answer: "Researching" },
    { id: "sq-20", question: "What is the name of your favorite tech company?", answer: "Google" }
  ]
};

// Initialize Firebase Client SDK for Server-side replication using API Key authentication
let firestore: any = null;

try {
  let config: any = null;
  const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");

  const parseFirebaseConfigString = (rawStr: string | undefined, varName: string): any => {
    if (!rawStr) return null;
    let trimmed = rawStr.trim();
    
    // Strip outer single or double quotes if present
    if ((trimmed.startsWith("'") && trimmed.endsWith("'")) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
      trimmed = trimmed.substring(1, trimmed.length - 1).trim();
    }
    
    // Detect typical placeholder patterns or incomplete values
    if (
      trimmed === "" ||
      trimmed === "..." ||
      trimmed.includes("...") ||
      trimmed.toLowerCase().includes("placeholder") ||
      trimmed.toLowerCase().includes("your_") ||
      trimmed === "{}"
    ) {
      console.log(`[Firebase Init] Detected placeholder or empty configuration for ${varName}. Skipping Client SDK init.`);
      return null;
    }

    if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) {
      console.log(`[Firebase Init] ${varName} does not look like a JSON object. Skipping.`);
      return null;
    }

    try {
      return JSON.parse(trimmed);
    } catch (e: any) {
      let maskedStr = trimmed;
      maskedStr = maskedStr.replace(/"apiKey"\s*:\s*"[^"]*"/gi, '"apiKey": "***MASKED***"');
      maskedStr = maskedStr.replace(/"apiKey"\s*:\s*'[^']*'/gi, '"apiKey": "***MASKED***"');
      console.warn(`[Firebase Init] Bypassed parsing error for ${varName} (likely placeholder):`, e.message);
      return null;
    }
  };

  if (process.env.FIREBASE_CONFIG) {
    config = parseFirebaseConfigString(process.env.FIREBASE_CONFIG, "FIREBASE_CONFIG");
  } else if (process.env.VITE_FIREBASE_CONFIG) {
    config = parseFirebaseConfigString(process.env.VITE_FIREBASE_CONFIG, "VITE_FIREBASE_CONFIG");
  }

  if (!config && fs.existsSync(firebaseConfigPath)) {
    config = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf-8"));
    console.log("Loaded Firebase configuration from firebase-applet-config.json file.");
  }

  if (config) {
    const app = initializeApp(config);
    
    // Support custom database ID if specified, otherwise fall back to default
    if (config.firestoreDatabaseId) {
      firestore = getFirestore(app, config.firestoreDatabaseId);
    } else {
      firestore = getFirestore(app);
    }
    console.log("Firebase Web Client SDK initialized inside server.ts successfully.");
  } else {
    console.warn("No Firebase configuration found on disk or environment variables. Server starting in offline fallback mode.");
  }
} catch (error) {
  console.error("Failed to initialize Firebase Client SDK inside server.ts:", error);
}

// Memory cache to handle synchronous readDb() fast & clean
let dbMemoryCache: DbStore | null = null;
const lastSyncedKeys: Record<string, string> = {};
let isFirestoreQuotaExceeded = false;

// Middleware to ensure DB cache is loaded on serverless/ephemeral environments (like Vercel)
app.use(async (req, res, next) => {
  if (firestore && !dbMemoryCache) {
    console.log("[Serverless Guard] Memory cache is empty. Performing on-demand startup sync from Google Cloud...");
    try {
      await syncFromFirestore();
    } catch (e) {
      console.error("[Serverless Guard] Failed to sync database on-demand:", e);
    }
  }
  next();
});

function readDb(): DbStore {
  if (dbMemoryCache) {
    return dbMemoryCache;
  }

  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      // Ensure all arrays exist in back-compat cases
      dbMemoryCache = {
        visitorCount: parsed.visitorCount ?? DEFAULT_STORE.visitorCount,
        stats: parsed.stats ?? DEFAULT_STORE.stats,
        recommendations: parsed.recommendations ?? DEFAULT_STORE.recommendations,
        blogs: parsed.blogs ?? DEFAULT_STORE.blogs,
        gallery: parsed.gallery ?? DEFAULT_STORE.gallery,
        projects: parsed.projects ?? DEFAULT_STORE.projects,
        milestones: parsed.milestones ?? DEFAULT_STORE.milestones,
        messages: parsed.messages ?? [],
        socialLinks: parsed.socialLinks ?? DEFAULT_STORE.socialLinks,
        profileDetails: parsed.profileDetails 
          ? { 
              ...parsed.profileDetails, 
              customInstitutions: parsed.profileDetails.customInstitutions ?? [],
              cvDownloadUrl: parsed.profileDetails.cvDownloadUrl ?? "",
              blogSectionTagline: parsed.profileDetails.blogSectionTagline ?? DEFAULT_STORE.profileDetails.blogSectionTagline,
              blogSectionTitle: parsed.profileDetails.blogSectionTitle ?? DEFAULT_STORE.profileDetails.blogSectionTitle,
              blogSectionDescription: parsed.profileDetails.blogSectionDescription ?? DEFAULT_STORE.profileDetails.blogSectionDescription
            }
          : DEFAULT_STORE.profileDetails,
        photos: parsed.photos ?? DEFAULT_STORE.photos,
        securityQuestions: parsed.securityQuestions ?? DEFAULT_STORE.securityQuestions
      };

      // Populate base sync baseline on initial load
      Object.keys(dbMemoryCache).forEach((key) => {
        if (lastSyncedKeys[key] === undefined) {
          lastSyncedKeys[key] = JSON.stringify(dbMemoryCache![key as keyof DbStore]);
        }
      });

      return dbMemoryCache!;
    } else {
      console.log("[Serverless Guard] Physical file not found at STORE_PATH. Falling back to statically imported localDbStore...");
      dbMemoryCache = {
        visitorCount: (localDbStore as any).visitorCount ?? DEFAULT_STORE.visitorCount,
        stats: (localDbStore as any).stats ?? DEFAULT_STORE.stats,
        recommendations: (localDbStore as any).recommendations ?? DEFAULT_STORE.recommendations,
        blogs: (localDbStore as any).blogs ?? DEFAULT_STORE.blogs,
        gallery: (localDbStore as any).gallery ?? DEFAULT_STORE.gallery,
        projects: (localDbStore as any).projects ?? DEFAULT_STORE.projects,
        milestones: (localDbStore as any).milestones ?? DEFAULT_STORE.milestones,
        messages: (localDbStore as any).messages ?? [],
        socialLinks: (localDbStore as any).socialLinks ?? DEFAULT_STORE.socialLinks,
        profileDetails: (localDbStore as any).profileDetails 
          ? { 
              ...(localDbStore as any).profileDetails, 
              customInstitutions: (localDbStore as any).profileDetails.customInstitutions ?? [],
              cvDownloadUrl: (localDbStore as any).profileDetails.cvDownloadUrl ?? "",
              blogSectionTagline: (localDbStore as any).profileDetails.blogSectionTagline ?? DEFAULT_STORE.profileDetails.blogSectionTagline,
              blogSectionTitle: (localDbStore as any).profileDetails.blogSectionTitle ?? DEFAULT_STORE.profileDetails.blogSectionTitle,
              blogSectionDescription: (localDbStore as any).profileDetails.blogSectionDescription ?? DEFAULT_STORE.profileDetails.blogSectionDescription
            }
          : DEFAULT_STORE.profileDetails,
        photos: (localDbStore as any).photos ?? DEFAULT_STORE.photos,
        securityQuestions: (localDbStore as any).securityQuestions ?? DEFAULT_STORE.securityQuestions
      };

      // Populate base sync baseline on initial load
      Object.keys(dbMemoryCache).forEach((key) => {
        if (lastSyncedKeys[key] === undefined) {
          lastSyncedKeys[key] = JSON.stringify(dbMemoryCache![key as keyof DbStore]);
        }
      });

      return dbMemoryCache!;
    }
  } catch (err) {
    console.error("Failed to read database store, using default fallback:", err);
  }
  
  // Create folder and store default if not exists
  try {
    const parentDir = path.dirname(STORE_PATH);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(DEFAULT_STORE, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save initial database store:", err);
  }
  dbMemoryCache = DEFAULT_STORE;

  // Populate base sync baseline from fallback default
  Object.keys(dbMemoryCache).forEach((key) => {
    if (lastSyncedKeys[key] === undefined) {
      lastSyncedKeys[key] = JSON.stringify(dbMemoryCache![key as keyof DbStore]);
    }
  });

  return DEFAULT_STORE;
}

function syncKeyToFirestore(firestore: any, key: string, value: any): Promise<any>[] {
  const promises: Promise<any>[] = [];
  const jsonStr = JSON.stringify(value);
  const CHUNK_SIZE = 800000; // 800KB chunk size to easily fit within 1MB document limit

  const wrapWritePromise = (promise: Promise<any>, description: string) => {
    return promise.catch((err: any) => {
      const errMsg = String(err?.message || err);
      if (
        errMsg.includes("resource-exhausted") ||
        errMsg.includes("RESOURCE_EXHAUSTED") ||
        errMsg.includes("quota") ||
        errMsg.includes("Quota")
      ) {
        isFirestoreQuotaExceeded = true;
        console.warn(`[Firestore Quota Guard] Write suspended for "${description}" due to Google Cloud Firestore free-tier quota limits being reached.`);
      } else {
        console.error(`[Firestore Sync] Unexpected failure when writing "${description}":`, err);
      }
      return null;
    });
  };

  if (jsonStr.length < CHUNK_SIZE) {
    // Write normally as a single document
    const docRef = doc(firestore, "portfolio", key);
    promises.push(wrapWritePromise(setDoc(docRef, { [key]: value, isChunked: false }), `portfolio/${key}`));

    // Clean up any potential leftover chunks from previous oversized structures
    // Only query-delete chunks if the key belongs to known large, chunkable properties to preserve Firestore write unit quotas.
    const CHUNKABLE_KEYS = ["blogs", "gallery", "projects", "photos"];
    if (CHUNKABLE_KEYS.includes(key)) {
      for (let i = 0; i < 15; i++) {
        promises.push(
          deleteDoc(doc(firestore, "portfolio", `${key}_chunk_${i}`)).catch((err) => {
            // Silent cleanup warning
          })
        );
      }
    }
  } else {
    console.log(`[Firestore Chunking] Key "${key}" exceeds limit with size ${jsonStr.length} chars. Segmenting string payload...`);
    const chunks: string[] = [];
    for (let i = 0; i < jsonStr.length; i += CHUNK_SIZE) {
      chunks.push(jsonStr.substring(i, i + CHUNK_SIZE));
    }

    // Write metadata document
    const docRef = doc(firestore, "portfolio", key);
    promises.push(wrapWritePromise(setDoc(docRef, { isChunked: true, chunkCount: chunks.length }), `portfolio/${key} (meta)`));

    // Write individual chunk documents
    chunks.forEach((chunk, index) => {
      const chunkDocRef = doc(firestore, "portfolio", `${key}_chunk_${index}`);
      promises.push(wrapWritePromise(setDoc(chunkDocRef, { sub: chunk }), `portfolio/${key}_chunk_${index}`));
    });

    // Clean up higher chunk indices from previous even larger structures if any
    for (let i = chunks.length; i < chunks.length + 15; i++) {
      promises.push(
        deleteDoc(doc(firestore, "portfolio", `${key}_chunk_${i}`)).catch((err) => {
          // Silent cleanup warning
        })
      );
    }
  }

  return promises;
}

function reconstructStoreFromDocs(docsMap: Record<string, any>): Partial<DbStore> {
  const reconstructed: Partial<DbStore> = {};
  const keys = Object.keys(DEFAULT_STORE) as Array<keyof DbStore>;

  keys.forEach((key) => {
    const metaDoc = docsMap[key];
    if (metaDoc) {
      if (metaDoc.isChunked) {
        const count = metaDoc.chunkCount;
        let fullString = "";
        let ok = true;
        for (let i = 0; i < count; i++) {
          const chunkDoc = docsMap[`${key}_chunk_${i}`];
          if (chunkDoc && typeof chunkDoc.sub === "string") {
            fullString += chunkDoc.sub;
          } else {
            console.warn(`[Firestore Reconstruction] Missing chunk ${i} for key: ${key}`);
            ok = false;
            break;
          }
        }
        if (ok) {
          try {
            reconstructed[key] = JSON.parse(fullString);
          } catch (e: any) {
            console.error(`[Firestore Reconstruction] JSON syntax parsing failed for key: ${key}. Length: ${fullString.length}`, e);
          }
        }
      } else {
        if (key in metaDoc) {
          reconstructed[key] = metaDoc[key];
        }
      }
    }
  });

  return reconstructed;
}

let sseClients: any[] = [];

function notifyClientsOfUpdate() {
  console.log(`[SSE] Notifying ${sseClients.length} clients of data update...`);
  sseClients.forEach((client) => {
    try {
      client.write("data: update\n\n");
    } catch (e) {
      console.error("[SSE] Failed to write update to client, filtering client...", e);
    }
  });
}

function writeDb(data: DbStore, keysToSync?: Array<keyof DbStore>) {
  dbMemoryCache = data;
  try {
    const parentDir = path.dirname(STORE_PATH);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
    
    // Clear dynamic db translation sector on disk on write to let them regenerate
    const cache = readCache();
    cache.db = {};
    writeCache(cache);

    // Sync to Firestore Cloud in background asynchronously
    if (firestore) {
      // Auto-detect if this is an administrative or manual save action to bypass and clear temporary quota suspends
      const adminKeys: Array<keyof DbStore> = ["profileDetails", "projects", "milestones", "photos", "socialLinks", "stats", "securityQuestions"];
      const isSyncingAdminKeys = !keysToSync || keysToSync.some(key => adminKeys.includes(key));
      
      if (isSyncingAdminKeys) {
        if (isFirestoreQuotaExceeded) {
          console.log("[Firestore Quota Guard] Clearing suspended quota flag for verified administrative update/save operation.");
          isFirestoreQuotaExceeded = false;
        }
      }

      if (isFirestoreQuotaExceeded) {
        console.log("[Firestore] Daily limit reached. Pausing cloud backups. Application is running actively with local cache.");
      } else {
        const keys = keysToSync || (Object.keys(data) as Array<keyof DbStore>);
        const promises: Promise<any>[] = [];
        const syncedKeysList: string[] = [];
        keys.forEach((key) => {
          const jsonStr = JSON.stringify(data[key]);
          const lastVal = lastSyncedKeys[key];
          if (lastVal === jsonStr) {
            // No changes detected for this key since last sync, skip writes to preserve free-tier quotas.
            return;
          }

          // Optimization: Only sync visitorCount to Cloud Firestore every 10 visits to preserve free daily write units.
          // The local server and memory cache will still update instantly on every load, and push updates to SSE clients.
          if (key === "visitorCount") {
            const count = Number(data[key]) || 0;
            if (count % 10 !== 0) {
              return;
            }
          }

          promises.push(...syncKeyToFirestore(firestore, key, data[key]));
          lastSyncedKeys[key] = jsonStr;
          syncedKeysList.push(key);
        });

        if (promises.length > 0) {
          Promise.all(promises)
            .then(() => {
              console.log(`[Firestore] Successfully backed up database store keys: ${syncedKeysList.join(", ")} to Google Cloud.`);
            })
            .catch((err: any) => {
              const errMsg = String(err?.message || err);
              if (
                errMsg.includes("resource-exhausted") ||
                errMsg.includes("RESOURCE_EXHAUSTED") ||
                errMsg.includes("quota") ||
                errMsg.includes("Quota")
              ) {
                isFirestoreQuotaExceeded = true;
                console.warn("[Firestore Quota Guard] Background writes suspended because Firebase daily write limit was exceeded.");
              } else {
                console.error("[Firestore] Sync failed during modular database chunked segmented writing:", err);
              }
            });
        } else {
          console.log("[Firestore] No changes detected across keys. Skipping cloud synchronized writes to preserve free-tier quotas.");
        }
      }
    }

    // Notify all connected SSE client tabs of the database update in real-time
    notifyClientsOfUpdate();
  } catch (err) {
    console.error("Failed to write to database store:", err);
  }
}

// Real-time synchronization state tracking variable
let isListeningToFirestore = false;
let firestoreUnsubscribe: (() => void) | null = null;

// Background startup syncing job to fetch cloud data with a safety timeout guard
async function syncFromFirestore() {
  if (!firestore) return;
  try {
    console.log("[Firestore] Starting Cloud Firestore synchronization...");
    const colRef = collection(firestore, "portfolio");
    
    // Safety timeout of 10 seconds to prevent hanging the server startup if Firebase is unreachable
    const fetchPromise = getDocs(colRef);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Firestore synchronization request timed out after 10 seconds")), 10000)
    );
    
    const snap = await Promise.race([fetchPromise, timeoutPromise]);
    
    let isDbEmpty = true;
    const tempStore: Partial<DbStore> = {};
    
    if (!snap.empty) {
      isDbEmpty = false;
      const docsMap: Record<string, any> = {};
      snap.forEach((d) => {
        docsMap[d.id] = d.data();
      });
      const reconstructed = reconstructStoreFromDocs(docsMap);
      Object.assign(tempStore, reconstructed);
    }

    if (!isDbEmpty) {
      console.log("[Firestore] Cloud backup documents found! Loading database records from Google Cloud into memory...");
      dbMemoryCache = {
        visitorCount: tempStore.visitorCount ?? DEFAULT_STORE.visitorCount,
        stats: tempStore.stats ?? DEFAULT_STORE.stats,
        recommendations: tempStore.recommendations ?? DEFAULT_STORE.recommendations,
        blogs: tempStore.blogs ?? DEFAULT_STORE.blogs,
        gallery: tempStore.gallery ?? DEFAULT_STORE.gallery,
        projects: tempStore.projects ?? DEFAULT_STORE.projects,
        milestones: tempStore.milestones ?? DEFAULT_STORE.milestones,
        messages: tempStore.messages ?? [],
        socialLinks: tempStore.socialLinks ?? DEFAULT_STORE.socialLinks,
        profileDetails: tempStore.profileDetails 
          ? { 
              ...tempStore.profileDetails, 
              customInstitutions: tempStore.profileDetails.customInstitutions ?? [],
              cvDownloadUrl: tempStore.profileDetails.cvDownloadUrl ?? "",
              blogSectionTagline: tempStore.profileDetails.blogSectionTagline ?? DEFAULT_STORE.profileDetails.blogSectionTagline,
              blogSectionTitle: tempStore.profileDetails.blogSectionTitle ?? DEFAULT_STORE.profileDetails.blogSectionTitle,
              blogSectionDescription: tempStore.profileDetails.blogSectionDescription ?? DEFAULT_STORE.profileDetails.blogSectionDescription
            }
          : DEFAULT_STORE.profileDetails,
        photos: tempStore.photos ?? DEFAULT_STORE.photos,
        securityQuestions: tempStore.securityQuestions ?? DEFAULT_STORE.securityQuestions
      };
      // Also sync it on disk locally to keep fallback files ready
      fs.writeFileSync(STORE_PATH, JSON.stringify(dbMemoryCache, null, 2), "utf-8");

      // Initialize startup sync baseline to prevent immediately sync-writing old keys back
      Object.keys(dbMemoryCache).forEach((key) => {
        lastSyncedKeys[key] = JSON.stringify(dbMemoryCache![key as keyof DbStore]);
      });

      console.log("[Firestore] Server memory and fallback storage file successfully synchronized.");
    } else {
      console.log("[Firestore] No previous database backup found on Google Cloud. Seeding local dataset...");
      const currentLocalData = readDb();
      // Write the seed data split by keys using segmentation and automated chunking
      const keys = Object.keys(currentLocalData) as Array<keyof DbStore>;
      const promises: Promise<any>[] = [];
      keys.forEach((key) => {
        promises.push(...syncKeyToFirestore(firestore, key, currentLocalData[key]));
        lastSyncedKeys[key] = JSON.stringify(currentLocalData[key]);
      });
      await Promise.all(promises);
      console.log("[Firestore] Seeded initial database store into Cloud Firestore successfully in segmented and chunked documents.");
    }

    // Establish persistent real-time listener to capture insertions or edits from Render/GitHub/external sites (bypass on serverless Vercel/Netlify to avoid connection leaks)
    if (!isListeningToFirestore && process.env.VERCEL !== "1" && process.env.NETLIFY !== "true") {
      firestoreUnsubscribe = onSnapshot(colRef, (snapshot) => {
        if (!snapshot.empty) {
          console.log("[Firestore Listener] Real-time updates detected. Synchronizing memory cache...");
          const docsMap: Record<string, any> = {};
          snapshot.forEach((d) => {
            docsMap[d.id] = d.data();
          });
          const updatedFields = reconstructStoreFromDocs(docsMap);
          
          dbMemoryCache = {
            visitorCount: updatedFields.visitorCount ?? dbMemoryCache?.visitorCount ?? DEFAULT_STORE.visitorCount,
            stats: updatedFields.stats ?? dbMemoryCache?.stats ?? DEFAULT_STORE.stats,
            recommendations: updatedFields.recommendations ?? dbMemoryCache?.recommendations ?? DEFAULT_STORE.recommendations,
            blogs: updatedFields.blogs ?? dbMemoryCache?.blogs ?? DEFAULT_STORE.blogs,
            gallery: updatedFields.gallery ?? dbMemoryCache?.gallery ?? DEFAULT_STORE.gallery,
            projects: updatedFields.projects ?? dbMemoryCache?.projects ?? DEFAULT_STORE.projects,
            milestones: updatedFields.milestones ?? dbMemoryCache?.milestones ?? DEFAULT_STORE.milestones,
            messages: updatedFields.messages ?? dbMemoryCache?.messages ?? [],
            socialLinks: updatedFields.socialLinks ?? dbMemoryCache?.socialLinks ?? DEFAULT_STORE.socialLinks,
            profileDetails: updatedFields.profileDetails 
              ? { 
                  ...updatedFields.profileDetails, 
                  customInstitutions: updatedFields.profileDetails.customInstitutions ?? [],
                  cvDownloadUrl: updatedFields.profileDetails.cvDownloadUrl ?? "",
                  blogSectionTagline: updatedFields.profileDetails.blogSectionTagline ?? DEFAULT_STORE.profileDetails.blogSectionTagline,
                  blogSectionTitle: updatedFields.profileDetails.blogSectionTitle ?? DEFAULT_STORE.profileDetails.blogSectionTitle,
                  blogSectionDescription: updatedFields.profileDetails.blogSectionDescription ?? DEFAULT_STORE.profileDetails.blogSectionDescription
                }
              : (dbMemoryCache?.profileDetails ?? DEFAULT_STORE.profileDetails),
            photos: updatedFields.photos ?? dbMemoryCache?.photos ?? DEFAULT_STORE.photos,
            securityQuestions: updatedFields.securityQuestions ?? dbMemoryCache?.securityQuestions ?? DEFAULT_STORE.securityQuestions
          };
          
          // Sync it on disk locally
          fs.writeFileSync(STORE_PATH, JSON.stringify(dbMemoryCache, null, 2), "utf-8");

          // Update lastSyncedKeys baseline from remote change to prevent echo-syncs
          Object.keys(dbMemoryCache).forEach((key) => {
            lastSyncedKeys[key] = JSON.stringify(dbMemoryCache![key as keyof DbStore]);
          });

          // Clear translation cache so that if content changed, translations regenerate with correct keys
          try {
            const cache = readCache();
            cache.db = {};
            writeCache(cache);
          } catch (e) {}

          // Notify all local SSE browser clients about the cloud database updates
          notifyClientsOfUpdate();
        }
      }, (error: any) => {
        const errMsg = String(error?.message || error);
        if (
          errMsg.includes("resource-exhausted") ||
          errMsg.includes("RESOURCE_EXHAUSTED") ||
          errMsg.includes("quota") ||
          errMsg.includes("Quota")
        ) {
          isFirestoreQuotaExceeded = true;
          console.warn("[Firestore Listener] Daily limit reached. Suspending listener gracefully.");
          if (firestoreUnsubscribe) {
            try {
              firestoreUnsubscribe();
              firestoreUnsubscribe = null;
            } catch (unsubErr) {}
          }
          isListeningToFirestore = false;
        } else {
          console.error("[Firestore Listener] Real-time synchronization error:", error);
        }
      });
      isListeningToFirestore = true;
      console.log("[Firestore Listener] Successfully connected a persistent real-time change listener.");
    }
  } catch (err: any) {
    const errMsg = String(err?.message || err);
    if (
      errMsg.includes("resource-exhausted") ||
      errMsg.includes("RESOURCE_EXHAUSTED") ||
      errMsg.includes("quota") ||
      errMsg.includes("Quota")
    ) {
      isFirestoreQuotaExceeded = true;
      console.warn("[Firestore] Cloud synchronization on startup bypassed due to exceeded Firebase write/read quota units.");
    } else {
      console.error("[Firestore] Cloud synchronization on startup failed or timed out:", err);
    }
  }
}

// ----------------------------------------------------
// Persistent Disk Caching and Offline Dictionary Pipeline
// ----------------------------------------------------
const CACHE_PATH = path.join(process.cwd(), "src", "data", "translation_cache.json");

interface CacheStore {
  db: Record<string, DbStore>;
  ui: Record<string, Record<string, string>>;
  texts: Record<string, Record<string, string>>;
}

const DEFAULT_CACHE: CacheStore = {
  db: {},
  ui: {},
  texts: {}
};

function readCache(): CacheStore {
  try {
    if (fs.existsSync(CACHE_PATH)) {
      const raw = fs.readFileSync(CACHE_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Failed to read translation cache:", err);
  }
  return DEFAULT_CACHE;
}

function writeCache(cache: CacheStore) {
  try {
    const parentDir = path.dirname(CACHE_PATH);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write translation cache:", err);
  }
}

// ----------------------------------------------------
// Handcrafted Offline High-Fidelity Bilingual Dictionaries
// ----------------------------------------------------
const BENGALI_UI_PRESETS: Record<string, string> = {
  "samiurrahaman rejvi": "সামিউর রহমান রেজভী",
  "Samiurrahaman Rejvi": "সামিউর রহমান রেজভী",
  "SAMIURRAHAMAN REJVI": "সামিউর রহমান রেজভী",
  "About Me": "আমার সম্পর্কে",
  "History & Chronology": "ইতিহাস ও কালানুক্রম",
  "Creative Repo Projects": "প্রজেক্ট সংগ্রহশালা",
  "Daily Visual archive": "দৈনিক ভিজ্যুয়াল আর্কাইভ",
  "Insights Journal Blogs": "ইনসাইট জার্নাল ব্লগ",
  "Contact": "যোগাযোগ",
  "Academic Context": "শিক্ষাগত তথ্য",
  "Postgraduate Goals": "স্নাতকোত্তর লক্ষ্য",
  "Back-Office Hub": "ব্যাক-অফিস হাব",
  "Visitor Telemetry Console": "ভিজিটর টেলিমেট্রি কনসোল",
  "Direct Coordinates": "সরাসরি যোগাযোগের ঠিকানা",
  "Demographical Context": "ডেমোগ্রাফিক তথ্য",
  "Primary Area:": "প্রধান এলাকা:",
  "University Base:": "বিশ্ববিদ্যালয়ের ভিত্তি:",
  "Relocation Targets:": "পুনর্বাসন লক্ষ্য:",
  "Languages:": "ভাষাসমূহ:",
  "Email (Primary):": "ইমেইল (প্রধান):",
  "Alternative Email:": "বিকল্প ইমেইল:",
  "Primary Contact:": "প্রধান যোগাযোগ:",
  "WhatsApp:": "হোয়াটসঅ্যাপ:",
  "Undergraduate Portfolio & Academic Curricular Database": "স্নাতক পোর্টফোলিও এবং একাডেমিক পাঠ্যক্রম ডেটাবেস",
  "Curated milestones, photography galleries, and technical journals.": "নির্বাচিত মাইলফলক, ফটোগ্রাফি গ্যালারী এবং প্রযুক্তিগত জার্নাল।",
  "Unique Sessions": "ইউনিক সেশন",
  "Click Interactions": "ক্লিক ইন্টারঅ্যাকশন",
  "Form Submissions": "ফর্ম সাবমিশন",
  "Enter Security Key": "সিকিউরিটি কী লিখুন",
  "Submit Code": "কোড সাবমিট করুন",
  "Access Level": "অ্যাক্সেস লেভেল",
  "Register to candidate's private digest list": "প্রার্থীর ব্যক্তিগত ডাইজেস্ট তালিকায় নিবন্ধন করুন",
  "Enter email address": "ইমেইল ঠিকানা লিখুন",
  "Transcribe digest lane": "ডাইজেস্ট লেন ট্রান্সক্রাইব করুন",
  "Verify mail dispatch": "مেইল প্রেরণ যাচাই করুন",
  "Connect with": "যুক্ত হোন",
  "What is your name?": "আপনার নাম কি?",
  "E-mail Address": "ইমেইল ঠিকানা",
  "Subject Matter": "বিষয়ের মূল কথা",
  "Write transmission query...": "আপনার বার্তা লিখুন...",
  "Dispatch Message": "বার্তা পাঠান",
  "Handcrafted typography personal-archive": "হস্তনির্মিত টাইপোগ্রাফি ব্যক্তিগত-আর্কাইভ",
  "All rights reserved.": "সর্বস্বত্ব সংরক্ষিত।",
  "Latest Academic Insights & Log Entries": "সর্বশেষ একাডেমিক অন্তর্দৃষ্টি এবং লগ এন্ট্রি",
  "Search articles...": "নিবন্ধ খুঁজুন...",
  "Clear filter": "ফিল্টার মুছুন",
  "All tags": "সব ট্যাগ",
  "Read Article": "আর্টিকেল পড়ুন",
  "Return to main insights index": "প্রধান ইনসাইট সূচীতে ফিরে যান",
  "Project Repository": "প্রজেক্ট সংগ্রহস্থল",
  "Search projects...": "প্রজেক্ট খুঁজুন...",
  "Live Demo": "লাইভ ডেমো",
  "Source Code": "উৎস কোড",
  "Close Description": "বর্ণনা বন্ধ করুন",
  "Milestones": "মাইলফলক",
  "Highlights": "হাইলাইট",
  "Photoshop Composite": "ফটোগ্রাফি এডিট",
  "System Architecture": "সিস্টেম আর্কিটেকচার",
  "Database Schema": "ডেটাবেস স্কিমা",
  "Transmission Dispatched!": "বার্তা পাঠানো হয়েছে!",
  "Thank you for your contact query. Your letter has been securely queued inside the Back Office message pool. The candidate will review it shortly.": "যোগাযোগ করার জন্য ধন্যবাদ। আপনার বার্তাটি ব্যাক অফিস মেসেজ পুলে সফলভাবে জমা হয়েছে। প্রর্থী খুব শীঘ্রই এটি পর্যালোচনা করবেন।",
  "Success! Registered to the candidate's private digest list!": "সফল হয়েছে! প্রার্থীর ব্যক্তিগত ডাইজেস্ট তালিকায় নিবন্ধিত হয়েছেন!",
  "Sitemaps": "সাইটম্যাপ",
  "Official Correspondence": "অফিসিয়াল যোগাযোগ",
  "About": "সম্পর্কে",
  "Show Less": "কম দেখান",
  "Show Story": "গল্প দেখান",
  "Academic Path": "শিক্ষাগত পথ",
  "Professional Work": "পেশাদার কাজ",
  "Personal Milestones": "ব্যক্তিগত মাইলফলক",
  "Search Chronicles...": "ইতিহাস খুঁজুন...",
  "Education Timeline": "শিক্ষার টাইমলাইন",
  "School": "স্কুল",
  "College": "কলেজ",
  "University": "বিশ্ববিদ্যালয়",
  "Postgraduate": "স্নাতকোত্তর",
  "Primary Academic Email:": "প্রধান একাডেমিক ইমেইল:",
  "Coordinates:": "যোগাযোগের ঠিকানা:",
  "Digital Photo Archive": "ডিজিটাল ফটো আর্কাইভ",
  "Close Viewer": "ভিউয়ার বন্ধ করুন",
  "Back to active directory context": "সক্রিয় ডিরেক্টরি প্রসঙ্গে ফিরে যান",
  "Browse real snapshot memories": "বাস্তব স্মৃতি স্ন্যাপশট ব্রাউজ করুন",
  "All Categories": "সব ক্যাটাগরি",
  "Academic Memory": "একাডেমিক স্মৃতি",
  "Hobby Snapshot": "শখের স্ন্যাপশট",
  "Creative Edit": "সৃজনশীল সম্পাদনা",
  "Nature View": "প্রকৃতির দৃশ্য",
  "Photo Details & Captured Chronicles": "ছবির বিবরণ এবং ক্যাপচার করা ইতিহাস",
  "Location:": "অবস্থান:",
  "Captured Date:": "ক্যাপচার তারিখ:",
  "Category:": "ক্যাটাগরি:",
  "View High Fidelity Render": "উচ্চ রেজোলিউশনে ছবি দেখুন"
};

const SPANISH_UI_PRESETS: Record<string, string> = {
  "About Me": "Sobre mí",
  "History & Chronology": "Historia y cronología",
  "Creative Repo Projects": "Proyectos de repositorio",
  "Daily Visual archive": "Archivo visual diario",
  "Insights Journal Blogs": "Blogs de ideas",
  "Contact": "Contacto",
  "Academic Context": "Contexto académico",
  "Postgraduate Goals": "Metas de posgrado",
  "Back-Office Hub": "Centro de control",
  "Visitor Telemetry Console": "Consola de telemetría de visitantes",
  "Direct Coordinates": "Coordenadas directas",
  "Demographical Context": "Contexto demográfico",
  "Primary Area:": "Área primaria:",
  "University Base:": "Base universitaria:",
  "Relocation Targets:": "Destinos de traslado:",
  "Languages:": "Idiomas:",
  "Email (Primary):": "Correo electrónico:",
  "Alternative Email:": "Correo alternativo:",
  "Primary Contact:": "Contacto primario:",
  "WhatsApp:": "WhatsApp:",
  "Unique Sessions": "Sesiones únicas",
  "Click Interactions": "Interacciones de clics",
  "Form Submissions": "Formularios enviados",
  "Dispatch Message": "Enviar mensaje",
  "All rights reserved.": "Todos los derechos reservados.",
  "Latest Academic Insights & Log Entries": "Últimas publicaciones y registros académicos",
  "Search articles...": "Buscar artículos...",
  "Project Repository": "Repositorio de proyectos",
  "Search projects...": "Buscar proyectos...",
  "Live Demo": "Demostración en vivo",
  "Source Code": "Código fuente",
  "Milestones": "Hitos",
  "Highlights": "Destacados"
};

// ----------------------------------------------------
// Database REST APIs
// ----------------------------------------------------

const LANG_MAP: Record<string, string> = {
  bn: "Bengali (বাংলা)",
  ms: "Malay (Bahasa Melayu)",
  cs: "Czech (Čeština)",
  es: "Spanish (Español)",
  ar: "Arabic (العربية)",
  fr: "French (Français)",
  de: "German (Deutsch)",
  hi: "Hindi (हिन्दी)",
  ja: "Japanese (日本語)",
  ko: "Korean (한국어)",
  "zh-CN": "Chinese Simplified (简体中文)",
  "zh-TW": "Chinese Traditional (繁體中文)",
  pt: "Portuguese (Português)",
  it: "Italian (Italiano)",
  ru: "Russian (Русский)",
  ur: "Urdu (اردو)",
  id: "Indonesian (Bahasa Indonesia)",
  tr: "Turkish (Türkçe)",
  vi: "Vietnamese (Tiếng Việt)",
  nl: "Dutch (Nederlands)",
  pl: "Polish (Polski)",
  sv: "Swedish (Svenska)",
  th: "Thai (ไทย)",
  la: "Latin"
};

// ----------------------------------------------------
// Gemini rate-limit and API health tracker
// ----------------------------------------------------
let geminiCooldownUntil = 0;

function checkGeminiAvailability(): boolean {
  if (Date.now() < geminiCooldownUntil) {
    return false;
  }
  return true;
}

function handleGeminiError(err: any): void {
  const errStr = String(err);
  if (
    errStr.includes("429") ||
    errStr.includes("quota") ||
    errStr.includes("Quota") ||
    errStr.includes("RESOURCE_EXHAUSTED") ||
    errStr.includes("limit")
  ) {
    // Put Gemini on a 15-minute cooldown to prevent spamming failed quota calls
    geminiCooldownUntil = Date.now() + 15 * 60 * 1000;
    console.log(`[Gemini API Status] Quota/Limit detected. Entering cooldown for 15 minutes.`);
  } else {
    // Put on a short 1-minute cooldown for other transient errors
    geminiCooldownUntil = Date.now() + 1 * 60 * 1000;
    console.log(`[Gemini API Status] Exception detected: ${errStr.substring(0, 100)}. Entering short fallback cooldown.`);
  }
}

async function translateDbStore(db: DbStore, lang: string): Promise<DbStore> {
  // Deep clone initial db structure for mapping
  const cloned: DbStore = JSON.parse(JSON.stringify(db));

  if (lang === "bn" && cloned.profileDetails) {
    if (cloned.profileDetails.name === "samiurrahaman rejvi" || cloned.profileDetails.name === "samiurrahaman Rejvi" || cloned.profileDetails.name === "Samiur Rahaman Rejvi") {
      cloned.profileDetails.name = "সামিউর রহমান রেজভী";
    }
  }
  return cloned;
}

// Real-time server-side events (SSE) endpoint to handle instant sync updates with client tabs
app.get("/api/realtime-updates", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Send initial establishing connection message
  res.write("data: connected\n\n");

  sseClients.push(res);

  req.on("close", () => {
    sseClients = sseClients.filter((c) => c !== res);
  });
});

// GET /api/site-data
app.get("/api/site-data", async (req, res) => {
  const db = readDb();
  const lang = req.query.lang as string;

  if (!lang || lang === "en") {
    res.json(db);
    return;
  }

  // Read disk cache
  const cache = readCache();
  if (cache.db && cache.db[lang]) {
    res.json(cache.db[lang]);
    return;
  }

  // Translate and update cache
  const translatedDb = await translateDbStore(db, lang);
  if (!cache.db) cache.db = {};
  cache.db[lang] = translatedDb;
  writeCache(cache);

  res.json(translatedDb);
});

// UI Static Translation List and APIs
const UI_STRINGS = [
  "About Me",
  "History & Chronology",
  "Creative Repo Projects",
  "Daily Visual archive",
  "Insights Journal Blogs",
  "Contact",
  "Academic Context",
  "Postgraduate Goals",
  "Back-Office Hub",
  "Visitor Telemetry Console",
  "Direct Coordinates",
  "Demographical Context",
  "Primary Area:",
  "University Base:",
  "Relocation Targets:",
  "Languages:",
  "Email (Primary):",
  "Alternative Email:",
  "Primary Contact:",
  "WhatsApp:",
  "Undergraduate Portfolio & Academic Curricular Database",
  "Curated milestones, photography galleries, and technical journals.",
  "Unique Sessions",
  "Click Interactions",
  "Form Submissions",
  "Enter Security Key",
  "Submit Code",
  "Access Level",
  "Register to candidate's private digest list",
  "Enter email address",
  "Transcribe digest lane",
  "Verify mail dispatch",
  "Connect with",
  "What is your name?",
  "E-mail Address",
  "Subject Matter",
  "Write transmission query...",
  "Dispatch Message",
  "Handcrafted typography personal-archive",
  "All rights reserved.",
  "Latest Academic Insights & Log Entries",
  "Search articles...",
  "Clear filter",
  "All tags",
  "Read Article",
  "Return to main insights index",
  "Project Repository",
  "Search projects...",
  "Live Demo",
  "Source Code",
  "Close Description",
  "Milestones",
  "Highlights",
  "Photoshop Composite",
  "System Architecture",
  "Database Schema",
  "Transmission Dispatched!",
  "Thank you for your contact query. Your letter has been securely queued inside the Back Office message pool. The candidate will review it shortly.",
  "Success! Registered to the candidate's private digest list!",
  "Sitemaps",
  "Official Correspondence",
  "About",
  "Show Less",
  "Show Story",
  "Academic Path",
  "Professional Work",
  "Personal Milestones",
  "Search Chronicles...",
  "Education Timeline",
  "School",
  "College",
  "University",
  "Postgraduate",
  "Primary Academic Email:",
  "Coordinates:",
  "Digital Photo Archive",
  "Close Viewer",
  "Back to active directory context",
  "Browse real snapshot memories",
  "All Categories",
  "Academic Memory",
  "Hobby Snapshot",
  "Creative Edit",
  "Nature View",
  "Photo Details & Captured Chronicles",
  "Location:",
  "Captured Date:",
  "Category:",
  "View High Fidelity Render"
];

async function translateUiStrings(lang: string): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  
  if (lang === "bn") {
    Object.assign(result, BENGALI_UI_PRESETS);
  } else if (lang === "es") {
    Object.assign(result, SPANISH_UI_PRESETS);
  }

  for (const s of UI_STRINGS) {
    if (!result[s]) {
      result[s] = s;
    }
  }

  return result;
}

async function batchTranslateTexts(texts: string[], lang: string): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  for (const text of texts) {
    if (!text) continue;
    const trimmed = text.trim();
    if (!trimmed) continue;
    
    let presetMatch: string | null = null;
    if (lang === "bn" && BENGALI_UI_PRESETS[trimmed]) {
      presetMatch = BENGALI_UI_PRESETS[trimmed];
    } else if (lang === "es" && SPANISH_UI_PRESETS[trimmed]) {
      presetMatch = SPANISH_UI_PRESETS[trimmed];
    }

    if (presetMatch) {
      results[trimmed] = presetMatch;
    } else {
      if (lang === "bn" && (trimmed === "samiurrahaman rejvi" || trimmed === "samiurrahaman Rejvi" || trimmed === "Samiur Rahaman Rejvi")) {
        results[trimmed] = "সামিউর রহমান রেজভী";
      } else {
        results[trimmed] = trimmed;
      }
    }
  }
  return results;
}

// POST /api/upload - Handle file upload and store permanently in Cloudinary
app.post("/api/upload", upload.single("image"), async (req, res): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded. Please double-check file field name is 'image'." });
      return;
    }

    console.log(`[Upload Service] Processing file ${req.file.originalname} (${req.file.size} bytes)...`);

    // 1. Check if Vercel Blob Storage is configured and active
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      console.log(`[Vercel Blob] Uploading file ${req.file.originalname} using Vercel Blob...`);
      const fileData = fs.readFileSync(req.file.path);
      const blob = await put(req.file.originalname, fileData, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN
      });
      console.log(`[Vercel Blob] Upload successful! URL: ${blob.url}`);

      // Clean up local temp file
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.warn("[Local Cleanup] Failed to unlink temp file:", unlinkErr);
      }

      res.json({ secure_url: blob.url });
      return;
    }

    // 2. Otherwise fall back to Cloudinary if its credentials are set
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.warn("[Cloudinary Upload] API credentials missing from environment. Falling back to base64 encoding simulation.");
      // Read file and fallback to base64 in case Cloudinary variables are not configured in AI Studio secrets yet!
      // This is extremely graceful and prevents app from failing in preview mode before the user supplies credentials!
      const fileData = fs.readFileSync(req.file.path);
      const mimeType = req.file.mimetype || "image/png";
      const base64Str = `data:${mimeType};base64,${fileData.toString("base64")}`;

      // Clean up temp file
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.warn("[Local Cleanup] Failed to unlink temp file:", unlinkErr);
      }

      res.json({ secure_url: base64Str });
      return;
    }

    // Upload local temp file directly to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "portfolio_assets",
      resource_type: "auto"
    });

    console.log(`[Cloudinary Upload] Upload successful! URL: ${uploadResult.secure_url}`);

    // Remove the temporary file using fs.unlinkSync
    try {
      fs.unlinkSync(req.file.path);
    } catch (unLinkErr) {
      console.warn("[Cloudinary Cleanup] Failed to delete temporary file:", unLinkErr);
    }

    res.json({ secure_url: uploadResult.secure_url });
  } catch (err: any) {
    console.error("[Cloudinary Upload] Failed:", err);
    res.status(500).json({ error: err?.message || "Internal Cloudinary upload server failure." });
  }
});

// POST /api/translate-texts
app.post("/api/translate-texts", async (req, res) => {
  const { texts, lang } = req.body;

  if (!lang || lang === "en" || !Array.isArray(texts) || texts.length === 0) {
    res.json({});
    return;
  }

  try {
    const translations = await batchTranslateTexts(texts, lang);
    res.json(translations);
  } catch (err) {
    console.error("Translate-texts endpoint failed:", err);
    res.json({}); // Gratefully return empty on severe failure so client doesn’t hang
  }
});

// GET /api/ui-translations
app.get("/api/ui-translations", async (req, res) => {
  const lang = req.query.lang as string;

  if (!lang || lang === "en") {
    res.json({});
    return;
  }

  const cache = readCache();
  if (cache.ui && cache.ui[lang]) {
    res.json(cache.ui[lang]);
    return;
  }

  const translations = await translateUiStrings(lang);
  if (!cache.ui) cache.ui = {};
  cache.ui[lang] = translations;
  writeCache(cache);

  res.json(translations);
});

// POST /api/click-visit
app.post("/api/click-visit", (req, res) => {
  const db = readDb();
  db.visitorCount = (db.visitorCount || 0) + 1;
  writeDb(db, ["visitorCount"]);
  res.json({ visitorCount: db.visitorCount });
});

// POST /api/contact/submit
app.post("/api/contact/submit", (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    res.status(400).json({ error: "Name, email, and message are required." });
    return;
  }
  const db = readDb();
  const newMsg = {
    id: `msg-${Date.now()}`,
    name,
    email,
    subject: subject || "No Subject",
    message,
    createdAt: new Date().toISOString()
  };
  if (!db.messages) {
    db.messages = [];
  }
  db.messages.push(newMsg);
  writeDb(db, ["messages"]);
  res.json({ success: true, data: newMsg });
});

// POST /api/recommendations/submit
app.post("/api/recommendations/submit", (req, res) => {
  const { name, role, company, message } = req.body;
  if (!name || !role || !message) {
    res.status(400).json({ error: "Key fields required." });
    return;
  }
  const db = readDb();
  const proposed: Recommendation = {
    id: `rec-user-${Date.now()}`,
    name,
    role,
    company: company || "Academic Partner",
    message,
    approved: false, // Moderated by default in Back Office Console
    date: new Date().toISOString().substring(0, 7),
    createdAt: new Date().toISOString()
  };
  db.recommendations.push(proposed);
  writeDb(db, ["recommendations"]);
  res.json(proposed);
});

// POST /api/recommendations/approve
app.post("/api/recommendations/approve", (req, res) => {
  const { id } = req.body;
  if (!id) {
    res.status(400).json({ error: "ID is required." });
    return;
  }
  const db = readDb();
  db.recommendations = db.recommendations.map(r => {
    if (r.id === id) {
      return { ...r, approved: true };
    }
    return r;
  });
  writeDb(db, ["recommendations"]);
  res.json(db.recommendations);
});

// POST /api/recommendations/delete
app.post("/api/recommendations/delete", (req, res) => {
  const { id } = req.body;
  if (!id) {
    res.status(400).json({ error: "ID is required." });
    return;
  }
  const db = readDb();
  db.recommendations = db.recommendations.filter(r => r.id !== id);
  writeDb(db, ["recommendations"]);
  res.json(db.recommendations);
});

// POST /api/subscribe
app.post("/api/subscribe", (req, res) => {
  const db = readDb();
  db.stats.subscribers += 1;
  writeDb(db, ["stats"]);
  res.json({ subscribers: db.stats.subscribers });
});

// POST /api/admin/update-social-stats
app.post("/api/admin/update-social-stats", (req, res) => {
  const { github, facebook, twitter } = req.body;
  const db = readDb();
  if (typeof github === "number" && github >= 0) db.stats.github = github;
  if (typeof facebook === "number" && facebook >= 0) db.stats.facebook = facebook;
  if (typeof twitter === "number" && twitter >= 0) db.stats.twitter = twitter;
  writeDb(db);
  res.json(db.stats);
});

// POST /api/admin/save-all
app.post("/api/admin/save-all", (req, res) => {
  const { photos, milestones, blogs, gallery, projects, socialLinks, profileDetails, stats, securityQuestions, messages } = req.body;
  const db = readDb();
  if (photos) db.photos = photos;
  if (milestones) db.milestones = milestones;
  if (blogs) db.blogs = blogs;
  if (gallery) db.gallery = gallery;
  if (projects) db.projects = projects;
  if (socialLinks) db.socialLinks = socialLinks;
  if (profileDetails) db.profileDetails = profileDetails;
  if (stats) db.stats = stats;
  if (securityQuestions) db.securityQuestions = securityQuestions;
  if (messages) db.messages = messages;
  writeDb(db);
  res.json({ success: true, db });
});

// ----------------------------------------------------
// BLOGS CRUD APIS
// ----------------------------------------------------
app.post("/api/blogs/create", (req, res) => {
  const { title, content, imageUrl } = req.body;
  if (!title || !content) {
    res.status(400).json({ error: "Title and content are required." });
    return;
  }
  const db = readDb();
  const proposed: BlogPost = {
    id: `blog-${Date.now()}`,
    title,
    content,
    imageUrl: imageUrl || undefined,
    likes: 0,
    dislikes: 0,
    comments: [],
    createdAt: new Date().toISOString()
  };
  db.blogs.unshift(proposed);
  writeDb(db);
  res.json(db.blogs);
});

app.post("/api/blogs/delete", (req, res) => {
  const { id } = req.body;
  const db = readDb();
  db.blogs = db.blogs.filter(b => b.id !== id);
  writeDb(db, ["blogs"]);
  res.json(db.blogs);
});

app.post("/api/blogs/like", (req, res) => {
  const { id, decrement } = req.body;
  const db = readDb();
  db.blogs = db.blogs.map(b => b.id === id ? { ...b, likes: Math.max(0, b.likes + (decrement ? -1 : 1)) } : b);
  writeDb(db, ["blogs"]);
  res.json(db.blogs);
});

app.post("/api/blogs/dislike", (req, res) => {
  const { id, decrement } = req.body;
  const db = readDb();
  db.blogs = db.blogs.map(b => b.id === id ? { ...b, dislikes: Math.max(0, b.dislikes + (decrement ? -1 : 1)) } : b);
  writeDb(db, ["blogs"]);
  res.json(db.blogs);
});

function insertNestedReply(comments: any[], parentId: string, newReply: any): boolean {
  for (let i = 0; i < comments.length; i++) {
    if (comments[i].id === parentId) {
      if (!comments[i].replies) {
        comments[i].replies = [];
      }
      comments[i].replies.push(newReply);
      return true;
    }
    if (comments[i].replies && comments[i].replies.length > 0) {
      const found = insertNestedReply(comments[i].replies, parentId, newReply);
      if (found) return true;
    }
  }
  return false;
}

app.post("/api/blogs/comment", (req, res) => {
  const { id, parentId, name, email, message } = req.body;
  if (!id || !name || !email || !message) {
    res.status(400).json({ error: "Missing required comment parameters." });
    return;
  }
  const db = readDb();
  const newComment: Comment = {
    id: `cmt-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    name,
    email,
    message,
    createdAt: new Date().toISOString(),
    replies: []
  };
  db.blogs = db.blogs.map(b => {
    if (b.id === id) {
      let updatedComments = [...b.comments];
      if (parentId) {
        insertNestedReply(updatedComments, parentId, newComment);
      } else {
        updatedComments.push(newComment);
      }
      return { ...b, comments: updatedComments };
    }
    return b;
  });
  writeDb(db, ["blogs"]);
  res.json(db.blogs);
});

// ----------------------------------------------------
// GALLERY CRUD APIS
// ----------------------------------------------------
app.post("/api/gallery/create", (req, res) => {
  const { description, imageUrl } = req.body;
  if (!imageUrl || !description) {
    res.status(400).json({ error: "ImageUrl and description are required." });
    return;
  }
  const db = readDb();
  const proposed: GalleryItem = {
    id: `gal-${Date.now()}`,
    description,
    imageUrl,
    likes: 0,
    dislikes: 0,
    comments: [],
    createdAt: new Date().toISOString()
  };
  db.gallery.unshift(proposed);
  writeDb(db, ["gallery"]);
  res.json(db.gallery);
});

app.post("/api/gallery/delete", (req, res) => {
  const { id } = req.body;
  const db = readDb();
  db.gallery = db.gallery.filter(g => g.id !== id);
  writeDb(db, ["gallery"]);
  res.json(db.gallery);
});

app.post("/api/gallery/like", (req, res) => {
  const { id, decrement } = req.body;
  const db = readDb();
  db.gallery = db.gallery.map(g => g.id === id ? { ...g, likes: Math.max(0, g.likes + (decrement ? -1 : 1)) } : g);
  writeDb(db, ["gallery"]);
  res.json(db.gallery);
});

app.post("/api/gallery/dislike", (req, res) => {
  const { id, decrement } = req.body;
  const db = readDb();
  db.gallery = db.gallery.map(g => g.id === id ? { ...g, dislikes: Math.max(0, g.dislikes + (decrement ? -1 : 1)) } : g);
  writeDb(db, ["gallery"]);
  res.json(db.gallery);
});

app.post("/api/gallery/comment", (req, res) => {
  const { id, parentId, name, email, message } = req.body;
  if (!id || !name || !email || !message) {
    res.status(400).json({ error: "Missing required comment parameters." });
    return;
  }
  const db = readDb();
  const newComment: Comment = {
    id: `cmt-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    name,
    email,
    message,
    createdAt: new Date().toISOString(),
    replies: []
  };
  db.gallery = db.gallery.map(g => {
    if (g.id === id) {
      let updatedComments = [...g.comments];
      if (parentId) {
        insertNestedReply(updatedComments, parentId, newComment);
      } else {
        updatedComments.push(newComment);
      }
      return { ...g, comments: updatedComments };
    }
    return g;
  });
  writeDb(db, ["gallery"]);
  res.json(db.gallery);
});

// ----------------------------------------------------
// PROJECTS CRUD APIS
// ----------------------------------------------------
app.post("/api/projects/create", (req, res) => {
  const { title, description, techStack, link, githubUrl, category, longDescription, imageUrl } = req.body;
  if (!title || !description || !category) {
    res.status(400).json({ error: "Title, description, and category are required." });
    return;
  }
  const db = readDb();
  const proposed: ProjectItem = {
    id: `proj-${Date.now()}`,
    title,
    description,
    techStack: Array.isArray(techStack) ? techStack : (techStack ? String(techStack).split(",").map(t => t.trim()) : []),
    link: link || undefined,
    githubUrl: githubUrl || undefined,
    category,
    longDescription: longDescription || undefined,
    imageUrl: imageUrl || undefined,
    createdAt: new Date().toISOString()
  };
  db.projects.unshift(proposed);
  writeDb(db);
  res.json(db.projects);
});

app.post("/api/projects/delete", (req, res) => {
  const { id } = req.body;
  const db = readDb();
  db.projects = db.projects.filter(p => p.id !== id);
  writeDb(db);
  res.json(db.projects);
});

// ----------------------------------------------------
// MILESTONES / TIMELINE CRUD APIS
// ----------------------------------------------------
app.post("/api/milestones/create", (req, res) => {
  const { year, title, subtitle, description, type, story, imageUrl } = req.body;
  if (!year || !title || !description || !type) {
    res.status(400).json({ error: "Year, Title, Description, and Type are required." });
    return;
  }
  const db = readDb();
  const proposed: JourneyMilestone = {
    id: `ms-${Date.now()}`,
    year,
    title,
    subtitle: subtitle || "",
    description,
    type,
    story: story || undefined,
    imageUrl: imageUrl || undefined,
    createdAt: new Date().toISOString()
  };
  db.milestones.push(proposed);
  // Sort from past years to future years (milestone year numeric comparison)
  db.milestones.sort((a, b) => {
    const formatYear = (y: string) => parseInt(y.replace(/[^0-9]/g, "")) || 0;
    return formatYear(a.year) - formatYear(b.year);
  });
  writeDb(db);
  res.json(db.milestones);
});

app.post("/api/milestones/delete", (req, res) => {
  const { id } = req.body;
  const db = readDb();
  db.milestones = db.milestones.filter(m => m.id !== id);
  writeDb(db);
  res.json(db.milestones);
});


// ----------------------------------------------------
// DYNAMIC PROFILE & SOCIAL LINKS MANAGEMENT APIS
// ----------------------------------------------------

app.post("/api/profile/update", (req, res) => {
  const { 
    name, tagline, email, altEmail, phone, whatsapp, aboutText,
    universityName, universityLink, highSchoolName, highSchoolLink,
    collegeName, collegeLink, targetMasterUni, targetMasterLink,
    coverUrl, profilePictureUrl, blogSectionTagline, blogSectionTitle, blogSectionDescription
  } = req.body;
  
  const db = readDb();
  if (!db.profileDetails) {
    db.profileDetails = {
      name: "Samiur Rahaman Rejvi",
      tagline: "Computer Science Student & Portfolio Retoucher",
      email: "samiurrahamanrejvi@gmail.com",
      altEmail: "samiur.rejvi.it@gmail.com",
      phone: "+60 11-3612 1380",
      whatsapp: "+601136121380",
      aboutText: "A computer science engineering student and expert raster manipulation composite retoucher.",
      universityName: "Geomatika University",
      universityLink: "https://geomatika.edu.my",
      highSchoolName: "Prague applied research center",
      highSchoolLink: "https://cuni.cz/UKEN-1.html",
      collegeName: "Cantt College",
      collegeLink: "https://www.google.com/search?q=Cantt+College",
      targetMasterUni: "Czech premier research groups",
      targetMasterLink: "https://cuni.cz/UKEN-1.html",
      coverUrl: "",
      profilePictureUrl: "",
      blogSectionTagline: "",
      blogSectionTitle: "",
      blogSectionDescription: ""
    };
  }
  
  db.profileDetails = {
    name: name !== undefined ? name : db.profileDetails.name,
    tagline: tagline !== undefined ? tagline : db.profileDetails.tagline,
    email: email !== undefined ? email : db.profileDetails.email,
    altEmail: altEmail !== undefined ? altEmail : db.profileDetails.altEmail,
    phone: phone !== undefined ? phone : db.profileDetails.phone,
    whatsapp: whatsapp !== undefined ? whatsapp : db.profileDetails.whatsapp,
    aboutText: aboutText !== undefined ? aboutText : db.profileDetails.aboutText,
    universityName: universityName !== undefined ? universityName : db.profileDetails.universityName,
    universityLink: universityLink !== undefined ? universityLink : db.profileDetails.universityLink,
    highSchoolName: highSchoolName !== undefined ? highSchoolName : db.profileDetails.highSchoolName,
    highSchoolLink: highSchoolLink !== undefined ? highSchoolLink : db.profileDetails.highSchoolLink,
    collegeName: collegeName !== undefined ? collegeName : db.profileDetails.collegeName,
    collegeLink: collegeLink !== undefined ? collegeLink : db.profileDetails.collegeLink,
    targetMasterUni: targetMasterUni !== undefined ? targetMasterUni : db.profileDetails.targetMasterUni,
    targetMasterLink: targetMasterLink !== undefined ? targetMasterLink : db.profileDetails.targetMasterLink,
    coverUrl: coverUrl !== undefined ? coverUrl : db.profileDetails.coverUrl,
    profilePictureUrl: profilePictureUrl !== undefined ? profilePictureUrl : db.profileDetails.profilePictureUrl,
    blogSectionTagline: blogSectionTagline !== undefined ? blogSectionTagline : db.profileDetails.blogSectionTagline,
    blogSectionTitle: blogSectionTitle !== undefined ? blogSectionTitle : db.profileDetails.blogSectionTitle,
    blogSectionDescription: blogSectionDescription !== undefined ? blogSectionDescription : db.profileDetails.blogSectionDescription
  };
  writeDb(db);
  res.json(db.profileDetails);
});

app.post("/api/socials/create", (req, res) => {
  const { platform, url, label, metric, iconCode } = req.body;
  if (!platform || !url) {
    res.status(400).json({ error: "Platform and URL are required." });
    return;
  }
  const db = readDb();
  if (!db.socialLinks) db.socialLinks = [];
  const newLink: SocialLink = {
    id: `social-${Date.now()}`,
    platform,
    url,
    label: label || `${platform} profile`,
    metric: metric || "",
    iconCode: iconCode || "Link"
  };
  db.socialLinks.push(newLink);
  writeDb(db);
  res.json(db.socialLinks);
});

app.post("/api/socials/update", (req, res) => {
  const { id, platform, url, label, metric, iconCode } = req.body;
  if (!id) {
    res.status(400).json({ error: "ID is required." });
    return;
  }
  const db = readDb();
  if (!db.socialLinks) db.socialLinks = [];
  db.socialLinks = db.socialLinks.map(s => {
    if (s.id === id) {
      return {
        ...s,
        platform: platform !== undefined ? platform : s.platform,
        url: url !== undefined ? url : s.url,
        label: label !== undefined ? label : s.label,
        metric: metric !== undefined ? metric : s.metric,
        iconCode: iconCode !== undefined ? iconCode : s.iconCode
      };
    }
    return s;
  });
  writeDb(db);
  res.json(db.socialLinks);
});

app.post("/api/socials/delete", (req, res) => {
  const { id } = req.body;
  if (!id) {
    res.status(400).json({ error: "ID is required to delete." });
    return;
  }
  const db = readDb();
  if (!db.socialLinks) db.socialLinks = [];
  db.socialLinks = db.socialLinks.filter(s => s.id !== id);
  writeDb(db);
  res.json(db.socialLinks);
});

// ----------------------------------------------------
// EDIT ACTIONS FOR PORTFOLIO PARAMS
// ----------------------------------------------------

app.post("/api/blogs/update", (req, res) => {
  const { id, title, content, imageUrl } = req.body;
  if (!id) {
    res.status(400).json({ error: "ID is required." });
    return;
  }
  const db = readDb();
  db.blogs = db.blogs.map(b => {
    if (b.id === id) {
      return {
        ...b,
        title: title !== undefined ? title : b.title,
        content: content !== undefined ? content : b.content,
        imageUrl: imageUrl !== undefined ? imageUrl : b.imageUrl
      };
    }
    return b;
  });
  writeDb(db);
  res.json(db.blogs);
});

app.post("/api/projects/update", (req, res) => {
  const { id, title, description, longDescription, category, imageUrl, link, githubUrl, techStack } = req.body;
  if (!id) {
    res.status(400).json({ error: "Project ID is required." });
    return;
  }
  const db = readDb();
  db.projects = db.projects.map(p => {
    if (p.id === id) {
      return {
        ...p,
        title: title !== undefined ? title : p.title,
        description: description !== undefined ? description : p.description,
        longDescription: longDescription !== undefined ? longDescription : p.longDescription,
        category: category !== undefined ? category : p.category,
        imageUrl: imageUrl !== undefined ? imageUrl : p.imageUrl,
        link: link !== undefined ? link : p.link,
        githubUrl: githubUrl !== undefined ? githubUrl : p.githubUrl,
        techStack: techStack !== undefined ? (Array.isArray(techStack) ? techStack : String(techStack).split(",").map(t => t.trim())) : p.techStack
      };
    }
    return p;
  });
  writeDb(db);
  res.json(db.projects);
});

app.post("/api/gallery/update", (req, res) => {
  const { id, description, imageUrl } = req.body;
  if (!id) {
    res.status(400).json({ error: "ID is required." });
    return;
  }
  const db = readDb();
  db.gallery = db.gallery.map(g => {
    if (g.id === id) {
      return {
        ...g,
        description: description !== undefined ? description : g.description,
        imageUrl: imageUrl !== undefined ? imageUrl : g.imageUrl
      };
    }
    return g;
  });
  writeDb(db);
  res.json(db.gallery);
});

app.post("/api/milestones/update", (req, res) => {
  const { id, year, title, subtitle, description, type, story, imageUrl } = req.body;
  if (!id) {
    res.status(400).json({ error: "ID is required." });
    return;
  }
  const db = readDb();
  db.milestones = db.milestones.map(m => {
    if (m.id === id) {
      return {
        ...m,
        year: year !== undefined ? year : m.year,
        title: title !== undefined ? title : m.title,
        subtitle: subtitle !== undefined ? subtitle : m.subtitle,
        description: description !== undefined ? description : m.description,
        type: type !== undefined ? type : m.type,
        story: story !== undefined ? story : m.story,
        imageUrl: imageUrl !== undefined ? imageUrl : m.imageUrl
      };
    }
    return m;
  });
  db.milestones.sort((a, b) => {
    const formatYear = (y: string) => parseInt(y.replace(/[^0-9]/g, "")) || 0;
    return formatYear(a.year) - formatYear(b.year);
  });
  writeDb(db);
  res.json(db.milestones);
});

// ----------------------------------------------------
// MAP PHOTOS / VISUAL ARCHIVE CRUD APIS
// ----------------------------------------------------

app.post("/api/photos/create", (req, res) => {
  const { url, location, title, description, story, category, date } = req.body;
  if (!url || !location || !title) {
    res.status(400).json({ error: "URL, Location and Title are required." });
    return;
  }
  const db = readDb();
  if (!db.photos) db.photos = [];
  const proposed: ArchivePhoto = {
    id: `photo-${Date.now()}`,
    url,
    location,
    title,
    description: description || "Added via Back Office Console.",
    story: story || "",
    category: category || "travel",
    date: date || new Date().toISOString().substring(0, 7),
    createdAt: new Date().toISOString()
  };
  db.photos.unshift(proposed);
  writeDb(db);
  res.json(db.photos);
});

app.post("/api/photos/update", (req, res) => {
  const { id, url, location, title, description, story, category, date } = req.body;
  if (!id) {
    res.status(400).json({ error: "ID is required." });
    return;
  }
  const db = readDb();
  if (!db.photos) db.photos = [];
  db.photos = db.photos.map(p => {
    if (p.id === id) {
      return {
        ...p,
        url: url !== undefined ? url : p.url,
        location: location !== undefined ? location : p.location,
        title: title !== undefined ? title : p.title,
        description: description !== undefined ? description : p.description,
        story: story !== undefined ? story : p.story,
        category: category !== undefined ? category : p.category,
        date: date !== undefined ? date : p.date
      };
    }
    return p;
  });
  writeDb(db);
  res.json(db.photos);
});

app.post("/api/photos/delete", (req, res) => {
  const { id } = req.body;
  if (!id) {
    res.status(400).json({ error: "ID is required." });
    return;
  }
  const db = readDb();
  if (!db.photos) db.photos = [];
  db.photos = db.photos.filter(p => p.id !== id);
  writeDb(db);
  res.json(db.photos);
});

app.post("/api/messages/delete", (req, res) => {
  const { id } = req.body;
  if (!id) {
    res.status(400).json({ error: "ID is required." });
    return;
  }
  const db = readDb();
  if (!db.messages) db.messages = [];
  db.messages = db.messages.filter(m => m.id !== id);
  writeDb(db);
  res.json(db.messages);
});

// Security Gatekeeper Questions Endpoints
app.get("/api/security-questions", (req, res) => {
  const db = readDb();
  res.json(db.securityQuestions || DEFAULT_STORE.securityQuestions);
});

app.post("/api/security-questions/update", (req, res) => {
  const { questions } = req.body;
  if (!Array.isArray(questions)) {
    res.status(400).json({ error: "Questions array is required." });
    return;
  }
  const db = readDb();
  db.securityQuestions = questions;
  writeDb(db);
  res.json(db.securityQuestions);
});

// Security Gatekeeper Gear Combination Lock Endpoint
const FAILED_ATTEMPTS_COOLDOWNS = new Map<string, { count: number; lockedUntil: number }>();

app.post("/api/admin/verify-combination", (req, res) => {
  const { combination } = req.body;
  const ip = req.ip || "unknown-client";
  
  const currentTime = Date.now();
  const cooldownInfo = FAILED_ATTEMPTS_COOLDOWNS.get(ip) || { count: 0, lockedUntil: 0 };
  
  if (cooldownInfo.lockedUntil > currentTime) {
    const remainMs = Math.ceil((cooldownInfo.lockedUntil - currentTime) / 1000);
    res.status(429).json({ 
      error: `Security lockdown active. Brute-force protection in effect. Try again in ${remainMs} second(s).`,
      cooldown: true,
      secondsLeft: remainMs
    });
    return;
  }

  if (!Array.isArray(combination) || combination.length !== 3) {
    res.status(400).json({ error: "Malformatted security combination request payload." });
    return;
  }

  const combinationStr = combination.map(String).join("");
  const candidateHash = crypto.createHash("sha256").update(combinationStr).digest("hex");
  
  // Secure SHA-256 target verification
  const envHash = process.env.ADMIN_GEAR_COMBINATION_HASH;
  const targetHash = envHash && envHash.trim() !== ""
    ? envHash.trim()
    : "9ea8a37aaadadd2e04edf3161db85add4f075e3459acba9b0fe2320c5215b101"; // Default SHA-256 for "777358"

  const isVerified = candidateHash === targetHash;

  if (isVerified) {
    FAILED_ATTEMPTS_COOLDOWNS.delete(ip);
    res.json({ success: true, message: "Security lock disengaged. Administrative pathway granted." });
  } else {
    const newCount = cooldownInfo.count + 1;
    let penaltyMs = 0;
    
    if (newCount >= 3) {
      // 2 seconds freeze penalty for brute-force mitigation
      penaltyMs = 2000;
    }
    
    FAILED_ATTEMPTS_COOLDOWNS.set(ip, {
      count: newCount,
      lockedUntil: penaltyMs > 0 ? currentTime + penaltyMs : 0
    });
    
    res.status(401).json({ 
      error: "Verification failed: Gear alignment combination is incorrect.", 
      consecutiveFailedAttempts: newCount, 
      lockedForMs: penaltyMs 
    });
  }
});

// GET /api/admin/sync-status
app.get("/api/admin/sync-status", (req, res) => {
  res.json({
    isFirestoreQuotaExceeded,
    isListeningToFirestore,
    firestoreEnabled: !!firestore,
    projectName: firestore ? (firestore.app?.options?.projectId || "configured-project") : null
  });
});

// POST /api/admin/force-sync
app.post("/api/admin/force-sync", async (req, res) => {
  if (!firestore) {
    res.status(400).json({ success: false, error: "Cloud Firestore is not initialized or configured in this workspace." });
    return;
  }

  try {
    console.log("[Firestore Manual Sync] Triggering full cloud sync from admin control...");
    
    // Reset the quota flag to allow reading/writing on retry
    isFirestoreQuotaExceeded = false;
    
    // Reset baseline key states to force fresh checks and synchronization
    Object.keys(lastSyncedKeys).forEach((k) => delete lastSyncedKeys[k]);

    // Force run sync
    await syncFromFirestore();

    // Notify all active connected tabs/clients so that they re-fetch and update UI in real-time
    notifyClientsOfUpdate();

    res.json({ 
      success: true, 
      message: "Cloud database backup successfully synchronized with local server records and pushed to active browser tabs.",
      isFirestoreQuotaExceeded,
      isListeningToFirestore
    });
  } catch (err: any) {
    console.error("[Firestore Manual Sync] Manual force sync failed:", err);
    res.status(500).json({ 
      success: false, 
      error: err?.message || String(err),
      isFirestoreQuotaExceeded,
      isListeningToFirestore
    });
  }
});

// POST /api/admin/reset-database
app.post("/api/admin/reset-database", async (req, res) => {
  try {
    console.log("[Database Reset] Performing full database reset requested by administrator...");

    // Reset quota flag
    isFirestoreQuotaExceeded = false;

    // Reset baseline key states to force fresh checks and synchronization
    Object.keys(lastSyncedKeys).forEach((k) => delete lastSyncedKeys[k]);

    // Construct a completely clean slate database
    const cleanDb: DbStore = {
      ...DEFAULT_STORE,
      visitorCount: 0,
      stats: {
        github: 0,
        facebook: 0,
        twitter: 0,
        subscribers: 0
      },
      messages: [],
      blogs: [],
      gallery: [],
      projects: [],
      milestones: [],
      photos: []
    };

    // Update memory cache and write to disk
    dbMemoryCache = cleanDb;
    fs.writeFileSync(STORE_PATH, JSON.stringify(cleanDb, null, 2), "utf-8");

    // If Firestore is active, force-write all cleanDb keys to overwrite cloud documents and delete any leftover chunks
    if (firestore) {
      const keys = Object.keys(cleanDb) as Array<keyof DbStore>;
      const promises: Promise<any>[] = [];
      keys.forEach((key) => {
        promises.push(...syncKeyToFirestore(firestore, key, cleanDb[key]));
        lastSyncedKeys[key] = JSON.stringify(cleanDb[key]);
      });
      await Promise.all(promises);
    }

    // Notify connected SSE clients to reload/update instantly
    notifyClientsOfUpdate();

    res.json({
      success: true,
      message: "Database successfully cleared. All local files, memory cache, and Cloud Firestore documents have been reset to a clean slate."
    });
  } catch (err: any) {
    console.error("[Database Reset] Failed to reset database:", err);
    res.status(500).json({
      success: false,
      error: err?.message || String(err)
    });
  }
});

// Serve assets / Vite middleware
async function setupVite() {
  console.log("Synchronizing memory store with Google Cloud Firestore backing...");
  // Attempt to fetch the cloud data snapshot, but gracefully fall back if Firestore is unreachable or quota is exceeded
  try {
    await syncFromFirestore();
  } catch (syncErr) {
    console.error("[Firestore Startup Sync] Sync on startup failed or timed out. Starting server in offline/cached mode:", syncErr);
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite dev middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Setting up production build serving...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

// Bypassed in Serverless environments (Vercel/Netlify) as the platform handles its own port binding and routing natively
if (process.env.VERCEL !== "1" && process.env.NETLIFY !== "true") {
  setupVite().catch((err) => {
    console.error("Vite startup failed:", err);
  });
}

export default app;
