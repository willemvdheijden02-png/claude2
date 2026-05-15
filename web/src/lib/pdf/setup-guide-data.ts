// Content voor de Willoe Setup Guide PDF.
// Aanpassen hier = nieuwe PDF na curl naar /api/pdf/setup-guide.

export type Block =
  | { type: "h1"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "code"; text: string; lang?: string }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "callout"; tone: "info" | "warning" | "success"; text: string }
  | { type: "video"; title: string; url: string }
  | { type: "link"; label: string; url: string }
  | { type: "divider" };

export type Section = {
  title: string;
  blocks: Block[];
};

export const SETUP_GUIDE_TITLE = "Willoe — Installatie & Setup";
export const SETUP_GUIDE_SUBTITLE =
  "White-label SaaS voor ad-agencies. Je hoeft niks zelf te installeren — Claude Code doet het werk. Jij plakt alleen je API keys.";

export const SETUP_GUIDE_SECTIONS: Section[] = [
  {
    title: "Hoe het werkt — in 2 zinnen",
    blocks: [
      {
        type: "p",
        text: "Je installeert één tool: Claude Code. Daarna plak je een commando in Claude Code, en die installeert Willoe volledig voor je — vraagt onderweg om je API keys, maakt de database, en start het dashboard. Geen terminal-commando's. Geen Node + npm + Git geleer. Geen .env-bestanden handmatig knoeien.",
      },
      {
        type: "callout",
        tone: "success",
        text: "Tijdsindicatie: ~60 min als je alle API-accounts nog moet aanmaken, ~15 min als je ze al hebt. De Claude Code installatie zelf is 3 minuten.",
      },
      { type: "h3", text: "Wat je krijgt zodra het werkt" },
      {
        type: "ul",
        items: [
          "Multi-tenant SaaS dashboard (agencies zien alleen eigen data, gegarandeerd via Row Level Security)",
          "Email + Google OAuth login",
          "Live Meta Ads dashboard met campagne-breakdown",
          "AI Studio (4 tabs: Beelden via Gemini Imagen, Scripts/Ideeën/Rapporten via Claude)",
          "File upload + chat memory",
          "Stripe facturen met iDEAL en kaart betaal-links",
          "Gebrande PDF exports (rapporten + facturen)",
          "White-label per agency (logo + kleuren wisselen automatisch)",
        ],
      },
    ],
  },
  {
    title: "Stap 1 — Installeer Claude Code (3 min)",
    blocks: [
      {
        type: "p",
        text: "Claude Code is een gratis AI-assistent die direct toegang heeft tot je terminal en bestanden. Hij gaat alle install-stappen voor je doen.",
      },
      {
        type: "link",
        label: "Download Claude Code",
        url: "https://claude.com/claude-code",
      },
      {
        type: "video",
        title: "Tutorial: Claude Code installatie (Mac, Windows, Linux — 2026)",
        url: "https://www.youtube.com/watch?v=Ef3r8HNAOxY",
      },
      {
        type: "video",
        title: "Alternatief: voor non-technische beginners (step-by-step)",
        url: "https://www.youtube.com/watch?v=bqJzIWAEn40",
      },
      { type: "h3", text: "Wat je doet" },
      {
        type: "ol",
        items: [
          "Ga naar claude.com/claude-code en download voor jouw OS",
          "Installeer (zoals elke app — Next, Next, Done)",
          "Open Claude Code → log in met je Anthropic / Claude.ai account (zelfde als chat)",
          "Klaar — je ziet een terminal-achtig venster waar je tegen Claude kunt praten",
        ],
      },
    ],
  },
  {
    title: "Stap 2 — Geef Claude Code de install-opdracht (1 min)",
    blocks: [
      {
        type: "p",
        text: "In Claude Code typ je dit commando (kopieer letterlijk):",
      },
      {
        type: "code",
        text:
          "Installeer Willoe voor mij. De code staat op github.com/[REPO-EIGENAAR]/willoe-platform en de install-instructies staan in INSTALL.md. Volg die exact en vraag mij om elke API key als je 'm nodig hebt.",
      },
      {
        type: "callout",
        tone: "info",
        text: "Vervang [REPO-EIGENAAR] door de eigenaar van de repo die je gestuurd hebt gekregen.",
      },
      {
        type: "p",
        text: "Claude Code gaat nu: de repo clonen, dependencies installeren, je per service vragen om de juiste API keys, .env.local invullen, de database opzetten, migraties draaien, en uiteindelijk de dev server starten.",
      },
      {
        type: "p",
        text: "Hieronder staat per API key WAAR je 'm krijgt + een video. Sla deze pagina open zodat je 'm bij de hand hebt — Claude Code gaat ze één-voor-één vragen.",
      },
    ],
  },
  {
    title: "Stap 3 — API keys verzamelen",
    blocks: [
      { type: "p", text: "Claude Code vraagt deze keys in deze volgorde. Hou deze pagina open." },
      { type: "h3", text: "Verplicht voor basisfunctionaliteit" },
      {
        type: "table",
        head: ["Service", "Waarvoor", "Tijd", "Kosten"],
        rows: [
          ["Anthropic", "Claude voor Studio chat", "5 min", "$3-15 per Mtokens"],
          ["Google AI Studio", "Gemini Imagen voor beelden", "5 min", "$0.04 per image"],
          ["Supabase", "Database + auth + storage", "5 min", "Gratis tot 500MB"],
          ["Google Cloud OAuth", "Inloggen met Google", "15 min", "Gratis"],
          ["Meta Business", "Live Meta Ads insights", "10 min", "Gratis"],
          ["Stripe", "Facturen + iDEAL", "10 min", "1.4% + €0.25 per live tx"],
        ],
      },
      { type: "h3", text: "Optioneel" },
      {
        type: "table",
        head: ["Service", "Waarvoor", "Tijd", "Notitie"],
        rows: [
          ["Google Ads", "Google Ads dashboard", "5 min + 1w", "Dev token approval"],
          ["Resend", "Auto factuur emails", "5 min", "Gratis tot 100/dag"],
          ["Cloudflare Domain", "Eigen domein", "5 min", "€9-12 per jaar"],
          ["Vercel", "Production hosting", "5 min", "Gratis Hobby tier"],
        ],
      },
    ],
  },
  {
    title: "Service 1 — Anthropic API key",
    blocks: [
      { type: "p", text: "Wat: Claude voor Scripts, Video-ideeën en Rapporten in de Studio." },
      {
        type: "link",
        label: "Anthropic Console",
        url: "https://console.anthropic.com",
      },
      {
        type: "video",
        title: "Tutorial: Anthropic / Claude API Key krijgen (2026 step-by-step)",
        url: "https://www.youtube.com/watch?v=OEBLNiOJDYE",
      },
      { type: "h3", text: "Stappen" },
      {
        type: "ol",
        items: [
          "console.anthropic.com → Sign up (met dezelfde email als Claude Code)",
          "Settings → API Keys → + Create Key",
          "Naam: Willoe → Create",
          "Kopieer direct (begint met sk-ant-api03-...) — kun je later niet meer zien",
          "Plans & Billing → voeg $5-10 credit toe (anders krijg je direct rate limits)",
          "Plak in Claude Code chat wanneer 't erom vraagt",
        ],
      },
    ],
  },
  {
    title: "Service 2 — Google AI Studio (Gemini)",
    blocks: [
      { type: "p", text: "Wat: Gemini Imagen 4 voor AI ad-beelden in de Studio." },
      {
        type: "link",
        label: "Google AI Studio",
        url: "https://aistudio.google.com",
      },
      {
        type: "video",
        title: "Tutorial: Gemini API Key uit Google AI Studio (Quick Setup 2026)",
        url: "https://www.youtube.com/watch?v=EInPr8zqUnY",
      },
      { type: "h3", text: "Stappen" },
      {
        type: "ol",
        items: [
          "aistudio.google.com → login met je Google account",
          "Linksboven Get API key",
          "Create API key → kies een nieuw of bestaand Google Cloud project",
          "Kopieer (begint met AIzaSy...)",
          "Plak in Claude Code chat wanneer 't erom vraagt",
        ],
      },
      {
        type: "callout",
        tone: "warning",
        text: "Imagen 4 vereist soms billing op het Google Cloud project. Krijg je een 403 fout op de beelden-tab? Zet billing aan op je Google Cloud project (Settings → Billing → Link a billing account).",
      },
    ],
  },
  {
    title: "Service 3 — Supabase (database + auth)",
    blocks: [
      { type: "p", text: "Wat: Postgres database, authenticatie, file storage. Je geeft 4 waarden door aan Claude Code." },
      {
        type: "link",
        label: "Supabase Dashboard",
        url: "https://supabase.com/dashboard",
      },
      {
        type: "video",
        title: "Tutorial: Supabase + Next.js setup (Full Setup Guide 2026)",
        url: "https://www.youtube.com/watch?v=TzkoEcCWcBA",
      },
      { type: "h3", text: "Project aanmaken" },
      {
        type: "ol",
        items: [
          "supabase.com/dashboard → login met GitHub",
          "+ New project",
          "Naam: willoe — Database password: STERK wachtwoord (sla op in 1Password!) — Region: eu-west-2 (London) of eu-central-1 (Frankfurt) — Plan: Free",
          "Wacht ~2 min tot het project klaar is",
        ],
      },
      { type: "h3", text: "4 waarden ophalen" },
      {
        type: "ol",
        items: [
          "Project Settings (⚙️) → API Keys",
          "Kopieer Project URL (https://xxx.supabase.co)",
          "Kopieer Publishable key (sb_publishable_... of anon key)",
          "Kopieer Secret key (sb_secret_... of service_role)",
          "Onthoud je DB password — Claude Code vraagt 'm voor de DATABASE_URL",
        ],
      },
      {
        type: "callout",
        tone: "info",
        text: "Claude Code construeert zelf de DATABASE_URL — geef gewoon: project ref + regio + DB password. Hij URL-encodet special chars automatisch.",
      },
    ],
  },
  {
    title: "Service 4 — Google Cloud OAuth (Google login)",
    blocks: [
      { type: "p", text: "Wat: de 'Inloggen met Google' knop op je login pagina." },
      {
        type: "link",
        label: "Google Cloud Console",
        url: "https://console.cloud.google.com",
      },
      {
        type: "video",
        title: "Tutorial: Google OAuth Login in Supabase (2026)",
        url: "https://www.youtube.com/watch?v=CE1E9TuYzB8",
      },
      { type: "h3", text: "OAuth client maken" },
      {
        type: "ol",
        items: [
          "console.cloud.google.com → + Create Project → naam Willoe → Create",
          "APIs & Services → OAuth consent screen → External → Create",
          "App name: Willoe, support email + developer contact: jouw email",
          "Save → skip scopes → skip test users → Back to Dashboard",
          "APIs & Services → Credentials → + Create Credentials → OAuth client ID",
          "Application type: Web application — Name: Willoe Web",
          "Authorized JavaScript origins: http://localhost:3002",
          "Authorized redirect URIs: https://JOUW-SUPABASE-REF.supabase.co/auth/v1/callback (vraag Claude Code voor de exacte URL)",
          "Create → kopieer Client ID + Client Secret",
        ],
      },
      {
        type: "callout",
        tone: "warning",
        text: "Na install moet je nog handmatig in Supabase Dashboard → Authentication → Providers → Google AAN zetten + Client ID en Secret plakken. Claude Code zegt wanneer + hoe.",
      },
    ],
  },
  {
    title: "Service 5 — Meta Business / Marketing API",
    blocks: [
      { type: "p", text: "Wat: Live Meta Ads insights data voor het /portal/ads dashboard." },
      {
        type: "link",
        label: "Meta for Developers",
        url: "https://developers.facebook.com",
      },
      {
        type: "video",
        title: "Tutorial: Meta API + Graph Explorer Access Token (2026)",
        url: "https://www.youtube.com/watch?v=lQZcIEazyho",
      },
      { type: "h3", text: "App aanmaken" },
      {
        type: "ol",
        items: [
          "developers.facebook.com → login met FB-account dat ad accounts beheert",
          "My Apps → Create App → Other → Business → naam Willoe → Create",
          "Kopieer App ID (bovenaan dashboard)",
        ],
      },
      { type: "h3", text: "Long-lived token genereren" },
      {
        type: "ol",
        items: [
          "developers.facebook.com/tools/explorer",
          "Rechtsboven kies app Willoe",
          "Permissions: voeg toe ads_read, ads_management, business_management",
          "Generate Access Token → login → toestaan",
          "Kopieer token (begint met EAA...)",
          "Ga naar developers.facebook.com/tools/debug/accesstoken",
          "Plak token → Debug → onderaan Extend Access Token → typ FB-wachtwoord",
          "Nieuwe long-lived token (60 dagen) → die geef je aan Claude Code",
        ],
      },
      { type: "h3", text: "Ad account ID(s)" },
      {
        type: "ol",
        items: [
          "business.facebook.com → Settings → Ad Accounts",
          "Kopieer ID(s) — format act_1234567890",
        ],
      },
      {
        type: "callout",
        tone: "warning",
        text: "Long-lived tokens verlopen na 60 dagen. Permanent: maak een System User Token in Business Manager (verloopt nooit). Doe dit pas als alles werkt.",
      },
    ],
  },
  {
    title: "Service 6 — Stripe (facturatie)",
    blocks: [
      { type: "p", text: "Wat: Echte facturen + iDEAL/kaart betaal-links." },
      {
        type: "link",
        label: "Stripe Dashboard",
        url: "https://stripe.com",
      },
      {
        type: "video",
        title: "Tutorial: Stripe Test & Live API Keys (2026 step-by-step)",
        url: "https://www.youtube.com/watch?v=nmN7zPnyofQ",
      },
      { type: "h3", text: "Stappen" },
      {
        type: "ol",
        items: [
          "stripe.com → Start now → email + sterk wachtwoord → Create account",
          "Verify email",
          "Activate account: minimal bedrijfsdetails (kan later vervolledigen voor live mode)",
          "TEST mode AAN laten (oranje toggle rechtsboven)",
          "dashboard.stripe.com/test/apikeys",
          "Kopieer Publishable key (pk_test_...)",
          "Kopieer Secret key (klik Reveal, sk_test_...)",
          "Plak beide in Claude Code chat",
        ],
      },
      {
        type: "callout",
        tone: "info",
        text: "Test mode is gratis en blijft test tot je actief naar live mode wisselt. Eerst alles werkend hebben in test, dan pas live.",
      },
    ],
  },
  {
    title: "Optioneel — Google Ads developer token",
    blocks: [
      { type: "p", text: "Wat: naast Meta ook Google Ads data in /portal/ads. Vereist eerst een Manager (MCC) account." },
      {
        type: "link",
        label: "Google Ads Manager Accounts",
        url: "https://ads.google.com/intl/nl_nl/home/tools/manager-accounts",
      },
      {
        type: "video",
        title: "Tutorial: Google Ads MCC Manager Account aanmaken (2026)",
        url: "https://www.youtube.com/watch?v=gRP8PG6RLJA",
      },
      {
        type: "video",
        title: "Tutorial: Google Ads Developer Token uit API Center (2026)",
        url: "https://www.youtube.com/watch?v=yu0E3MAhgIo",
      },
      {
        type: "ol",
        items: [
          "ads.google.com → maak Manager account → Create a manager account",
          "Name: Willoe Agency — Manage other people's accounts — Netherlands — EUR",
          "Customer ID (format 123-456-7890) opslaan",
          "In MCC: Tools → API Center → Apply for token",
          "Vul aanvraagformulier in (use case, contact) → Submit",
          "Developer token verschijnt direct",
        ],
      },
      {
        type: "callout",
        tone: "warning",
        text: "Approval voor productie duurt 1-7 dagen via email. Tot dan werkt token alleen tegen test accounts.",
      },
    ],
  },
  {
    title: "Wat doet Claude Code zelf",
    blocks: [
      { type: "p", text: "Nadat je alle keys hebt gegeven, doet Claude Code het zware werk:" },
      {
        type: "ul",
        items: [
          "Git clone van de repo naar ~/willoe-platform",
          "npm install voor alle 100+ dependencies",
          ".env.local invullen met alle keys (URL-encodet special chars in DB password)",
          "Database migraties runnen (9 tabellen + RLS policies + auth triggers + 12 services seed)",
          "Verificatie dat de DB klopt",
          "Dev server starten op http://localhost:3002",
          "Je doorheen leiden om eerste agency aan te maken en eerste klant toe te voegen",
        ],
      },
      {
        type: "p",
        text: "Als er iets fout gaat, vraagt Claude Code je om de stap opnieuw — geen mysterieuze errors waar je in de terminal moet duiken.",
      },
    ],
  },
  {
    title: "Stap 4 — Het werkt — wat nu?",
    blocks: [
      { type: "p", text: "Wanneer Claude Code zegt 'klaar', open je http://localhost:3002 en test je:" },
      {
        type: "ol",
        items: [
          "/signup → maak account met email of Google",
          "Email signup: verifieer via mail link (check ook spam, kan vanaf Supabase domein komen)",
          "/onboarding wizard verschijnt → maak jouw eerste agency met naam + kleur",
          "/portal → sidebar toont jouw agency-naam + kleur",
          "/portal/clients → voeg eerste klant toe (met Meta Ad Account ID)",
          "/portal/ads → live Meta data verschijnt",
          "/portal/studio → test elke tab (Beelden / Scripts / Ideeën / Rapporten)",
          "/portal/billing → maak test-factuur, betaal met Stripe test kaart 4242 4242 4242 4242",
        ],
      },
      { type: "h3", text: "Pakt iets niet?" },
      {
        type: "p",
        text: "Vraag het Claude Code rechtstreeks. Bijvoorbeeld: 'De Meta data laadt niet, wat is het probleem?' Hij checkt de server logs en lost het op of vraagt je wat hij nodig heeft.",
      },
    ],
  },
  {
    title: "Stap 5 — Productie (later)",
    blocks: [
      {
        type: "p",
        text: "Als alles lokaal werkt, kun je naar productie. Ook dat doet Claude Code voor je — zeg simpelweg:",
      },
      {
        type: "code",
        text: "Deploy Willoe naar Vercel met domein jouwagency.com. Volg DEPLOY_GUIDE.md.",
      },
      { type: "h3", text: "Stappen die Claude Code daar doorheen loopt" },
      {
        type: "ol",
        items: [
          "Domein kopen via Cloudflare (€9-12/jaar) — jij doet de betaling",
          "GitHub repo aanmaken + code pushen",
          "Vercel account + project + env vars plakken",
          "DNS records in Cloudflare → wachten op SSL",
          "Update Site URL in Supabase + Google OAuth redirect URIs naar productie URL",
        ],
      },
    ],
  },
  {
    title: "Veelvoorkomende problemen",
    blocks: [
      { type: "h3", text: "ANTHROPIC_API_KEY not set terwijl het in .env.local staat" },
      {
        type: "p",
        text: "Je shell exporteert een lege variabele die wint van .env.local. Vraag Claude Code om de dev server te herstarten met 'unset' eerst. Of Willoe heeft hier al een fix voor — gewoon doorgaan.",
      },
      { type: "h3", text: "Meta API: Session has expired" },
      {
        type: "p",
        text: "Long-lived token verloopt na 60 dagen. Vraag Claude Code om je te begeleiden door de Graph API Explorer + Token Debugger voor een nieuwe.",
      },
      { type: "h3", text: "Google OAuth: redirect_uri_mismatch" },
      {
        type: "p",
        text: "De Supabase callback URL staat niet in jouw Google Cloud OAuth client. Voeg toe in Credentials → jouw OAuth client → Authorized redirect URIs: https://JOUW-SUPABASE-REF.supabase.co/auth/v1/callback",
      },
      { type: "h3", text: "DATABASE_URL: Tenant or user not found" },
      {
        type: "p",
        text: "Verkeerde regio. Moderne Supabase projecten gebruiken aws-1-REGION (niet aws-0). Vraag Claude Code om je connection string te verifiëren via Supabase Project Settings → Database.",
      },
      { type: "h3", text: "Iets anders" },
      {
        type: "p",
        text: "Beschrijf het probleem aan Claude Code en stuur de error mee. Hij kan terminal logs lezen en zelf debuggen.",
      },
    ],
  },
  {
    title: "Hulp & resources",
    blocks: [
      { type: "h3", text: "Officiële documentatie" },
      { type: "link", label: "Supabase docs", url: "https://docs.supabase.com" },
      { type: "link", label: "Stripe docs", url: "https://docs.stripe.com" },
      { type: "link", label: "Meta Marketing API", url: "https://developers.facebook.com/docs/marketing-apis" },
      { type: "link", label: "Anthropic docs", url: "https://docs.anthropic.com" },
      { type: "link", label: "Google AI Studio docs", url: "https://ai.google.dev/docs" },
      { type: "link", label: "Google Ads API docs", url: "https://developers.google.com/google-ads/api" },
      { type: "divider" },
      { type: "h3", text: "Stuck?" },
      {
        type: "p",
        text: "Het beste eerste-hulp is Claude Code zelf. Beschrijf je probleem, plak de error, en hij helpt je verder. Hij kan logs lezen, je code wijzigen, en API calls testen — allemaal in dezelfde chat.",
      },
      { type: "divider" },
      {
        type: "p",
        text: "Veel succes met je eigen agency platform.",
      },
    ],
  },
];
