import React, { useState, useEffect } from 'react';
import { Service, BookingFormField, CustomerUser, WebsiteContent } from '../types';
import { Language, translations } from '../utils/translations';
import {
  CalendarCheck,
  Phone,
  MessageSquare,
  Upload,
  Check,
  AlertCircle,
  Clock,
  ShieldCheck,
  MapPin,
  X,
  FileText,
  User,
  ArrowRight,
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

interface BookAppointmentPageProps {
  services?: Service[];
  formFields?: BookingFormField[];
  initialServiceSlug?: string;
  currentCustomer?: CustomerUser | null;
  content?: WebsiteContent | null;
  language?: Language;
  onNavigate: (page: string) => void;
  onSubmitBooking: (bookingData: any) => Promise<{ success: boolean; bookingCode?: string; message?: string }>;
}

export const BookAppointmentPage: React.FC<BookAppointmentPageProps> = ({
  services = [],
  formFields = [],
  initialServiceSlug,
  currentCustomer,
  content,
  language = 'en',
  onNavigate,
  onSubmitBooking
}) => {
  const isTelugu = language === 'te';
  const t = translations[language];

  const phone = content?.business?.phone || '9949293872';
  const whatsapp = content?.business?.whatsapp || '9949293872';

  // Determine pre-selected service
  const matchedService = (services || []).find(
    (s) => s?.slug === initialServiceSlug || s?.name === initialServiceSlug
  );

  const [formData, setFormData] = useState<Record<string, any>>({
    customerName: currentCustomer ? currentCustomer.name : '',
    phone: currentCustomer ? currentCustomer.mobile : '',
    whatsapp: currentCustomer ? currentCustomer.mobile : '',
    email: currentCustomer ? currentCustomer.email : '',
    location: currentCustomer?.address || '',
    service: matchedService
      ? (isTelugu && matchedService.nameTelugu ? matchedService.nameTelugu : matchedService.name)
      : (services[0] ? (isTelugu && services[0].nameTelugu ? services[0].nameTelugu : services[0].name) : 'Terrace / Roof Waterproofing'),
    workDate: '',
    preferredTime: isTelugu ? 'ఉదయం (9:00 AM - 12:00 PM)' : 'Morning (9:00 AM - 12:00 PM)',
    message: ''
  });

  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState<BookingReceiptData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedReceipt, setCopiedReceipt] = useState(false);

  useEffect(() => {
    if (matchedService) {
      setFormData((prev) => ({
        ...prev,
        service: isTelugu && matchedService.nameTelugu ? matchedService.nameTelugu : matchedService.name
      }));
    }
  }, [matchedService, isTelugu]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Convert to base64 data URLs for storage & preview
    Array.from(files).forEach((file: File) => {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg(isTelugu ? 'ఫైల్ పరిమాణం చాలా పెద్దది. దయచేసి 5MB లోపు ఫోటోలను అప్‌లోడ్ చేయండి.' : 'File size too large. Please upload images under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setUploadedPhotos((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Dynamic field validation
    const enabledFields = (formFields || []).filter((f) => f?.enabled);
    for (const field of enabledFields) {
      if (field.required && field.type !== 'file') {
        const val = formData[field.name];
        if (!val || (typeof val === 'string' && !val.trim())) {
          setErrorMsg(isTelugu ? `దయచేసి అవసరమైన ఫీల్డ్‌ను పూర్తి చేయండి: ${field.label}` : `Please fill the required field: ${field.label}`);
          return;
        }
      }
    }

    const cleanNum = cleanIndianMobile(formData.phone);
    if (!cleanNum || cleanNum.length < 10) {
      setErrorMsg(isTelugu ? 'దయచేసి సరైన 10 అంకెల ఫోన్ నంబర్‌ను నమోదు చేయండి (ఉదా: 9949293872).' : 'Please enter a valid 10-digit phone number (e.g. 9949293872).');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        phone: cleanNum,
        whatsapp: cleanIndianMobile(formData.whatsapp || cleanNum),
        photos: uploadedPhotos,
        slotType: 'HYDERABAD SITE INSPECTION & WATERPROOFING ASSESSMENT',
        sourceSlot: 'HYDERABAD SITE INSPECTION & WATERPROOFING ASSESSMENT',
        customerId: currentCustomer ? currentCustomer.id : undefined,
        bookingDate: new Date().toISOString().split('T')[0],
        bookingTime: new Date().toTimeString().split(' ')[0]
      };

      const result = await onSubmitBooking(payload);

      if (result.success && result.bookingCode) {
        const receipt: BookingReceiptData = {
          bookingCode: result.bookingCode,
          customerName: (formData.customerName || '').trim(),
          phone: cleanNum,
          service: formData.service,
          location: formData.location || 'Hyderabad, Telangana',
          workDate: formData.workDate || new Date().toISOString().split('T')[0],
          preferredTime: formData.preferredTime,
          message: formData.message,
          status: 'Confirmed'
        };
        setSuccessData(receipt);
        setIsModalOpen(true);
      } else {
        setErrorMsg(result.message || (isTelugu ? 'బుకింగ్ సమర్పణ విఫలమైంది. దయచేసి 9949293872 కు కాల్ చేయండి.' : 'Booking submission failed. Please call 9949293872.'));
      }
    } catch (err) {
      setErrorMsg(isTelugu ? 'అనుకోని లోపం ఏర్పడింది. దయచేసి నేరుగా TAR ను సంప్రదించండి.' : 'An unexpected error occurred. Please contact TAR directly.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReceipt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2500);
  };

  const visibleServices = (services || []).filter((s) => !s?.isHidden).sort((a, b) => (a?.order || 0) - (b?.order || 0));
  const activeFields = (formFields || []).filter((f) => f?.enabled).sort((a, b) => (a?.order || 0) - (b?.order || 0));

  return (
    <div className="w-full bg-[#F9F7F2] min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Title Card */}
        <div className="bg-[#121212] text-[#F9F7F2] rounded-xs p-8 sm:p-10 relative overflow-hidden border border-[#DCD9D1] text-center space-y-3 shadow-lg">
          <div className="inline-flex items-center gap-2 bg-[#222] border border-[#444] px-3 py-1 rounded-xs text-[10px] font-bold uppercase tracking-[0.2em] text-[#DCD9D1]">
            <CalendarCheck className="w-3.5 h-3.5 text-[#F9F7F2]" />
            <span>{isTelugu ? 'హైదరాబాద్ సైట్ తనిఖీ & వాటర్ప్రూఫింగ్ అసెస్‌మెంట్' : 'HYDERABAD SITE INSPECTION & WATERPROOFING ASSESSMENT'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#F9F7F2] tracking-tight">
            {t.bookingTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#8C8A82] max-w-xl mx-auto font-light">
            {t.bookingSubtitle}
          </p>

          {/* Guest vs Logged In Status Badge */}
          <div className="pt-2 flex items-center justify-center gap-3 text-xs">
            {currentCustomer ? (
              <div className="inline-flex items-center gap-1.5 bg-[#222] px-3 py-1 rounded-xs text-[#F9F7F2] border border-[#444]">
                <User className="w-3.5 h-3.5 text-[#DCD9D1]" />
                <span>
                  {isTelugu ? 'లాగిన్ అయిన యూజర్:' : 'Booking as:'} <strong>{currentCustomer.name}</strong>
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[#8C8A82]">
                <span>{isTelugu ? 'అతిథి బుకింగ్ విధానం' : 'Guest Booking Mode'}</span>
                <span>•</span>
                <button
                  onClick={() => onNavigate('customer-login')}
                  className="text-[#DCD9D1] hover:text-white font-semibold underline cursor-pointer"
                >
                  {isTelugu ? 'గత చరిత్ర చూడటానికి లాగిన్ చేయండి &rarr;' : 'Login to track history &rarr;'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Success Confirmation Modal / Card */}
        {successData ? (
          <div className="bg-[#FDFCF9] rounded-xs p-8 sm:p-12 border border-[#DCD9D1] shadow-xl text-center space-y-6 animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-[#121212] text-[#F9F7F2] flex items-center justify-center mx-auto shadow-inner">
              <Check className="w-7 h-7 text-emerald-400" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-[0.2em]">
                {isTelugu ? 'బుకింగ్ నిర్ధారించబడింది' : 'Inspection Confirmed'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#121212]">
                {isTelugu ? 'అపాయింట్‌మెంట్ విజయవంతంగా నమోదైంది!' : 'Appointment Booked Successfully!'}
              </h2>
              <p className="text-xs sm:text-sm text-[#3D3B35] max-w-md mx-auto font-light">
                {isTelugu
                  ? `ధన్యవాదాలు, ${successData.customerName}. మీ అపాయింట్‌మెంట్ రసీదు సిద్ధంగా ఉంది. వివరాల కాపీని మీ మొబైల్ లేదా వాట్సాప్‌కి నేరుగా ఫార్వార్డ్ చేయండి.`
                  : `Thank you, ${successData.customerName}. Your official appointment survey receipt is ready. Forward a copy directly to your WhatsApp or mobile number.`}
              </p>
            </div>

            {/* Booking Details Ticket */}
            <div className="bg-[#F2EFE9] rounded-xs p-6 border border-[#DCD9D1] max-w-md mx-auto text-left space-y-3 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#DCD9D1]">
                <span className="text-[#6E6B63] font-medium">{isTelugu ? 'బుకింగ్ ఐడి:' : 'Booking ID:'}</span>
                <span className="font-mono font-black text-sm text-[#121212]">{successData.bookingCode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6E6B63] font-medium">{isTelugu ? 'కస్టమర్ మొబైల్:' : 'Customer Mobile:'}</span>
                <span className="font-mono font-bold text-[#121212]">+91 {successData.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6E6B63] font-medium">{isTelugu ? 'ఎంచుకున్న సేవ:' : 'Selected Service:'}</span>
                <span className="font-bold text-[#121212] text-right">{successData.service}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6E6B63] font-medium">{isTelugu ? 'తేదీ:' : 'Date of Work:'}</span>
                <span className="font-bold text-[#121212]">{successData.workDate}</span>
              </div>
            </div>

            {/* Mobile Forwarding CTA Buttons */}
            <div className="space-y-3 max-w-md mx-auto">
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-left space-y-2">
                <span className="text-xs font-bold text-emerald-900 block flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span>{isTelugu ? `మొబైల్‌కి రసీదు కాపీ పంపండి (+91 ${successData.phone}):` : `Forward Booking Copy to Mobile (+91 ${successData.phone}):`}</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href={getWhatsAppDispatchUrl(successData.phone, formatBookingReceiptText(successData, isTelugu))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5c] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
                  >
                    <MessageSquare className="w-4 h-4 fill-current" />
                    <span>{isTelugu ? 'కస్టమర్ వాట్సాప్' : "Customer WhatsApp"}</span>
                  </a>

                  <a
                    href={getSmsDispatchUrl(successData.phone, formatBookingReceiptText(successData, isTelugu))}
                    className="px-4 py-2.5 rounded-xl bg-[#121212] hover:bg-[#2a2a2a] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{isTelugu ? 'SMS పంపండి' : 'Send via SMS'}</span>
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

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-[#DCD9D1]">
              <button
                onClick={() => {
                  setSuccessData(null);
                  setUploadedPhotos([]);
                }}
                className="px-5 py-2.5 rounded-xs border border-[#DCD9D1] text-[#121212] font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-[#F2EFE9] transition-colors cursor-pointer"
              >
                {isTelugu ? 'మరొక సేవను బుక్ చేయండి' : 'Book Another Service'}
              </button>

              {currentCustomer && (
                <button
                  onClick={() => onNavigate('customer-dashboard')}
                  className="px-5 py-2.5 rounded-xs bg-[#121212] text-[#F9F7F2] font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-[#3D3B35] transition-colors cursor-pointer"
                >
                  {isTelugu ? 'కస్టమర్ డ్యాష్‌బోర్డ్' : 'Customer Dashboard'}
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Main Interactive Booking Form */
          <div className="bg-[#FDFCF9] rounded-xs p-6 sm:p-10 border border-[#DCD9D1] shadow-xs space-y-6">
            {errorMsg && (
              <div className="p-3.5 rounded-xs bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Selection Highlight Box */}
              <div className="p-5 rounded-xs bg-[#F2EFE9] border border-[#DCD9D1]">
                <label className="block text-[10px] font-bold text-[#121212] mb-1.5 uppercase tracking-[0.2em]">
                  {isTelugu ? 'ఎంచుకున్న సేవ *' : 'Selected Service *'}
                </label>
                <select
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className="w-full px-4 py-3 rounded-xs border border-[#DCD9D1] bg-[#F9F7F2] text-xs font-bold text-[#121212] focus:border-[#121212] focus:outline-none"
                >
                  {visibleServices.map((svc) => (
                    <option key={svc.id} value={isTelugu && svc.nameTelugu ? svc.nameTelugu : svc.name}>
                      {isTelugu
                        ? `నెం. ${String(svc.number).padStart(2, '0')}: ${svc.nameTelugu || svc.name}`
                        : `Service #${svc.number}: ${svc.name}`}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-[#6E6B63] mt-1.5 uppercase tracking-wider">
                  {isTelugu
                    ? 'హైదరాబాద్ సైట్లకు సరిపోయే నాణ్యమైన కెమికల్స్ మరియు పరికరాలు సిద్దంగా ఉన్నాయి.'
                    : 'Selected service is pre-configured with specialized tools and chemicals for Hyderabad sites.'}
                </p>
              </div>

              {/* Dynamic Field Renderer based on Admin Form Config */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {activeFields.map((field) => {
                  if (field.name === 'service') return null;

                  if (field.type === 'file' || field.name === 'photos') {
                    return (
                      <div key={field.id} className="sm:col-span-2 space-y-2">
                        <label className="block text-[10px] uppercase tracking-[0.18em] font-semibold text-[#3D3B35]">
                          {isTelugu ? 'సమస్య ఉన్న ప్రదేశం ఫోటోలు (ఐచ్ఛికం)' : field.label} {field.required && '*'}
                        </label>
                        <div className="border border-dashed border-[#DCD9D1] hover:border-[#121212] rounded-xs p-6 text-center cursor-pointer transition-colors bg-[#F9F7F2]">
                          <input
                            type="file"
                            id="photo-upload"
                            multiple
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                          <label htmlFor="photo-upload" className="cursor-pointer block space-y-2">
                            <Upload className="w-7 h-7 text-[#121212] mx-auto" />
                            <div className="text-xs text-[#121212] font-semibold">
                              {isTelugu
                                ? 'క్రాక్స్, లీకేజ్ లేదా డ్యామేజ్ ఫోటోలను ఎంచుకోవడానికి ఇక్కడ క్లిక్ చేయండి'
                                : 'Click or Drag & Drop photos of damage, cracks, or water leakage'}
                            </div>
                            <div className="text-[10px] text-[#8C8A82] uppercase tracking-wider">
                              {isTelugu ? 'JPG, PNG ఫార్మాట్‌లు (గరిష్టంగా 5MB)' : 'Supports JPG, PNG up to 5MB each'}
                            </div>
                          </label>
                        </div>

                        {/* Uploaded Photos Preview Grid */}
                        {uploadedPhotos.length > 0 && (
                          <div className="flex flex-wrap gap-3 pt-2">
                            {uploadedPhotos.map((src, idx) => (
                              <div key={idx} className="relative w-20 h-20 rounded-xs overflow-hidden border border-[#DCD9D1] group">
                                <img src={src} alt="Upload preview" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => removePhoto(idx)}
                                  className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-full transition-colors cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  if (field.type === 'textarea') {
                    return (
                      <div key={field.id} className="sm:col-span-2">
                        <label className="block text-[10px] uppercase tracking-[0.18em] font-semibold text-[#3D3B35] mb-1">
                          {isTelugu ? 'సమస్య వివరాలు / అదనపు సమాచారం' : field.label} {field.required && '*'}
                        </label>
                        <textarea
                          rows={3}
                          placeholder={isTelugu ? 'మీ ఇంటి లీకేజ్ లేదా సమస్య గురించి రాయండి...' : field.placeholder}
                          value={formData[field.name] || ''}
                          onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xs border border-[#DCD9D1] bg-[#F9F7F2] text-xs text-[#121212] focus:border-[#121212] focus:outline-none"
                        />
                      </div>
                    );
                  }

                  if (field.type === 'select' && field.options) {
                    return (
                      <div key={field.id}>
                        <label className="block text-[10px] uppercase tracking-[0.18em] font-semibold text-[#3D3B35] mb-1">
                          {isTelugu && field.name === 'preferredTime' ? 'అనుకూలమైన సమయం' : field.label} {field.required && '*'}
                        </label>
                        <select
                          value={formData[field.name] || field.options[0]}
                          onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xs border border-[#DCD9D1] bg-[#F9F7F2] text-xs text-[#121212] focus:border-[#121212] focus:outline-none"
                        >
                          {field.options.map((opt, i) => (
                            <option key={i} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  return (
                    <div key={field.id} className={field.name === 'location' ? 'sm:col-span-2' : ''}>
                      <label className="block text-[10px] uppercase tracking-[0.18em] font-semibold text-[#3D3B35] mb-1">
                        {isTelugu
                          ? (field.name === 'customerName' ? 'మీ పూర్తి పేరు' : field.name === 'phone' ? 'ఫోన్ నంబర్' : field.name === 'location' ? 'ప్రాంతం / లొకేషన్ (హైదరాబాద్)' : field.name === 'email' ? 'ఈమెయిల్ (ఐచ్ఛికం)' : field.label)
                          : field.label} {field.required && '*'}
                      </label>
                      <input
                        type={field.type}
                        placeholder={isTelugu ? (field.name === 'customerName' ? 'ఉదా: రమేష్ రెడ్డి' : field.name === 'phone' ? '9949293872' : field.name === 'location' ? 'ఉదా: జూబ్లీహిల్స్, రోడ్ నెం. 36' : field.placeholder) : field.placeholder}
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xs border border-[#DCD9D1] bg-[#F9F7F2] text-xs text-[#121212] focus:border-[#121212] focus:outline-none"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-[#DCD9D1] space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xs bg-[#121212] hover:bg-[#3D3B35] text-[#F9F7F2] font-bold text-[11px] uppercase tracking-[0.25em] flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-70 cursor-pointer"
                >
                  {loading ? (
                    <span>{isTelugu ? 'నమోదు అవుతోంది...' : 'Validating & Recording Appointment...'}</span>
                  ) : (
                    <>
                      <CalendarCheck className="w-4 h-4" />
                      <span>{isTelugu ? 'అపాయింట్‌మెంట్ బుక్ చేయండి' : 'Book Appointment'}</span>
                    </>
                  )}
                </button>

                <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] text-[#8C8A82] gap-2 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#121212]" />
                    {isTelugu ? 'ఉచిత సైట్ అసెస్‌మెంట్ • ఎలాంటి ముందస్తు డిపాజిట్ లేదు' : 'Zero Obligation Free Site Assessment'}
                  </span>
                  <span>{isTelugu ? 'తక్షణమే ఇంజనీర్ సంప్రదిస్తారు' : 'Instant notification dispatched to TAR team'}</span>
                </div>
              </div>
            </form>
          </div>
        )}
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
