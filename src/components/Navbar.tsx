import React, { useState } from 'react';
import { TarLogo } from './TarLogo';
import { WebsiteContent, CustomerUser } from '../types';
import { Language, translations } from '../utils/translations';
import {
  Phone,
  MessageSquare,
  CalendarCheck,
  User,
  ShieldAlert,
  Menu,
  X,
  MapPin,
  Clock,
  ChevronDown,
  Languages
} from 'lucide-react';

interface NavbarProps {
  content: WebsiteContent;
  currentCustomer: CustomerUser | null;
  isAdmin?: boolean;
  isAdminLoggedIn?: boolean;
  currentPage: string;
  language: Language;
  onToggleLanguage: (lang: Language) => void;
  onNavigate: (page: string, serviceSlug?: string) => void;
  onLogoutCustomer: () => void;
  onOpenAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  content,
  currentCustomer,
  isAdmin: propIsAdmin,
  isAdminLoggedIn,
  currentPage,
  language,
  onToggleLanguage,
  onNavigate,
  onLogoutCustomer,
  onOpenAdmin: propOnOpenAdmin
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);

  const isAdmin = propIsAdmin ?? isAdminLoggedIn ?? false;
  const handleOpenAdmin = () => {
    if (propOnOpenAdmin) {
      propOnOpenAdmin();
    } else {
      onNavigate(isAdmin ? 'admin-dashboard' : 'admin-login');
    }
  };

  const isTelugu = language === 'te';
  const t = translations[language];
  const phone = content?.business?.phone || '9949293872';
  const whatsapp = content?.business?.whatsapp || '9949293872';
  const email = content?.business?.email || 'tarsolutions55@gmail.com';

  const navLinks = [
    { id: 'home', label: t.navHome },
    { id: 'services', label: t.navServices },
    { id: 'enquiry', label: isTelugu ? 'కస్టమర్ విచారణ' : 'Enquiry / Request' },
    { id: 'projects', label: t.navProjects },
    { id: 'about', label: t.navAbout },
    { id: 'contact', label: t.navContact },
    { id: 'book', label: t.navBookSurvey }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F9F7F2]/95 backdrop-blur-md border-b border-[#DCD9D1] transition-all">
      {/* Top Notification / Quick Contact & Language Bar */}
      <div className="bg-[#121212] text-[#F9F7F2] text-[10px] uppercase tracking-[0.2em] font-medium py-2 px-4 sm:px-6 border-b border-[#DCD9D1]/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-[#DCD9D1]">
              <MapPin className="w-3.5 h-3.5 text-[#F9F7F2]" />
              <span className="hidden sm:inline">{t.dispatchBarBadge}</span>
              <span className="sm:hidden font-bold">HYDERABAD // TAR</span>
            </span>
            <span className="hidden md:flex items-center gap-2 text-[#8C8A82]">
              <Clock className="w-3.5 h-3.5 text-[#DCD9D1]" />
              <span>MON – SUN: 08:00 – 20:00 IST</span>
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            {/* Prominent Language Switcher at Top */}
            <div className="flex items-center bg-[#242424] p-0.5 rounded border border-[#DCD9D1]/30">
              <button
                type="button"
                onClick={() => onToggleLanguage('en')}
                className={`px-2.5 py-0.5 rounded-xs text-[9px] font-bold tracking-wider transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-[#F9F7F2] text-[#121212] shadow-xs'
                    : 'text-[#DCD9D1] hover:text-white'
                }`}
                title="Switch to English"
              >
                English
              </button>
              <button
                type="button"
                onClick={() => onToggleLanguage('te')}
                className={`px-2.5 py-0.5 rounded-xs text-[9px] font-bold tracking-normal transition-all cursor-pointer ${
                  language === 'te'
                    ? 'bg-[#F9F7F2] text-[#121212] shadow-xs'
                    : 'text-[#DCD9D1] hover:text-white'
                }`}
                title="తెలుగులోకి మార్చండి"
              >
                తెలుగు
              </button>
            </div>

            <a
              href={`tel:${phone}`}
              className="hidden sm:flex items-center gap-1.5 text-[#F9F7F2] hover:text-white font-semibold transition-opacity hover:opacity-80"
            >
              <Phone className="w-3.5 h-3.5 text-[#DCD9D1]" />
              <span>+91 {phone}</span>
            </a>

            {isAdmin ? (
              <button
                onClick={handleOpenAdmin}
                className="bg-[#F9F7F2] text-[#121212] px-2.5 py-0.5 rounded-xs text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-1 hover:bg-white cursor-pointer"
              >
                <ShieldAlert className="w-3 h-3" /> {t.navAdmin}
              </button>
            ) : (
              <button
                onClick={handleOpenAdmin}
                className="text-[#8C8A82] hover:text-white text-[9px] uppercase tracking-[0.2em] flex items-center gap-1 cursor-pointer"
              >
                <ShieldAlert className="w-3 h-3" /> {t.navAdmin}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center text-left focus:outline-none cursor-pointer"
            aria-label="TAR Homepage"
          >
            <TarLogo variant="full" />
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`text-[11px] font-bold uppercase tracking-[0.18em] transition-all cursor-pointer py-1 ${
                    isActive
                      ? 'text-[#121212] border-b-2 border-[#121212] pb-0.5'
                      : 'text-[#3D3B35] hover:text-[#121212] hover:opacity-75'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Language Pill Selector */}
            <div className="flex items-center gap-1 bg-[#F2EFE9] border border-[#DCD9D1] px-1.5 py-1 rounded-xs">
              <Languages className="w-3 h-3 text-[#6E6B63]" />
              <button
                onClick={() => onToggleLanguage(language === 'en' ? 'te' : 'en')}
                className="text-[10px] font-bold uppercase tracking-wider text-[#121212] hover:underline cursor-pointer"
              >
                {language === 'en' ? 'తెలుగు' : 'English'}
              </button>
            </div>

            {/* Call Now */}
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] rounded-xs border border-[#DCD9D1] text-[#121212] bg-[#F2EFE9] hover:bg-[#E8E4DB] transition-all"
              title="Call TAR Experts"
            >
              <Phone className="w-3 h-3" />
              <span>{t.callNow}</span>
            </a>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/91${whatsapp}?text=Hello%20TAR%20Civil%20%26%20Waterproofing%20Experts%2C%20I%20need%20assistance%20with%20waterproofing%2Fleakage.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] rounded-xs border border-[#DCD9D1] bg-[#F9F7F2] hover:bg-[#121212] hover:text-white text-[#121212] transition-all"
              title="Chat on WhatsApp"
            >
              <MessageSquare className="w-3 h-3" />
              <span>{t.chatWhatsApp}</span>
            </a>

            {/* Book Appointment CTA */}
            <button
              onClick={() => onNavigate('book')}
              className="inline-flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] rounded-xs bg-[#121212] hover:bg-[#3D3B35] text-[#F9F7F2] transition-all cursor-pointer shadow-xs"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>{t.navBookSurvey}</span>
            </button>

            {/* Customer Account / Login */}
            {currentCustomer ? (
              <div className="relative">
                <button
                  onClick={() => setCustomerDropdownOpen(!customerDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xs bg-[#F2EFE9] text-[#121212] text-[10px] font-bold uppercase tracking-wider border border-[#DCD9D1] hover:bg-[#E8E4DB] transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-[#121212]" />
                  <span className="max-w-[90px] truncate">{currentCustomer.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3 h-3 text-[#8C8A82]" />
                </button>
                {customerDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-[#F9F7F2] rounded-xs shadow-xl border border-[#DCD9D1] py-2 z-50 text-xs">
                    <div className="px-4 py-2 border-b border-[#DCD9D1] font-semibold text-[#121212]">
                      {currentCustomer.name}
                      <p className="text-[10px] text-[#8C8A82] font-normal truncate uppercase tracking-wider">{currentCustomer.mobile}</p>
                    </div>
                    <button
                      onClick={() => {
                        setCustomerDropdownOpen(false);
                        onNavigate('customer-dashboard');
                      }}
                      className="w-full text-left px-4 py-2.5 text-[#121212] hover:bg-[#F2EFE9] text-[11px] font-bold uppercase tracking-wider cursor-pointer"
                    >
                      {t.navPortal}
                    </button>
                    <button
                      onClick={() => {
                        setCustomerDropdownOpen(false);
                        onLogoutCustomer();
                      }}
                      className="w-full text-left px-4 py-2 text-[#8C8A82] hover:text-[#121212] hover:bg-[#F2EFE9] text-[11px] uppercase tracking-wider cursor-pointer"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onNavigate('customer-login')}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#3D3B35] hover:text-[#121212] rounded-xs transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-[#8C8A82]" />
                <span>{t.navPortal}</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Trigger & Quick Lang */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex items-center bg-[#F2EFE9] rounded border border-[#DCD9D1] p-0.5">
              <button
                onClick={() => onToggleLanguage('en')}
                className={`px-2 py-0.5 text-[9px] font-bold ${language === 'en' ? 'bg-[#121212] text-white' : 'text-[#3D3B35]'}`}
              >
                EN
              </button>
              <button
                onClick={() => onToggleLanguage('te')}
                className={`px-2 py-0.5 text-[9px] font-bold ${language === 'te' ? 'bg-[#121212] text-white' : 'text-[#3D3B35]'}`}
              >
                తెలుగు
              </button>
            </div>
            <a
              href={`tel:${phone}`}
              className="p-2 rounded-xs bg-[#F2EFE9] text-[#121212] border border-[#DCD9D1] sm:hidden"
              aria-label="Call TAR"
            >
              <Phone className="w-4 h-4" />
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xs text-[#121212] hover:bg-[#F2EFE9] focus:outline-none border border-[#DCD9D1]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#DCD9D1] bg-[#F9F7F2] px-6 pt-4 pb-8 space-y-4 shadow-xl">
          {/* Language Toggle in Mobile Drawer */}
          <div className="bg-[#F2EFE9] p-2 rounded-xs border border-[#DCD9D1] flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#3D3B35] flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5" /> {t.languageSelect}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onToggleLanguage('en')}
                className={`px-3 py-1 text-[10px] font-bold rounded-xs ${language === 'en' ? 'bg-[#121212] text-white' : 'bg-[#F9F7F2] text-[#121212]'}`}
              >
                English
              </button>
              <button
                onClick={() => onToggleLanguage('te')}
                className={`px-3 py-1 text-[10px] font-bold rounded-xs ${language === 'te' ? 'bg-[#121212] text-white' : 'bg-[#F9F7F2] text-[#121212]'}`}
              >
                తెలుగు
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pb-4 border-b border-[#DCD9D1]">
            <a
              href={`tel:${phone}`}
              className="flex items-center justify-center gap-2 py-3 rounded-xs bg-[#F2EFE9] border border-[#DCD9D1] text-[#121212] font-bold text-[10px] uppercase tracking-[0.2em]"
            >
              <Phone className="w-3.5 h-3.5" /> {t.callNow}
            </a>
            <a
              href={`https://wa.me/91${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-xs bg-[#121212] text-[#F9F7F2] font-bold text-[10px] uppercase tracking-[0.2em]"
            >
              <MessageSquare className="w-3.5 h-3.5" /> {t.chatWhatsApp}
            </a>
          </div>

          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate(link.id);
                  }}
                  className={`text-left px-3 py-3 rounded-xs text-[11px] font-bold uppercase tracking-[0.2em] transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#121212] text-[#F9F7F2]'
                      : 'text-[#3D3B35] hover:bg-[#F2EFE9]'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-[#DCD9D1] flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('book');
              }}
              className="w-full py-3.5 rounded-xs bg-[#121212] text-[#F9F7F2] font-bold text-[11px] uppercase tracking-[0.25em] flex items-center justify-center gap-2 cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              {t.navBookSurvey}
            </button>

            {currentCustomer ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('customer-dashboard');
                }}
                className="w-full py-2.5 rounded-xs bg-[#F2EFE9] border border-[#DCD9D1] text-[#121212] font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
              >
                <User className="w-4 h-4 text-[#121212]" />
                {t.navPortal} ({currentCustomer.name})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('customer-login');
                  }}
                  className="py-2.5 rounded-xs border border-[#DCD9D1] text-[#121212] bg-[#F2EFE9] font-bold text-[10px] uppercase tracking-wider text-center cursor-pointer"
                >
                  {t.navPortal}
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('customer-register');
                  }}
                  className="py-2.5 rounded-xs bg-[#121212] text-[#F9F7F2] font-bold text-[10px] uppercase tracking-wider text-center cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleOpenAdmin();
              }}
              className="pt-2 text-center text-[10px] uppercase tracking-[0.2em] text-[#8C8A82] hover:text-[#121212] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              {t.navAdmin} Access
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
