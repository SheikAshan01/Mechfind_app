export type Language = 'en' | 'ta';

export interface Translations {
  tagline: string;
  emergencyBanner: string;
  verifiedMechanics: string;
  avgArrival: string;
  navServices: string;
  navHowItWorks: string;
  navFaq: string;
  navAbout: string;
  navContact: string;
  navJoinMechanic: string;
  navCustomerPortal: string;
  navMechanicPortal: string;
  navAdminPortal: string;
  navSupportPortal: string;
  instantBooking: string;
  scheduledBooking: string;
  roadsideEmergency: string;
  doorstepDelivery: string;
  workshopVisit: string;
  selectService: string;
  vehicleType: string;
  findingNearby: string;
  quoteReceived: string;
  approveQuote: string;
  rejectQuote: string;
  payNow: string;
  downloadGstInvoice: string;
  sosEmergency: string;
  mechanicEnRoute: string;
  mechanicArrived: string;
  workInProgress: string;
  jobCompleted: string;
  rateMechanic: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    tagline: 'Your Mechanic, Just Around the Corner',
    emergencyBanner: '24/7 Roadside Assistance & Breakdown Helpline:',
    verifiedMechanics: '100% Verified Mechanics',
    avgArrival: 'Avg Arrival: 12-18 Mins',
    navServices: 'Services',
    navHowItWorks: 'How It Works',
    navFaq: 'FAQ',
    navAbout: 'About',
    navContact: 'Contact',
    navJoinMechanic: 'Join as Mechanic',
    navCustomerPortal: 'Customer Portal',
    navMechanicPortal: 'Mechanic Portal',
    navAdminPortal: 'Admin Portal',
    navSupportPortal: 'Support Portal',
    instantBooking: 'Instant Assistance',
    scheduledBooking: 'Schedule Later',
    roadsideEmergency: 'Emergency SOS',
    doorstepDelivery: 'Doorstep Service',
    workshopVisit: 'Visit Workshop',
    selectService: 'Select Breakdown Service',
    vehicleType: 'Select Vehicle Type',
    findingNearby: 'Locating Nearest Verified Technicians...',
    quoteReceived: 'Quotation Received - Customer Approval Required',
    approveQuote: 'Approve & Start Work',
    rejectQuote: 'Decline Quotation',
    payNow: 'Pay & Settle Invoice',
    downloadGstInvoice: 'Download Official GST Invoice',
    sosEmergency: 'Trigger Emergency SOS',
    mechanicEnRoute: 'Mechanic is En Route to Your Location',
    mechanicArrived: 'Mechanic Has Arrived at Site',
    workInProgress: 'Diagnostic & Repair Work in Progress',
    jobCompleted: 'Service Successfully Completed',
    rateMechanic: 'Rate & Review Your Experience',
  },
  ta: {
    tagline: 'உங்கள் மெக்கானிக், உங்கள் அருகில்',
    emergencyBanner: '24/7 அவசர உதவி மற்றும் பழுதுபார்ப்பு உதவி எண்:',
    verifiedMechanics: '100% சரிபார்க்கப்பட்ட மெக்கானிக்குகள்',
    avgArrival: 'சராசரி வருகை: 12-18 நிமிடங்கள்',
    navServices: 'சேவைகள்',
    navHowItWorks: 'செயல்முறை',
    navFaq: 'கேள்விகள்',
    navAbout: 'எங்களை பற்றி',
    navContact: 'தொடர்பு கொள்ள',
    navJoinMechanic: 'மெக்கானிக்காக சேரவும்',
    navCustomerPortal: 'வாடிக்கையாளர் தளம்',
    navMechanicPortal: 'மெக்கானிக் தளம்',
    navAdminPortal: 'நிர்வாக தளம்',
    navSupportPortal: 'வாடிக்கையாளர் சேவை',
    instantBooking: 'உடனடி உதவி',
    scheduledBooking: 'திட்டமிட்ட முன்பதிவு',
    roadsideEmergency: 'அவசர SOS உதவி',
    doorstepDelivery: 'வீட்டுக்கே வரும் சேவை',
    workshopVisit: 'பட்டறை வருகை',
    selectService: 'பழுதுபார்க்கும் சேவையைத் தேர்ந்தெடுக்கவும்',
    vehicleType: 'வாகன வகையைத் தேர்ந்தெடுக்கவும்',
    findingNearby: 'அருகிலுள்ள சரிபார்க்கப்பட்ட மெக்கானிக்குகளைத் தேடுகிறது...',
    quoteReceived: 'விலைப்பட்டியல் வந்தது - வாடிக்கையாளர் ஒப்புதல் தேவை',
    approveQuote: 'ஒப்புதல் அளித்து பணியைத் தொடங்கவும்',
    rejectQuote: 'விலைப்பட்டியலை நிராகரி',
    payNow: 'கட்டணம் செலுத்தவும்',
    downloadGstInvoice: 'GST விலைப்பட்டியலை பதிவிறக்கவும்',
    sosEmergency: 'அவசர SOS அழைப்பு',
    mechanicEnRoute: 'மெக்கானிக் உங்கள் இடத்தை நோக்கி வந்து கொண்டிருக்கிறார்',
    mechanicArrived: 'மெக்கானிக் உங்கள் இடத்திற்கு வந்துவிட்டார்',
    workInProgress: 'பழுதுநீக்கும் பணி நடைபெறுகிறது',
    jobCompleted: 'பணி வெற்றிகரமாக முடிந்தது',
    rateMechanic: 'உங்கள் அனுபவத்தை மதிப்பிடவும்',
  },
};

const LANG_STORAGE_KEY = 'mechfind_language';

export function getCurrentLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  const saved = localStorage.getItem(LANG_STORAGE_KEY) as Language;
  return saved === 'ta' ? 'ta' : 'en';
}

export function setLanguage(lang: Language): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LANG_STORAGE_KEY, lang);
  window.dispatchEvent(new Event('languagechange'));
}

