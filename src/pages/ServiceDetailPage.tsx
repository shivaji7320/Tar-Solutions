import React from 'react';
import { Service, Project, WebsiteContent } from '../types';
import { Language, translations } from '../utils/translations';
import {
  ArrowLeft,
  CalendarCheck,
  Phone,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Wrench,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';

interface ServiceDetailPageProps {
  service: Service;
  allServices?: Service[];
  projects?: Project[];
  content?: WebsiteContent | null;
  language?: Language;
  onBack: () => void;
  onNavigate: (page: string, serviceSlug?: string) => void;
  onBookService: (service: Service) => void;
}

export const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({
  service,
  allServices = [],
  projects = [],
  content,
  language = 'en',
  onBack,
  onNavigate,
  onBookService
}) => {
  const isTelugu = language === 'te';
  const t = translations[language];

  const phone = content?.business?.phone || '9949293872';
  const whatsapp = content?.business?.whatsapp || '9949293872';

  const displayName = isTelugu && service.nameTelugu ? service.nameTelugu : service.name;
  const displayShort = isTelugu && service.shortDescriptionTelugu ? service.shortDescriptionTelugu : service.shortDescription;
  const displayProblem = isTelugu && service.problemExplanationTelugu ? service.problemExplanationTelugu : service.problemExplanation;
  const displaySolution = isTelugu && service.solutionExplanationTelugu ? service.solutionExplanationTelugu : service.solutionExplanation;
  const displayProcess = (isTelugu && service.workProcessTelugu && service.workProcessTelugu.length > 0)
    ? service.workProcessTelugu
    : service.workProcess;
  const displayFeatures = (isTelugu && service.featuresTelugu && service.featuresTelugu.length > 0)
    ? service.featuresTelugu
    : (service.features || []);

  // Filter projects relevant to this service
  const relatedProjects = (projects || []).filter(
    (p) => p?.serviceId === service?.id || (p?.serviceName || '').toLowerCase().includes((service?.name || '').toLowerCase())
  );

  return (
    <div className="w-full bg-[#F9F7F2] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#3D3B35] hover:text-[#121212] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.detailBackToList}</span>
        </button>

        {/* Hero Service Banner */}
        <div className="bg-[#121212] text-[#F9F7F2] rounded-xs overflow-hidden border border-[#DCD9D1] grid grid-cols-1 lg:grid-cols-12 shadow-xl">
          <div className="lg:col-span-7 p-8 sm:p-12 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="bg-[#F9F7F2] text-[#121212] text-[10px] font-bold uppercase tracking-[0.25em] px-3 py-1 rounded-xs">
                  {isTelugu ? `సేవ NO. ${String(service.number).padStart(2, '0')}` : `DISCIPLINE NO. ${String(service.number).padStart(2, '0')}`}
                </span>
                <span className="text-[#8C8A82] text-[10px] uppercase tracking-[0.2em] font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#DCD9D1]" />
                  {isTelugu ? 'ధృవీకరించబడిన విధానం' : 'TAR CERTIFIED SPECIFICATION'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#F9F7F2] tracking-tight leading-snug">
                {displayName}
              </h1>

              <p className="text-sm sm:text-base text-[#DCD9D1] leading-relaxed font-light">
                {displayShort}
              </p>

              {/* Bullet highlights */}
              {displayFeatures.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {displayFeatures.map((feat, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-semibold bg-[#222] text-[#DCD9D1] px-2.5 py-1 rounded-xs border border-[#444]"
                    >
                      <CheckCircle2 className="w-3 h-3 text-[#F9F7F2]" />
                      {feat}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* CTA Bar */}
            <div className="pt-6 border-t border-[#DCD9D1]/20 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onBookService(service)}
                className="px-6 py-3.5 rounded-xs bg-[#F9F7F2] hover:bg-white text-[#121212] font-bold text-[10px] uppercase tracking-[0.22em] flex items-center gap-2 transition-all cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>{isTelugu ? 'ఈ సేవను బుక్ చేయండి' : 'Book On-Site Survey'}</span>
              </button>

              <a
                href={`tel:${phone}`}
                className="px-5 py-3.5 rounded-xs bg-[#222] hover:bg-[#333] text-[#F9F7F2] font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 transition-colors border border-[#444]"
              >
                <Phone className="w-3.5 h-3.5 text-[#DCD9D1]" />
                <span>{isTelugu ? `కాల్: ${phone}` : `Call // ${phone}`}</span>
              </a>

              <a
                href={`https://wa.me/91${whatsapp}?text=Hello%20TAR%20Experts%2C%20I%20need%20details%20for%20${encodeURIComponent(
                  displayName
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 rounded-xs bg-[#1A3A2A] hover:bg-[#23503A] text-[#F9F7F2] font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 transition-colors border border-[#2E6B4A]"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{isTelugu ? 'వాట్సాప్' : 'WhatsApp'}</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 relative h-72 lg:h-auto min-h-[340px] bg-[#222]">
            <img
              src={service.image}
              alt={displayName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover filter contrast-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#121212] via-transparent to-transparent opacity-80" />
          </div>
        </div>

        {/* 2-Column Problem & Solution Deep Dive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Problem Explanation */}
          <div className="bg-[#FDFCF9] rounded-xs p-8 border border-[#DCD9D1] space-y-4 shadow-xs">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-[#F2EFE9] border border-[#DCD9D1] text-[#121212] text-[10px] font-bold uppercase tracking-[0.2em]">
              <AlertTriangle className="w-3.5 h-3.5 text-[#121212]" />
              <span>{isTelugu ? 'సమస్య & మూల కారణం' : 'THE ROOT PROBLEM'}</span>
            </div>
            <h2 className="text-xl font-serif font-normal text-[#121212]">
              {isTelugu ? 'లీకేజీ మరియు తేమ ఎలా ఏర్పడుతుంది?' : 'Why Leaks & Deterioration Occur'}
            </h2>
            <p className="text-xs sm:text-sm text-[#3D3B35] leading-relaxed font-light">
              {displayProblem}
            </p>
          </div>

          {/* Solution Explanation */}
          <div className="bg-[#FDFCF9] rounded-xs p-8 border border-[#DCD9D1] space-y-4 shadow-xs">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-[#121212] text-[#F9F7F2] text-[10px] font-bold uppercase tracking-[0.2em]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F9F7F2]" />
              <span>{isTelugu ? 'TAR శాశ్వత పరిష్కారం' : 'THE TAR ENGINEERING SOLUTION'}</span>
            </div>
            <h2 className="text-xl font-serif font-normal text-[#121212]">
              {isTelugu ? 'మా ఇంజనీరింగ్ పద్ధతి ద్వారా నివారణ' : 'How We Solve It Permanently'}
            </h2>
            <p className="text-xs sm:text-sm text-[#3D3B35] leading-relaxed font-light">
              {displaySolution}
            </p>
          </div>
        </div>

        {/* Work Process Steps */}
        <div className="bg-[#FDFCF9] rounded-xs p-8 sm:p-10 border border-[#DCD9D1] shadow-xs space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-[#8C8A82] text-[10px] font-bold uppercase tracking-[0.25em]">
              {isTelugu ? 'పని చేసే దశలవారీ విధానం' : 'SYSTEMATIC PROTOCOL // 6 STAGES'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#121212]">
              {t.detailProcess}
            </h2>
            <p className="text-xs text-[#6E6B63] font-light">
              {isTelugu
                ? 'లీకేజ్ పునరావృతం కాకుండా ఉండటానికి మేము ఖచ్చితమైన ప్రామాణిక పద్ధతులను అనుసరిస్తాము.'
                : 'We execute strict standard operating protocols to guarantee permanent water tightness.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {displayProcess.map((step, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xs bg-[#F2EFE9] border border-[#DCD9D1] space-y-3 relative overflow-hidden group hover:border-[#121212] transition-colors"
              >
                <span className="absolute -top-2 -right-2 text-4xl font-mono font-bold text-[#DCD9D1]/40 select-none">
                  0{idx + 1}
                </span>
                <div className="w-7 h-7 rounded-xs bg-[#121212] text-[#F9F7F2] font-bold text-xs flex items-center justify-center relative z-10">
                  {idx + 1}
                </div>
                <p className="text-xs text-[#2A2926] font-normal leading-relaxed relative z-10">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Related Projects if available */}
        {relatedProjects.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xl font-serif font-normal text-[#121212]">
              {isTelugu ? 'సంబంధిత సైట్ వర్క్ పరిశీలన' : 'Demonstrated On-Site Executions'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-[#FDFCF9] rounded-xs border border-[#DCD9D1] overflow-hidden shadow-xs p-5 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#121212]">{proj.name}</span>
                    <span className="text-[11px] text-[#6E6B63] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#121212]" />
                      {proj.location}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div>
                      <img
                        src={proj.beforeMedia.url}
                        alt="Before"
                        referrerPolicy="no-referrer"
                        className="w-full h-20 object-cover rounded-xs mb-1"
                      />
                      <span className="font-bold text-[#3D3B35]">
                        {isTelugu ? 'ముందు' : 'Before'}
                      </span>
                    </div>
                    <div>
                      <img
                        src={proj.duringMedia.url}
                        alt="During"
                        referrerPolicy="no-referrer"
                        className="w-full h-20 object-cover rounded-xs mb-1"
                      />
                      <span className="font-bold text-[#3D3B35]">
                        {isTelugu ? 'పనిలో' : 'During'}
                      </span>
                    </div>
                    <div>
                      <img
                        src={proj.afterMedia.url}
                        alt="After"
                        referrerPolicy="no-referrer"
                        className="w-full h-20 object-cover rounded-xs mb-1"
                      />
                      <span className="font-bold text-[#121212]">
                        {isTelugu ? 'పూర్తి' : 'After'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#6E6B63] font-light">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other Services Navigation List */}
        <div className="bg-[#F2EFE9] rounded-xs p-8 border border-[#DCD9D1] space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#121212]">
            {isTelugu ? 'ఇతర 12 TAR వాటర్ప్రూఫింగ్ సేవలను చూడండి' : 'EXPLORE ALL 12 DISCIPLINE SPECIFICATIONS'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {allServices
              .filter((s) => s.id !== service.id && !s.isHidden)
              .map((s) => (
                <button
                  key={s.id}
                  onClick={() => onNavigate('service-detail', s.slug)}
                  className="px-3.5 py-2 rounded-xs bg-[#F9F7F2] hover:bg-[#121212] hover:text-[#F9F7F2] text-[#121212] text-xs font-semibold border border-[#DCD9D1] transition-colors cursor-pointer"
                >
                  #{s.number} {isTelugu && s.nameTelugu ? s.nameTelugu : s.name}
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
