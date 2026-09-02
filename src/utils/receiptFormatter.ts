export interface BookingReceiptData {
  bookingCode: string;
  customerName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  service: string;
  location: string;
  workDate?: string;
  preferredTime?: string;
  message?: string;
  bookingDate?: string;
  status?: string;
}

export function cleanIndianMobile(raw: string): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) {
    return digits.slice(2);
  }
  if (digits.startsWith('0') && digits.length === 11) {
    return digits.slice(1);
  }
  return digits;
}

export function formatBookingReceiptText(booking: BookingReceiptData, isTelugu: boolean = false): string {
  const phone = cleanIndianMobile(booking.phone);
  const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  if (isTelugu) {
    return `*🏢 TAR సివిల్ & వాటర్‌ప్రూఫింగ్ ఎక్స్‌పర్ట్స్ సొల్యూషన్స్*
_హైదరాబాద్ & తెలంగాణ అధికారిక సర్వీస్ రసీదు_
━━━━━━━━━━━━━━━━━━━━━
📋 *బుకింగ్ కోడ్:* ${booking.bookingCode}
👤 *క్లయింట్ పేరు:* ${booking.customerName}
📱 *మొబైల్:* +91 ${phone}
🛠 *ఎంచుకున్న సేవ:* ${booking.service}
📍 *సైట్ లొకేషన్:* ${booking.location}
📅 *సర్వే తేదీ:* ${booking.workDate || 'ఈరోజే / తక్షణమే'}
⏰ *సమయం విండో:* ${booking.preferredTime || 'ఉదయం స్లాట్'}
${booking.message ? `💬 *గమనిక:* ${booking.message}\n` : ''}━━━━━━━━━━━━━━━━━━━━━
✅ *స్టేటస్:* బుకింగ్ విజయవంతంగా నమోదైంది
📞 *కాల్ / వాట్సాప్ హెల్ప్‌లైన్:* +91 9949293872
📧 *ఈమెయిల్:* tarsolutions55@gmail.com
🌐 *నమోదైన సమయం:* ${now}
━━━━━━━━━━━━━━━━━━━━━
_మా చీఫ్ టెక్నికల్ సూపర్వైజర్ ఉచిత సైట్ తనిఖీ కోసం మిమ్మల్ని సంప్రదిస్తారు._`;
  }

  return `*🏢 TAR CIVIL & WATERPROOFING EXPERTS SOLUTIONS*
_Official Hyderabad & Telangana Survey Confirmation_
━━━━━━━━━━━━━━━━━━━━━
📋 *Booking Reference:* ${booking.bookingCode}
👤 *Customer Name:* ${booking.customerName}
📱 *Mobile Number:* +91 ${phone}
🛠 *Service Discipline:* ${booking.service}
📍 *Site Location:* ${booking.location}
📅 *Survey Date:* ${booking.workDate || 'Flexible / Today'}
⏰ *Inspection Time:* ${booking.preferredTime || 'Morning Slot'}
${booking.message ? `💬 *Site Notes:* ${booking.message}\n` : ''}━━━━━━━━━━━━━━━━━━━━━
✅ *Status:* Confirmed & Dispatched to Technical Team
📞 *Direct Helpline:* +91 9949293872
📧 *Official Email:* tarsolutions55@gmail.com
🕒 *Timestamp:* ${now}
━━━━━━━━━━━━━━━━━━━━━
_Our chief engineer will visit your site for physical inspection and moisture analysis._`;
}

export function getWhatsAppDispatchUrl(targetPhone: string, receiptText: string): string {
  const cleanPhone = cleanIndianMobile(targetPhone);
  const fullNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  return `https://api.whatsapp.com/send?phone=${fullNumber}&text=${encodeURIComponent(receiptText)}`;
}

export function getSmsDispatchUrl(targetPhone: string, receiptText: string): string {
  const cleanPhone = cleanIndianMobile(targetPhone);
  const fullNumber = cleanPhone.length === 10 ? `+91${cleanPhone}` : cleanPhone;
  return `sms:${fullNumber}?body=${encodeURIComponent(receiptText)}`;
}
