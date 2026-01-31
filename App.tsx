
import React, { useState, useEffect, useRef } from 'react';
import { Surah, Ayah, EditorSettings, BackgroundTemplate } from './types';
import { fetchSurahs, getVerseData } from './services/quranService';
import { getVisualThemeForVerse, VisualTheme } from './services/geminiService';
import { 
  Settings, 
  Type, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Download, 
  ChevronRight, 
  Search, 
  Sparkles,
  Play,
  Pause,
  Layers,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize
} from 'lucide-react';

// Mock templates
const BACKGROUND_TEMPLATES: BackgroundTemplate[] = [
  { id: '1', name: 'Desert Night', type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-the-night-sky-slow-motion-2630-large.mp4', preview: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bc3c?auto=format&fit=crop&w=400&q=80' },
  { id: '2', name: 'Forest Mist', type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-forest-covered-with-fog-and-mist-under-a-gloomy-sky-26466-large.mp4', preview: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=400&q=80' },
  { id: '3', name: 'Ocean Waves', type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-ocean-at-sunset-1200-large.mp4', preview: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=400&q=80' },
  { id: '4', name: 'Golden Clouds', type: 'image', url: 'https://images.unsplash.com/photo-1499346030926-9a72daac6c63?auto=format&fit=crop&w=1200&q=100', preview: 'https://images.unsplash.com/photo-1499346030926-9a72daac6c63?auto=format&fit=crop&w=400&q=80' },
];

const FONTS = [
  { name: 'Amiri', value: "'Amiri', serif" },
  { name: 'Scheherazade', value: "'Scheherazade New', serif" },
  { name: 'Inter', value: "'Inter', sans-serif" },
  { name: 'Playfair', value: "'Playfair Display', serif" },
];

const App: React.FC = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [selectedAyahIndex, setSelectedAyahIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'ai'>('content');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const [settings, setSettings] = useState<EditorSettings>({
    arabicFontSize: 32,
    translationFontSize: 18,
    arabicFontFamily: "'Amiri', serif",
    translationFontFamily: "'Inter', sans-serif",
    arabicColor: '#ffffff',
    translationColor: '#e2e8f0',
    overlayOpacity: 0.4,
    textAlign: 'center',
    backgroundType: 'video',
    backgroundUrl: BACKGROUND_TEMPLATES[0].url
  });

  const [aiTheme, setAiTheme] = useState<VisualTheme | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const list = await fetchSurahs();
        setSurahs(list);
        const verses = await getVerseData(1);
        setAyahs(verses);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSurahChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value);
    setSelectedSurah(id);
    setIsLoading(true);
    const verses = await getVerseData(id);
    setAyahs(verses);
    setSelectedAyahIndex(0);
    setIsLoading(false);
  };

  const handleAiOptimize = async () => {
    if (!ayahs[selectedAyahIndex]) return;
    setIsLoading(true);
    try {
      const theme = await getVisualThemeForVerse(ayahs[selectedAyahIndex].text, ayahs[selectedAyahIndex].translation);
      setAiTheme(theme);
      setSettings(prev => ({
        ...prev,
        arabicColor: theme.primaryColor,
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setExportProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsExporting(false);
          setExportProgress(0);
          alert('Video exported successfully (Simulated)');
        }, 500);
      }
    }, 150);
  };

  const currentAyah = ayahs[selectedAyahIndex];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar */}
      <div className="w-80 border-r border-slate-800 bg-slate-900 flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <h1 className="font-bold text-xl tracking-tight">QuranLens</h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800">
          <button 
            onClick={() => setActiveTab('content')}
            className={`flex-1 p-3 text-sm font-medium transition ${activeTab === 'content' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Content
          </button>
          <button 
            onClick={() => setActiveTab('design')}
            className={`flex-1 p-3 text-sm font-medium transition ${activeTab === 'design' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Design
          </button>
          <button 
            onClick={() => setActiveTab('ai')}
            className={`flex-1 p-3 text-sm font-medium transition ${activeTab === 'ai' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            AI Insight
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {activeTab === 'content' && (
            <div className="space-y-6">
              <section>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Surah Selection</label>
                <div className="relative">
                  <select 
                    value={selectedSurah}
                    onChange={handleSurahChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm appearance-none focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {surahs.map(s => (
                      <option key={s.number} value={s.number}>{s.number}. {s.englishName}</option>
                    ))}
                  </select>
                  <ChevronRight size={16} className="absolute right-3 top-3.5 text-slate-500 pointer-events-none" />
                </div>
              </section>

              <section>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Select Ayah</label>
                <div className="space-y-2 h-96 overflow-y-auto custom-scrollbar pr-2">
                  {ayahs.map((a, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedAyahIndex(i)}
                      className={`w-full text-left p-3 rounded-lg text-xs transition border ${selectedAyahIndex === i ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-100' : 'bg-slate-800/50 border-transparent text-slate-400 hover:bg-slate-800'}`}
                    >
                      <div className="flex justify-between mb-1">
                        <span className="font-bold">Ayah {a.number}</span>
                      </div>
                      <p className="line-clamp-2 italic">{a.translation}</p>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'design' && (
            <div className="space-y-8">
              <section>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-4">Background</label>
                <div className="grid grid-cols-2 gap-3">
                  {BACKGROUND_TEMPLATES.map(tmp => (
                    <button 
                      key={tmp.id}
                      onClick={() => setSettings(s => ({ ...s, backgroundType: tmp.type, backgroundUrl: tmp.url }))}
                      className={`group relative aspect-video rounded-lg overflow-hidden border-2 transition ${settings.backgroundUrl === tmp.url ? 'border-emerald-500' : 'border-transparent'}`}
                    >
                      <img src={tmp.preview} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        {tmp.type === 'video' ? <VideoIcon size={20} /> : <ImageIcon size={20} />}
                      </div>
                    </button>
                  ))}
                  <div className="aspect-video rounded-lg border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 hover:border-emerald-500 hover:text-emerald-400 cursor-pointer transition">
                    <ImageIcon size={20} />
                    <span className="text-[10px] mt-1">Upload</span>
                  </div>
                </div>
              </section>

              <section>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-4">Typography</label>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-slate-400 mb-2 block">Arabic Font</span>
                    <select 
                      value={settings.arabicFontFamily}
                      onChange={(e) => setSettings(s => ({ ...s, arabicFontFamily: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm"
                    >
                      {FONTS.map(f => <option key={f.name} value={f.value}>{f.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 mb-2 block">Arabic Size ({settings.arabicFontSize}px)</span>
                    <input 
                      type="range" min="20" max="80" 
                      value={settings.arabicFontSize} 
                      onChange={(e) => setSettings(s => ({ ...s, arabicFontSize: parseInt(e.target.value) }))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    {['left', 'center', 'right'].map((align) => (
                      <button 
                        key={align}
                        onClick={() => setSettings(s => ({ ...s, textAlign: align as any }))}
                        className={`p-2 rounded border border-slate-700 ${settings.textAlign === align ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500' : 'hover:bg-slate-800'}`}
                      >
                        {align === 'left' ? <AlignLeft size={16} /> : align === 'center' ? <AlignCenter size={16} /> : <AlignRight size={16} />}
                      </button>
                    ))}
                    <input 
                      type="color" 
                      value={settings.arabicColor} 
                      onChange={(e) => setSettings(s => ({ ...s, arabicColor: e.target.value }))}
                      className="w-10 h-10 bg-transparent p-0 border-none cursor-pointer"
                    />
                  </div>
                </div>
              </section>

              <section>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-4">Vignette & Overlay</label>
                <input 
                  type="range" min="0" max="1" step="0.1" 
                  value={settings.overlayOpacity} 
                  onChange={(e) => setSettings(s => ({ ...s, overlayOpacity: parseFloat(e.target.value) }))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </section>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2 text-emerald-400">
                  <Sparkles size={18} />
                  <span className="font-bold text-sm">Gemini AI Engine</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Get visual recommendations based on the linguistic and spiritual weight of this verse.
                </p>
                <button 
                  onClick={handleAiOptimize}
                  className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg text-xs transition flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Thinking...' : 'Analyze Verse'}
                </button>
              </div>

              {aiTheme && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">Tone</span>
                    <p className="text-sm font-medium">{aiTheme.emotionalTone}</p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">Typography Vibe</span>
                    <p className="text-sm">{aiTheme.fontVibe}</p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">Visual Prompt</span>
                    <p className="text-xs leading-relaxed text-slate-400 italic">"{aiTheme.suggestedBackgroundPrompt}"</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Preview Area */}
      <main className="flex-1 flex flex-col items-center justify-center bg-slate-950 p-8 relative overflow-hidden">
        {/* Export Progress Overlay */}
        {isExporting && (
          <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm transition-all">
            <div className="w-64">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-emerald-400">Exporting Video...</span>
                <span className="text-sm text-slate-400">{exportProgress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300" 
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
              <p className="text-center text-xs text-slate-500 mt-4 italic">Rendering shaders and atmospheric particles...</p>
            </div>
          </div>
        )}

        <div className="video-container relative group shadow-2xl rounded-[32px] overflow-hidden border border-slate-800 bg-black max-w-[400px]">
          {/* Background Layer */}
          <div className="absolute inset-0 w-full h-full">
            {settings.backgroundType === 'video' ? (
              <video 
                key={settings.backgroundUrl}
                autoPlay muted loop playsInline
                className="w-full h-full object-cover"
              >
                <source src={settings.backgroundUrl} type="video/mp4" />
              </video>
            ) : (
              <img src={settings.backgroundUrl} className="w-full h-full object-cover" />
            )}
            {/* Dark Overlay */}
            <div 
              className="absolute inset-0 bg-black" 
              style={{ opacity: settings.overlayOpacity }}
            />
          </div>

          {/* Text Content Layer */}
          <div className={`absolute inset-0 p-10 flex flex-col items-center justify-center h-full gap-8 z-10 transition-all`}>
            {currentAyah ? (
              <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div 
                  className="arabic-text leading-loose"
                  style={{ 
                    fontSize: `${settings.arabicFontSize}px`,
                    color: settings.arabicColor,
                    textAlign: settings.textAlign,
                    fontFamily: settings.arabicFontFamily,
                    textShadow: '0 4px 12px rgba(0,0,0,0.5)'
                  }}
                >
                  {currentAyah.text}
                </div>
                <div 
                  className="leading-relaxed font-light"
                  style={{ 
                    fontSize: `${settings.translationFontSize}px`,
                    color: settings.translationColor,
                    textAlign: settings.textAlign,
                    fontFamily: settings.translationFontFamily,
                    textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                  }}
                >
                  {currentAyah.translation}
                </div>
                <div className="pt-4 flex items-center justify-center gap-2 opacity-60">
                  <div className="h-[1px] w-8 bg-slate-400" />
                  <span className="text-[10px] uppercase tracking-[0.2em] font-medium">
                    {currentAyah.surah.englishName} : {currentAyah.number}
                  </span>
                  <div className="h-[1px] w-8 bg-slate-400" />
                </div>
              </div>
            ) : (
              <div className="text-slate-500 flex flex-col items-center">
                <Search size={32} className="mb-2 opacity-20" />
                <span>Select a verse</span>
              </div>
            )}
          </div>

          {/* Controls Overlay (Hidden by default, shown on hover) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/20 backdrop-blur-md px-6 py-3 rounded-full opacity-0 group-hover:opacity-100 transition duration-300">
            <button className="text-white hover:text-emerald-400 transition">
              <AlignLeft size={18} />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition"
            >
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
            </button>
            <button className="text-white hover:text-emerald-400 transition">
              <Maximize size={18} />
            </button>
          </div>
        </div>

        {/* Toolbar Top Right */}
        <div className="absolute top-8 right-8 flex gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-6 rounded-full shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Download size={18} />
            <span>Export MP4</span>
          </button>
          <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-full text-white transition">
            <Settings size={18} />
          </button>
        </div>

        {/* Floating Tips */}
        <div className="absolute bottom-8 left-8 text-xs text-slate-500 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>9:16 Aspect Ratio Optimized for Reels/TikTok</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
            <span>Press Space to Play/Pause Preview</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
