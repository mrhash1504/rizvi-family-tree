/* Rizvi Family Tree — seed data
 *
 * Transcribed from Rizvi_Family_Tree.docx (compiled by Hussain Raza).
 * This file is the fallback / bootstrap dataset. Once Supabase is connected,
 * the live `people` table is the source of truth and this is only used to
 * seed the database the first time (see supabase/schema.sql) and to keep the
 * site readable if the database is unreachable.
 *
 * Every field has an Urdu twin (`_ur`), so a relative who reads no English
 * can read the whole record and fill in their own details entirely in Urdu.
 * Where an Urdu value is blank the site falls back to the English and marks
 * it, so the gap is visible rather than silent.
 *
 * Field confidence tags mirror the document's own layering:
 *   confirmed — confirmed by the family
 *   estimated — derived from recalled age gaps, not a document
 *   shajra    — read from the 2024 photographed shajra, not independently confirmed
 */

/* Bump whenever the shape of a person record changes. Local mode keeps a
 * copy in browser storage; without this, someone who visited before a field
 * was added would keep seeing the old shape forever. */
const SEED_VERSION = 2;

/* Ordered in pairs: each English field followed by its Urdu twin. The edit
 * form shows whichever half matches the reader's language first. */
const EDITABLE_FIELDS = [
  { key: 'name',          pair: 'name_ur',       type: 'text',     lang: 'en' },
  { key: 'name_ur',       pair: 'name',          type: 'text',     lang: 'ur' },
  { key: 'birth',         pair: 'birth_ur',      type: 'text',     lang: 'en' },
  { key: 'birth_ur',      pair: 'birth',         type: 'text',     lang: 'ur' },
  { key: 'death',         pair: 'death_ur',      type: 'text',     lang: 'en' },
  { key: 'death_ur',      pair: 'death',         type: 'text',     lang: 'ur' },
  { key: 'birthplace',    pair: 'birthplace_ur', type: 'text',     lang: 'en' },
  { key: 'birthplace_ur', pair: 'birthplace',    type: 'text',     lang: 'ur' },
  { key: 'residence',     pair: 'residence_ur',  type: 'text',     lang: 'en' },
  { key: 'residence_ur',  pair: 'residence',     type: 'text',     lang: 'ur' },
  { key: 'spouse',        pair: 'spouse_ur',     type: 'text',     lang: 'en' },
  { key: 'spouse_ur',     pair: 'spouse',        type: 'text',     lang: 'ur' },
  { key: 'notes',         pair: 'notes_ur',      type: 'textarea', lang: 'en' },
  { key: 'notes_ur',      pair: 'notes',         type: 'textarea', lang: 'ur' }
];

/* The paired base names, in the order they appear on a profile. */
const FIELD_ORDER = ['name', 'birth', 'death', 'birthplace', 'residence', 'spouse', 'notes'];

const SEED_PEOPLE = [
  {
    id: 'ali-hussain-rizvi',
    parent: null,
    name: 'Mir Ali Hussain Rizvi',
    name_ur: 'میر علی حسین رضوی',
    birth: 'c. 1792–1793 (estimated)',
    birth_ur: 'تقریباً ۱۷۹۲–۱۷۹۳ء (تخمینی)',
    death: '', death_ur: '',
    birthplace: '', birthplace_ur: '',
    residence: 'Lucknow', residence_ur: 'لکھنؤ',
    spouse: '', spouse_ur: '',
    tag: 'estimated',
    notes: 'Earliest confirmed ancestor. Birth year estimated using a 30-year average generation gap back from Syed Hussain Ali Rizvi (b. 1882–1883) across three generations. The shajra dated the equivalent entry to c. 1650 AD, but the family understands that to have been a rough guess rather than a documented date, so the later estimate is treated as the better working figure.',
    notes_ur: 'سب سے قدیم مصدقہ جدِ امجد۔ سالِ پیدائش کا تخمینہ سید حسین علی رضوی (پیدائش ۱۸۸۲–۱۸۸۳ء) سے تین پشتیں پیچھے، فی پشت تیس سال کے اوسط کے حساب سے لگایا گیا ہے۔ شجرے میں اسی اندراج کی تاریخ تقریباً ۱۶۵۰ء درج ہے، مگر خاندان کے مطابق وہ محض ایک اندازہ تھا، کوئی دستاویزی تاریخ نہیں؛ اسی لیے بعد والے تخمینے کو بہتر عملی تاریخ سمجھا جاتا ہے۔',
    locked: []
  },
  {
    id: 'ghulam-raza-rizvi-sr',
    parent: 'ali-hussain-rizvi',
    name: 'Mir Ghulam Raza Rizvi',
    name_ur: 'میر غلام رضا رضوی',
    birth: '', birth_ur: '',
    death: '', death_ur: '',
    birthplace: '', birthplace_ur: '',
    residence: 'Lucknow', residence_ur: 'لکھنؤ',
    spouse: '', spouse_ur: '',
    tag: 'confirmed',
    notes: 'Son of Mir Ali Hussain Rizvi. The family has confirmed the shajra\'s generation order — Mir Ghulam Raza Rizvi comes before Syed Afzal Hussain Rizvi. An earlier family recollection had these two reversed.',
    notes_ur: 'میر علی حسین رضوی کے فرزند۔ خاندان نے شجرے میں دی گئی پشتوں کی ترتیب کی تصدیق کر دی ہے — میر غلام رضا رضوی، سید افضل حسین رضوی سے پہلے آتے ہیں۔ خاندان کی پہلی یاد میں یہ دونوں الٹ تھے۔',
    locked: []
  },
  {
    id: 'afzal-hussain-rizvi',
    parent: 'ghulam-raza-rizvi-sr',
    name: 'Syed Afzal Hussain Rizvi',
    name_ur: 'سید افضل حسین رضوی',
    birth: '', birth_ur: '',
    death: '', death_ur: '',
    birthplace: '', birthplace_ur: '',
    residence: 'Lucknow', residence_ur: 'لکھنؤ',
    spouse: 'Syeda Fatima Begum', spouse_ur: 'سیدہ فاطمہ بیگم',
    tag: 'confirmed',
    notes: 'Of Lucknow. Buried in Lucknow, consistent with the family\'s residence in Mohalla Nakkhas. The Talkatora Karbala in that quarter is a plausible burial site but has not been confirmed.',
    notes_ur: 'لکھنؤ کے رہنے والے۔ لکھنؤ ہی میں مدفون ہیں، جو محلہ نکھاس میں خاندان کی رہائش سے مطابقت رکھتا ہے۔ اسی محلے کی تل کٹورہ کربلا ایک ممکنہ مدفن ہو سکتی ہے، مگر اس کی تصدیق نہیں ہوئی۔',
    locked: []
  },
  {
    id: 'hussain-ali-rizvi',
    parent: 'afzal-hussain-rizvi',
    name: 'Syed Hussain Ali Rizvi',
    name_ur: 'سید حسین علی رضوی',
    birth: 'b. 1882–1883 (estimated)',
    birth_ur: 'پیدائش ۱۸۸۲–۱۸۸۳ء (تخمینی)',
    death: 'd. c. 1950',
    death_ur: 'وفات تقریباً ۱۹۵۰ء',
    birthplace: 'Lucknow', birthplace_ur: 'لکھنؤ',
    residence: 'Lucknow, later Murshidabad',
    residence_ur: 'لکھنؤ، بعد ازاں مرشد آباد',
    spouse: 'Nowrozi Begum (3rd wife), b. 1912–1913 (estimated)',
    spouse_ur: 'نوروزی بیگم (تیسری اہلیہ)، پیدائش ۱۹۱۲–۱۹۱۳ء (تخمینی)',
    tag: 'estimated',
    notes: 'A religious scholar and zakir. Birth year estimated from the family recollection that he was 45 at his marriage to Nowrozi Begum around 1927–1928; she was 15, giving her birth as 1912–1913. Separate family recollection puts him at approximately 1870–1880; the shajra says 1870.\n\nHe had three wives. His first wife, mother of Syed Ali Rizvi, passed away shortly after childbirth. He then married her sister, who also passed away shortly after her own childbirth — likely the mother of Yousuf Jahan, given her position in the birth order. Nowrozi Begum, the third wife and daughter of Sheikh Munawwar Ali, was the mother of the remaining children.\n\nMoved from Lucknow to Murshidabad; the family recalls this was because his sister married into a Nawab family there whose title ended in "Jah". Owned property in Ikraam Ganj, Murshidabad, and refurbished a mosque there (name not yet recorded). Buried at a site the family calls Hussaini Dalan in Murshidabad. After he passed away around 1950 the family relocated to Dhaka around 1951.',
    notes_ur: 'عالمِ دین اور ذاکر۔ سالِ پیدائش کا تخمینہ خاندان کی اس یاد سے لگایا گیا ہے کہ نوروزی بیگم سے نکاح کے وقت، تقریباً ۱۹۲۷–۱۹۲۸ء میں، ان کی عمر ۴۵ برس تھی؛ نوروزی بیگم کی عمر ۱۵ برس تھی، جس سے ان کی پیدائش ۱۹۱۲–۱۹۱۳ء بنتی ہے۔ خاندان کی ایک الگ یاد کے مطابق ان کی پیدائش تقریباً ۱۸۷۰–۱۸۸۰ء کے درمیان ہے؛ شجرے میں ۱۸۷۰ء درج ہے۔\n\nان کی تین بیویاں تھیں۔ پہلی اہلیہ، جو سید علی رضوی کی والدہ تھیں، ولادت کے کچھ ہی عرصے بعد انتقال کر گئیں۔ اس کے بعد انہوں نے ان کی ہمشیرہ سے نکاح کیا (دوسری اہلیہ)، جو خود بھی اپنی ولادت کے کچھ عرصے بعد انتقال کر گئیں — ترتیبِ ولادت کے اعتبار سے غالباً وہی یوسف جہاں کی والدہ تھیں۔ تیسری اہلیہ نوروزی بیگم، جو شیخ منور علی کی صاحبزادی تھیں، باقی تمام اولاد کی والدہ تھیں۔\n\nلکھنؤ سے مرشد آباد منتقل ہوئے؛ خاندان کو یاد ہے کہ اس کی وجہ یہ تھی کہ ان کی ہمشیرہ کی شادی وہاں کے ایک نوابی خاندان میں ہوئی تھی جس کے لقب کا اختتام "جاہ" پر ہوتا تھا۔ مرشد آباد میں اکرام گنج میں جائیداد کے مالک تھے اور وہاں ایک مسجد کی تجدید کرائی (نام ابھی درج نہیں)۔ مرشد آباد میں اس مقام پر مدفون ہیں جسے خاندان "حسینی دالان" کہتا ہے۔ تقریباً ۱۹۵۰ء میں ان کی وفات کے بعد خاندان تقریباً ۱۹۵۱ء میں ڈھاکہ منتقل ہو گیا۔',
    locked: []
  },
  {
    id: 'sughra-begum-sister',
    parent: 'afzal-hussain-rizvi',
    name: 'Syeda Sughra Begum',
    name_ur: 'سیدہ صغریٰ بیگم',
    birth: '', birth_ur: '', death: '', death_ur: '',
    birthplace: '', birthplace_ur: '', residence: '', residence_ur: '',
    spouse: '', spouse_ur: '',
    tag: 'shajra',
    notes: 'Sister of Syed Hussain Ali Rizvi. 2 sons and 3 daughters, names not recorded (per shajra).',
    notes_ur: 'سید حسین علی رضوی کی ہمشیرہ۔ دو بیٹے اور تین بیٹیاں، نام درج نہیں (بمطابق شجرہ)۔',
    locked: []
  },
  {
    id: 'zehra-begum-sister',
    parent: 'afzal-hussain-rizvi',
    name: 'Syeda Zehra Begum',
    name_ur: 'سیدہ زہرا بیگم',
    birth: '', birth_ur: '', death: '', death_ur: '',
    birthplace: '', birthplace_ur: '', residence: '', residence_ur: '',
    spouse: '', spouse_ur: '',
    tag: 'shajra',
    notes: 'Sister of Syed Hussain Ali Rizvi. 1 son, name not recorded (per shajra).',
    notes_ur: 'سید حسین علی رضوی کی ہمشیرہ۔ ایک بیٹا، نام درج نہیں (بمطابق شجرہ)۔',
    locked: []
  },
  {
    id: 'ali-raza-brother',
    parent: 'afzal-hussain-rizvi',
    name: 'Syed Ali Raza',
    name_ur: 'سید علی رضا',
    birth: '', birth_ur: '', death: '', death_ur: '',
    birthplace: '', birthplace_ur: '', residence: '', residence_ur: '',
    spouse: '', spouse_ur: '',
    tag: 'shajra',
    notes: 'Brother of Syed Hussain Ali Rizvi (per shajra).',
    notes_ur: 'سید حسین علی رضوی کے بھائی (بمطابق شجرہ)۔',
    locked: []
  },

  /* Children of Syed Hussain Ali Rizvi */
  {
    id: 'syed-ali-rizvi',
    parent: 'hussain-ali-rizvi',
    name: 'Syed Ali Rizvi',
    name_ur: 'سید علی رضوی',
    birth: 'b. 1925', birth_ur: 'پیدائش ۱۹۲۵ء',
    death: '', death_ur: '',
    birthplace: '', birthplace_ur: '',
    residence: 'Karachi', residence_ur: 'کراچی',
    spouse: '', spouse_ur: '',
    tag: 'confirmed',
    notes: 'First son. His mother was Syed Hussain Ali Rizvi\'s first wife, who passed away shortly after his birth. The shajra\'s independently recorded 1925 lines up well with the age-gap estimate of c. 1922–1925.',
    notes_ur: 'پہلے فرزند۔ ان کی والدہ سید حسین علی رضوی کی پہلی اہلیہ تھیں، جو ان کی ولادت کے کچھ ہی عرصے بعد انتقال کر گئیں۔ شجرے میں الگ سے درج ۱۹۲۵ء عمر کے فرق سے لگائے گئے تخمینے (تقریباً ۱۹۲۲–۱۹۲۵ء) سے خوب مطابقت رکھتا ہے۔',
    locked: []
  },
  {
    id: 'yousuf-jahan',
    parent: 'hussain-ali-rizvi',
    name: 'Yousuf Jahan',
    name_ur: 'یوسف جہاں',
    birth: 'b. c. 1924–1927 (estimated)',
    birth_ur: 'پیدائش تقریباً ۱۹۲۴–۱۹۲۷ء (تخمینی)',
    death: '', death_ur: '',
    birthplace: '', birthplace_ur: '',
    residence: 'Karachi', residence_ur: 'کراچی',
    spouse: '', spouse_ur: '',
    tag: 'estimated',
    notes: 'Elder step-sister to Hussain Raza\'s father. Her mother was likely Syed Hussain Ali Rizvi\'s second wife (sister of the first), who also passed away shortly after childbirth. Birth year estimated from being recalled as 3–5 years older than Wasi Ali.',
    notes_ur: 'حسین رضا کے والد کی بڑی سوتیلی ہمشیرہ۔ غالباً ان کی والدہ سید حسین علی رضوی کی دوسری اہلیہ تھیں (پہلی اہلیہ کی ہمشیرہ)، جو خود بھی ولادت کے کچھ عرصے بعد انتقال کر گئیں۔ سالِ پیدائش کا تخمینہ اس یاد سے لگایا گیا کہ وہ وصی علی سے تین تا پانچ برس بڑی تھیں۔',
    locked: []
  },
  {
    id: 'wasi-ali',
    parent: 'hussain-ali-rizvi',
    name: 'Wasi Ali',
    name_ur: 'وصی علی',
    birth: 'b. c. 1929–1930 (estimated)',
    birth_ur: 'پیدائش تقریباً ۱۹۲۹–۱۹۳۰ء (تخمینی)',
    death: 'd. 2013, aged approximately 85',
    death_ur: 'وفات ۲۰۱۳ء، تقریباً ۸۵ برس کی عمر میں',
    birthplace: '', birthplace_ur: '',
    residence: 'Karachi', residence_ur: 'کراچی',
    spouse: 'Hilal Begum', spouse_ur: 'ہلال بیگم',
    tag: 'shajra',
    notes: 'Eldest son of Nowrozi Begum, born the year after her marriage. Remains shajra-only and has not yet been independently confirmed. Died December 2013 aged approximately 85.',
    notes_ur: 'نوروزی بیگم کے سب سے بڑے فرزند، ان کی شادی کے اگلے برس پیدا ہوئے۔ ابھی تک صرف شجرے میں درج ہیں اور آزادانہ تصدیق باقی ہے۔ دسمبر ۲۰۱۳ء میں تقریباً ۸۵ برس کی عمر میں انتقال ہوا۔',
    locked: []
  },
  {
    id: 'wazir-ali',
    parent: 'hussain-ali-rizvi',
    name: 'Wazir Ali',
    name_ur: 'وزیر علی',
    birth: 'b. c. 1932–1933 (estimated)',
    birth_ur: 'پیدائش تقریباً ۱۹۳۲–۱۹۳۳ء (تخمینی)',
    death: 'd. 2005', death_ur: 'وفات ۲۰۰۵ء',
    birthplace: '', birthplace_ur: '',
    residence: 'Lahore', residence_ur: 'لاہور',
    spouse: 'Sughra Begum', spouse_ur: 'صغریٰ بیگم',
    tag: 'shajra',
    notes: 'Remains shajra-only and has not yet been independently confirmed. Birth year estimated from the recollection that Wasi Ali, Wazir Ali and Jafar Hussain were each born at most 2 years apart.',
    notes_ur: 'ابھی تک صرف شجرے میں درج ہیں اور آزادانہ تصدیق باقی ہے۔ سالِ پیدائش کا تخمینہ اس یاد سے لگایا گیا کہ وصی علی، وزیر علی اور جعفر حسین میں سے ہر ایک کے درمیان زیادہ سے زیادہ دو برس کا فرق تھا۔',
    locked: []
  },
  {
    id: 'jafar-hussain',
    parent: 'hussain-ali-rizvi',
    name: 'Jafar Hussain',
    name_ur: 'جعفر حسین',
    birth: 'b. 1934', birth_ur: 'پیدائش ۱۹۳۴ء',
    death: 'd. 2006', death_ur: 'وفات ۲۰۰۶ء',
    birthplace: '', birthplace_ur: '',
    residence: 'Rawalpindi', residence_ur: 'راولپنڈی',
    spouse: 'Sarwari Begum', spouse_ur: 'سروری بیگم',
    tag: 'shajra',
    notes: 'Per shajra. His 1934 birth is the anchor from which Wasi Ali\'s and Wazir Ali\'s birth years were estimated.',
    notes_ur: 'بمطابق شجرہ۔ ان کا سنِ پیدائش ۱۹۳۴ء وہ بنیاد ہے جس سے وصی علی اور وزیر علی کے سنینِ پیدائش کا تخمینہ لگایا گیا۔',
    locked: []
  },
  { id: 'muhammad-ali-yousuf', parent: 'jafar-hussain', name: 'Muhammad Ali', name_ur: 'محمد علی', birth: '', birth_ur: '', death: '', death_ur: '', birthplace: '', birthplace_ur: '', residence: '', residence_ur: '', spouse: '', spouse_ur: '', tag: 'confirmed', notes: 'Known as Yousuf.', notes_ur: 'یوسف کے نام سے معروف۔', locked: [] },
  { id: 'batool', parent: 'jafar-hussain', name: 'Batool', name_ur: 'بتول', birth: '', birth_ur: '', death: '', death_ur: '', birthplace: '', birthplace_ur: '', residence: '', residence_ur: '', spouse: '', spouse_ur: '', tag: 'confirmed', notes: '', notes_ur: '', locked: [] },
  { id: 'phool', parent: 'jafar-hussain', name: 'Phool', name_ur: 'پھول', birth: '', birth_ur: '', death: '', death_ur: '', birthplace: '', birthplace_ur: '', residence: '', residence_ur: '', spouse: '', spouse_ur: '', tag: 'confirmed', notes: '', notes_ur: '', locked: [] },
  { id: 'shazia', parent: 'jafar-hussain', name: 'Shazia', name_ur: 'شازیہ', birth: '', birth_ur: '', death: '', death_ur: '', birthplace: '', birthplace_ur: '', residence: '', residence_ur: '', spouse: '', spouse_ur: '', tag: 'confirmed', notes: '', notes_ur: '', locked: [] },
  { id: 'mustafa', parent: 'jafar-hussain', name: 'Mustafa', name_ur: 'مصطفیٰ', birth: '', birth_ur: '', death: '', death_ur: '', birthplace: '', birthplace_ur: '', residence: '', residence_ur: '', spouse: '', spouse_ur: '', tag: 'confirmed', notes: '', notes_ur: '', locked: [] },
  {
    id: 'fatima-begum',
    parent: 'hussain-ali-rizvi',
    name: 'Fatima Begum',
    name_ur: 'فاطمہ بیگم',
    birth: '', birth_ur: '', death: '', death_ur: '',
    birthplace: '', birthplace_ur: '',
    residence: 'Murshidabad', residence_ur: 'مرشد آباد',
    spouse: '', spouse_ur: '',
    tag: 'shajra',
    notes: 'Per shajra.',
    notes_ur: 'بمطابق شجرہ۔',
    locked: []
  },
  {
    id: 'hakeema-begum',
    parent: 'hussain-ali-rizvi',
    name: 'Hakeema Begum',
    name_ur: 'حکیمہ بیگم',
    birth: 'b. c. 1944–1945 (estimated)',
    birth_ur: 'پیدائش تقریباً ۱۹۴۴–۱۹۴۵ء (تخمینی)',
    death: '', death_ur: '',
    birthplace: '', birthplace_ur: '',
    residence: '', residence_ur: '',
    spouse: 'Abul Hasan Rizvi', spouse_ur: 'ابوالحسن رضوی',
    tag: 'estimated',
    notes: 'Birth year derived from being recalled as 5 years older than Syed Ghulam Raza Rizvi.',
    notes_ur: 'سالِ پیدائش اس یاد سے اخذ کیا گیا کہ وہ سید غلام رضا رضوی سے پانچ برس بڑی تھیں۔',
    locked: []
  },
  { id: 'faiz-ul-hasan', parent: 'hakeema-begum', name: 'Faiz ul Hasan', name_ur: 'فیض الحسن', birth: '', birth_ur: '', death: '', death_ur: '', birthplace: '', birthplace_ur: '', residence: '', residence_ur: '', spouse: '', spouse_ur: '', tag: 'confirmed', notes: '', notes_ur: '', locked: [] },
  { id: 'najmul-hasan', parent: 'hakeema-begum', name: 'Najmul Hasan', name_ur: 'نجم الحسن', birth: '', birth_ur: '', death: '', death_ur: '', birthplace: '', birthplace_ur: '', residence: '', residence_ur: '', spouse: '', spouse_ur: '', tag: 'confirmed', notes: '', notes_ur: '', locked: [] },
  {
    id: 'afzal-hussain',
    parent: 'hussain-ali-rizvi',
    name: 'Afzal Hussain',
    name_ur: 'افضل حسین',
    birth: 'b. c. 1946–1947 (estimated)',
    birth_ur: 'پیدائش تقریباً ۱۹۴۶–۱۹۴۷ء (تخمینی)',
    death: 'd. 2021', death_ur: 'وفات ۲۰۲۱ء',
    birthplace: '', birthplace_ur: '',
    residence: 'Karachi', residence_ur: 'کراچی',
    spouse: 'Tahira', spouse_ur: 'طاہرہ',
    tag: 'estimated',
    notes: 'Nine children: 5 sons and 4 daughters. Their names and birth years are not yet recorded — this is an open question on the research list, and one of the most useful gaps for the family to fill in. Birth year derived from being recalled as 3 years older than Syed Ghulam Raza Rizvi.',
    notes_ur: 'نو اولاد: پانچ بیٹے اور چار بیٹیاں۔ ان کے نام اور سنینِ پیدائش ابھی درج نہیں ہوئے — یہ تحقیق طلب سوالات میں شامل ہے اور خاندان کے لیے سب سے مفید خلا میں سے ایک ہے۔ سالِ پیدائش اس یاد سے اخذ کیا گیا کہ وہ سید غلام رضا رضوی سے تین برس بڑے تھے۔',
    locked: []
  },
  {
    id: 'ghulam-raza-rizvi',
    parent: 'hussain-ali-rizvi',
    name: 'Syed Ghulam Raza Rizvi',
    name_ur: 'سید غلام رضا رضوی',
    birth: 'b. c. 1949–1950', birth_ur: 'پیدائش تقریباً ۱۹۴۹–۱۹۵۰ء',
    death: 'd. 1 January 2015', death_ur: 'وفات یکم جنوری ۲۰۱۵ء',
    birthplace: 'Murshidabad', birthplace_ur: 'مرشد آباد',
    residence: 'Dubai', residence_ur: 'دبئی',
    spouse: 'Tasneem Fatima, b. 1950 (Naqvi descent)',
    spouse_ur: 'تسنیم فاطمہ، پیدائش ۱۹۵۰ء (نقوی نسب)',
    tag: 'confirmed',
    notes: 'Elders recall he was a newborn, or not yet born, when Syed Hussain Ali Rizvi passed away around 1950. Confirmed as the "Ghulam Raza" shown in the shajra as a child of Syed Hussain Ali Rizvi. The shajra\'s death year of 2013 is incorrect — he passed away on 1 January 2015 in Dubai. His wife\'s full name is Tasneem Fatima, of Naqvi descent; the shajra\'s "Tasneem Naqvi" was a shortened form.',
    notes_ur: 'بزرگوں کو یاد ہے کہ تقریباً ۱۹۵۰ء میں سید حسین علی رضوی کی وفات کے وقت یہ نومولود تھے یا ابھی پیدا نہیں ہوئے تھے۔ شجرے میں سید حسین علی رضوی کے فرزند کے طور پر درج "غلام رضا" کی بطور انہی کے تصدیق ہو چکی ہے۔ شجرے میں درج سالِ وفات ۲۰۱۳ء غلط ہے — ان کا انتقال یکم جنوری ۲۰۱۵ء کو دبئی میں ہوا۔ ان کی اہلیہ کا پورا نام تسنیم فاطمہ ہے، نقوی نسب سے؛ شجرے کا "تسنیم نقوی" مختصر صورت تھی۔',
    locked: []
  },

  /* Children of Syed Ghulam Raza Rizvi */
  {
    id: 'siper-fatima',
    parent: 'ghulam-raza-rizvi',
    name: 'Syeda Siper Fatima Rizvi',
    name_ur: 'سیدہ سپر فاطمہ رضوی',
    birth: 'b. 1973', birth_ur: 'پیدائش ۱۹۷۳ء',
    death: '', death_ur: '',
    birthplace: '', birthplace_ur: '',
    residence: '', residence_ur: '',
    spouse: 'Syed Hasan Imam Naqvi', spouse_ur: 'سید حسن امام نقوی',
    tag: 'confirmed',
    notes: 'Eldest of Syed Ghulam Raza Rizvi\'s children.',
    notes_ur: 'سید غلام رضا رضوی کی سب سے بڑی اولاد۔',
    locked: []
  },
  { id: 'amal-hasan', parent: 'siper-fatima', name: 'Amal Hasan', name_ur: 'امل حسن', birth: 'b. 1999', birth_ur: 'پیدائش ۱۹۹۹ء', death: '', death_ur: '', birthplace: '', birthplace_ur: '', residence: '', residence_ur: '', spouse: '', spouse_ur: '', tag: 'confirmed', notes: '', notes_ur: '', locked: [] },
  { id: 'manahil-hasan', parent: 'siper-fatima', name: 'Manahil Hasan', name_ur: 'مناہل حسن', birth: 'b. 2004', birth_ur: 'پیدائش ۲۰۰۴ء', death: '', death_ur: '', birthplace: '', birthplace_ur: '', residence: '', residence_ur: '', spouse: '', spouse_ur: '', tag: 'confirmed', notes: '', notes_ur: '', locked: [] },
  { id: 'shaza-hasan', parent: 'siper-fatima', name: 'Shaza Hasan', name_ur: 'شازہ حسن', birth: 'b. 2006', birth_ur: 'پیدائش ۲۰۰۶ء', death: '', death_ur: '', birthplace: '', birthplace_ur: '', residence: '', residence_ur: '', spouse: '', spouse_ur: '', tag: 'confirmed', notes: '', notes_ur: '', locked: [] },
  {
    id: 'abbas-raza',
    parent: 'ghulam-raza-rizvi',
    name: 'Abbas Raza',
    name_ur: 'عباس رضا',
    birth: 'b. 1975', birth_ur: 'پیدائش ۱۹۷۵ء',
    death: '', death_ur: '',
    birthplace: '', birthplace_ur: '',
    residence: '', residence_ur: '',
    spouse: 'Aatika Fatima', spouse_ur: 'عاتکہ فاطمہ',
    tag: 'confirmed',
    notes: 'Eldest brother.',
    notes_ur: 'سب سے بڑے بھائی۔',
    locked: []
  },
  { id: 'ali-raza-rizvi', parent: 'abbas-raza', name: 'Syed Ali Raza Rizvi', name_ur: 'سید علی رضا رضوی', birth: 'b. 2001', birth_ur: 'پیدائش ۲۰۰۱ء', death: '', death_ur: '', birthplace: '', birthplace_ur: '', residence: '', residence_ur: '', spouse: 'Masooma Rizvi', spouse_ur: 'معصومہ رضوی', tag: 'confirmed', notes: '', notes_ur: '', locked: [] },
  { id: 'fatima-abbas-rizvi', parent: 'abbas-raza', name: 'Syeda Fatima Abbas Rizvi', name_ur: 'سیدہ فاطمہ عباس رضوی', birth: 'b. 2002', birth_ur: 'پیدائش ۲۰۰۲ء', death: '', death_ur: '', birthplace: '', birthplace_ur: '', residence: '', residence_ur: '', spouse: 'Meesum Naqvi', spouse_ur: 'میثم نقوی', tag: 'confirmed', notes: '', notes_ur: '', locked: [] },
  { id: 'haider-raza-rizvi', parent: 'abbas-raza', name: 'Syed Haider Raza Rizvi', name_ur: 'سید حیدر رضا رضوی', birth: 'b. 2011', birth_ur: 'پیدائش ۲۰۱۱ء', death: '', death_ur: '', birthplace: '', birthplace_ur: '', residence: '', residence_ur: '', spouse: '', spouse_ur: '', tag: 'confirmed', notes: '', notes_ur: '', locked: [] },
  {
    id: 'shabbar-raza',
    parent: 'ghulam-raza-rizvi',
    name: 'Shabbar Raza',
    name_ur: 'شبر رضا',
    birth: 'b. 1976', birth_ur: 'پیدائش ۱۹۷۶ء',
    death: '', death_ur: '',
    birthplace: '', birthplace_ur: '',
    residence: '', residence_ur: '',
    spouse: 'Tabassum Fatima', spouse_ur: 'تبسم فاطمہ',
    tag: 'confirmed',
    notes: '', notes_ur: '',
    locked: []
  },
  {
    id: 'rabab-fatima',
    parent: 'ghulam-raza-rizvi',
    name: 'Syeda Rabab Fatima Rizvi',
    name_ur: 'سیدہ رباب فاطمہ رضوی',
    birth: 'b. 1982', birth_ur: 'پیدائش ۱۹۸۲ء',
    death: '', death_ur: '',
    birthplace: '', birthplace_ur: '',
    residence: '', residence_ur: '',
    spouse: 'Shujat Hasan', spouse_ur: 'شجاعت حسن',
    tag: 'confirmed',
    notes: '', notes_ur: '',
    locked: []
  },
  { id: 'fasahat-hussain', parent: 'rabab-fatima', name: 'Fasahat Hussain', name_ur: 'فصاحت حسین', birth: 'b. 2009', birth_ur: 'پیدائش ۲۰۰۹ء', death: '', death_ur: '', birthplace: '', birthplace_ur: '', residence: '', residence_ur: '', spouse: '', spouse_ur: '', tag: 'confirmed', notes: '', notes_ur: '', locked: [] },
  {
    id: 'hussain-raza',
    parent: 'ghulam-raza-rizvi',
    name: 'Hussain Raza',
    name_ur: 'حسین رضا',
    birth: 'b. 1983', birth_ur: 'پیدائش ۱۹۸۳ء',
    death: '', death_ur: '',
    birthplace: '', birthplace_ur: '',
    residence: '', residence_ur: '',
    spouse: 'Tania Hussain', spouse_ur: 'تانیہ حسین',
    tag: 'confirmed',
    notes: 'Youngest of Syed Ghulam Raza Rizvi\'s children. Compiler of this family record.',
    notes_ur: 'سید غلام رضا رضوی کی سب سے چھوٹی اولاد۔ اس خاندانی ریکارڈ کے مرتب۔',
    locked: []
  },
  { id: 'muslim-raza-rizvi', parent: 'hussain-raza', name: 'Muhammad Muslim Raza Rizvi', name_ur: 'محمد مسلم رضا رضوی', birth: 'b. 2014', birth_ur: 'پیدائش ۲۰۱۴ء', death: '', death_ur: '', birthplace: '', birthplace_ur: '', residence: '', residence_ur: '', spouse: '', spouse_ur: '', tag: 'confirmed', notes: '', notes_ur: '', locked: [] },
  { id: 'ali-yousuf-raza-rizvi', parent: 'hussain-raza', name: 'Ali Yousuf Raza Rizvi', name_ur: 'علی یوسف رضا رضوی', birth: 'b. 2018', birth_ur: 'پیدائش ۲۰۱۸ء', death: '', death_ur: '', birthplace: '', birthplace_ur: '', residence: '', residence_ur: '', spouse: '', spouse_ur: '', tag: 'confirmed', notes: '', notes_ur: '', locked: [] },
  { id: 'younus-hasan-raza-rizvi', parent: 'hussain-raza', name: 'Younus Hasan Raza Rizvi', name_ur: 'یونس حسن رضا رضوی', birth: 'b. 2019', birth_ur: 'پیدائش ۲۰۱۹ء', death: '', death_ur: '', birthplace: '', birthplace_ur: '', residence: '', residence_ur: '', spouse: '', spouse_ur: '', tag: 'confirmed', notes: '', notes_ur: '', locked: [] },
  { id: 'isa-hussain-raza-rizvi', parent: 'hussain-raza', name: 'Isa Hussain Raza Rizvi', name_ur: 'عیسیٰ حسین رضا رضوی', birth: 'b. 2022', birth_ur: 'پیدائش ۲۰۲۲ء', death: '', death_ur: '', birthplace: '', birthplace_ur: '', residence: '', residence_ur: '', spouse: '', spouse_ur: '', tag: 'confirmed', notes: '', notes_ur: '', locked: [] }
];

/* Narrative sections carried over from the document. Rendered in the
 * "History & sources" area alongside the tree. */
const HISTORY_SECTIONS = [
  {
    id: 'provenance',
    icon: 'M12 2 3 7v6c0 5 3.8 8.4 9 9 5.2-.6 9-4 9-9V7z',
    title: { en: 'About this record', ur: 'اس ریکارڈ کے بارے میں' },
    body: {
      en: ['Compiled entirely from information provided by Hussain Raza in conversation. None of this has been cross-checked against birth, marriage, or civil records, so treat exact dates and spellings as provisional until verified against a primary source.'],
      ur: ['یہ ریکارڈ مکمل طور پر حسین رضا کی گفتگو میں فراہم کردہ معلومات پر مبنی ہے۔ اس کی پیدائش، نکاح یا کسی سرکاری دستاویز سے تصدیق نہیں کی گئی، لہٰذا تاریخوں اور املا کو ابتدائی سمجھا جائے جب تک کسی بنیادی ماخذ سے ان کی تصدیق نہ ہو جائے۔']
    }
  },
  {
    id: 'tradition',
    icon: 'M12 3v18M5 8h14M7 21h10',
    title: { en: 'Family tradition (unverified)', ur: 'خاندانی روایت (غیر مصدقہ)' },
    body: {
      en: [
        'The family holds an oral tradition of descent from Imam Ali al-Rida (the 8th Imam), through an ancestor named Musa al-Mubarqa. There is currently no documented link between this claimed ancestor and Mir Ali Hussain Rizvi, the earliest ancestor with a confirmed name. The generations bridging that gap are unknown. This is a common tradition among Sadaat families and is noted here as family lore, not as an established genealogical fact.',
        'A second, related oral tradition: the family recalls a village called Samana with four sub-villages, where three brothers who had migrated from Iran settled in different parts of India. One of them, Mir Amanullah, is remembered as possibly the first Sayyid of the line to migrate from Iran to Samana. The family confirms this Samana is in the Patiala area of Punjab. A real town by this name does exist on the Samana–Patiala road and is independently documented as linked to a son of the 8th Imam, which is a notable coincidence with the family\'s own tradition. No public record of "Mir Amanullah" specifically has been found; this remains unverified family history, not a genealogical record.'
      ],
      ur: [
        'خاندان میں امام علی رضا علیہ السلام (آٹھویں امام) سے، موسیٰ المبرقع نامی ایک جد کے واسطے سے، نسبی تعلق کی زبانی روایت موجود ہے۔ اس مبینہ جد اور میر علی حسین رضوی — یعنی سب سے قدیم مصدقہ نام والے بزرگ — کے درمیان فی الحال کوئی دستاویزی ربط موجود نہیں۔ اس خلا کو پُر کرنے والی پشتیں نامعلوم ہیں۔ یہ سادات خاندانوں میں ایک عام روایت ہے اور اسے یہاں خاندانی روایت کے طور پر درج کیا گیا ہے، کسی ثابت شدہ نسبی حقیقت کے طور پر نہیں۔',
        'ایک دوسری، اسی سے متعلق زبانی روایت: خاندان کو سمانہ نامی ایک بستی یاد ہے جس کے چار ذیلی گاؤں تھے، جہاں ایران سے ہجرت کرنے والے تین بھائی ہندوستان کے مختلف حصوں میں آباد ہوئے۔ ان میں سے ایک، میر امان اللہ، کے بارے میں یاد ہے کہ شاید وہی اس سلسلے کے پہلے سید تھے جو ایران سے سمانہ آئے۔ خاندان کی تصدیق کے مطابق یہ سمانہ پنجاب کے علاقے پٹیالہ میں ہے۔ اس نام کا ایک حقیقی قصبہ سمانہ–پٹیالہ روڈ پر موجود ہے اور آزاد ذرائع میں آٹھویں امام کے ایک فرزند سے منسوب دستاویزی طور پر درج ہے — جو خاندان کی اپنی روایت کے ساتھ ایک قابلِ ذکر مطابقت ہے۔ خاص طور پر "میر امان اللہ" کا کوئی عوامی ریکارڈ نہیں مل سکا؛ یہ غیر مصدقہ خاندانی تاریخ ہے، کوئی نسبی دستاویز نہیں۔'
      ]
    }
  },
  {
    id: 'shajra',
    icon: 'M4 4h16v16H4zM8 8h8M8 12h8M8 16h5',
    title: { en: 'From the family shajra (photographed 2024)', ur: 'خاندانی شجرہ (۲۰۲۴ء میں عکس بند) سے' },
    body: {
      en: [
        'A handwritten shajra titled "Rizvi Sadaat (Lucknow)" was photographed and shared. It is a family-prepared document, not an independent record, and several names were read from difficult handwriting. Treat everything from it as provisional until a fluent reader in the family confirms it against the original.',
        'The document opens with Imam Ali al-Rida (766–818 AD) and then jumps to a name dated c. 1650 AD, with no generations shown bridging that roughly 800-year gap. Readable entries: Mir Syed Ali Hussain Rizvi (c. 1650 AD) → Mir Syed Ghulam Raza Rizvi → Syed Afzal Hussain Rizvi (of Lucknow, wife Syeda Fatima Begum) → Syed Hussain Ali Rizvi (dated 1870–1950, with what appear to be three wives listed). A side note states the family lived in Mohalla Nakhas (Nakkhas), Lucknow; that this ancestor was a religious scholar and zakir; and that the family held land in Aaram Ganj, Lucknow.'
      ],
      ur: [
        '"رضوی سادات (لکھنؤ)" کے عنوان سے ایک ہاتھ کا لکھا شجرہ عکس بند کر کے شریک کیا گیا۔ یہ خاندان کا تیار کردہ دستاویز ہے، کوئی آزاد ریکارڈ نہیں، اور کئی نام مشکل تحریر سے پڑھے گئے ہیں۔ جب تک خاندان کا کوئی روانی سے پڑھنے والا فرد اصل دستاویز سے اس کی تصدیق نہ کر لے، اس میں درج ہر بات کو ابتدائی سمجھا جائے۔',
        'دستاویز کا آغاز امام علی رضا علیہ السلام (۷۶۶–۸۱۸ء) سے ہوتا ہے اور پھر تقریباً ۱۶۵۰ء کی تاریخ والے ایک نام پر چھلانگ لگا دیتا ہے، درمیان کی تقریباً آٹھ سو سال کی پشتیں دکھائے بغیر۔ پڑھے جا سکنے والے اندراجات یہ ہیں: میر سید علی حسین رضوی (تقریباً ۱۶۵۰ء) ← میر سید غلام رضا رضوی ← سید افضل حسین رضوی (لکھنؤ کے، اہلیہ سیدہ فاطمہ بیگم) ← سید حسین علی رضوی (۱۸۷۰–۱۹۵۰ء درج، اور بظاہر تین بیویوں کے نام درج ہیں)۔ حاشیے میں لکھا ہے کہ خاندان محلہ نکھاس، لکھنؤ میں رہائش پذیر تھا؛ کہ یہ بزرگ عالمِ دین اور ذاکر تھے؛ اور یہ کہ خاندان کی آرام گنج، لکھنؤ میں زمین تھی۔'
      ]
    },
    list: {
      heading: { en: 'Confirmed by the family since this section was first drafted', ur: 'اس حصے کے پہلے مسودے کے بعد خاندان کی تصدیق شدہ باتیں' },
      items: {
        en: [
          'Generation order: the shajra\'s order (Mir Ghulam Raza Rizvi before Syed Afzal Hussain Rizvi) is correct; the family\'s earlier recollection had these two reversed.',
          'The "Ghulam Raza" shown in the shajra as a child of Syed Hussain Ali Rizvi is confirmed to be Hussain Raza\'s father. The shajra\'s death year (2013) is incorrect — he passed away 1 January 2015 in Dubai. His wife\'s full name is Tasneem Fatima, of Naqvi descent (the shajra\'s "Tasneem Naqvi" was a shortened form).',
          'Syed Hussain Ali Rizvi\'s birth year was always an approximate family estimate, not a documented date — it may be 1870, matching the shajra, rather than 1880.',
          'Nowrozi Begum is confirmed as Syed Hussain Ali Rizvi\'s third wife and the mother of Syed Ghulam Raza Rizvi. His first wife, mother of Syed Ali Rizvi, passed away shortly after childbirth; he then married her sister (the second wife), who also passed away shortly after her own childbirth — likely the mother of Yousuf Jahan, given her position in the birth order. Nowrozi Begum was the mother of the remaining children.'
        ],
        ur: [
          'پشتوں کی ترتیب: شجرے کی ترتیب (میر غلام رضا رضوی، سید افضل حسین رضوی سے پہلے) درست ہے؛ خاندان کی پہلی یاد میں یہ دونوں الٹ تھے۔',
          'شجرے میں سید حسین علی رضوی کے فرزند کے طور پر درج "غلام رضا" کی بطور حسین رضا کے والد تصدیق ہو چکی ہے۔ شجرے میں درج سالِ وفات (۲۰۱۳ء) غلط ہے — ان کا انتقال یکم جنوری ۲۰۱۵ء کو دبئی میں ہوا۔ ان کی اہلیہ کا پورا نام تسنیم فاطمہ ہے، نقوی نسب سے (شجرے کا "تسنیم نقوی" مختصر صورت تھی)۔',
          'سید حسین علی رضوی کا سالِ پیدائش ہمیشہ سے خاندان کا تقریبی تخمینہ رہا ہے، کوئی دستاویزی تاریخ نہیں — یہ ۱۸۸۰ء کے بجائے ۱۸۷۰ء بھی ہو سکتا ہے، جو شجرے سے مطابقت رکھتا ہے۔',
          'نوروزی بیگم کی بطور سید حسین علی رضوی کی تیسری اہلیہ اور سید غلام رضا رضوی کی والدہ تصدیق ہو چکی ہے۔ ان کی پہلی اہلیہ، جو سید علی رضوی کی والدہ تھیں، ولادت کے کچھ عرصے بعد انتقال کر گئیں؛ اس کے بعد انہوں نے ان کی ہمشیرہ سے نکاح کیا (دوسری اہلیہ)، جو خود بھی اپنی ولادت کے کچھ عرصے بعد انتقال کر گئیں — ترتیبِ ولادت کے اعتبار سے غالباً وہی یوسف جہاں کی والدہ تھیں۔ باقی تمام اولاد کی والدہ نوروزی بیگم تھیں۔'
        ]
      }
    }
  },
  {
    id: 'murshidabad',
    icon: 'M3 21h18M6 21V9l6-5 6 5v12M10 21v-6h4v6',
    title: { en: 'Lucknow to Murshidabad', ur: 'لکھنؤ سے مرشد آباد تک' },
    body: {
      en: [
        'The family recalls that Syed Hussain Ali Rizvi moved from Lucknow to Murshidabad because his sister married into a Nawab family there whose title ended in "Jah." This detail corroborates well against the historical record: the Nawab Nazims (later Nawab Bahadurs) of Murshidabad were a Shia Muslim dynasty who used "Jah" as a recurring honorific title — for example Nawab Ali Jah (r. 1810–1821), Nawab Walla Jah (r. 1821–1824), and Nawab Feradun Jah (r. 1838–1880, the last Nawab of Bengal). A marriage between a Shia Sayyid family and this Shia Nawabi family is plausible and fits the timeline, though the specific individual involved has not been identified.',
        'After Syed Hussain Ali Rizvi passed away around 1950, the family relocated from Murshidabad to Dhaka around 1951.'
      ],
      ur: [
        'خاندان کو یاد ہے کہ سید حسین علی رضوی لکھنؤ سے مرشد آباد اس لیے منتقل ہوئے کہ ان کی ہمشیرہ کی شادی وہاں کے ایک نوابی خاندان میں ہوئی تھی جس کے لقب کا اختتام "جاہ" پر ہوتا تھا۔ یہ تفصیل تاریخی ریکارڈ سے خوب مطابقت رکھتی ہے: مرشد آباد کے نواب ناظم (بعد میں نواب بہادر) ایک شیعہ مسلم خاندان تھا جو "جاہ" کو بار بار بطور اعزازی لقب استعمال کرتا تھا — مثلاً نواب علی جاہ (دورِ حکومت ۱۸۱۰–۱۸۲۱ء)، نواب والا جاہ (۱۸۲۱–۱۸۲۴ء)، اور نواب فریدون جاہ (۱۸۳۸–۱۸۸۰ء، بنگال کے آخری نواب)۔ ایک شیعہ سید خاندان اور اس شیعہ نوابی خاندان کے درمیان رشتہ قرینِ قیاس ہے اور زمانی اعتبار سے بھی مطابقت رکھتا ہے، اگرچہ اس مخصوص فرد کی شناخت نہیں ہو سکی۔',
        'تقریباً ۱۹۵۰ء میں سید حسین علی رضوی کی وفات کے بعد، خاندان تقریباً ۱۹۵۱ء میں مرشد آباد سے ڈھاکہ منتقل ہو گیا۔'
      ]
    }
  },
  {
    id: 'burials',
    icon: 'M12 21s-7-5-7-11a7 7 0 1 1 14 0c0 6-7 11-7 11z',
    title: { en: 'Burial places and property', ur: 'مدافن اور جائیدادیں' },
    body: {
      en: ['Syed Hussain Ali Rizvi himself is buried in Murshidabad. His father, Syed Afzal Hussain Rizvi, and earlier ancestors are buried in Lucknow, consistent with the family\'s residence in Mohalla Nakkhas there. Nakkhas is a real, well-documented historic quarter of old Lucknow, and is home to the Talkatora Karbala — a major Shia burial ground built c. 1800–1817 by Mir Khuda Bakhsh, a revenue official under Nawab Saadat Ali Khan. This is a plausible candidate for where the earlier generations are buried, though it has not been confirmed which specific site or grave.'],
      ur: ['سید حسین علی رضوی خود مرشد آباد میں مدفون ہیں۔ ان کے والد سید افضل حسین رضوی اور ان سے پہلے کے آباؤ اجداد لکھنؤ میں مدفون ہیں، جو وہاں محلہ نکھاس میں خاندان کی رہائش سے مطابقت رکھتا ہے۔ نکھاس پرانے لکھنؤ کا ایک حقیقی اور تاریخی طور پر معروف محلہ ہے، جہاں تل کٹورہ کربلا واقع ہے — ایک بڑا شیعہ قبرستان جو تقریباً ۱۸۰۰–۱۸۱۷ء میں نواب سعادت علی خان کے دور کے ایک محصول افسر میر خدا بخش نے تعمیر کرایا۔ یہ پچھلی پشتوں کے مدفن کے لیے ایک ممکنہ مقام ہے، اگرچہ یہ تصدیق نہیں ہوئی کہ کون سی مخصوص جگہ یا قبر ہے۔']
    },
    list: {
      heading: { en: 'Additional details on Syed Hussain Ali Rizvi', ur: 'سید حسین علی رضوی کے بارے میں مزید تفصیلات' },
      items: {
        en: [
          'Buried at a site the family calls "Hussaini Dalan" (Murshidabad). A well-known Hussaini Dalan Imambara exists in Dhaka, Bangladesh, but that is almost certainly not this one, since he was based in Murshidabad, not Dhaka. This is treated as a distinct, locally-named Murshidabad site until confirmed otherwise.',
          'Owned property in Ikraam Ganj, Murshidabad — distinct from the "Aaram Ganj" landholding in Lucknow noted in the shajra; the family appears to have held property in both cities.',
          'Refurbished a mosque in Murshidabad (name not yet recorded).',
          'His wife Nowrozi Begum\'s father was Sheikh Munawwar Ali.'
        ],
        ur: [
          'اس مقام پر مدفون ہیں جسے خاندان "حسینی دالان" (مرشد آباد) کہتا ہے۔ ڈھاکہ، بنگلہ دیش میں ایک معروف حسینی دالان امام بارگاہ موجود ہے، مگر تقریباً یقینی طور پر وہ یہ نہیں ہے، کیونکہ ان کا مسکن مرشد آباد تھا، ڈھاکہ نہیں۔ جب تک اس کے برعکس تصدیق نہ ہو، اسے مرشد آباد کا ایک الگ، مقامی نام والا مقام سمجھا جا رہا ہے۔',
          'مرشد آباد میں اکرام گنج میں جائیداد کے مالک تھے — یہ شجرے میں درج لکھنؤ کی "آرام گنج" والی زمین سے الگ ہے؛ بظاہر خاندان کی دونوں شہروں میں جائیداد تھی۔',
          'مرشد آباد میں ایک مسجد کی تجدید کرائی (نام ابھی درج نہیں)۔',
          'ان کی اہلیہ نوروزی بیگم کے والد شیخ منور علی تھے۔'
        ]
      }
    }
  },
  {
    id: 'estimates',
    icon: 'M12 6v6l4 2M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z',
    title: { en: 'How the estimated birth years were derived', ur: 'تخمینی سنینِ پیدائش کیسے اخذ کیے گئے' },
    body: {
      en: [
        'Several birth years are estimates worked out from family-supplied age gaps and ages at death, not from any document.',
        'Wasi Ali died December 2013 aged approximately 85 (b. c. 1928–1929); the family recalls that Wasi Ali, Wazir Ali, and Jafar Hussain (confirmed b. 1934) were each born at most 2 years apart, giving Wasi Ali c. 1929–1930 and Wazir Ali c. 1932–1933. Syed Ali Rizvi and Yousuf Jahan, step-siblings from the first marriage, are recalled as 5–7 and 3–5 years older than Wasi Ali respectively, giving c. 1922–1925 and c. 1924–1927 — the former lines up well with the shajra\'s independently recorded 1925 for Syed Ali Rizvi.',
        'The family separately recalls Syed Hussain Ali Rizvi married Nowrozi Begum around 1927–1928, when he was 45 and she was 15, with Wasi Ali born the following year. Working directly from that: 1927 − 45 = 1882, or 1928 − 45 = 1883, giving his birth as 1882–1883, and Nowrozi Begum\'s as 1912–1913. This sits close to the family\'s original recollection of c. 1880 and further from the shajra\'s 1870, which is worth keeping in mind when weighing the two sources.',
        'Afzal Hussain and Hakeema Begum\'s birth years are derived directly from their recalled age gap to Syed Ghulam Raza Rizvi (b. c. 1949–1950): 3 years older (c. 1946–1947) and 5 years older (c. 1944–1945) respectively. Using a 30-year average generation gap across the three steps from Mir Ali Hussain Rizvi to Syed Hussain Ali Rizvi gives Mir Ali Hussain Rizvi an estimated birth of c. 1792–1793. All of these remain estimates built on approximate recollections, not confirmed dates.'
      ],
      ur: [
        'کئی سنینِ پیدائش وہ تخمینے ہیں جو خاندان کے بتائے ہوئے عمروں کے فرق اور بوقتِ وفات عمر سے نکالے گئے ہیں، کسی دستاویز سے نہیں۔',
        'وصی علی کا انتقال دسمبر ۲۰۱۳ء میں تقریباً ۸۵ برس کی عمر میں ہوا (پیدائش تقریباً ۱۹۲۸–۱۹۲۹ء)؛ خاندان کو یاد ہے کہ وصی علی، وزیر علی اور جعفر حسین (مصدقہ پیدائش ۱۹۳۴ء) میں سے ہر ایک کے درمیان زیادہ سے زیادہ دو برس کا فرق تھا، جس سے وصی علی کی پیدائش تقریباً ۱۹۲۹–۱۹۳۰ء اور وزیر علی کی تقریباً ۱۹۳۲–۱۹۳۳ء بنتی ہے۔ پہلی شادی سے سوتیلے بہن بھائی سید علی رضوی اور یوسف جہاں کے بارے میں یاد ہے کہ وہ وصی علی سے بالترتیب پانچ تا سات اور تین تا پانچ برس بڑے تھے، جس سے تقریباً ۱۹۲۲–۱۹۲۵ء اور تقریباً ۱۹۲۴–۱۹۲۷ء بنتا ہے — پہلا عدد شجرے میں سید علی رضوی کے لیے الگ سے درج ۱۹۲۵ء سے خوب مطابقت رکھتا ہے۔',
        'خاندان کو الگ سے یاد ہے کہ سید حسین علی رضوی نے نوروزی بیگم سے تقریباً ۱۹۲۷–۱۹۲۸ء میں نکاح کیا، جب ان کی عمر ۴۵ اور نوروزی بیگم کی ۱۵ برس تھی، اور وصی علی اگلے برس پیدا ہوئے۔ اسی سے براہِ راست حساب لگائیں تو: ۱۹۲۷ − ۴۵ = ۱۸۸۲، یا ۱۹۲۸ − ۴۵ = ۱۸۸۳، یعنی ان کی پیدائش ۱۸۸۲–۱۸۸۳ء اور نوروزی بیگم کی ۱۹۱۲–۱۹۱۳ء بنتی ہے۔ یہ خاندان کی اصل یاد (تقریباً ۱۸۸۰ء) کے قریب اور شجرے کے ۱۸۷۰ء سے دور بیٹھتا ہے، جو دونوں مآخذ کا وزن کرتے وقت ذہن میں رکھنے کے قابل ہے۔',
        'افضل حسین اور حکیمہ بیگم کے سنینِ پیدائش براہِ راست سید غلام رضا رضوی (پیدائش تقریباً ۱۹۴۹–۱۹۵۰ء) سے ان کے یاد کردہ عمر کے فرق سے اخذ کیے گئے ہیں: بالترتیب تین برس بڑے (تقریباً ۱۹۴۶–۱۹۴۷ء) اور پانچ برس بڑی (تقریباً ۱۹۴۴–۱۹۴۵ء)۔ میر علی حسین رضوی سے سید حسین علی رضوی تک تین پشتوں پر فی پشت تیس سال کے اوسط کے حساب سے میر علی حسین رضوی کی تخمینی پیدائش تقریباً ۱۷۹۲–۱۷۹۳ء نکلتی ہے۔ یہ سب تقریبی یادداشتوں پر بنے تخمینے ہیں، مصدقہ تاریخیں نہیں۔'
      ]
    }
  }
];

const OPEN_QUESTIONS = {
  en: [
    'Name of Mir Ali Hussain Rizvi\'s father, or any ancestor further back',
    'Approximate birth years for Mir Ali Hussain Rizvi and Mir Ghulam Raza Rizvi',
    'Reason and exact date for the family\'s move from Lucknow to Murshidabad',
    'Whether the Lucknow ancestors are specifically buried at Talkatora Karbala, or another site in the Nakkhas quarter',
    'Exact marriage dates for the current generation, once the family is comfortable sharing them',
    '"Page 3" of the family shajra, referenced repeatedly in the photographed page, which likely covers descendants including Hussain Raza\'s own generation',
    'Any earlier pages of the shajra bridging Imam Ali al-Rida (766–818 AD) and Mir Syed Ali Hussain Rizvi (c. 1650 AD)',
    'Whether Mir Amanullah of Samana connects to Sayyid Mash\'had Ali (son of the 8th Imam, buried in Samana) or to a different ancestor',
    'Which of Syed Hussain Ali Rizvi\'s three listed wives in the shajra corresponds to Nowrozi Begum',
    'Whether "Hussaini Dalan" is a distinct Murshidabad site or has any connection to the Dhaka Hussaini Dalan Imambara',
    'Name of the mosque Syed Hussain Ali Rizvi refurbished in Murshidabad',
    'Any further ancestors of Sheikh Munawwar Ali (Nowrozi Begum\'s father)',
    'Which specific Nawab (title ending "Jah") Syed Hussain Ali Rizvi\'s sister married into',
    'Names of Syed Hussain Ali Rizvi\'s first and second wives (mothers of Syed Ali Rizvi and, likely, Yousuf Jahan)',
    'Names and birth years of Afzal Hussain\'s 9 children (5 sons, 4 daughters)'
  ],
  ur: [
    'میر علی حسین رضوی کے والد کا نام، یا اس سے پہلے کے کسی جد کا نام',
    'میر علی حسین رضوی اور میر غلام رضا رضوی کے تقریبی سنینِ پیدائش',
    'لکھنؤ سے مرشد آباد منتقلی کی وجہ اور صحیح تاریخ',
    'کیا لکھنؤ کے آباؤ اجداد خاص طور پر تل کٹورہ کربلا میں مدفون ہیں، یا محلہ نکھاس کے کسی اور مقام پر',
    'موجودہ نسل کی شادیوں کی صحیح تاریخیں، جب خاندان انہیں بتانے پر آمادہ ہو',
    'خاندانی شجرے کا "صفحہ ۳"، جس کا عکس بند صفحے میں بار بار حوالہ دیا گیا ہے اور جس میں غالباً حسین رضا کی اپنی نسل سمیت اولاد درج ہے',
    'شجرے کے وہ پہلے صفحات جو امام علی رضا علیہ السلام (۷۶۶–۸۱۸ء) اور میر سید علی حسین رضوی (تقریباً ۱۶۵۰ء) کے درمیان کی کڑی ہوں',
    'کیا سمانہ کے میر امان اللہ کا تعلق سید مشہد علی (آٹھویں امام کے فرزند، سمانہ میں مدفون) سے ہے یا کسی اور جد سے',
    'شجرے میں درج سید حسین علی رضوی کی تین بیویوں میں سے کون سی نوروزی بیگم ہیں',
    'کیا "حسینی دالان" مرشد آباد کا الگ مقام ہے یا اس کا ڈھاکہ کے حسینی دالان امام بارگاہ سے کوئی تعلق ہے',
    'اس مسجد کا نام جس کی سید حسین علی رضوی نے مرشد آباد میں تجدید کرائی',
    'شیخ منور علی (نوروزی بیگم کے والد) کے مزید آباؤ اجداد',
    'وہ مخصوص نواب (لقب "جاہ" پر ختم ہونے والا) جن کے خاندان میں سید حسین علی رضوی کی ہمشیرہ بیاہی گئیں',
    'سید حسین علی رضوی کی پہلی اور دوسری اہلیہ کے نام (سید علی رضوی کی اور غالباً یوسف جہاں کی والدہ)',
    'افضل حسین کی نو اولاد (پانچ بیٹے، چار بیٹیاں) کے نام اور سنینِ پیدائش'
  ]
};

if (typeof window !== 'undefined') {
  window.SEED_VERSION = SEED_VERSION;
  window.SEED_PEOPLE = SEED_PEOPLE;
  window.EDITABLE_FIELDS = EDITABLE_FIELDS;
  window.FIELD_ORDER = FIELD_ORDER;
  window.HISTORY_SECTIONS = HISTORY_SECTIONS;
  window.OPEN_QUESTIONS = OPEN_QUESTIONS;
}
if (typeof module !== 'undefined') {
  module.exports = { SEED_VERSION, SEED_PEOPLE, EDITABLE_FIELDS, FIELD_ORDER, HISTORY_SECTIONS, OPEN_QUESTIONS };
}
