-- AEGIS Community: all data access goes through the Edge function, never direct public writes.
create table public.aegis_community_messages (
 id uuid primary key default gen_random_uuid(),
 client_hash text not null check (client_hash ~ '^[a-f0-9]{64}$'),
 request_id uuid not null,
 signature text not null check (char_length(btrim(signature)) between 1 and 32),
 body text not null check (char_length(btrim(body)) between 1 and 1200),
 created_at timestamptz not null default clock_timestamp(),
 hidden boolean not null default false,
 unique(client_hash,request_id)
);
create index aegis_community_feed_idx on public.aegis_community_messages(created_at desc,id desc) where not hidden;
create table public.aegis_community_limits (
 key_hash text primary key,
 last_sent_at timestamptz not null
);
create table public.aegis_community_subscriptions (
 endpoint text primary key check (char_length(endpoint) between 10 and 2048),
 client_hash text not null check(client_hash ~ '^[a-f0-9]{64}$'),
 subscription jsonb not null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index aegis_community_subscriber_client_idx on public.aegis_community_subscriptions(client_hash);
alter table public.aegis_community_messages enable row level security;
alter table public.aegis_community_limits enable row level security;
alter table public.aegis_community_subscriptions enable row level security;
revoke all on public.aegis_community_messages,public.aegis_community_limits,public.aegis_community_subscriptions from public,anon,authenticated;
grant all on public.aegis_community_messages,public.aegis_community_limits,public.aegis_community_subscriptions to service_role;
comment on table public.aegis_community_messages is 'Public chat accessed through the Edge API; signatures are self-chosen, not verified identities. Client key hashes stay private.';
comment on table public.aegis_community_limits is 'Server-enforced 10-second cooldown by installation and pseudonymous network hash; raw IPs are not stored.';
comment on table public.aegis_community_subscriptions is 'Community notification opt-ins only. Separate from admin broadcasts.';

create function public.aegis_community_send(p_client_hash text,p_network_hash text,p_request_id uuid,p_signature text,p_body text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare
 previous public.aegis_community_messages%rowtype;
 sent public.aegis_community_messages%rowtype;
 latest timestamptz;
 current_time_value timestamptz;
 wait_seconds integer;
begin
 if p_client_hash is null or p_network_hash is null or p_request_id is null or p_signature is null or p_body is null
    or p_client_hash !~ '^[a-f0-9]{64}$' or p_network_hash !~ '^[a-f0-9]{64}$'
    or char_length(btrim(p_signature)) not between 1 and 32 or char_length(btrim(p_body)) not between 1 and 1200 then
   raise exception 'Invalid community message' using errcode='22023';
 end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('community-client:'||p_client_hash,0));
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('community-network:'||p_network_hash,0));
 select * into previous from public.aegis_community_messages where client_hash=p_client_hash and request_id=p_request_id;
 if found then
   return jsonb_build_object('ok',true,'duplicate',true,'retry_after',greatest(0,ceil(extract(epoch from previous.created_at+interval '10 seconds'-clock_timestamp())))::integer,
      'message',jsonb_build_object('id',previous.id,'signature',previous.signature,'body',previous.body,'created_at',previous.created_at,'hidden',previous.hidden));
 end if;
 select max(last_sent_at) into latest from public.aegis_community_limits where key_hash in ('client:'||p_client_hash,'network:'||p_network_hash);
 current_time_value:=clock_timestamp();
 wait_seconds:=greatest(0,ceil(extract(epoch from latest+interval '10 seconds'-current_time_value)))::integer;
 if wait_seconds>0 then return jsonb_build_object('ok',false,'retry_after',wait_seconds);end if;
 insert into public.aegis_community_messages(client_hash,request_id,signature,body,created_at)
 values(p_client_hash,p_request_id,btrim(p_signature),btrim(p_body),current_time_value) returning * into sent;
 insert into public.aegis_community_limits(key_hash,last_sent_at) values
 ('client:'||p_client_hash,current_time_value),('network:'||p_network_hash,current_time_value)
 on conflict(key_hash) do update set last_sent_at=excluded.last_sent_at;
 return jsonb_build_object('ok',true,'duplicate',false,'retry_after',10,'message',
   jsonb_build_object('id',sent.id,'signature',sent.signature,'body',sent.body,'created_at',sent.created_at));
end;
$$;
revoke all on function public.aegis_community_send(text,text,uuid,text,text) from public,anon,authenticated;
grant execute on function public.aegis_community_send(text,text,uuid,text,text) to service_role;
