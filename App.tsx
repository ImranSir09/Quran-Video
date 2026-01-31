
import React, { useState, useEffect } from 'react';
import { Surah, Ayah, EditorSettings, BackgroundTemplate } from './types';
import { fetchSurahs, getVerseData } from './services/quranService';
import { getVisualThemeForVerse, VisualTheme } from './services/geminiService';
import { 
  Settings, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Download, 
  ChevronRight, 
  Search, 
  Sparkles,
  Play,
  Pause,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

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
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingAyahs, setIsLoadingAyahs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'ai'>('content');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isAiThinking, setIsAiThinking] = useState(false);

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

  const loadInitialData = async () => {
    setIsLoadingInitial(true);
    setError(null);
    try {
      const list = await fetchSurahs();
      setSurahs(list);
      const verses = await getVerseData(1);
      setAyahs(verses);
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the Quran database. Please check your internet connection.");
    } finally {
      setIsLoadingInitial(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleSurahChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value);
    setSelectedSurah(id);
    setIsLoadingAyahs(true);
    try {
      const verses = await getVerseData(id);
      setAyahs(verses);
      setSelectedAyahIndex(0);
    } catch (err) {
      console.error(err);
      setError("Failed to load verses for this Surah.");
    } finally {
      setIsLoadingAyahs(false);
    }
  };

  const handleAiOptimize = async () => {
    if (!ayahs[selectedAyahIndex]) return;
    setIsAiThinking(true);
    try {
      const theme = await getVisualThemeForVerse(ayahs[selectedAyahIndex].text, ayahs[selectedAyahIndex].translation);
      setAiTheme(theme);
      setSettings(prev => ({
        ...prev,
        arabicColor: theme.primaryColor,
      }));
    } catch (err) {
      console.error(err);
      alert("AI analysis failed. Please ensure your Gemini API Key is configured.");
    } finally {
      setIsAiThinking(false);
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

  if (isLoadingInitial) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-950 text-white">
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-emerald-500 rounded-3xl flex items-center justify-center loading-pulse">
            <Sparkles size={48} className="text-white" />
          </div>
          <div className="absolute -inset-4 bg-emerald-500/20 blur-2xl rounded-full loading-pulse" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">QuranLens Studio</h1>
        <p className="text-slate-400 text-sm animate-pulse">Initializing Verse Database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-950 text-white p-6">
        <AlertCircle size={48} className="text-red-400 mb-4" />
        <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
        <p className="text-slate-400 text-center max-w-md mb-6">{error}</p>
        <button 
          onClick={loadInitialData}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded-lg font-medium transition"
        >
          <RefreshCw size={18} />
          Retry Connection
        </button>
      </div>
    );
  }

  const currentAyah = ayahs[selectedAyahIndex];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar */}
      <div className="w-80 border-r border-slate-800 bg-slate-900 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <h1 className="font-bold text-xl tracking-tight">QuranLens</h1>
        </div>

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
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-2 tracking-wider">Surah</label>
                <div className="relative">
                  <select 
                    value={selectedSurah}
                    onChange={handleSurahChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm appearance-none focus:ring-2 focus:ring-emerald-500 outline-none transition cursor-pointer"
                  >
                    {surahs.map(s => (
                      <option key={s.number} value={s.number}>{s.number}. {s.englishName}</option>
                    ))}
                  </select>
                  <ChevronRight size={16} className="absolute right-3 top-3.5 text-slate-500 pointer-events-none rotate-90" />
                </div>
              </section>

              <section>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-2 tracking-wider">Ayahs</label>
                <div className="space-y-2 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                  {isLoadingAyahs ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500 italic">
                      <RefreshCw size={24} className="animate-spin mb-2" />
                      <span className="text-xs">Loading verses...</span>
                    </div>
                  ) : (
                    ayahs.map((a, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedAyahIndex(i)}
                        className={`w-full text-left p-3 rounded-xl text-xs transition border ${selectedAyahIndex === i ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-100 shadow-lg' : 'bg-slate-800/50 border-transparent text-slate-400 hover:bg-slate-800'}`}
                      >
                        <div className="flex justify-between mb-1">
                          <span className="font-bold opacity-80">Ayah {a.number}</span>
                        </div>
                        <p className="line-clamp-2 leading-relaxed italic">{a.translation}</p>
                      </button>
                    ))
                  )}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'design' && (
            <div className="space-y-8">
              <section>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-4 tracking-wider">Background</label>
                <div className="grid grid-cols-2 gap-3">
                  {BACKGROUND_TEMPLATES.map(tmp => (
                    <button 
                      key={tmp.id}
                      onClick={() => setSettings(s => ({ ...s, backgroundType: tmp.type, backgroundUrl: tmp.url }))}
                      className={`group relative aspect-video rounded-xl overflow-hidden border-2 transition ${settings.backgroundUrl === tmp.url ? 'border-emerald-500' : 'border-transparent'}`}
                    >
                      <img src={tmp.preview} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        {tmp.type === 'video' ? <VideoIcon size={20} /> : <ImageIcon size={20} />}
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-6">
                <label className="block text-xs font-semibold uppercase text-slate-500 tracking-wider">Typography</label>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 mb-2 block">Arabic Font</span>
                    <select 
                      value={settings.arabicFontFamily}
                      onChange={(e) => setSettings(s => ({ ...s, arabicFontFamily: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm"
                    >
                      {FONTS.map(f => <option key={f.name} value={f.value}>{f.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 mb-2 block">Alignment & Color</span>
                    <div className="flex gap-2">
                      {['left', 'center', 'right'].map((align) => (
                        <button 
                          key={align}
                          onClick={() => setSettings(s => ({ ...s, textAlign: align as any }))}
                          className={`flex-1 py-2 rounded-lg border border-slate-700 flex justify-center ${settings.textAlign === align ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500' : 'hover:bg-slate-800'}`}
                        >
                          {align === 'left' ? <AlignLeft size={16} /> : align === 'center' ? <AlignCenter size={16} /> : <AlignRight size={16} />}
                        </button>
                      ))}
                      <div className="relative">
                        <input 
                          type="color" 
                          value={settings.arabicColor} 
                          onChange={(e) => setSettings(s => ({ ...s, arabicColor: e.target.value }))}
                          className="w-10 h-10 bg-slate-800 p-1 border border-slate-700 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 mb-2 block">Arabic Size ({settings.arabicFontSize}px)</span>
                    <input 
                      type="range" min="20" max="80" 
                      value={settings.arabicFontSize} 
                      onChange={(e) => setSettings(s => ({ ...s, arabicFontSize: parseInt(e.target.value) }))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>
                </div>
              </section>

              <section>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-4 tracking-wider">Atmosphere</label>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 mb-2 block">Overlay Intensity</span>
                  <input 
                    type="range" min="0" max="1" step="0.1" 
                    value={settings.overlayOpacity} 
                    onChange={(e) => setSettings(s => ({ ...s, overlayOpacity: parseFloat(e.target.value) }))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </section>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-2xl relative overflow-hidden">
                <div className="absolute -right-4 -top-4 opacity-10">
                  <Sparkles size={100} />
                </div>
                <div className="flex items-center gap-2 mb-2 text-emerald-400">
                  <Sparkles size={18} />
                  <span className="font-bold text-sm">Gemini Visualizer</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Our AI analyzes the linguistic depth of this verse to suggest the perfect color palette and background mood.
                </p>
                <button 
                  onClick={handleAiOptimize}
                  disabled={isAiThinking}
                  className={`w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20`}
                >
                  {isAiThinking ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {isAiThinking ? 'Analyzing Verse...' : 'Get AI Theme'}
                </button>
              </div>

              {aiTheme && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <span className="text-[10px] uppercase font-bold text-emerald-500 block mb-1">Tone & Vibe</span>
                    <p className="text-sm font-medium text-slate-100">{aiTheme.emotionalTone}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{aiTheme.fontVibe}</p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <span className="text-[10px] uppercase font-bold text-emerald-500 block mb-1">Cinematic Suggestion</span>
                    <p className="text-xs leading-relaxed text-slate-300 italic">"{aiTheme.suggestedBackgroundPrompt}"</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Preview Area */}
      <main className="flex-1 flex flex-col items-center justify-center bg-slate-950 p-8 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full" />

        {/* Export Progress Overlay */}
        {isExporting && (
          <div className="absolute inset-0 z-50 bg-slate-950/90 flex flex-col items-center justify-center backdrop-blur-md transition-all">
            <div className="w-72">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-emerald-400 tracking-wide uppercase">Rendering Edit</span>
                <span className="text-sm font-mono text-slate-400">{exportProgress}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
              <p className="text-center text-[10px] text-slate-500 mt-6 tracking-widest uppercase animate-pulse">Encoding high dynamic range content</p>
            </div>
          </div>
        )}

        <div className="video-container relative group shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-[40px] overflow-hidden border border-slate-800 bg-black max-w-[360px]">
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
            <div 
              className="absolute inset-0 bg-black" 
              style={{ opacity: settings.overlayOpacity }}
            />
          </div>

          {/* Text Content Layer */}
          <div className={`absolute inset-0 p-10 flex flex-col items-center justify-center h-full gap-10 z-10 transition-all`}>
            {currentAyah ? (
              <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
                <div 
                  className="arabic-text leading-[1.8]"
                  style={{ 
                    fontSize: `${settings.arabicFontSize}px`,
                    color: settings.arabicColor,
                    textAlign: settings.textAlign,
                    fontFamily: settings.arabicFontFamily,
                    textShadow: '0 4px 20px rgba(0,0,0,0.8)'
                  }}
                >
                  {currentAyah.text}
                </div>
                <div 
                  className="leading-relaxed font-light opacity-90"
                  style={{ 
                    fontSize: `${settings.translationFontSize}px`,
                    color: settings.translationColor,
                    textAlign: settings.textAlign,
                    fontFamily: settings.translationFontFamily,
                    textShadow: '0 2px 10px rgba(0,0,0,0.8)'
                  }}
                >
                  {currentAyah.translation}
                </div>
                <div className="pt-6 flex items-center justify-center gap-3 opacity-40">
                  <div className="h-[1px] w-6 bg-slate-100" />
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold">
                    {currentAyah.surah.englishName} • {currentAyah.number}
                  </span>
                  <div className="h-[1px] w-6 bg-slate-100" />
                </div>
              </div>
            ) : (
              <div className="text-slate-500 flex flex-col items-center">
                <Search size={32} className="mb-4 opacity-20" />
                <span className="text-xs uppercase tracking-widest font-bold">Select a Verse</span>
              </div>
            )}
          </div>

          {/* Controls Overlay */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/40 backdrop-blur-xl px-8 py-4 rounded-full opacity-0 group-hover:opacity-100 transition duration-500 border border-white/10">
            <button className="text-white hover:text-emerald-400 transition transform hover:scale-110">
              <AlignLeft size={20} />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white hover:scale-110 active:scale-90 transition shadow-lg shadow-emerald-500/40"
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
            </button>
            <button className="text-white hover:text-emerald-400 transition transform hover:scale-110">
              <Maximize size={20} />
            </button>
          </div>
        </div>

        {/* Export Toolbar */}
        <div className="absolute top-8 right-8 flex gap-4">
          <button 
            onClick={handleExport}
            className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-full shadow-2xl shadow-emerald-500/40 transition-all hover:-translate-y-1 active:translate-y-0"
          >
            <Download size={20} />
            <span className="tracking-wide text-sm">EXPORT STUDIO</span>
          </button>
        </div>

        {/* Status Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-8">
           <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 backdrop-blur-md rounded-full border border-slate-800">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">9:16 Optimized</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 backdrop-blur-md rounded-full border border-slate-800">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">4K Render Ready</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
