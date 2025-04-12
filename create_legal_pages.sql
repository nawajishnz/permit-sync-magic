-- First, ensure the uuid extension is available
create extension if not exists "uuid-ossp";

-- Create the legal_pages table
create table if not exists legal_pages (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text not null unique,
  content text not null,
  last_updated timestamp with time zone not null default now(),
  created_at timestamp with time zone default now()
);

-- Grant necessary permissions
grant all on legal_pages to authenticated;
grant all on legal_pages to anon;

-- Enable RLS
alter table legal_pages enable row level security;

-- Create policies
create policy "Enable read access for all users" on legal_pages
  for select using (true);

create policy "Enable insert for all users" on legal_pages
  for insert with check (true);

create policy "Enable update for all users" on legal_pages
  for update using (true);

create policy "Enable delete for all users" on legal_pages
  for delete using (true);

-- Insert a test legal page
insert into legal_pages (title, slug, content, last_updated)
values ('Terms of Service', 'terms-of-service', '<h1>Terms of Service</h1><p>This is a sample terms of service page.</p>', now()); 