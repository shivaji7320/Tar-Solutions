import React from 'react';
import { WebsiteContent } from '../types';
import { Language } from '../utils/translations';
import { Phone, MessageSquare, CalendarCheck } from 'lucide-react';

interface FloatingActionsProps {
  content?: WebsiteContent | null;
  language?: Language;
  phone?: string;
  whatsapp?: string;
  onBookClick?: () => void;
  onNavigate?: (page: string, serviceSlug?: string) => void;
}

export const FloatingActions: React.FC<FloatingActionsProps> = ({
  content,
  language = 'en',
  phone: propPhone,
  whatsapp: propWhatsapp,
  onBookClick,
  onNavigate
}) => {
  const isTelugu = language === 'te';
  const phone = propPhone || content?.business?.phone || '9949293872';
  const whatsapp = propWhatsapp || content?.business?.whatsapp || '9949293872';

  const handleBook = () => {
    if (onBookClick) {
      onBookClick();
    } else if (onNavigate) {
      onNavigate('book');
    }
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    // Ensuring direct link dispatch
    const url = `https://wa.me/91${whatsapp}?text=${encodeURIComponent(
      isTelugu
        ? 'నమస్తే TAR సివిల్ & వాటర్ప్రూఫింగ్ ఎక్స్‌పర్ట్స్, నాకు వాటర్ప్రూఫింగ్ సేవల గురించి సమాచారం కావాలి.'
        : 'Hello TAR Civil & Waterproofing Experts, I would like to inquire about your waterproofing services.'
    )}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* Desktop Floating Right Widgets */}
      <div className="fixed bottom-6 right-6 z-50 hidden sm:flex flex-col gap-3">
        {/* WhatsApp Float - Vibrant Green */}
        <button
          type="button"
          onClick={handleWhatsAppClick}
          className="relative group flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20ba5c] text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer border-2 border-white/40"
          aria-label="Chat on WhatsApp"
          title="Chat on WhatsApp (+91 9949293872)"
        >
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-80"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border border-white"></span>
          </span>
          <MessageSquare className="w-6 h-6 fill-current text-white" />
          <span className="absolute right-16 bg-[#121212] text-[#F9F7F2] text-[11px] font-bold tracking-wider px-3.5 py-2 rounded-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-[#DCD9D1]/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#25D366]"></span>
            {isTelugu ? 'వాట్సాప్‌లో సంప్రదించండి' : 'Chat on WhatsApp'} (+91 {whatsapp})
          </span>
        </button>

        {/* Direct Call Float */}
        <a
          href={`tel:${phone}`}
          className="group relative flex items-center justify-center w-14 h-14 bg-[#121212] hover:bg-[#2a2a2a] text-[#F9F7F2] rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-white/20"
          aria-label="Call TAR"
          title={`Call TAR Experts (${phone})`}
        >
          <Phone className="w-6 h-6" />
          <span className="absolute right-16 bg-[#121212] text-[#F9F7F2] text-[11px] font-bold tracking-wider px-3.5 py-2 rounded-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-[#DCD9D1]/30 flex items-center gap-1.5">
            <Phone className="w-3 h-3 text-emerald-400" />
            {isTelugu ? 'నేరుగా కాల్ చేయండి' : 'Call TAR Experts'} (+91 {phone})
          </span>
        </a>

        {/* Book Survey Floating Icon */}
        <button
          type="button"
          onClick={handleBook}
          className="group relative flex items-center justify-center w-14 h-14 bg-[#F9F7F2] hover:bg-white text-[#121212] rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-[#121212]/30 cursor-pointer"
          aria-label="Book Free Inspection"
          title="Book Free Site Survey"
        >
          <CalendarCheck className="w-6 h-6 text-[#121212]" />
          <span className="absolute right-16 bg-[#121212] text-[#F9F7F2] text-[11px] font-bold tracking-wider px-3.5 py-2 rounded-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-[#DCD9D1]/30">
            {isTelugu ? 'ఉచిత సైట్ సర్వే బుక్ చేయండి' : 'Book Free Site Inspection'}
          </span>
        </button>
      </div>

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#FDFCF9] border-t border-[#DCD9D1] p-2.5 sm:hidden flex items-center gap-2 shadow-2xl">
        <a
          href={`tel:${phone}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xs bg-[#F2EFE9] text-[#121212] font-bold text-[11px] uppercase tracking-wider border border-[#DCD9D1] active:scale-95 transition-transform"
        >
          <Phone className="w-4 h-4 text-[#121212]" />
          <span>{isTelugu ? 'కాల్' : 'Call'}</span>
        </a>

        <button
          type="button"
          onClick={handleWhatsAppClick}
          className="flex-1.2 flex items-center justify-center gap-1.5 py-3 rounded-xs bg-[#25D366] text-white font-bold text-[11px] uppercase tracking-wider shadow-md active:scale-95 transition-transform cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 fill-current" />
          <span>{isTelugu ? 'వాట్సాప్' : 'WhatsApp'}</span>
        </button>

        <button
          type="button"
          onClick={handleBook}
          className="flex-1.2 flex items-center justify-center gap-1.5 py-3 rounded-xs bg-[#121212] text-[#F9F7F2] font-bold text-[11px] uppercase tracking-wider border border-[#DCD9D1] cursor-pointer active:scale-95 transition-transform"
        >
          <CalendarCheck className="w-4 h-4" />
          <span>{isTelugu ? 'సర్వే' : 'Survey'}</span>
        </button>
      </div>
    </>
  );
};
