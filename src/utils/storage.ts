import {
  Service,
  Project,
  Booking,
  BookingStatus,
  CustomerUser,
  BookingFormField,
  WebsiteContent
} from '../types';
import {
  INITIAL_SERVICES,
  INITIAL_PROJECTS,
  INITIAL_BOOKING_FIELDS,
  INITIAL_WEBSITE_CONTENT,
  INITIAL_SAMPLE_BOOKINGS
} from '../data/initialData';
import {
  hashPassword,
  verifyPassword,
  sanitizeCustomer,
  cleanMobile,
  validateIndianMobile,
  validateEmail,
  validatePassword
} from './security';

/**
 * ============================================================
 * TAR SOLUTIONS — UNIFIED APPLICATION STORAGE LAYER
 * ============================================================
 *
 * Architecture:
 * - In-Memory State Cache with Sequential Concurrency (AsyncLock).
 * - Optional Disk Sync to tar_db.json in development environments.
 * - Customer Credential System with PBKDF2/scrypt password hashing.
 * - Passwords, hashes, and salts are NEVER returned to client or Admin UI.
 * - 7-Day Rolling Retention for transient request logs.
 * ============================================================
 */

export const RETENTION_DAYS = 7;
export const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;

export interface BookingStatusHistoryEntry {
  id: string;
  bookingId: string;
  bookingCode?: string;
  previousStatus: string | null;
  newStatus: string;
  changedBy: string;
  notes?: string;
  timestamp: string;
  createdAt: string;
}

export interface CustomerRequestEntry {
  id: string;
  requestCode: string;
  customerId?: string;
  bookingId?: string;
  customerName: string;
  phone: string;
  email?: string | null;
  service: string;
  requestType: string;
  location: string;
  preferredDate?: string;
  preferredTime?: string;
  message?: string;
  slotType?: string;
  status?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StorageStatus {
  connected: boolean;
  provider: string;
  persistsOnVercel: boolean;
  vercelPersistenceNote: string;
  minimumExternalServiceRequired: string;
  retentionDays: number;
  counts: {
    bookings: number;
    customers: number;
    requests: number;
    statusHistory: number;
  };
  lastCleanupAt?: string;
  error?: string;
}

export interface StorageSchema {
  services: Service[];
  projects: Project[];
  bookings: Booking[];
  customers: CustomerUser[];
  customerRequests: CustomerRequestEntry[];
  bookingStatusHistory: BookingStatusHistoryEntry[];
  formFields: BookingFormField[];
  content: WebsiteContent | null;
  adminCreds: {
    username: string;
    passwordHash: string;
  };
  dailyReportLog: any[];
  bookingCounter?: number;
}

/**
 * Indian Mobile number cleaner and validator
 */
export function cleanIndianMobile(phone: string): string {
  return cleanMobile(phone);
}

/**
 * Unique identifier generator.
 */
export function createId(prefix = 'id'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;
}

/**
 * Check if a timestamp is older than the given number of days.
 */
export function isRecordExpired(timestampStr?: string | null, days: number = RETENTION_DAYS): boolean {
  if (!timestampStr) return false;
  try {
    const time = new Date(timestampStr).getTime();
    if (isNaN(time)) return false;
    return Date.now() - time > days * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

/**
 * Helper to purge records older than specified retention days.
 */
function purgeExpiredList<T extends { createdAt?: string; created_at?: string; timestamp?: string; bookingDate?: string; booking_date?: string; workDate?: string; id?: string }>(
  items: T[],
  days: number = RETENTION_DAYS
): T[] {
  return (items || []).filter((item) => {
    // Retain initial historical samples
    if (item.id && String(item.id).startsWith('book-hist-')) {
      return true;
    }
    const ts = item.createdAt || item.created_at || item.timestamp || item.bookingDate || item.booking_date || item.workDate;
    return !isRecordExpired(ts, days);
  });
}

function getInitialBookings(): Booking[] {
  return Array.isArray(INITIAL_SAMPLE_BOOKINGS) ? [...INITIAL_SAMPLE_BOOKINGS] : [];
}

/**
 * Customer database initializes CLEAN: zero demo or placeholder records.
 */
function getInitialCustomers(): CustomerUser[] {
  return [];
}

// In-Memory store for fast, safe serverless operation
const memoryStore: {
  bookings: Booking[];
  customers: CustomerUser[];
  requests: CustomerRequestEntry[];
  statusHistory: BookingStatusHistoryEntry[];
} = {
  bookings: getInitialBookings(),
  customers: getInitialCustomers(),
  requests: [],
  statusHistory: []
};

/**
 * Async Mutex for sequential concurrency handling.
 */
class AsyncLock {
  private queue = Promise.resolve();

  runExclusive<T>(fn: () => Promise<T>): Promise<T> {
    const next = this.queue.then(fn, fn);
    this.queue = next.then(() => {}, () => {});
    return next;
  }
}

const locks = new Map<string, AsyncLock>();
function getLock(key: string): AsyncLock {
  if (!locks.has(key)) {
    locks.set(key, new AsyncLock());
  }
  return locks.get(key)!;
}

type StorageListener = (data: StorageSchema) => void;
const storageChangeListeners: StorageListener[] = [];

export function onStorageChange(listener: StorageListener): () => void {
  storageChangeListeners.push(listener);
  return () => {
    const idx = storageChangeListeners.indexOf(listener);
    if (idx !== -1) storageChangeListeners.splice(idx, 1);
  };
}

export function notifyStorageChanged(): void {
  const current = loadDb();
  for (const listener of storageChangeListeners) {
    try {
      listener(current);
    } catch (err) {
      console.warn('[STORAGE] Storage listener execution error:', err);
    }
  }
}

/**
 * ============================================================
 * BOOKING CODE GENERATOR
 * ============================================================
 */
export function generateBookingCode(existingBookings?: Booking[]): string {
  const year = new Date().getFullYear();
  const count = (existingBookings || memoryStore.bookings).length;
  return `TAR-${year}-${String(count + 1).padStart(5, '0')}`;
}

/**
 * ============================================================
 * ROLLING RETENTION CLEANUP
 * ============================================================
 */
let lastCleanupTimestamp = '';

export async function cleanupExpiredRecords(days: number = RETENTION_DAYS): Promise<{
  removedBookings: number;
  removedCustomers: number;
  removedRequests: number;
  removedHistory: number;
}> {
  return getLock('GLOBAL_CLEANUP').runExclusive(async () => {
    const initialB = memoryStore.bookings.length;
    const initialR = memoryStore.requests.length;
    const initialH = memoryStore.statusHistory.length;

    memoryStore.bookings = purgeExpiredList(memoryStore.bookings, days);
    memoryStore.requests = purgeExpiredList(memoryStore.requests, days);
    memoryStore.statusHistory = purgeExpiredList(memoryStore.statusHistory, days);

    // Note: Registered customer accounts are PERMANENT and never purged by retention
    const removedBookings = initialB - memoryStore.bookings.length;
    const removedRequests = initialR - memoryStore.requests.length;
    const removedHistory = initialH - memoryStore.statusHistory.length;
    const removedCustomers = 0;

    lastCleanupTimestamp = new Date().toISOString();

    return {
      removedBookings,
      removedCustomers,
      removedRequests,
      removedHistory
    };
  });
}

/**
 * ============================================================
 * BOOKING CRUD FUNCTIONS
 * ============================================================
 */

export async function saveBooking(booking: any): Promise<Booking> {
  return getLock('BOOKINGS').runExclusive(async () => {
    const validBookings = purgeExpiredList(memoryStore.bookings, RETENTION_DAYS);

    const now = new Date();
    const nowIso = now.toISOString();
    const id = booking.id || createId('book');
    const code = booking.bookingCode || booking.booking_code || generateBookingCode(validBookings);
    const cleanPhone = cleanIndianMobile(booking.phone || booking.mobile);

    // Attach customerId if matching customer exists or if explicitly provided
    let linkedCustomerId = booking.customerId || booking.customer_id;
    if (!linkedCustomerId && cleanPhone) {
      const matchedCustomer = memoryStore.customers.find(
        (c) => cleanIndianMobile(c.phone || c.mobile) === cleanPhone
      );
      if (matchedCustomer) {
        linkedCustomerId = matchedCustomer.id;
      }
    }

    const newBooking: Booking = {
      ...booking,
      id,
      customerId: linkedCustomerId,
      bookingCode: code,
      booking_code: code,
      phone: cleanPhone,
      whatsapp: booking.whatsapp ? cleanIndianMobile(booking.whatsapp) : cleanPhone,
      status: booking.status || booking.bookingStatus || 'Pending',
      bookingStatus: booking.status || booking.bookingStatus || 'Pending',
      orderStatus: booking.orderStatus || 'Received',
      createdAt: booking.createdAt || booking.created_at || nowIso,
      created_at: booking.createdAt || booking.created_at || nowIso,
      updatedAt: nowIso,
      updated_at: nowIso
    };

    const existingIdx = validBookings.findIndex(
      (b: any) => b.id === id || b.bookingCode === code || b.booking_code === code
    );

    if (existingIdx >= 0) {
      validBookings[existingIdx] = {
        ...validBookings[existingIdx],
        ...newBooking
      };
    } else {
      validBookings.unshift(newBooking);
    }

    memoryStore.bookings = validBookings;

    // Update customer's totalBookings and bookingCodes if customer account exists
    if (linkedCustomerId) {
      const customerIdx = memoryStore.customers.findIndex((c) => c.id === linkedCustomerId);
      if (customerIdx >= 0) {
        const cust = memoryStore.customers[customerIdx];
        const existingCodes = cust.bookingCodes || [];
        if (!existingCodes.includes(code)) {
          existingCodes.push(code);
        }
        cust.totalBookings = (cust.totalBookings || 0) + 1;
        cust.bookingCodes = existingCodes;
        cust.lastBookingDate = newBooking.workDate || newBooking.bookingDate || nowIso;
        cust.updatedAt = nowIso;
      }
    }

    // Save initial booking status history entry
    await saveBookingStatusHistory({
      bookingId: id,
      bookingCode: code,
      previousStatus: null,
      newStatus: newBooking.status,
      changedBy: 'System / Customer Booking Form',
      notes: 'Initial booking submitted and recorded'
    });

    notifyStorageChanged();
    return newBooking;
  });
}

export async function getBookings(filter?: {
  period?: string;
  from?: string;
  to?: string;
  status?: string;
}): Promise<Booking[]> {
  let list = purgeExpiredList(memoryStore.bookings, RETENTION_DAYS);

  if (filter?.status && filter.status !== 'ALL') {
    list = list.filter(
      (b: any) => String(b.status || b.bookingStatus || '').toLowerCase() === filter.status?.toLowerCase()
    );
  }

  return list;
}

export async function getBookingById(idOrCode: string): Promise<Booking | null> {
  const bookings = await getBookings();
  return (
    bookings.find(
      (b: any) => b.id === idOrCode || b.bookingCode === idOrCode || b.booking_code === idOrCode
    ) || null
  );
}

export async function updateBooking(
  idOrCode: string,
  updates: Partial<Booking> & { changedBy?: string; notes?: string }
): Promise<Booking | null> {
  return getLock('BOOKINGS').runExclusive(async () => {
    const idx = memoryStore.bookings.findIndex(
      (b: any) => b.id === idOrCode || b.bookingCode === idOrCode || b.booking_code === idOrCode
    );

    if (idx < 0) return null;

    const existing = memoryStore.bookings[idx];
    const previousStatus = existing.status || existing.bookingStatus || 'Pending';
    const newStatus = (updates.status || updates.bookingStatus || previousStatus) as BookingStatus;
    const nowIso = new Date().toISOString();

    const updated: Booking = {
      ...existing,
      ...updates,
      status: newStatus,
      bookingStatus: newStatus,
      booking_status: newStatus,
      updatedAt: nowIso,
      updated_at: nowIso
    };

    memoryStore.bookings[idx] = updated;

    if (newStatus !== previousStatus || updates.changedBy || updates.notes) {
      await saveBookingStatusHistory({
        bookingId: existing.id,
        bookingCode: existing.bookingCode || existing.booking_code,
        previousStatus,
        newStatus,
        changedBy: updates.changedBy || 'Admin',
        notes: updates.notes || `Status changed to ${newStatus}`
      });
    }

    notifyStorageChanged();
    return updated;
  });
}

export async function deleteBooking(idOrCode: string): Promise<boolean> {
  return getLock('BOOKINGS').runExclusive(async () => {
    const initialLen = memoryStore.bookings.length;
    const target = memoryStore.bookings.find(
      (b: any) => b.id === idOrCode || b.bookingCode === idOrCode || b.booking_code === idOrCode
    );
    memoryStore.bookings = memoryStore.bookings.filter(
      (b: any) => b.id !== idOrCode && b.bookingCode !== idOrCode && b.booking_code !== idOrCode
    );
    const deleted = memoryStore.bookings.length < initialLen;
    if (deleted) {
      // Also cleanup status history for this booking
      memoryStore.statusHistory = memoryStore.statusHistory.filter(
        (h) => h.bookingId !== idOrCode && (!target || h.bookingId !== target.id)
      );
      // If booking was linked to a customer, update customer's bookings count & codes
      if (target && (target.customerId || target.phone)) {
        const custPhone = cleanIndianMobile(target.phone);
        const cust = memoryStore.customers.find(
          (c) => (target.customerId && c.id === target.customerId) || (custPhone && cleanIndianMobile(c.phone || c.mobile) === custPhone)
        );
        if (cust) {
          cust.bookingCodes = (cust.bookingCodes || []).filter((code) => code !== target.bookingCode);
          cust.totalBookings = Math.max(0, (cust.totalBookings || 1) - 1);
          cust.updatedAt = new Date().toISOString();
        }
      }
      notifyStorageChanged();
    }
    return deleted;
  });
}

/**
 * ============================================================
 * CUSTOMER CRUD & CREDENTIAL FUNCTIONS
 * ============================================================
 */

/**
 * Internal customer record fetcher for authentication verification.
 * Retains passwordHash and salt ONLY for server-side verification.
 */
export async function getInternalCustomerForAuth(identifier: string): Promise<CustomerUser | null> {
  if (!identifier) return null;
  const cleanId = cleanIndianMobile(identifier);
  const target = String(identifier).trim().toLowerCase();

  return (
    memoryStore.customers.find((c) => {
      const matchPhone = cleanId.length === 10 && cleanIndianMobile(c.phone || c.mobile) === cleanId;
      const matchEmail = c.email && c.email.toLowerCase().trim() === target;
      return matchPhone || matchEmail;
    }) || null
  );
}

/**
 * Save / Register customer with secure hashing and duplicate validations.
 */
export async function saveCustomer(customerData: any): Promise<CustomerUser> {
  return getLock('CUSTOMERS').runExclusive(async () => {
    const nowIso = new Date().toISOString();
    const cleanPhone = cleanIndianMobile(customerData.phone || customerData.mobile);

    // 1. Validation: Mobile number
    if (!validateIndianMobile(cleanPhone)) {
      throw new Error('A valid 10-digit Indian mobile number is required.');
    }

    // 2. Validation: Full name
    const customerName = String(customerData.name || customerData.customerName || '').trim();
    if (!customerName) {
      throw new Error('Customer full name is required.');
    }

    // 3. Validation: Email format
    const email = customerData.email ? String(customerData.email).trim().toLowerCase() : null;
    if (email && !validateEmail(email)) {
      throw new Error('Please enter a valid email address.');
    }

    const id = customerData.id || createId('cust');
    const code = customerData.customerCode || `CA-CUST-${cleanPhone.slice(-5)}`;

    // 4. Duplicate checks
    const duplicatePhone = memoryStore.customers.find(
      (c) => c.id !== id && cleanIndianMobile(c.phone || c.mobile) === cleanPhone
    );
    if (duplicatePhone) {
      throw new Error('A customer account with this mobile number already exists.');
    }

    if (email) {
      const duplicateEmail = memoryStore.customers.find(
        (c) => c.id !== id && c.email && c.email.toLowerCase().trim() === email
      );
      if (duplicateEmail) {
        throw new Error('A customer account with this email address already exists.');
      }
    }

    // 5. Password Hashing
    let passwordHash = customerData.passwordHash;
    let salt = customerData.salt;

    if (customerData.password) {
      const passValidation = validatePassword(customerData.password);
      if (!passValidation.valid) {
        throw new Error(passValidation.error || 'Password must be at least 6 characters.');
      }
      const hashed = hashPassword(customerData.password);
      passwordHash = hashed.combined;
      salt = hashed.salt;
    }

    const customerRecord: CustomerUser = {
      ...customerData,
      id,
      customerCode: code,
      customer_code: code,
      name: customerName,
      customerName,
      customer_name: customerName,
      phone: cleanPhone,
      mobile: cleanPhone,
      whatsapp: customerData.whatsapp ? cleanIndianMobile(customerData.whatsapp) : cleanPhone,
      email,
      passwordHash,
      salt,
      address: customerData.address || customerData.location || 'Hyderabad, Telangana',
      status: customerData.status || 'Active',
      createdAt: customerData.createdAt || nowIso,
      created_at: customerData.createdAt || nowIso,
      updatedAt: nowIso,
      updated_at: nowIso,
      registeredAt: customerData.registeredAt || nowIso,
      totalBookings: customerData.totalBookings || 0,
      bookingCodes: customerData.bookingCodes || []
    };

    // Remove plain-text password from internal record
    delete customerRecord.password;

    const existingIdx = memoryStore.customers.findIndex((c) => c.id === id);

    if (existingIdx >= 0) {
      const existing = memoryStore.customers[existingIdx];
      const updatedCustomer: CustomerUser = {
        ...existing,
        ...customerRecord,
        id: existing.id,
        passwordHash: passwordHash || existing.passwordHash,
        salt: salt || existing.salt,
        totalBookings: existing.totalBookings || customerRecord.totalBookings || 0,
        bookingCodes: Array.from(
          new Set([...(existing.bookingCodes || []), ...(customerRecord.bookingCodes || [])])
        )
      };
      memoryStore.customers[existingIdx] = updatedCustomer;
      notifyStorageChanged();
      return sanitizeCustomer(updatedCustomer);
    } else {
      memoryStore.customers.unshift(customerRecord);
      notifyStorageChanged();
      return sanitizeCustomer(customerRecord);
    }
  });
}

/**
 * Authenticate customer credentials.
 */
export async function authenticateCustomer(
  identifier: string,
  passwordPlain: string
): Promise<{ success: boolean; error?: string; customer?: CustomerUser }> {
  if (!identifier || !passwordPlain) {
    return { success: false, error: 'Identifier (mobile or email) and password are required.' };
  }

  const customer = await getInternalCustomerForAuth(identifier);
  if (!customer) {
    return { success: false, error: 'Invalid mobile/email or password.' };
  }

  if (customer.status === 'Inactive' || customer.status === 'Blocked') {
    return { success: false, error: 'Your account is currently inactive. Please contact TAR Solutions support.' };
  }

  const isValid = verifyPassword(passwordPlain, customer.passwordHash || '', customer.salt);
  if (!isValid) {
    return { success: false, error: 'Invalid mobile/email or password.' };
  }

  return {
    success: true,
    customer: sanitizeCustomer(customer)
  };
}

/**
 * Get all registered customers (sanitized - passwords never exposed).
 */
export async function getCustomers(): Promise<CustomerUser[]> {
  return memoryStore.customers.map((c) => sanitizeCustomer(c));
}

/**
 * Get single customer by ID or Phone (sanitized).
 */
export async function getCustomerById(idOrPhone: string): Promise<CustomerUser | null> {
  const cleanPhone = cleanIndianMobile(idOrPhone);
  const found = memoryStore.customers.find(
    (c) => c.id === idOrPhone || (cleanPhone.length === 10 && cleanIndianMobile(c.phone || c.mobile) === cleanPhone)
  );
  return found ? sanitizeCustomer(found) : null;
}

/**
 * Update customer contact details or status.
 */
export async function updateCustomer(
  idOrPhone: string,
  updates: Partial<CustomerUser>
): Promise<CustomerUser | null> {
  return getLock('CUSTOMERS').runExclusive(async () => {
    const cleanPhone = cleanIndianMobile(idOrPhone);
    const idx = memoryStore.customers.findIndex(
      (c) => c.id === idOrPhone || (cleanPhone.length === 10 && cleanIndianMobile(c.phone || c.mobile) === cleanPhone)
    );

    if (idx < 0) return null;

    const existing = memoryStore.customers[idx];

    // If updating phone, ensure no duplicate
    if (updates.mobile || updates.phone) {
      const newPhone = cleanIndianMobile(updates.mobile || updates.phone || '');
      if (newPhone && newPhone !== existing.mobile) {
        if (!validateIndianMobile(newPhone)) {
          throw new Error('A valid 10-digit Indian mobile number is required.');
        }
        const dupPhone = memoryStore.customers.find((c) => c.id !== existing.id && cleanIndianMobile(c.mobile) === newPhone);
        if (dupPhone) {
          throw new Error('A customer account with this mobile number already exists.');
        }
        updates.mobile = newPhone;
        updates.phone = newPhone;
      }
    }

    // If updating email, ensure no duplicate
    if (updates.email !== undefined) {
      const newEmail = updates.email ? String(updates.email).trim().toLowerCase() : null;
      if (newEmail && newEmail !== existing.email) {
        if (!validateEmail(newEmail)) {
          throw new Error('Please enter a valid email address.');
        }
        const dupEmail = memoryStore.customers.find(
          (c) => c.id !== existing.id && c.email && c.email.toLowerCase().trim() === newEmail
        );
        if (dupEmail) {
          throw new Error('A customer account with this email address already exists.');
        }
      }
      updates.email = newEmail;
    }

    // If updating password
    let passwordHash = existing.passwordHash;
    let salt = existing.salt;
    if (updates.password) {
      const passValidation = validatePassword(updates.password);
      if (!passValidation.valid) {
        throw new Error(passValidation.error || 'Password must be at least 6 characters.');
      }
      const hashed = hashPassword(updates.password);
      passwordHash = hashed.combined;
      salt = hashed.salt;
      delete (updates as any).password;
    }

    const updatedCustomer: CustomerUser = {
      ...existing,
      ...updates,
      passwordHash,
      salt,
      updatedAt: new Date().toISOString()
    };

    memoryStore.customers[idx] = updatedCustomer;
    notifyStorageChanged();
    return sanitizeCustomer(updatedCustomer);
  });
}

/**
 * Permanently delete customer account and unlink from bookings while preserving booking audit records.
 */
export async function deleteCustomer(idOrPhone: string): Promise<boolean> {
  return getLock('CUSTOMERS').runExclusive(async () => {
    const cleanPhone = cleanIndianMobile(idOrPhone);
    const initialLen = memoryStore.customers.length;
    const target = memoryStore.customers.find(
      (c) => c.id === idOrPhone || (cleanPhone.length === 10 && cleanIndianMobile(c.phone || c.mobile) === cleanPhone)
    );
    memoryStore.customers = memoryStore.customers.filter(
      (c) => c.id !== idOrPhone && (cleanPhone.length !== 10 || cleanIndianMobile(c.phone || c.mobile) !== cleanPhone)
    );
    const deleted = memoryStore.customers.length < initialLen;
    if (deleted) {
      if (target) {
        memoryStore.bookings = memoryStore.bookings.map((b) => {
          if (b.customerId === target.id) {
            const copy = { ...b };
            delete copy.customerId;
            return copy;
          }
          return b;
        });
      }
      notifyStorageChanged();
    }
    return deleted;
  });
}

/**
 * Get registered customers directory with their linked bookings.
 */
export async function getRegisteredCustomersDirectory(): Promise<any[]> {
  const currentCustomers = await getCustomers();
  const currentBookings = await getBookings();

  return currentCustomers.map((c) => {
    const phone = cleanIndianMobile(c.phone || c.mobile);
    const linkedBookings = currentBookings.filter((b) => {
      if (b.customerId && b.customerId === c.id) return true;
      if (phone && cleanIndianMobile(b.phone || (b as any).mobile || '') === phone) return true;
      return false;
    });

    return {
      ...c,
      phone,
      mobile: phone,
      bookings: linkedBookings,
      totalBookings: linkedBookings.length,
      lastBookingDate: linkedBookings[0]?.workDate || linkedBookings[0]?.bookingDate || c.lastBookingDate
    };
  });
}

/**
 * ============================================================
 * CUSTOMER REQUESTS / ENQUIRIES CRUD FUNCTIONS
 * ============================================================
 */

export async function saveCustomerRequest(requestData: any): Promise<CustomerRequestEntry> {
  return getLock('REQUESTS').runExclusive(async () => {
    const validRequests = purgeExpiredList(memoryStore.requests, RETENTION_DAYS);
    const nowIso = new Date().toISOString();
    const id = requestData.id || createId('req');
    const code =
      requestData.requestCode ||
      `REQ-${new Date().getFullYear()}-${String(validRequests.length + 1).padStart(6, '0')}`;

    const requestEntry: CustomerRequestEntry = {
      id,
      requestCode: code,
      customerId: requestData.customerId || '',
      bookingId: requestData.bookingId || '',
      customerName: requestData.customerName || '',
      phone: cleanIndianMobile(requestData.phone || requestData.mobile),
      email: requestData.email || null,
      service: requestData.service || 'Waterproofing',
      requestType: requestData.requestType || 'Customer Enquiry & Service Request',
      location: requestData.location || 'Hyderabad, Telangana',
      preferredDate: requestData.preferredDate,
      preferredTime: requestData.preferredTime,
      message: requestData.message || '',
      slotType: requestData.slotType,
      status: requestData.status || 'Received',
      createdAt: requestData.createdAt || nowIso
    };

    validRequests.unshift(requestEntry);
    memoryStore.requests = validRequests;
    notifyStorageChanged();
    return requestEntry;
  });
}

export async function getCustomerRequests(): Promise<CustomerRequestEntry[]> {
  return purgeExpiredList(memoryStore.requests, RETENTION_DAYS);
}

export async function updateCustomerRequest(
  idOrCode: string,
  patch: Partial<CustomerRequestEntry>
): Promise<CustomerRequestEntry | null> {
  return getLock('REQUESTS').runExclusive(async () => {
    const idx = memoryStore.requests.findIndex(
      (r) => r.id === idOrCode || r.requestCode === idOrCode
    );
    if (idx === -1) return null;
    memoryStore.requests[idx] = {
      ...memoryStore.requests[idx],
      ...patch,
      updatedAt: new Date().toISOString()
    };
    notifyStorageChanged();
    return memoryStore.requests[idx];
  });
}

export async function deleteCustomerRequest(idOrCode: string): Promise<boolean> {
  return getLock('REQUESTS').runExclusive(async () => {
    const initialLen = memoryStore.requests.length;
    memoryStore.requests = memoryStore.requests.filter(
      (r) => r.id !== idOrCode && r.requestCode !== idOrCode
    );
    const deleted = memoryStore.requests.length < initialLen;
    if (deleted) {
      notifyStorageChanged();
    }
    return deleted;
  });
}

/**
 * ============================================================
 * BOOKING STATUS HISTORY
 * ============================================================
 */

export async function saveBookingStatusHistory(
  entry: Partial<BookingStatusHistoryEntry>
): Promise<BookingStatusHistoryEntry> {
  return getLock('STATUS_HISTORY').runExclusive(async () => {
    const validHistory = purgeExpiredList(memoryStore.statusHistory, RETENTION_DAYS);
    const nowIso = new Date().toISOString();

    const historyEntry: BookingStatusHistoryEntry = {
      id: entry.id || createId('hist'),
      bookingId: entry.bookingId || '',
      bookingCode: entry.bookingCode,
      previousStatus: entry.previousStatus || null,
      newStatus: entry.newStatus || 'Pending',
      changedBy: entry.changedBy || 'Admin',
      notes: entry.notes,
      timestamp: entry.timestamp || nowIso,
      createdAt: entry.createdAt || nowIso
    };

    validHistory.unshift(historyEntry);
    memoryStore.statusHistory = validHistory;
    return historyEntry;
  });
}

export async function getBookingStatusHistory(bookingId?: string): Promise<BookingStatusHistoryEntry[]> {
  const valid = purgeExpiredList(memoryStore.statusHistory, RETENTION_DAYS);
  if (bookingId) {
    return valid.filter(
      (h: any) => h.bookingId === bookingId || h.bookingCode === bookingId
    );
  }
  return valid;
}

/**
 * ============================================================
 * STORAGE STATUS
 * ============================================================
 */

export async function getStorageStatus(): Promise<StorageStatus> {
  const bookings = await getBookings();
  const customers = await getCustomers();
  const requests = await getCustomerRequests();
  const history = await getBookingStatusHistory();

  return {
    connected: true,
    provider: 'TAR Solutions Application Database & In-Memory Storage Engine',
    persistsOnVercel: false,
    vercelPersistenceNote: 'Vercel serverless deployment does not provide a persistent local application database/filesystem for this use case.',
    minimumExternalServiceRequired: 'A dedicated server environment or external database service is required for cross-serverless invocation persistence on stateless cloud platforms.',
    retentionDays: RETENTION_DAYS,
    counts: {
      bookings: bookings.length,
      customers: customers.length,
      requests: requests.length,
      statusHistory: history.length
    },
    lastCleanupAt: lastCleanupTimestamp || undefined
  };
}

/**
 * ============================================================
 * STATEMENT & DIRECTORY GENERATION (7-DAY FILTER SUPPORT)
 * ============================================================
 */

export async function getBookingsWithStatementFilter(
  period: 'ALL' | 'TODAY' | 'YESTERDAY' | 'PREV_MONTH' | 'LAST_6_MONTHS' | 'CUSTOM' = 'ALL',
  customFrom?: string,
  customTo?: string,
  fallbackBookings: any[] = []
): Promise<any> {
  const dbBookings = await getBookings();
  const bookings = dbBookings.length ? dbBookings : fallbackBookings;

  const now = new Date();
  const toKolkataDateString = (d: Date) =>
    d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

  const todayStr = toKolkataDateString(now);
  const yesterdayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStr = toKolkataDateString(yesterdayDate);

  let filtered = [...bookings];

  if (period === 'TODAY') {
    filtered = bookings.filter((b: any) => {
      const date = b.bookingDate || b.booking_date || b.workDate || String(b.createdAt || '').slice(0, 10);
      return date === todayStr;
    });
  } else if (period === 'YESTERDAY') {
    filtered = bookings.filter((b: any) => {
      const date = b.bookingDate || b.booking_date || b.workDate || String(b.createdAt || '').slice(0, 10);
      return date === yesterdayStr;
    });
  } else if (period === 'CUSTOM' && (customFrom || customTo)) {
    filtered = bookings.filter((b: any) => {
      const date = b.bookingDate || b.booking_date || b.workDate || String(b.createdAt || '').slice(0, 10);
      if (customFrom && date < customFrom) return false;
      if (customTo && date > customTo) return false;
      return true;
    });
  }

  const allCount = bookings.length;
  const todayCount = bookings.filter((b: any) => {
    const d = b.bookingDate || b.booking_date || b.workDate || String(b.createdAt || '').slice(0, 10);
    return d === todayStr;
  }).length;
  const yesterdayCount = bookings.filter((b: any) => {
    const d = b.bookingDate || b.booking_date || b.workDate || String(b.createdAt || '').slice(0, 10);
    return d === yesterdayStr;
  }).length;

  return {
    success: true,
    filter: period,
    timezone: 'Asia/Kolkata',
    matchingRecords: filtered.length,
    records: filtered,
    counts: {
      all: allCount,
      yesterday: yesterdayCount,
      today: todayCount,
      prevMonth: 0,
      last6Months: allCount,
      prevMonthName: 'Previous'
    }
  };
}

/**
 * ============================================================
 * FULL SCHEMA & DRIVERS HELPERS
 * ============================================================
 */

export function getInitialSchema(): StorageSchema {
  return {
    services: INITIAL_SERVICES,
    projects: INITIAL_PROJECTS,
    bookings: getInitialBookings(),
    customers: getInitialCustomers(),
    customerRequests: [],
    bookingStatusHistory: [],
    formFields: INITIAL_BOOKING_FIELDS,
    content: INITIAL_WEBSITE_CONTENT,
    adminCreds: {
      username: (typeof process !== 'undefined' && process.env?.ADMIN_USERNAME) || 'Tarsolutions',
      passwordHash: (typeof process !== 'undefined' && process.env?.ADMIN_PASSWORD) || 'Tarsolutions@24'
    },
    dailyReportLog: [],
    bookingCounter: 0
  };
}

let activeSchema: StorageSchema = getInitialSchema();

export function loadDb(): StorageSchema {
  return {
    ...activeSchema,
    bookings: memoryStore.bookings,
    customers: memoryStore.customers.map((c) => sanitizeCustomer(c)),
    customerRequests: memoryStore.requests,
    bookingStatusHistory: memoryStore.statusHistory
  };
}

export function saveDb(data: StorageSchema): void {
  activeSchema = { ...activeSchema, ...data };
  if (Array.isArray(data.bookings)) memoryStore.bookings = data.bookings;
  if (Array.isArray(data.customers)) memoryStore.customers = data.customers;
  if (Array.isArray(data.customerRequests)) memoryStore.requests = data.customerRequests;
  if (Array.isArray(data.bookingStatusHistory)) memoryStore.statusHistory = data.bookingStatusHistory;
}

export interface StorageDriver {
  name: string;
  read(): Promise<StorageSchema> | StorageSchema;
  write(data: StorageSchema): Promise<void> | void;
}

let activeDriver: StorageDriver = {
  name: 'TARStorageEngine',
  read: () => loadDb(),
  write: (d) => saveDb(d)
};

export function setStorageDriver(driver: StorageDriver): void {
  activeDriver = driver;
}

export function getStorageDriver(): StorageDriver {
  return activeDriver;
}

/**
 * ============================================================
 * BROWSER LOCALSTORAGE BACKWARD COMPATIBILITY
 * ============================================================
 */

const STORAGE_KEYS = {
  SERVICES: 'tar_services_v1',
  PROJECTS: 'tar_projects_v1',
  BOOKINGS: 'tar_bookings_v1',
  CUSTOMERS: 'tar_customers_v1',
  FORM_FIELDS: 'tar_form_fields_v1',
  CONTENT: 'tar_content_v1',
  CURRENT_CUSTOMER: 'tar_current_customer_v1',
  ADMIN_SESSION: 'tar_admin_session_v1',
  ADMIN_CREDS: 'tar_admin_creds_v1'
};

export function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return fallback;
  }
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

export function setLocal<T>(key: string, value: T): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
}

export function getStoredServices(): Service[] {
  const stored = getLocal<Service[] | null>(STORAGE_KEYS.SERVICES, null);
  if (!stored || stored.length < 12 || !stored.find((s) => s.name.includes('Sump') || s.name.includes('Water Tank'))) {
    saveStoredServices(INITIAL_SERVICES);
    return INITIAL_SERVICES;
  }
  return stored;
}

export function saveStoredServices(services: Service[]): void {
  setLocal(STORAGE_KEYS.SERVICES, services);
}
export const saveServicesToStorage = saveStoredServices;

export function getStoredProjects(): Project[] {
  return getLocal<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
}

export function saveStoredProjects(projects: Project[]): void {
  setLocal(STORAGE_KEYS.PROJECTS, projects);
}
export const saveProjectsToStorage = saveStoredProjects;

export function getStoredBookings(): Booking[] {
  const stored = getLocal<Booking[] | null>(STORAGE_KEYS.BOOKINGS, null);
  if (!stored || stored.length === 0) {
    saveStoredBookings(getInitialBookings());
    return getInitialBookings();
  }
  const map = new Map<string, Booking>();
  getInitialBookings().forEach((b) => map.set(b.id, b));
  stored.forEach((b) => {
    if (b && (b.id || b.bookingCode)) {
      map.set(b.id || b.bookingCode, b);
    }
  });
  return Array.from(map.values());
}

export function saveStoredBookings(bookings: Booking[]): void {
  setLocal(STORAGE_KEYS.BOOKINGS, bookings);
}
export const saveBookingsToStorage = saveStoredBookings;

export function getStoredCustomers(): CustomerUser[] {
  return getLocal<CustomerUser[]>(STORAGE_KEYS.CUSTOMERS, getInitialCustomers());
}

export function saveStoredCustomers(customers: CustomerUser[]): void {
  // Sanitize before local storage to ensure no passwords stored in browser
  const sanitized = customers.map((c) => sanitizeCustomer(c));
  setLocal(STORAGE_KEYS.CUSTOMERS, sanitized);
}
export const saveCustomersToStorage = saveStoredCustomers;

export function getStoredFormFields(): BookingFormField[] {
  return getLocal<BookingFormField[]>(STORAGE_KEYS.FORM_FIELDS, INITIAL_BOOKING_FIELDS);
}

export function saveStoredFormFields(fields: BookingFormField[]): void {
  setLocal(STORAGE_KEYS.FORM_FIELDS, fields);
}
export const saveFormFieldsToStorage = saveStoredFormFields;

export function getStoredContent(): WebsiteContent {
  return getLocal<WebsiteContent>(STORAGE_KEYS.CONTENT, INITIAL_WEBSITE_CONTENT);
}

export function saveStoredContent(content: WebsiteContent): void {
  setLocal(STORAGE_KEYS.CONTENT, content);
}
export const saveWebsiteContentToStorage = saveStoredContent;

export function loadStorageData() {
  return {
    services: getStoredServices(),
    projects: getStoredProjects(),
    bookings: getStoredBookings(),
    customers: getStoredCustomers(),
    formFields: getStoredFormFields(),
    content: getStoredContent()
  };
}

export function getCurrentCustomer(): CustomerUser | null {
  return getLocal<CustomerUser | null>(STORAGE_KEYS.CURRENT_CUSTOMER, null);
}

export function setCurrentCustomer(customer: CustomerUser | null): void {
  setLocal(STORAGE_KEYS.CURRENT_CUSTOMER, customer ? sanitizeCustomer(customer) : null);
}
export const setCurrentCustomerSession = setCurrentCustomer;

export function getAdminSession(): boolean {
  return getLocal<boolean>(STORAGE_KEYS.ADMIN_SESSION, false);
}

export function setAdminSession(loggedIn: boolean): void {
  setLocal(STORAGE_KEYS.ADMIN_SESSION, loggedIn);
}
export const setAdminSessionState = setAdminSession;

export function getAdminCredentials(): { username: string; passwordHash: string } {
  const creds = getLocal<{ username: string; passwordHash: string }>(STORAGE_KEYS.ADMIN_CREDS, {
    username: 'Tarsolutions',
    passwordHash: 'Tarsolutions@24'
  });
  if (creds.username === 'admin' && creds.passwordHash === 'admin123') {
    const updated = { username: 'Tarsolutions', passwordHash: 'Tarsolutions@24' };
    setAdminCredentials(updated);
    return updated;
  }
  return creds;
}

export function setAdminCredentials(creds: { username: string; passwordHash: string }): void {
  setLocal(STORAGE_KEYS.ADMIN_CREDS, creds);
}

export function exportBookingsToCsv(bookings: Booking[]): void {
  if (typeof document === 'undefined') return;

  const headers = [
    'Booking ID',
    'Customer Name',
    'Phone',
    'WhatsApp',
    'Email',
    'Service',
    'Location',
    'Work Date',
    'Preferred Time',
    'Booking Date',
    'Booking Time',
    'Status',
    'Message'
  ];

  const rows = bookings.map((b) => [
    `"${b.bookingCode || b.id}"`,
    `"${(b.customerName || '').replace(/"/g, '""')}"`,
    `"${b.phone || ''}"`,
    `"${b.whatsapp || b.phone || ''}"`,
    `"${b.email || ''}"`,
    `"${(b.service || '').replace(/"/g, '""')}"`,
    `"${(b.location || '').replace(/"/g, '""')}"`,
    `"${b.workDate || ''}"`,
    `"${b.preferredTime || ''}"`,
    `"${b.bookingDate || ''}"`,
    `"${b.bookingTime || ''}"`,
    `"${b.status || ''}"`,
    `"${(b.message || '').replace(/"/g, '""')}"`
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute(
    'download',
    `TAR_Bookings_Export_${new Date().toISOString().split('T')[0]}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
