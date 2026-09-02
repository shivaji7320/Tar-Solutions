import React from 'react';
import { TarLogo } from './TarLogo';
import { WebsiteContent, Service } from '../types';
import { Language, translations } from '../utils/translations';
import {
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  CalendarCheck,
  Shield,
  Languages
} from 'lucide-react';

interface FooterProps {
  content?: WebsiteContent | null;
  services?: Service[];
  language?: Language;
  onToggleLanguage?: (lang: Language) => void;
  onNavigate: (page: string, serviceSlug?: string) => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  content,
  services = [],
  language = 'en',
  onToggleLanguage,
  onNavigate,
  onOpenAdmin
}) => {
  const isTelugu = language === 'te';
  const t = translations[language];
  const phone = content?.business?.phone || '9949293872';
  const whatsapp = content?.business?.whatsapp || '9949293872';
  const email = content?.business?.email || 'tarsolutions55@gmail.com';
  const address = content?.business?.address || 'Hyderabad, Telangana, India';

  // First 6 popular services for footer quick navigation
  const visibleServices = (services || []).filter((s) => !s?.isHidden).slice(0, 6);

  return (
    <footer className="bg-[#121212] text-[#F9F7F2] border-t border-[#DCD9D1] relative overflow-hidden">
      {/* Top fine architectural line */}
      <div className="h-px w-full bg-[#DCD9D1]/20" />

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Company Branding & Summary */}
          <div className="space-y-4">
            <button
              onClick={() => onNavigate('home')}
              className="text-left focus:outline-none cursor-pointer"
            >
              <TarLogo variant="white" />
            </button>
            <p className="text-xs text-[#8C8A82] leading-relaxed font-light">
              {isTelugu
                ? 'TAR సివిల్ & వాటర్ప్రూఫింగ్ ఎక్స్‌పర్ట్స్ సొల్యూషన్స్ హైదరాబాద్ నగరంలో గృహ, వాణిజ్య మరియు పారిశ్రామిక భవనాలకు శాశ్వత వాటర్ప్రూఫింగ్ మరియు నిర్మాణ మరమ్మతుల సేవలందించే ప్రముఖ సంస్థ.'
                : (content?.footer?.aboutText ||
                  'TAR Civil & Waterproofing Experts Solutions is Hyderabad’s trusted specialist for residential and commercial terrace, bathroom, PU injection grouting, and civil structural leak prevention.')}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <a
                href={`https://wa.me/91${whatsapp}?text=Hello%20TAR%20Experts`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xs bg-[#F9F7F2] hover:bg-white text-[#121212] font-bold text-[10px] uppercase tracking-[0.2em] transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{isTelugu ? 'వాట్సాప్' : 'WhatsApp'} // {whatsapp}</span>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#8C8A82] mb-4 font-semibold">
              {isTelugu ? 'ముఖ్యమైన లింకులు' : 'INDEX // NAVIGATION'}
            </div>
            <ul className="space-y-2.5 text-xs">
              {[
                { id: 'home', label: t.navHome },
                { id: 'services', label: t.navServices },
                { id: 'enquiry', label: isTelugu ? 'కస్టమర్ విచారణ ఫారం' : 'Customer Enquiry Form' },
                { id: 'projects', label: t.navProjects },
                { id: 'about', label: t.navAbout },
                { id: 'contact', label: t.navContact },
                { id: 'book', label: t.navBookSurvey },
                { id: 'customer-login', label: t.navPortal }
              ].map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className="hover:text-white transition-colors flex items-center gap-2 text-[#8C8A82] hover:translate-x-1 duration-150 cursor-pointer text-xs"
                  >
                    <span className="text-[9px] opacity-40">→</span>
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Featured Waterproofing Services */}
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#8C8A82] mb-4 font-semibold">
              {isTelugu ? 'టాప్ సేవలు // DISCIPLINES' : 'EXPERTISE // DISCIPLINES'}
            </div>
            <ul className="space-y-2 text-xs">
              {visibleServices.map((svc) => (
                <li key={svc.id}>
                  <button
                    onClick={() => onNavigate('service-detail', svc.slug)}
                    className="hover:text-white transition-colors text-[#8C8A82] flex items-center gap-2 text-left truncate max-w-full cursor-pointer"
                  >
                    <span className="text-[9px] font-mono text-[#DCD9D1]/50">NO.{String(svc.number).padStart(2, '0')}</span>
                    <span className="truncate">{isTelugu && svc.nameTelugu ? svc.nameTelugu : svc.name}</span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="text-[#DCD9D1] hover:text-white font-bold text-[10px] uppercase tracking-[0.2em] mt-3 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{isTelugu ? 'మొత్తం 12 సేవలు చూడండి' : 'Complete 12 Services Catalog'}</span> &rarr;
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Information */}
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#8C8A82] mb-4 font-semibold">
              {isTelugu ? 'డిస్పాచ్ & సంప్రదింపులు' : 'DISPATCH // HYDERABAD'}
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#8C8A82] flex-shrink-0 mt-0.5" />
                <span className="text-[#8C8A82]">{address}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#8C8A82] flex-shrink-0" />
                <a
                  href={`tel:${phone}`}
                  className="text-[#F9F7F2] hover:text-white font-medium"
                >
                  +91 {phone}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-[#8C8A82] flex-shrink-0" />
                <a
                  href={`https://wa.me/91${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8C8A82] hover:text-white"
                >
                  +91 {whatsapp} (WhatsApp)
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#8C8A82] flex-shrink-0" />
                <a
                  href={`mailto:${email}`}
                  className="text-[#8C8A82] hover:text-white break-all lowercase"
                >
                  {email}
                </a>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('book')}
                  className="w-full py-2.5 rounded-xs bg-[#F9F7F2] hover:bg-white text-[#121212] font-bold text-[10px] uppercase tracking-[0.22em] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>{t.navBookSurvey}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#DCD9D1]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] uppercase tracking-[0.2em] text-[#8C8A82]">
          <p>
            {content?.footer?.copyrightText ||
              '© 2026 TAR Civil & Waterproofing Experts Solutions. All rights reserved.'}
          </p>

          {/* Language Switcher in Footer */}
          {onToggleLanguage && (
            <div className="flex items-center gap-2 bg-[#222] px-3 py-1 rounded-xs border border-[#333]">
              <Languages className="w-3 h-3 text-[#8C8A82]" />
              <button
                onClick={() => onToggleLanguage('en')}
                className={`cursor-pointer ${language === 'en' ? 'text-white font-bold underline' : 'text-[#8C8A82] hover:text-white'}`}
              >
                English
              </button>
              <span className="opacity-40">|</span>
              <button
                onClick={() => onToggleLanguage('te')}
                className={`cursor-pointer ${language === 'te' ? 'text-white font-bold underline' : 'text-[#8C8A82] hover:text-white'}`}
              >
                తెలుగు
              </button>
            </div>
          )}

          <div className="flex items-center gap-4">
            <span>HYDERABAD // TELANGANA</span>
            <span className="opacity-30">•</span>
            <button
              onClick={onOpenAdmin}
              className="text-[#8C8A82] hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Shield className="w-3 h-3" />
              <span>{t.navAdmin}</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
