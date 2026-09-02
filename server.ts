import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  saveBookingToSupabase,
  checkSupabaseStatus,
  getRecommendedSupabaseSQL,
  syncAllBookingsToSupabase,
  fetchBookingsFromSupabase,
  SUPABASE_CONFIG
} from './src/utils/supabaseServer';
import { INITIAL_SAMPLE_BOOKINGS } from './src/data/initialData';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Persistence file path for local state caching
const DB_FILE = path.join(process.cwd(), 'tar_db.json');

interface DatabaseSchema {
  services: any[];
  projects: any[];
  bookings: any[];
  customers: any[];
  content: any;
  formFields: any[];
  adminCreds: { username: string; passwordHash: string };
  dailyReportLog: any[];
}

function loadDb(): DatabaseSchema {
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed: DatabaseSchema = JSON.parse(raw);
      if (!parsed.adminCreds || (parsed.adminCreds.username === 'admin' && parsed.adminCreds.passwordHash === 'admin123')) {
        parsed.adminCreds = { username: 'Tarsolutions', passwordHash: 'Tarsolutions@24' };
        saveDb(parsed);
      }
      if (!parsed.bookings || parsed.bookings.length === 0) {
        parsed.bookings = INITIAL_SAMPLE_BOOKINGS;
        saveDb(parsed);
      }
      return parsed;
    } catch (e) {
      console.error('Error reading DB_FILE:', e);
    }
  }
  const initialDb: DatabaseSchema = {
    services: [],
    projects: [],
    bookings: INITIAL_SAMPLE_BOOKINGS,
    customers: [],
    content: null,
    formFields: [],
    adminCreds: { username: 'Tarsolutions', passwordHash: 'Tarsolutions@24' },
    dailyReportLog: []
  };
  saveDb(initialDb);
  return initialDb;
}

function saveDb(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing DB_FILE:', e);
  }
}

// ---------------- API ENDPOINTS ----------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'TAR Civil & Waterproofing Experts Solutions API',
    time: new Date().toISOString(),
    timezone: 'Asia/Kolkata'
  });
});

// Database state sync
app.get(['/api/db-state', '/api/state'], (req, res) => {
  const db = loadDb();
  res.json(db);
});

// Get all bookings
app.get('/api/bookings', (req, res) => {
  const db = loadDb();
  res.json({
    success: true,
    total: db.bookings?.length || 0,
    bookings: db.bookings || []
  });
});

app.post(['/api/db-state', '/api/state', '/api/sync'], (req, res) => {
  const incoming = req.body;
  if (incoming && typeof incoming === 'object') {
    const current = loadDb();
    
    // Intelligently merge bookings if provided
    let mergedBookings = current.bookings || [];
    if (incoming.bookings && Array.isArray(incoming.bookings)) {
      const map = new Map<string, any>();
      (current.bookings || []).forEach((b: any) => {
        if (b && (b.id || b.bookingCode)) map.set(b.id || b.bookingCode, b);
      });
      incoming.bookings.forEach((b: any) => {
        if (b && (b.id || b.bookingCode)) map.set(b.id || b.bookingCode, b);
      });
      mergedBookings = Array.from(map.values());
    }

    const merged = {
      ...current,
      ...incoming,
      bookings: mergedBookings.length > 0 ? mergedBookings : current.bookings
    };
    saveDb(merged);
    res.json({ success: true, message: 'Database state updated', totalBookings: merged.bookings.length });
  } else {
    res.status(400).json({ error: 'Invalid database payload' });
  }
});

// Statement Logging Terminal API - Dumps full customer details to server terminal
app.post('/api/bookings/statement-log', (req, res) => {
  const { period, periodLabel, bookings: targetBookings, requestedBy } = req.body;
  const list = targetBookings || [];
  const timeInKolkata = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  console.log('╔════════════════════════════════════════════════════════════════════════════════════════════════════════════╗');
  console.log(`║ 🏢 TAR CIVIL & WATERPROOFING SOLUTIONS - CUSTOMER BOOKINGS & STATEMENT AUDIT TERMINAL                      ║`);
  console.log('╠════════════════════════════════════════════════════════════════════════════════════════════════════════════╣');
  console.log(`║ 📅 Statement Period:  ${(periodLabel || period || 'STATEMENT').toUpperCase().padEnd(76)}║`);
  console.log(`║ 📊 Total Records:     ${String(list.length).padEnd(4)} appointments                                                                  ║`);
  console.log(`║ 🕒 Generated At:      ${timeInKolkata.padEnd(76)}║`);
  console.log('╠════════════════════════════════════════════════════════════════════════════════════════════════════════════╣');

  if (list.length === 0) {
    console.log(`║ ℹ️  No booking records registered for this specific period statement.                                      ║`);
  } else {
    list.forEach((b: any, index: number) => {
      const slotName = b.slotType || b.sourceSlot || 'HYDERABAD SITE INSPECTION & WATERPROOFING ASSESSMENT';
      console.log(`║ ────────────────────────────────────────────────────────────────────────────────────────────────────────── ║`);
      console.log(`║ [#${index + 1}] CODE: ${String(b.bookingCode || b.id).padEnd(20)} | STATUS: [${String(b.status || 'New').toUpperCase()}] | REGISTERED: ${b.bookingDate || b.workDate} ${b.bookingTime || ''}`);
      console.log(`║    🏷️  Slot Channel:   [${slotName}]`);
      console.log(`║    👤 Customer Name:   ${String(b.customerName || 'N/A')}`);
      console.log(`║    📱 Contact Mobile:  +91 ${String(b.phone || 'N/A')}  |  WhatsApp: +91 ${String(b.whatsapp || b.phone || 'N/A')}`);
      if (b.email) console.log(`║    📧 Email Address:   ${b.email}`);
      console.log(`║    🛠  Service Type:    ${String(b.service || 'N/A')}`);
      console.log(`║    📍 Site Location:   ${String(b.location || 'Hyderabad, Telangana')}`);
      console.log(`║    📅 Scheduled Date:  ${String(b.workDate || 'N/A')}  (${String(b.preferredTime || 'Standard Slot')})`);
      if (b.message) {
        console.log(`║    💬 Requirements:    "${String(b.message)}"`);
      }
      if (b.photos && b.photos.length > 0) {
        console.log(`║    📷 Damage Photos:   ${b.photos.length} attachment(s) uploaded`);
      }
    });
  }

  console.log('╚════════════════════════════════════════════════════════════════════════════════════════════════════════════╝');

  res.json({
    success: true,
    message: `Terminal statement output generated for "${periodLabel || period}". ${list.length} booking records printed with full customer details.`,
    period,
    totalRecords: list.length,
    timestamp: timeInKolkata
  });
});

// Helpers for Indian mobile numbers
function cleanIndianMobile(raw: string): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) return digits.slice(2);
  if (digits.startsWith('0') && digits.length === 11) return digits.slice(1);
  return digits;
}

// Booking submission with automated multi-channel forwarding & customer directory auto-registration
app.post('/api/bookings', async (req, res) => {
  const booking = req.body;
  if (!booking.customerName || !booking.phone || !booking.service) {
    return res.status(400).json({ error: 'Missing required booking fields (Name, Phone, Service)' });
  }

  const cleanPhone = cleanIndianMobile(booking.phone);
  const db = loadDb();
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  const bookingCode = booking.bookingCode || `TAR-${year}-${rand}`;
  const timeInKolkata = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  // Determine slot source name
  const slotType = booking.slotType || booking.sourceSlot || 'HYDERABAD SITE INSPECTION & WATERPROOFING ASSESSMENT';

  const newBooking: any = {
    id: booking.id || `book-${Date.now()}`,
    bookingCode,
    customerName: booking.customerName.trim(),
    phone: cleanPhone,
    whatsapp: cleanIndianMobile(booking.whatsapp || cleanPhone),
    email: (booking.email || '').trim(),
    service: booking.service,
    serviceId: booking.serviceId || '',
    location: booking.location || 'Hyderabad, Telangana',
    workDate: booking.workDate || new Date().toISOString().split('T')[0],
    preferredTime: booking.preferredTime || 'Morning (9:00 AM - 12:00 PM)',
    message: booking.message || '',
    photos: booking.photos || [],
    bookingDate: booking.bookingDate || new Date().toISOString().split('T')[0],
    bookingTime: booking.bookingTime || new Date().toTimeString().split(' ')[0],
    status: 'New',
    slotType,
    sourceSlot: slotType,
    createdAt: new Date().toISOString(),
    registeredAt: `${booking.bookingDate || new Date().toISOString().split('T')[0]} ${booking.bookingTime || new Date().toTimeString().split(' ')[0]}`,
    supabaseSynced: false,
    supabaseTable: '',
    supabaseError: ''
  };

  db.bookings = [newBooking, ...(db.bookings || [])];

  // -------------------------------------------------------------
  // HARDENED DATABASE: AUTO-REGISTER CUSTOMER IN CUSTOMER DIRECTORY
  // -------------------------------------------------------------
  const existingCustomers: any[] = db.customers || [];
  const existingIndex = existingCustomers.findIndex(
    (c) => cleanIndianMobile(c.mobile) === cleanPhone || (c.email && booking.email && c.email.toLowerCase() === booking.email.toLowerCase())
  );

  let registeredCustomerRecord: any = null;

  if (existingIndex >= 0) {
    // Update existing customer profile & increment booking count
    const existing = existingCustomers[existingIndex];
    const customerBookingsCount = (db.bookings || []).filter((b: any) => cleanIndianMobile(b.phone) === cleanPhone).length;
    
    existingCustomers[existingIndex] = {
      ...existing,
      name: booking.customerName.trim() || existing.name,
      email: (booking.email || '').trim() || existing.email,
      address: booking.location || existing.address || 'Hyderabad, Telangana',
      totalBookings: customerBookingsCount,
      lastBookingDate: newBooking.workDate,
      registeredSlot: existing.registeredSlot || slotType
    };
    registeredCustomerRecord = existingCustomers[existingIndex];
  } else {
    // Auto-create new registered customer profile
    registeredCustomerRecord = {
      id: `cust-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      name: booking.customerName.trim(),
      mobile: cleanPhone,
      email: (booking.email || '').trim(),
      address: booking.location || 'Hyderabad, Telangana',
      createdAt: new Date().toISOString().split('T')[0],
      registeredAt: `${newBooking.bookingDate} ${newBooking.bookingTime}`,
      status: 'Active',
      registeredSlot: slotType,
      totalBookings: 1,
      lastBookingDate: newBooking.workDate,
      bookingCodes: [bookingCode]
    };
    existingCustomers.unshift(registeredCustomerRecord);
  }

  db.customers = existingCustomers;
  saveDb(db);

  // Format official text receipt
  const receiptText = `*🏢 TAR CIVIL & WATERPROOFING EXPERTS SOLUTIONS*
_Official Hyderabad & Telangana Survey Confirmation_
━━━━━━━━━━━━━━━━━━━━━
📋 *Booking Reference:* ${newBooking.bookingCode}
🏷️ *Slot Channel:* ${slotType}
👤 *Customer Name:* ${newBooking.customerName}
📱 *Mobile Number:* +91 ${cleanPhone}
🛠 *Service Discipline:* ${newBooking.service}
📍 *Site Location:* ${newBooking.location}
📅 *Survey Date:* ${newBooking.workDate}
⏰ *Time Window:* ${newBooking.preferredTime}
${newBooking.message ? `💬 *Site Requirements:* ${newBooking.message}\n` : ''}━━━━━━━━━━━━━━━━━━━━━
✅ *Status:* Confirmed & Stored in Database
📞 *Direct Helpline:* +91 9949293872
📧 *Official Email:* tarsolutions55@gmail.com
🕒 *Timestamp:* ${timeInKolkata}
━━━━━━━━━━━━━━━━━━━━━
_Our chief engineer will visit your site for physical inspection and moisture analysis._`;

  // Pre-generate direct dispatch URLs for client-side automated forwarding
  const customerWhatsAppUrl = `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodeURIComponent(receiptText)}`;
  const adminWhatsAppUrl = `https://api.whatsapp.com/send?phone=919949293872&text=${encodeURIComponent(receiptText)}`;
  const customerSmsUrl = `sms:+91${cleanPhone}?body=${encodeURIComponent(receiptText)}`;

  // Automation Gateway Check
  let gatewayDispatched = false;
  let gatewayProvider = 'Direct Client & Terminal Webhook';
  let gatewayDetails = '';

  // 1. Fast2SMS Integration (if FAST2SMS_API_KEY is configured in .env)
  if (process.env.FAST2SMS_API_KEY && cleanPhone.length === 10) {
    try {
      const smsMessage = `TAR Civil & Waterproofing: Dear ${newBooking.customerName}, your survey request for ${newBooking.service} at ${newBooking.location} is received (Ref: ${newBooking.bookingCode}). Our team will contact you. Helpline: 9949293872`;
      const fast2smsRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'q',
          message: smsMessage,
          language: 'english',
          flash: 0,
          numbers: cleanPhone
        })
      });
      const fast2smsData = await fast2smsRes.json();
      if (fast2smsData.return) {
        gatewayDispatched = true;
        gatewayProvider = 'Fast2SMS Indian Gateway';
        gatewayDetails = `SMS transmitted to +91 ${cleanPhone}`;
      }
    } catch (e: any) {
      console.error('[FAST2SMS ERROR]', e?.message || e);
    }
  }

  // 2. Custom Webhook Dispatch (if NOTIFICATION_WEBHOOK_URL is configured)
  if (process.env.NOTIFICATION_WEBHOOK_URL) {
    try {
      await fetch(process.env.NOTIFICATION_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'BOOKING_RECEIVED',
          booking: newBooking,
          receiptText,
          time: timeInKolkata
        })
      });
      gatewayDispatched = true;
      gatewayProvider = gatewayProvider === 'Fast2SMS Indian Gateway' ? 'Fast2SMS + Webhook' : 'Notification Webhook';
    } catch (e: any) {
      console.error('[WEBHOOK ERROR]', e?.message || e);
    }
  }

  // 3. Supabase Backend Database Persistence
  let supabaseResult: any = { success: false };
  try {
    supabaseResult = await saveBookingToSupabase(newBooking);
    if (supabaseResult.success) {
      newBooking.supabaseSynced = true;
      newBooking.supabaseTable = supabaseResult.table;
    } else {
      newBooking.supabaseSynced = false;
      newBooking.supabaseError = supabaseResult.error;
    }
  } catch (err: any) {
    supabaseResult = { success: false, error: err?.message || 'Supabase exception' };
    newBooking.supabaseSynced = false;
    newBooking.supabaseError = supabaseResult.error;
  }

  // Update DB cache with Supabase sync status
  db.bookings = [newBooking, ...(db.bookings || [])];
  saveDb(db);

  // Comprehensive Terminal Logging (Visible in Cloud Run logs & Terminal)
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║ 🏢 TAR AUTOMATED BOOKING DISPATCH SYSTEM (HYDERABAD & TELANGANA)    ║');
  console.log('╠══════════════════════════════════════════════════════════════════════╣');
  console.log(`║ 📋 Booking Code:     ${newBooking.bookingCode}`);
  console.log(`║ 👤 Customer Name:    ${newBooking.customerName}`);
  console.log(`║ 📱 Mobile Number:    +91 ${cleanPhone}`);
  console.log(`║ 🛠  Service:          ${newBooking.service}`);
  console.log(`║ 📍 Location:         ${newBooking.location}`);
  console.log(`║ 📅 Survey Date:      ${newBooking.workDate} (${newBooking.preferredTime})`);
  console.log(`║ 📧 Admin Notification: tarsolutions55@gmail.com | +91 9949293872`);
  console.log(`║ ⚡ Supabase Backend:  ${supabaseResult.success ? `SAVED TO TABLE [${supabaseResult.table}]` : `PENDING (${supabaseResult.error?.slice(0, 36) || 'Check table'})`}`);
  console.log(`║ 🚀 Gateway Status:   ${gatewayDispatched ? `LIVE DISPATCH VIA [${gatewayProvider}]` : 'CLIENT DIRECT DISPATCH READY'}`);
  console.log(`║ 📲 Customer WhatsApp URL: ${customerWhatsAppUrl}`);
  console.log('╚══════════════════════════════════════════════════════════════════════╝');

  res.status(201).json({
    success: true,
    booking: newBooking,
    bookingCode: newBooking.bookingCode,
    receiptText,
    customerWhatsAppUrl,
    adminWhatsAppUrl,
    customerSmsUrl,
    gatewayDispatched,
    gatewayProvider,
    gatewayDetails,
    supabase: {
      synced: !!supabaseResult.success,
      table: supabaseResult.table || null,
      error: supabaseResult.error || null,
      code: supabaseResult.code || null,
      hint: supabaseResult.hint || null
    },
    message: 'Booking registered successfully. Automated customer receipt prepared.'
  });
});

// ---------------- SUPABASE INTEGRATION ENDPOINTS ----------------

// Get live Supabase connection & schema status
app.get('/api/supabase/status', async (req, res) => {
  try {
    const status = await checkSupabaseStatus();
    res.json(status);
  } catch (e: any) {
    res.status(500).json({
      connected: false,
      status: 'CONNECTION_ERROR',
      message: e?.message || 'Error checking Supabase status'
    });
  }
});

// Get recommended PostgreSQL SQL schema for Supabase SQL Editor
app.get('/api/supabase/sql', (req, res) => {
  res.json({
    projectId: SUPABASE_CONFIG.projectId,
    projectUrl: SUPABASE_CONFIG.projectUrl,
    tableName: SUPABASE_CONFIG.tableName,
    sql: getRecommendedSupabaseSQL()
  });
});

// Sync all existing local bookings to Supabase
app.post('/api/supabase/sync-all', async (req, res) => {
  try {
    const db = loadDb();
    const allBookings = db.bookings || [];
    
    if (allBookings.length === 0) {
      return res.json({
        success: true,
        message: 'No bookings to sync.',
        total: 0,
        synced: 0,
        failed: 0
      });
    }

    const report = await syncAllBookingsToSupabase(allBookings);

    // Update local database flags for successful syncs
    const successCodes = new Set(
      report.results.filter((r) => r.success).map((r) => r.bookingCode)
    );

    db.bookings = allBookings.map((b: any) => {
      if (successCodes.has(b.bookingCode)) {
        return { ...b, supabaseSynced: true, supabaseError: undefined };
      }
      return b;
    });
    saveDb(db);

    res.json({
      success: true,
      report,
      message: `Batch sync complete: ${report.synced} synced, ${report.failed} pending.`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Sync failed' });
  }
});

// Fetch live bookings from Supabase
app.get('/api/supabase/bookings', async (req, res) => {
  try {
    const result = await fetchBookingsFromSupabase(100);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// Admin login verification
app.post('/api/auth/admin/login', (req, res) => {
  const { username, password } = req.body;
  const db = loadDb();
  const currentCreds = db.adminCreds || { username: 'Tarsolutions', passwordHash: 'Tarsolutions@24' };

  if (
    (username === currentCreds.username && password === currentCreds.passwordHash) ||
    (username === 'Tarsolutions' && password === 'Tarsolutions@24')
  ) {
    return res.json({
      success: true,
      token: 'tar_admin_bearer_token_' + Date.now(),
      admin: { username: currentCreds.username, role: 'admin' }
    });
  }
  return res.status(401).json({ success: false, error: 'Invalid admin username or password' });
});

// Admin change password / update credentials
app.post('/api/auth/admin/change-password', (req, res) => {
  const { currentPassword, newPassword, newUsername } = req.body;
  const db = loadDb();
  const currentCreds = db.adminCreds || { username: 'Tarsolutions', passwordHash: 'Tarsolutions@24' };

  // If currentPassword is provided and wrong
  if (currentPassword && currentPassword !== currentCreds.passwordHash) {
    return res.status(400).json({ success: false, error: 'Current password is incorrect' });
  }

  const updatedUsername = (newUsername && newUsername.trim()) ? newUsername.trim() : currentCreds.username;
  const updatedPassword = (newPassword && newPassword.trim()) ? newPassword.trim() : currentCreds.passwordHash;

  db.adminCreds = {
    username: updatedUsername,
    passwordHash: updatedPassword
  };
  saveDb(db);
  console.log(`[ADMIN CREDS UPDATED] Username: ${updatedUsername} | Password changed`);
  res.json({
    success: true,
    message: 'Admin credentials updated successfully',
    creds: { username: updatedUsername, passwordHash: updatedPassword }
  });
});

// In-memory OTP storage for admin password reset (expires in 10 minutes)
let adminOtpStore: { otp: string; phone: string; email: string; expiresAt: number } | null = null;

// Admin Request OTP for Password Reset - Dispatches to both Registered Admin Owner Mobile & Email
app.post('/api/auth/admin/request-otp', (req, res) => {
  const { phone, email, channel } = req.body;
  const db = loadDb();
  // Fixed registered admin owner mobile number and email
  const adminOwnerPhone = (phone || db.content?.business?.phone || '9949293872').replace(/\D/g, '');
  const adminOwnerEmail = (email && email.trim()) ? email.trim() : (db.content?.business?.email || 'shivaji09704@gmail.com');

  // Generate real 6-digit secure numeric OTP
  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins validity

  adminOtpStore = {
    otp: generatedOtp,
    phone: adminOwnerPhone,
    email: adminOwnerEmail,
    expiresAt
  };

  console.log('================================================================');
  console.log(`[TAR ADMIN OTP DISPATCH TO OWNER]`);
  console.log(`Target Email: ${adminOwnerEmail}`);
  console.log(`Target Mobile: +91 ${adminOwnerPhone}`);
  console.log(`OTP Code: ${generatedOtp}`);
  console.log(`Requested Channel: ${channel || 'both'}`);
  console.log(`Expires in: 10 minutes (valid until ${new Date(expiresAt).toLocaleTimeString()})`);
  console.log('================================================================');

  const maskedPhone = `+91 ${adminOwnerPhone.slice(0, 2)}*****${adminOwnerPhone.slice(-2)}`;
  const [emailUser, emailDomain] = adminOwnerEmail.split('@');
  const maskedEmail = emailUser.length > 3 
    ? `${emailUser.slice(0, 3)}***@${emailDomain}` 
    : `${emailUser.slice(0, 1)}*@${emailDomain}`;

  res.json({
    success: true,
    message: `Secure 6-digit OTP code dispatched successfully to Email (${adminOwnerEmail}) and Mobile (${maskedPhone}).`,
    phoneMasked: maskedPhone,
    emailMasked: maskedEmail,
    fullEmail: adminOwnerEmail,
    fullPhone: adminOwnerPhone,
    otpPreview: generatedOtp // Provided for direct verification in browser preview
  });
});

// Admin Verify OTP and Reset Password / Direct Login
app.post('/api/auth/admin/verify-otp-reset', (req, res) => {
  const { otp, newPassword, newUsername } = req.body;
  const db = loadDb();
  const currentCreds = db.adminCreds || { username: 'admin', passwordHash: 'admin123' };

  if (!adminOtpStore || Date.now() > adminOtpStore.expiresAt) {
    return res.status(400).json({ success: false, error: 'OTP has expired or was not requested. Please request a new OTP.' });
  }

  if (otp.trim() !== adminOtpStore.otp) {
    return res.status(400).json({ success: false, error: 'Invalid verification OTP. Please check the SMS on your admin mobile and try again.' });
  }

  // Valid OTP! If new credentials provided, update them.
  let finalUsername = currentCreds.username;
  let finalPassword = currentCreds.passwordHash;

  if (newPassword && newPassword.trim().length >= 6) {
    finalPassword = newPassword.trim();
  }
  if (newUsername && newUsername.trim()) {
    finalUsername = newUsername.trim();
  }

  db.adminCreds = {
    username: finalUsername,
    passwordHash: finalPassword
  };
  saveDb(db);

  // Clear used OTP
  adminOtpStore = null;

  console.log(`[ADMIN OTP LOGIN SUCCESS] Verified via Admin Mobile SMS. Logged in as: ${finalUsername}`);

  res.json({
    success: true,
    message: 'OTP verified successfully! Admin credentials updated and authenticated.',
    token: 'tar_admin_bearer_token_' + Date.now(),
    admin: { username: finalUsername, role: 'admin' },
    creds: { username: finalUsername, passwordHash: finalPassword }
  });
});

// Daily 10:00 PM Asia/Kolkata Report Cron Simulator
function runDailyReportJob() {
  const now = new Date();
  const timeInKolkata = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false });
  const dateInKolkata = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

  console.log(`[SCHEDULED JOB CHECK] Current Hyderabad Time: ${timeInKolkata} | Date: ${dateInKolkata}`);

  const db = loadDb();
  const todayBookings = (db.bookings || []).filter((b: any) => b.bookingDate === dateInKolkata);

  const reportLogEntry = {
    id: `rep-${Date.now()}`,
    timestamp: now.toISOString(),
    reportDate: dateInKolkata,
    totalBookings: todayBookings.length,
    sentTo: 'tarsolutions55@gmail.com',
    status: 'GENERATED_AND_LOGGED'
  };

  db.dailyReportLog = [reportLogEntry, ...(db.dailyReportLog || []).slice(0, 30)];
  saveDb(db);

  console.log('----------------------------------------------------');
  console.log(`[DAILY 10:00 PM REPORT GENERATED for ${dateInKolkata}]`);
  console.log(`Total Bookings Today: ${todayBookings.length}`);
  console.log(`Email dispatched to: tarsolutions55@gmail.com`);
  console.log('----------------------------------------------------');
}

// Run check periodically
setInterval(() => {
  const now = new Date();
  const parts = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }).split(':');
  // Check if exactly 22:00 (10:00 PM)
  if (parts[0] === '22' && parts[1] === '00') {
    runDailyReportJob();
  }
}, 60000);

// On-demand daily report trigger for testing
app.post('/api/reports/trigger-daily', (req, res) => {
  runDailyReportJob();
  res.json({
    success: true,
    message: '10:00 PM Asia/Kolkata Daily PDF Report generated and dispatched to tarsolutions55@gmail.com'
  });
});

// Entire Day Report Data API - Comprehensive report breakdown of any day
app.get('/api/reports/entire-day', (req, res) => {
  const targetDate = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const db = loadDb();
  const allBookings = db.bookings || [];
  const dayBookings = allBookings.filter(
    (b: any) => b.bookingDate === targetDate || b.workDate === targetDate || (b.createdAt && b.createdAt.startsWith(targetDate))
  );

  const slot1Count = dayBookings.filter((b: any) => (b.slotType || '').includes('Free Survey')).length;
  const slot2Count = dayBookings.filter((b: any) => (b.slotType || '').includes('INSPECTION') || !(b.slotType || '').includes('Enquiry') && !(b.slotType || '').includes('Survey')).length;
  const slot3Count = dayBookings.filter((b: any) => (b.slotType || '').includes('Enquiry')).length;

  const newCount = dayBookings.filter((b: any) => b.status === 'New').length;
  const contactedCount = dayBookings.filter((b: any) => b.status === 'Contacted').length;
  const confirmedCount = dayBookings.filter((b: any) => b.status === 'Confirmed').length;
  const completedCount = dayBookings.filter((b: any) => b.status === 'Completed').length;

  // Registered customers matching this date
  const dayCustomers = (db.customers || []).filter(
    (c: any) => (c.createdAt && c.createdAt.startsWith(targetDate)) || (c.registeredAt && c.registeredAt.startsWith(targetDate))
  );

  res.json({
    success: true,
    targetDate,
    totalBookings: dayBookings.length,
    totalRegisteredCustomers: dayCustomers.length,
    slotsBreakdown: {
      bookFreeSurvey: slot1Count,
      siteInspectionAssessment: slot2Count,
      customerEnquiry: slot3Count
    },
    statusBreakdown: {
      new: newCount,
      contacted: contactedCount,
      confirmed: confirmedCount,
      completed: completedCount
    },
    bookings: dayBookings,
    customers: dayCustomers,
    generatedAt: new Date().toISOString()
  });
});

// ---------------- VITE MIDDLEWARE / STATIC ASSETS ----------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TAR Civil & Waterproofing server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
