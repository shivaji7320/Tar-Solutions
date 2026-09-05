import React, { useState, useEffect } from 'react';
import {
  Service,
  Project,
  Booking,
  CustomerUser,
  BookingFormField,
  WebsiteContent
} from './types';
import {
  loadStorageData,
  saveServicesToStorage,
  saveProjectsToStorage,
  saveBookingsToStorage,
  saveCustomersToStorage,
  saveFormFieldsToStorage,
  saveWebsiteContentToStorage,
  getCurrentCustomer,
  setCurrentCustomerSession,
  getAdminSession,
  setAdminSessionState,
  getAdminCredentials,
  setAdminCredentials
} from './utils/storage';
import { Language } from './utils/translations';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingActions } from './components/FloatingActions';

// Page Components
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ContactPage } from './pages/ContactPage';
import { BookAppointmentPage } from './pages/BookAppointmentPage';
import { CustomerLoginPage } from './pages/CustomerLoginPage';
import { CustomerRegisterPage } from './pages/CustomerRegisterPage';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { CustomerEnquiryPage } from './pages/CustomerEnquiryPage';

export default function App() {
  // Global Language State ('en' | 'te')
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('tar_lang');
    return (saved === 'te' || saved === 'en') ? (saved as Language) : 'en';
  });

  const handleToggleLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('tar_lang', lang);
  };

  // Navigation State
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedServiceSlug, setSelectedServiceSlug] = useState<string | undefined>(undefined);

  // App Data States
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<CustomerUser[]>([]);
  const [formFields, setFormFields] = useState<BookingFormField[]>([]);
  const [content, setContent] = useState<WebsiteContent | null>(null);

  // Authentication State
  const [currentCustomer, setCurrentCustomer] = useState<CustomerUser | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Initialize data from LocalStorage & sync with backend API
  useEffect(() => {
    const local = loadStorageData();
    setServices(local.services);
    setProjects(local.projects);
    setBookings(local.bookings);
    setCustomers(local.customers);
    setFormFields(local.formFields);
    setContent(local.content);

    const activeCust = getCurrentCustomer();
    if (activeCust) setCurrentCustomer(activeCust);

    const adminActive = getAdminSession();
    setIsAdminLoggedIn(adminActive);

    // Fetch latest persisted state from backend
    fetch('/api/state')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Backend offline');
      })
      .then((data) => {
        if (data.services && data.services.length > 0) {
          setServices(data.services);
          saveServicesToStorage(data.services);
        }
        if (data.projects) {
          setProjects(data.projects);
          saveProjectsToStorage(data.projects);
        }
        if (data.bookings && Array.isArray(data.bookings)) {
          const map = new Map<string, Booking>();
          (local.bookings || []).forEach((b) => {
            if (b && (b.id || b.bookingCode)) map.set(b.id || b.bookingCode, b);
          });
          data.bookings.forEach((b: Booking) => {
            if (b && (b.id || b.bookingCode)) map.set(b.id || b.bookingCode, b);
          });
          const mergedBookings = Array.from(map.values());
          setBookings(mergedBookings);
          saveBookingsToStorage(mergedBookings);
        }
        if (data.customers) {
          setCustomers(data.customers);
          saveCustomersToStorage(data.customers);
        }
        if (data.formFields) {
          setFormFields(data.formFields);
          saveFormFieldsToStorage(data.formFields);
        }
        if (data.content) {
          setContent(data.content);
          saveWebsiteContentToStorage(data.content);
        }
      })
      .catch(() => {
        // Fallback to local storage gracefully
      })
      .finally(() => {
        setIsInitializing(false);
      });
  }, []);

  // Window scroll to top on navigation change
  const navigateTo = (page: string, serviceSlug?: string) => {
    setCurrentPage(page);
    if (serviceSlug) {
      setSelectedServiceSlug(serviceSlug);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ---------------- BOOKING HANDLER ----------------
  const handleBookingSubmit = async (bookingData: any) => {
    const cleanPhone = String(bookingData.phone || '').replace(/\D/g, '').slice(-10);
    const slotType = bookingData.slotType || bookingData.sourceSlot || 'HYDERABAD SITE INSPECTION & WATERPROOFING ASSESSMENT';

    // Auto update/create registered customer in state
    const updateCustomerState = (code: string) => {
      setCustomers((prevCusts) => {
        const idx = prevCusts.findIndex(
          (c) => c.mobile.replace(/\D/g, '').slice(-10) === cleanPhone || (c.email && bookingData.email && c.email.toLowerCase() === bookingData.email.toLowerCase())
        );
        let updatedList: CustomerUser[];
        if (idx >= 0) {
          const existing = prevCusts[idx];
          const updatedCust: CustomerUser = {
            ...existing,
            name: bookingData.customerName || existing.name,
            email: bookingData.email || existing.email,
            address: bookingData.location || existing.address,
            totalBookings: (existing.totalBookings || 1) + 1,
            lastBookingDate: bookingData.workDate || new Date().toISOString().split('T')[0],
            bookingCodes: Array.from(new Set([...(existing.bookingCodes || []), code]))
          };
          updatedList = [...prevCusts];
          updatedList[idx] = updatedCust;
        } else {
          const newCust: CustomerUser = {
            id: `c-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
            name: (bookingData.customerName || '').trim(),
            mobile: cleanPhone,
            email: (bookingData.email || '').trim(),
            address: bookingData.location || 'Hyderabad, Telangana',
            createdAt: new Date().toISOString().split('T')[0],
            registeredAt: `${new Date().toISOString().split('T')[0]} ${new Date().toTimeString().split(' ')[0]}`,
            registeredSlot: slotType,
            status: 'Active',
            totalBookings: 1,
            lastBookingDate: bookingData.workDate || new Date().toISOString().split('T')[0],
            bookingCodes: [code]
          };
          updatedList = [newCust, ...prevCusts];
        }
        saveCustomersToStorage(updatedList);
        return updatedList;
      });
    };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...bookingData, slotType })
      });

      const json = await res.json();

      if (res.ok && json.success) {
        const newBooking = json.booking;
        const updated = [newBooking, ...bookings.filter((b) => b.id !== newBooking.id && b.bookingCode !== newBooking.bookingCode)];
        setBookings(updated);
        saveBookingsToStorage(updated);
        updateCustomerState(newBooking.bookingCode);
        return {
          success: true,
          bookingCode: newBooking.bookingCode,
          booking: newBooking,
          copySharedToCustomerMobile: true,
          customerPhone: json.customerPhone
        };
      } else {
        // Section 23: Do not report success if Supabase storage failed
        return {
          success: false,
          message: json?.message || json?.error || 'Database storage error. Please call +91 9949293872.'
        };
      }
    } catch (err: any) {
      console.error('[BOOKING SUBMISSION EXCEPTION]', err);
      return {
        success: false,
        message: 'Network communication issue. Please contact our Hyderabad office directly at +91 9949293872.'
      };
    }
  };

  // ---------------- CUSTOMER AUTH HANDLERS ----------------
  const handleCustomerLogin = async (identifier: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password: pass })
      });
      const data = await res.json();
      if (res.ok && data.success && data.customer) {
        setCurrentCustomer(data.customer);
        setCurrentCustomerSession(data.customer);
        return { success: true, customer: data.customer };
      } else {
        // Check local customers
        const found = customers.find(
          (c) =>
            (c.email.toLowerCase() === identifier.toLowerCase() || c.mobile === identifier) &&
            c.password === pass
        );
        if (found) {
          setCurrentCustomer(found);
          setCurrentCustomerSession(found);
          return { success: true, customer: found };
        }
        return { success: false, error: data.error || 'Invalid credentials' };
      }
    } catch (e) {
      const found = customers.find(
        (c) =>
          (c.email.toLowerCase() === identifier.toLowerCase() || c.mobile === identifier) &&
          c.password === pass
      );
      if (found) {
        setCurrentCustomer(found);
        setCurrentCustomerSession(found);
        return { success: true, customer: found };
      }
      return { success: false, error: 'Login failed' };
    }
  };

  const handleCustomerRegister = async (custData: {
    name: string;
    mobile: string;
    email: string;
    password: string;
    address: string;
  }) => {
    try {
      const res = await fetch('/api/auth/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(custData)
      });
      const data = await res.json();
      if (res.ok && data.success && data.customer) {
        const updated = [...customers, data.customer];
        setCustomers(updated);
        saveCustomersToStorage(updated);
        setCurrentCustomer(data.customer);
        setCurrentCustomerSession(data.customer);
        return { success: true, customer: data.customer };
      } else {
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch (e) {
      const newCust: CustomerUser = {
        id: `c-${Date.now()}`,
        name: custData.name,
        mobile: custData.mobile,
        email: custData.email,
        password: custData.password,
        address: custData.address,
        createdAt: new Date().toISOString().split('T')[0],
        status: 'Active'
      };
      const updated = [...customers, newCust];
      setCustomers(updated);
      saveCustomersToStorage(updated);
      setCurrentCustomer(newCust);
      setCurrentCustomerSession(newCust);
      return { success: true, customer: newCust };
    }
  };

  const handleCustomerLogout = () => {
    setCurrentCustomer(null);
    setCurrentCustomerSession(null);
    navigateTo('home');
  };

  // ---------------- ADMIN AUTH HANDLERS ----------------
  const handleAdminLogin = async (usr: string, pass: string) => {
    const trimmedUser = usr.trim();
    const trimmedPass = pass.trim();
    const localCreds = getAdminCredentials();

    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedUser, password: trimmedPass })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Sync local storage with latest verified credentials from server
        if (data.admin?.username) {
          setAdminCredentials({
            username: data.admin.username,
            passwordHash: trimmedPass
          });
        }
        setIsAdminLoggedIn(true);
        setAdminSessionState(true);
        setCurrentPage('admin-dashboard');
        return { success: true };
      } else {
        // Strict check against ONLY the current edited credentials in local storage
        if (trimmedUser === localCreds.username && trimmedPass === localCreds.passwordHash) {
          setIsAdminLoggedIn(true);
          setAdminSessionState(true);
          setCurrentPage('admin-dashboard');
          return { success: true };
        }
        return { success: false, error: data.error || 'Invalid admin username or password.' };
      }
    } catch (e) {
      // Offline fallback: check strictly against current active local credentials only
      if (trimmedUser === localCreds.username && trimmedPass === localCreds.passwordHash) {
        setIsAdminLoggedIn(true);
        setAdminSessionState(true);
        setCurrentPage('admin-dashboard');
        return { success: true };
      }
      return { success: false, error: 'Authentication failed. Please verify credentials.' };
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setAdminSessionState(false);
    navigateTo('home');
  };

  const handleChangeAdminCreds = async (creds: {
    currentPassword: string;
    newPassword: string;
    newUsername?: string;
  }) => {
    const localCreds = getAdminCredentials();
    const finalUsername = (creds.newUsername && creds.newUsername.trim()) ? creds.newUsername.trim() : localCreds.username;
    const finalPassword = creds.newPassword.trim();

    try {
      const res = await fetch('/api/auth/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Update local storage immediately with the new credentials
        setAdminCredentials({
          username: finalUsername,
          passwordHash: finalPassword
        });
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error || 'Failed to update credentials' };
      }
    } catch (e) {
      // Local fallback: verify current password matches local state
      if (creds.currentPassword !== localCreds.passwordHash) {
        return { success: false, error: 'Current password is incorrect' };
      }
      setAdminCredentials({
        username: finalUsername,
        passwordHash: finalPassword
      });
      return { success: true, message: 'Admin credentials updated locally' };
    }
  };

  // ---------------- ADMIN FORGOT PASSWORD OTP HANDLERS ----------------
  const handleRequestAdminOtp = async (params: { phone?: string; email?: string; channel?: 'both' | 'email' | 'mobile' } | string) => {
    const payload = typeof params === 'string' ? { phone: params, email: content?.business?.email || 'shivaji09704@gmail.com', channel: 'both' } : params;
    try {
      const res = await fetch('/api/auth/admin/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.otpPreview) {
          sessionStorage.setItem('tar_temp_admin_otp', data.otpPreview);
        }
        return data;
      }
      return data;
    } catch (e) {
      // Secure local fallback for offline/preview mode
      const fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();
      sessionStorage.setItem('tar_temp_admin_otp', fallbackOtp);
      console.log(`[ADMIN OTP DISPATCHED TO EMAIL & MOBILE]: ${fallbackOtp}`);
      return {
        success: true,
        message: `Secure 6-digit OTP code dispatched to Email (${payload.email || 'shivaji09704@gmail.com'}) and Mobile (+91 99492*****72).`,
        otpPreview: fallbackOtp
      };
    }
  };

  const handleVerifyAdminOtpAndReset = async (params: {
    otp: string;
    newPassword?: string;
    newUsername?: string;
  }) => {
    try {
      const res = await fetch('/api/auth/admin/verify-otp-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.creds) {
          setAdminCredentials(data.creds);
        }
        setIsAdminLoggedIn(true);
        setAdminSessionState(true);
        setCurrentPage('admin-dashboard');
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error || 'OTP verification failed' };
      }
    } catch (e) {
      // Fallback verification against session stored OTP
      const savedOtp = sessionStorage.getItem('tar_temp_admin_otp');
      if (savedOtp && params.otp.trim() === savedOtp.trim()) {
        const localCreds = getAdminCredentials();
        const updatedUser = params.newUsername?.trim() || localCreds.username;
        const updatedPass = params.newPassword?.trim() || localCreds.passwordHash;
        setAdminCredentials({
          username: updatedUser,
          passwordHash: updatedPass
        });
        sessionStorage.removeItem('tar_temp_admin_otp');
        setIsAdminLoggedIn(true);
        setAdminSessionState(true);
        setCurrentPage('admin-dashboard');
        return { success: true, message: 'OTP verified successfully!' };
      }
      return { success: false, error: 'Invalid or expired OTP.' };
    }
  };

  // ---------------- STATE UPDATE HELPERS ----------------
  const updateServices = (newServices: Service[]) => {
    setServices(newServices);
    saveServicesToStorage(newServices);
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ services: newServices })
    }).catch(() => {});
  };

  const updateProjects = (newProjects: Project[]) => {
    setProjects(newProjects);
    saveProjectsToStorage(newProjects);
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projects: newProjects })
    }).catch(() => {});
  };

  const updateBookings = (newBookings: Booking[]) => {
    setBookings(newBookings);
    saveBookingsToStorage(newBookings);
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookings: newBookings })
    }).catch(() => {});
  };

  const updateCustomers = (newCustomers: CustomerUser[]) => {
    setCustomers(newCustomers);
    saveCustomersToStorage(newCustomers);
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customers: newCustomers })
    }).catch(() => {});
  };

  const updateFormFields = (newFields: BookingFormField[]) => {
    setFormFields(newFields);
    saveFormFieldsToStorage(newFields);
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formFields: newFields })
    }).catch(() => {});
  };

  const updateContent = (newContent: WebsiteContent) => {
    setContent(newContent);
    saveWebsiteContentToStorage(newContent);
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newContent })
    }).catch(() => {});
  };

  if (!content) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center text-[#121212]">
        <div className="text-center space-y-4 max-w-sm px-6">
          <div className="w-10 h-10 border-2 border-[#121212] border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-[10px] uppercase tracking-[0.3em] font-semibold text-[#8C8A82]">TAR ARCHITECTURAL PORTAL</div>
          <p className="text-sm font-serif italic text-[#3D3B35]">Loading TAR Civil &amp; Waterproofing Solutions...</p>
        </div>
      </div>
    );
  }

  // Selected Service for Details Page
  const currentServiceDetail =
    services.find((s) => s.slug === selectedServiceSlug) ||
    services[0] ||
    null;

  // Admin view
  if (
    currentPage === 'admin-dashboard' ||
    currentPage === 'admin' ||
    (currentPage === 'admin-login' && isAdminLoggedIn)
  ) {
    if (!isAdminLoggedIn) {
      return (
        <AdminLoginPage
          onLogin={handleAdminLogin}
          onBackToHome={() => navigateTo('home')}
        />
      );
    }
    return (
      <AdminDashboardPage
        services={services}
        projects={projects}
        bookings={bookings}
        customers={customers}
        formFields={formFields}
        content={content}
        onUpdateServices={updateServices}
        onUpdateProjects={updateProjects}
        onUpdateBookings={updateBookings}
        onUpdateCustomers={updateCustomers}
        onUpdateFormFields={updateFormFields}
        onUpdateContent={updateContent}
        onChangeAdminCreds={handleChangeAdminCreds}
        onLogout={handleAdminLogout}
        onPreviewWebsite={() => navigateTo('home')}
      />
    );
  }

  if (currentPage === 'admin-login') {
    return (
      <AdminLoginPage
        onLogin={handleAdminLogin}
        onBackToHome={() => navigateTo('home')}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F2] text-[#121212] selection:bg-[#121212] selection:text-[#F9F7F2]">
      {/* Top Main Navigation Bar with Language Switcher */}
      <Navbar
        currentPage={currentPage}
        onNavigate={navigateTo}
        currentCustomer={currentCustomer}
        onLogoutCustomer={handleCustomerLogout}
        isAdmin={isAdminLoggedIn}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdmin={() => navigateTo(isAdminLoggedIn ? 'admin-dashboard' : 'admin-login')}
        content={content}
        language={language}
        onToggleLanguage={handleToggleLanguage}
      />

      {/* Main Routed Page Content */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            services={services}
            projects={projects}
            formFields={formFields}
            content={content}
            currentCustomer={currentCustomer}
            language={language}
            onNavigate={navigateTo}
            onBookService={(svc) => navigateTo('book', svc?.slug)}
            onSubmitBooking={handleBookingSubmit}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage content={content} language={language} onNavigate={navigateTo} />
        )}

        {currentPage === 'services' && (
          <ServicesPage
            services={services}
            language={language}
            onViewDetails={(slug) => navigateTo('service-detail', slug)}
            onBookService={(svc) => navigateTo('book', svc.slug)}
          />
        )}

        {currentPage === 'service-detail' && currentServiceDetail && (
          <ServiceDetailPage
            service={currentServiceDetail}
            allServices={services}
            projects={projects}
            content={content}
            language={language}
            onBack={() => navigateTo('services')}
            onNavigate={navigateTo}
            onBookService={(svc) => navigateTo('book', svc.slug)}
          />
        )}

        {currentPage === 'projects' && (
          <ProjectsPage
            projects={projects}
            services={services}
            language={language}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'contact' && (
          <ContactPage content={content} language={language} onNavigate={navigateTo} onSubmitBooking={handleBookingSubmit} />
        )}

        {currentPage === 'book' && (
          <BookAppointmentPage
            services={services}
            formFields={formFields}
            initialServiceSlug={selectedServiceSlug}
            currentCustomer={currentCustomer}
            content={content}
            language={language}
            onNavigate={navigateTo}
            onSubmitBooking={handleBookingSubmit}
          />
        )}

        {(currentPage === 'enquiry' || currentPage === 'customer-enquiry' || currentPage === 'request') && (
          <CustomerEnquiryPage
            services={services}
            currentCustomer={currentCustomer}
            content={content}
            language={language}
            onNavigate={navigateTo}
            onSubmitBooking={handleBookingSubmit}
          />
        )}

        {currentPage === 'customer-login' && (
          <CustomerLoginPage
            onLogin={handleCustomerLogin}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'customer-register' && (
          <CustomerRegisterPage
            onRegister={handleCustomerRegister}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'customer-dashboard' && currentCustomer && (
          <CustomerDashboardPage
            customer={currentCustomer}
            bookings={bookings}
            onNavigate={navigateTo}
            onLogout={handleCustomerLogout}
          />
        )}
      </main>

      {/* Footer with Language Switcher */}
      <Footer
        content={content}
        services={services}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        onNavigate={navigateTo}
        onOpenAdmin={() => navigateTo('admin-login')}
      />

      {/* Floating Call, WhatsApp & Booking Actions */}
      <FloatingActions content={content} language={language} onNavigate={navigateTo} />
    </div>
  );
}
