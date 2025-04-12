-- Create the legal_pages table
create table if not exists legal_pages (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text not null unique,
  content text not null,
  last_updated timestamp with time zone not null,
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

create policy "Enable insert for authenticated users only" on legal_pages
  for insert with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users only" on legal_pages
  for update using (auth.role() = 'authenticated');

create policy "Enable delete for authenticated users only" on legal_pages
  for delete using (auth.role() = 'authenticated'); 