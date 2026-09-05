export interface Service {
  id: string;
  order: number;
  number: number;
  name: string;
  nameTelugu?: string;
  slug: string;
  image: string;
  galleryImages?: string[];
  shortDescription: string;
  shortDescriptionTelugu?: string;
  bulletPoints?: string[];
  bulletPointsTelugu?: string[];
  problemExplanation: string;
  problemExplanationTelugu?: string;
  solutionExplanation: string;
  solutionExplanationTelugu?: string;
  workProcess: string[];
  workProcessTelugu?: string[];
  features?: string[];
  featuresTelugu?: string[];
  buttonText?: string;
  buttonTextTelugu?: string;
  isHidden?: boolean;
}

export interface ProjectMedia {
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  caption?: string;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  serviceId?: string;
  serviceName: string;
  description: string;
  date: string;
  beforeMedia: ProjectMedia;
  duringMedia: ProjectMedia;
  afterMedia: ProjectMedia;
  featured?: boolean;
}

export type BookingStatus = 'New' | 'Contacted' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Pending' | 'Scheduled' | 'Site Inspection Completed' | 'Quotation Sent' | 'In Progress' | 'Closed';

export interface Booking {
  id: string;
  bookingCode: string; // e.g. CA-2026-000001
  booking_code?: string;
  customerId?: string;
  customer_id?: string;
  customerName: string;
  customer_name?: string;
  phone: string;
  alternatePhone?: string;
  alternate_phone?: string;
  whatsapp?: string;
  email?: string;
  service: string;
  serviceType?: string;
  service_type?: string;
  serviceId?: string;
  requestType?: string;
  request_type?: string;
  location: string;
  projectLocation?: string;
  project_location?: string;
  workDate?: string;
  preferredDate?: string;
  preferred_date?: string;
  preferredTime?: string;
  preferredTimeSlot?: string;
  preferred_time_slot?: string;
  message?: string;
  notes?: string;
  photos?: string[];
  bookingDate?: string; // YYYY-MM-DD
  bookingTime?: string; // HH:mm:ss
  status: BookingStatus;
  bookingStatus?: string;
  booking_status?: string;
  orderStatus?: string;
  order_status?: string;
  slotType?: 'Book Free Survey' | 'HYDERABAD SITE INSPECTION & WATERPROOFING ASSESSMENT' | 'Customer Enquiry & Service Request' | string;
  sourceSlot?: string;
  sourceChannel?: string;
  source_channel?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  registeredAt?: string;
  customFields?: Record<string, any>;
}

export interface CustomerUser {
  id: string;
  authUserId?: string;
  auth_user_id?: string;
  customerCode?: string;
  customer_code?: string;
  name: string;
  customerName?: string;
  customer_name?: string;
  mobile: string;
  phone?: string;
  alternatePhone?: string;
  alternate_phone?: string;
  email?: string | null;
  password?: string;
  passwordHash?: string;
  salt?: string;
  address?: string;
  area?: string;
  locality?: string;
  city?: string;
  state?: string;
  pincode?: string;
  createdAt: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  registeredAt?: string;
  registered_at?: string;
  registeredSlot?: string;
  sourceChannel?: string;
  source_channel?: string;
  totalBookings?: number;
  lastBookingDate?: string;
  bookingCodes?: string[];
  bookings?: Booking[];
  status: 'Active' | 'Inactive' | 'Pending' | 'Blocked';
}

export interface CustomerRequest {
  id: string;
  requestCode: string;
  customerId?: string;
  customerName: string;
  phone: string;
  email?: string;
  serviceType: string;
  requestType: string;
  location: string;
  preferredDate?: string;
  preferredTimeSlot?: string;
  problemDetails?: string;
  sourceChannel: string;
  requestStatus: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BookingStatusHistory {
  id: string;
  bookingId: string;
  previousStatus?: string;
  newStatus: string;
  changedBy: string;
  changedAt: string;
  notes?: string;
}

export type TimeRangeOption = 'ALL' | 'YESTERDAY' | 'TODAY' | 'PREV_MONTH' | 'LAST_6_MONTHS' | 'CUSTOM';

export interface BookingFormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'tel' | 'email' | 'select' | 'date' | 'time' | 'textarea' | 'file';
  placeholder: string;
  required: boolean;
  enabled: boolean;
  order: number;
  options?: string[];
}

export interface WhyChooseUsItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface WebsiteContent {
  business: {
    name: string;
    fullName: string;
    tagline: string;
    subheading: string;
    heroHeading: string;
    heroDescription: string;
    heroBackgroundImage: string;
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    googleMapsEmbedUrl: string;
    googleMapsDirectionsUrl: string;
    logoUrl?: string;
    workingHours: string;
    emergencyAvailable: boolean;
  };
  about: {
    companyIntro: string;
    aboutTAR: string;
    waterproofingExpertise: string;
    civilWorks: string;
    qualityAssurance: string;
    customerService: string;
    teamDescription: string;
  };
  whyChooseUs: WhyChooseUsItem[];
  bookingSettings: {
    enableBooking: boolean;
    enableGuestBooking: boolean;
    enableCustomerAccounts: boolean;
    slotTimes: string[];
    noticeHours: number;
  };
  notificationSettings: {
    adminEmail: string;
    adminWhatsapp: string;
    emailNotificationsEnabled: boolean;
    whatsappNotificationsEnabled: boolean;
    whatsappApiProvider: string;
    whatsappApiKey: string;
    whatsappBusinessNumber: string;
    whatsappTemplateId: string;
    googleSheetsWebhookUrl?: string;
  };
  reportSettings: {
    dailyReportTime: string; // "22:00"
    reportEmail: string;
    autoSendDailyPdf: boolean;
    timezone: string; // "Asia/Kolkata"
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
    ogTitle: string;
    ogDescription: string;
    ogImage?: string;
  };
  footer: {
    aboutText: string;
    copyrightText: string;
    socialLinks: {
      facebook?: string;
      instagram?: string;
      youtube?: string;
      linkedin?: string;
    };
  };
}
