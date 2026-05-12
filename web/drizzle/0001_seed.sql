-- Willoe — Seed data
-- Services catalog + demo agency (Northbeam) + 3 demo clients

-- ============================================================
-- SERVICES CATALOG
-- ============================================================

INSERT INTO "services" (slug, display_name, description, icon_name, category, estimated_turnaround_hours, price_cents, skill_command, is_active) VALUES
('meta-ads-audit', 'Meta Ads Audit', '46 checks op pixel, creative diversiteit, account structuur en bidding.', 'GaugeCircle', 'audit', 24, 0, '/ads-meta', true),
('google-ads-audit', 'Google Ads Audit', '74 checks op Search, PMax, YouTube en Demand Gen campagnes.', 'TrendingUp', 'audit', 24, 0, '/ads-google', true),
('linkedin-ads-audit', 'LinkedIn Ads Audit', '25 checks voor B2B advertisers — audience, creative, lead-gen forms.', 'TrendingUp', 'audit', 24, 4900, '/ads-linkedin', true),
('tiktok-ads-audit', 'TikTok Ads Audit', '25 checks voor creative-first strategie en TikTok Shop.', 'TrendingUp', 'audit', 24, 4900, '/ads-tiktok', true),
('static-remix', 'Static Remix', 'Concurrent ads → on-brand recreaties in jouw stijl.', 'PenTool', 'creative', 12, 4900, '/static-remix', true),
('ads-creative', 'Cross-platform Creative Audit', 'Creative fatigue + diversiteit + platform-native compliance.', 'PenTool', 'creative', 24, 0, '/ads-creative', true),
('seo-audit', 'SEO Audit', 'Technical + content + schema + E-E-A-T volledige check.', 'Search', 'seo', 36, 9900, '/seo-audit', true),
('brand-dna', 'Brand DNA', 'Visuele identiteit + tone of voice extract van klant-website.', 'Sparkles', 'strategy', 6, 0, '/ads-dna', true),
('onboarding-pipeline', 'Onboarding Pipeline', 'Volledig pitch + welcome rapport voor nieuwe klant.', 'FileText', 'onboarding', 24, 0, '/onboard', true),
('studio-images', 'Studio · Beelden', 'AI ad-creatives gegenereerd op brand DNA, 4 formaten.', 'Image', 'studio', 1, 2900, '/studio-images', true),
('studio-scripts', 'Studio · Scripts', 'Hook–Pain–Proof–CTA scripts voor video ads.', 'MessageSquare', 'studio', 1, 1900, '/studio-scripts', true),
('studio-ideas', 'Studio · Video-ideeën', 'Pitch-grade concepten met scènes en doelgroep-rationale.', 'Video', 'studio', 1, 1900, '/studio-ideas', true)
ON CONFLICT (slug) DO NOTHING;

-- Notitie: agencies + clients + invoices worden later gemaakt via de UI
-- of via een aparte demo-seed script. Geen seed hier omdat agencies aan
-- echte auth.users vastzitten.
