import React from 'react';
import { Service } from '../types';
import { Language } from '../utils/translations';
import { ArrowRight, CalendarCheck, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  language?: Language;
  onViewDetails: (slug: string) => void;
  onBookService: (service: Service) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  language = 'en',
  onViewDetails,
  onBookService
}) => {
  const isTelugu = language === 'te';
  const displayName = isTelugu && service.nameTelugu ? service.nameTelugu : service.name;
  const displayDesc = isTelugu && service.shortDescriptionTelugu ? service.shortDescriptionTelugu : service.shortDescription;
  
  // Specific two-point bullets from user specifications
  const bullets = isTelugu
    ? (service.bulletPointsTelugu && service.bulletPointsTelugu.length > 0 ? service.bulletPointsTelugu : [service.shortDescriptionTelugu || service.shortDescription])
    : (service.bulletPoints && service.bulletPoints.length > 0 ? service.bulletPoints : [service.shortDescription]);

  return (
    <div className="group bg-[#F9F7F2] rounded-xs border border-[#DCD9D1] hover:border-[#121212] transition-all duration-300 flex flex-col h-full overflow-hidden shadow-xs hover:shadow-md">
      {/* Card Image Slot with Editorial Numbering */}
      <div className="relative h-56 w-full overflow-hidden bg-[#E8E4DB] border-b border-[#DCD9D1]">
        <img
          src={service.image}
          alt={displayName}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter contrast-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/85 via-[#121212]/30 to-transparent" />

        {/* Service Number Tag (Editorial Volume/Issue style) */}
        <div className="absolute top-3 left-3 bg-[#121212] text-[#F9F7F2] text-[9px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 border border-[#DCD9D1]/30">
          <span>{isTelugu ? `సేవ NO. ${String(service.number).padStart(2, '0')}` : `NO. ${String(service.number).padStart(2, '0')}`}</span>
        </div>

        {/* Guaranteed / Certified Badge */}
        <div className="absolute top-3 right-3 bg-[#F9F7F2]/95 backdrop-blur-xs text-[#121212] text-[9px] font-semibold uppercase tracking-[0.15em] px-2.5 py-0.5 flex items-center gap-1 border border-[#DCD9D1]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#121212]" />
          <span>{isTelugu ? '100% నమ్మకమైన పరిష్కారం' : 'CERTIFIED WORK'}</span>
        </div>

        {/* Name overlay at base of image */}
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-[#F9F7F2] font-serif text-lg sm:text-xl font-normal leading-snug group-hover:underline transition-all">
            {displayName}
          </h3>
        </div>
      </div>

      {/* Content Slot */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4 bg-[#FDFCF9]">
        <div className="space-y-3">
          {/* Detailed 2-Point Bullet Explanation */}
          <div className="space-y-2">
            {bullets.slice(0, 2).map((pt, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-[#2A2926] leading-relaxed">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#121212] shrink-0 mt-0.5" />
                <span className="font-normal">{pt}</span>
              </div>
            ))}
          </div>

          {/* Quick highlight tags */}
          {((isTelugu && service.featuresTelugu) ? service.featuresTelugu : service.features) && (
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#DCD9D1]/50">
              {((isTelugu && service.featuresTelugu) ? service.featuresTelugu : service.features)?.slice(0, 2).map((feat, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-medium bg-[#F2EFE9] text-[#3D3B35] px-2 py-0.5 border border-[#DCD9D1]"
                >
                  {feat}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-[#DCD9D1] grid grid-cols-2 gap-2">
          {/* View Details */}
          <button
            onClick={() => onViewDetails(service.slug)}
            className="py-2.5 px-3 border border-[#DCD9D1] hover:border-[#121212] hover:bg-[#F2EFE9] text-[#121212] font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-1 transition-all cursor-pointer"
          >
            <span>{isTelugu ? 'పూర్తి వివరాలు' : 'Details'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          {/* Book Appointment CTA */}
          <button
            onClick={() => onBookService(service)}
            className="py-2.5 px-3 bg-[#121212] hover:bg-[#3D3B35] text-[#F9F7F2] font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>{isTelugu ? 'సర్వే బుకింగ్' : 'Book Survey'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
