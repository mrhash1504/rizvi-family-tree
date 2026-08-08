/* UI string table. Person data has its own parallel Urdu fields in data.js —
 * this file only covers the interface chrome. Nothing here is machine
 * translated; proper nouns are never auto-converted. */

const STRINGS = {
  en: {
    dir: 'ltr',
    siteTitle: 'Rizvi Family Tree',
    siteSubtitle: 'A living record — help us fill the gaps',
    langToggle: 'اردو',
    langToggleAria: 'Switch to Urdu',

    tabTree: 'Family tree',
    tabHistory: 'History & sources',
    tabQuestions: 'Open questions',

    searchPlaceholder: 'Search a name…',
    expandAll: 'Expand all',
    collapseAll: 'Collapse all',
    noResults: 'No one found by that name.',
    resultsCount: n => `${n} ${n === 1 ? 'match' : 'matches'}`,

    generation: n => `Generation ${n}`,
    childCount: n => `${n} ${n === 1 ? 'child' : 'children'}`,

    tagConfirmed: 'Confirmed',
    tagEstimated: 'Estimated',
    tagShajra: 'Per shajra',
    tagConfirmedHint: 'Confirmed by the family.',
    tagEstimatedHint: 'Worked out from recalled age gaps, not from a document.',
    tagShajraHint: 'Read from the 2024 photographed shajra; not independently confirmed.',

    fieldName: 'Name',
    fieldBirth: 'Born',
    fieldDeath: 'Died',
    fieldBirthplace: 'Place of birth',
    fieldResidence: 'Lived in',
    fieldSpouse: 'Spouse',
    fieldNotes: 'About them',

    bioPlaceholder: 'Where they lived and worked, what they were known for, anything the family should remember. Write as much or as little as you like.',
    bioEmpty: 'Nothing written here yet.',
    romanLabel: 'Roman Urdu typing',
    romanHint: 'Type "mera naam Ali hai" and it becomes Urdu as you go. Turn off if you have an Urdu keyboard.',
    draftRestored: 'We have put back what you were typing last time. Nothing has been sent yet — press Submit when you are ready.',
    bioInvite: 'Add their story',
    bioInviteSelf: 'Is this you, or someone you know well? Add a few lines.',

    inUrdu: 'In Urdu',
    inEnglish: 'In English',
    otherLangHint: 'Optional. Leave blank and the other language will show instead.',
    urduFirstHint: 'You can fill in this whole form in Urdu. The English fields below are optional.',

    notRecorded: 'Not recorded',
    addThis: 'Add this',
    locked: 'Locked',
    lockedHint: 'This detail has been verified and locked. Contact the admin if you believe it needs changing.',
    pending: 'pending',
    pendingHint: n => `${n} suggested ${n === 1 ? 'change is' : 'changes are'} awaiting review.`,

    close: 'Close',
    suggestEdit: 'Suggest a change',
    addPerson: 'Add a person',
    addChildTo: name => `Add a child of ${name}`,
    editingIntro: 'Fill in only what you know. Your suggestion goes to the admin for review before it appears on the tree.',
    yourName: 'Your name',
    yourNamePlaceholder: 'So we know who to thank',
    yourRelation: 'How you are related (optional)',
    yourRelationPlaceholder: 'e.g. granddaughter of Wasi Ali',
    submit: 'Submit for review',
    submitting: 'Sending…',
    cancel: 'Cancel',
    thanks: 'Thank you — your suggestion has been sent for review.',
    errNoName: 'Please add your name so we know who suggested this.',
    errNoChanges: 'Nothing changed yet — edit at least one field.',
    errSend: 'Could not send. Check your connection and try again.',

    newPersonName: 'Their name',
    relationshipTo: 'Child of',

    offlineBanner: 'Viewing a local copy. Changes cannot be submitted until the site is connected to its database.',
    loading: 'Loading the family tree…',

    questionsIntro: 'These are the gaps we would most like the family\'s help with. If you know any of these, use "Suggest a change" on the relevant person, or contact the admin directly.',
    historyIntro: 'Background, sources, and the reasoning behind the estimated dates.',

    footer: 'Compiled from family conversation. Dates and spellings are provisional until verified against primary records.',

    atAGlance: 'At a glance',
    statPeople: 'people recorded',
    statGenerations: 'generations',
    statGaps: 'details still missing',
    statLocked: 'details verified',
    mostWanted: 'Most wanted',
    legend: 'What the labels mean',
    tapPrompt: 'Tap anyone in the tree to see their details or suggest a change.',

    adminTitle: 'Review queue',
    adminSignIn: 'Sign in',
    adminPassword: 'Admin password',
    adminWrongPass: 'That password did not work.',
    adminNoPending: 'Nothing waiting for review.',
    adminSuggestedBy: 'Suggested by',
    adminCurrent: 'Currently',
    adminProposed: 'Proposed',
    adminApprove: 'Approve',
    adminApproveLock: 'Approve & lock',
    adminReject: 'Reject',
    adminEmpty: '(empty)',
    adminNewPerson: 'New person',
    adminLockedFields: 'Locked fields',
    adminUnlock: 'Unlock',
    adminManageLocks: 'Manage locks',
    adminSignOut: 'Sign out',
    errPermission: 'The database refused that change. Your suggestion is still safe in the queue — nothing was lost. This is a permissions setting, not your internet.',
    errExpired: 'Your sign-in has expired. Sign out and back in, then try again — the suggestion is still in the queue.',
    errServer: (code, detail) => `The database returned an error (${code}). Nothing was lost; the suggestion is still in the queue. Details: ${detail}`,
    errNetwork: 'Could not reach the database. Check your connection and try again — nothing was lost.',

    photoSection: 'Photograph',
    photoHint: 'JPEG, PNG or WebP, up to 5 MB. It will not appear on the tree until the keeper of the record has approved it.',
    photoReplaceHint: 'There is already a photograph. Choosing a new one suggests replacing it.',
    photoUploading: 'Uploading…',
    photoReady: 'Uploaded. Press Submit below to send it for review.',
    photoBadType: 'That file is not a JPEG, PNG or WebP image.',
    photoTooBig: 'That image is larger than 5 MB. Please choose a smaller one.',
    adminPhotoReplaces: 'Replaces the current photograph',

    adminHistory: 'Decided',
    adminHistoryIntro: 'Everything you have already decided. Nothing is ever deleted — rejected suggestions are kept too, so you can look up what was proposed and when you decided it.',
    adminHistoryLoading: 'Loading…',
    adminHistoryEmpty: 'You have not decided anything yet. Approved and rejected suggestions will appear here.',
    adminWasApproved: 'Approved',
    adminWasRejected: 'Rejected',
    adminDecidedMeta: (author, when) => `Suggested by ${author}${when ? ` · decided ${when}` : ''}`,

    adminBackup: 'Download backup',
    adminBackupWorking: 'Preparing…',
    adminBackupFailed: 'The backup could not be downloaded. Check your connection and try again.'
  },

  ur: {
    dir: 'rtl',
    siteTitle: 'رضوی شجرۂ نسب',
    siteSubtitle: 'ایک زندہ ریکارڈ — خالی جگہیں پُر کرنے میں ہماری مدد کیجیے',
    langToggle: 'English',
    langToggleAria: 'انگریزی میں دیکھیں',

    tabTree: 'شجرۂ نسب',
    tabHistory: 'تاریخ و مآخذ',
    tabQuestions: 'تشنہ سوالات',

    searchPlaceholder: 'نام تلاش کریں…',
    expandAll: 'سب کھولیں',
    collapseAll: 'سب بند کریں',
    noResults: 'اس نام سے کوئی نہیں ملا۔',
    resultsCount: n => `${n} نتائج`,

    generation: n => `پشت ${n}`,
    childCount: n => `${n} اولاد`,

    tagConfirmed: 'مصدقہ',
    tagEstimated: 'تخمینی',
    tagShajra: 'بمطابق شجرہ',
    tagConfirmedHint: 'خاندان کی تصدیق شدہ۔',
    tagEstimatedHint: 'یاد کردہ عمروں کے فرق سے اخذ کیا گیا، کسی دستاویز سے نہیں۔',
    tagShajraHint: '۲۰۲۴ میں عکس بند شجرے سے پڑھا گیا؛ آزادانہ تصدیق نہیں ہوئی۔',

    fieldName: 'نام',
    fieldBirth: 'پیدائش',
    fieldDeath: 'وفات',
    fieldBirthplace: 'مقامِ پیدائش',
    fieldResidence: 'مقامِ رہائش',
    fieldSpouse: 'شریکِ حیات',
    fieldNotes: 'ان کے بارے میں',

    bioPlaceholder: 'کہاں رہے اور کیا کام کیا، کس بات سے پہچانے جاتے تھے، اور وہ سب کچھ جو خاندان کو یاد رہنا چاہیے۔ جتنا چاہیں لکھیں، تھوڑا یا زیادہ۔',
    bioEmpty: 'یہاں ابھی کچھ نہیں لکھا گیا۔',
    romanLabel: 'رومن اردو ٹائپنگ',
    romanHint: '"mera naam Ali hai" لکھیں، ساتھ ساتھ اردو میں بدلتا جائے گا۔ اگر آپ کے پاس اردو کی بورڈ ہے تو اسے بند کر دیں۔',
    draftRestored: 'آپ پچھلی بار جو لکھ رہے تھے وہ واپس رکھ دیا گیا ہے۔ ابھی کچھ بھیجا نہیں گیا — تیار ہوں تو "بھیجیں" دبائیں۔',
    bioInvite: 'ان کے بارے میں لکھیں',
    bioInviteSelf: 'کیا یہ آپ ہیں، یا کوئی ایسا فرد جسے آپ اچھی طرح جانتے ہیں؟ چند سطریں لکھ دیجیے۔',

    inUrdu: 'اردو میں',
    inEnglish: 'انگریزی میں',
    otherLangHint: 'اختیاری۔ خالی چھوڑ دیں تو دوسری زبان والا متن دکھایا جائے گا۔',
    urduFirstHint: 'آپ یہ پورا فارم اردو میں بھر سکتے ہیں۔ نیچے انگریزی کے خانے اختیاری ہیں۔',

    notRecorded: 'درج نہیں',
    addThis: 'یہ شامل کریں',
    locked: 'مقفل',
    lockedHint: 'یہ تفصیل تصدیق کے بعد مقفل کر دی گئی ہے۔ اگر آپ کے خیال میں اس میں تبدیلی درکار ہے تو منتظم سے رابطہ کریں۔',
    pending: 'زیرِ غور',
    pendingHint: n => `${n} تجویز کردہ تبدیلیاں جائزے کی منتظر ہیں۔`,

    close: 'بند کریں',
    suggestEdit: 'تبدیلی تجویز کریں',
    addPerson: 'نیا فرد شامل کریں',
    addChildTo: name => `${name} کی اولاد شامل کریں`,
    editingIntro: 'صرف وہی بھریں جو آپ جانتے ہیں۔ آپ کی تجویز شجرے پر ظاہر ہونے سے پہلے منتظم کے جائزے کے لیے جائے گی۔',
    yourName: 'آپ کا نام',
    yourNamePlaceholder: 'تاکہ ہم جان سکیں کہ شکریہ کس کا ادا کرنا ہے',
    yourRelation: 'آپ کا رشتہ (اختیاری)',
    yourRelationPlaceholder: 'مثلاً وصی علی کی نواسی',
    submit: 'جائزے کے لیے بھیجیں',
    submitting: 'بھیجا جا رہا ہے…',
    cancel: 'منسوخ',
    thanks: 'شکریہ — آپ کی تجویز جائزے کے لیے بھیج دی گئی ہے۔',
    errNoName: 'براہِ کرم اپنا نام لکھیں تاکہ معلوم ہو یہ تجویز کس نے دی۔',
    errNoChanges: 'ابھی کچھ تبدیل نہیں ہوا — کم از کم ایک خانہ بھریں۔',
    errSend: 'بھیجا نہ جا سکا۔ اپنا انٹرنیٹ دیکھ کر دوبارہ کوشش کریں۔',

    newPersonName: 'ان کا نام',
    relationshipTo: 'کس کی اولاد',

    offlineBanner: 'مقامی نقل دیکھی جا رہی ہے۔ جب تک سائٹ ڈیٹابیس سے منسلک نہ ہو، تبدیلیاں نہیں بھیجی جا سکتیں۔',
    loading: 'شجرۂ نسب کھل رہا ہے…',

    questionsIntro: 'یہ وہ خالی جگہیں ہیں جن میں ہمیں خاندان کی مدد سب سے زیادہ درکار ہے۔ اگر آپ ان میں سے کچھ جانتے ہیں تو متعلقہ فرد پر "تبدیلی تجویز کریں" استعمال کریں، یا منتظم سے براہِ راست رابطہ کریں۔',
    historyIntro: 'پس منظر، مآخذ، اور تخمینی تاریخوں کے پیچھے کی دلیل۔',

    footer: 'خاندانی گفتگو سے مرتب۔ تاریخیں اور املا بنیادی دستاویزات سے تصدیق تک ابتدائی ہیں۔',

    atAGlance: 'ایک نظر میں',
    statPeople: 'افراد درج ہیں',
    statGenerations: 'پشتیں',
    statGaps: 'تفصیلات ابھی درکار ہیں',
    statLocked: 'تفصیلات تصدیق شدہ',
    mostWanted: 'سب سے زیادہ مطلوب',
    legend: 'نشانات کا مطلب',
    tapPrompt: 'کسی بھی فرد پر کلک کریں تاکہ ان کی تفصیلات دیکھ سکیں یا تبدیلی تجویز کر سکیں۔',

    adminTitle: 'جائزے کی فہرست',
    adminSignIn: 'داخل ہوں',
    adminPassword: 'ایڈمن پاس ورڈ',
    adminWrongPass: 'یہ پاس ورڈ درست نہیں۔',
    adminNoPending: 'جائزے کے لیے کچھ نہیں۔',
    adminSuggestedBy: 'تجویز کنندہ',
    adminCurrent: 'موجودہ',
    adminProposed: 'تجویز کردہ',
    adminApprove: 'منظور',
    adminApproveLock: 'منظور کر کے مقفل کریں',
    adminReject: 'مسترد',
    adminEmpty: '(خالی)',
    adminNewPerson: 'نیا فرد',
    adminLockedFields: 'مقفل خانے',
    adminUnlock: 'قفل کھولیں',
    adminManageLocks: 'قفل سنبھالیں',
    adminSignOut: 'باہر نکلیں',
    errPermission: 'ڈیٹابیس نے یہ تبدیلی قبول نہیں کی۔ آپ کی تجویز اب بھی قطار میں محفوظ ہے — کچھ ضائع نہیں ہوا۔ یہ اجازت کی ترتیب کا مسئلہ ہے، آپ کے انٹرنیٹ کا نہیں۔',
    errExpired: 'آپ کی لاگ اِن مدت ختم ہو گئی ہے۔ باہر نکل کر دوبارہ لاگ اِن کریں، پھر کوشش کریں — تجویز اب بھی قطار میں موجود ہے۔',
    errServer: (code, detail) => `ڈیٹابیس نے خرابی ظاہر کی (${code})۔ کچھ ضائع نہیں ہوا؛ تجویز اب بھی قطار میں ہے۔ تفصیل: ${detail}`,
    errNetwork: 'ڈیٹابیس تک رسائی نہیں ہو سکی۔ اپنا انٹرنیٹ دیکھ کر دوبارہ کوشش کریں — کچھ ضائع نہیں ہوا۔',

    photoSection: 'تصویر',
    photoHint: 'JPEG، PNG یا WebP، زیادہ سے زیادہ ۵ ایم بی۔ منتظمِ ریکارڈ کی منظوری تک یہ شجرے پر نہیں دکھائی دے گی۔',
    photoReplaceHint: 'ایک تصویر پہلے سے موجود ہے۔ نئی تصویر منتخب کرنے کا مطلب اسے بدلنے کی تجویز ہے۔',
    photoUploading: 'اپ لوڈ ہو رہی ہے…',
    photoReady: 'اپ لوڈ ہو گئی۔ جائزے کے لیے بھیجنے کو نیچے "بھیجیں" دبائیں۔',
    photoBadType: 'یہ فائل JPEG، PNG یا WebP تصویر نہیں ہے۔',
    photoTooBig: 'یہ تصویر ۵ ایم بی سے بڑی ہے۔ براہِ کرم چھوٹی تصویر منتخب کریں۔',
    adminPhotoReplaces: 'موجودہ تصویر کی جگہ لے گی',

    adminHistory: 'فیصلہ شدہ',
    adminHistoryIntro: 'وہ سب کچھ جس پر آپ فیصلہ کر چکے ہیں۔ کچھ بھی حذف نہیں ہوتا — مسترد شدہ تجاویز بھی محفوظ رہتی ہیں، تاکہ آپ دیکھ سکیں کہ کیا تجویز ہوا تھا اور آپ نے کب فیصلہ کیا۔',
    adminHistoryLoading: 'لوڈ ہو رہا ہے…',
    adminHistoryEmpty: 'آپ نے ابھی کسی تجویز پر فیصلہ نہیں کیا۔ منظور اور مسترد شدہ تجاویز یہاں دکھائی دیں گی۔',
    adminWasApproved: 'منظور شدہ',
    adminWasRejected: 'مسترد شدہ',
    adminDecidedMeta: (author, when) => `تجویز کنندہ: ${author}${when ? ` · فیصلہ ${when}` : ''}`,

    adminBackup: 'بیک اپ ڈاؤن لوڈ کریں',
    adminBackupWorking: 'تیار ہو رہا ہے…',
    adminBackupFailed: 'بیک اپ ڈاؤن لوڈ نہیں ہو سکا۔ اپنا انٹرنیٹ دیکھ کر دوبارہ کوشش کریں۔'
  }
};

/* Which person field maps to which label key. The _ur twins share their
 * English label — the form groups by language, so repeating "in Urdu" on
 * every field would just be noise. */
const FIELD_LABELS = {
  name: 'fieldName',
  name_ur: 'fieldName',
  birth: 'fieldBirth',
  birth_ur: 'fieldBirth',
  death: 'fieldDeath',
  death_ur: 'fieldDeath',
  birthplace: 'fieldBirthplace',
  birthplace_ur: 'fieldBirthplace',
  residence: 'fieldResidence',
  residence_ur: 'fieldResidence',
  spouse: 'fieldSpouse',
  spouse_ur: 'fieldSpouse',
  notes: 'fieldNotes',
  notes_ur: 'fieldNotes'
};

/* A fixed, hand-written vocabulary for the date abbreviations and place names
 * that recur in the record. Applied for display only, in Urdu mode only, and
 * never to a person's name — proper nouns are only ever shown from a
 * translation someone in the family actually wrote. Longest key first so
 * "Murshidabad" is not half-replaced by a shorter overlapping key. */
const UR_PHRASES = [
  ['aged approximately', 'تقریباً عمر'],
  ['(estimated)', '(تخمینی)'],
  ['Naqvi descent', 'نقوی نسب'],
  ['(3rd wife)', '(تیسری اہلیہ)'],
  ['(2nd wife)', '(دوسری اہلیہ)'],
  ['Murshidabad', 'مرشد آباد'],
  ['Rawalpindi', 'راولپنڈی'],
  ['Mohalla Nakkhas', 'محلہ نکھاس'],
  ['Talkatora Karbala', 'تل کٹورہ کربلا'],
  ['Hussaini Dalan', 'حسینی دالان'],
  ['Ikraam Ganj', 'اکرام گنج'],
  ['Aaram Ganj', 'آرام گنج'],
  ['Bangladesh', 'بنگلہ دیش'],
  ['Lucknow', 'لکھنؤ'],
  ['Karachi', 'کراچی'],
  ['Lahore', 'لاہور'],
  ['Samana', 'سمانہ'],
  ['Patiala', 'پٹیالہ'],
  ['Punjab', 'پنجاب'],
  ['Dubai', 'دبئی'],
  ['Dhaka', 'ڈھاکہ'],
  ['Iran', 'ایران'],
  ['India', 'بھارت'],
  ['later', 'بعد ازاں'],
  ['b. ', 'پ۔ '],
  ['d. ', 'و۔ '],
  ['m. ', 'ازدواج '],
  ['c. ', 'تقریباً ']
];

const I18N = {
  lang: (typeof localStorage !== 'undefined' && localStorage.getItem('rft-lang')) || 'en',

  get dir() { return STRINGS[this.lang].dir; },
  get isUrdu() { return this.lang === 'ur'; },

  t(key, ...args) {
    const v = STRINGS[this.lang][key];
    if (v === undefined) return STRINGS.en[key] ?? key;
    return typeof v === 'function' ? v(...args) : v;
  },

  label(fieldKey) { return this.t(FIELD_LABELS[fieldKey] || fieldKey); },

  setLang(lang) {
    this.lang = lang;
    try { localStorage.setItem('rft-lang', lang); } catch (e) { /* private mode */ }
    document.documentElement.lang = lang;
    document.documentElement.dir = STRINGS[lang].dir;
    document.documentElement.classList.toggle('urdu', lang === 'ur');
  },

  /* Pick the Urdu variant of a person field when in Urdu mode, falling back
   * to English so a missing translation never blanks the tree. Returns
   * { text, isFallback } so the UI can mark untranslated values. */
  pick(person, baseKey) {
    const en = (person[baseKey] || '').trim();
    if (!this.isUrdu) return { text: en, isFallback: false };
    const ur = (person[baseKey + '_ur'] || '').trim();
    if (ur) return { text: ur, isFallback: false };
    return { text: en, isFallback: !!en };
  },

  /* Convert Western digits to Urdu-Indic digits for display only. */
  digits(str) {
    if (!this.isUrdu || !str) return str;
    return String(str).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
  },

  /* Swap the known date abbreviations and place names, then the digits, so a
   * date line reads as one script instead of two. Anything outside the
   * vocabulary is left in English rather than guessed at. */
  display(str) {
    if (!this.isUrdu || !str) return str || '';
    let out = String(str);
    UR_PHRASES.forEach(([en, ur]) => {
      out = out.split(en).join(ur);
    });
    return this.digits(out);
  }
};

if (typeof window !== 'undefined') {
  window.I18N = I18N;
  window.STRINGS = STRINGS;
  window.FIELD_LABELS = FIELD_LABELS;
}
