-- 8. Add Lineage Tracking
alter table public.songs 
add column parent_id uuid references public.songs(id);
