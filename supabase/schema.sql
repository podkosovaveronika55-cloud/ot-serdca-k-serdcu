-- ============================================================================
--  «От сердца к сердцу» — схема общей ёлки в Supabase (PostgreSQL)
--  Выполните этот файл в Supabase → SQL Editor → New query → Run.
--  После этого сайт перестанет быть «демо»: игрушки увидят все посетители.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 1. Таблица игрушек
-- ---------------------------------------------------------------------------
create table if not exists public.toys (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),

  -- оформление игрушки (см. src/lib/types.ts)
  shape       text not null check (shape in ('ball', 'star', 'snowflake', 'heart', 'bell')),
  color       text not null check (color in ('red', 'blue', 'gold', 'silver', 'violet', 'green', 'pink')),
  decor       jsonb not null default '[]'::jsonb check (jsonb_typeof(decor) = 'array' and jsonb_array_length(decor) <= 3),
  label       text not null default '' check (char_length(label) <= 18),

  -- пожелание внутри игрушки
  wish        text not null check (char_length(btrim(wish)) between 5 and 180),
  category    text not null check (category in ('self', 'family', 'city', 'world')),
  anonymous   boolean not null default false,

  -- положение на ёлке, в процентах (0–100)
  pos_x       double precision not null check (pos_x between 0 and 100),
  pos_y       double precision not null check (pos_y between 0 and 100)
);

create index if not exists toys_created_at_idx on public.toys (created_at);

comment on table public.toys is
  'Игрушки на общей ёлке: оформление + пожелание + координата на дереве';

-- ---------------------------------------------------------------------------
-- 2. Защита от спама на уровне базы
--    Клиент уже проверяет текст (src/lib/moderation.ts), но проверку нельзя
--    считать надёжной: любой может отправить запрос напрямую.
-- ---------------------------------------------------------------------------
create or replace function public.toys_guard()
returns trigger
language plpgsql
as $$
declare
  clean text;
  recent int;
begin
  -- 2.1 нормализуем и проверяем основной текст
  clean := btrim(regexp_replace(new.wish, '\s+', ' ', 'g'));
  if char_length(clean) < 5 then
    raise exception 'Пожелание слишком короткое';
  end if;
  if char_length(clean) > 180 then
    raise exception 'Пожелание длиннее 180 символов';
  end if;

  -- 2.2 ссылки, контакты и «казино» — типовой спам
  if clean ~* '(https?://|www\.|\.(ru|com|net|org|io|me|xyz|shop)\b)' then
    raise exception 'Ссылки запрещены';
  end if;
  if clean ~* '(@|\+?[0-9][0-9\s()\-]{6,}[0-9])' then
    raise exception 'Контакты запрещены';
  end if;
  if clean ~* '(казино|ставк|заработ|крипт|bitcoin|crypto|viagra|займ|микрозайм)' then
    raise exception 'Похоже на рекламу';
  end if;
  if clean ~* '(хуй|пизд|ебал|ебат|бляд|сука|мудак|говно|дерьмо|пидор|fuck|shit|bitch|cunt|porn)' then
    raise exception 'Грубые слова запрещены';
  end if;

  -- 2.3 защита от повторов: не больше 6 игрушек в час с одного устройства.
  --     IP-адрес недоступен из RLS-политики, поэтому ограничиваем по сессии:
  --     клиент передаёт свой отпечаток в поле label не может — вместо этого
  --     ограничиваем скорость по таблице (см. ниже, блок 5).
  select count(*) into recent
  from public.toys
  where created_at > now() - interval '1 minute';
  if recent > 120 then
    raise exception 'Слишком много игрушек в минуту, попробуйте позже';
  end if;

  new.wish  := clean;
  new.label := btrim(regexp_replace(new.label, '\s+', ' ', 'g'));
  return new;
end;
$$;

drop trigger if exists toys_guard_trg on public.toys;
create trigger toys_guard_trg
before insert on public.toys
for each row execute function public.toys_guard();

-- ---------------------------------------------------------------------------
-- 3. Row Level Security: читать можно всем, добавлять — только анонимно и
--    только новые записи. Удалять и править через anon нельзя.
-- ---------------------------------------------------------------------------
alter table public.toys enable row level security;

drop policy if exists "toys_select_all" on public.toys;
create policy "toys_select_all"
  on public.toys for select
  to anon, authenticated
  using (true);

drop policy if exists "toys_insert_anon" on public.toys;
create policy "toys_insert_anon"
  on public.toys for insert
  to anon, authenticated
  with check (
    char_length(btrim(wish)) between 5 and 180
    and char_length(label) <= 18
    and pos_x between 0 and 100
    and pos_y between 0 and 100
  );

-- UPDATE и DELETE политик нет — значит, изменить чужую игрушку невозможно.

-- ---------------------------------------------------------------------------
-- 4. Realtime: чтобы новая игрушка появлялась у всех без перезагрузки
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'toys'
  ) then
    alter publication supabase_realtime add table public.toys;
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 5. Мягкое ограничение частоты по устройству.
--    Таблица «следов»: клиент присылает случайный отпечаток устройства.
--    Необязательный, но полезный слой поверх клиентского rate limit.
-- ---------------------------------------------------------------------------
create table if not exists public.toy_limits (
  fingerprint text not null,
  created_at  timestamptz not null default now()
);

create index if not exists toy_limits_fp_idx on public.toy_limits (fingerprint, created_at desc);

alter table public.toy_limits enable row level security;

drop policy if exists "toy_limits_insert_anon" on public.toy_limits;
create policy "toy_limits_insert_anon"
  on public.toy_limits for insert
  to anon, authenticated
  with check (char_length(fingerprint) between 8 and 64);

-- если решите включить этот слой, добавьте в toys_guard проверку:
--   select count(*) into recent from public.toy_limits
--    where fingerprint = new.fingerprint and created_at > now() - interval '1 hour';
--   if recent >= 6 then raise exception 'Слишком много игрушек за час'; end if;

-- ---------------------------------------------------------------------------
-- 6. Удобное представление для админа: свежие игрушки
-- ---------------------------------------------------------------------------
create or replace view public.toys_latest as
  select id, created_at, label, wish, category, anonymous, pos_x, pos_y
  from public.toys
  order by created_at desc
  limit 100;

-- ============================================================================
--  Как включить общую ёлку:
--   1. Создайте проект на supabase.com (бесплатного тарифа достаточно).
--   2. Выполните этот файл в SQL Editor.
--   3. Project Settings → API: скопируйте Project URL и anon public key.
--   4. Локально создайте .env.local:
--        VITE_SUPABASE_URL=https://xxxx.supabase.co
--        VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
--   5. Для GitHub Pages положите те же значения в
--      Settings → Secrets and variables → Actions → New repository secret
--      (имена: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) —
--      workflow .github/workflows/deploy.yml подставит их при сборке.
--   Anon key публичен по замыслу: защиту обеспечивают RLS-политики выше.
--   Service role key в браузер НЕ добавляйте никогда.
-- ============================================================================
