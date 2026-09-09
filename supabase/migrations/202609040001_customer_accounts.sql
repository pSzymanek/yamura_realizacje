-- PostgreSQL requires a commit before a newly added enum value can be used.
alter type public.staff_role add value if not exists 'customer';
