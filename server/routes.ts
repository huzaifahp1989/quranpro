import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import axios from "axios";
import { storage } from "./storage";
import { insertBookmarkSchema } from "@shared/schema";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

// Use HTTPS to avoid network/mixed-content issues
const ALQURAN_CLOUD_API = "https://api.alquran.cloud/v1";
const QURAN_TAFSEER_API = "http://api.quran-tafseer.com";
// External CDN for English Tafsir (Maarif-ul-Quran)
const TAFSIR_CDN_BASE = "https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir";

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

function getFromCache(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all Surahs (chapters)
  app.get("/api/surahs", async (req, res) => {
    try {
      const cacheKey = "surahs";
      const cached = getFromCache(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const response = await axios.get(`${ALQURAN_CLOUD_API}/surah`);
      
      if (response.data.code === 200 && response.data.data) {
        const surahs = response.data.data.map((surah: any) => ({
          number: surah.number,
          name: surah.name,
          englishName: surah.englishName,
          englishNameTranslation: surah.englishNameTranslation,
          numberOfAyahs: surah.numberOfAyahs,
          revelationType: surah.revelationType,
        }));
        
        setCache(cacheKey, surahs);
        res.json(surahs);
      } else {
        res.status(500).json({ error: "Failed to fetch surahs" });
      }
    } catch (error) {
      console.error("Error fetching surahs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get Surah with verses, translations, and audio
  app.get("/api/surah/:surahNumber/:reciterEdition", async (req, res) => {
    try {
      const { surahNumber, reciterEdition } = req.params;
      
      // Validate surah number
      const surahNum = parseInt(surahNumber);
      if (isNaN(surahNum) || surahNum < 1 || surahNum > 114) {
        return res.status(400).json({ error: "Invalid surah number. Must be between 1 and 114" });
      }

      const cacheKey = `surah-${surahNumber}-${reciterEdition}`;
      const cached = getFromCache(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      // Fetch Arabic text, audio, and translations in one request
      const editions = `quran-uthmani,${reciterEdition},ur.jalandhry,en.sahih`;
      const response = await axios.get(
        `${ALQURAN_CLOUD_API}/surah/${surahNumber}/editions/${editions}`,
        { timeout: 15000 }
      );

      if (response.data.code === 200 && response.data.data) {
        const [arabicData, audioData, urduData, englishData] = response.data.data;

        const verses = arabicData.ayahs.map((ayah: any, index: number) => ({
          ayah: {
            number: ayah.number,
            numberInSurah: ayah.numberInSurah,
            text: ayah.text,
            // Serve audio via local proxy to avoid CORS/adblock issues
            // IMPORTANT: Use the GLOBAL ayah number for audio, not numberInSurah
            audio: `/api/audio/128/${reciterEdition}/${ayah.number}.mp3`,
            surah: {
              number: arabicData.number,
              name: arabicData.name,
              englishName: arabicData.englishName,
            },
          },
          urduTranslation: {
            text: urduData.ayahs[index]?.text || "",
            language: "Urdu",
            translator: "Fateh Muhammad Jalandhry",
          },
          englishTranslation: {
            text: englishData.ayahs[index]?.text || "",
            language: "English",
            translator: "Sahih International",
          },
        }));

        setCache(cacheKey, verses);
        res.json(verses);
      } else {
        res.status(500).json({ error: "Failed to fetch surah data" });
      }
    } catch (error: any) {
      console.error("Error fetching surah:", error.message);
      if (error.response?.status === 404) {
        res.status(404).json({ error: "Surah not found" });
      } else if (error.code === 'ECONNABORTED') {
        res.status(504).json({ error: "Request timeout - please try again" });
      } else {
        res.status(500).json({ error: "Failed to load surah. Please try again." });
      }
    }
  });

  // Get Juz (Para) verses aggregated across surah boundaries with translations and audio
  app.get('/api/juz/:juzNumber/:reciterEdition', async (req, res) => {
    try {
      const { juzNumber, reciterEdition } = req.params as { juzNumber: string; reciterEdition: string };
      const juzNum = parseInt(juzNumber, 10);
      if (Number.isNaN(juzNum) || juzNum < 1 || juzNum > 30) {
        return res.status(400).json({ error: 'Invalid Juz number. Must be between 1 and 30' });
      }

      const boundaries = {
        1: { startSurah: 1, startAyah: 1, endSurah: 2, endAyah: 141 },
        2: { startSurah: 2, startAyah: 142, endSurah: 2, endAyah: 252 },
        3: { startSurah: 2, startAyah: 253, endSurah: 3, endAyah: 92 },
        4: { startSurah: 3, startAyah: 92, endSurah: 4, endAyah: 23 },
        5: { startSurah: 4, startAyah: 24, endSurah: 4, endAyah: 147 },
        6: { startSurah: 4, startAyah: 148, endSurah: 5, endAyah: 82 },
        7: { startSurah: 5, startAyah: 83, endSurah: 6, endAyah: 110 },
        8: { startSurah: 6, startAyah: 111, endSurah: 7, endAyah: 87 },
        9: { startSurah: 7, startAyah: 88, endSurah: 8, endAyah: 40 },
        10: { startSurah: 8, startAyah: 41, endSurah: 9, endAyah: 92 },
        11: { startSurah: 9, startAyah: 93, endSurah: 11, endAyah: 5 },
        12: { startSurah: 11, startAyah: 6, endSurah: 12, endAyah: 52 },
        13: { startSurah: 12, startAyah: 53, endSurah: 14, endAyah: 52 },
        14: { startSurah: 15, startAyah: 1, endSurah: 16, endAyah: 128 },
        15: { startSurah: 17, startAyah: 1, endSurah: 18, endAyah: 74 },
        16: { startSurah: 18, startAyah: 75, endSurah: 20, endAyah: 135 },
        17: { startSurah: 21, startAyah: 1, endSurah: 22, endAyah: 78 },
        18: { startSurah: 23, startAyah: 1, endSurah: 25, endAyah: 20 },
        19: { startSurah: 25, startAyah: 21, endSurah: 27, endAyah: 55 },
        20: { startSurah: 27, startAyah: 56, endSurah: 29, endAyah: 45 },
        21: { startSurah: 29, startAyah: 46, endSurah: 33, endAyah: 30 },
        22: { startSurah: 33, startAyah: 31, endSurah: 36, endAyah: 27 },
        23: { startSurah: 36, startAyah: 28, endSurah: 39, endAyah: 31 },
        24: { startSurah: 39, startAyah: 32, endSurah: 41, endAyah: 46 },
        25: { startSurah: 41, startAyah: 47, endSurah: 45, endAyah: 37 },
        26: { startSurah: 46, startAyah: 1, endSurah: 51, endAyah: 30 },
        27: { startSurah: 51, startAyah: 31, endSurah: 57, endAyah: 29 },
        28: { startSurah: 58, startAyah: 1, endSurah: 66, endAyah: 12 },
        29: { startSurah: 67, startAyah: 1, endSurah: 77, endAyah: 50 },
        30: { startSurah: 78, startAyah: 1, endSurah: 114, endAyah: 6 },
      } as Record<number, { startSurah: number; startAyah: number; endSurah: number; endAyah: number }>;

      const b = boundaries[juzNum];
      if (!b) return res.status(404).json({ error: 'Juz boundaries not found' });

      const versesAgg: any[] = [];
      const editions = `quran-uthmani,${reciterEdition},ur.jalandhry,en.sahih`;
      for (let s = b.startSurah; s <= b.endSurah; s++) {
        const response = await axios.get(
          `${ALQURAN_CLOUD_API}/surah/${s}/editions/${editions}`,
          { timeout: 20000 }
        );
        if (response.data.code !== 200 || !response.data.data) {
          return res.status(500).json({ error: `Failed to fetch surah ${s} data` });
        }
        const [arabicData, audioData, urduData, englishData] = response.data.data;

        const startAyah = (s === b.startSurah) ? b.startAyah : 1;
        const endAyah = (s === b.endSurah) ? b.endAyah : arabicData.numberOfAyahs;
        for (let idx = startAyah - 1; idx < endAyah; idx++) {
          const ayah = arabicData.ayahs[idx];
          versesAgg.push({
            ayah: {
              number: ayah.number, // global ayah number
              numberInSurah: ayah.numberInSurah,
              text: ayah.text,
              audio: `/api/audio/128/${reciterEdition}/${ayah.number}.mp3`,
              surah: {
                number: arabicData.number,
                name: arabicData.name,
                englishName: arabicData.englishName,
              },
            },
            urduTranslation: {
              text: urduData.ayahs[idx]?.text || "",
              language: "Urdu",
              translator: "Fateh Muhammad Jalandhry",
            },
            englishTranslation: {
              text: englishData.ayahs[idx]?.text || "",
              language: "English",
              translator: "Sahih International",
            },
          });
        }
      }

      return res.json(versesAgg);
    } catch (error: any) {
      console.error('Error fetching juz:', error?.message || error);
      if (error.response?.status === 404) {
        return res.status(404).json({ error: 'Juz not found' });
      } else if (error.code === 'ECONNABORTED') {
        return res.status(504).json({ error: 'Request timeout - please try again' });
      }
      return res.status(500).json({ error: 'Failed to load Juz. Please try again.' });
    }
  });

  // Proxy Quran audio to avoid CORS/mixed-content/adblock issues
  const handleAudioProxy = async (req: any, res: any) => {
    try {
      const { bitrate, reciter, ayah } = req.params as { bitrate: string; reciter: string; ayah: string };
      // Validate basic params
      if (!/^(128|64|32)$/.test(bitrate)) {
        return res.status(400).json({ error: 'Invalid bitrate. Allowed: 128, 64, 32' });
      }
      if (!/^[a-z]{2}\.[a-z0-9.]+$/i.test(reciter)) {
        return res.status(400).json({ error: 'Invalid reciter identifier' });
      }
      const ayahNum = parseInt(ayah, 10);
      if (Number.isNaN(ayahNum) || ayahNum < 1) {
        return res.status(400).json({ error: 'Invalid ayah number' });
      }

      // Some reciters do not have ayah-by-ayah audio on the islamic.network CDN.
      // Gracefully fall back to a supported ayah-reciter to avoid playback errors.
      const SUPPORTED_AYAH_RECITERS = new Set(['ar.alafasy', 'ar.husary', 'ar.minshawi', 'ar.shaatree', 'ar.abdulbasitmurattal']);
      const fallbackMap: Record<string, string> = {
        'ar.sudais': 'ar.alafasy',
        'ar.ghamdi': 'ar.alafasy',
      };
      const effectiveReciter = SUPPORTED_AYAH_RECITERS.has(reciter) ? reciter : (fallbackMap[reciter] || 'ar.alafasy');

      const remoteUrl = `https://cdn.islamic.network/quran/audio/${bitrate}/${effectiveReciter}/${ayah}.mp3`;
      const cacheKey = `audio-${bitrate}-${effectiveReciter}-${ayah}`;
      const cached = getFromCache(cacheKey);
      if (cached) {
        // If we cached a Buffer previously, stream it
        res.setHeader('Content-Type', 'audio/mpeg');
        if (effectiveReciter !== reciter) {
          res.setHeader('X-Reciter-Fallback', effectiveReciter);
        }
        return res.end(cached);
      }

      const response = await axios.get(remoteUrl, { responseType: 'arraybuffer', timeout: 20000 });
      if (response.status >= 200 && response.status < 300 && response.data) {
        const buffer: Buffer = Buffer.from(response.data);
        // Cache small audio files briefly to reduce repeated fetches
        setCache(cacheKey, buffer);
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'public, max-age=300');
        if (effectiveReciter !== reciter) {
          res.setHeader('X-Reciter-Fallback', effectiveReciter);
        }
        return res.end(buffer);
      }
      return res.status(502).json({ error: 'Failed to fetch audio from CDN' });
    } catch (error: any) {
      console.error('Audio proxy error:', error?.message || error);
      if (error.code === 'ECONNABORTED') {
        return res.status(504).json({ error: 'Audio request timeout' });
      }
      return res.status(500).json({ error: 'Audio proxy failed' });
    }
  };

  // Broad match to ensure Windows path/Express parsing quirks don't miss this route
  app.get('/api/audio/*', (req, res) => {
    try {
      const parts = req.path.split('/').filter(Boolean);
      // parts: ['api','audio', '<bitrate>', '<reciter>', '<ayah(.mp3)?>']
      const bitrate = parts[2];
      const reciter = parts[3];
      let ayah = parts[4] || '';
      ayah = ayah.replace(/\.mp3$/i, '');

      req.params = { bitrate, reciter, ayah } as any;
      return handleAudioProxy(req, res);
    } catch (e) {
      console.error('Audio wildcard route parse error:', e);
      return res.status(400).json({ error: 'Invalid audio URL' });
    }
  });

  // Proxy full-surah audio by reciter and 3-digit surah number
  app.get('/api/surah-audio/:reciter/:surah3', async (req, res) => {
    try {
      const { reciter, surah3 } = req.params as { reciter: string; surah3: string };
      if (!/^[0-9]{3}$/.test(surah3)) {
        return res.status(400).json({ error: 'Invalid surah number (expected 3 digits)' });
      }
      if (!/^[a-z0-9_\-.]+$/i.test(reciter)) {
        return res.status(400).json({ error: 'Invalid reciter identifier' });
      }
      const remoteUrl = `https://download.quranicaudio.com/quran/${reciter}/${surah3}.mp3`;
      const cacheKey = `surah-audio-${reciter}-${surah3}`;
      const cached = getFromCache(cacheKey);
      if (cached) {
        res.setHeader('Content-Type', 'audio/mpeg');
        return res.end(cached);
      }
      const response = await axios.get(remoteUrl, { responseType: 'arraybuffer', timeout: 20000 });
      if (response.status >= 200 && response.status < 300 && response.data) {
        const buffer: Buffer = Buffer.from(response.data);
        setCache(cacheKey, buffer);
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'public, max-age=300');
        return res.end(buffer);
      }
      return res.status(502).json({ error: 'Failed to fetch surah audio from source' });
    } catch (error: any) {
      console.error('Surah audio proxy error:', error?.message || error);
      if (error.code === 'ECONNABORTED') {
        return res.status(504).json({ error: 'Audio request timeout' });
      }
      return res.status(500).json({ error: 'Surah audio proxy failed' });
    }
  });

  app.get('/api/search', async (req, res) => {
    try {
      const q = (req.query.q || '').toString().trim();
      if (!q) {
        return res.status(400).json({ error: 'Missing query' });
      }
      const cacheKey = `search-${q}`;
      const cached = getFromCache(cacheKey);
      if (cached) {
        return res.json(cached);
      }
      const url = `${ALQURAN_CLOUD_API}/search/${encodeURIComponent(q)}/quran-uthmani`;
      const response = await axios.get(url, { timeout: 15000 });
      if (response.data && response.data.code === 200 && response.data.data) {
        const items = Array.isArray(response.data.data.matches) ? response.data.data.matches : [];
        const results = items.map((m: any) => ({
          text: m.text || '',
          surah: {
            number: m.surah?.number || 0,
            name: m.surah?.name || '',
            englishName: m.surah?.englishName || ''
          },
          ayah: {
            number: m.number || 0,
            numberInSurah: m.numberInSurah || 0
          }
        }));
        setCache(cacheKey, { results });
        return res.json({ results });
      }
      return res.status(404).json({ error: 'No matches found' });
    } catch (error: any) {
      const msg = error?.message || '';
      if (error?.code === 'ECONNABORTED') {
        return res.status(504).json({ error: 'Search timeout' });
      }
      return res.status(500).json({ error: msg || 'Search failed' });
    }
  });

  app.get('/api/search/en', async (req, res) => {
    try {
      const q = (req.query.q || '').toString().trim();
      if (!q) {
        return res.status(400).json({ error: 'Missing query' });
      }
      const cacheKey = `search-en-${q}`;
      const cached = getFromCache(cacheKey);
      if (cached) {
        return res.json(cached);
      }
      const url = `${ALQURAN_CLOUD_API}/search/${encodeURIComponent(q)}/en.sahih`;
      const response = await axios.get(url, { timeout: 15000 });
      if (response.data && response.data.code === 200 && response.data.data) {
        const items = Array.isArray(response.data.data.matches) ? response.data.data.matches : [];
        const results = items.map((m: any) => ({
          englishText: m.text || '',
          surah: {
            number: m.surah?.number || 0,
            name: m.surah?.name || '',
            englishName: m.surah?.englishName || ''
          },
          ayah: {
            number: m.number || 0,
            numberInSurah: m.numberInSurah || 0
          }
        }));
        setCache(cacheKey, { results });
        return res.json({ results });
      }
      return res.status(404).json({ error: 'No matches found' });
    } catch (error: any) {
      const msg = error?.message || '';
      if (error?.code === 'ECONNABORTED') {
        return res.status(504).json({ error: 'Search timeout' });
      }
      return res.status(500).json({ error: msg || 'Search failed' });
    }
  });

  app.get('/api/ayah/:ayah', async (req, res) => {
    try {
      const { ayah } = req.params as { ayah: string };
      const ayahNum = parseInt(ayah, 10);
      if (Number.isNaN(ayahNum) || ayahNum < 1) {
        return res.status(400).json({ error: 'Invalid ayah number' });
      }
      const reciterEdition = (req.query.reciter as string) || 'ar.alafasy';
      const editions = `quran-uthmani,${reciterEdition},ur.jalandhry,en.sahih`;
      const cacheKey = `ayah-${ayahNum}-${reciterEdition}`;
      const cached = getFromCache(cacheKey);
      if (cached) {
        return res.json(cached);
      }
      const url = `${ALQURAN_CLOUD_API}/ayah/${ayahNum}/editions/${editions}`;
      const response = await axios.get(url, { timeout: 15000 });
      if (!(response.data && response.data.code === 200 && Array.isArray(response.data.data))) {
        return res.status(404).json({ error: 'Ayah not found' });
      }
      const [arabicData, audioData, urduData, englishData] = response.data.data;

      // Determine Juz (Para) using local map
      let juzNumber: number | null = null;
      try {
        const filePath = path.join(process.cwd(), 'public', 'data', 'juz_map.json');
        const raw = await fs.readFile(filePath, 'utf-8');
        const entries: Array<{ surah: number; ayah: number; juz: number }> = JSON.parse(raw);
        const found = entries.find(e => e.surah === (arabicData.surah?.number ?? arabicData.numberInSurah?.surah) && e.ayah === arabicData.numberInSurah);
        if (found) juzNumber = found.juz;
      } catch {}

      // Determine Mushaf page number using local map
      let pageNumber: number | null = null;
      try {
        const filePath = path.join(process.cwd(), 'public', 'data', 'page_map.json');
        const raw = await fs.readFile(filePath, 'utf-8');
        const entries: Array<{ surah: number; ayah: number; page: number }> = JSON.parse(raw);
        const found = entries.find(e => e.surah === (arabicData.surah?.number ?? arabicData.numberInSurah?.surah) && e.ayah === arabicData.numberInSurah);
        if (found) pageNumber = found.page;
      } catch {}

      const result = {
        ayah: {
          number: arabicData.number,
          numberInSurah: arabicData.numberInSurah,
          text: arabicData.text,
          audio: `/api/audio/128/${reciterEdition}/${arabicData.number}.mp3`,
          surah: {
            number: arabicData.surah?.number,
            name: arabicData.surah?.name,
            englishName: arabicData.surah?.englishName,
          },
          juzNumber: juzNumber,
          pageNumber: pageNumber,
        },
        urduTranslation: {
          text: urduData.text || '',
          language: 'Urdu',
          translator: 'Fateh Muhammad Jalandhry',
        },
        englishTranslation: {
          text: englishData.text || '',
          language: 'English',
          translator: 'Sahih International',
        },
      };
      setCache(cacheKey, result);
      return res.json(result);
    } catch (error: any) {
      if (error?.code === 'ECONNABORTED') {
        return res.status(504).json({ error: 'Request timeout' });
      }
      return res.status(500).json({ error: error?.message || 'Failed to fetch ayah' });
    }
  });

  // Upload user recording (audio/webm) and save under public/recordings
  app.post('/api/upload-recording', express.raw({ type: '*/*', limit: '50mb' }), async (req, res) => {
    try {
      const buf = req.body as Buffer;
      if (!buf || !(buf instanceof Buffer) || buf.length === 0) {
        return res.status(400).json({ error: 'No audio body provided' });
      }
      const id = randomUUID();
      const dir = path.join(process.cwd(), 'public', 'recordings');
      await fs.mkdir(dir, { recursive: true });
      const filename = `${id}.webm`;
      const filePath = path.join(dir, filename);
      await fs.writeFile(filePath, buf);
      const url = `/recordings/${filename}`;
      return res.json({ url, filename });
    } catch (e: any) {
      console.error('Upload recording error:', e?.message || e);
      return res.status(500).json({ error: 'Failed to save recording' });
    }
  });

  // Get Tafseer for a specific verse
  app.get("/api/tafseer/:surahNumber/:ayahNumber", async (req, res) => {
    try {
      const { surahNumber, ayahNumber } = req.params;
      
      // Validate input
      const surahNum = parseInt(surahNumber);
      const ayahNum = parseInt(ayahNumber);
      
      if (isNaN(surahNum) || isNaN(ayahNum) || surahNum < 1 || surahNum > 114 || ayahNum < 1) {
        return res.status(400).json({ error: "Invalid surah or ayah number" });
      }

      const tafseerID = 1; // Al-Tafsir Al-Muyassar (simple tafseer)
      const cacheKey = `tafseer-${surahNumber}-${ayahNumber}`;
      const cached = getFromCache(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const response = await axios.get(
        `${QURAN_TAFSEER_API}/tafseer/${tafseerID}/${surahNumber}/${ayahNumber}`,
        { timeout: 10000 }
      );

      if (response.data && response.data.text) {
        const tafseer = {
          ayahNumber: ayahNum,
          text: response.data.text,
          tafseerName: "التفسير الميسر (Al-Tafsir Al-Muyassar)",
          language: "Arabic",
        };
        
        setCache(cacheKey, tafseer);
        res.json(tafseer);
      } else {
        res.status(404).json({ error: "Tafseer not found for this verse" });
      }
    } catch (error: any) {
      console.error("Error fetching tafseer:", error.message);
      if (error.response?.status === 404) {
        res.status(404).json({ error: "Tafseer not available for this verse" });
      } else if (error.code === 'ECONNABORTED') {
        res.status(504).json({ error: "Request timeout - please try again" });
      } else {
        res.status(500).json({ error: "Failed to fetch tafseer" });
      }
    }
  });

  // English Tafsir: Maarif-ul-Quran (proxy/local-first)
  app.get("/api/tafseer/maarif/:surahNumber/:ayahNumber", async (req, res) => {
    try {
      const { surahNumber, ayahNumber } = req.params;
      const surahNum = parseInt(surahNumber);
      const ayahNum = parseInt(ayahNumber);

      if (isNaN(surahNum) || isNaN(ayahNum) || surahNum < 1 || surahNum > 114 || ayahNum < 1) {
        return res.status(400).json({ error: "Invalid surah or ayah number" });
      }

      const cacheKey = `tafseer-maarif-${surahNum}-${ayahNum}`;
      const cached = getFromCache(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      // Try local dataset first: public/data/tafsir/maarif/en/<surah>/<ayah>.json
      try {
        const localPath = path.join(process.cwd(), 'public', 'data', 'tafsir', 'maarif', 'en', String(surahNum), `${ayahNum}.json`);
        const exists = await fs.stat(localPath).then(() => true).catch(() => false);
        if (exists) {
          const raw = await fs.readFile(localPath, 'utf-8');
          const json = JSON.parse(raw);
          const tafseer = {
            ayahNumber: ayahNum,
            text: json.text || String(json),
            tafseerName: "Maarif-ul-Quran",
            language: "English",
          };
          setCache(cacheKey, tafseer);
          return res.json(tafseer);
        }
      } catch {}

      // Fallback to CDN mirrors: spa5k/tafsir_api
      const edition = 'en-tafsir-maarif-ul-quran';
      const mirrors = [
        `${TAFSIR_CDN_BASE}/${edition}/${surahNum}/${ayahNum}.json`,
        `https://cdn.statically.io/gh/spa5k/tafsir_api/main/tafsir/${edition}/${surahNum}/${ayahNum}.json`,
        `https://rawcdn.githack.com/spa5k/tafsir_api/main/tafseer/${edition}/${surahNum}/${ayahNum}.json`,
        `https://raw.githubusercontent.com/spa5k/tafsir_api/main/tafsir/${edition}/${surahNum}/${ayahNum}.json`,
      ];
      for (const url of mirrors) {
        try {
          const response = await axios.get(url, { timeout: 15000 });
          if (response.status >= 200 && response.status < 300 && response.data) {
            const data = response.data;
            const text = (typeof data === 'string') ? data : (data.text || data.content || JSON.stringify(data));
            const tafseer = {
              ayahNumber: ayahNum,
              text,
              tafseerName: "Maarif-ul-Quran",
              language: "English",
            };
            setCache(cacheKey, tafseer);
            return res.json(tafseer);
          }
        } catch (error: any) {
          // try next mirror
          continue;
        }
      }
      return res.status(404).json({ error: "Tafseer not available for this verse" });
    } catch (error: any) {
      console.error("Error in Maarif Tafseer route:", error?.message || error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Compute Juz (Para) boundaries from local ayah→juz map
  app.get('/api/juz-index', async (_req, res) => {
    try {
      const filePath = path.join(process.cwd(), 'public', 'data', 'juz_map.json');
      const raw = await fs.readFile(filePath, 'utf-8');
      const entries: Array<{ surah: number; ayah: number; juz: number }> = JSON.parse(raw);

      const CANONICAL_JUZ_BOUNDARIES: Array<{ number: number; startSurah: number; startAyah: number; endSurah: number; endAyah: number }> = [
        { number: 1, startSurah: 1, startAyah: 1, endSurah: 2, endAyah: 141 },
        { number: 2, startSurah: 2, startAyah: 142, endSurah: 2, endAyah: 252 },
        { number: 3, startSurah: 2, startAyah: 253, endSurah: 3, endAyah: 92 },
        { number: 4, startSurah: 3, startAyah: 92, endSurah: 4, endAyah: 23 },
        { number: 5, startSurah: 4, startAyah: 24, endSurah: 4, endAyah: 147 },
        { number: 6, startSurah: 4, startAyah: 148, endSurah: 5, endAyah: 82 },
        { number: 7, startSurah: 5, startAyah: 83, endSurah: 6, endAyah: 110 },
        { number: 8, startSurah: 6, startAyah: 111, endSurah: 7, endAyah: 87 },
        { number: 9, startSurah: 7, startAyah: 88, endSurah: 8, endAyah: 40 },
        { number: 10, startSurah: 8, startAyah: 41, endSurah: 9, endAyah: 92 },
        { number: 11, startSurah: 9, startAyah: 93, endSurah: 11, endAyah: 5 },
        { number: 12, startSurah: 11, startAyah: 6, endSurah: 12, endAyah: 52 },
        { number: 13, startSurah: 12, startAyah: 53, endSurah: 14, endAyah: 52 },
        { number: 14, startSurah: 15, startAyah: 1, endSurah: 16, endAyah: 128 },
        { number: 15, startSurah: 17, startAyah: 1, endSurah: 18, endAyah: 74 },
        { number: 16, startSurah: 18, startAyah: 75, endSurah: 20, endAyah: 135 },
        { number: 17, startSurah: 21, startAyah: 1, endSurah: 22, endAyah: 78 },
        { number: 18, startSurah: 23, startAyah: 1, endSurah: 25, endAyah: 20 },
        { number: 19, startSurah: 25, startAyah: 21, endSurah: 27, endAyah: 55 },
        { number: 20, startSurah: 27, startAyah: 56, endSurah: 29, endAyah: 45 },
        { number: 21, startSurah: 29, startAyah: 46, endSurah: 33, endAyah: 30 },
        { number: 22, startSurah: 33, startAyah: 31, endSurah: 36, endAyah: 27 },
        { number: 23, startSurah: 36, startAyah: 28, endSurah: 39, endAyah: 31 },
        { number: 24, startSurah: 39, startAyah: 32, endSurah: 41, endAyah: 46 },
        { number: 25, startSurah: 41, startAyah: 47, endSurah: 45, endAyah: 37 },
        { number: 26, startSurah: 46, startAyah: 1, endSurah: 51, endAyah: 30 },
        { number: 27, startSurah: 51, startAyah: 31, endSurah: 57, endAyah: 29 },
        { number: 28, startSurah: 58, startAyah: 1, endSurah: 66, endAyah: 12 },
        { number: 29, startSurah: 67, startAyah: 1, endSurah: 77, endAyah: 50 },
        { number: 30, startSurah: 78, startAyah: 1, endSurah: 114, endAyah: 6 },
      ];

      // Group entries by juz
      const groups = new Map<number, Array<{ surah: number; ayah: number }>>();
      for (const e of entries) {
        if (!groups.has(e.juz)) groups.set(e.juz, []);
        groups.get(e.juz)!.push({ surah: e.surah, ayah: e.ayah });
      }

      // Helper to compare (surah, ayah) by natural Quran order
      const cmp = (a: { surah: number; ayah: number }, b: { surah: number; ayah: number }) => {
        if (a.surah !== b.surah) return a.surah - b.surah;
        return a.ayah - b.ayah;
      };

      const result = Array.from({ length: 30 }, (_, i) => {
        const num = i + 1;
        const list = groups.get(num) ?? [];
        if (list.length === 0) {
          // Fallback to canonical boundaries when local map is missing
          const canon = CANONICAL_JUZ_BOUNDARIES.find(x => x.number === num)!;
          return canon;
        }
        // Compute min and max by (surah, ayah)
        let start = list[0];
        let end = list[0];
        for (const p of list) {
          if (cmp(p, start) < 0) start = p;
          if (cmp(p, end) > 0) end = p;
        }
        return {
          number: num,
          startSurah: start.surah,
          startAyah: start.ayah,
          endSurah: end.surah,
          endAyah: end.ayah,
        };
      });

      res.json(result);
    } catch (e: any) {
      console.error('Juz index error:', e?.message || e);
      res.status(500).json({ error: 'Failed to compute Juz boundaries' });
    }
  });

  // Get Hadiths from a collection
  app.get("/api/hadiths/:collection", async (req, res) => {
    try {
      const { collection } = req.params;
      const { search, page = 1 } = req.query;

      // Validate collection
      const validCollections = ['bukhari', 'muslim', 'abudawud', 'tirmidhi', 'ibnmajah', 'nasai', 'malik'];
      if (!validCollections.includes(collection)) {
        return res.status(400).json({ 
          error: "Invalid collection. Must be one of: bukhari, muslim, abudawud, tirmidhi, ibnmajah, nasai, malik" 
        });
      }

      const pageNum = parseInt(page as string) || 1;
      const pageSize = 20;
      
      const cacheKey = `hadiths-v2-${collection}-${pageNum}-${search || ''}`;
      const cached = getFromCache(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      // Use fawazahmed0 Hadith API (CDN-hosted, no auth required)
      // https://github.com/fawazahmed0/hadith-api
      const HADITH_CDN = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1';
      const editionName = `eng-${collection}`; // English editions
      const url = `${HADITH_CDN}/editions/${editionName}.json`;
      
      const response = await axios.get(url, { timeout: 15000 });

      if (response.data && response.data.hadiths) {
        let allHadiths = response.data.hadiths;
        
        // Apply search filter if provided
        if (search && typeof search === 'string') {
          const searchLower = search.toLowerCase();
          allHadiths = allHadiths.filter((h: any) => 
            h.text?.toLowerCase().includes(searchLower) ||
            h.arabicnumber?.toString().includes(search) ||
            h.hadithnumber?.toString().includes(search)
          );
        }

        // Paginate results
        const start = (pageNum - 1) * pageSize;
        const end = start + pageSize;
        const paginatedHadiths = allHadiths.slice(start, end);

        const result = {
          collection: collection,
          hadiths: paginatedHadiths.map((h: any) => ({
            number: h.hadithnumber || h.arabicnumber,
            arabicText: '', // API doesn't provide Arabic in English edition
            englishText: h.text || '',
            hadithNumber: (h.hadithnumber || h.arabicnumber || '').toString(),
            narrator: '',
            book: collection,
            collection: collection,
            urduText: '', // Not available in English edition
            reference: `${collection.charAt(0).toUpperCase() + collection.slice(1)} ${h.hadithnumber || h.arabicnumber || ''}`,
            // Serialize grades: if array has objects, map to readable strings; if empty, undefined
            grade: h.grades && h.grades.length > 0 
              ? h.grades.map((g: any) => typeof g === 'object' ? `${g.name || ''}: ${g.grade || ''}`.trim() : String(g)).join(', ')
              : undefined
          })),
          page: pageNum,
          pageSize: pageSize,
          hasMore: end < allHadiths.length,
          total: allHadiths.length
        };

        // Cache for longer (data is static on CDN)
        setCache(cacheKey, result);
        res.json(result);
      } else {
        res.status(500).json({ error: "Failed to fetch hadiths" });
      }
    } catch (error: any) {
      console.error("Error fetching hadiths:", error.message);
      if (error.response?.status === 404) {
        res.status(404).json({ error: "Hadith collection not found. Try: bukhari, muslim, abudawud, tirmidhi, ibnmajah" });
      } else if (error.code === 'ECONNABORTED') {
        res.status(504).json({ error: "Request timeout - please try again" });
      } else {
        res.status(500).json({ error: "Failed to load hadiths. Please try again." });
      }
    }
  });

  // ============================================================================
  // User Session & Bookmarks API
  // ============================================================================

  // Get or create user by session ID
  app.post("/api/user/session", async (req, res) => {
    try {
      const { sessionId } = req.body;

      if (!sessionId || typeof sessionId !== 'string' || sessionId.length === 0) {
        return res.status(400).json({ error: "Session ID is required" });
      }

      // Try to find existing user
      let user = await storage.getUserBySessionId(sessionId);

      // Create new user if doesn't exist
      if (!user) {
        user = await storage.createUser({ sessionId });
      }

      res.json(user);
    } catch (error: any) {
      console.error("Error managing user session:", error.message);
      res.status(500).json({ error: "Failed to manage user session" });
    }
  });

  // Get all bookmarks for a user
  app.get("/api/bookmarks/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      const bookmarks = await storage.getBookmarks(userId);
      res.json(bookmarks);
    } catch (error: any) {
      console.error("Error fetching bookmarks:", error.message);
      res.status(500).json({ error: "Failed to fetch bookmarks" });
    }
  });

  // Create a new bookmark
  app.post("/api/bookmarks", async (req, res) => {
    try {
      const parsed = insertBookmarkSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid bookmark data", details: parsed.error.errors });
      }

      const { userId, surahNumber, ayahNumber } = parsed.data;

      // Check if bookmark already exists
      const exists = await storage.checkBookmarkExists(userId, surahNumber, ayahNumber);
      if (exists) {
        return res.status(409).json({ error: "Bookmark already exists" });
      }

      const bookmark = await storage.createBookmark(parsed.data);
      res.status(201).json(bookmark);
    } catch (error: any) {
      console.error("Error creating bookmark:", error.message);
      res.status(500).json({ error: "Failed to create bookmark" });
    }
  });

  // Delete a bookmark
  app.delete("/api/bookmarks/:bookmarkId/:userId", async (req, res) => {
    try {
      const bookmarkId = parseInt(req.params.bookmarkId);
      const userId = parseInt(req.params.userId);

      if (isNaN(bookmarkId) || isNaN(userId)) {
        return res.status(400).json({ error: "Invalid bookmark ID or user ID" });
      }

      await storage.deleteBookmark(bookmarkId, userId);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting bookmark:", error.message);
      res.status(500).json({ error: "Failed to delete bookmark" });
    }
  });


  const httpServer = createServer(app);
  return httpServer;
}
