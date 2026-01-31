
import { Surah, Ayah } from '../types';

const BASE_URL = 'https://api.alquran.cloud/v1';

/**
 * Fetches the list of all Surahs
 */
export const fetchSurahs = async (): Promise<Surah[]> => {
  try {
    const response = await fetch(`${BASE_URL}/surah`, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error('API request failed');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching surahs:", error);
    throw error;
  }
};

/**
 * Fetches specific Ayahs for a Surah
 */
export const fetchAyahs = async (surahNumber: number, edition: string = 'quran-uthmani'): Promise<any[]> => {
  try {
    const response = await fetch(`${BASE_URL}/surah/${surahNumber}/${edition}`, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error('API request failed');
    const data = await response.json();
    return data.data.ayahs;
  } catch (error) {
    console.error(`Error fetching ayahs for surah ${surahNumber}:`, error);
    throw error;
  }
};

/**
 * Fetches translation for a Surah
 */
export const fetchTranslation = async (surahNumber: number, translationEdition: string = 'en.sahih'): Promise<any[]> => {
  try {
    const response = await fetch(`${BASE_URL}/surah/${surahNumber}/${translationEdition}`, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error('API request failed');
    const data = await response.json();
    return data.data.ayahs;
  } catch (error) {
    console.error(`Error fetching translation for surah ${surahNumber}:`, error);
    throw error;
  }
};

/**
 * Orchestrates fetching both Arabic text and English translation
 */
export const getVerseData = async (surahNumber: number): Promise<Ayah[]> => {
  try {
    const [arabic, translation, surahList] = await Promise.all([
      fetchAyahs(surahNumber),
      fetchTranslation(surahNumber),
      fetchSurahs()
    ]);

    const surahInfo = surahList.find(s => s.number === surahNumber);
    if (!surahInfo) throw new Error("Surah info not found");

    return arabic.map((ayah, index) => ({
      number: ayah.numberInSurah,
      text: ayah.text,
      translation: translation[index].text,
      surah: surahInfo
    }));
  } catch (error) {
    console.error("Failed to compile verse data:", error);
    throw error;
  }
};
