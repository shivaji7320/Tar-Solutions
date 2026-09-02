import React, { useState } from 'react';
import { WebsiteContent, Service, CustomerUser } from '../types';
import { Language, translations } from '../utils/translations';
import {
  User,
  Phone,
  Layers,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageSquare,
  ShieldCheck,
  CalendarCheck,
  Building2,
  ArrowLeft,
  Sparkles,
  PhoneCall,
  Share2,
  Copy,
  Check,
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

interface CustomerEnquiryPageProps {
  content?: WebsiteContent | null;
  services?: Service[];
  currentCustomer?: CustomerUser | null;
  language?: Language;
  initialService?: string;
  onNavigate: (page: string, serviceSlug?: string) => void;
  onSubmitBooking: (bookingData: any) => Promise<{ success: boolean; bookingCode?: string; message?: string }>;
}

export const CustomerEnquiryPage: React.FC<CustomerEnquiryPageProps> = ({
  content,
  services = [],
  currentCustomer,
  language = 'en',
  initialService,
  onNavigate,
  onSubmitBooking
}) => {
  const isTelugu = language === 'te';
  const t = translations[language];

  const phone = content?.business?.phone || '9949293872';
  const whatsapp = content?.business?.whatsapp || '9949293872';

  const visibleServices = (services || [])
    .filter((s) => !s?.isHidden)
    .sort((a, b) => (a?.order || 0) - (b?.order || 0));

  // Quick area preset slots for fast tapping
  const quickAreaSlots = [
    'Gachibowli',
    'Madhapur',
    'Jubilee Hills',
    'Banjara Hills',
    'Kondapur',
    'Kukatpally',
    'Miyapur',
    'Secunderabad',
    'Begumpet',
    'Hitec City',
    'Manikonda',
    'LB Nagar'
  ];

  // Default initial service selection
  const defaultServiceName =
    initialService ||
    (visibleServices.length > 0
      ? isTelugu && visibleServices[0].nameTelugu
        ? visibleServices[0].nameTelugu
        : visibleServices[0].name
      : 'Terrace / Roof Waterproofing');

  // Form state
  const [formData, setFormData] = useState({
    customerName: currentCustomer?.name || '',
    phone: currentCustomer?.mobile || '',
    service: defaultServiceName,
    location: '',
    timeSlot: isTelugu ? 'ఉదయం (9:00 AM - 12:00 PM)' : 'Morning (9:00 AM - 12:00 PM)',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<BookingReceiptData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const timeSlots = isTelugu
    ? [
        'ఉదయం (9:00 AM - 12:00 PM)',
        'మధ్యాహ్నం (12:00 PM - 3:00 PM)',
        'సాయంత్రం (3:00 PM - 6:00 PM)',
        'అర్జెంట్ సైట్ తనిఖీ (ఈరోజే)'
      ]
    : [
        'Morning (9:00 AM - 12:00 PM)',
        'Afternoon (12:00 PM - 3:00 PM)',
        'Evening (3:00 PM - 6:00 PM)',
        'Urgent Site Inspection (Today)'
      ];

  const handleSelectQuickArea = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      location: prev.location ? `${prev.location}, ${area}` : area
    }));
    setErrorMsg('');
  };

  const handleSelectServiceSlot = (serviceName: string) => {
    setFormData((prev) => ({
      ...prev,
      service: serviceName
    }));
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName.trim()) {
      setErrorMsg(isTelugu ? 'దయచేసి మీ పూర్తి పేరు నమోదు చేయండి.' : 'Please enter your full name.');
      return;
    }

    const cleanNum = cleanIndianMobile(formData.phone);
    if (!cleanNum || cleanNum.length < 10) {
      setErrorMsg(
        isTelugu
          ? 'దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి.'
          : 'Please provide a valid 10-digit mobile number.'
      );
      return;
    }

    if (!formData.service.trim()) {
      setErrorMsg(isTelugu ? 'దయచేసి అవసరమైన సేవను ఎంచుకోండి.' : 'Please select the required service.');
      return;
    }

    if (!formData.location.trim()) {
      setErrorMsg(
        isTelugu
          ? 'దయచేసి పని ప్రదేశం లేదా లొకేషన్ నమోదు చేయండి.'
          : 'Please enter your work area or location.'
      );
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const res = await onSubmitBooking({
        customerName: formData.customerName.trim(),
        phone: cleanNum,
        whatsapp: cleanNum,
        service: formData.service,
        location: formData.location.trim(),
        preferredTime: formData.timeSlot,
        message: formData.message.trim(),
        slotType: 'Customer Enquiry & Service Request',
        sourceSlot: 'Customer Enquiry & Service Request',
        workDate: new Date().toISOString().split('T')[0]
      });

      if (res.success && res.bookingCode) {
        const fullReceipt: BookingReceiptData = {
          bookingCode: res.bookingCode,
          customerName: formData.customerName.trim(),
          phone: cleanNum,
          service: formData.service,
          location: formData.location.trim(),
          workDate: new Date().toISOString().split('T')[0],
          preferredTime: formData.timeSlot,
          message: formData.message.trim(),
          status: 'Confirmed'
        };
        setSuccessData(fullReceipt);
        setIsModalOpen(true);
      } else {
        setErrorMsg(
          res.message ||
            (isTelugu
              ? 'వివరాలు నమోదు కాలేదు. దయచేసి మళ్లీ ప్రయత్నించండి.'
              : 'Failed to submit enquiry. Please try again.')
        );
      }
    } catch (err) {
      setErrorMsg(
        isTelugu
          ? 'సర్వర్ సమస్య ఎదురైంది. దయచేసి నేరుగా 9949293872 కు కాల్ చేయండి.'
          : 'Network error. Please call 9949293872 directly.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccessData(null);
    setIsModalOpen(false);
    setFormData({
      customerName: currentCustomer?.name || '',
      phone: currentCustomer?.mobile || '',
      service: defaultServiceName,
      location: '',
      timeSlot: isTelugu ? 'ఉదయం (9:00 AM - 12:00 PM)' : 'Morning (9:00 AM - 12:00 PM)',
      message: ''
    });
    setErrorMsg('');
  };

  const handleCopyReceipt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2500);
  };

  return (
    <div className="w-full bg-[#F9F7F2] min-h-screen py-8 sm:py-12 text-[#121212]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb / Header */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#DCD9D1]">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#3D3B35] hover:text-[#121212] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isTelugu ? 'హోమ్‌పేజీకి తిరిగి వెళ్లండి' : 'Back to Home'}</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="bg-[#121212] text-[#F9F7F2] text-[9px] uppercase tracking-[0.22em] font-bold px-2.5 py-1 rounded-xs">
              {isTelugu ? 'కస్టమర్ విచారణ ఫారం' : 'CUSTOMER ENQUIRY'}
            </span>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-[#FDFCF9] rounded-2xl border border-[#DCD9D1] shadow-xl overflow-hidden">
          {/* Header Banner */}
          <div className="bg-[#121212] text-[#F9F7F2] p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-8 pointer-events-none">
              <Building2 className="w-48 h-48 text-white" />
            </div>

            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-white/90 text-[10px] font-semibold tracking-wider uppercase mb-3 border border-white/15">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>{isTelugu ? 'ఉచిత సైట్ తనిఖీ & ఎస్టిమేషన్' : 'Free Site Inspection & Estimate'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal tracking-tight text-white mb-2">
                {isTelugu ? 'కస్టమర్ విచారణ & సేవా అభ్యర్థన' : 'Customer Enquiry & Service Request'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                {isTelugu
                  ? 'మీ వాటర్ప్రూఫింగ్, లీకేజీ లేదా సివిల్ రిపేర్ వివరాలను నమోదు చేయండి. మా సీనియర్ ఇంజనీర్ త్వరలోనే మిమ్మల్ని సంప్రదిస్తారు.'
                  : 'Fill in your requirements below for instant consultation, specialized civil diagnosis, and free site assessment in Hyderabad.'}
              </p>
            </div>
          </div>

          {/* Success State */}
          {successData ? (
            <div className="p-8 sm:p-12 text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500 shadow-lg animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                  {isTelugu ? 'విచారణ విజయవంతంగా నమోదైంది' : 'ENQUIRY SUBMITTED SUCCESSFULLY'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif text-[#121212]">
                  {isTelugu ? 'ధన్యవాదాలు! మీ అభ్యర్థన అందింది' : 'Thank You! Request Received'}
                </h2>
                <p className="text-xs sm:text-sm text-[#3D3B35] max-w-md mx-auto">
                  {isTelugu
                    ? 'మీ సర్వీస్ అభ్యర్థన రసీదు సిద్ధంగా ఉంది. వివరాల కాపీని మీ మొబైల్ లేదా వాట్సాప్‌కి నేరుగా పంపవచ్చు.'
                    : 'Your official service survey receipt is ready. You can forward a copy directly to your mobile or WhatsApp.'}
                </p>
              </div>

              {/* Reference & Mobile Copy Dispatch Box */}
              <div className="max-w-md mx-auto p-4 rounded-xl bg-[#F2EFE9] border border-[#DCD9D1] text-left space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8C8A82] uppercase tracking-wider font-semibold">
                    {isTelugu ? 'ట్రాకింగ్ కోడ్' : 'Reference / Tracking Code'}:
                  </span>
                  <span className="font-mono font-bold text-sm text-[#121212] bg-white px-2 py-0.5 rounded border border-[#DCD9D1]">
                    {successData.bookingCode}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8C8A82] uppercase tracking-wider font-semibold">
                    {isTelugu ? 'కస్టమర్ మొబైల్' : 'Customer Mobile'}:
                  </span>
                  <span className="font-mono font-semibold text-[#121212]">+91 {successData.phone}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8C8A82] uppercase tracking-wider font-semibold">
                    {isTelugu ? 'ఎంచుకున్న సేవ' : 'Selected Service'}:
                  </span>
                  <span className="font-medium text-[#121212] text-right truncate max-w-[200px]">
                    {successData.service}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8C8A82] uppercase tracking-wider font-semibold">
                    {isTelugu ? 'లొకేషన్' : 'Location'}:
                  </span>
                  <span className="font-medium text-[#121212]">{successData.location}</span>
                </div>
              </div>

              {/* Mobile Forwarding CTA Buttons */}
              <div className="space-y-3 max-w-md mx-auto">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-left space-y-2">
                  <span className="text-[11px] font-bold text-emerald-900 block">
                    📲 {isTelugu ? 'మొబైల్‌కు రసీదు కాపీ పంపండి:' : 'Send Receipt Copy to Customer Mobile:'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <a
                      href={getWhatsAppDispatchUrl(successData.phone, formatBookingReceiptText(successData, isTelugu))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5c] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
                    >
                      <MessageSquare className="w-4 h-4 fill-current" />
                      <span>{isTelugu ? 'కస్టమర్ వాట్సాప్' : "Customer's WA"}</span>
                    </a>

                    <a
                      href={getSmsDispatchUrl(successData.phone, formatBookingReceiptText(successData, isTelugu))}
                      className="px-4 py-2.5 rounded-xl bg-[#121212] hover:bg-[#2a2a2a] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>{isTelugu ? 'SMS పంపండి' : 'Send SMS'}</span>
                    </a>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyReceipt(formatBookingReceiptText(successData, isTelugu))}
                    className="px-4 py-2 rounded-xl bg-white border border-[#DCD9D1] text-[#121212] text-xs font-bold flex items-center gap-1.5 hover:bg-[#F2EFE9] transition-all cursor-pointer"
                  >
                    {copiedReceipt ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedReceipt ? (isTelugu ? 'కాపీ అయింది!' : 'Copied!') : (isTelugu ? 'రసీదు కాపీ చేయండి' : 'Copy Receipt Text')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{isTelugu ? 'పూర్తి స్లిప్ చూడండి' : 'View Full Slip'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-[#DCD9D1]">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-bold uppercase tracking-wider text-[#121212] hover:underline cursor-pointer"
                >
                  {isTelugu ? 'మరొక విచారణ సమర్పించండి' : 'Submit Another Enquiry'}
                </button>
              </div>
            </div>
          ) : (
            /* Main Form */
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {/* Error Banner */}
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-shake">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. CUSTOMER NAME FIELD */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-[0.16em] text-[#121212]">
                  1. {isTelugu ? 'కస్టమర్ పేరు' : 'Customer Name'} <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8A82]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder={
                      isTelugu
                        ? 'మీ పూర్తి పేరును ఇక్కడ నమోదు చేయండి (ఉదా: రమేష్ రావు)'
                        : 'Enter your full name (e.g. Ramesh Rao / Anita Reddy)'
                    }
                    value={formData.customerName}
                    onChange={(e) => {
                      setFormData({ ...formData, customerName: e.target.value });
                      setErrorMsg('');
                    }}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#DCD9D1] bg-[#F9F7F2] text-xs sm:text-sm text-[#121212] placeholder:text-[#8C8A82] focus:border-[#121212] focus:ring-2 focus:ring-[#121212]/10 focus:outline-none transition-all shadow-xs"
                  />
                </div>
                <p className="text-[10px] text-[#8C8A82]">
                  {isTelugu
                    ? 'సైట్ సర్వే రిజిస్ట్రేషన్ కోసం మీ పేరు'
                    : 'Your name will be used on the site survey assessment and quotation report.'}
                </p>
              </div>

              {/* 2. PHONE NUMBER FIELD */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-[0.16em] text-[#121212]">
                  2. {isTelugu ? 'ఫోన్ నంబర్ / మొబైల్' : 'Phone Number'} <span className="text-rose-600">*</span>
                </label>
                <div className="relative flex">
                  <div className="inline-flex items-center px-3.5 py-3 rounded-l-xl border border-r-0 border-[#DCD9D1] bg-[#EFECE6] text-xs font-bold text-[#121212]">
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9949293872"
                    value={formData.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, phone: val });
                      setErrorMsg('');
                    }}
                    className="w-full px-4 py-3 rounded-r-xl border border-[#DCD9D1] bg-[#F9F7F2] text-xs sm:text-sm text-[#121212] placeholder:text-[#8C8A82] focus:border-[#121212] focus:ring-2 focus:ring-[#121212]/10 focus:outline-none transition-all font-mono tracking-wider shadow-xs"
                  />
                </div>
                <p className="text-[10px] text-[#8C8A82] flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3 text-emerald-600 inline" />
                  <span>
                    {isTelugu
                      ? 'మేము సైట్ సర్వే వివరాలను వాట్సాప్ & కాల్ ద్వారా తెలియజేస్తాము.'
                      : 'We will send survey confirmation & time updates via direct WhatsApp and Call.'}
                  </span>
                </p>
              </div>

              {/* 3. SELECT SERVICE DROPDOWN & FAST SELECT SLOTS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-[0.16em] text-[#121212]">
                    3. {isTelugu ? 'కావలసిన సేవను ఎంచుకోండి' : 'Select Service'}{' '}
                    <span className="text-rose-600">*</span>
                  </label>
                  <span className="text-[10px] text-[#8C8A82] font-semibold">
                    {visibleServices.length} {isTelugu ? 'అందుబాటులో ఉన్న సేవలు' : 'Disciplines Available'}
                  </span>
                </div>

                {/* Primary Dropdown Selector */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8A82]">
                    <Layers className="w-4 h-4" />
                  </div>
                  <select
                    value={formData.service}
                    onChange={(e) => {
                      setFormData({ ...formData, service: e.target.value });
                      setErrorMsg('');
                    }}
                    className="w-full pl-10 pr-8 py-3 rounded-xl border border-[#DCD9D1] bg-[#F9F7F2] text-xs sm:text-sm text-[#121212] focus:border-[#121212] focus:ring-2 focus:ring-[#121212]/10 focus:outline-none transition-all shadow-xs cursor-pointer appearance-none"
                  >
                    {visibleServices.map((s) => {
                      const name = isTelugu && s.nameTelugu ? s.nameTelugu : s.name;
                      return (
                        <option key={s.id} value={name}>
                          {isTelugu
                            ? `సేవ నెం. ${String(s.number).padStart(2, '0')} — ${name}`
                            : `Discipline ${String(s.number).padStart(2, '0')} — ${name}`}
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#8C8A82]">
                    <span className="text-xs">▼</span>
                  </div>
                </div>

                {/* Easy Quick-Tap Service Selector Slots */}
                <div className="pt-1.5 space-y-1">
                  <span className="text-[10px] font-semibold text-[#6E6B63] uppercase tracking-wider block">
                    {isTelugu ? 'లేదా త్వరిత స్లాట్ ఎంచుకోండి' : 'Or quick-tap a popular service slot'}:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {visibleServices.slice(0, 6).map((s) => {
                      const name = isTelugu && s.nameTelugu ? s.nameTelugu : s.name;
                      const isSelected = formData.service.includes(s.name) || formData.service === name;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => handleSelectServiceSlot(name)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-[#121212] text-white border-[#121212] shadow-xs'
                              : 'bg-white text-[#3D3B35] border-[#DCD9D1] hover:bg-[#F2EFE9]'
                          }`}
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 4. WORK AREA / LOCATION FIELD & QUICK AREA SLOTS */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-[0.16em] text-[#121212]">
                  4. {isTelugu ? 'పని ప్రదేశం / లొకేషన్' : 'Work Area / Location'}{' '}
                  <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8A82]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder={
                      isTelugu
                        ? 'ఉదా: కొండాపూర్, మాదాపూర్, జూబ్లీహిల్స్, లేదా మీ పూర్తి చిరునామా'
                        : 'e.g. Kondapur, Madhapur, Gachibowli, or full site address'
                    }
                    value={formData.location}
                    onChange={(e) => {
                      setFormData({ ...formData, location: e.target.value });
                      setErrorMsg('');
                    }}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#DCD9D1] bg-[#F9F7F2] text-xs sm:text-sm text-[#121212] placeholder:text-[#8C8A82] focus:border-[#121212] focus:ring-2 focus:ring-[#121212]/10 focus:outline-none transition-all shadow-xs"
                  />
                </div>

                {/* Quick Area Location Slots */}
                <div className="pt-1 space-y-1">
                  <span className="text-[10px] font-semibold text-[#6E6B63] uppercase tracking-wider block">
                    {isTelugu
                      ? 'హైదరాబాద్ శీఘ్ర లొకేషన్ స్లాట్స్ (ట్యాప్ చేయండి)'
                      : 'Quick Area Slots for Hyderabad (Tap to fill)'}:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {quickAreaSlots.map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => handleSelectQuickArea(area)}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all cursor-pointer border ${
                          formData.location.includes(area)
                            ? 'bg-emerald-800 text-white border-emerald-800'
                            : 'bg-[#F2EFE9] text-[#3D3B35] border-[#DCD9D1] hover:bg-[#E8E4DB]'
                        }`}
                      >
                        + {area}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. PREFERRED TIME SLOT (Convenience Slot) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-[0.16em] text-[#121212]">
                  5. {isTelugu ? 'అనుకూల సమయం' : 'Preferred Inspection Time Slot'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {timeSlots.map((slot) => {
                    const isSelected = formData.timeSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setFormData({ ...formData, timeSlot: slot })}
                        className={`p-2.5 rounded-xl text-center text-[10px] sm:text-xs font-semibold transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-[#121212] text-white border-[#121212] shadow-xs'
                            : 'bg-white text-[#3D3B35] border-[#DCD9D1] hover:bg-[#F2EFE9]'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6. OPTIONAL NOTE / PROBLEM DESCRIPTION */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-[0.16em] text-[#121212]">
                  {isTelugu ? 'సమస్య వివరణ (ఐచ్ఛికం)' : 'Specific Problem Details (Optional)'}
                </label>
                <textarea
                  rows={2}
                  placeholder={
                    isTelugu
                      ? 'ఉదా: టెర్రస్ పై నీటి లీకేజ్, సీలింగ్ తడి అవ్వడం, బాత్రూమ్ డ్యాంప్నెస్...'
                      : 'e.g. Terrace rain water seepage, bathroom tile leakage, basement wall dampness...'
                  }
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#DCD9D1] bg-[#F9F7F2] text-xs sm:text-sm text-[#121212] placeholder:text-[#8C8A82] focus:border-[#121212] focus:outline-none transition-all"
                />
              </div>

              {/* 7. SUBMIT REQUEST BUTTON */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-[#121212] hover:bg-[#2e2d2a] text-white font-extrabold text-xs sm:text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all disabled:opacity-60 cursor-pointer active:scale-[0.99]"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>
                        {isTelugu ? 'అభ్యర్థన నమోదు చేయబడుతోంది...' : 'Submitting Your Request...'}
                      </span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      <span>{isTelugu ? 'విచారణను సమర్పించండి' : 'Submit Request'}</span>
                    </span>
                  )}
                </button>
              </div>

              {/* Trust Badge Footer */}
              <div className="pt-2 flex flex-wrap items-center justify-between text-[10px] text-[#8C8A82] border-t border-[#DCD9D1] gap-2">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isTelugu ? 'ఉచిత సైట్ తనిఖీ & ఎటువంటి దాచిన ఛార్జీలు లేవు' : '100% Free Site Inspection & Zero Hidden Charges'}</span>
                </span>
                <span>
                  {isTelugu ? 'సహాయం కోసం నేరుగా కాల్ చేయండి' : 'Need Immediate Help?'}:{' '}
                  <strong className="text-[#121212] font-mono">+91 {phone}</strong>
                </span>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Interactive Mobile Forwarding & Receipt Modal */}
      <BookingConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        booking={successData}
        isTelugu={isTelugu}
      />
    </div>
  );
};
