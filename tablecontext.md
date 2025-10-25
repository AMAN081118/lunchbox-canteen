menu_items (
id uuid not null default gen_random_uuid (),
canteen_id uuid not null,
name text not null,
description text null,
price_inr numeric(10, 2) not null,
veg boolean not null default true,
calories integer null,
prep_time_minutes integer not null default 5,
available boolean not null default true,
serving_size text null,
max_per_order integer not null default 0,
image_path text null,
avg_rating numeric(3, 2) not null default 0,
rating_count integer not null default 0,
times_ordered integer not null default 0,
category text null,
created_at timestamp with time zone not null default now(),
constraint menu_items_pkey primary key (id),
constraint menu_items_canteen_id_fkey foreign KEY (canteen_id) references canteens (id) on delete CASCADE
) TABLESPACE pg_default;

profiles (
id uuid not null,
full_name text null,
phone text null,
email text not null,
hostel_id uuid null,
preferred_canteen_id uuid null,
gender text null,
role public.user_role not null default 'student'::user_role,
created_at timestamp with time zone not null default now(),
constraint profiles_pkey primary key (id),
constraint profiles_email_key unique (email),
constraint profiles_phone_key unique (phone),
constraint profiles_preferred_canteen_id_fkey foreign KEY (preferred_canteen_id) references canteens (id),
constraint profiles_hostel_id_fkey foreign KEY (hostel_id) references hostels (id),
constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE,
constraint profiles_phone_check check ((phone ~ '^(\+?[0-9]{7,15})$'::text)),
constraint profiles_gender_check check (
(
gender = any (
array['male'::text, 'female'::text, 'other'::text]
)
)
)
) TABLESPACE pg_default;

user_carts (
user_id uuid not null,
items jsonb not null default '[]'::jsonb,
updated_at timestamp without time zone null default now(),
constraint user_carts_pkey primary key (user_id)
) TABLESPACE pg_default;

.orders (
id uuid not null default gen_random_uuid (),
user_id uuid not null,
canteen_id uuid not null,
status public.order_status not null default 'pending'::order_status,
scheduled_for timestamp with time zone null,
backup_menu_item_id uuid null,
total_price_inr numeric(12, 2) not null default 0,
payment_method text not null default 'COD'::text,
payment_status text not null default 'unpaid'::text,
placed_at timestamp with time zone not null default now(),
updated_at timestamp with time zone not null default now(),
notes text null,
constraint orders_pkey primary key (id),
constraint orders_backup_menu_item_id_fkey foreign KEY (backup_menu_item_id) references menu_items (id),
constraint orders_canteen_id_fkey foreign KEY (canteen_id) references canteens (id) on delete CASCADE
) TABLESPACE pg_default;

order_events (
id uuid not null default gen_random_uuid (),
order_id uuid not null,
event_type text not null,
event_by_profile_id uuid null,
meta jsonb null,
created_at timestamp with time zone not null default now(),
constraint order_events_pkey primary key (id),
constraint order_events_order_id_fkey foreign KEY (order_id) references orders (id) on delete CASCADE
) TABLESPACE pg_default;

hostels (
id uuid not null default gen_random_uuid (),
name text not null,
is_girls boolean not null default false,
created_at timestamp with time zone not null default now(),
constraint hostels_pkey primary key (id),
constraint hostels_name_key unique (name)
) TABLESPACE pg_default;

feedback (
id uuid not null default gen_random_uuid (),
order_item_id uuid not null,
profile_id uuid not null,
rating smallint not null,
comment text null,
created_at timestamp with time zone not null default now(),
menu_item_id uuid null,
constraint feedback_pkey primary key (id),
constraint feedback_order_item_id_profile_id_key unique (order_item_id, profile_id),
constraint feedback_menu_item_id_fkey foreign KEY (menu_item_id) references menu_items (id),
constraint feedback_order_item_id_fkey foreign KEY (order_item_id) references order_items (id) on delete CASCADE,
constraint feedback_rating_check check (
(
(rating >= 1)
and (rating <= 5)
)
)
) TABLESPACE pg_default;

create index IF not exists idx_feedback_menu_item_direct on public.feedback using btree (menu_item_id) TABLESPACE pg_default;

create trigger trg_feedback_fill_menu_item BEFORE INSERT on feedback for EACH row
execute FUNCTION feedback_fill_menu_item ();

create trigger trg_update_menu_rating
after INSERT on feedback for EACH row
execute FUNCTION update_menu_rating_on_feedback ();

canteens (
id uuid not null default gen_random_uuid (),
name text not null,
hostels_allowed uuid[] null default array[]::uuid[],
based_hostel_id uuid not null,
gst_no text null,
total_sales numeric(12, 2) not null default 0,
is_active boolean not null default true,
created_at timestamp with time zone not null default now(),
img_url text null,
constraint canteens_pkey primary key (id),
constraint canteens_based_hostel_id_fkey foreign KEY (based_hostel_id) references hostels (id)
) TABLESPACE pg_default;

create index IF not exists idx_canteens_based_hostel on public.canteens using btree (based_hostel_id) TABLESPACE pg_default;

canteen_owners (
id uuid not null default gen_random_uuid (),
canteen_id uuid not null,
owner_profile_id uuid not null,
created_at timestamp with time zone not null default now(),
constraint canteen_owners_pkey primary key (id),
constraint canteen_owners_owner_profile_id_key unique (owner_profile_id),
constraint canteen_owners_canteen_id_fkey foreign KEY (canteen_id) references canteens (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_canteen_owners_canteen on public.canteen_owners using btree (canteen_id) TABLESPACE pg_default;

canteen_order_summary as
select
c.id as canteen_id,
c.name as canteen_name,
count(o._) filter (
where
o.status = 'pending'::order_status
) as pending_orders,
count(o._) filter (
where
o.status = 'in_preparation'::order_status
) as in_preparation_orders,
count(o.\*) filter (
where
o.status = 'ready_for_pickup'::order_status
) as ready_orders,
c.total_sales
from
canteens c
left join orders o on o.canteen_id = c.id
group by
c.id;

announcements (
id uuid not null default gen_random_uuid (),
canteen_id uuid not null,
title text not null,
message text not null,
type text not null default 'info'::text,
is_active boolean not null default true,
created_at timestamp with time zone not null default now(),
updated_at timestamp with time zone not null default now(),
constraint announcements_pkey primary key (id),
constraint announcements_canteen_id_fkey foreign KEY (canteen_id) references canteens (id) on delete CASCADE,
constraint announcements_type_check check (
(
type = any (
array[
'info'::text,
'warning'::text,
'success'::text,
'error'::text
]
)
)
)
) TABLESPACE pg_default;
