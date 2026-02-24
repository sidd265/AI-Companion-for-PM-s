-- PMPilot Seed Data
-- Run after schema.sql to populate demo data.
-- Uses fixed UUIDs for reproducibility.

-- Fixed UUIDs
-- Demo project: 00000000-0000-0000-0000-000000000001
-- Team members: a0000000-0000-0000-0000-00000000000X

-- ============================================================================
-- Team Members (6 from mockData)
-- ============================================================================
INSERT INTO public.team_members (id, name, role, email, github, slack, expertise, avatar_color, velocity, capacity, active_tasks)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Sarah Chen', 'Senior Backend Engineer', 'sarah@company.com', '@sarachen', '@sarah', ARRAY['Python','AWS','Docker','PostgreSQL','Redis','Node.js'], '#E255A1', 23, 75, 3),
  ('a0000000-0000-0000-0000-000000000002', 'Michael Torres', 'Frontend Lead', 'michael@company.com', '@mtorres', '@michael', ARRAY['React','TypeScript','CSS','Tailwind','Next.js'], '#2383E2', 31, 60, 4),
  ('a0000000-0000-0000-0000-000000000003', 'Emily Rodriguez', 'Full Stack Developer', 'emily@company.com', '@emilyr', '@emily', ARRAY['JavaScript','Node.js','React','MongoDB','GraphQL'], '#0F7B6C', 19, 85, 2),
  ('a0000000-0000-0000-0000-000000000004', 'David Kim', 'DevOps Engineer', 'david@company.com', '@davidkim', '@david', ARRAY['Kubernetes','Terraform','AWS','CI/CD','Linux'], '#D9730D', 15, 45, 5),
  ('a0000000-0000-0000-0000-000000000005', 'Lisa Wang', 'QA Engineer', 'lisa@company.com', '@lisawang', '@lisa', ARRAY['Selenium','Jest','Cypress','Python','Test Automation'], '#9065B0', 8, 55, 2),
  ('a0000000-0000-0000-0000-000000000006', 'James Park', 'Backend Developer', 'james@company.com', '@jamespark', '@james', ARRAY['Go','gRPC','Microservices','Redis','Kafka'], '#DFAB01', 27, 70, 3);

-- ============================================================================
-- Demo Project
-- ============================================================================
INSERT INTO public.projects (id, name, key, owner_id)
VALUES ('00000000-0000-0000-0000-000000000001', 'PMPilot Demo', 'PROJ',
  -- owner_id must reference a real profile; use a placeholder that will be
  -- replaced once a real user signs up. For seed purposes we skip RLS.
  (SELECT id FROM public.profiles LIMIT 1));

-- ============================================================================
-- Tickets (5 from mockData, referencing demo project)
-- ============================================================================
INSERT INTO public.tickets (id, title, description, status, priority, type, project_id, jira_key, story_points, created_at, updated_at)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Payment API refactor for v2 endpoints', NULL, 'In Progress', 'High', 'Story', '00000000-0000-0000-0000-000000000001', 'PROJ-1234', 5, '2024-01-28T10:00:00Z', '2024-02-02T09:00:00Z'),
  ('b0000000-0000-0000-0000-000000000002', 'Fix user session timeout bug', NULL, 'In Review', 'Critical', 'Bug', '00000000-0000-0000-0000-000000000001', 'PROJ-1235', 3, '2024-02-01T14:00:00Z', '2024-02-02T11:00:00Z'),
  ('b0000000-0000-0000-0000-000000000003', 'Add dark mode support', NULL, 'To Do', 'Medium', 'Story', '00000000-0000-0000-0000-000000000001', 'PROJ-1236', 8, '2024-02-02T08:00:00Z', '2024-02-02T08:00:00Z'),
  ('b0000000-0000-0000-0000-000000000004', 'Database optimization for search queries', NULL, 'Blocked', 'High', 'Task', '00000000-0000-0000-0000-000000000001', 'PROJ-1237', 5, '2024-01-25T11:00:00Z', '2024-02-01T16:00:00Z'),
  ('b0000000-0000-0000-0000-000000000005', 'Implement notification preferences', NULL, 'In Progress', 'Medium', 'Story', '00000000-0000-0000-0000-000000000001', 'PROJ-1238', 3, '2024-01-30T09:00:00Z', '2024-02-02T10:00:00Z');
