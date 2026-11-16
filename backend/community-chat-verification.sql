-- Functional checks are rolled back: no public test messages or test mutes remain.
begin;
set local role service_role;
do $$
declare
 a text:=repeat(md5(random()::text),2); b text:=repeat(md5(random()::text),2);
 c text:=repeat(md5(random()::text),2); d text:=repeat(md5(random()::text),2);
 first_request uuid:=gen_random_uuid(); rejection_request uuid:=gen_random_uuid();
 result jsonb; duplicate_result jsonb;
begin
 result:=public.aegis_community_attempt(a,b,first_request,'QA','Allowed test',false);
 assert (result->>'ok')::boolean;
 duplicate_result:=public.aegis_community_attempt(a,b,first_request,'QA','Allowed test',false);
 assert (duplicate_result->>'duplicate')::boolean;
 assert result->'message'->>'id'=duplicate_result->'message'->>'id';
 result:=public.aegis_community_attempt(a,b,gen_random_uuid(),'New signature','Should be rate limited',false);
 assert not (result->>'ok')::boolean and (result->>'retry_after')::integer between 1 and 10;
 result:=public.aegis_community_attempt(c,b,gen_random_uuid(),'New device','Same network rate limit',false);
 assert not (result->>'ok')::boolean;
 result:=public.aegis_community_attempt(c,d,rejection_request,'QA','Restricted test',true);
 assert (result->>'remaining_attempts')::integer=2;
 result:=public.aegis_community_attempt(c,d,rejection_request,'QA','Restricted retry',true);
 assert (result->>'remaining_attempts')::integer=2, 'Retrying an unconfirmed request must not add a strike';
 result:=public.aegis_community_attempt(c,d,gen_random_uuid(),'QA','Restricted second',true);
 assert (result->>'remaining_attempts')::integer=1;
 result:=public.aegis_community_attempt(c,d,gen_random_uuid(),'QA','Restricted third',true);
 assert (result->>'muted')::boolean and (result->>'retry_after')::integer=3600;
 result:=public.aegis_community_attempt(c,d,gen_random_uuid(),'Changed name','Allowed but muted',false);
 assert (result->>'muted')::boolean, 'Changing signature must not bypass the mute';
 update public.aegis_community_moderation set muted_until=clock_timestamp()-interval '1 second' where client_hash=c;
 update public.aegis_community_restricted_attempts set created_at=clock_timestamp()-interval '2 hours' where client_hash=c;
 result:=public.aegis_community_attempt(c,d,gen_random_uuid(),'QA','Allowed after mute expiry',false);
 assert (result->>'ok')::boolean;
 assert not has_table_privilege('anon','public.aegis_community_messages','INSERT');
 assert not has_table_privilege('anon','public.aegis_community_subscriptions','SELECT');
 assert not has_function_privilege('anon','public.aegis_community_attempt(text,text,uuid,text,text,boolean)','EXECUTE');
end;
$$;
rollback;
