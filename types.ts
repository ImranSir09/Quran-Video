
export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
}

export interface Ayah {
  number: number;
  text: string;
  translation: string;
  surah: Surah;
}

export interface EditorSettings {
  arabicFontSize: number;
  translationFontSize: number;
  arabicFontFamily: string;
  translationFontFamily: string;
  arabicColor: string;
  translationColor: string;
  overlayOpacity: number;
  textAlign: 'left' | 'center' | 'right';
  backgroundType: 'image' | 'video' | 'gradient';
  backgroundUrl: string;
}

export type BackgroundTemplate = {
  id: string;
  name: string;
  url: string;
  type: 'video' | 'image';
  preview: string;
};
