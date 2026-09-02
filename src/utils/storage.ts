import { Service, Project, Booking, CustomerUser, BookingFormField, WebsiteContent } from '../types';
import { INITIAL_SERVICES, INITIAL_PROJECTS, INITIAL_BOOKING_FIELDS, INITIAL_WEBSITE_CONTENT, INITIAL_SAMPLE_BOOKINGS } from '../data/initialData';

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

// Safe LocalStorage helpers
export function getLocal<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

export function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
}

// Initializers
export function getStoredServices(): Service[] {
  const stored = getLocal<Service[] | null>(STORAGE_KEYS.SERVICES, null);
  // Ensure we always have all 12 services with full bilingual definitions
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
    saveStoredBookings(INITIAL_SAMPLE_BOOKINGS);
    return INITIAL_SAMPLE_BOOKINGS;
  }
  // Ensure default sample history is retained alongside any user-created bookings
  const map = new Map<string, Booking>();
  INITIAL_SAMPLE_BOOKINGS.forEach((b) => map.set(b.id, b));
  stored.forEach((b) => {
    if (b && (b.id || b.bookingCode)) {
      map.set(b.id || b.bookingCode, b);
    }
  });
  const merged = Array.from(map.values());
  return merged;
}

export function saveStoredBookings(bookings: Booking[]): void {
  setLocal(STORAGE_KEYS.BOOKINGS, bookings);
}
export const saveBookingsToStorage = saveStoredBookings;

export function getStoredCustomers(): CustomerUser[] {
  return getLocal<CustomerUser[]>(STORAGE_KEYS.CUSTOMERS, [
    {
      id: 'cust-1',
      name: 'Kishore Reddy',
      mobile: '9848012345',
      email: 'kishore.reddy@example.com',
      password: 'user123',
      passwordHash: 'user123',
      createdAt: '2026-08-20',
      status: 'Active',
      address: 'Kondapur, Hyderabad'
    }
  ]);
}

export function saveStoredCustomers(customers: CustomerUser[]): void {
  setLocal(STORAGE_KEYS.CUSTOMERS, customers);
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
  setLocal(STORAGE_KEYS.CURRENT_CUSTOMER, customer);
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
  // Auto-migrate legacy default credentials if present
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

// Generate unique booking code e.g. TAR-2026-XXXX
export function generateBookingCode(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TAR-${year}-${rand}`;
}

// CSV Export Helper
export function exportBookingsToCsv(bookings: Booking[]): void {
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

  const rows = bookings.map(b => [
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

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `TAR_Bookings_Export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
