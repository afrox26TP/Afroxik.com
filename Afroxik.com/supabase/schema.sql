create table if not exists profile (
  id bigint generated always as identity primary key,
  name text not null,
  role text not null,
  intro text not null,
  email text not null,
  github text not null,
  linkedin text not null,
  created_at timestamp with time zone default now() not null
);

create table if not exists projects (
  id bigint generated always as identity primary key,
  label text not null,
  title text not null,
  description text not null,
  url text not null,
  position integer default 0 not null,
  published boolean default true not null,
  created_at timestamp with time zone default now() not null
);

create table if not exists work_items (
  id bigint generated always as identity primary key,
  status text not null,
  title text not null,
  description text not null,
  position integer default 0 not null,
  published boolean default true not null,
  created_at timestamp with time zone default now() not null
);

insert into profile (name, role, intro, email, github, linkedin)
values (
  'Afrox',
  'builder, experiments, shipping',
  'Jednoducha osobni page, kde mas na jednom miste aktivni projekty, rozdelane veci a kontakt.',
  'ahoj@tvojedomena.cz',
  'https://github.com/',
  'https://www.linkedin.com/'
)
on conflict do nothing;

insert into projects (label, title, description, url, position)
values
  ('live', 'Projekt 01', 'Landing page, demo nebo produkt, ktery chces mit rychle po ruce.', '#', 1),
  ('app', 'Projekt 02', 'Druhy odkaz na appku, klientsky projekt nebo vlastni tool.', '#', 2),
  ('github', 'Projekt 03', 'Repo, microsite nebo side project, na kterem zrovna delas.', '#', 3);

insert into work_items (status, title, description, position)
values
  ('rozpracovano', 'Nova verze webu nebo produktu', 'Jedna konkretni vec, kterou resis ted a chces ji mit verejne videt.', 1),
  ('experiment', 'Maly test nebo prototyp', 'AI tool, automatizace nebo side project, ktery si potrebujes rychle overit.', 2);