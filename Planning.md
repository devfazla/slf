# 🛠️ SelfDesk

**Your private, all-in-one personal workspace — chat, store, and write, all in one place.**

---

# 📋 Overview

SelfDesk is a **password-protected static web application** designed for developers and individuals who want a **secure, minimal, and self-hosted workspace**.

It combines:

* 💬 Self-chat (like WhatsApp for yourself) via **Telegram Bot**
* 📝 Markdown notes editor with **Supabase database**
* 📦 File storage system via **Telegram Bot API**

Accessible from any browser anywhere with just your password — fully under your control.

---

# 🛠️ Tech Stack

* **Framework:** React + Vite
* **Styling:** Tailwind CSS
* **Chat & File Storage:** Telegram Bot API
* **Notes & Metadata:** Supabase (PostgreSQL)
* **Authentication:** Supabase email/password auth (verified user via VITE_EMAIL)
* **Deployment:** GitHub Pages (static hosting)

---

# 🔐 Core Features

## 🔑 Authentication

* **Single password** login via Supabase email/password auth
* Email configured via `VITE_EMAIL` env var (pre-verified Supabase user)
* Password managed by **Supabase Auth** (no local hashing)
* **Password change** via `supabase.auth.updateUser()`
* Session persistence handled by **Supabase client** (auto-refresh tokens)
* Auth state shared via **React Context** (`AuthProvider` + `useAuth`)
* `supabase.auth.onAuthStateChange` listener for automatic state sync

---

## 💬 Self Chat System

* Clean WhatsApp-style interface
* Send:
  * Text messages
  * Emojis 😊
  * Files (images, PDFs, etc.)

* Features:
  * Timestamped messages
  * Scrollable history
  * Message search
  * **Powered by Telegram Bot API** (messages stored on Telegram)
  * File uploads via Telegram (automatic file_id tracking)

---

## 📝 Notes & Editor

* Markdown-based editor
* Create / edit / delete / rename notes
* Rich formatting support
* Optional live preview
* **Metadata stored in Supabase** (title, content, timestamps)
* Local state synced to Supabase on save

---

## 📦 File Storage & Explorer

* Upload files directly to **Telegram Bot** via API
* **Folder-based organization** (create nested folders)
* Create, rename, delete folders
* Upload files into any folder
* Navigate folder hierarchy with breadcrumbs
* Secure file retrieval using Telegram file_id
* No storage limits (uses Telegram as backing storage)
* Automatic metadata logging to Supabase
* **File explorer tab** for complete file management

---

## 🎨 Theming & Customization

* Multiple built-in theme presets (Light, Dark, Sepia, Ocean, Forest)
* Global color system with CSS variables
* Per-theme customizable colors (primary, secondary, accent, danger, success, warning)
* Real-time theme preview on Settings page
* Theme persistence in Supabase per user
* System theme detection (light/dark mode preference)
* Accessible color contrasts (WCAG compliant)

---

# 🏗️ System Architecture

```
Client (Browser)
   ↓
React + Vite (Static App)
   ├→ Telegram Bot API (Chat & Files)
   │   +-- Messages stored in Telegram
   │   +-- Files stored on Telegram servers
   │
   └→ Supabase
       +-- PostgreSQL (notes, metadata, settings)
       +-- No file storage needed
```

---

# 📊 Database Schema

## 📝 notes

```
id (uuid) - Primary key
user_id (text) - Single user identifier (derived from password)
title (text) - Note title
content (text) - Markdown content
created_at (timestamp)
updated_at (timestamp)
deleted (boolean) - Soft delete flag
```

---

## 📁 folders

```
id (uuid) - Primary key
user_id (text) - Single user identifier
name (text) - Folder name
parent_id (uuid, nullable) - Parent folder ID (null = root level)
created_at (timestamp)
updated_at (timestamp)
deleted (boolean) - Soft delete flag
```

---

## 📌 files

```
id (uuid) - Primary key
user_id (text) - Single user identifier
folder_id (uuid) - Parent folder ID (from folders table)
telegram_file_id (text) - File ID from Telegram
file_name (text) - Original file name
file_type (text) - mime type (image/png, application/pdf, etc.)
file_size (integer) - in bytes
uploaded_at (timestamp)
deleted (boolean) - Soft delete flag
```

---

## 📌 file_metadata (legacy, can be merged with files table)

```
id (uuid) - Primary key
user_id (text) - Single user identifier
telegram_file_id (text) - File ID from Telegram
file_name (text)
file_type (text) - mime type
file_size (integer) - in bytes
uploaded_at (timestamp)
category (text) - images | documents | others
```

---

## 💾 message_metadata (optional, for logging)

```
id (uuid) - Primary key
user_id (text) - Single user identifier
telegram_message_id (text) - Message ID from Telegram
content (text)
is_file (boolean)
created_at (timestamp)
```

---

## ⚙️ app_settings

```
id (bigint) - Primary key (auto-increment)
user_id (text) - UNIQUE, stores auth.uid()::text
current_theme (text) - theme preset name (default: 'light')
theme_colors (jsonb) - Custom color overrides
updated_at (timestamp)
created_at (timestamp)
```

---

## 🎨 theme_presets

```
id (uuid) - Primary key
user_id (text) - Single user identifier
name (text) - Theme name (e.g., "My Ocean Blue")
preset_key (text) - system | light | dark | sepia | ocean | forest | custom
colors (jsonb) - {
  "primary": "#hexcode",
  "secondary": "#hexcode",
  "accent": "#hexcode",
  "background": "#hexcode",
  "surface": "#hexcode",
  "text_primary": "#hexcode",
  "text_secondary": "#hexcode",
  "border": "#hexcode",
  "success": "#hexcode",
  "warning": "#hexcode",
  "danger": "#hexcode",
  "info": "#hexcode"
}
created_at (timestamp)
is_default (boolean)
```

---

# 🔄 Authentication Flow

```
1. Enter password on login page
   ↓
2. Call supabase.auth.signInWithPassword({ email: VITE_EMAIL, password })
   ↓
3. Supabase validates and returns session + JWT
   ↓
4. AuthProvider updates isAuthenticated state → Redirect to /chat
   ↓
5. All Supabase API calls auto-authenticated via session token
   ↓
6. Session persists across page reloads (Supabase handles refresh)
   ↓
7. Logout: supabase.auth.signOut() → Clear state → Redirect to /login
```

### Key Implementation Details
- `useAuth` is a **React Context** (not a plain hook) — shared state across all components
- `AuthProvider` wraps the app in `App.jsx`
- Session check runs **once** on mount via `supabase.auth.getSession()`
- `supabase.auth.onAuthStateChange` listener auto-syncs SIGNED_IN/SIGNED_OUT/TOKEN_REFRESHED events
- RLS policies use `user_id = auth.uid()::text` for row-level access control

---

# 🗂️ App Structure

```
/src
  /pages
    Login.jsx - Password entry & login
    Chat.jsx - Chat interface
    Notes.jsx - Notes editor
    Explorer.jsx - File explorer & management
    Settings.jsx - Password change, config
    App.jsx - Main router

  /components
    ChatUI.jsx - Chat interface
    MessageBubble.jsx - Individual message
    NotesEditor.jsx - Markdown editor
    FileUploader.jsx - Telegram file upload
    NotesList.jsx - Notes list
    SearchBar.jsx - Global search
    FileExplorer.jsx - Main file explorer
    FolderNav.jsx - Breadcrumb navigation
    FolderView.jsx - Current folder contents
    CreateFolderModal.jsx - New folder dialog
    FileItem.jsx - Individual file display
    FolderItem.jsx - Individual folder display
    SettingsPage.jsx - Settings interface
    ThemeSelector.jsx - Theme preset selector
    ColorPicker.jsx - Individual color picker
    ThemePreview.jsx - Live theme preview
    ColorSwatchGrid.jsx - Display all theme colors
    PasswordChangeForm.jsx - Password update form
    AppSettings.jsx - Application configuration

  /lib
    supabaseClient.js - Supabase initialization (single client, persistSession)
    telegramAPI.js - Telegram bot API wrapper
    storage.js - Theme preference helpers only

  /hooks
    useAuth.jsx - Auth Context (AuthProvider + useAuth), Supabase email/password auth
    useTelegram.js - Telegram API calls
    useNotes.js - CRUD for notes
    useFiles.js - File upload/download
    useExplorer.js - Folder navigation & file management
    useFolders.js - Folder CRUD operations
    useTheme.js - Theme management & switching
    useThemeColors.js - Color customization & persistence

  /styles
    tailwind.config.js
    globals.css
```

---

# 🌐 API Integration

## Telegram Bot API

### Send Message
```
POST https://api.telegram.org/bot{TOKEN}/sendMessage
Body: {
  chat_id: CHAT_ID,
  text: message_content
}
```

### Send File (Document)
```
POST https://api.telegram.org/bot{TOKEN}/sendDocument
Body: FormData {
  chat_id: CHAT_ID,
  document: file
}
```

### Get File
```
POST https://api.telegram.org/bot{TOKEN}/getFile
Body: {
  file_id: telegram_file_id
}
```

### Retrieve File Content
```
GET https://api.telegram.org/file/bot{TOKEN}/{file_path}
```

---

## Supabase Direct Access

All Supabase calls are **direct from the client** using `@supabase/supabase-js`:

### Notes CRUD
```javascript
// Create
const { data } = await supabase
  .from('notes')
  .insert([{ user_id, title, content }]);

// Read
const { data } = await supabase
  .from('notes')
  .select('*')
  .eq('user_id', user_id);

// Update
const { data } = await supabase
  .from('notes')
  .update({ content, updated_at: new Date() })
  .eq('id', noteId);

// Delete (soft)
const { data } = await supabase
  .from('notes')
  .update({ deleted: true })
  .eq('id', noteId);
```

### File Metadata
```javascript
// Log uploaded file
const { data } = await supabase
  .from('file_metadata')
  .insert([{
    user_id,
    telegram_file_id,
    file_name,
    file_type,
    file_size,
    category
  }]);
```

### Theme Management
```javascript
// Get current theme
const { data: settings } = await supabase
  .from('app_settings')
  .select('current_theme, theme_colors')
  .eq('user_id', user_id)
  .single();

// Update theme mode
const { data } = await supabase
  .from('app_settings')
  .update({ theme_mode: 'dark' })
  .eq('user_id', user_id);

// Save custom theme colors
const { data } = await supabase
  .from('app_settings')
  .update({
    theme_colors: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#ec4899'
    }
  })
  .eq('user_id', user_id);

// Save custom theme preset
const { data } = await supabase
  .from('theme_presets')
  .insert([{
    user_id,
    name: 'My Custom Theme',
    preset_key: 'custom',
    colors: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      // ... all colors
    }
  }]);
```

### Hook Usage Examples

```javascript
// In any component
import { useTheme } from '@/hooks/useTheme';

const MyComponent = () => {
  const { theme, setTheme, colors } = useTheme();
  
  return (
    <button style={{
      backgroundColor: colors.primary,
      color: colors.background
    }}>
      Current theme: {theme}
    </button>
  );
};

// Switch theme
setTheme('ocean');

// Update custom colors
const { updateColors } = useTheme();
updateColors({
  primary: '#0369a1',
  secondary: '#0284c7'
});
```

---

# 🔐 Security Considerations

## Supabase Auth
- Authentication via **Supabase Auth** (email/password)
- Email configured via `VITE_EMAIL` env var (pre-verified user)
- Session managed by **Supabase client** (auto-refresh, persistSession)
- No local password hashing — Supabase handles all crypto
- Auth state shared via **React Context** to prevent duplicate state/effects

## Telegram Integration
- Bot token & chat ID **encrypted in Supabase** app_settings table
- Decrypted on login and stored in memory (not localStorage)
- All Telegram API calls proxied through client (no backend needed)

## Supabase
- Row-level security (RLS) enabled on all tables
- `user_id = auth.uid()::text` used in all RLS policies (type cast for text column)
- Only authenticated sessions can access their own data
- `app_settings.user_id` has UNIQUE constraint for proper upsert operations

---

# 📄 Pages & Routes

* `/` → Redirect to `/login` if not authenticated, else `/chat`
* `/login` → Password entry page
* `/chat` → Chat interface with Telegram integration
* `/notes` → Notes list and editor
* `/explorer` → File explorer & management
* `/settings` → Password change, encryption settings

---

# 🔄 Key Flows

## Send Message
```
1. User types message in chat
2. Click send
3. Call Telegram API (sendMessage)
4. Get message_id from Telegram response
5. Log to Supabase (optional metadata)
6. Update UI with message
```

## Upload File
```
1. User selects file
2. Send to Telegram API (sendDocument)
3. Get file_id from Telegram response
4. Log file_metadata to Supabase
5. Update UI with file in chat/storage
```

## Edit Note
```
1. User opens note
2. Edit markdown content
3. Click save
4. Send to Supabase (update notes table)
5. Update UI
```

## Change Password
```
1. User enters old password
2. Re-authenticate with supabase.auth.signInWithPassword()
3. Call supabase.auth.updateUser({ password: newPassword })
4. Supabase updates the password
5. Logout & prompt re-login with new password
```

## Create Folder
```
1. User clicks "New Folder" in Explorer
2. Enter folder name
3. Save to Supabase folders table (parent_id = current folder)
4. Refresh folder view
5. New folder appears in current directory
```

## Navigate Folder
```
1. User double-clicks folder
2. Query Supabase for all items in that folder_id
3. Load files from files table where folder_id matches
4. Load subfolders from folders table where parent_id matches
5. Update breadcrumb navigation
6. Display folder contents
```

## Upload File to Folder
```
1. User selects file in current folder
2. Send to Telegram API (sendDocument)
3. Get file_id from Telegram response
4. Save to Supabase files table (folder_id = current folder)
5. Refresh folder view
6. File appears with name + size in folder
```

## Delete File
```
1. User clicks delete on file
2. Soft delete in Supabase (mark deleted = true)
3. Remove from Telegram (optional)
4. Refresh folder view
```

## Delete Folder (recursive)
```
1. User clicks delete on folder
2. Check if folder has subfolders or files
3. If yes, show warning with count
4. Mark folder as deleted = true in Supabase
5. Soft delete all files in that folder recursively
6. Refresh view
```

## Rename Folder
```
1. User right-clicks folder → Rename
2. Edit folder name
3. Update in Supabase folders table
4. Refresh folder view
```

---

# 🎨 Global Theming System

## Color Architecture

All colors are managed through **CSS custom properties (variables)** at the root level. No hardcoded colors anywhere in components.

### CSS Variables Structure

```css
:root {
  /* Primary Colors */
  --color-primary: #3b82f6;
  --color-primary-light: #60a5fa;
  --color-primary-dark: #1e40af;
  
  /* Secondary Colors */
  --color-secondary: #8b5cf6;
  --color-secondary-light: #a78bfa;
  --color-secondary-dark: #6d28d9;
  
  /* Accent Colors */
  --color-accent: #ec4899;
  --color-accent-light: #f472b6;
  --color-accent-dark: #be185d;
  
  /* Semantic Colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-info: #0ea5e9;
  
  /* Background & Surface */
  --color-background: #ffffff;
  --color-surface: #f9fafb;
  --color-surface-2: #f3f4f6;
  --color-border: #e5e7eb;
  
  /* Text Colors */
  --color-text-primary: #1f2937;
  --color-text-secondary: #6b7280;
  --color-text-tertiary: #9ca3af;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Border Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-full: 9999px;
}

/* Dark Mode */
[data-theme="dark"] {
  --color-background: #1f2937;
  --color-surface: #111827;
  --color-surface-2: #0f172a;
  --color-border: #374151;
  --color-text-primary: #f9fafb;
  --color-text-secondary: #d1d5db;
  --color-text-tertiary: #9ca3af;
}

/* Theme: Sepia */
[data-theme="sepia"] {
  --color-primary: #b97f5c;
  --color-secondary: #a68072;
  --color-accent: #c98660;
  --color-background: #fef5f1;
  --color-surface: #faf4f0;
  --color-text-primary: #4a3728;
}

/* Theme: Ocean */
[data-theme="ocean"] {
  --color-primary: #0369a1;
  --color-secondary: #0284c7;
  --color-accent: #06b6d4;
  --color-background: #f0f9ff;
  --color-surface: #e0f2fe;
  --color-text-primary: #0c2340;
}

/* Theme: Forest */
[data-theme="forest"] {
  --color-primary: #15803d;
  --color-secondary: #16a34a;
  --color-accent: #22c55e;
  --color-background: #f0fdf4;
  --color-surface: #dbeafe;
  --color-text-primary: #14532d;
}
```

## Component Usage

```jsx
// ✅ CORRECT - Using CSS variables
const Button = ({ children }) => (
  <button style={{
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-background)',
    padding: 'var(--spacing-md)',
    borderRadius: 'var(--radius-md)'
  }}>
    {children}
  </button>
);

// Or with Tailwind (if using Tailwind CSS)
// Extend tailwind.config.js to use CSS variables
<button className="bg-primary text-background px-4 py-2 rounded">
  Click me
</button>
```

## Built-in Theme Presets

| Theme | Primary | Secondary | Accent | Best For |
|-------|---------|-----------|--------|----------|
| **Light** | Blue (#3b82f6) | Purple (#8b5cf6) | Pink (#ec4899) | Clean, modern UI |
| **Dark** | Blue (#3b82f6) | Purple (#8b5cf6) | Pink (#ec4899) | Night mode, reduced eye strain |
| **Sepia** | Brown (#b97f5c) | Tan (#a68072) | Rust (#c98660) | Warm, vintage feel |
| **Ocean** | Navy (#0369a1) | Sky (#0284c7) | Cyan (#06b6d4) | Cool, professional |
| **Forest** | Green (#15803d) | Light Green (#16a34a) | Lime (#22c55e) | Nature-inspired, calm |

---

## Overview

The File Explorer is a tab-based interface for managing files and folders with a complete folder hierarchy stored in Supabase and files stored on Telegram.

## UI Layout

```
┌─ File Explorer ──────────────────────────────────────┐
├─ Breadcrumb: Home > Projects > 2024             ─────┤
├─ [+ New Folder] [Upload Files]                  ─────┤
├─────────────────────────────────────────────────────┤
│ Name              │ Type     │ Size    │ Modified    │
├─────────────────────────────────────────────────────┤
│ 📁 Documents      │ Folder   │ —       │ Apr 20      │
│ 📁 Images        │ Folder   │ —       │ Apr 18      │
│ 📄 report.pdf    │ File     │ 2.4 MB  │ Apr 15      │
│ 🖼️ photo.jpg     │ File     │ 1.8 MB  │ Apr 12      │
└─────────────────────────────────────────────────────┘

Right-click menu:
  - Download
  - Rename (files only)
  - Delete
  - Properties
```

## Features

### Folder Operations
- ✅ Create new folder at any level
- ✅ Navigate nested folders
- ✅ Breadcrumb navigation (click to go back)
- ✅ Rename folders
- ✅ Delete folders (with confirmation for non-empty folders)
- ✅ Show folder size (sum of files inside)

### File Operations
- ✅ Upload files to current folder
- ✅ Download files from Telegram
- ✅ Rename files
- ✅ Delete files (soft delete)
- ✅ View file properties (size, type, upload date)
- ✅ Search files by name

### Display
- ✅ Icon indicators (📁 folder, 📄 file, 🖼️ image, 🎵 audio, etc.)
- ✅ File size formatted (B, KB, MB, GB)
- ✅ Modification date
- ✅ Current folder path in breadcrumb
- ✅ Empty folder message

## Data Structure

### Folder Hierarchy Example
```
Root (null parent_id)
├── Documents (folder_id: abc123)
│   ├── Work (parent_id: abc123)
│   │   └── report.pdf (file)
│   └── Personal (parent_id: abc123)
│       └── resume.pdf (file)
├── Images (folder_id: def456)
│   ├── Vacation (parent_id: def456)
│   │   └── beach.jpg (file)
│   └── Screenshots (parent_id: def456)
│       └── app-ui.png (file)
└── Downloads (folder_id: ghi789)
    └── installer.exe (file)
```

---

# 🚀 Deployment

## Setup
1. Create GitHub repo
2. Setup Supabase project
3. Create Telegram bot (via BotFather)
4. Store bot token & chat ID in Supabase (separate from app_settings)
5. Create verified user in Supabase Auth (email = VITE_EMAIL)

## GitHub Pages Deployment
```bash
# Build
npm run build

# Deploy (GitHub Pages)
npm run deploy
```

## Environment Variables (.env)
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_EMAIL=your-verified-supabase-user@email.com
```

---

# 🎯 Advantages of This Architecture

✅ **No backend server** needed — purely static frontend  
✅ **Free hosting** on GitHub Pages  
✅ **Telegram as CDN** for files (unlimited storage within Telegram limits)  
✅ **Folder-based organization** (hierarchical, unlimited nesting)  
✅ **Supabase for metadata** (structured data, search, notes, folder hierarchy)  
✅ **Single password** entry — no complex auth  
✅ **Client-side control** — all logic in browser  
✅ **Portable** — works on any device with a browser  
✅ **Cheap** — free tier sufficient for most use cases  

---

# ⚙️ Settings Page

The Settings page is where users manage all application settings and preferences:

## 🔑 Password Management

- **Change Password Section**
  - Enter current password (for verification)
  - Enter new password
  - Confirm new password
  - "Save Password" button with validation
  - Success/error notifications
  - Auto-logout after password change

## 🎨 Theme & Customization

### Theme Mode Selector
- **Auto** - Follow system preference (light/dark)
- **Light** - Always use light theme
- **Dark** - Always use dark theme
- **Sepia** - Warm, vintage colors
- **Ocean** - Cool, professional blues
- **Forest** - Nature-inspired greens

### Color Customizer
- **Select Preset Theme** dropdown to quickly switch between presets
- **Create Custom Theme** option to fine-tune colors
- **Color Picker Interface** for each color:
  - Primary color
  - Secondary color
  - Accent color
  - Success color
  - Warning color
  - Danger color
  - Info color
  - Background color
  - Surface color
  - Text colors (primary, secondary, tertiary)
  - Border color

### Theme Preview Section
- Live preview panel showing:
  - All color swatches with hex codes
  - Button examples (primary, secondary, danger, success)
  - Text color examples
  - Card/surface examples
  - Real-time updates as colors change

### Theme Actions
- **Save Custom Theme** - Save current customization
- **Reset to Default** - Revert to selected preset
- **Delete Custom Theme** - Remove saved custom theme
- **Export Theme** - Download theme as JSON
- **Import Theme** - Upload JSON theme file

### Theme Persistence
- Selected theme saved to Supabase app_settings
- Colors saved to theme_presets table
- Auto-load on next login
- Applied instantly to entire app

## ⚙️ Application Settings

- **Telegram Configuration**
  - Bot token (encrypted display)
  - Chat ID (encrypted display)
  - "Update Bot Credentials" button

- **Data Management**
  - Show total storage used
  - Show file count
  - Show notes count
  - Clear cache button
  - Export all data (JSON)

- **Security**
  - Session timeout settings
  - Clear all sessions
  - View login history (if tracked)

## 🔴 Danger Zone

- **Reset Application**
  - Clear all data with confirmation
  - Delete all notes (permanent)
  - Delete all files (permanent)
  - Reset password

- **Logout**
  - Logout from current device
  - Logout from all devices

---

# 🔧 Future Enhancements

* End-to-end encryption for notes ✨
* Voice notes via Telegram API 🎙️
* Drag & drop file uploads 📤
* Theme color presets from community 🎨
* PWA support (offline access) 📱
* Two-factor authentication 🔐
* Note sharing via public link 🔗
* File expiry (auto-delete from Telegram) ⏰
* Custom font selection for notes ✍️
* Advanced search with filters 🔍

---

# ⚠️ Limitations

* **Telegram API rate limits** (3000 messages/minute per chat)
* **File size limits** (up to 2GB per file on Telegram)
* **Single-user only** (password-based, not multi-user)
* **No real-time sync** between tabs (localStorage only)

---

# 💡 Vision

SelfDesk is your **personal digital desk** — a private space where you can:

* **Think** 🧠
* **Chat with yourself** 💬
* **Store & organize files** 📦
* **Write & edit notes** 📝

All in one place, fully under your control, accessible from anywhere with just one password.

---