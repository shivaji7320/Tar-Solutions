import React, { useState, useEffect, useRef } from 'react';
import { Project, ProjectMedia } from '../types';
import { Language, translations } from '../utils/translations';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Play,
  Pause,
  MapPin,
  Calendar,
  Layers
} from 'lucide-react';

interface GallerySliderProps {
  projects: Project[];
  language?: Language;
  autoSlideInterval?: number;
}

export const GallerySlider: React.FC<GallerySliderProps> = ({
  projects,
  language = 'en',
  autoSlideInterval = 5000
}) => {
  const isTelugu = language === 'te';
  const t = translations[language];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activeStage, setActiveStage] = useState<'before' | 'during' | 'after'>('after');
  const [fullscreenMedia, setFullscreenMedia] = useState<{
    media: ProjectMedia;
    title: string;
    stage: string;
  } | null>(null);

  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (isPaused || projects.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % projects.length);
    }, autoSlideInterval);

    return () => clearInterval(timer);
  }, [isPaused, projects.length, autoSlideInterval]);

  if (!projects || projects.length === 0) {
    return (
      <div className="p-8 text-center text-[#8C8A82] bg-[#FDFCF9] rounded-xs border border-[#DCD9D1] text-xs uppercase tracking-wider">
        {isTelugu ? 'గ్యాలరీలో ప్రాజెక్టుల వివరాలు లేవు.' : 'No case study entries recorded in gallery.'}
      </div>
    );
  }

  const currentProject = projects[currentIndex] || projects[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % projects.length);
  };

  const getCurrentMedia = (stage: 'before' | 'during' | 'after'): ProjectMedia => {
    if (stage === 'before') return currentProject.beforeMedia;
    if (stage === 'during') return currentProject.duringMedia;
    return currentProject.afterMedia;
  };

  const currentActiveMedia = getCurrentMedia(activeStage);

  return (
    <div
      className="relative bg-[#FDFCF9] rounded-xs border border-[#DCD9D1] overflow-hidden shadow-sm"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Top Project Header Bar */}
      <div className="p-5 sm:p-6 bg-[#121212] text-[#F9F7F2] flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCD9D1]/20">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-1.5">
            <span className="bg-[#F9F7F2] text-[#121212] text-[9px] font-bold px-2 py-0.5 rounded-xs tracking-[0.2em] uppercase">
              {currentProject.serviceName}
            </span>
            <span className="text-[#8C8A82] text-[10px] uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#DCD9D1]" />
              {currentProject.location}
            </span>
            <span className="text-[#8C8A82] text-[10px] uppercase tracking-wider hidden md:flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#DCD9D1]" />
              {currentProject.date}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-normal text-[#F9F7F2]">
            {currentProject.name}
          </h3>
        </div>

        {/* Navigation Arrows & Project Counter */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#8C8A82] px-2">
            NO. {String(currentIndex + 1).padStart(2, '0')} // {String(projects.length).padStart(2, '0')}
          </span>
          <button
            onClick={handlePrev}
            className="p-2 rounded-xs bg-[#242424] hover:bg-[#3D3B35] text-white transition-colors cursor-pointer border border-[#DCD9D1]/20"
            aria-label="Previous project"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-2 rounded-xs bg-[#242424] hover:bg-[#3D3B35] text-white transition-colors cursor-pointer border border-[#DCD9D1]/20"
            aria-label="Next project"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* BEFORE → WORK IN PROGRESS → AFTER Selector Tabs */}
      <div className="bg-[#F2EFE9] p-2 sm:p-3 border-b border-[#DCD9D1] flex items-center justify-center gap-2 sm:gap-4">
        {[
          {
            key: 'before',
            label: isTelugu ? 'దశ 1: పనికి ముందు' : 'PHASE 01: BEFORE',
            badge: isTelugu ? 'సమస్య' : 'SUBSTRATE DEFECT'
          },
          {
            key: 'during',
            label: isTelugu ? 'దశ 2: పని జరుగుతున్నప్పుడు' : 'PHASE 02: IN PROGRESS',
            badge: isTelugu ? 'కెమికల్ ట్రీట్మెంట్' : 'CHEMICAL APPLICATION'
          },
          {
            key: 'after',
            label: isTelugu ? 'దశ 3: పని పూర్తయిన తర్వాత' : 'PHASE 03: AFTER',
            badge: isTelugu ? '100% రక్షణ' : 'TESTED BARRIER'
          }
        ].map((tab) => {
          const isActive = activeStage === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveStage(tab.key as any)}
              className={`flex-1 max-w-[260px] py-2.5 px-3 rounded-xs text-[10px] uppercase font-bold tracking-[0.16em] flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all cursor-pointer border ${
                isActive
                  ? 'bg-[#121212] text-[#F9F7F2] border-[#121212] shadow-xs'
                  : 'bg-[#F9F7F2] text-[#3D3B35] hover:bg-[#E8E4DB] border-[#DCD9D1]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[8px] font-semibold px-1.5 py-0.5 rounded-xs uppercase tracking-wider ${
                  isActive ? 'bg-[#F9F7F2] text-[#121212]' : 'bg-[#E8E4DB] text-[#8C8A82]'
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Stage Display Container */}
      <div className="p-5 sm:p-7 bg-[#F9F7F2]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Main Large Stage Viewer */}
          <div className="lg:col-span-8 relative rounded-xs overflow-hidden bg-[#121212] aspect-16/10 border border-[#DCD9D1] shadow-xs group">
            {currentActiveMedia.type === 'video' ? (
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                <video
                  ref={videoRef}
                  src={currentActiveMedia.url}
                  poster={currentActiveMedia.thumbnailUrl}
                  muted
                  playsInline
                  loop
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        if (isPlayingVideo) {
                          videoRef.current.pause();
                          setIsPlayingVideo(false);
                        } else {
                          videoRef.current.play();
                          setIsPlayingVideo(true);
                        }
                      }
                    }}
                    className="p-4 bg-[#F9F7F2] hover:bg-white text-[#121212] rounded-full shadow-lg transition-transform transform hover:scale-105 cursor-pointer"
                    aria-label="Play video"
                  >
                    {isPlayingVideo ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full overflow-hidden">
                <img
                  src={currentActiveMedia.url}
                  alt={currentActiveMedia.caption || currentProject.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter contrast-105"
                />
              </div>
            )}

            {/* Stage Indicator Badge */}
            <div className="absolute top-4 left-4 bg-[#121212]/90 backdrop-blur-xs text-[#F9F7F2] text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-xs border border-[#DCD9D1]/30 flex items-center gap-2">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  activeStage === 'before'
                    ? 'bg-amber-400'
                    : activeStage === 'during'
                    ? 'bg-blue-400'
                    : 'bg-emerald-400'
                }`}
              />
              <span>
                {isTelugu
                  ? (activeStage === 'before' ? 'ముందు దశ' : activeStage === 'during' ? 'పనిలో దశ' : 'పూర్తి దశ')
                  : `STAGE // ${activeStage}`}
              </span>
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={() =>
                setFullscreenMedia({
                  media: currentActiveMedia,
                  title: currentProject.name,
                  stage: activeStage
                })
              }
              className="absolute top-4 right-4 p-2 bg-[#121212]/90 backdrop-blur-xs hover:bg-white hover:text-[#121212] text-[#F9F7F2] rounded-xs border border-[#DCD9D1]/30 transition-colors shadow-xs cursor-pointer"
              title="View Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {/* Caption Overlay */}
            {currentActiveMedia.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-[#F9F7F2] text-xs">
                <p className="font-light tracking-wide">{currentActiveMedia.caption}</p>
              </div>
            )}
          </div>

          {/* Side Thumbnail Progression Comparison */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <div className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#8C8A82] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#121212]" />
              <span>{isTelugu ? 'మూడు దశల పని పురోగతి' : 'Three-Stage Progression'}</span>
            </div>

            {/* Before thumbnail */}
            <button
              onClick={() => setActiveStage('before')}
              className={`p-3 rounded-xs border text-left transition-all flex items-center gap-3 cursor-pointer ${
                activeStage === 'before'
                  ? 'bg-[#121212] text-[#F9F7F2] border-[#121212]'
                  : 'bg-[#FDFCF9] text-[#121212] border-[#DCD9D1] hover:border-[#121212]'
              }`}
            >
              <img
                src={currentProject.beforeMedia.url}
                alt="Before"
                referrerPolicy="no-referrer"
                className="w-16 h-12 object-cover rounded-xs flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider block ${
                    activeStage === 'before' ? 'text-[#DCD9D1]' : 'text-[#8C8A82]'
                  }`}
                >
                  {isTelugu ? 'దశ 1 // పనికి ముందు' : 'Phase 1 // Before'}
                </span>
                <p className="text-xs truncate font-medium mt-0.5">
                  {currentProject.beforeMedia.caption || (isTelugu ? 'నీటి లీకేజ్ సమస్య' : 'Initial leakage inspection')}
                </p>
              </div>
            </button>

            {/* During thumbnail */}
            <button
              onClick={() => setActiveStage('during')}
              className={`p-3 rounded-xs border text-left transition-all flex items-center gap-3 cursor-pointer ${
                activeStage === 'during'
                  ? 'bg-[#121212] text-[#F9F7F2] border-[#121212]'
                  : 'bg-[#FDFCF9] text-[#121212] border-[#DCD9D1] hover:border-[#121212]'
              }`}
            >
              <img
                src={currentProject.duringMedia.url}
                alt="During"
                referrerPolicy="no-referrer"
                className="w-16 h-12 object-cover rounded-xs flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider block ${
                    activeStage === 'during' ? 'text-[#DCD9D1]' : 'text-[#8C8A82]'
                  }`}
                >
                  {isTelugu ? 'దశ 2 // పని జరుగుతున్నప్పుడు' : 'Phase 2 // In Progress'}
                </span>
                <p className="text-xs truncate font-medium mt-0.5">
                  {currentProject.duringMedia.caption || (isTelugu ? 'కెమికల్ కోటింగ్ & గ్రౌటింగ్' : 'Grouting & mesh layer')}
                </p>
              </div>
            </button>

            {/* After thumbnail */}
            <button
              onClick={() => setActiveStage('after')}
              className={`p-3 rounded-xs border text-left transition-all flex items-center gap-3 cursor-pointer ${
                activeStage === 'after'
                  ? 'bg-[#121212] text-[#F9F7F2] border-[#121212]'
                  : 'bg-[#FDFCF9] text-[#121212] border-[#DCD9D1] hover:border-[#121212]'
              }`}
            >
              <img
                src={currentProject.afterMedia.url}
                alt="After"
                referrerPolicy="no-referrer"
                className="w-16 h-12 object-cover rounded-xs flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider block ${
                    activeStage === 'after' ? 'text-[#DCD9D1]' : 'text-[#8C8A82]'
                  }`}
                >
                  {isTelugu ? 'దశ 3 // పూర్తి ఫలితం' : 'Phase 3 // Completed'}
                </span>
                <p className="text-xs truncate font-medium mt-0.5">
                  {currentProject.afterMedia.caption || (isTelugu ? '100% లీక్ లేని రక్షణ' : '100% Tested barrier')}
                </p>
              </div>
            </button>

            <div className="mt-1 p-3 bg-[#F2EFE9] rounded-xs border border-[#DCD9D1] text-xs text-[#3D3B35]">
              <p className="line-clamp-2 font-light">{currentProject.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {fullscreenMedia && (
        <div className="fixed inset-0 z-50 bg-[#121212]/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8 animate-fadeIn">
          <div className="flex items-center justify-between text-[#F9F7F2] border-b border-[#DCD9D1]/20 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8C8A82]">
                STAGE // {fullscreenMedia.stage}
              </span>
              <h4 className="text-xl font-serif text-[#F9F7F2] mt-0.5">{fullscreenMedia.title}</h4>
            </div>
            <button
              onClick={() => setFullscreenMedia(null)}
              className="p-2 rounded-xs bg-[#242424] hover:bg-[#3D3B35] text-white border border-[#DCD9D1]/30 cursor-pointer"
              aria-label="Close fullscreen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-4">
            {fullscreenMedia.media.type === 'video' ? (
              <video
                src={fullscreenMedia.media.url}
                controls
                autoPlay
                className="max-h-[80vh] max-w-full rounded-xs border border-[#DCD9D1]/20 shadow-2xl"
              />
            ) : (
              <img
                src={fullscreenMedia.media.url}
                alt={fullscreenMedia.title}
                referrerPolicy="no-referrer"
                className="max-h-[80vh] max-w-full object-contain rounded-xs border border-[#DCD9D1]/20 shadow-2xl"
              />
            )}
          </div>

          {fullscreenMedia.media.caption && (
            <div className="text-center text-[#8C8A82] text-xs py-2 uppercase tracking-wider font-light">
              <p>{fullscreenMedia.media.caption}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
