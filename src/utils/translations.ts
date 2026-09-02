export type Language = 'en' | 'te';

export interface Translations {
  // Navigation
  navHome: string;
  navServices: string;
  navProjects: string;
  navAbout: string;
  navContact: string;
  navBookSurvey: string;
  navPortal: string;
  navAdmin: string;
  dispatchBarBadge: string;
  dispatchBarPhone: string;
  emergencyTitle: string;
  languageSelect: string;
  
  // Hero Section
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroConsultBtn: string;
  heroExploreBtn: string;
  heroCallingTar: string;
  heroStatExperience: string;
  heroStatExperienceLabel: string;
  heroStatProjects: string;
  heroStatProjectsLabel: string;
  heroStatCoverage: string;
  heroStatCoverageLabel: string;
  heroStatWarranty: string;
  heroStatWarrantyLabel: string;

  // Services Catalog Section
  servicesSectionSub: string;
  servicesSectionTitle: string;
  servicesSectionDesc: string;
  servicesSearchPlaceholder: string;
  servicesAllCategory: string;
  servicesViewDetails: string;
  servicesBookNow: string;
  servicesTotalAvailable: string;
  servicesKeyMethodology: string;

  // Showcase Section
  showcaseSub: string;
  showcaseTitle: string;
  showcaseDesc: string;
  showcasePhaseBefore: string;
  showcasePhaseDuring: string;
  showcasePhaseAfter: string;
  showcaseClickInspect: string;

  // Why Choose Us / Bento Grid
  bentoSub: string;
  bentoTitle: string;
  bentoDesc: string;

  // Quick Survey Registry
  surveyTitle: string;
  surveySubtitle: string;
  surveyFullName: string;
  surveyFullNamePlaceholder: string;
  surveyPhone: string;
  surveyPhonePlaceholder: string;
  surveyLocation: string;
  surveyLocationPlaceholder: string;
  surveyService: string;
  surveyDate: string;
  surveyTimeSlot: string;
  surveyMessage: string;
  surveyMessagePlaceholder: string;
  surveySubmitBtn: string;
  surveySubmitting: string;
  surveySuccessTitle: string;
  surveySuccessMsg: string;
  surveyDirectCallPrompt: string;

  // Detail Page
  detailOverview: string;
  detailProblem: string;
  detailSolution: string;
  detailProcess: string;
  detailFeatures: string;
  detailNeedHelp: string;
  detailBackToList: string;
  detailDirectWhatsApp: string;

  // Common UI
  callNow: string;
  chatWhatsApp: string;
  bookAppointment: string;
  allRightsReserved: string;
  footerTagline: string;
  addressLabel: string;
  workingHoursLabel: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Navigation
    navHome: 'Home',
    navServices: 'Services',
    navProjects: 'Projects',
    navAbout: 'About TAR',
    navContact: 'Contact',
    navBookSurvey: 'Book Free Survey',
    navPortal: 'Customer Portal',
    navAdmin: 'Admin',
    dispatchBarBadge: 'TAR // HYDERABAD CIVIL & WATERPROOFING DISPATCH',
    dispatchBarPhone: 'EMERGENCY SITE INSPECTION',
    emergencyTitle: '24/7 Site Inspection',
    languageSelect: 'Language',

    // Hero Section
    heroBadge: 'ISO Standard Civil Engineering & Waterproofing',
    heroTitle: 'Reliable Waterproofing Solutions for Your Home',
    heroSubtitle: 'Specialized civil repairs, terrace waterproofing, pressure grouting, bathroom leak repair, and structural rehabilitation in Hyderabad, Telangana.',
    heroConsultBtn: 'Book On-Site Survey',
    heroExploreBtn: 'View 12 Disciplines',
    heroCallingTar: 'Call: 9949293872',
    heroStatExperience: '15+ YRS',
    heroStatExperienceLabel: 'Industry Excellence',
    heroStatProjects: '2500+',
    heroStatProjectsLabel: 'Inspections Completed',
    heroStatCoverage: '100%',
    heroStatCoverageLabel: 'Hyderabad & Secunderabad',
    heroStatWarranty: 'Up to 10 Yrs',
    heroStatWarrantyLabel: 'Service Warranty',

    // Services Catalog Section
    servicesSectionSub: 'DISCIPLINE CATALOG // 12 CERTIFIED PRACTICES',
    servicesSectionTitle: 'TAR – Top 12 Services',
    servicesSectionDesc: 'Comprehensive civil diagnostics and advanced chemical waterproofing solutions engineered to permanently eliminate water seepage across Hyderabad.',
    servicesSearchPlaceholder: 'Search service or issue (e.g., Roof, Bathroom, Crack)...',
    servicesAllCategory: 'All Services',
    servicesViewDetails: 'Detailed Specs',
    servicesBookNow: 'Book Survey',
    servicesTotalAvailable: 'Disciplines',
    servicesKeyMethodology: 'Key Advantages',

    // Showcase Section
    showcaseSub: 'PROOF OF WORK // ON-SITE EXECUTION',
    showcaseTitle: 'Three-Phase Transformation Gallery',
    showcaseDesc: 'Witness the systematic evolution from severe water seepage damage to reinforced civil integrity and immaculate finishing.',
    showcasePhaseBefore: '01 / Before Treatment',
    showcasePhaseDuring: '02 / Under Execution',
    showcasePhaseAfter: '03 / Sealed & Certified',
    showcaseClickInspect: 'Click photo to enlarge inspection view',

    // Why Choose Us / Bento Grid
    bentoSub: 'THE TAR STANDARD // ENGINEERING RIGOR',
    bentoTitle: 'Built on Reliability, Chemistry & Craft',
    bentoDesc: 'Why property owners, architects, and facility managers across Telangana entrust their structures to TAR Civil & Waterproofing.',

    // Quick Survey Registry
    surveyTitle: 'Schedule an On-Site Survey',
    surveySubtitle: 'Our technical inspector will visit your site in Hyderabad, analyze water seepage paths, and provide a clear diagnosis.',
    surveyFullName: 'Full Name',
    surveyFullNamePlaceholder: 'e.g. Kishore Reddy',
    surveyPhone: 'Phone Number',
    surveyPhonePlaceholder: 'e.g. 9949293872',
    surveyLocation: 'Area / Landmark (Hyderabad)',
    surveyLocationPlaceholder: 'e.g. Kondapur, Banjara Hills, Kukatpally',
    surveyService: 'Required Service',
    surveyDate: 'Preferred Inspection Date',
    surveyTimeSlot: 'Preferred Time Slot',
    surveyMessage: 'Problem Details / Symptoms',
    surveyMessagePlaceholder: 'Describe the moisture, wall dampness, roof crack or leakage...',
    surveySubmitBtn: 'Submit Inspection Request',
    surveySubmitting: 'Registering Inspection...',
    surveySuccessTitle: 'Inspection Request Registered!',
    surveySuccessMsg: 'Your booking has been received. Our engineer will contact you shortly.',
    surveyDirectCallPrompt: 'Need instant guidance? Speak directly with our master technician:',

    // Detail Page
    detailOverview: 'Service Overview',
    detailProblem: 'The Problem & Root Cause',
    detailSolution: 'The TAR Engineering Solution',
    detailProcess: 'Standard Operating Procedure (6-Step Protocol)',
    detailFeatures: 'Technical Highlights & Features',
    detailNeedHelp: 'Have an urgent seepage issue?',
    detailBackToList: 'Back to All Services',
    detailDirectWhatsApp: 'Chat with Engineer on WhatsApp',

    // Common UI
    callNow: 'Call Now',
    chatWhatsApp: 'WhatsApp',
    bookAppointment: 'Book Survey',
    allRightsReserved: 'All rights reserved.',
    footerTagline: 'Reliable Waterproofing & Civil Solutions in Hyderabad, Telangana.',
    addressLabel: 'Headquarters & Dispatch',
    workingHoursLabel: 'Working Hours'
  },
  te: {
    // Navigation
    navHome: 'హోమ్',
    navServices: 'సేవలు (12)',
    navProjects: 'ప్రాజెక్ట్స్',
    navAbout: 'మా గురించి',
    navContact: 'సంప్రదించండి',
    navBookSurvey: 'సర్వే బుక్ చేయండి',
    navPortal: 'కస్టమర్ పోర్టల్',
    navAdmin: 'అడ్మిన్',
    dispatchBarBadge: 'TAR // హైదరాబాద్ సివిల్ & వాటర్ప్రూఫింగ్ సర్వీసెస్',
    dispatchBarPhone: 'తక్షణ సైట్ తనిఖీ & విచారణ',
    emergencyTitle: '24/7 సైట్ తనిఖీ సేవలు',
    languageSelect: 'భాష',

    // Hero Section
    heroBadge: 'హైదరాబాద్‌లో నమ్మకమైన సివిల్ & వాటర్ప్రూఫింగ్ నిపుణులు',
    heroTitle: 'మీ ఇంటికి నమ్మకమైన వాటర్ప్రూఫింగ్ పరిష్కారాలు',
    heroSubtitle: 'రూఫ్ వాటర్ప్రూఫింగ్, ప్రెజర్ గ్రౌటింగ్, బాత్రూమ్ లీకేజ్ ట్రీట్మెంట్, క్రాక్ ఫిల్లింగ్ మరియు స్ట్రక్చరల్ రిపేర్లకు హైదరాబాద్‌లో విశ్వసనీయ నిపుణులు.',
    heroConsultBtn: 'సైట్ సర్వే బుక్ చేయండి',
    heroExploreBtn: 'టాప్ 12 సేవలు చూడండి',
    heroCallingTar: 'కాల్ చేయండి: 9949293872',
    heroStatExperience: '15+ ఏళ్లు',
    heroStatExperienceLabel: 'అనుభవజ్ఞులైన నిపుణులు',
    heroStatProjects: '2500+',
    heroStatProjectsLabel: 'పూర్తయిన పనులు',
    heroStatCoverage: '100%',
    heroStatCoverageLabel: 'హైదరాబాద్ & సికింద్రాబాద్',
    heroStatWarranty: '10 ఏళ్ల వరకు',
    heroStatWarrantyLabel: 'సర్వీస్ వారంటీ',

    // Services Catalog Section
    servicesSectionSub: 'టాప్ 12 సర్టిఫైడ్ సేవలు // సంపూర్ణ పరిష్కారాలు',
    servicesSectionTitle: 'TAR – టాప్ 12 సేవలు (Top 12 Services)',
    servicesSectionDesc: 'హైదరాబాద్ నగరవ్యాప్తంగా శాశ్వతంగా నీటి లీకేజీలు, క్రాక్స్ మరియు తేమ సమస్యలను నివారించేందుకు ఆధునిక కెమికల్ వాటర్ప్రూఫింగ్ మరియు సివిల్ సేవలు.',
    servicesSearchPlaceholder: 'సేవ లేదా సమస్యను శోధించండి (ఉదా: రూఫ్, బాత్రూమ్, క్రాక్)...',
    servicesAllCategory: 'అన్ని సేవలు',
    servicesViewDetails: 'పూర్తి వివరాలు',
    servicesBookNow: 'సర్వే బుకింగ్',
    servicesTotalAvailable: 'సేవలు అందుబాటులో ఉన్నాయి',
    servicesKeyMethodology: 'ముఖ్య ప్రయోజనాలు',

    // Showcase Section
    showcaseSub: 'నిజమైన సైట్ పనుల ఫలితాలు // ప్రూఫ్ ఆఫ్ వర్క్',
    showcaseTitle: 'మూడు దశల వర్క్ గ్యాలరీ (Transformation Gallery)',
    showcaseDesc: 'తీవ్రమైన నీటి లీకేజీ నుండి పూర్తి బలోపేతమైన మరియు వాటర్‌ప్రూఫ్ రక్షణ వరకు జరిగిన మార్పులను ప్రత్యక్షంగా చూడండి.',
    showcasePhaseBefore: '01 / పనికి ముందు (Before)',
    showcasePhaseDuring: '02 / పని జరుగుతున్నప్పుడు (During)',
    showcasePhaseAfter: '03 / పని పూర్తయిన తర్వాత (After)',
    showcaseClickInspect: 'ఫోటోను పెద్దదిగా చేసి పరిశీలించడానికి క్లిక్ చేయండి',

    // Why Choose Us / Bento Grid
    bentoSub: 'TAR ప్రమాణాలు // విశ్వసనీయత & నైపుణ్యం',
    bentoTitle: 'నాణ్యత, సాంకేతికత మరియు అనుభవంతో నిర్మితం',
    bentoDesc: 'తెలంగాణలోని గృహ యజమానులు, ఆర్కిటెక్ట్‌లు మరియు బిల్డర్లు TAR వాటర్ప్రూఫింగ్‌ను ఎందుకు ఎంచుకుంటారో తెలుసుకోండి.',

    // Quick Survey Registry
    surveyTitle: 'ఉచిత సైట్ సర్వే షెడ్యూల్ చేయండి',
    surveySubtitle: 'మా ఇంజనీరింగ్ నిపుణులు మీ సైట్‌ను సందర్శించి, నీటి లీకేజ్ కారణాలను గుర్తించి సరైన పరిష్కారాన్ని అందిస్తారు.',
    surveyFullName: 'మీ పూర్తి పేరు',
    surveyFullNamePlaceholder: 'ఉదా: కిషోర్ రెడ్డి',
    surveyPhone: 'ఫోన్ నంబర్',
    surveyPhonePlaceholder: 'ఉదా: 9949293872',
    surveyLocation: 'ప్రాంతం / లొకేషన్ (హైదరాబాద్)',
    surveyLocationPlaceholder: 'ఉదా: కొండాపూర్, బంజారా హిల్స్, కూకట్‌పల్లి',
    surveyService: 'కావలసిన సేవ',
    surveyDate: 'తనిఖీకి అనుకూలమైన తేదీ',
    surveyTimeSlot: 'అనుకూలమైన సమయం',
    surveyMessage: 'సమస్య వివరాలు / లక్షణాలు',
    surveyMessagePlaceholder: 'గోడల తేమ, రూఫ్ క్రాక్స్ లేదా లీకేజ్ గురించి వివరించండి...',
    surveySubmitBtn: 'సర్వే అభ్యర్థన సమర్పించండి',
    surveySubmitting: 'నమోదు అవుతోంది...',
    surveySuccessTitle: 'సర్వే అభ్యర్థన విజయవంతంగా నమోదైంది!',
    surveySuccessMsg: 'మీ వివరాలు మాకు అందాయి. మా ఇంజనీర్ త్వరలోనే మిమ్మల్ని సంప్రదిస్తారు.',
    surveyDirectCallPrompt: 'తక్షణ సహాయం కోసం నేరుగా మా నిపుణుడితో మాట్లాడండి:',

    // Detail Page
    detailOverview: 'సేవ యొక్క సంక్షిప్త వివరణ',
    detailProblem: 'సమస్య & మూల కారణం',
    detailSolution: 'TAR ఇంజనీరింగ్ పరిష్కారం',
    detailProcess: 'పని చేసే 6-దశల విధానం (Standard Process)',
    detailFeatures: 'సాంకేతిక ముఖ్యాంశాలు & ఫీచర్లు',
    detailNeedHelp: 'అత్యవసర లీకేజ్ సమస్య ఉందా?',
    detailBackToList: 'అన్ని సేవలకు తిరిగి వెళ్లండి',
    detailDirectWhatsApp: 'వాట్సాప్‌లో ఇంజనీర్‌తో చాట్ చేయండి',

    // Common UI
    callNow: 'కాల్ చేయండి',
    chatWhatsApp: 'వాట్సాప్',
    bookAppointment: 'సర్వే బుక్ చేయండి',
    allRightsReserved: 'సర్వ హక్కులు రక్షించబడ్డాయి.',
    footerTagline: 'హైదరాబాద్‌లో నమ్మకమైన సివిల్ & వాటర్ప్రూఫింగ్ పరిష్కారాలు.',
    addressLabel: 'ప్రధాన కార్యాలయం & డిస్పాచ్',
    workingHoursLabel: 'పని వేళలు'
  }
};
