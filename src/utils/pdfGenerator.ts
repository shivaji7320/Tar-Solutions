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

export interface WeeklyReportData {
  weekStart: string;
  weekEnd: string;
  targetDate?: string;
  totalBookings: number;
  metrics: {
    total: number;
    completed: number;
    confirmed: number;
    new: number;
    contacted: number;
    cancelled: number;
    pending: number;
  };
  totalCustomers: number;
  newCustomersThisWeek: number;
  topServices: Array<{ serviceName: string; count: number; percentage: number }>;
  dailyBreakdown: Array<{
    dayIndex: number;
    dayName: string;
    date: string;
    count: number;
    completed: number;
    confirmed: number;
    pending: number;
  }>;
  bookings: Booking[];
}

export function generateWeeklyReportPdf(
  report: WeeklyReportData,
  businessInfo?: {
    fullName?: string;
    phone?: string;
    email?: string;
    location?: string;
  }
): jsPDF {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const companyName = businessInfo?.fullName || 'TAR Civil & Waterproofing Experts Solutions';
  const companyPhone = businessInfo?.phone || '9949293872';
  const companyEmail = businessInfo?.email || 'tarsolutions55@gmail.com';
  const companyLoc = businessInfo?.location || 'Hyderabad, Telangana, India';

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
  doc.text('OFFICIAL WEEKLY BUSINESS & DATA REPORT', 14, 25);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Location: ${companyLoc}  |  Phone: ${companyPhone}  |  Email: ${companyEmail}`, 115, 25);

  // Meta Banner
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Reporting Period: ${report.weekStart} to ${report.weekEnd} (Monday - Sunday)`, 14, 43);
  doc.text(
    `Report Generated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
    205,
    43
  );

  // Executive KPI Summary Table
  autoTable(doc, {
    startY: 47,
    head: [['Total Bookings', 'Completed Jobs', 'Confirmed', 'Pending / New', 'Cancelled', 'Total Customers in DB', 'New Customers This Week']],
    body: [[
      String(report.totalBookings || 0),
      String(report.metrics?.completed || 0),
      String(report.metrics?.confirmed || 0),
      String(report.metrics?.pending || 0),
      String(report.metrics?.cancelled || 0),
      String(report.totalCustomers || 0),
      String(report.newCustomersThisWeek || 0)
    ]],
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 9
    },
    bodyStyles: {
      halign: 'center',
      fontStyle: 'bold',
      fontSize: 11,
      textColor: [37, 99, 235]
    },
    margin: { left: 14, right: 14 }
  });

  // Daily Breakdown Table
  const dailyTableData = (report.dailyBreakdown || []).map((d) => [
    d.dayName,
    d.date,
    String(d.count),
    String(d.completed),
    String(d.confirmed),
    String(d.pending)
  ]);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 6,
    head: [['Day of Week', 'Date', 'Total Bookings', 'Completed', 'Confirmed', 'Pending / Inquiries']],
    body: dailyTableData,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 14, right: 14 }
  });

  // Top Requested Services
  if (report.topServices && report.topServices.length > 0) {
    const serviceTableData = report.topServices.slice(0, 5).map((s, i) => [
      `#${i + 1}`,
      s.serviceName,
      String(s.count),
      `${s.percentage}%`
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 6,
      head: [['Rank', 'Most Requested Service', 'Weekly Bookings', 'Share (%)']],
      body: serviceTableData,
      theme: 'grid',
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [51, 65, 85]
      },
      margin: { left: 14, right: 14 }
    });
  }

  // Itemized Bookings Table
  const bookings = report.bookings || [];
  if (bookings.length > 0) {
    const tableData = bookings.map((b, idx) => [
      b.bookingCode || `TAR-${idx + 1}`,
      b.customerName,
      b.phone,
      b.service,
      b.location,
      b.workDate,
      b.preferredTime || 'Any Time',
      b.status
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 6,
      head: [['Booking ID', 'Customer Name', 'Phone', 'Service', 'Location', 'Work Date', 'Slot', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [11, 27, 61],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [51, 65, 85]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
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
      `TAR Civil & Waterproofing Experts Solutions • Weekly Business Data Audit • Period: ${report.weekStart} to ${report.weekEnd} • Page ${i} of ${pageCount}`,
      148,
      200,
      { align: 'center' }
    );
  }

  return doc;
}

export function downloadWeeklyPdf(report: WeeklyReportData, businessInfo?: any) {
  const doc = generateWeeklyReportPdf(report, businessInfo);
  doc.save(`TAR_Weekly_Business_Report_${report.weekStart}_to_${report.weekEnd}.pdf`);
}

export function exportWeeklyReportToCsv(report: WeeklyReportData) {
  const lines: string[] = [];

  // Header information
  lines.push('TAR SOLUTIONS — WEEKLY BUSINESS & BOOKINGS AUDIT REPORT');
  lines.push(`Period,${report.weekStart},to,${report.weekEnd}`);
  lines.push(`Generated On,${new Date().toISOString()}`);
  lines.push('');

  // Metrics
  lines.push('EXECUTIVE METRICS SUMMARY');
  lines.push(`Total Bookings,${report.totalBookings}`);
  lines.push(`Completed Jobs,${report.metrics?.completed || 0}`);
  lines.push(`Confirmed Bookings,${report.metrics?.confirmed || 0}`);
  lines.push(`Pending / New Bookings,${report.metrics?.pending || 0}`);
  lines.push(`Cancelled Bookings,${report.metrics?.cancelled || 0}`);
  lines.push(`Total Customers in Database,${report.totalCustomers}`);
  lines.push(`New Customers Registered This Week,${report.newCustomersThisWeek}`);
  lines.push('');

  // Daily breakdown
  lines.push('DAILY ACTIVITY BREAKDOWN');
  lines.push('Day,Date,Total Bookings,Completed,Confirmed,Pending');
  for (const d of report.dailyBreakdown || []) {
    lines.push(`"${d.dayName}","${d.date}",${d.count},${d.completed},${d.confirmed},${d.pending}`);
  }
  lines.push('');

  // Top Services
  lines.push('TOP REQUESTED SERVICES');
  lines.push('Rank,Service Name,Count,Percentage');
  (report.topServices || []).forEach((s, idx) => {
    lines.push(`${idx + 1},"${s.serviceName.replace(/"/g, '""')}",${s.count},${s.percentage}%`);
  });
  lines.push('');

  // Itemized bookings
  lines.push('ITEMIZED BOOKINGS LIST');
  lines.push('Booking ID,Customer Name,Phone,Email,Service,Location,Work Date,Slot,Status,Notes');
  for (const b of report.bookings || []) {
    const row = [
      b.bookingCode || '',
      `"${(b.customerName || '').replace(/"/g, '""')}"`,
      b.phone || '',
      b.email || '',
      `"${(b.service || '').replace(/"/g, '""')}"`,
      `"${(b.location || '').replace(/"/g, '""')}"`,
      b.workDate || '',
      `"${(b.preferredTime || '').replace(/"/g, '""')}"`,
      b.status || '',
      `"${(b.message || b.notes || '').replace(/"/g, '""')}"`
    ];
    lines.push(row.join(','));
  }

  const csvContent = '\uFEFF' + lines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `TAR_Weekly_Report_${report.weekStart}_to_${report.weekEnd}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
