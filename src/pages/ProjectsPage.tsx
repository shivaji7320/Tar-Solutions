import React, { useState } from 'react';
import { Project, Service } from '../types';
import { GallerySlider } from '../components/GallerySlider';
import { Language, translations } from '../utils/translations';
import { MapPin, Calendar, Layers, Search, Filter } from 'lucide-react';

interface ProjectsPageProps {
  projects?: Project[];
  services?: Service[];
  language?: Language;
  onNavigate: (page: string, serviceSlug?: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  projects = [],
  services = [],
  language = 'en',
  onNavigate
}) => {
  const isTelugu = language === 'te';
  const t = translations[language];

  const [selectedServiceFilter, setSelectedServiceFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = (projects || []).filter((p) => {
    const matchesService =
      selectedServiceFilter === 'ALL' ||
      p?.serviceName === selectedServiceFilter ||
      p?.serviceId === selectedServiceFilter;
    const matchesSearch =
      (p?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p?.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p?.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesService && matchesSearch;
  });

  return (
    <div className="w-full bg-[#F9F7F2] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Banner Header */}
        <div className="bg-[#121212] text-[#F9F7F2] rounded-xs p-8 sm:p-12 relative overflow-hidden border border-[#DCD9D1] shadow-xl">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-[#222] border border-[#444] px-3 py-1 rounded-xs text-[10px] font-bold uppercase tracking-[0.2em] text-[#DCD9D1]">
              <Layers className="w-3.5 h-3.5 text-[#F9F7F2]" />
              <span>{isTelugu ? 'ప్రాజెక్టులు & వర్క్ గ్యాలరీ' : 'FIELD WORK PORTFOLIO & TRANSFORMATION ARCHIVE'}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-normal text-[#F9F7F2] tracking-tight">
              {isTelugu ? 'ప్రాజెక్టులు & గ్యాలరీ' : 'Projects & Transformation Gallery'}
            </h1>
            <p className="text-xs sm:text-sm text-[#8C8A82] leading-relaxed font-light">
              {isTelugu
                ? 'హైదరాబాద్ వ్యాప్తంగా అపార్ట్‌మెంట్‌లు, విల్లాలు మరియు కమర్షియల్ బిల్డింగులలో చేసిన నిజమైన పనుల ఫోటోలు మరియు వీడియోల రికార్డు.'
                : 'Explore before, during, and after documentation from real residential apartments, commercial buildings, and industrial sites across Hyderabad.'}
            </p>
          </div>
        </div>

        {/* Featured Transformation Slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-normal text-[#121212]">
              {t.showcaseTitle}
            </h2>
            <span className="text-xs text-[#8C8A82]">{isTelugu ? 'ఆగడానికి కర్సర్ ఉంచండి' : 'Hover or tap to freeze'}</span>
          </div>
          <GallerySlider projects={projects} language={language} />
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-[#FDFCF9] p-4 rounded-xs border border-[#DCD9D1] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#8C8A82] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isTelugu ? 'ప్రాజెక్ట్ లేదా ప్రాంతం పేరుతో శోధించండి...' : 'Search by project, area, or keyword...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xs border border-[#DCD9D1] bg-[#F9F7F2] text-xs text-[#121212] focus:border-[#121212] focus:outline-none"
            />
          </div>

          {/* Service Pill Filter */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedServiceFilter('ALL')}
              className={`px-3 py-1.5 rounded-xs text-xs font-bold whitespace-nowrap transition-colors cursor-pointer border ${
                selectedServiceFilter === 'ALL'
                  ? 'bg-[#121212] text-[#F9F7F2] border-[#121212]'
                  : 'bg-[#F2EFE9] text-[#121212] border-[#DCD9D1] hover:bg-[#E8E4DB]'
              }`}
            >
              {isTelugu ? 'అన్ని ప్రాజెక్టులు' : 'All Projects'}
            </button>
            {services.map((svc) => (
              <button
                key={svc.id}
                onClick={() => setSelectedServiceFilter(svc.name)}
                className={`px-3 py-1.5 rounded-xs text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                  selectedServiceFilter === svc.name
                    ? 'bg-[#121212] text-[#F9F7F2] border-[#121212]'
                    : 'bg-[#F2EFE9] text-[#121212] border-[#DCD9D1] hover:bg-[#E8E4DB]'
                }`}
              >
                {isTelugu && svc.nameTelugu ? svc.nameTelugu : svc.name}
              </button>
            ))}
          </div>
        </div>

        {/* All Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-[#FDFCF9] rounded-xs border border-[#DCD9D1] overflow-hidden shadow-xs hover:border-[#121212] transition-all p-6 space-y-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="bg-[#F2EFE9] text-[#121212] text-[10px] font-bold px-2.5 py-0.5 rounded-xs uppercase border border-[#DCD9D1]">
                    {project.serviceName}
                  </span>
                  <h3 className="text-lg font-serif font-normal text-[#121212] mt-1">
                    {project.name}
                  </h3>
                </div>
                <div className="text-right text-[11px] text-[#8C8A82] space-y-0.5">
                  <div className="flex items-center gap-1 text-[#121212] font-semibold justify-end">
                    <MapPin className="w-3 h-3 text-[#121212]" />
                    <span>{project.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#8C8A82] justify-end">
                    <Calendar className="w-3 h-3 text-[#8C8A82]" />
                    <span>{project.date}</span>
                  </div>
                </div>
              </div>

              {/* 3 Step Comparison Images */}
              <div className="grid grid-cols-3 gap-3">
                {/* Before */}
                <div className="space-y-1">
                  <div className="relative aspect-4/3 rounded-xs overflow-hidden bg-[#222]">
                    <img
                      src={project.beforeMedia.url}
                      alt="Before"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1.5 left-1.5 bg-[#121212]/90 backdrop-blur-xs text-[#F9F7F2] text-[9px] font-bold px-1.5 py-0.5 rounded-xs">
                      {isTelugu ? 'ముందు' : 'BEFORE'}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#6E6B63] truncate" title={project.beforeMedia.caption}>
                    {project.beforeMedia.caption || (isTelugu ? 'సమస్య' : 'Damage')}
                  </p>
                </div>

                {/* During */}
                <div className="space-y-1">
                  <div className="relative aspect-4/3 rounded-xs overflow-hidden bg-[#222]">
                    <img
                      src={project.duringMedia.url}
                      alt="During"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1.5 left-1.5 bg-[#121212]/90 backdrop-blur-xs text-[#F9F7F2] text-[9px] font-bold px-1.5 py-0.5 rounded-xs">
                      {isTelugu ? 'పనిలో' : 'DURING'}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#6E6B63] truncate" title={project.duringMedia.caption}>
                    {project.duringMedia.caption || (isTelugu ? 'ట్రీట్మెంట్' : 'Process')}
                  </p>
                </div>

                {/* After */}
                <div className="space-y-1">
                  <div className="relative aspect-4/3 rounded-xs overflow-hidden bg-[#222]">
                    <img
                      src={project.afterMedia.url}
                      alt="After"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1.5 left-1.5 bg-[#121212]/90 backdrop-blur-xs text-[#F9F7F2] text-[9px] font-bold px-1.5 py-0.5 rounded-xs">
                      {isTelugu ? 'పూర్తి' : 'AFTER'}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#6E6B63] truncate" title={project.afterMedia.caption}>
                    {project.afterMedia.caption || (isTelugu ? '100% రక్షణ' : '100% Sealed')}
                  </p>
                </div>
              </div>

              <p className="text-xs text-[#3D3B35] leading-relaxed font-light">
                {project.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
