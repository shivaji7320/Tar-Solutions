import React, { useState } from 'react';
import { Service } from '../types';
import { ServiceCard } from '../components/ServiceCard';
import { Language, translations } from '../utils/translations';
import { Search, Droplets, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface ServicesPageProps {
  services?: Service[];
  language?: Language;
  onViewDetails: (slug: string) => void;
  onBookService: (service: Service) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({
  services = [],
  language = 'en',
  onViewDetails,
  onBookService
}) => {
  const isTelugu = language === 'te';
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');

  const visibleServices = (services || [])
    .filter((s) => !s?.isHidden)
    .sort((a, b) => (a?.order || 0) - (b?.order || 0))
    .filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        (s?.name || '').toLowerCase().includes(q) ||
        (s?.nameTelugu || '').toLowerCase().includes(q) ||
        (s?.shortDescription || '').toLowerCase().includes(q) ||
        (s?.shortDescriptionTelugu || '').toLowerCase().includes(q) ||
        (s?.problemExplanation || '').toLowerCase().includes(q) ||
        (s?.problemExplanationTelugu || '').toLowerCase().includes(q)
      );
    });

  return (
    <div className="w-full bg-[#F9F7F2] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Banner Header */}
        <div className="bg-[#121212] text-[#F9F7F2] rounded-xs p-8 sm:p-12 relative overflow-hidden border border-[#DCD9D1]">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-[#222] border border-[#444] px-3 py-1 rounded-xs text-[10px] font-bold uppercase tracking-[0.2em] text-[#DCD9D1]">
              <Droplets className="w-3.5 h-3.5 text-[#F9F7F2]" />
              <span>{isTelugu ? 'TAR సివిల్ & వాటర్ప్రూఫింగ్ సేవలు' : 'SPECIALIZED WATERPROOFING & CIVIL SOLUTIONS'}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-normal text-[#F9F7F2] tracking-tight">
              {t.servicesSectionTitle}
            </h1>
            <p className="text-xs sm:text-sm text-[#8C8A82] leading-relaxed font-light">
              {t.servicesSectionDesc}
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-[#FDFCF9] p-4 rounded-xs border border-[#DCD9D1] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-[#8C8A82] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.servicesSearchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xs border border-[#DCD9D1] bg-[#F9F7F2] text-xs text-[#121212] focus:border-[#121212] focus:outline-none"
            />
          </div>

          <div className="text-xs text-[#6E6B63] font-medium">
            {isTelugu ? (
              <>
                మొత్తం <strong className="text-[#121212]">{visibleServices.length}</strong> /{' '}
                {services.filter((s) => !s.isHidden).length} సేవలు అందుబాటులో ఉన్నాయి
              </>
            ) : (
              <>
                Showing <strong className="text-[#121212]">{visibleServices.length}</strong> of{' '}
                {services.filter((s) => !s.isHidden).length} Disciplines
              </>
            )}
          </div>
        </div>

        {/* Services Grid */}
        {visibleServices.length === 0 ? (
          <div className="bg-[#FDFCF9] rounded-xs p-12 text-center border border-[#DCD9D1] space-y-3">
            <ShieldAlert className="w-8 h-8 text-[#8C8A82] mx-auto" />
            <p className="text-sm font-bold text-[#121212]">
              {isTelugu ? `"${searchQuery}" కు సరిపోయే సేవలు కనుగొనబడలేదు` : `No services found matching "${searchQuery}"`}
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-[#121212] underline cursor-pointer"
            >
              {isTelugu ? 'శోధనను క్లియర్ చేయండి' : 'Clear Search Query'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visibleServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                language={language}
                onViewDetails={onViewDetails}
                onBookService={onBookService}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
