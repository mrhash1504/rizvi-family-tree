/* ─────────────────────────────────────────────────────────────────────────
 * Everything family-specific lives here.
 *
 * 1. Connect to Supabase — paste the two values from
 *    Supabase → Project Settings → Data API. Leave them empty and the site
 *    still works in local mode, where everything is stored in the visitor's
 *    own browser and nothing is shared.
 *
 *    The anon key is designed to be public and is safe in this file. What
 *    protects your data is the row-level security in supabase/schema.sql:
 *    visitors can read the tree and file suggestions, and nothing else.
 *
 * 2. Name the tree — see BRANDING below. Nothing else in the code is
 *    specific to one family, so another family can copy this folder, swap
 *    assets/data.js for their own people, change these lines, and run their
 *    own tree. See "Starting your own tree" in the README.
 * ───────────────────────────────────────────────────────────────────────── */

window.RFT_CONFIG = {
  SUPABASE_URL: 'https://rwseryuxuvrcoddntnho.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_ZRb6ga-P_M0TRJE8pegoFw_deK5yUHU',

  /* The site refers to whoever reviews suggestions as "the admin" rather than
   * by name, so that handing the job to someone else needs no code change.
   * This address is not shown anywhere yet — it is here for when you want a
   * "get in touch" link. */
  OWNER_CONTACT: 'hussainrazarizvi@gmail.com',

  BRANDING: {
    /* The letter in the coloured square, top left. */
    mark: 'R',
    /* Site name and tagline, per language. */
    title:    { en: 'Rizvi Family Tree',                       ur: 'رضوی شجرۂ نسب' },
    tagline:  { en: 'A living record — help us fill the gaps',  ur: 'ایک زندہ ریکارڈ — خالی جگہیں پُر کرنے میں ہماری مدد کیجیے' },
    /* Second language offered alongside English. Only 'ur' ships today;
     * adding another means adding a block to assets/i18n.js. */
    secondLanguage: 'ur'
  }
};
