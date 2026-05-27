-- HASA Alumni Directory — seed first admin
-- INSTRUCTIONS:
--   1. Sign up via the app using your Harvard email (this creates an auth.users row)
--   2. Find your UUID in Supabase → Authentication → Users
--   3. Replace the placeholder values below and run this query

insert into profiles (
  id,
  email,
  email_domain,
  affiliation_type,
  approval_status,
  role,
  first_name,
  last_name,
  harvard_school,
  country_of_origin
) values (
  'YOUR_AUTH_USER_UUID_HERE',               -- from auth.users
  'your-email@college.harvard.edu',         -- your Harvard email
  'college.harvard.edu',
  'undergrad',
  'approved',
  'admin',
  'Your First Name',
  'Your Last Name',
  'Harvard College',
  'Your Country'
)
on conflict (id) do update set
  approval_status = excluded.approval_status,
  role            = excluded.role;
