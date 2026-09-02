import React, { useState } from 'react';
import { WebsiteContent, Service, Project, BookingFormField } from '../types';
import { ServiceCard } from '../components/ServiceCard';
import { GallerySlider } from '../components/GallerySlider';
import { Language, translations } from '../utils/translations';
import {
  Phone,
  MessageSquare,
  CalendarCheck,
  ShieldCheck,
  Droplets,
  CheckCircle2,
  HardHat,
  Layers,
  Clock,
  MapPin,
  ArrowRight,
  Send,
  Check,
  AlertCircle,
  Headphones,
  Share2,
  Copy,
  Printer
} from 'lucide-react';
import { BookingConfirmationModal } from '../components/BookingConfirmationModal';
import {
  BookingReceiptData,
  cleanIndianMobile,
  formatBookingReceiptText,
  getWhatsAppDispatchUrl,
  getSmsDispatchUrl
} from '../utils/receiptFormatter';

interface HomePageProps {
  content?: WebsiteContent | null;
  services?: Service[];
  projects?: Project[];
  formFields?: BookingFormField[];
  currentCustomer?: any;
  language?: Language;
  onNavigate: (page: string, serviceSlug?: string) => void;
  onBookService?: (service: Service) => void;
  onSubmitBooking: (bookingData: any) => Promise<{ success: boolean; bookingCode?: string; message?: string }>;
}

export const HomePage: React.FC<HomePageProps> = ({
  content,
  services = [],
  projects = [],
  formFields = [],
  currentCustomer,
  language = 'en',
  onNavigate,
  onBookService,
  onSubmitBooking
}) => {
  const isTelugu = language === 'te';
  const t = translations[language];

  const phone = content?.business?.phone || '9949293872';
  const whatsapp = content?.business?.whatsapp || '9949293872';
  const email = content?.business?.email || 'tarsolutions55@gmail.com';
  
  const heroHeading = isTelugu ? t.heroTitle : (content?.business?.heroHeading || t.heroTitle);
  const heroDescription = isTelugu ? t.heroSubtitle : (content?.business?.heroDescription || t.heroSubtitle);

  // Quick Home Booking Form State
  const [quickForm, setQuickForm] = useState({
    customerName: currentCustomer?.name || '',
    phone: currentCustomer?.mobile || '',
    whatsapp: currentCustomer?.mobile || '',
    email: currentCustomer?.email || '',
    location: '',
    service: (services && (isTelugu && services[0]?.nameTelugu ? services[0].nameTelugu : services[0]?.name)) || 'Terrace / Roof Waterproofing',
    workDate: '',
    preferredTime: isTelugu ? 'ఉదయం (9:00 AM - 12:00 PM)' : 'Morning (9:00 AM - 12:00 PM)',
    message: ''
  });

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<BookingReceiptData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const visibleServices = (services || []).filter((s) => !s?.isHidden).sort((a, b) => (a?.order || 0) - (b?.order || 0));

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = cleanIndianMobile(quickForm.phone);
    if (!quickForm.customerName.trim() || !cleanNum || cleanNum.length < 10 || !quickForm.location.trim()) {
      setBookingError(isTelugu ? 'దయచేసి పేరు, 10 అంకెల ఫోన్ నంబర్ మరియు లొకేషన్ వివరాలను నమోదు చేయండి.' : 'Please fill all required fields with a valid 10-digit Phone.');
      return;
    }
    setBookingError('');
    setBookingLoading(true);

    try {
      const payload = {
        ...quickForm,
        phone: cleanNum,
        whatsapp: cleanIndianMobile(quickForm.whatsapp || cleanNum),
        slotType: 'Book Free Survey',
        sourceSlot: 'Book Free Survey',
        bookingDate: new Date().toISOString().split('T')[0],
        bookingTime: new Date().toTimeString().split(' ')[0]
      };

      const res = await onSubmitBooking(payload);
      if (res.success && res.bookingCode) {
        const receipt: BookingReceiptData = {
          bookingCode: res.bookingCode,
          customerName: quickForm.customerName.trim(),
          phone: cleanNum,
          service: quickForm.service,
          location: quickForm.location.trim(),
          workDate: quickForm.workDate || new Date().toISOString().split('T')[0],
          preferredTime: quickForm.preferredTime,
          message: quickForm.message,
          status: 'Confirmed'
        };
        setBookingSuccess(receipt);
        setIsModalOpen(true);
        setQuickForm({
          customerName: '',
          phone: '',
          whatsapp: '',
          email: '',
          location: '',
          service: (services && (isTelugu && services[0]?.nameTelugu ? services[0].nameTelugu : services[0]?.name)) || 'Terrace / Roof Waterproofing',
          workDate: '',
          preferredTime: isTelugu ? 'ఉదయం (9:00 AM - 12:00 PM)' : 'Morning (9:00 AM - 12:00 PM)',
          message: ''
        });
      } else {
        setBookingError(res.message || (isTelugu ? 'ఏదో తప్పు జరిగింది. దయచేసి మళ్లీ ప్రయత్నించండి.' : 'Something went wrong. Please try again.'));
      }
    } catch (err) {
      setBookingError(isTelugu ? 'బుకింగ్ నమోదు కాలేదు. దయచేసి నేరుగా 9949293872 కు కాల్ చేయండి.' : 'Unable to submit booking. Please call 9949293872 directly.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCopyReceipt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2500);
  };

  const bentoItems = isTelugu ? [
    {
      id: 'wcu-1',
      title: 'ప్రొఫెషనల్ పనితనం',
      description: 'ఖచ్చితమైన సైట్ తనిఖీ, సమస్య మూల కారణాన్ని గుర్తించడం మరియు శాశ్వత పరిష్కారాల అమలు.',
      icon: 'ShieldCheck'
    },
    {
      id: 'wcu-2',
      title: 'ప్రత్యేక వాటర్ప్రూఫింగ్ పరిష్కారాలు',
      description: 'టెర్రస్, బాత్రూమ్, వాటర్ ట్యాంకులు మరియు బేస్‌మెంట్లకు సరిపోయే ఆధునిక ట్రీట్మెంట్స్.',
      icon: 'Droplets'
    },
    {
      id: 'wcu-3',
      title: 'ఉత్తమ నాణ్యమైన మెటీరియల్స్',
      description: 'ప్రమాణీకరించబడిన పాలిమర్స్, ఎలాస్టోమెరిక్ మెమ్బ్రేన్స్, PU రెసిన్స్ మరియు ఎపాక్సీ మెటీరియల్స్ వినియోగం.',
      icon: 'Layers'
    },
    {
      id: 'wcu-4',
      title: 'అనుభవజ్ఞులైన నిపుణులు',
      description: 'హై-ప్రెజర్ గ్రౌటింగ్ మరియు స్ట్రక్చరల్ రిపేర్లలో నైపుణ్యం కలిగిన సివిల్ టెక్నీషియన్లు.',
      icon: 'HardHat'
    },
    {
      id: 'wcu-5',
      title: 'నమ్మకమైన సేవ & వారంటీ',
      description: 'సమయపాలన, పారదర్శక ధరలు మరియు హైదరాబాద్ అంతటా దీర్ఘకాలిక సర్వీస్ వారంటీ.',
      icon: 'Clock'
    },
    {
      id: 'wcu-6',
      title: '24/7 కస్టమర్ సపోర్ట్',
      description: 'తక్షణ బుకింగ్ నిర్ధారణ, ఫోన్/వాట్సాప్ ద్వారా నేరుగా ఇంజనీర్ సలహాలు.',
      icon: 'Headphones'
    }
  ] : (content?.whyChooseUs || [
    {
      id: 'wcu-1',
      title: 'Professional Work',
      description: 'Systematic inspection, root-cause diagnosis, and standardized application protocols for long-lasting structural protection.',
      icon: 'ShieldCheck'
    },
    {
      id: 'wcu-2',
      title: 'Waterproofing Solutions',
      description: 'Customized waterproofing strategies tailored for terraces, bathrooms, external walls, water sumps, and basements.',
      icon: 'Droplets'
    },
    {
      id: 'wcu-3',
      title: 'Quality Materials',
      description: 'We utilize certified industrial-grade polymers, elastomeric membranes, PU resins, and epoxy compounds.',
      icon: 'Layers'
    },
    {
      id: 'wcu-4',
      title: 'Experienced Team',
      description: 'Skilled civil technicians and applicators trained in high-pressure grouting and complex structural repairs.',
      icon: 'HardHat'
    },
    {
      id: 'wcu-5',
      title: 'Reliable Service',
      description: 'Punctual site visits, clear timelines, zero hidden costs, and dedicated post-service customer assistance in Hyderabad.',
      icon: 'Clock'
    },
    {
      id: 'wcu-6',
      title: 'Customer Support',
      description: 'Quick booking confirmation, direct phone/WhatsApp assistance, and transparent progress updates throughout.',
      icon: 'Headphones'
    }
  ]);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-[#121212]" />;
      case 'Droplets':
        return <Droplets className="w-5 h-5 text-[#121212]" />;
      case 'Layers':
        return <Layers className="w-5 h-5 text-[#121212]" />;
      case 'HardHat':
        return <HardHat className="w-5 h-5 text-[#121212]" />;
      case 'Clock':
        return <Clock className="w-5 h-5 text-[#121212]" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-[#121212]" />;
    }
  };

  return (
    <div className="w-full bg-[#F9F7F2] text-[#121212] min-h-screen">
      {/* ====================================================
          1. HERO SECTION (Editorial Bilingual Layout)
          ==================================================== */}
      <section className="relative border-b border-[#DCD9D1] bg-[#F9F7F2] overflow-hidden py-12 lg:py-18">
        {/* Subtle architectural background */}
        <div className="absolute inset-0 bg-[radial-gradient(#121212_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {/* Top Editorial Ribbon / Meta */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-[#DCD9D1]">
            <div className="flex items-center gap-3">
              <span className="bg-[#121212] text-[#F9F7F2] text-[9px] uppercase tracking-[0.25em] font-bold px-2.5 py-1">
                {isTelugu ? 'సివిల్ & వాటర్ప్రూఫింగ్' : 'CIVIL REPAIR // 2026'}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C8A82]">
                HYDERABAD • TELANGANA
              </span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C8A82] hidden sm:block">
              {isTelugu ? '12 టాప్ సర్వీసులు // సర్టిఫైడ్ కెమికల్ వాటర్ప్రూఫింగ్' : 'ENGINEERED WATERPROOFING & PU GROUTING'}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="font-serif italic font-normal text-4xl sm:text-5xl text-[#121212]">
                    TAR
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#3D3B35] border-l border-[#DCD9D1] pl-3">
                    {isTelugu ? 'సివిల్ & వాటర్ప్రూఫింగ్ సొల్యూషన్స్' : 'SOLUTIONS // EST. HYDERABAD'}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-normal text-[#121212] tracking-tight leading-[1.12]">
                  {heroHeading}
                </h1>
              </div>

              <p className="text-sm sm:text-base text-[#3D3B35] leading-relaxed max-w-2xl font-light">
                {heroDescription}
              </p>

              {/* Trust Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-[#F2EFE9] border border-[#DCD9D1] p-3.5 rounded-xs flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xs bg-[#121212] text-[#F9F7F2] flex items-center justify-center flex-shrink-0">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.18em] text-[#8C8A82]">
                      {isTelugu ? 'గ్యారెంటీ' : 'ASSURANCE'}
                    </div>
                    <div className="text-xs font-bold text-[#121212]">
                      {isTelugu ? '100% లీక్ నివారణ' : '100% Leak Sealing'}
                    </div>
                  </div>
                </div>

                <div className="bg-[#F2EFE9] border border-[#DCD9D1] p-3.5 rounded-xs flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xs bg-[#121212] text-[#F9F7F2] flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.18em] text-[#8C8A82]">
                      {isTelugu ? 'నాణ్యత' : 'STANDARD'}
                    </div>
                    <div className="text-xs font-bold text-[#121212]">
                      {isTelugu ? 'సర్టిఫైడ్ కెమికల్స్' : 'Certified Chemicals'}
                    </div>
                  </div>
                </div>

                <div className="bg-[#F2EFE9] border border-[#DCD9D1] p-3.5 rounded-xs flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xs bg-[#121212] text-[#F9F7F2] flex items-center justify-center flex-shrink-0">
                    <HardHat className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.18em] text-[#8C8A82]">
                      {isTelugu ? 'అనుభవం' : 'EXPERIENCE'}
                    </div>
                    <div className="text-xs font-bold text-[#121212]">
                      {isTelugu ? '15+ ఏళ్ల అనుభవం' : 'Master Technicians'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero CTA Action Group */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#DCD9D1]">
                <button
                  onClick={() => onNavigate('book')}
                  className="px-6 py-3.5 rounded-xs bg-[#121212] hover:bg-[#3D3B35] text-[#F9F7F2] font-bold text-[11px] uppercase tracking-[0.2em] flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>{t.heroConsultBtn}</span>
                </button>

                <a
                  href={`tel:${phone}`}
                  className="px-5 py-3.5 rounded-xs bg-[#F2EFE9] hover:bg-[#E8E4DB] text-[#121212] font-bold text-[11px] uppercase tracking-[0.18em] border border-[#DCD9D1] flex items-center gap-2 transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#121212]" />
                  <span>{isTelugu ? `కాల్: ${phone}` : `Call // ${phone}`}</span>
                </a>

                <a
                  href={`https://wa.me/91${whatsapp}?text=Hello%20TAR%20Civil%20%26%20Waterproofing%20Experts%2C%20I%20need%20assistance.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3.5 rounded-xs bg-white hover:bg-[#121212] hover:text-[#F9F7F2] text-[#121212] font-bold text-[11px] uppercase tracking-[0.18em] border border-[#DCD9D1] flex items-center gap-2 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{isTelugu ? 'వాట్సాప్' : 'WhatsApp'}</span>
                </a>
              </div>
            </div>

            {/* Right Hero Quick Booking Card */}
            <div className="lg:col-span-5 bg-[#FDFCF9] text-[#121212] rounded-xs p-6 sm:p-7 border border-[#DCD9D1] relative shadow-lg">
              <div className="flex items-center justify-between pb-4 border-b border-[#DCD9D1] mb-5">
                <div>
                  <span className="text-[9px] uppercase tracking-[0.22em] text-[#8C8A82] font-semibold">
                    {isTelugu ? 'ఉచిత సైట్ తనిఖీ // రిజిస్ట్రేషన్' : 'REGISTRATION // NO COST SURVEY'}
                  </span>
                  <h3 className="text-xl font-serif font-normal text-[#121212]">
                    {isTelugu ? 'సైట్ సర్వే బుకింగ్' : 'Book Free Survey'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('enquiry')}
                  className="px-2.5 py-1 rounded-xs bg-[#121212] text-[#F9F7F2] text-[9px] uppercase tracking-[0.18em] font-bold hover:bg-[#3D3B35] transition-colors cursor-pointer"
                  title="Open dedicated enquiry form"
                >
                  {isTelugu ? 'ప్రత్యేక ఫారం' : 'Full Form →'}
                </button>
              </div>

              {bookingSuccess ? (
                <div className="bg-[#F2EFE9] border border-[#DCD9D1] rounded-xs p-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                    <Check className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {isTelugu ? 'సర్వే అభ్యర్థన నమోదైంది' : 'Survey Requested'}
                    </span>
                    <h4 className="text-lg font-serif text-[#121212] pt-1">
                      {isTelugu ? 'ధన్యవాదాలు! రసీదు సిద్ధంగా ఉంది' : 'Survey Confirmed! Receipt Ready'}
                    </h4>
                  </div>

                  <div className="p-3 bg-white rounded-xs border border-[#DCD9D1] text-xs text-left space-y-1.5 font-sans">
                    <div className="flex justify-between">
                      <span className="text-[#8C8A82]">{isTelugu ? 'ట్రాకింగ్ ఐడి:' : 'Tracking ID:'}</span>
                      <strong className="text-[#121212] font-mono">{bookingSuccess.bookingCode}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8C8A82]">{isTelugu ? 'మొబైల్:' : 'Mobile:'}</span>
                      <strong className="text-[#121212] font-mono">+91 {bookingSuccess.phone}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8C8A82]">{isTelugu ? 'సేవ:' : 'Service:'}</span>
                      <span className="font-medium text-[#121212] truncate max-w-[170px]">{bookingSuccess.service}</span>
                    </div>
                  </div>

                  {/* 1-Tap Mobile Copy Buttons */}
                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={getWhatsAppDispatchUrl(bookingSuccess.phone, formatBookingReceiptText(bookingSuccess, isTelugu))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 rounded-xs bg-[#25D366] hover:bg-[#20ba5c] text-white font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
                      >
                        <MessageSquare className="w-3.5 h-3.5 fill-current" />
                        <span>{isTelugu ? 'కస్టమర్ వాట్సాప్' : "WhatsApp"}</span>
                      </a>
                      <a
                        href={getSmsDispatchUrl(bookingSuccess.phone, formatBookingReceiptText(bookingSuccess, isTelugu))}
                        className="py-2.5 px-3 rounded-xs bg-[#121212] hover:bg-[#2a2a2a] text-white font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>{isTelugu ? 'SMS కాపీ' : 'Send SMS'}</span>
                      </a>
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleCopyReceipt(formatBookingReceiptText(bookingSuccess, isTelugu))}
                        className="text-[10px] font-bold text-[#121212] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedReceipt ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedReceipt ? (isTelugu ? 'కాపీ అయింది!' : 'Copied!') : (isTelugu ? 'రసీదు కాపీ చేయండి' : 'Copy Text')}</span>
                      </button>
                      <span className="text-gray-300">•</span>
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="text-[10px] font-bold text-slate-700 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Printer className="w-3 h-3" />
                        <span>{isTelugu ? 'స్లిప్ చూడండి' : 'Full Slip'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#DCD9D1]">
                    <button
                      onClick={() => setBookingSuccess(null)}
                      className="text-xs font-bold uppercase tracking-wider text-[#121212] hover:underline cursor-pointer"
                    >
                      {isTelugu ? 'మరొక సర్వే బుక్ చేయండి' : 'Schedule Another'}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleQuickSubmit} className="space-y-3.5">
                  {bookingError && (
                    <div className="p-3 rounded-xs bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{bookingError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.18em] font-semibold text-[#3D3B35] mb-1">
                      {isTelugu ? 'మీ పూర్తి పేరు *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isTelugu ? 'ఉదా: రమేష్ రెడ్డి' : 'e.g. Ramesh Reddy'}
                      value={quickForm.customerName}
                      onChange={(e) => setQuickForm({ ...quickForm, customerName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xs border border-[#DCD9D1] bg-[#F9F7F2] text-xs text-[#121212] focus:border-[#121212] focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.18em] font-semibold text-[#3D3B35] mb-1">
                        {isTelugu ? 'ఫోన్ నంబర్ *' : 'Phone *'}
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="9949293872"
                        value={quickForm.phone}
                        onChange={(e) => setQuickForm({ ...quickForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xs border border-[#DCD9D1] bg-[#F9F7F2] text-xs text-[#121212] focus:border-[#121212] focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.18em] font-semibold text-[#3D3B35] mb-1">
                        {isTelugu ? 'ప్రాంతం / లొకేషన్ *' : 'Location / Area *'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={isTelugu ? 'ఉదా: కొండాపూర్, జూబ్లీహిల్స్' : 'e.g. Jubilee Hills, Kondapur'}
                        value={quickForm.location}
                        onChange={(e) => setQuickForm({ ...quickForm, location: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xs border border-[#DCD9D1] bg-[#F9F7F2] text-xs text-[#121212] focus:border-[#121212] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.18em] font-semibold text-[#3D3B35] mb-1">
                      {isTelugu ? 'కావలసిన సేవ *' : 'Target Discipline / Service *'}
                    </label>
                    <select
                      value={quickForm.service}
                      onChange={(e) => setQuickForm({ ...quickForm, service: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xs border border-[#DCD9D1] bg-[#F9F7F2] text-xs text-[#121212] focus:border-[#121212] focus:outline-none transition-colors"
                    >
                      {visibleServices.map((s) => (
                        <option key={s.id} value={isTelugu && s.nameTelugu ? s.nameTelugu : s.name}>
                          {isTelugu ? `నెం. ${String(s.number).padStart(2, '0')} — ${s.nameTelugu || s.name}` : `NO. ${String(s.number).padStart(2, '0')} — ${s.name}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.18em] font-semibold text-[#3D3B35] mb-1">
                        {isTelugu ? 'తేదీ' : 'Date'}
                      </label>
                      <input
                        type="date"
                        value={quickForm.workDate}
                        onChange={(e) => setQuickForm({ ...quickForm, workDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xs border border-[#DCD9D1] bg-[#F9F7F2] text-xs text-[#121212] focus:border-[#121212] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.18em] font-semibold text-[#3D3B35] mb-1">
                        {isTelugu ? 'సమయం' : 'Time Window'}
                      </label>
                      <select
                        value={quickForm.preferredTime}
                        onChange={(e) => setQuickForm({ ...quickForm, preferredTime: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xs border border-[#DCD9D1] bg-[#F9F7F2] text-xs text-[#121212] focus:border-[#121212] focus:outline-none"
                      >
                        {isTelugu ? (
                          <>
                            <option>ఉదయం (09:00 - 12:00)</option>
                            <option>మధ్యాహ్నం (12:00 - 16:00)</option>
                            <option>సాయంత్రం (16:00 - 19:00)</option>
                            <option>తక్షణ సైట్ విజిట్</option>
                          </>
                        ) : (
                          <>
                            <option>Morning (09:00 - 12:00)</option>
                            <option>Afternoon (12:00 - 16:00)</option>
                            <option>Evening (16:00 - 19:00)</option>
                            <option>Urgent Dispatch</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="w-full mt-2 py-3 rounded-xs bg-[#121212] hover:bg-[#3D3B35] text-[#F9F7F2] font-bold text-[10px] uppercase tracking-[0.22em] flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-70 cursor-pointer"
                  >
                    {bookingLoading ? (
                      <span>{isTelugu ? 'నమోదు అవుతోంది...' : 'TRANSMITTING...'}</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>{isTelugu ? 'సర్వే అభ్యర్థన సమర్పించండి' : 'SUBMIT SURVEY REQUEST'}</span>
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-center text-[#8C8A82] uppercase tracking-wider">
                    {isTelugu ? 'ఉచిత సైట్ తనిఖీ • హైదరాబాద్ నగరవ్యాప్తంగా సేవలు' : 'Zero advance deposit required • Comprehensive Hyderabad coverage'}
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          2. ALL 12 SERVICES SECTION (Top 12 Services)
          ==================================================== */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-[#DCD9D1] gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#8C8A82] font-semibold">
              {t.servicesSectionSub}
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[#121212] tracking-tight">
              {t.servicesSectionTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#3D3B35] font-light leading-relaxed">
              {t.servicesSectionDesc}
            </p>
          </div>

          <button
            onClick={() => onNavigate('services')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xs border border-[#DCD9D1] hover:border-[#121212] bg-[#F2EFE9] text-[#121212] font-bold text-[10px] uppercase tracking-[0.2em] transition-all cursor-pointer self-start md:self-auto"
          >
            <span>{isTelugu ? 'అన్ని 12 సేవలు' : 'Full 12 Services'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 12 Individual Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {visibleServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              language={language}
              onViewDetails={(slug) => onNavigate('service-detail', slug)}
              onBookService={onBookService || ((svc) => onNavigate('book', svc.slug))}
            />
          ))}
        </div>
      </section>

      {/* ====================================================
          3. THREE-PHASE TRANSFORMATION GALLERY
          ==================================================== */}
      <section className="py-18 bg-[#121212] text-[#F9F7F2] border-y border-[#DCD9D1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-[#DCD9D1]/20 gap-4">
            <div className="space-y-2">
              <span className="text-[#8C8A82] text-[10px] uppercase tracking-[0.25em] font-semibold">
                {t.showcaseSub}
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[#F9F7F2]">
                {t.showcaseTitle}
              </h2>
            </div>
            <p className="text-xs text-[#8C8A82] max-w-md font-light">
              {t.showcaseDesc}
            </p>
          </div>

          <GallerySlider projects={projects} />
        </div>
      </section>

      {/* ====================================================
          4. WHY CHOOSE TAR SOLUTIONS SECTION (Bento Grid)
          ==================================================== */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-[#8C8A82] text-[10px] uppercase tracking-[0.25em] font-semibold">
            {t.bentoSub}
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[#121212] tracking-tight">
            {t.bentoTitle}
          </h2>
          <p className="text-xs sm:text-sm text-[#3D3B35] font-light">
            {t.bentoDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bentoItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#FDFCF9] rounded-xs p-6 border border-[#DCD9D1] hover:border-[#121212] transition-all group"
            >
              <div className="w-10 h-10 rounded-xs bg-[#F2EFE9] border border-[#DCD9D1] group-hover:bg-[#121212] group-hover:text-[#F9F7F2] flex items-center justify-center text-[#121212] transition-colors mb-4">
                {getIconComponent(item.icon)}
              </div>
              <h3 className="text-base font-serif font-normal text-[#121212] mb-2 group-hover:italic transition-all">
                {item.title}
              </h3>
              <p className="text-xs text-[#3D3B35] leading-relaxed font-light">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ====================================================
          5. ABOUT TAR SUMMARY BANNER
          ==================================================== */}
      <section className="py-16 bg-[#F2EFE9] border-t border-[#DCD9D1] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="text-[#8C8A82] text-[10px] uppercase tracking-[0.25em] font-semibold">
                {isTelugu ? 'కంపెనీ వివరాలు // హైదరాబాద్ హెచ్‌క్యూ' : 'COMPANY BACKGROUND // HYDERABAD HQ'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#121212]">
                TAR Civil &amp; Waterproofing Experts Solutions
              </h2>
              <p className="text-xs sm:text-sm text-[#3D3B35] leading-relaxed font-light">
                {isTelugu
                  ? 'మేము రెసిడెన్షియల్ అపార్ట్‌మెంట్‌లు, విల్లాలు, కమర్షియల్ కాంప్లెక్స్‌లు మరియు ఇండస్ట్రియల్ బిల్డింగ్‌లకు శాశ్వత లీకేజ్ నివారణ, స్ట్రక్చరల్ రెట్రోఫిట్టింగ్, హై-ప్రెజర్ ఇంజెక్షన్ గ్రౌటింగ్ మరియు హెవీ-డ్యూటీ వాటర్‌ప్రూఫింగ్ చేయడంలో నిపుణులం.'
                  : (content?.about?.aboutTAR || 'We specialize in permanent leak prevention, structural retrofitting, high-pressure injection grouting, and heavy-duty waterproofing for residential apartments, independent villas, commercial complexes, and industrial buildings.')}
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => onNavigate('about')}
                  className="px-5 py-2.5 rounded-xs bg-[#121212] text-[#F9F7F2] font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-[#3D3B35] transition-colors cursor-pointer"
                >
                  {isTelugu ? 'మా గురించి పూర్తి వివరాలు' : 'Full Corporate Profile'}
                </button>
                <a
                  href={`tel:${phone}`}
                  className="px-5 py-2.5 rounded-xs bg-[#F9F7F2] text-[#121212] font-bold text-[10px] uppercase tracking-[0.2em] border border-[#DCD9D1] hover:bg-[#E8E4DB] transition-colors flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{isTelugu ? `కాల్: +91 ${phone}` : `Call // +91 ${phone}`}</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-4 bg-[#FDFCF9] p-6 rounded-xs border border-[#DCD9D1] space-y-3">
              <div className="text-[9px] uppercase tracking-[0.25em] text-[#8C8A82] font-semibold flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#121212]" />
                {isTelugu ? 'హైదరాబాద్ సర్వీస్ ప్రాంతాలు' : 'TERRITORY & DISPATCH'}
              </div>
              <p className="text-xs text-[#3D3B35] leading-relaxed font-light">
                {isTelugu
                  ? 'గచ్చిబౌలి, జూబ్లీహిల్స్, బంజారా హిల్స్, కొండాపూర్, మాదాపూర్, కూకట్‌పల్లి, సికింద్రాబాద్, ఉప్పల్ తో సహా హైదరాబాద్ మరియు సికింద్రాబాద్ వ్యాప్తంగా తక్షణ సేవలందిస్తున్నాము.'
                  : 'Active site presence across all quadrants of Hyderabad and Secunderabad including Gachibowli, Jubilee Hills, Banjara Hills, Kondapur, Madhapur, Kukatpally, Secunderabad, and Uppal.'}
              </p>
              <div className="pt-3 border-t border-[#DCD9D1] text-[10px] uppercase tracking-wider text-[#8C8A82]">
                <span>{isTelugu ? 'పని వేళలు: సోమ – ఆది: 08:00 – 20:00 IST' : 'Operational Hours: Mon – Sun: 08:00 – 20:00 IST'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Mobile Forwarding & Receipt Modal */}
      <BookingConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        booking={bookingSuccess}
        isTelugu={isTelugu}
      />
    </div>
  );
};
