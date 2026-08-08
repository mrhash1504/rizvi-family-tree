/* Roman Urdu → Urdu script, entirely offline.
 *
 * Most relatives can already type Roman Urdu on any keyboard — "mera naam
 * phool hai" — but have never enabled an Urdu keyboard on their phone. This
 * closes that gap without asking them to change a system setting.
 *
 * Two layers, in order:
 *
 *   1. WORDS — an exact lookup for the vocabulary that actually turns up in
 *      family biographies. Urdu drops most short vowels, so no letter-by-
 *      letter rule can get "karachi" → کراچی and "rehta" → رہتا both right.
 *      Looking common words up sidesteps the guessing entirely.
 *   2. RULES — a fallback for everything else. Longest-match digraphs first,
 *      then single letters, with vowels handled differently at the start,
 *      middle and end of a word.
 *
 * Layer 2 is approximate by nature and will mangle unusual words. That is
 * expected: the admin reviews every submission before it reaches the tree,
 * and Urdu text can always be corrected by hand afterwards.
 */

(function () {
  'use strict';

  /* ── Layer 1: exact matches ─────────────────────────────────────────── */

  const WORDS = {
    // pronouns, copulas, particles — the connective tissue of any sentence
    main: 'میں', mein: 'میں', mai: 'میں', hum: 'ہم', tum: 'تم', aap: 'آپ',
    wo: 'وہ', woh: 'وہ', ye: 'یہ', yeh: 'یہ', is: 'اس', us: 'اس',
    mera: 'میرا', meri: 'میری', mere: 'میرے',
    hamara: 'ہمارا', hamari: 'ہماری', hamare: 'ہمارے',
    unka: 'ان کا', unki: 'ان کی', unke: 'ان کے',
    uska: 'اس کا', uski: 'اس کی', uske: 'اس کے',
    hai: 'ہے', hain: 'ہیں', hoon: 'ہوں', hun: 'ہوں', ho: 'ہو',
    tha: 'تھا', thi: 'تھی', the: 'تھے', thay: 'تھے',
    ka: 'کا', ki: 'کی', ke: 'کے', ko: 'کو', se: 'سے', par: 'پر', pe: 'پے',
    aur: 'اور', ya: 'یا', lekin: 'لیکن', magar: 'مگر', kyunke: 'کیونکہ',
    ke_liye: 'کے لیے', liye: 'لیے', sath: 'ساتھ', bad: 'بعد', pehle: 'پہلے',
    tak: 'تک', bhi: 'بھی', nahi: 'نہیں', nahin: 'نہیں', na: 'نہ',
    sab: 'سب', sabse: 'سب سے', kuch: 'کچھ', koi: 'کوئی', bohot: 'بہت', bahut: 'بہت',
    zyada: 'زیادہ', kam: 'کم', acha: 'اچھا', achi: 'اچھی', theek: 'ٹھیک',

    /* Counting words. A family biography is full of them — "do bete, teen
     * betiyan" — and the rules give اک for "ek" rather than ایک. */
    ek: 'ایک', aik: 'ایک', do: 'دو', teen: 'تین', tin: 'تین', char: 'چار',
    panch: 'پانچ', paanch: 'پانچ', chay: 'چھ', che: 'چھ', saat: 'سات',
    aath: 'آٹھ', ath: 'آٹھ', nau: 'نو', das: 'دس', gyarah: 'گیارہ',
    barah: 'بارہ', bees: 'بیس', pachas: 'پچاس', sau: 'سو', hazar: 'ہزار',
    pehla: 'پہلا', pehli: 'پہلی', dusra: 'دوسرا', dusri: 'دوسری',
    teesra: 'تیسرا', teesri: 'تیسری', akhri: 'آخری', chota: 'چھوٹا',
    choti: 'چھوٹی', bara: 'بڑا', bari: 'بڑی', bete: 'بیٹے', betiyan: 'بیٹیاں',

    // verbs common in a life story
    rehta: 'رہتا', rehti: 'رہتی', rehte: 'رہتے', raha: 'رہا', rahi: 'رہی',
    karta: 'کرتا', karti: 'کرتی', karte: 'کرتے', kiya: 'کیا', kia: 'کیا',
    gaya: 'گیا', gayi: 'گئی', gaye: 'گئے', hua: 'ہوا', hui: 'ہوئی', hue: 'ہوئے',
    aaya: 'آیا', aayi: 'آئی', aye: 'آئے', paida: 'پیدا', intiqal: 'انتقال',
    padha: 'پڑھا', padhai: 'پڑھائی', kaam: 'کام', naukri: 'نوکری',

    // family
    walid: 'والد', walida: 'والدہ', abba: 'ابا', ammi: 'امی',
    beta: 'بیٹا', beti: 'بیٹی', bete: 'بیٹے', bachay: 'بچے', bachchay: 'بچے',
    aulad: 'اولاد', aulaad: 'اولاد', warasat: 'وراثت', nasl: 'نسل',
    bhai: 'بھائی', behen: 'بہن', bahen: 'بہن', behnain: 'بہنیں',
    dada: 'دادا', dadi: 'دادی', nana: 'نانا', nani: 'نانی',
    chacha: 'چچا', chachi: 'چچی', mamu: 'ماموں', khala: 'خالہ', phupi: 'پھوپھی',
    shohar: 'شوہر', biwi: 'بیوی', ahlia: 'اہلیہ', shadi: 'شادی', nikah: 'نکاح',
    khandan: 'خاندان', ghar: 'گھر', pota: 'پوتا', poti: 'پوتی',
    nawasa: 'نواسہ', nawasi: 'نواسی', damad: 'داماد', bahu: 'بہو',

    // life events and record-keeping
    paidaish: 'پیدائش', wafat: 'وفات', tareekh: 'تاریخ', saal: 'سال',
    umar: 'عمر', janam: 'جنم', marhoom: 'مرحوم', marhooma: 'مرحومہ',
    dafan: 'دفن', qabar: 'قبر', madfoon: 'مدفون',

    // places
    karachi: 'کراچی', lahore: 'لاہور', islamabad: 'اسلام آباد',
    rawalpindi: 'راولپنڈی', pindi: 'پنڈی', multan: 'ملتان', quetta: 'کوئٹہ',
    peshawar: 'پشاور', hyderabad: 'حیدرآباد', faisalabad: 'فیصل آباد',
    lucknow: 'لکھنؤ', dehli: 'دہلی', delhi: 'دہلی', india: 'انڈیا',
    pakistan: 'پاکستان', hindustan: 'ہندوستان', dhaka: 'ڈھاکہ',
    murshidabad: 'مرشد آباد', dubai: 'دبئی', london: 'لندن', amreeka: 'امریکہ',
    shehar: 'شہر', gaon: 'گاؤں', mohalla: 'محلہ', ilaqa: 'علاقہ',

    // work and study
    doctor: 'ڈاکٹر', engineer: 'انجینئر', ustad: 'استاد', teacher: 'ٹیچر',
    vakil: 'وکیل', wakeel: 'وکیل', tajir: 'تاجر', kisan: 'کسان',
    school: 'اسکول', college: 'کالج', university: 'یونیورسٹی',
    taleem: 'تعلیم', mulazmat: 'ملازمت', karobar: 'کاروبار',

    // religious / honorific vocabulary common in this record
    syed: 'سید', sayyid: 'سید', shia: 'شیعہ', sunni: 'سنی',
    zakir: 'ذاکر', alim: 'عالم', maulana: 'مولانا', imam: 'امام',
    masjid: 'مسجد', imambargah: 'امام بارگاہ', karbala: 'کربلا',
    shajra: 'شجرہ', nasab: 'نسب', sadaat: 'سادات', begum: 'بیگم',
    marhala: 'مرحلہ', allah: 'اللہ', inshallah: 'انشاءاللہ',
    shukriya: 'شکریہ', salam: 'سلام',

    /* Names matter more here than anywhere else — this is a family tree, and
     * the rules would give الی for "Ali" rather than علی, because the Arabic
     * ain has no Roman letter. */
    ali: 'علی', hasan: 'حسن', hassan: 'حسن', husain: 'حسین', hussain: 'حسین',
    hussein: 'حسین', abbas: 'عباس', raza: 'رضا', reza: 'رضا', rizvi: 'رضوی',
    naqvi: 'نقوی', zaidi: 'زیدی', kazmi: 'کاظمی', jafri: 'جعفری',
    muhammad: 'محمد', mohammad: 'محمد', mohammed: 'محمد', ahmad: 'احمد',
    ahmed: 'احمد', mehdi: 'مہدی', mahdi: 'مہدی', abid: 'عابد', asghar: 'اصغر',
    akbar: 'اکبر', jafar: 'جعفر', jaffar: 'جعفر', musa: 'موسیٰ', kazim: 'کاظم',
    baqir: 'باقر', sadiq: 'صادق', taqi: 'تقی', naqi: 'نقی', askari: 'عسکری',
    haider: 'حیدر', hyder: 'حیدر', abul: 'ابو ال', abu: 'ابو',
    yousuf: 'یوسف', yusuf: 'یوسف', younus: 'یونس', yunus: 'یونس',
    isa: 'عیسیٰ', ibrahim: 'ابراہیم', ismail: 'اسماعیل', idris: 'ادریس',
    salman: 'سلمان', usman: 'عثمان', umar: 'عمر', bilal: 'بلال',
    imran: 'عمران', irfan: 'عرفان', adnan: 'عدنان', kamran: 'کامران',
    shabbar: 'شبر', muslim: 'مسلم', mustafa: 'مصطفیٰ', murtaza: 'مرتضیٰ',

    fatima: 'فاطمہ', fatema: 'فاطمہ', zehra: 'زہرا', zahra: 'زہرا',
    zainab: 'زینب', ruqaiya: 'رقیہ', sakina: 'سکینہ', kulsoom: 'کلثوم',
    khadija: 'خدیجہ', ayesha: 'عائشہ', aisha: 'عائشہ', maryam: 'مریم',
    amina: 'آمنہ', aamina: 'آمنہ', hajra: 'ہاجرہ', sughra: 'صغریٰ',
    kubra: 'کبریٰ', batool: 'بتول', masooma: 'معصومہ', rabab: 'رباب',
    sakeena: 'سکینہ', tahira: 'طاہرہ', zakia: 'زکیہ', razia: 'رضیہ',
    nasreen: 'نسرین', shazia: 'شازیہ', tabassum: 'تبسم', tasneem: 'تسنیم',
    aatika: 'عاتکہ', siper: 'سپر', hakeema: 'حکیمہ', nowrozi: 'نوروزی',
    hilal: 'ہلال', sarwari: 'سروری', phool: 'پھول', gul: 'گل',
    amal: 'امل', manahil: 'مناہل', shaza: 'شازہ', tania: 'تانیہ',
    afzal: 'افضل', ghulam: 'غلام', wasi: 'وصی', wazir: 'وزیر',
    fasahat: 'فصاحت', shujat: 'شجاعت', meesum: 'میثم', maisam: 'میثم',
    munawwar: 'منور', amanullah: 'امان اللہ', abdullah: 'عبداللہ',
    faiz: 'فیض', najmul: 'نجم ال', shah: 'شاہ', mir: 'میر', syeda: 'سیدہ'
  };

  /* ── Layer 2: rules ─────────────────────────────────────────────────── */

  /* Longest first — 'chh' must beat 'ch', which must beat 'c'. */
  const CLUSTERS = [
    ['chh', 'چھ'], ['shh', 'شھ'], ['kkh', 'کھ'], ['ain', 'ائن'],
    ['sh', 'ش'], ['ch', 'چ'], ['kh', 'خ'], ['gh', 'غ'], ['zh', 'ژ'],
    ['ph', 'پھ'], ['bh', 'بھ'], ['th', 'تھ'], ['dh', 'دھ'], ['jh', 'جھ'],
    ['rh', 'رھ'], ['lh', 'لھ'], ['mh', 'مھ'], ['nh', 'نھ'], ['ck', 'ک'],
    ['aa', 'ا'], ['ee', 'ی'], ['ii', 'ی'], ['oo', 'و'], ['uu', 'و'],
    ['ai', 'ے'], ['ay', 'ے'], ['au', 'و'], ['ou', 'و'], ['ow', 'و']
  ];

  const CONSONANTS = {
    b: 'ب', p: 'پ', t: 'ت', s: 'س', j: 'ج', c: 'چ', h: 'ہ', d: 'د',
    r: 'ر', z: 'ز', f: 'ف', q: 'ق', k: 'ک', g: 'گ', l: 'ل', m: 'م',
    n: 'ن', v: 'و', w: 'و', y: 'ی', x: 'کس',
    // Capitals are the usual Roman-Urdu convention for retroflex letters.
    T: 'ٹ', D: 'ڈ', R: 'ڑ'
  };

  const VOWEL_INITIAL = { a: 'ا', e: 'ا', i: 'ا', o: 'او', u: 'ا' };
  const VOWEL_FINAL   = { a: 'ا', e: 'ے', i: 'ی', o: 'و', u: 'و' };
  /* Medial short vowels are written in Urdu only as optional diacritics, so
   * dropping them is what produces natural-looking script: kitab → کتاب. */
  const VOWEL_MEDIAL  = { a: '', e: 'ی', i: '', o: 'و', u: '' };

  function byRule(word) {
    let out = '';
    let i = 0;
    const n = word.length;

    while (i < n) {
      let matched = false;

      for (const [rom, urd] of CLUSTERS) {
        if (word.substr(i, rom.length).toLowerCase() === rom) {
          out += urd;
          i += rom.length;
          matched = true;
          break;
        }
      }
      if (matched) continue;

      const chRaw = word[i];
      const ch = chRaw.toLowerCase();

      if (CONSONANTS[chRaw]) { out += CONSONANTS[chRaw]; i++; continue; }
      if (CONSONANTS[ch])    { out += CONSONANTS[ch];    i++; continue; }

      if (VOWEL_INITIAL[ch]) {
        const table = i === 0 ? VOWEL_INITIAL : (i === n - 1 ? VOWEL_FINAL : VOWEL_MEDIAL);
        out += table[ch];
        i++;
        continue;
      }

      out += chRaw; // digits, punctuation, anything unrecognised
      i++;
    }
    return out;
  }

  /* Already-Urdu text, digits and punctuation must pass through untouched, so
   * a half-translated field can be topped up without being mangled. */
  const LATIN = /[A-Za-z]/;

  function word(w) {
    if (!w || !LATIN.test(w)) return w;

    // Keep leading/trailing punctuation outside the lookup.
    const m = w.match(/^([^A-Za-z]*)([A-Za-z][A-Za-z']*)([^A-Za-z]*)$/);
    if (!m) return byRule(w);
    const [, pre, core, post] = m;

    const hit = WORDS[core.toLowerCase()];
    return pre + (hit || byRule(core)) + post;
  }

  /* Urdu uses its own comma, question mark and semicolon, and the rest of
   * this record is written with Urdu-Indic numerals. Matching that keeps a
   * relative's contribution looking like the surrounding text rather than
   * visibly machine-made. Full stops stay as they are: Urdu's ۔ belongs at
   * the end of a sentence, but a bare "." is just as often a decimal point
   * or an abbreviation, and guessing wrong is worse than leaving it. */
  const PUNCT = { ',': '،', '?': '؟', ';': '؛' };
  const DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

  function polish(s) {
    return s.replace(/[,?;]/g, c => PUNCT[c]).replace(/[0-9]/g, d => DIGITS[+d]);
  }

  function text(s) {
    return polish(String(s).split(/(\s+)/).map(t => (/^\s+$/.test(t) ? t : word(t))).join(''));
  }

  window.RomanUrdu = { text: text, word: w => polish(word(w)), _rule: byRule, _raw: word };
})();
