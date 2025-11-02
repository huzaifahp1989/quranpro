# Al-Quran Reading Application

## Project Overview
A comprehensive Quran reading application with audio recitation, Urdu and English translations, Tafseer (Islamic commentary), and authentic Hadith collections. Built with React, Express, and TypeScript.

## Features Implemented
- **Quran Reading**: 13-line Mushaf page layout with beautiful Arabic typography
- **Audio Recitation**: Multiple reciters (Mishary Alafasy, Abdul Basit, etc.) with synchronized playback
- **Translations**: Side-by-side Urdu and English translations for each verse
- **Tafseer**: Verse-by-verse Islamic commentary with expandable panel
- **Hadith Collection**: Browse authentic Hadith from Sahih al-Bukhari and Sahih Muslim
- **Kids Learning Section**: Interactive Quran learning for children with:
  - **Quran Recitation** (with audio player and controls):
    - Juz Amma (30th Part - Surahs 78-114)
    - Surah Yasin (The Heart of the Quran)
    - Surah Al-Mulk (Protection from Grave Punishment)
    - Surah Al-Waqiah (The Inevitable Event)
    - Audio from Sheikh Minshawi and Sheikh Hudhaify
    - Verse selection dropdown for quick navigation
    - Repeat mode for verse practice
    - Play/Pause/Stop controls
    - Volume adjustment
    - Side-by-side Urdu and English translations
  - **Qaidah & Arabic Learning**:
    - **Arabic Alphabet (Alif Baa)**: 28 letters with pronunciation guide
      - Each letter shows: Arabic character, name, transliteration
      - Four position forms: Isolated, Initial, Medial, Final
      - Text-to-speech pronunciation using Web Speech API
      - Detailed pronunciation descriptions
    - **Tajweed Rules**: 8 comprehensive categories with Quranic examples
      - Noon Sakinah & Tanween (Idhaar, Idghaam, Iqlaab, Ikhfaa)
      - Meem Sakinah rules (Ikhfaa Shafawi, Idghaam Shafawi, Idhaar)
      - Madd (Prolongation) - 5 types with examples
      - Qalqalah (Echoing Sound) - ق ط ب ج د
      - Ghunnah (Nasal Sound)
      - Raa' (Heavy & Light pronunciation)
      - Laam of Allah's Name
      - Sifaat (Characteristics of Letters)
      - Each rule includes: Arabic title, description, key points, Quranic examples
      - Examples with audio pronunciation, transliteration, and translation
  - Mobile-responsive design across all sections
- **Dark Mode**: Full dark mode support with theme persistence
- **Responsive Design**: Mobile-first design with tablet and desktop optimization

## Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (Neon), Drizzle ORM
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter
- **APIs**: AlQuran Cloud API, Quran Tafseer API, fawazahmed0 Hadith API

## Architecture

### Data Models (shared/schema.ts)

#### API Response Types (Zod)
- **Surah**: Chapter information with name, number, revelation type
- **Ayah**: Individual verses with Arabic text and audio URLs
- **Translation**: Urdu and English translations
- **Tafseer**: Verse commentary and explanation
- **Hadith**: Authentic narrations with English text and reference
- **Reciter**: Audio reciter information

#### Database Tables (Drizzle ORM)
- **users**: Anonymous user tracking via sessionId
- **bookmarks**: Saved verses (userId, surahNumber, ayahNumber, createdAt)
  - Unique constraint on (userId, surahNumber, ayahNumber)
  - Indexes for efficient queries
- **reading_position**: Current reading position per user (surahNumber, ayahNumber)
- **user_preferences**: Reciter and theme preferences per user

### Frontend Components
1. **SurahSelector**: Dropdown with search for selecting Quran chapters
2. **VerseDisplay**: Beautiful verse cards with Arabic text and translations
3. **AudioPlayer**: Persistent audio controls with reciter selection
4. **TafseerPanel**: Expandable drawer for verse commentary
5. **HadithCard**: Card layout for Hadith display

### Pages
1. **QuranReader** (/): Main Quran reading interface
2. **HadithBrowser** (/hadith): Hadith collection browser
3. **KidsLearning** (/kids): Interactive Quran learning for children

## API Endpoints (Backend)

### Quran Endpoints
- `GET /api/surahs` - Fetch all Quran chapters (114 surahs)
- `GET /api/surah/:surahNumber/:reciterEdition` - Fetch verses with audio and translations
- `GET /api/tafseer/:surahNumber/:ayahNumber` - Fetch Tafseer for specific verse

### Hadith Endpoints
- `GET /api/hadiths/:collection?page=1&search=query` - Fetch hadiths from specified collection
  - Collections: "bukhari", "muslim", "abudawud", "tirmidhi", "ibnmajah", "nasai", "malik" (7 total)
  - Pagination: 20 hadiths per page
  - Optional search parameter for client-side filtering
  - Response includes: hadiths array, page, pageSize, hasMore, total

## External APIs Used

### 1. AlQuran Cloud API (http://api.alquran.cloud/v1/)
- No authentication required
- No rate limits
- Endpoints:
  - `/surah` - Get all surahs
  - `/surah/:number/editions/:edition1,:edition2,:edition3` - Get surah with multiple editions
  - Available editions:
    - `quran-uthmani` - Arabic text (Uthmani script)
    - `ar.alafasy` - Audio by Mishary Alafasy
    - `ar.abdulbasitmurattal` - Audio by Abdul Basit
    - `ar.minshawi` - Audio by Mohamed Siddiq al-Minshawi (Murattal)
    - `ar.hudhaify` - Audio by Ali Bin Abdur-Rahman Al-Hudhaify
    - `ur.jalandhry` - Urdu translation
    - `en.sahih` - English translation (Sahih International)

### 2. Quran Tafseer API (http://api.quran-tafseer.com/)
- No authentication required
- Endpoints:
  - `/tafseer/:tafseerID/:surahNumber/:ayahNumber`
  - Available Tafseers:
    - ID 1: التفسير الميسر (Al-Tafsir Al-Muyassar)
    - ID 2: تفسير الجلالين (Tafsir al-Jalalayn)

### 3. Hadith API (fawazahmed0 CDN)
- Using fawazahmed0/hadith-api via CDN
- CDN: https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/
- No authentication required
- Collections available (English editions):
  - eng-bukhari (Sahih al-Bukhari) - 7,563 hadiths
  - eng-muslim (Sahih Muslim) - 7,190 hadiths
  - eng-abudawud (Sunan Abu Dawud) - 5,274 hadiths
  - eng-tirmidhi (Jami' At-Tirmidhi) - 3,956 hadiths
  - eng-ibnmajah (Sunan Ibn Majah) - 4,341 hadiths
  - eng-nasai (Sunan an-Nasa'i) - 5,758 hadiths
  - eng-malik (Muwatta Malik) - 1,826 hadiths
- Backend caches entire collections (1-hour TTL)
- Client-side pagination (20 per page)
- Search filters hadiths client-side after fetching collection

## Design System

### Colors (Islamic Theme)
- Primary: Emerald/Teal tones (158° hue) - traditional Islamic green
- Clean, neutral backgrounds for readability
- High contrast for accessibility

### Typography
- **Arabic**: 'Amiri Quran', 'Scheherazade New' - Traditional Quranic fonts
- **Latin**: 'Inter', 'Noto Sans' - Clean, modern sans-serif
- Font sizes optimized for long reading sessions

### Spacing
- Generous padding for comfort (p-6, p-8, p-12)
- Clear verse separation (mb-6)
- Consistent gap between elements (gap-3, gap-4)

## Recent Changes (November 2025)
- ✅ **Qaidah & Arabic Learning Section Added** (Latest)
  - Comprehensive Arabic alphabet learning (Alif Baa)
    - 28 letters with detailed information
    - Four position forms for each letter
    - Pronunciation guide with transliteration
    - Text-to-speech audio using Web Speech API
  - Complete Tajweed rules curriculum
    - 8 major rule categories with descriptions
    - Multiple authentic Quranic examples for each rule
    - Key points and detailed explanations
    - Audio pronunciation for all examples
  - Accessibility features: aria-labels, test IDs, keyboard navigation
  - Speech synthesis cleanup on unmount
  - Mobile-responsive grid layouts
- ✅ **Kids Learning Section Added** - Interactive Quran learning page for children
  - Created dedicated /kids route with two-level tabbed interface
  - **Quran Recitation tab**: Audio learning with 4 sections
  - **Qaidah & Arabic tab**: Alphabet and Tajweed education
  - Implemented audio player with repeat mode, stop, and volume controls
  - Added 4 learning sections: Juz Amma (30th Part), Surah Yasin, Surah Al-Mulk, Surah Al-Waqiah
  - Integrated Sheikh Minshawi and Sheikh Hudhaify audio reciters
  - Verse navigation with previous/next controls
  - **Verse selection dropdown** - Jump directly to any verse in the current surah
  - Side-by-side translations (Urdu and English) for learning
  - Auto-advance to next verse when not in repeat mode
  - Added navigation buttons across all pages for easy access
  - **Mobile responsive design** - Optimized layout for mobile devices with stacked controls
- ✅ **Database Setup Complete** - PostgreSQL with Drizzle ORM (Task 2)
  - Created users, bookmarks, reading_position, user_preferences tables
  - Implemented DatabaseStorage with full CRUD operations
  - Added unique constraints and indexes for data integrity
  - Session-based anonymous user tracking (future auth-ready)
- ✅ **Real Hadith API Integration Complete** - Integrated fawazahmed0 CDN API with 7 authentic Hadith collections (Task 1)
  - Replaced hardcoded data with real API integration
  - Implemented pagination with accumulation (20 hadiths per page, Load More button)
  - Added search functionality with proper state management
  - Fixed critical bugs: TypeScript compilation, search pagination, grade serialization
  - Comprehensive e2e testing validates all features
- Initial project setup with fullstack TypeScript structure
- Implemented complete frontend with all core features (Quran reader, audio player, translations, tafseer)
- Added dark mode support with theme persistence
- Created beautiful, accessible UI following Islamic design principles
- Integrated Arabic fonts for authentic Quranic text rendering
- Implemented backend API proxy routes with caching for AlQuran Cloud API and Tafseer API
- Added audio synchronization with automatic verse advancement during playback
- Implemented robust error handling with input validation and timeout management
- Optimized layout for better reading experience with reduced spacing and compact design

## User Guide
### Reading the Quran
1. Use the surah selector dropdown to choose a chapter
2. Read Arabic text with side-by-side Urdu and English translations
3. Click the play button to start audio recitation
4. Audio automatically advances to the next verse when playing
5. Click any verse to view its Tafseer (commentary)

### Browsing Hadith
1. Click the "Browse Hadith" button in the header to navigate to Hadith collection
2. Choose from 7 authentic collections via tabs (Sahih Bukhari, Muslim, Abu Dawud, Tirmidhi, Ibn Majah, Nasa'i, Muwatta Malik)
3. Browse hadiths with English translations (20 per page)
4. Click "Load More Hadiths" to load additional pages
5. Use the search box to filter hadiths by keywords
6. Each hadith shows: collection badge, hadith number, English narration, and reference

### Kids Learning
1. Click "Kids Learning" button in the header to access the learning section
2. Choose between two main tabs:
   - **Quran Recitation**: Interactive audio learning
   - **Qaidah & Arabic**: Alphabet and Tajweed rules

#### Quran Recitation Tab
1. Choose from sub-tabs: Juz Amma, Surah Yasin, Surah Al-Mulk, or Surah Al-Waqiah
2. Select your preferred reciter (Sheikh Minshawi or Sheikh Hudhaify)
3. Use the "Jump to Verse" dropdown to quickly navigate to any verse in the current surah
4. Each verse displays Arabic text with Urdu and English translations
5. Audio controls (responsive on mobile):
   - **Play/Pause**: Start or pause recitation
   - **Stop**: Stop playback and reset to beginning
   - **Repeat**: Toggle repeat mode to practice the same verse
   - **Previous/Next**: Navigate between verses
   - **Volume**: Adjust audio volume with slider
6. Audio automatically advances to the next verse unless repeat mode is on
7. Mobile-optimized layout with stacked controls for easy use on phones and tablets

#### Qaidah & Arabic Tab
1. **Arabic Alphabet (Alif Baa)**:
   - Browse all 28 Arabic letters in a responsive grid
   - Click any letter to see detailed information
   - View four position forms (Isolated, Initial, Medial, Final)
   - Click speaker icon to hear pronunciation
   - Learn transliteration and pronunciation guide
2. **Tajweed Rules**:
   - Explore 8 major Tajweed categories
   - Click any rule to expand and see details
   - View key points for each rule
   - Study authentic Quranic examples with:
     - Arabic text (with audio pronunciation)
     - Transliteration
     - English translation
     - Quranic reference
   - Interactive expandable cards for easy learning

### Dark Mode
- Click the sun/moon icon in the header to toggle between light and dark themes
- Theme preference is saved automatically

## Next Steps
1. Add bookmarking functionality for favorite verses
2. Implement reading progress tracking
3. Add more reciters and tafseer sources
4. Optimize performance with virtual scrolling for long surahs
5. Add offline support with service workers
