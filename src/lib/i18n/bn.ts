import { TranslationKeys } from './en';

export const bn: Record<TranslationKeys, string> = {
  // Navigation & Header
  appTitle: 'স্মার্ট প্রেসক্রিপশন',
  appSubtitle: 'এআই প্রেসক্রিপশন ডিকোড এবং দামের তথ্য · মেডেক্স বিডি',
  history: 'ইতিহাস',
  signIn: 'সাইন ইন',
  signOut: 'সাইন আউট',
  language: 'বাংলা',
  toggleLanguage: 'English',

  // Hero Section
  heroTitlePrefix: 'প্রেসক্রিপশন আপলোড করুন এবং খুঁজুন',
  heroTitleSuffix: 'লাইভ ওষুধের দাম ও বিকল্প বিকল্প ওষুধ',
  heroSubtitle: 'ডাক্তারের হাতে লেখা প্রেসক্রিপশন স্ক্যান বা ছবি আপলোড করুন। এআই সঙ্গে সঙ্গে ওষুধের নাম, খাওয়ার নিয়ম, বাংলাদেশে বর্তমান দাম এবং সাশ্রয়ী বিকল্প দেখাবে।',
  freeBadge: '১০০% ফ্রি জেমিনাই এআই',
  groundingBadge: 'মেডেক্স ডট কম ডট বিডি লাইভ সার্চ',
  privateBadge: 'সম্পূর্ণ নিরাপদ ও গোপনীয়',

  // Upload Zone
  uploadTitle: 'প্রেসক্রিপশনের ছবি আপলোড করুন',
  uploadSubtitle: 'হাতে লেখা প্রেসক্রিপশনের ছবি এখানে ড্র্যাগ করুন অথবা সিলেক্ট করুন (সর্বোচ্চ ১০ মেগাবাইট)।',
  chooseFile: 'ছবি নির্বাচন করুন',
  useCamera: 'ক্যামেরা ব্যবহার করুন',
  changeImage: 'ছবি পরিবর্তন করুন',
  decodeRx: 'প্রেসক্রিপশন ডিকোড করুন',
  analyzingRx: 'বিশ্লেষণ করা হচ্ছে...',

  // Results & Medication
  prescribingDoctor: 'প্রেসক্রিপশন প্রদানকারী ডাক্তার',
  patientInformation: 'রোগীর তথ্য',
  age: 'বয়স',
  gender: 'লিঙ্গ',
  date: 'তারিখ',
  foundMedicines: '{count} টি ওষুধ পাওয়া গেছে',
  generic: 'জেনেরিক নাম',
  perUnit: 'প্রতি {unit}',
  strip: 'পাতা (স্ট্রিপ)',
  dosage: 'ডোজ',
  frequency: 'খাওয়ার সময়/নিয়ম',
  duration: 'কতদিন খাবেন',
  doctorInstruction: 'ডাক্তারের বিশেষ নির্দেশ',
  commonSideEffects: 'সাধারণ পার্শ্বপ্রতিক্রিয়া',
  alternatives: 'বিকল্প ও সাশ্রয়ী ব্র্যান্ড',
  bestMatch: 'সেরা বিকল্প',
  cheapestOption: 'সবচেয়ে সাশ্রয়ী',
  savePercentage: '~{percent}% সাশ্রয়',
  decodeAnother: 'নতুন প্রেসক্রিপশন ডিকোড করুন',
  doctorAdvice: 'ডাক্তারের সাধারণ পরামর্শ',

  // Cost Calculator
  costEstimateTitle: 'আনুমানিক মোট চিকিৎসা খরচ হিসাব',
  perMedicineBreakdown: 'ওষুধভিত্তিক খরচের বিবরণ',
  fullDurationAsPrescribed: 'পুরো মেয়াদের মোট আনুমানিক খরচ',
  plan7Day: '৭ দিনের আনুমানিক চিকিৎসা খরচ',
  plan30Day: '৩০ দিনের আনুমানিক মাসিক খরচ',
  calculableDaily: '{dailyDose} টি/দৈনিক · {dailyCost} / দিন',
  fullDurationCalculated: 'মোট {cost} ({days} দিন)',
  costNotAvailable: 'হিসাব করা যায়নি',
  costExclusionsWarning: 'বিশেষ দ্রষ্টব্য: সিরাপ/ড্রপ/ইনজেকশন অথবা দাম না থাকা ওষুধ মোট খরচের বাইরে রাখা হয়েছে।',

  // Actions
  printPdf: 'প্রিন্ট / পিডিএফ সেভ',
  copyText: 'কপি করুন',
  share: 'শেয়ার করুন',
  copiedSuccess: 'প্রেসক্রিপশনের বিবরণ ক্লিপবোর্ডে কপি করা হয়েছে!',
};
