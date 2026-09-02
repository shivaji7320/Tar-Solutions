import React, { useState } from 'react';
import { WebsiteContent } from '../types';
import { TarLogo } from '../components/TarLogo';
import { Language, translations } from '../utils/translations';
import {
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  CalendarCheck,
  Clock,
  Send,
  Check
} from 'lucide-react';

interface ContactPageProps {
  content: WebsiteContent;
  language?: Language;
  onNavigate: (page: string) => void;
  onSubmitInquiry?: (inquiry: any) => Promise<boolean>;
  onSubmitBooking?: (bookingData: any) => Promise<{ success: boolean; bookingCode?: string; message?: string }>;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  content,
  language = 'en',
  onNavigate,
  onSubmitBooking
}) => {
  const isTelugu = language === 'te';
  const t = translations[language];

  const phone = content?.business?.phone || '9949293872';
  const whatsapp = content?.business?.whatsapp || '9949293872';
  const email = content?.business?.email || 'tarsolutions55@gmail.com';
  const address = isTelugu ? 'హైదరాబాద్ & సికింద్రాబాద్, తెలంగాణ, భారతదేశం' : (content?.business?.address || 'Hyderabad, Telangana, India');
  const mapsEmbed =
    content?.business?.googleMapsEmbedUrl ||
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d243647.31604070685!2d78.26795855429688!3d17.412299800000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb99daeaebd2c7%3A0xae93b78392bafbc2!2sHyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin';

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;

    setLoading(true);
    if (onSubmitBooking) {
      try {
        await onSubmitBooking({
          customerName: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          service: 'General Civil & Waterproofing Enquiry',
          location: 'Hyderabad, Telangana',
          message: form.message.trim(),
          slotType: 'Customer Enquiry & Service Request',
          sourceSlot: 'Customer Enquiry & Service Request',
          workDate: new Date().toISOString().split('T')[0]
        });
      } catch (err) {}
    }
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="w-full bg-[#F9F7F2] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Header Banner */}
        <div className="bg-[#121212] text-[#F9F7F2] rounded-xs p-8 sm:p-12 relative overflow-hidden border border-[#DCD9D1] shadow-xl">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-[#222] border border-[#444] px-3 py-1 rounded-xs text-[10px] font-bold uppercase tracking-[0.2em] text-[#DCD9D1]">
              <MapPin className="w-3.5 h-3.5 text-[#F9F7F2]" />
              <span>{isTelugu ? 'హైదరాబాద్ హెడ్‌క్వార్టర్స్' : 'HYDERABAD HEADQUARTERS'}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-normal text-[#F9F7F2] tracking-tight">
              {isTelugu ? 'TAR సొల్యూషన్స్‌ను సంప్రదించండి' : 'Contact TAR Solutions'}
            </h1>
            <p className="text-xs sm:text-sm text-[#8C8A82] leading-relaxed font-light">
              {isTelugu
                ? 'మీ ఇంటి వాటర్ప్రూఫింగ్ తనిఖీ, బాత్రూమ్ లేదా టెర్రస్ లీకేజ్ ట్రీట్మెంట్ కొరకు మా ఇంజనీరింగ్ నిపుణులను నేరుగా సంప్రదించండి.'
                : 'Reach out directly to our engineering specialists for on-site waterproofing inspection, dampness diagnosis, or emergency leakage treatment in Hyderabad.'}
            </p>
          </div>
        </div>

        {/* Contact Info & Direct Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#FDFCF9] rounded-xs p-8 border border-[#DCD9D1] shadow-xs space-y-6">
              <div>
                <TarLogo variant="full" />
                <h3 className="text-base font-serif font-normal text-[#121212] mt-3">
                  TAR Civil &amp; Waterproofing Experts Solutions
                </h3>
                <p className="text-xs text-[#6E6B63] mt-1 font-light">
                  {isTelugu ? 'హైదరాబాద్ & తెలంగాణ వ్యాప్తంగా నమ్మకమైన వాటర్ప్రూఫింగ్ & సివిల్ సేవలు.' : 'Reliable Waterproofing & Civil Engineering Services across Hyderabad & Telangana.'}
                </p>
              </div>

              <div className="space-y-4 text-xs pt-4 border-t border-[#DCD9D1]">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#121212] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#121212] font-semibold">{isTelugu ? 'చిరునామా' : 'Address'}</strong>
                    <span className="text-[#3D3B35] font-light">{address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#121212] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#121212] font-semibold">{isTelugu ? 'ఫోన్' : 'Phone'}</strong>
                    <a href={`tel:${phone}`} className="text-[#121212] hover:underline font-bold">
                      +91 {phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MessageSquare className="w-4 h-4 text-[#1A3A2A] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#121212] font-semibold">WhatsApp</strong>
                    <a
                      href={`https://wa.me/91${whatsapp}?text=Hello%20TAR%20Experts`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1A3A2A] hover:underline font-bold"
                    >
                      +91 {whatsapp}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#121212] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#121212] font-semibold">{isTelugu ? 'ఈమెయిల్' : 'Email'}</strong>
                    <a href={`mailto:${email}`} className="text-[#3D3B35] hover:underline">
                      {email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#121212] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#121212] font-semibold">{isTelugu ? 'పని వేళలు' : 'Business Hours'}</strong>
                    <span className="text-[#3D3B35] font-light">{isTelugu ? 'సోమవారం - ఆదివారం: ఉదయం 8:00 - రాత్రి 8:00' : 'Monday - Sunday: 8:00 AM - 8:00 PM'}</span>
                  </div>
                </div>
              </div>

              {/* Direct Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <a
                  href={`tel:${phone}`}
                  className="py-3 rounded-xs bg-[#121212] hover:bg-[#3D3B35] text-[#F9F7F2] font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{isTelugu ? 'కాల్ చేయండి' : 'Call Now'}</span>
                </a>
                <a
                  href={`https://wa.me/91${whatsapp}?text=Hello%20TAR%20Civil%20%26%20Waterproofing%20Experts`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 rounded-xs bg-[#1A3A2A] hover:bg-[#23503A] text-white font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-1.5 transition-colors border border-[#2E6B4A]"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{isTelugu ? 'వాట్సాప్' : 'WhatsApp'}</span>
                </a>
              </div>

              <button
                onClick={() => onNavigate('book')}
                className="w-full py-3.5 rounded-xs bg-[#F2EFE9] hover:bg-[#E8E4DB] text-[#121212] font-bold text-[10px] uppercase tracking-[0.2em] border border-[#DCD9D1] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <CalendarCheck className="w-3.5 h-3.5 text-[#121212]" />
                <span>{isTelugu ? 'సైట్ అపాయింట్‌మెంట్ బుక్ చేయండి' : 'Book Site Appointment'}</span>
              </button>
            </div>
          </div>

          {/* Right Inquiry Form */}
          <div className="lg:col-span-7 bg-[#FDFCF9] rounded-xs p-8 border border-[#DCD9D1] shadow-xs">
            <h2 className="text-2xl font-serif font-normal text-[#121212] mb-2">
              {isTelugu ? 'మీ సందేశాన్ని పంపండి' : 'Send a Quick Inquiry'}
            </h2>
            <p className="text-xs text-[#6E6B63] mb-6 font-light">
              {isTelugu
                ? 'టెర్రస్ కోటింగ్, బాత్రూమ్ లీకేజ్ లేదా క్రాక్ ఫిల్లింగ్ గురించి ఏవైనా ప్రశ్నలు ఉంటే మాకు సందేశం పంపండి.'
                : 'Have questions regarding terrace coating, sunken slab waterproofing, or crack sealing? Send us a message and our civil engineer will get in touch with you.'}
            </p>

            {submitted ? (
              <div className="bg-[#F2EFE9] border border-[#DCD9D1] rounded-xs p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#121212] text-[#F9F7F2] flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-serif text-[#121212]">{isTelugu ? 'సందేశం అందింది!' : 'Message Received!'}</h4>
                <p className="text-xs text-[#3D3B35]">
                  {isTelugu
                    ? `ధన్యవాదాలు. మేము త్వరలోనే ${form.phone} కు సంప్రదిస్తాము.`
                    : `Thank you for reaching out to TAR Civil & Waterproofing Experts Solutions. We will contact you at ${form.phone} shortly.`}
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: '', phone: '', email: '', message: '' });
                  }}
                  className="text-xs font-bold text-[#121212] underline cursor-pointer"
                >
                  {isTelugu ? 'మరొక సందేశం పంపండి' : 'Send another message'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.18em] font-semibold text-[#3D3B35] mb-1">
                      {isTelugu ? 'మీ పేరు *' : 'Your Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isTelugu ? 'మీ పేరు నమోదు చేయండి' : 'Enter your name'}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xs border border-[#DCD9D1] bg-[#F9F7F2] text-xs text-[#121212] focus:border-[#121212] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.18em] font-semibold text-[#3D3B35] mb-1">
                      {isTelugu ? 'ఫోన్ నంబర్ *' : 'Phone Number *'}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="9949293872"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xs border border-[#DCD9D1] bg-[#F9F7F2] text-xs text-[#121212] focus:border-[#121212] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.18em] font-semibold text-[#3D3B35] mb-1">
                    {isTelugu ? 'ఈమెయిల్ (ఐచ్ఛికం)' : 'Email (Optional)'}
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. yourname@gmail.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xs border border-[#DCD9D1] bg-[#F9F7F2] text-xs text-[#121212] focus:border-[#121212] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.18em] font-semibold text-[#3D3B35] mb-1">
                    {isTelugu ? 'మీ సమస్య / అవసరం వివరాలు' : 'Your Requirement / Problem'}
                  </label>
                  <textarea
                    rows={4}
                    placeholder={isTelugu ? 'లీకేజ్, రూఫ్ లేదా బాత్రూమ్ సమస్య గురించి రాయండి...' : 'Describe your water leakage, terrace dampness, or structural repair requirement...'}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xs border border-[#DCD9D1] bg-[#F9F7F2] text-xs text-[#121212] focus:border-[#121212] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xs bg-[#121212] hover:bg-[#3D3B35] text-[#F9F7F2] font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isTelugu ? 'సందేశాన్ని సమర్పించండి' : 'Send Inquiry to TAR Solutions'}</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Google Maps Location Section */}
        <div className="bg-[#FDFCF9] rounded-xs p-6 sm:p-8 border border-[#DCD9D1] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-serif font-normal text-[#121212] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#121212]" />
                <span>{isTelugu ? 'హైదరాబాద్ సర్వీస్ ప్రాంతాలు' : 'Service Coverage Area - Hyderabad & Telangana'}</span>
              </h3>
              <p className="text-xs text-[#6E6B63] font-light">
                {isTelugu ? 'హైదరాబాద్ మరియు సికింద్రాబాద్ పరిధిలోని అన్ని ప్రాంతాలలో అందుబాటులో ఉంది.' : 'Centrally operating across all Hyderabad residential and industrial zones.'}
              </p>
            </div>
            <a
              href="https://maps.google.com/?q=Hyderabad,+Telangana,+India"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-[#121212] underline hidden sm:block"
            >
              Google Maps లో చూడండి &rarr;
            </a>
          </div>

          <div className="w-full h-72 rounded-xs overflow-hidden border border-[#DCD9D1] bg-[#F9F7F2]">
            <iframe
              src={mapsEmbed}
              title="TAR Solutions Hyderabad Location"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
