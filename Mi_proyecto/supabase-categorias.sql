create table if not exists public.categorias (
  clave text primary key check (clave ~ '^[a-z0-9-]+$'),
  nombre text not null check (length(trim(nombre)) between 3 and 30),
  created_at timestamptz not null default now()
);

insert into public.categorias (clave, nombre) values
  ('montanas', 'Montañas'), ('bosques', 'Bosques'),
  ('lagos', 'Lagos y Playas'), ('atardeceres', 'Atardeceres')
on conflict (clave) do nothing;

alter table public.categorias enable row level security;

drop policy if exists categorias_leer on public.categorias;
create policy categorias_leer on public.categorias for select using (true);

drop policy if exists categorias_escribir on public.categorias;
create policy categorias_escribir on public.categorias for all to authenticated
  using (true) with check (true);

alter table public.fotos drop constraint if exists fotos_categoria_check;
