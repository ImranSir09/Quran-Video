
import { Surah, Ayah } from '../types';

const BASE_URL = 'https://api.alquran.cloud/v1';

export const fetchSurahs = async (): Promise<Surah[]> => {
  const response = await fetch(`${BASE_URL}/surah`);
  const data = await response.json();
  return data.data;
};

export const fetchAyahs = async (surahNumber: number, edition: string = 'quran-uthmani'): Promise<any[]> => {
  const response = await fetch(`${BASE_URL}/surah/${surahNumber}/${edition}`);
  const data = await response.json();
  return data.data.ayahs;
};

export const fetchTranslation = async (surahNumber: number, translationEdition: string = 'en.sahih'): Promise<any[]> => {
  const response = await fetch(`${BASE_URL}/surah/${surahNumber}/${translationEdition}`);
  const data = await response.json();
  return data.data.ayahs;
};

export const getVerseData = async (surahNumber: number): Promise<Ayah[]> => {
  const [arabic, translation] = await Promise.all([
    fetchAyahs(surahNumber),
    fetchTranslation(surahNumber)
  ]);

  const surahInfo = (await fetchSurahs()).find(s => s.number === surahNumber)!;

  return arabic.map((ayah, index) => ({
    number: ayah.numberInSurah,
    text: ayah.text,
    translation: translation[index].text,
    surah: surahInfo
  }));
};
