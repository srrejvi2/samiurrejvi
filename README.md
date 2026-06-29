# 🥞 Samiur Rahaman Rejvi's Portfolio & Dynamic CMS
> **সামিউর রহমান রেজভী - পার্সোনাল পোর্টফোলিও এবং ডাইনামিক সিএমএস**

A high-fidelity, full-stack personal portfolio website and comprehensive Content Management System (CMS) built using **React (Vite)**, **Tailwind CSS**, and **Express**. Powered by **Google Cloud Firestore** for persistent real-time backup, **Cloudinary** for image delivery, and structured with elegant typography and animations.

---

## 🚀 Core Features (বৈশিষ্ট্যসমূহ)

- **🌐 Dual-Language Support (বাংলা ও ইংরেজি)**: Seamless multi-language toggle for global visitors.
- **💼 Creative Repo Projects**: Responsive custom grid displaying projects, live URLs, and technical stacks.
- **📝 Insights Journal Blogs**: Dynamic blog management with reading time estimations.
- **📅 Interactive Milestones**: Time-based chronological timeline of career achievements.
- **🗺️ Visual Map Pins**: Interactive map representing travel, workspace, and photographic milestones.
- **🔒 3-Gear Secured Admin Panel**: An advanced, beautifully integrated admin dashboard accessed via a custom combination lock.
- **⚡ Two-Way Firestore Sync**: Automatic syncing between local server cache and Google Cloud Firestore.
- **🖼️ Client-Side Image Compression**: Highly optimized canvas-based compression reducing upload sizes to under 100KB for rapid page speeds.
- **🗑️ Full Database Reset**: Simple, secure reset functionality directly from the admin workspace.

---

## 🛠️ Tech Stack (প্রযুক্তিসমূহ)

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Lucide React
- **Backend**: Node.js, Express (Fully integrated development middleware)
- **Database / Storage**: Google Cloud Firestore (using `@google-cloud/firestore`), Cloudinary, Local File Store Cache
- **Linter & Verification**: TypeScript (strict mode), ESLint

---

## 📁 Getting Started Locally (স্থানীয়ভাবে রান করার নিয়ম)

### 1. Prerequisites (প্রয়োজনীয় রিকোয়ারমেন্টস)
Make sure you have [Node.js](https://nodejs.org/) (v18 or higher) installed.

### 2. Installation (ডিপেন্ডেন্সি ইন্সটলেশন)
Clone your repository and install the project dependencies:
```bash
npm install
```

### 3. Environment Variables Setup (এনভায়রনমেন্ট ভেরিয়েবল সেটআপ)
Create a `.env` file in the root directory and configure it based on `.env.example`:
```env
# Gemini AI Key
GEMINI_API_KEY="your_gemini_api_key"

# App Location URL
APP_URL="http://localhost:3000"

# Admin lock combination hash (optional, defaults to "427")
ADMIN_GEAR_COMBINATION_HASH=""

# Firebase credentials (paste content of firebase-applet-config.json)
FIREBASE_CONFIG='{ ... }'

# Cloudinary credentials for media uploads
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

### 4. Running the Development Server (সার্ভার রান করা)
Start the unified full-stack server locally on port `3000`:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### 5. Production Build & Start (প্রোডাকশন বিল্ড)
To bundle the application for production deployment:
```bash
npm run build
npm run start
```

---

## 📤 How to Export & Push to GitHub (গিটহাবে পুশ করার নিয়ম)

Google AI Studio builds are designed to be exported directly via the AI Studio visual interface without needing terminal Git commands:

1. **Open settings menu**: Click on the **Settings Gear (⚙️)** or **Export menu** located in the top-right corner of the Google AI Studio Build window.
2. **Export to GitHub**: Click on **"Export to GitHub"** or **"Download ZIP"**.
3. **Authenticate**: Connect and authorize Google AI Studio with your GitHub account.
4. **Choose Repository**: Create a new repository (e.g., `samiur-portfolio`) or choose an existing one, and hit export!
5. **Boom!** Your entire codebase, including this beautiful documentation, is pushed to your GitHub profile automatically.

---

## ⚡ How to Deploy on Netlify (Netlify-তে ডিপ্লয় করার নিয়ম)

This application is fully optimized to be deployed to **Netlify** with dynamic serverless backend capabilities (using Netlify Functions) and static asset hosting.

### 1. Push Code to GitHub
Export the code as a **ZIP** from Google AI Studio, extract it on your computer, create a new GitHub repository, and push the code there.
(AI Studio থেকে জিপ ফাইলটি ডাউনলোড করে আপনার কম্পিউটারে এক্সট্র্যাক্ট করুন, একটি নতুন গিটহাব রিপোজিটরি তৈরি করে কোডগুলো পুশ করে দিন।)

### 2. Deploy on Netlify
1. Log in to [Netlify](https://www.netlify.com/).
2. Click **"Add new site"** -> **"Import an existing project"**.
3. Select **GitHub** and authorize Netlify.
4. Select your portfolio repository.
5. Netlify will automatically detect the settings from `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`
6. Click **"Deploy site"**.

### 3. Setup Environment Variables (এনভায়রনমেন্ট ভেরিয়েবল সেটআপ)
Under **Site Configuration** -> **Environment variables**, add the following keys to make sure Firestore and other integrations work perfectly:
- `FIREBASE_CONFIG`: The complete JSON configuration string from your Firebase setup (e.g. `{"apiKey": "...", "authDomain": "...", ...}`)
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
- `GEMINI_API_KEY`: Your Gemini API key for dynamic AI features (optional)
- `ADMIN_GEAR_COMBINATION_HASH`: Hash configuration for your secure gear lock dashboard (optional)

---

## 🛡️ License
All rights reserved. Created with 💙 by **Samiur Rahaman Rejvi**.
