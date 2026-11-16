create table public.aegis_community_moderation (
 client_hash text primary key check(client_hash ~ '^[a-f0-9]{64}$'),
 muted_until timestamptz not null
);
create table public.aegis_community_restricted_attempts (
 client_hash text not null check(client_hash ~ '^[a-f0-9]{64}$'),
 request_id uuid not null,
 created_at timestamptz not null default clock_timestamp(),
 primary key(client_hash,request_id)
);
create index aegis_community_attempt_window_idx on public.aegis_community_restricted_attempts(client_hash,created_at desc);
alter table public.aegis_community_moderation enable row level security;
alter table public.aegis_community_restricted_attempts enable row level security;
revoke all on public.aegis_community_moderation,public.aegis_community_restricted_attempts from public,anon,authenticated;
grant all on public.aegis_community_moderation,public.aegis_community_restricted_attempts to service_role;
comment on table public.aegis_community_restricted_attempts is 'Idempotent language-rejection counters only; rejected names and message text are not stored.';
create function public.aegis_community_attempt(p_client_hash text,p_network_hash text,p_request_id uuid,p_signature text,p_body text,p_restricted boolean)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare mute_until timestamptz; attempt_count integer; current_time_value timestamptz;
begin
 if p_client_hash is null or p_network_hash is null or p_request_id is null or p_restricted is null
    or p_client_hash !~ '^[a-f0-9]{64}$' or p_network_hash !~ '^[a-f0-9]{64}$' then raise exception 'Invalid community request' using errcode='22023';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('community-client:'||p_client_hash,0));
 current_time_value:=clock_timestamp();
 select muted_until into mute_until from public.aegis_community_moderation where client_hash=p_client_hash;
 if mute_until>current_time_value then
   return jsonb_build_object('ok',false,'muted',true,'muted_until',mute_until,'retry_after',ceil(extract(epoch from mute_until-current_time_value))::integer,'remaining_attempts',0);
 end if;
 if p_restricted then
   insert into public.aegis_community_restricted_attempts(client_hash,request_id,created_at) values(p_client_hash,p_request_id,current_time_value) on conflict do nothing;
   select count(*) into attempt_count from public.aegis_community_restricted_attempts where client_hash=p_client_hash and created_at>current_time_value-interval '1 hour';
   if attempt_count>=3 then
     mute_until:=current_time_value+interval '1 hour';
     insert into public.aegis_community_moderation(client_hash,muted_until) values(p_client_hash,mute_until) on conflict(client_hash) do update set muted_until=excluded.muted_until;
     return jsonb_build_object('ok',false,'restricted',true,'muted',true,'muted_until',mute_until,'retry_after',3600,'remaining_attempts',0);
   end if;
   return jsonb_build_object('ok',false,'restricted',true,'remaining_attempts',3-attempt_count,'retry_after',0);
 end if;
 return public.aegis_community_send(p_client_hash,p_network_hash,p_request_id,p_signature,p_body);
end;
$$;
revoke all on function public.aegis_community_attempt(text,text,uuid,text,text,boolean) from public,anon,authenticated;
grant execute on function public.aegis_community_attempt(text,text,uuid,text,text,boolean) to service_role;
