-- Seed data for testing the application

-- Insert sample marketing goals
INSERT INTO public.marketing_goals (id, title, description, industry, duration, is_active, start_date, current_week, progress) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'E-commerce Launch Campaign', 'Complete marketing campaign for new e-commerce store launch', 'E-commerce', 8, true, NOW(), 1, 0),
  ('550e8400-e29b-41d4-a716-446655440002', 'SaaS Product Marketing', 'Marketing strategy for B2B SaaS product launch', 'Technology', 12, false, NULL, 1, 0),
  ('550e8400-e29b-41d4-a716-446655440003', 'Restaurant Grand Opening', 'Local restaurant grand opening marketing campaign', 'Food & Beverage', 6, false, NULL, 1, 0)
ON CONFLICT (id) DO NOTHING;

-- Insert sample marketing modules for the active goal
INSERT INTO public.marketing_modules (id, goal_id, week_number, title, description, content, is_unlocked, is_completed) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 1, 'Foundation & Research', 'Establish brand foundation and market research', 'Week 1 focuses on understanding your market and establishing your brand foundation...', true, false),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 2, 'Brand Identity', 'Create visual identity and brand guidelines', 'Week 2 is all about creating a strong visual identity that resonates with your target audience...', false, false),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 3, 'Website & Landing Pages', 'Build high-converting website and landing pages', 'Week 3 focuses on creating a professional website that converts visitors into customers...', false, false),
  ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 4, 'Content Strategy', 'Develop content marketing strategy and calendar', 'Week 4 is dedicated to creating a comprehensive content strategy that drives engagement...', false, false),
  ('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 5, 'Social Media Setup', 'Set up social media presence and strategy', 'Week 5 focuses on establishing a strong social media presence across relevant platforms...', false, false),
  ('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', 6, 'Email Marketing', 'Create email marketing campaigns and automation', 'Week 6 is all about building an email list and creating automated email sequences...', false, false),
  ('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', 7, 'Paid Advertising', 'Launch PPC and social media advertising', 'Week 7 focuses on creating and launching paid advertising campaigns...', false, false),
  ('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440001', 8, 'Launch & Optimization', 'Launch campaign and optimize performance', 'Week 8 is the final week where we launch everything and optimize based on performance...', false, false)
ON CONFLICT (id) DO NOTHING;

-- Insert sample marketing tasks for the first module
INSERT INTO public.marketing_tasks (id, module_id, title, description, estimated_time, is_completed) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Market Research', 'Conduct comprehensive market research and competitor analysis', '4h', false),
  ('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Target Audience Definition', 'Define detailed buyer personas and target audience segments', '3h', false),
  ('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 'Brand Positioning', 'Develop unique value proposition and brand positioning statement', '2h', false),
  ('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'Competitor Analysis', 'Analyze top 5 competitors and identify opportunities', '3h', false),
  ('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 'Marketing Goals Setup', 'Set specific, measurable marketing goals and KPIs', '1h', false)
ON CONFLICT (id) DO NOTHING;

-- Insert sample projects
INSERT INTO public.projects (id, name, description, deadline, status, progress) VALUES
  ('880e8400-e29b-41d4-a716-446655440001', 'E-commerce Website Development', 'Build a complete e-commerce website with payment processing', NOW() + INTERVAL '30 days', 'active', 25),
  ('880e8400-e29b-41d4-a716-446655440002', 'Marketing Campaign Launch', 'Launch comprehensive marketing campaign for new product', NOW() + INTERVAL '14 days', 'active', 60),
  ('880e8400-e29b-41d4-a716-446655440003', 'Brand Identity Design', 'Create complete brand identity including logo and guidelines', NOW() + INTERVAL '7 days', 'active', 80)
ON CONFLICT (id) DO NOTHING;

-- Insert sample tasks
INSERT INTO public.tasks (id, title, description, responsible, deadline, project_id, status, time_spent) VALUES
  ('990e8400-e29b-41d4-a716-446655440001', 'Design Homepage', 'Create homepage design with hero section and product showcase', 'Design Team', NOW() + INTERVAL '5 days', '880e8400-e29b-41d4-a716-446655440001', 'in-progress', '8h'),
  ('990e8400-e29b-41d4-a716-446655440002', 'Setup Payment Gateway', 'Integrate Stripe payment processing into the website', 'Development Team', NOW() + INTERVAL '10 days', '880e8400-e29b-41d4-a716-446655440001', 'todo', '0h'),
  ('990e8400-e29b-41d4-a716-446655440003', 'Create Social Media Content', 'Develop content calendar and create first batch of posts', 'Marketing Team', NOW() + INTERVAL '3 days', '880e8400-e29b-41d4-a716-446655440002', 'todo', '0h'),
  ('990e8400-e29b-41d4-a716-446655440004', 'Design Logo Variations', 'Create logo in different formats and color variations', 'Design Team', NOW() + INTERVAL '2 days', '880e8400-e29b-41d4-a716-446655440003', 'completed', '12h'),
  ('990e8400-e29b-41d4-a716-446655440005', 'Write Brand Guidelines', 'Document brand voice, colors, and usage guidelines', 'Marketing Team', NOW() + INTERVAL '5 days', '880e8400-e29b-41d4-a716-446655440003', 'in-progress', '4h')
ON CONFLICT (id) DO NOTHING;

-- Insert sample timeline phases
INSERT INTO public.timeline_phases (id, project_id, name, description, start_date, end_date, status, order_index) VALUES
  ('aa0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 'Planning & Design', 'Initial planning and design phase', NOW(), NOW() + INTERVAL '10 days', 'in-progress', 1),
  ('aa0e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440001', 'Development', 'Core development and functionality implementation', NOW() + INTERVAL '10 days', NOW() + INTERVAL '25 days', 'not-started', 2),
  ('aa0e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440001', 'Testing & Launch', 'Final testing and website launch', NOW() + INTERVAL '25 days', NOW() + INTERVAL '30 days', 'not-started', 3)
ON CONFLICT (id) DO NOTHING;

-- Insert sample calendar events
INSERT INTO public.calendar_events (id, title, description, start_time, end_time, type, ref_id, category) VALUES
  ('bb0e8400-e29b-41d4-a716-446655440001', 'Client Meeting - Website Review', 'Review website design with client and gather feedback', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '1 hour', 'project', '880e8400-e29b-41d4-a716-446655440001', 'client-presentation'),
  ('bb0e8400-e29b-41d4-a716-446655440002', 'Marketing Strategy Session', 'Plan marketing campaign strategy and timeline', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '2 hours', 'project', '880e8400-e29b-41d4-a716-446655440002', 'strategy-session'),
  ('bb0e8400-e29b-41d4-a716-446655440003', 'Social Media Content Creation', 'Create and schedule social media posts', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '3 hours', 'task', '990e8400-e29b-41d4-a716-446655440003', 'content-creation')
ON CONFLICT (id) DO NOTHING;

-- Insert sample branding kits
INSERT INTO public.branding_kits (id, name, description, is_complete, completion_percentage) VALUES
  ('cc0e8400-e29b-41d4-a716-446655440001', 'E-commerce Brand Kit', 'Complete branding kit for the e-commerce store', false, 30),
  ('cc0e8400-e29b-41d4-a716-446655440002', 'SaaS Product Brand Kit', 'Branding materials for the SaaS product launch', false, 15)
ON CONFLICT (id) DO NOTHING;

-- Insert asset categories
INSERT INTO public.asset_categories (id, name, icon, color) VALUES
  ('logos', 'Logos', '🎨', '#EF8E81'),
  ('images', 'Images', '🖼️', '#686DCA'),
  ('documents', 'Documents', '📄', '#5ECD7D'),
  ('videos', 'Videos', '🎥', '#FFB347'),
  ('fonts', 'Fonts', '🔤', '#9B59B6'),
  ('colors', 'Color Palettes', '🎨', '#E74C3C'),
  ('templates', 'Templates', '📋', '#3498DB'),
  ('other', 'Other', '📁', '#95A5A6')
ON CONFLICT (id) DO NOTHING;

-- Insert sample assets
INSERT INTO public.assets (id, name, description, category, file_type, file_size, url, tags, is_public) VALUES
  ('ee0e8400-e29b-41d4-a716-446655440001', 'Company Logo - Primary', 'Primary company logo in vector format', 'logos', 'image/svg+xml', 15420, 'https://example.com/assets/logo-primary.svg', ARRAY['logo', 'primary', 'brand'], false),
  ('ee0e8400-e29b-41d4-a716-446655440002', 'Brand Guidelines PDF', 'Complete brand guidelines document', 'documents', 'application/pdf', 2048576, 'https://example.com/assets/brand-guidelines.pdf', ARRAY['guidelines', 'brand', 'document'], false),
  ('ee0e8400-e29b-41d4-a716-446655440003', 'Product Photography', 'High-quality product images for marketing', 'images', 'image/jpeg', 3145728, 'https://example.com/assets/product-photos.jpg', ARRAY['product', 'photography', 'marketing'], true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample share links
INSERT INTO public.share_links (id, name, email, permissions, expires_at, access_code) VALUES
  ('dd0e8400-e29b-41d4-a716-446655440001', 'Client Review Access', 'client@example.com', ARRAY['view', 'download'], NOW() + INTERVAL '7 days', 'ABC123'),
  ('dd0e8400-e29b-41d4-a716-446655440002', 'Designer Collaboration', 'designer@example.com', ARRAY['view', 'upload', 'edit'], NOW() + INTERVAL '14 days', 'XYZ789')
ON CONFLICT (id) DO NOTHING; 