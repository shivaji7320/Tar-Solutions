import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Printer,
  X,
  Share2,
  PhoneCall,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  FileText,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import {
  BookingReceiptData,
  cleanIndianMobile,
  formatBookingReceiptText,
  getWhatsAppDispatchUrl,
  getSmsDispatchUrl
} from '../utils/receiptFormatter';

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingReceiptData | null;
  isTelugu?: boolean;
}

export const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  isOpen,
  onClose,
  booking,
  isTelugu = false
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !booking) return null;

  const phone = cleanIndianMobile(booking.phone);
  const receiptText = formatBookingReceiptText(booking, isTelugu);
  const customerWhatsAppUrl = getWhatsAppDispatchUrl(phone, receiptText);
  const adminWhatsAppUrl = getWhatsAppDispatchUrl('9949293872', receiptText);
  const customerSmsUrl = getSmsDispatchUrl(phone, receiptText);

  const handleCopy = () => {
    navigator.clipboard.writeText(receiptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#DCD9D1] overflow-hidden my-8 text-[#121212]">
        {/* Header Ribbon */}
        <div className="bg-[#121212] text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-400">
                {isTelugu ? 'బుకింగ్ విజయవంతమైంది' : 'OFFICIAL SURVEY SLIP'}
              </span>
              <h3 className="text-base sm:text-lg font-serif font-bold text-white">
                {isTelugu ? 'సైట్ తనిఖీ నమోదైంది & కాపీ సిద్ధంగా ఉంది' : 'Inspection Registered & Receipt Ready'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instant Mobile Forwarding Banner */}
        <div className="bg-emerald-50 border-b border-emerald-200 p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>
                {isTelugu
                  ? `ఈ వివరాల కాపీని కస్టమర్ మొబైల్‌కి పంపండి (+91 ${phone})`
                  : `Forward Receipt Copy to Customer (+91 ${phone})`}
              </span>
            </span>
            <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              1-Tap Dispatch
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <a
              href={customerWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 bg-[#25D366] hover:bg-[#20ba5c] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>{isTelugu ? 'కస్టమర్ వాట్సాప్‌కి పంపండి' : "Send to Customer's WhatsApp"}</span>
            </a>

            <a
              href={customerSmsUrl}
              className="py-2.5 px-3 bg-[#121212] hover:bg-[#2e2d2a] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>{isTelugu ? 'SMS ద్వారా పంపండి' : 'Send via Phone SMS'}</span>
            </a>
          </div>
        </div>

        {/* Structured Slip View */}
        <div className="p-5 sm:p-6 space-y-4 text-xs">
          {/* Reference Block */}
          <div className="p-4 bg-[#F9F7F2] rounded-xl border border-[#DCD9D1] flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#8C8A82] block tracking-wider">
                {isTelugu ? 'బుకింగ్ రెఫరెన్స్ కోడ్' : 'Booking Reference ID'}
              </span>
              <span className="text-base font-mono font-black text-[#121212] tracking-wider">
                {booking.bookingCode}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold text-[#8C8A82] block tracking-wider">
                {isTelugu ? 'స్థితి' : 'Status'}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                <Check className="w-3 h-3" /> {isTelugu ? 'నమోదైంది' : 'Dispatched'}
              </span>
              <span className="text-[9px] text-emerald-700 font-medium block mt-0.5">
                ● Cloud DB Synced
              </span>
            </div>
          </div>

          {/* Key Value Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#F2EFE9] rounded-xl border border-[#DCD9D1]">
              <span className="text-[10px] uppercase font-bold text-[#8C8A82] block">
                {isTelugu ? 'క్లయింట్ పేరు' : 'Customer Name'}
              </span>
              <span className="font-semibold text-[#121212] text-sm">{booking.customerName}</span>
            </div>

            <div className="p-3 bg-[#F2EFE9] rounded-xl border border-[#DCD9D1]">
              <span className="text-[10px] uppercase font-bold text-[#8C8A82] block">
                {isTelugu ? 'మొబైల్ నంబర్' : 'Mobile Number'}
              </span>
              <span className="font-mono font-semibold text-[#121212] text-sm">+91 {phone}</span>
            </div>

            <div className="p-3 bg-[#F2EFE9] rounded-xl border border-[#DCD9D1] sm:col-span-2">
              <span className="text-[10px] uppercase font-bold text-[#8C8A82] block">
                {isTelugu ? 'ఎంచుకున్న సేవ' : 'Selected Service'}
              </span>
              <span className="font-semibold text-[#121212]">{booking.service}</span>
            </div>

            <div className="p-3 bg-[#F2EFE9] rounded-xl border border-[#DCD9D1] sm:col-span-2">
              <span className="text-[10px] uppercase font-bold text-[#8C8A82] block flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {isTelugu ? 'పని ప్రదేశం / లొకేషన్' : 'Site Location'}
              </span>
              <span className="font-medium text-[#121212]">{booking.location}</span>
            </div>

            <div className="p-3 bg-[#F2EFE9] rounded-xl border border-[#DCD9D1]">
              <span className="text-[10px] uppercase font-bold text-[#8C8A82] block flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {isTelugu ? 'సర్వే తేదీ' : 'Inspection Date'}
              </span>
              <span className="font-medium text-[#121212]">{booking.workDate || 'Flexible / Today'}</span>
            </div>

            <div className="p-3 bg-[#F2EFE9] rounded-xl border border-[#DCD9D1]">
              <span className="text-[10px] uppercase font-bold text-[#8C8A82] block flex items-center gap-1">
                <Clock className="w-3 h-3" /> {isTelugu ? 'సమయం' : 'Time Window'}
              </span>
              <span className="font-medium text-[#121212]">{booking.preferredTime || 'Morning Slot'}</span>
            </div>
          </div>

          {/* Admin Line Forward Link */}
          <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 flex items-center justify-between">
            <div>
              <span className="font-bold block">
                {isTelugu ? 'TAR ప్రధాన ఆఫీస్ హెల్ప్‌లైన్' : 'TAR Central Dispatch Office'}
              </span>
              <span className="text-[10px] text-amber-800">+91 9949293872 | tarsolutions55@gmail.com</span>
            </div>
            <a
              href={adminWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1"
            >
              <span>{isTelugu ? 'ఆఫీస్ వాట్సాప్' : 'Office WA'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#F2EFE9] border-t border-[#DCD9D1] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#DCD9D1] text-[#121212] hover:bg-[#F9F7F2] font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? (isTelugu ? 'కాపీ చేయబడింది!' : 'Copied!') : (isTelugu ? 'రసీదు కాపీ చేయండి' : 'Copy Text')}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#DCD9D1] text-[#121212] hover:bg-[#F9F7F2] font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>{isTelugu ? 'ప్రింట్ / PDF' : 'Print Slip'}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#121212] hover:bg-[#2e2d2a] text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-xs transition-all active:scale-95"
          >
            {isTelugu ? 'పూర్తయింది' : 'Done / Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
