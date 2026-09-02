import React from 'react';
import { WebsiteContent } from '../types';
import { Language, translations } from '../utils/translations';
import {
  ShieldCheck,
  Droplets,
  HardHat,
  Layers,
  Clock,
  CheckCircle2,
  Phone,
  MessageSquare,
  CalendarCheck,
  MapPin
} from 'lucide-react';

interface AboutPageProps {
  content: WebsiteContent;
  language?: Language;
  onNavigate: (page: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ content, language = 'en', onNavigate }) => {
  const isTelugu = language === 'te';
  const t = translations[language];
  const phone = content?.business?.phone || '9949293872';
  const whatsapp = content?.business?.whatsapp || '9949293872';
  const about = content?.about;

  return (
    <div className="w-full bg-[#F9F7F2] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Header Banner */}
        <div className="bg-[#121212] text-[#F9F7F2] rounded-xs p-8 sm:p-12 relative overflow-hidden border border-[#DCD9D1] shadow-xl">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-[#222] border border-[#444] px-3 py-1 rounded-xs text-[10px] font-bold uppercase tracking-[0.2em] text-[#DCD9D1]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F9F7F2]" />
              <span>{isTelugu ? 'TAR సివిల్ & వాటర్ప్రూఫింగ్ ఎక్స్‌పర్ట్స్ గురించి' : 'ABOUT TAR CIVIL & WATERPROOFING EXPERTS SOLUTIONS'}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-normal text-[#F9F7F2] tracking-tight">
              {isTelugu ? 'మా సంస్థ గురించి' : 'About TAR'}
            </h1>
            <p className="text-xs sm:text-sm text-[#8C8A82] leading-relaxed font-light">
              {isTelugu
                ? 'TAR Civil & Waterproofing Experts Solutions హైదరాబాద్ మరియు తెలంగాణ వ్యాప్తంగా అత్యున్నత ప్రమాణాలు గల సివిల్ రిపేర్లు మరియు వాటర్ప్రూఫింగ్ సేవలను అందించే విశ్వసనీయ సంస్థ.'
                : (about?.companyIntro ||
                  'TAR Civil & Waterproofing Experts Solutions is a premier civil and waterproofing service provider headquartered in Hyderabad, Telangana.')}
            </p>
          </div>
        </div>

        {/* Core Pillars Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* About TAR Story */}
          <div className="bg-[#FDFCF9] rounded-xs p-8 border border-[#DCD9D1] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xs bg-[#121212] text-[#F9F7F2] flex items-center justify-center mb-2">
              <Droplets className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-serif font-normal text-[#121212]">
              {isTelugu ? 'సంస్థ నేపథ్యం & అనుభవం' : 'Company Introduction'}
            </h2>
            <p className="text-xs sm:text-sm text-[#3D3B35] leading-relaxed font-light">
              {isTelugu
                ? 'గత 15 సంవత్సరాలకు పైగా హైదరాబాద్‌లో వేలాది గృహాలు, అపార్ట్‌మెంట్‌లు మరియు వాణిజ్య సముదాయాలకు శాశ్వత లీకేజ్ నివారణ పనులను విజయవంతంగా పూర్తి చేశాము.'
                : about?.aboutTAR}
            </p>
          </div>

          {/* Waterproofing Expertise */}
          <div className="bg-[#FDFCF9] rounded-xs p-8 border border-[#DCD9D1] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xs bg-[#121212] text-[#F9F7F2] flex items-center justify-center mb-2">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-serif font-normal text-[#121212]">
              {isTelugu ? 'వాటర్ప్రూఫింగ్ ప్రత్యేక నైపుణ్యం' : 'Waterproofing Expertise'}
            </h2>
            <p className="text-xs sm:text-sm text-[#3D3B35] leading-relaxed font-light">
              {isTelugu
                ? 'టెర్రస్, బాత్‌రూమ్‌లు, బేస్‌మెంట్‌లు, వాటర్ ట్యాంకులు మరియు ఎక్స్‌టర్నల్ వాల్స్‌కు ఆధునిక ఎలాస్టోమెరిక్ మరియు పాలిమర్ ఆధారిత కెమికల్ ట్రీట్మెంట్స్.'
                : about?.waterproofingExpertise}
            </p>
          </div>

          {/* Civil Works & Structural Repairs */}
          <div className="bg-[#FDFCF9] rounded-xs p-8 border border-[#DCD9D1] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xs bg-[#121212] text-[#F9F7F2] flex items-center justify-center mb-2">
              <HardHat className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-serif font-normal text-[#121212]">
              {isTelugu ? 'సివిల్ పనులు & స్ట్రక్చరల్ రిపేర్లు' : 'Civil Works & Structural Repairs'}
            </h2>
            <p className="text-xs sm:text-sm text-[#3D3B35] leading-relaxed font-light">
              {isTelugu
                ? 'భవనం బలాన్ని పునరుద్ధరించేందుకు మైక్రో-కాంక్రీటింగ్, రీబార్ రస్ట్ కన్వర్షన్, మరియు క్రాక్ ఇంజెక్షన్ గ్రౌటింగ్.'
                : about?.civilWorks}
            </p>
          </div>

          {/* Quality Assurance & Customer Service */}
          <div className="bg-[#FDFCF9] rounded-xs p-8 border border-[#DCD9D1] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xs bg-[#121212] text-[#F9F7F2] flex items-center justify-center mb-2">
              <Layers className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-serif font-normal text-[#121212]">
              {isTelugu ? 'నాణ్యత హామీ & కస్టమర్ సపోర్ట్' : 'Quality Assurance & Support'}
            </h2>
            <p className="text-xs sm:text-sm text-[#3D3B35] leading-relaxed font-light">
              {isTelugu
                ? 'ప్రతి ప్రాజెక్టును అత్యున్నత నాణ్యతతో, పారదర్శకమైన కోట్స్ మరియు వర్క్ వారంటీతో నిర్వహిస్తాము.'
                : (about?.qualityAssurance || about?.customerService)}
            </p>
          </div>
        </div>

        {/* Bottom CTA Card */}
        <div className="bg-[#121212] text-[#F9F7F2] rounded-xs p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 border border-[#DCD9D1]">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-serif font-normal text-[#F9F7F2]">
              {isTelugu ? 'హైదరాబాద్‌లో ఉచిత సైట్ తనిఖీ కావాలా?' : 'Need a Waterproofing Inspection in Hyderabad?'}
            </h3>
            <p className="text-xs sm:text-sm text-[#8C8A82] font-light">
              {isTelugu
                ? 'నేరుగా మా సివిల్ ఇంజనీర్‌తో మాట్లాడండి లేదా ఉచిత సైట్ సర్వే బుక్ చేయండి.'
                : 'Contact our engineering team directly for site assessment and transparent recommendations.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('book')}
              className="px-6 py-3 rounded-xs bg-[#F9F7F2] text-[#121212] font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-white transition-colors cursor-pointer"
            >
              {isTelugu ? 'సర్వే బుక్ చేయండి' : 'Book Site Visit'}
            </button>
            <a
              href={`tel:${phone}`}
              className="px-5 py-3 rounded-xs bg-[#222] text-[#F9F7F2] font-bold text-[10px] uppercase tracking-[0.2em] border border-[#444] flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>+91 {phone}</span>
            </a>
            <a
              href={`https://wa.me/91${whatsapp}?text=Hello%20TAR%20Civil%20%26%20Waterproofing%20Experts`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xs bg-[#1A3A2A] hover:bg-[#23503A] text-[#F9F7F2] font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-1.5 transition-colors border border-[#2E6B4A]"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{isTelugu ? 'వాట్సాప్' : 'WhatsApp'}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
