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

export type BookingStatus = 'New' | 'Contacted' | 'Confirmed' | 'Completed' | 'Cancelled';

export interface Booking {
  id: string;
  bookingCode: string; // e.g. TAR-2026-0801
  customerName: string;
  phone: string;
  whatsapp: string;
  email: string;
  service: string;
  serviceId?: string;
  location: string;
  workDate: string;
  preferredTime: string;
  message?: string;
  photos?: string[];
  bookingDate: string; // YYYY-MM-DD
  bookingTime: string; // HH:mm:ss
  status: BookingStatus;
  notes?: string;
  customerId?: string;
  slotType?: 'Book Free Survey' | 'HYDERABAD SITE INSPECTION & WATERPROOFING ASSESSMENT' | 'Customer Enquiry & Service Request' | string;
  sourceSlot?: string;
  createdAt?: string;
  registeredAt?: string;
  customFields?: Record<string, any>;
  supabaseSynced?: boolean;
  supabaseTable?: string;
  supabaseError?: string;
}

export interface CustomerUser {
  id: string;
  name: string;
  mobile: string;
  email: string;
  password?: string;
  passwordHash?: string;
  createdAt: string;
  registeredAt?: string;
  registeredSlot?: string;
  totalBookings?: number;
  lastBookingDate?: string;
  bookingCodes?: string[];
  status: 'Active' | 'Blocked';
  address?: string;
}

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
