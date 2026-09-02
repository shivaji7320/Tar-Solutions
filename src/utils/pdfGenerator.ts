import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Booking } from '../types';

export function generateDailyBookingPdf(
  bookings: Booking[],
  reportDateStr?: string,
  businessInfo?: {
    name: string;
    fullName: string;
    phone: string;
    email: string;
    location: string;
  }
): jsPDF {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const targetDate = reportDateStr || new Date().toISOString().split('T')[0];
  const companyName = businessInfo?.fullName || 'TAR Civil & Waterproofing Experts Solutions';
  const companyPhone = businessInfo?.phone || '9949293872';
  const companyEmail = businessInfo?.email || 'tarsolutions55@gmail.com';
  const companyLoc = businessInfo?.location || 'Hyderabad, Telangana, India';

  // Filter bookings for target date
  const filteredBookings = (bookings || []).filter(b => b && b.bookingDate === targetDate);

  // Header Banner
  doc.setFillColor(11, 27, 61); // Navy #0B1B3D
  doc.rect(0, 0, 297, 34, 'F');

  // Decorative blue accent line
  doc.setFillColor(37, 99, 235); // Blue #2563EB
  doc.rect(0, 34, 297, 2, 'F');

  // Title & Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('TAR', 14, 13);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('CIVIL & WATERPROOFING EXPERTS SOLUTIONS', 32, 13);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DAILY BOOKING REPORT', 14, 25);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Location: ${companyLoc}  |  Phone: ${companyPhone}  |  Email: ${companyEmail}`, 105, 25);

  // Report Meta Box
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Report Date: ${targetDate} (Asia/Kolkata)`, 14, 44);
  doc.text(`Total Bookings Today: ${filteredBookings.length}`, 180, 44);
  doc.text(`Generated At: ${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}`, 240, 44);

  if (filteredBookings.length === 0) {
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, 52, 269, 30, 3, 3, 'F');
    doc.setFontSize(14);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('No bookings today.', 148, 69, { align: 'center' });
  } else {
    const tableData = filteredBookings.map((b, idx) => [
      b.bookingCode || `TAR-${idx + 1}`,
      b.customerName,
      b.phone,
      b.whatsapp || b.phone,
      b.email || 'N/A',
      b.service,
      b.location,
      b.workDate,
      b.preferredTime || 'Any Time',
      b.bookingTime || 'N/A',
      b.status,
      b.message ? (b.message.length > 40 ? b.message.substring(0, 37) + '...' : b.message) : 'None'
    ]);

    autoTable(doc, {
      startY: 50,
      head: [
        [
          'Booking ID',
          'Customer Name',
          'Phone',
          'WhatsApp',
          'Email',
          'Service',
          'Location',
          'Work Date',
          'Time Slot',
          'Booked At',
          'Status',
          'Message'
        ]
      ],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [11, 27, 61],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [30, 41, 59]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: 24, fontStyle: 'bold' },
        1: { cellWidth: 28 },
        2: { cellWidth: 22 },
        3: { cellWidth: 22 },
        4: { cellWidth: 28 },
        5: { cellWidth: 32 },
        6: { cellWidth: 26 },
        7: { cellWidth: 20 },
        8: { cellWidth: 24 },
        9: { cellWidth: 16 },
        10: { cellWidth: 18, halign: 'center' },
        11: { cellWidth: 28 }
      },
      margin: { left: 14, right: 14 }
    });
  }

  // Footer on all pages
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `TAR Civil & Waterproofing Experts Solutions • Hyderabad, Telangana • Automated Daily Booking Record • Page ${i} of ${pageCount}`,
      148,
      200,
      { align: 'center' }
    );
  }

  return doc;
}

export function downloadDailyPdf(bookings: Booking[], dateStr?: string) {
  const doc = generateDailyBookingPdf(bookings, dateStr);
  const targetDate = dateStr || new Date().toISOString().split('T')[0];
  doc.save(`TAR_Daily_Booking_Report_${targetDate}.pdf`);
}
