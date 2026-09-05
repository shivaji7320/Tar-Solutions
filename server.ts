import 'dotenv/config';

import express from 'express';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { createServer as createViteServer } from 'vite';

import {
  saveBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  saveCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  authenticateCustomer,
  saveCustomerRequest,
  getCustomerRequests,
  updateCustomerRequest,
  deleteCustomerRequest,
  saveBookingStatusHistory,
  getBookingStatusHistory,
  cleanupExpiredRecords,
  getStorageStatus,
  getBookingsWithStatementFilter,
  getRegisteredCustomersDirectory,
  loadDb,
  saveDb,
  onStorageChange,
  cleanIndianMobile,
  generateBookingCode,
  StorageSchema,
  RETENTION_DAYS
} from './src/utils/storage';

/**
 * ============================================================
 * TAR SOLUTIONS — APPLICATION SERVER & PERSISTENT DATABASE ENGINE
 * ============================================================
 * Services: Civil, Waterproofing, Expansion Joints, Roof Sealing
 * Storage:  tar_db.json + In-Memory Store with Concurrency Locking
 * Region:   Hyderabad, Telangana (BOM1 Network Gateway)
 * Retention: 7-Day Rolling Retention Horizon
 * ============================================================
 */
console.log('╔══════════════════════════════════════════════════════════════════════╗');
console.log('║ TAR SOLUTIONS — APPLICATION SERVER ACTIVE                            ║');
console.log('╠══════════════════════════════════════════════════════════════════════╣');
console.log('║ System:      Customer Portal & Booking Engine Active                 ║');
console.log('║ Storage:     tar_db.json Persistent Store & In-Memory Engine         ║');
console.log('║ Retention:   7-Day Rolling Horizon Active                            ║');
console.log('╚══════════════════════════════════════════════════════════════════════╝');

const app = express();

const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * ============================================================
 * REAL-TIME LOCAL DATABASE PERSISTENCE (tar_db.json)
 * ============================================================
 */
const DB_FILE_PATH = path.join(process.cwd(), 'tar_db.json');

// Hydrate from tar_db.json on startup if present
if (fs.existsSync(DB_FILE_PATH)) {
  try {
    const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      saveDb(parsed);
      console.log(
        `[PERSISTENCE] Hydrated from tar_db.json: ${parsed.bookings?.length || 0} bookings, ${parsed.customers?.length || 0} customers, ${parsed.customerRequests?.length || 0} requests.`
      );
    }
  } catch (e) {
    console.warn('[PERSISTENCE] Notice: Could not read existing tar_db.json:', e);
  }
}

// Auto-sync every in-memory mutation to tar_db.json immediately
onStorageChange((data) => {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[PERSISTENCE] Warning: unable to write tar_db.json to disk:', err);
  }
});

/**
 * Run automatic expiration check on startup.
 */
cleanupExpiredRecords(RETENTION_DAYS).catch((err) => {
  console.error('[STORAGE EXPIRATION INITIAL CHECK ERROR]', err);
});

/**
 * ============================================================
 * HEALTH
 * ============================================================
 */

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'TAR Civil & Waterproofing Experts Solutions API',
    storage: `Local JSON Storage (${RETENTION_DAYS}-Day Retention)`,
    time: new Date().toISOString(),
    timezone: 'Asia/Kolkata'
  });
});

/**
 * ============================================================
 * DATABASE STATE
 * ============================================================
 */

app.get(['/api/db-state', '/api/state'], (_req, res) => {
  res.json(loadDb());
});

/**
 * ============================================================
 * BOOKINGS / STATEMENTS
 * ============================================================
 */

app.get(['/api/bookings', '/api/bookings/statement'], async (req, res) => {
  const period = (req.query.period || 'ALL') as any;
  const customFrom = req.query.from as string;
  const customTo = req.query.to as string;
  const customerId = (req.query.customerId || req.headers['x-customer-id']) as string | undefined;

  try {
    const result = await getBookingsWithStatementFilter(
      period,
      customFrom,
      customTo
    );

    if (customerId) {
      const cleanCust = String(customerId).trim();
      result.bookings = result.bookings.filter(
        (b: any) =>
          b.customerId === cleanCust ||
          b.customer_id === cleanCust ||
          (b.phone && cleanIndianMobile(b.phone) === cleanIndianMobile(cleanCust))
      );
      result.total = result.bookings.length;
    }

    res.json(result);
  } catch (error: any) {
    console.error('[BOOKINGS API ERROR]', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Error querying bookings'
    });
  }
});

/**
 * ============================================================
 * CUSTOMER DIRECTORY
 * ============================================================
 */

app.get('/api/customers', async (_req, res) => {
  try {
    const customers = await getRegisteredCustomersDirectory();

    res.json({
      success: true,
      customers,
      count: customers.length
    });
  } catch (error: any) {
    console.error('[CUSTOMERS API ERROR]', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Error querying customers'
    });
  }
});

/**
 * ============================================================
 * BOOKING STATUS UPDATE
 * ============================================================
 */

app.patch(['/api/bookings/:id/status', '/api/bookings/:id'], async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  if (updates.bookingStatus && !updates.status) {
    updates.status = updates.bookingStatus;
  }

  try {
    const updated = await updateBooking(id, updates);

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: `Booking with ID ${id} not found.`
      });
    }

    console.log(`[BOOKING UPDATE] ${id}: Updated fields: ${Object.keys(updates).join(', ')}`);

    res.json({
      success: true,
      id,
      status: updated.status,
      bookingStatus: updated.status,
      booking: updated
    });
  } catch (error: any) {
    console.error('[BOOKING UPDATE ERROR]', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to update booking.'
    });
  }
});

/**
 * ============================================================
 * DATABASE STATE SYNC
 * ============================================================
 */

app.post(['/api/db-state', '/api/state', '/api/sync'], (req, res) => {
  const incoming = req.body;

  if (!incoming || typeof incoming !== 'object') {
    return res.status(400).json({
      success: false,
      error: 'Invalid database payload'
    });
  }

  const current = loadDb();

  let mergedBookings = current.bookings || [];

  if (Array.isArray(incoming.bookings)) {
    const map = new Map<string, any>();
    for (const booking of current.bookings || []) {
      const key = booking?.id || booking?.bookingCode || booking?.booking_code;
      if (key) map.set(String(key), booking);
    }
    for (const booking of incoming.bookings) {
      const key = booking?.id || booking?.bookingCode || booking?.booking_code;
      if (key) map.set(String(key), booking);
    }
    mergedBookings = Array.from(map.values());
  }

  const merged: StorageSchema = {
    ...current,
    ...incoming,
    bookings: mergedBookings.length ? mergedBookings : current.bookings
  };

  saveDb(merged);

  res.json({
    success: true,
    message: 'Database state updated',
    totalBookings: merged.bookings.length
  });
});

/**
 * ============================================================
 * TERMINAL STATEMENT LOG
 * ============================================================
 */

app.post('/api/bookings/statement-log', (req, res) => {
  const { period, periodLabel, bookings: targetBookings } = req.body;
  const list = Array.isArray(targetBookings) ? targetBookings : [];

  const timeInKolkata = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata'
  });

  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║ TAR SOLUTIONS - CUSTOMER BOOKINGS STATEMENT                                ║');
  console.log('╠══════════════════════════════════════════════════════════════════════════════╣');
  console.log(`║ Statement Period: ${String(periodLabel || period || 'STATEMENT')}`);
  console.log(`║ Total Records: ${list.length}`);
  console.log(`║ Generated At: ${timeInKolkata}`);
  console.log('╠══════════════════════════════════════════════════════════════════════════════╣');

  if (!list.length) {
    console.log('║ No booking records found for this period.');
  }

  list.forEach((booking: any, index: number) => {
    console.log(`║ [${index + 1}] ${booking.bookingCode || booking.booking_code || booking.id}`);
    console.log(`║ Customer: ${booking.customerName || booking.customer_name || 'N/A'}`);
    console.log(`║ Phone: +91 ${booking.phone || 'N/A'}`);
    console.log(`║ Service: ${booking.service || booking.service_type || 'N/A'}`);
    console.log(`║ Location: ${booking.location || 'Hyderabad, Telangana'}`);
    console.log(`║ Status: ${booking.status || booking.bookingStatus || 'Pending'}`);
    console.log(`║ Date: ${booking.workDate || booking.work_date || 'N/A'}`);
    console.log('║ --------------------------------------------------------------------------');
  });

  console.log('╚══════════════════════════════════════════════════════════════════════════════╝');

  res.json({
    success: true,
    period,
    totalRecords: list.length,
    timestamp: timeInKolkata
  });
});

/**
 * ============================================================
 * BOOKING SUBMISSION
 * ============================================================
 */

app.post('/api/bookings', async (req, res) => {
  const incoming = req.body || {};

  const customerName = String(
    incoming.customerName || incoming.customer_name || ''
  ).trim();

  const phone = cleanIndianMobile(incoming.phone);

  const service = String(
    incoming.service || incoming.serviceType || incoming.service_type || ''
  ).trim();

  if (!customerName || !phone || phone.length !== 10 || !service) {
    return res.status(400).json({
      success: false,
      error: 'Name, valid 10-digit Indian mobile number and service are required.'
    });
  }

  const db = loadDb();
  const bookingCode = generateBookingCode(db.bookings);
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const currentTime = now.toISOString().slice(11, 19);

  const slotType = String(
    incoming.slotType ||
    incoming.sourceSlot ||
    incoming.sourceChannel ||
    'HYDERABAD SITE INSPECTION & WATERPROOFING ASSESSMENT'
  ).trim();

  const explicitCustId = String(
    incoming.customerId || incoming.customer_id || req.headers['x-customer-id'] || ''
  ).trim();

  let actualCustomerId = explicitCustId;
  let existingCustomer = null;

  if (explicitCustId) {
    existingCustomer = await getCustomerById(explicitCustId);
  }
  if (!existingCustomer && phone) {
    existingCustomer = await getCustomerById(phone);
  }

  if (existingCustomer) {
    actualCustomerId = existingCustomer.id;
    const currentCodes = Array.isArray(existingCustomer.bookingCodes) ? existingCustomer.bookingCodes : [];
    await updateCustomer(actualCustomerId, {
      totalBookings: (existingCustomer.totalBookings || 0) + 1,
      lastBookingDate: today,
      bookingCodes: Array.from(new Set([...currentCodes, bookingCode]))
    });
  } else {
    // Save/Update Customer in storage layer
    const customerId = explicitCustId || randomUUID();
    const customerRecord = {
      id: customerId,
      customerCode: `CA-CUST-${phone.slice(-5)}`,
      name: customerName,
      customerName: customerName,
      phone: phone,
      mobile: phone,
      alternatePhone: incoming.alternatePhone ? cleanIndianMobile(incoming.alternatePhone) : null,
      whatsapp: incoming.whatsapp ? cleanIndianMobile(incoming.whatsapp) : phone,
      email: incoming.email ? String(incoming.email).trim() : null,
      address: incoming.address || incoming.location || 'Hyderabad, Telangana',
      area: incoming.area || null,
      city: incoming.city || 'Hyderabad',
      state: incoming.state || 'Telangana',
      pincode: incoming.pincode || null,
      status: 'Active',
      registeredSlot: slotType,
      sourceChannel: slotType,
      totalBookings: 1,
      bookingCodes: [bookingCode],
      lastBookingDate: today,
      registeredAt: now.toISOString(),
      createdAt: now.toISOString()
    };

    const savedCustomer = await saveCustomer(customerRecord);
    actualCustomerId = savedCustomer.id || customerId;
  }

  // Build Booking Object
  const bookingId = randomUUID();
  const workDate = incoming.workDate || incoming.work_date || incoming.preferredDate || today;
  const preferredTime = incoming.preferredTime || incoming.preferred_time || 'Morning (9:00 AM - 12:00 PM)';
  const message = incoming.message || incoming.notes || '';
  const photos = Array.isArray(incoming.photos) ? incoming.photos : [];

  const requestType =
    slotType.toLowerCase().includes('enquiry') || slotType.toLowerCase().includes('request')
      ? 'Customer Enquiry'
      : 'Site Inspection';

  const newBookingData = {
    id: bookingId,
    bookingCode: bookingCode,
    booking_code: bookingCode,
    customerId: actualCustomerId,
    customer_id: actualCustomerId,
    customerName: customerName,
    customer_name: customerName,
    phone: phone,
    alternatePhone: incoming.alternatePhone ? cleanIndianMobile(incoming.alternatePhone) : null,
    whatsapp: incoming.whatsapp ? cleanIndianMobile(incoming.whatsapp) : phone,
    email: incoming.email ? String(incoming.email).trim() : null,
    service: service,
    serviceType: service,
    service_type: service,
    serviceId: incoming.serviceId || incoming.service_id || '',
    requestType: requestType,
    request_type: requestType,
    location: incoming.location || incoming.projectLocation || 'Hyderabad, Telangana',
    projectLocation: incoming.location || incoming.projectLocation || 'Hyderabad, Telangana',
    workDate: workDate,
    work_date: workDate,
    preferredDate: workDate,
    preferredTime: preferredTime,
    preferred_time: preferredTime,
    message: message,
    notes: message,
    photos: photos,
    bookingDate: incoming.bookingDate || today,
    booking_date: incoming.bookingDate || today,
    bookingTime: incoming.bookingTime || currentTime,
    booking_time: incoming.bookingTime || currentTime,
    status: 'Pending',
    bookingStatus: 'Pending',
    booking_status: 'Pending',
    orderStatus: 'Received',
    order_status: 'Received',
    slotType: slotType,
    sourceSlot: slotType,
    sourceChannel: slotType,
    source_channel: slotType,
    createdAt: now.toISOString(),
    created_at: now.toISOString(),
    updatedAt: now.toISOString(),
    updated_at: now.toISOString()
  };

  // Save Booking in storage layer
  let savedBooking;
  try {
    savedBooking = await saveBooking(newBookingData);
  } catch (storageError: any) {
    console.error('[STORAGE ERROR - BOOKING SAVE FAILED]', storageError);
    return res.status(500).json({
      success: false,
      error: 'Failed to securely store booking in application storage. Please try again or call TAR Helpline.'
    });
  }

  // If customer enquiry, also save to customer requests in storage layer
  if (
    slotType.toLowerCase().includes('enquiry') ||
    slotType.toLowerCase().includes('request')
  ) {
    try {
      await saveCustomerRequest({
        id: randomUUID(),
        requestCode: `REQ-${new Date().getFullYear()}-${String(savedBooking.bookingCode || '000001').slice(-6)}`,
        customerId: actualCustomerId,
        customerName: customerName,
        phone: phone,
        email: savedBooking.email,
        service: service,
        requestType: 'Customer Enquiry & Service Request',
        location: savedBooking.location,
        preferredDate: workDate,
        preferredTime: preferredTime,
        message: message,
        slotType: slotType
      });
    } catch (reqError) {
      console.error('[STORAGE REQUEST ERROR]', reqError);
    }
  }

  // Communication & Receipts
  const timeInKolkata = now.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata'
  });

  const receiptText =
    `*🏢 TAR CIVIL & WATERPROOFING EXPERTS SOLUTIONS*\n` +
    `_Official Hyderabad & Telangana Survey Confirmation_\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `📋 *Booking Reference:* ${bookingCode}\n` +
    `🏷️ *Slot Channel:* ${slotType}\n` +
    `👤 *Customer Name:* ${customerName}\n` +
    `📱 *Mobile Number:* +91 ${phone}\n` +
    `🛠 *Service:* ${service}\n` +
    `📍 *Site Location:* ${savedBooking.location}\n` +
    `📅 *Survey Date:* ${workDate}\n` +
    `⏰ *Time Window:* ${preferredTime}\n` +
    (message ? `💬 *Site Requirements:* ${message}\n` : '') +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `✅ *Status:* Booking Received & Stored\n` +
    `📞 *Direct Helpline:* +91 9949293872\n` +
    `📧 *Email:* tarsolutions55@gmail.com\n` +
    `🕒 *Timestamp:* ${timeInKolkata}\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `_Our team will contact you for site inspection._`;

  const customerWhatsAppUrl = `https://api.whatsapp.com/send?phone=91${phone}&text=${encodeURIComponent(receiptText)}`;
  const adminWhatsAppUrl = `https://api.whatsapp.com/send?phone=919949293872&text=${encodeURIComponent(receiptText)}`;
  const customerSmsUrl = `sms:+91${phone}?body=${encodeURIComponent(receiptText)}`;

  // Fast2SMS Gateway Dispatch
  let gatewayDispatched = false;
  let gatewayProvider = 'Direct Client & Terminal';
  let gatewayDetails = '';

  if (process.env.FAST2SMS_API_KEY && phone.length === 10) {
    try {
      const smsMessage = `TAR Civil & Waterproofing: Dear ${customerName}, your request for ${service} at ${savedBooking.location} is received. Ref: ${bookingCode}. Helpline: 9949293872`;
      const fast2smsResponse = await fetch('https://www.fast2sms.com/dev/bulkV2', {
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
          numbers: phone
        })
      });

      const fast2smsData = await fast2smsResponse.json();
      if (fast2smsResponse.ok && fast2smsData?.return) {
        gatewayDispatched = true;
        gatewayProvider = 'Fast2SMS';
        gatewayDetails = `SMS sent to +91 ${phone}`;
      }
    } catch (error: any) {
      console.error('[FAST2SMS ERROR]', error?.message || error);
    }
  }

  // Webhook Dispatch
  if (process.env.NOTIFICATION_WEBHOOK_URL) {
    try {
      const webhookResponse = await fetch(process.env.NOTIFICATION_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'BOOKING_RECEIVED',
          booking: savedBooking,
          receiptText,
          time: timeInKolkata
        })
      });
      if (webhookResponse.ok) {
        gatewayDispatched = true;
        gatewayProvider = gatewayProvider === 'Fast2SMS' ? 'Fast2SMS + Webhook' : 'Notification Webhook';
      }
    } catch (error: any) {
      console.error('[WEBHOOK ERROR]', error?.message || error);
    }
  }

  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║ TAR SOLUTIONS - BOOKING RECEIVED & STORED                            ║');
  console.log('╠══════════════════════════════════════════════════════════════════════╣');
  console.log(`║ Booking Code: ${bookingCode}`);
  console.log(`║ Customer:     ${customerName}`);
  console.log(`║ Phone:        +91 ${phone}`);
  console.log(`║ Service:      ${service}`);
  console.log(`║ Location:     ${savedBooking.location}`);
  console.log(`║ Date:         ${workDate}`);
  console.log(`║ Time:         ${preferredTime}`);
  console.log(`║ Storage:      Stored (7-Day Retention)`);
  console.log('╚══════════════════════════════════════════════════════════════════════╝');

  return res.status(201).json({
    success: true,
    booking: savedBooking,
    bookingCode: bookingCode,
    customerId: actualCustomerId,
    receiptText,
    customerWhatsAppUrl,
    adminWhatsAppUrl,
    customerSmsUrl,
    gatewayDispatched,
    gatewayProvider,
    gatewayDetails,
    message: 'Booking confirmed successfully.'
  });
});

/**
 * ============================================================
 * CUSTOMER AUTH (REGISTRATION & LOGIN)
 * ============================================================
 */

app.post('/api/auth/customer/register', async (req, res) => {
  const { name, mobile, email, password, confirmPassword, address } = req.body || {};

  const cleanName = String(name || '').trim();
  const cleanPhone = cleanIndianMobile(mobile);

  if (!cleanName) {
    return res.status(400).json({
      success: false,
      error: 'Customer full name is required.'
    });
  }

  if (!cleanPhone || cleanPhone.length !== 10) {
    return res.status(400).json({
      success: false,
      error: 'A valid 10-digit Indian mobile number is required.'
    });
  }

  if (!password || String(password).length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 6 characters.'
    });
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      error: 'Passwords do not match.'
    });
  }

  try {
    const customer = await saveCustomer({
      name: cleanName,
      mobile: cleanPhone,
      phone: cleanPhone,
      email: email ? String(email).trim().toLowerCase() : null,
      password: String(password),
      address: address ? String(address).trim() : 'Hyderabad, Telangana',
      status: 'Active'
    });

    res.status(201).json({
      success: true,
      customer,
      message: 'Customer registered successfully.'
    });
  } catch (error: any) {
    console.error('[CUSTOMER REGISTER ERROR]', error);
    res.status(400).json({
      success: false,
      error: error?.message || 'Customer registration failed.'
    });
  }
});

app.post('/api/auth/customer/login', async (req, res) => {
  const { identifier, mobile, phone, email, password } = req.body || {};
  const loginId = identifier || mobile || phone || email;

  if (!loginId || !password) {
    return res.status(400).json({
      success: false,
      error: 'Mobile number/email and password are required.'
    });
  }

  try {
    const authResult = await authenticateCustomer(String(loginId).trim(), String(password));

    if (!authResult.success || !authResult.customer) {
      return res.status(401).json({
        success: false,
        error: authResult.error || 'Invalid mobile/email or password.'
      });
    }

    if (authResult.customer.status === 'Inactive') {
      return res.status(403).json({
        success: false,
        error: 'Your account has been deactivated. Please contact TAR Solutions support at +91 9949293872.'
      });
    }

    return res.json({
      success: true,
      customer: authResult.customer,
      message: 'Login successful.'
    });
  } catch (error: any) {
    console.error('[CUSTOMER LOGIN ERROR]', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication service temporarily unavailable. Please try again.'
    });
  }
});

/**
 * ============================================================
 * ADMIN AUTH & OTP
 * ============================================================
 */

function getAdminCredentials() {
  const dbCreds = loadDb().adminCreds;
  return {
    username: process.env.ADMIN_USERNAME || dbCreds?.username || 'Tarsolutions',
    password: process.env.ADMIN_PASSWORD || dbCreds?.passwordHash || 'Tarsolutions@24'
  };
}

app.post('/api/auth/admin/login', (req, res) => {
  const { username, password } = req.body;
  const credentials = getAdminCredentials();

  if (username === credentials.username && password === credentials.password) {
    return res.json({
      success: true,
      token: `tar_admin_${Date.now()}_${randomUUID()}`,
      admin: {
        username: credentials.username,
        role: 'admin'
      }
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Invalid admin username or password.'
  });
});

app.post('/api/auth/admin/change-password', (req, res) => {
  const { currentPassword, newPassword, newUsername } = req.body;
  const current = getAdminCredentials();

  if (currentPassword && currentPassword !== current.password) {
    return res.status(400).json({
      success: false,
      error: 'Current password is incorrect.'
    });
  }

  if (!newPassword && !newUsername) {
    return res.status(400).json({
      success: false,
      error: 'Provide a new username or password.'
    });
  }

  const db = loadDb();
  db.adminCreds = {
    username: newUsername ? String(newUsername).trim() : current.username,
    passwordHash: newPassword ? String(newPassword).trim() : current.password
  };
  saveDb(db);

  return res.json({
    success: true,
    message: 'Admin credentials updated successfully.',
    admin: {
      username: db.adminCreds.username,
      role: 'admin'
    }
  });
});

let adminOtpStore: {
  otp: string;
  phone: string;
  email: string;
  expiresAt: number;
} | null = null;

app.post('/api/auth/admin/request-otp', (req, res) => {
  const { phone, email } = req.body;

  const adminPhone = String(
    phone || process.env.ADMIN_OWNER_PHONE || '9949293872'
  ).replace(/\D/g, '');

  const adminEmail = String(
    email || process.env.ADMIN_OWNER_EMAIL || 'tarsolutions55@gmail.com'
  ).trim();

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000;

  adminOtpStore = {
    otp,
    phone: adminPhone,
    email: adminEmail,
    expiresAt
  };

  console.log('[TAR ADMIN OTP GENERATED]');
  console.log(`Target Mobile: +91 ${adminPhone}`);
  console.log(`Target Email: ${adminEmail}`);

  res.json({
    success: true,
    message: 'OTP generated. Check the configured admin notification channel.',
    phoneMasked: `+91 ${adminPhone.slice(0, 2)}*****${adminPhone.slice(-2)}`,
    emailMasked: adminEmail.replace(/^(.{2}).*(@.*)$/, '$1***$2')
  });
});

app.post('/api/auth/admin/verify-otp-reset', (req, res) => {
  const { otp } = req.body;

  if (!adminOtpStore) {
    return res.status(400).json({
      success: false,
      error: 'OTP was not requested.'
    });
  }

  if (Date.now() > adminOtpStore.expiresAt) {
    adminOtpStore = null;
    return res.status(400).json({
      success: false,
      error: 'OTP has expired.'
    });
  }

  if (String(otp || '').trim() !== adminOtpStore.otp) {
    return res.status(400).json({
      success: false,
      error: 'Invalid OTP.'
    });
  }

  adminOtpStore = null;
  const credentials = getAdminCredentials();

  return res.json({
    success: true,
    message: 'OTP verified successfully.',
    token: `tar_admin_${Date.now()}_${randomUUID()}`,
    admin: {
      username: credentials.username,
      role: 'admin'
    }
  });
});

/**
 * ============================================================
 * DAILY REPORT
 * ============================================================
 */

function runDailyReportJob() {
  const now = new Date();
  const timeInKolkata = now.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour12: false
  });
  const dateInKolkata = now.toLocaleDateString('en-CA', {
    timeZone: 'Asia/Kolkata'
  });

  const db = loadDb();

  const todayBookings = (db.bookings || []).filter((booking: any) => {
    const bookingDate = booking.bookingDate || booking.booking_date || booking.workDate;
    const createdAt = String(booking.createdAt || booking.created_at || '');
    return bookingDate === dateInKolkata || createdAt.startsWith(dateInKolkata);
  });

  const report = {
    id: `rep-${Date.now()}`,
    timestamp: now.toISOString(),
    reportDate: dateInKolkata,
    totalBookings: todayBookings.length,
    sentTo: process.env.REPORT_EMAIL || 'tarsolutions55@gmail.com',
    status: 'GENERATED_AND_LOGGED'
  };

  db.dailyReportLog = [report, ...(db.dailyReportLog || [])].slice(0, 30);
  saveDb(db);

  console.log('----------------------------------------------------');
  console.log(`[DAILY REPORT] ${dateInKolkata}`);
  console.log(`Current Hyderabad Time: ${timeInKolkata}`);
  console.log(`Total Bookings Today: ${todayBookings.length}`);
  console.log('----------------------------------------------------');
}

let lastDailyReportDate = '';

setInterval(() => {
  const now = new Date();
  const parts = now.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour12: false
  }).split(':');

  const date = now.toLocaleDateString('en-CA', {
    timeZone: 'Asia/Kolkata'
  });

  if (parts[0] === '22' && parts[1] === '00' && lastDailyReportDate !== date) {
    lastDailyReportDate = date;
    runDailyReportJob();
  }
}, 60 * 1000);

app.post('/api/reports/trigger-daily', (_req, res) => {
  runDailyReportJob();
  res.json({
    success: true,
    message: 'Daily report generated.'
  });
});

app.get('/api/reports/entire-day', (req, res) => {
  const targetDate = String(
    req.query.date || new Date().toISOString().slice(0, 10)
  );

  const db = loadDb();
  const bookings = db.bookings || [];

  const dayBookings = bookings.filter((booking: any) => {
    const created = booking.created_at || booking.createdAt || '';
    return (
      booking.bookingDate === targetDate ||
      booking.booking_date === targetDate ||
      booking.workDate === targetDate ||
      booking.work_date === targetDate ||
      String(created).startsWith(targetDate)
    );
  });

  const slot1 = dayBookings.filter((booking: any) =>
    String(booking.slotType || booking.source_channel || '').toLowerCase().includes('free survey')
  ).length;

  const slot2 = dayBookings.filter((booking: any) => {
    const source = String(booking.slotType || booking.source_channel || '').toLowerCase();
    return source.includes('inspection') || (!source.includes('enquiry') && !source.includes('survey'));
  }).length;

  const slot3 = dayBookings.filter((booking: any) =>
    String(booking.slotType || booking.source_channel || '').toLowerCase().includes('enquiry')
  ).length;

  const statusCount = (wantedStatus: string) =>
    dayBookings.filter(
      (booking: any) => String(booking.status || booking.bookingStatus || '').toLowerCase() === wantedStatus
    ).length;

  res.json({
    success: true,
    targetDate,
    totalBookings: dayBookings.length,
    totalRegisteredCustomers: (db.customers || []).filter((customer: any) => {
      const created = customer.createdAt || customer.created_at || customer.registeredAt || '';
      return String(created).startsWith(targetDate);
    }).length,
    slotsBreakdown: {
      bookFreeSurvey: slot1,
      siteInspectionAssessment: slot2,
      customerEnquiry: slot3
    },
    statusBreakdown: {
      new: statusCount('new'),
      contacted: statusCount('contacted'),
      confirmed: statusCount('confirmed'),
      completed: statusCount('completed')
    },
    bookings: dayBookings,
    generatedAt: new Date().toISOString()
  });
});

/**
 * ============================================================
 * VERCEL BLOB STORAGE & 7-DAY RETENTION CLEANUP ENDPOINTS
 * ============================================================
 */

// Storage status & verification endpoint
app.get('/api/storage/status', async (_req, res) => {
  try {
    const status = await getStorageStatus();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({
      connected: false,
      error: error?.message || 'Failed to check storage status'
    });
  }
});

// 7-day retention cleanup endpoint (manual or triggered via Vercel cron)
app.all(['/api/storage/cleanup', '/api/cron/cleanup'], async (_req, res) => {
  try {
    const result = await cleanupExpiredRecords(RETENTION_DAYS);
    res.json({
      success: true,
      result,
      retentionDays: RETENTION_DAYS,
      message: '7-day rolling retention cleanup executed successfully.'
    });
  } catch (error: any) {
    console.error('[CLEANUP API ERROR]', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Cleanup operation failed.'
    });
  }
});

// Customer service requests & enquiries
app.get(['/api/requests', '/api/customer-requests'], async (_req, res) => {
  try {
    const requests = await getCustomerRequests();
    res.json({
      success: true,
      requests,
      count: requests.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to retrieve enquiries'
    });
  }
});

app.post(['/api/requests', '/api/customer-requests'], async (req, res) => {
  try {
    const requestEntry = await saveCustomerRequest(req.body);
    res.status(201).json({
      success: true,
      request: requestEntry,
      message: 'Enquiry received and securely stored.'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to save enquiry'
    });
  }
});

// Update enquiry status or notes
app.patch(['/api/requests/:id', '/api/customer-requests/:id'], async (req, res) => {
  try {
    const updated = await updateCustomerRequest(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Enquiry not found' });
    }
    res.json({ success: true, request: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to update enquiry' });
  }
});

// Delete enquiry
app.delete(['/api/requests/:id', '/api/customer-requests/:id'], async (req, res) => {
  try {
    const deleted = await deleteCustomerRequest(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Enquiry not found' });
    }
    res.json({ success: true, message: 'Enquiry deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to delete enquiry' });
  }
});

// Single booking lookup
app.get('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    res.json({ success: true, booking });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to get booking' });
  }
});

// Single booking deletion
app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const success = await deleteBooking(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    res.json({ success: true, message: 'Booking deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to delete booking' });
  }
});

// Single customer lookup & update & delete
app.get('/api/customers/:id', async (req, res) => {
  try {
    const customer = await getCustomerById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    res.json({ success: true, customer });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to get customer' });
  }
});

app.patch('/api/customers/:id', async (req, res) => {
  try {
    const updated = await updateCustomer(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    res.json({ success: true, customer: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to update customer' });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    const success = await deleteCustomer(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    res.json({ success: true, message: 'Customer account deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to delete customer' });
  }
});

// Weekly Business & Data Report
app.get('/api/reports/weekly', async (req, res) => {
  try {
    const targetDateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];
    const targetDate = new Date(targetDateStr);

    const day = targetDate.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(targetDate);
    monday.setDate(targetDate.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const weekStartStr = monday.toISOString().split('T')[0];
    const weekEndStr = sunday.toISOString().split('T')[0];

    const allBookings = await getBookings();
    const allCustomers = await getCustomers();

    const weekBookings = allBookings.filter((b) => {
      const bDate = (b.workDate || b.bookingDate || (b.createdAt ? b.createdAt.substring(0, 10) : '')).trim();
      return bDate >= weekStartStr && bDate <= weekEndStr;
    });

    const statusCounts = {
      total: weekBookings.length,
      completed: weekBookings.filter((b) => String(b.status).toLowerCase() === 'completed').length,
      confirmed: weekBookings.filter((b) => String(b.status).toLowerCase() === 'confirmed').length,
      new: weekBookings.filter((b) => String(b.status).toLowerCase() === 'new').length,
      contacted: weekBookings.filter((b) => String(b.status).toLowerCase() === 'contacted').length,
      cancelled: weekBookings.filter((b) => String(b.status).toLowerCase() === 'cancelled').length,
      pending: weekBookings.filter((b) => ['new', 'contacted', 'pending'].includes(String(b.status).toLowerCase())).length
    };

    const newCustomersThisWeek = allCustomers.filter((c) => {
      const cDate = (c.registeredAt || c.createdAt || '').substring(0, 10);
      return cDate >= weekStartStr && cDate <= weekEndStr;
    }).length;

    const serviceCounts: Record<string, number> = {};
    for (const b of weekBookings) {
      const sName = b.service || 'General Waterproofing';
      serviceCounts[sName] = (serviceCounts[sName] || 0) + 1;
    }
    const topServices = Object.entries(serviceCounts)
      .map(([serviceName, count]) => ({
        serviceName,
        count,
        percentage: weekBookings.length ? Math.round((count / weekBookings.length) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dailyBreakdown = [];
    for (let i = 0; i < 7; i++) {
      const cur = new Date(monday);
      cur.setDate(monday.getDate() + i);
      const curStr = cur.toISOString().split('T')[0];
      const dayBookings = weekBookings.filter((b) => {
        const bDate = (b.workDate || b.bookingDate || (b.createdAt ? b.createdAt.substring(0, 10) : '')).trim();
        return bDate === curStr;
      });
      dailyBreakdown.push({
        dayIndex: i,
        dayName: dayNames[i],
        date: curStr,
        count: dayBookings.length,
        completed: dayBookings.filter((b) => String(b.status).toLowerCase() === 'completed').length,
        confirmed: dayBookings.filter((b) => String(b.status).toLowerCase() === 'confirmed').length,
        pending: dayBookings.filter((b) => ['new', 'contacted', 'pending'].includes(String(b.status).toLowerCase())).length
      });
    }

    res.json({
      success: true,
      weekStart: weekStartStr,
      weekEnd: weekEndStr,
      targetDate: targetDateStr,
      totalBookings: weekBookings.length,
      metrics: statusCounts,
      totalCustomers: allCustomers.length,
      newCustomersThisWeek,
      topServices,
      dailyBreakdown,
      bookings: weekBookings
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to compile weekly report'
    });
  }
});

// Catch-all 404 handler for any unhandled /api/* routes so they return JSON, NOT HTML
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.path}`
  });
});

/**
 * ============================================================
 * VITE SPA MIDDLEWARE / PRODUCTION
 * ============================================================
 */

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true
      },
      appType: 'spa'
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));

    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TAR Civil & Waterproofing server active on http://0.0.0.0:${PORT}`);
    console.log(`[STORAGE ENGINE] Local JSON Storage (${RETENTION_DAYS}-Day Retention Active)`);
  });
}

startServer();
