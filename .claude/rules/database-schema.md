# FlashRead Database Schema (Supabase)

## profiles
```sql
id              UUID PRIMARY KEY (references auth.users)
is_pro          BOOLEAN DEFAULT FALSE
created_at      TIMESTAMPTZ DEFAULT NOW()
```
Auto-created on signup via trigger.
Stripe columns (stripe_customer_id, stripe_subscription_id, stripe_status) designed but NOT added yet.

## documents
```sql
id              UUID PRIMARY KEY (gen_random_uuid)
user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE
title           TEXT NOT NULL
content         TEXT NOT NULL
word_count      INTEGER
current_position INTEGER DEFAULT 0
total_words     INTEGER
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```
RLS enabled — users can only CRUD their own documents.

## reading_sessions
```sql
id              UUID PRIMARY KEY (gen_random_uuid)
user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE
document_id     UUID REFERENCES documents(id) ON DELETE SET NULL
words_read      INTEGER NOT NULL DEFAULT 0
duration_seconds INTEGER NOT NULL DEFAULT 0
avg_wpm         INTEGER NOT NULL DEFAULT 0
created_at      TIMESTAMPTZ DEFAULT NOW()
```
RLS enabled. Indexes on user_id and created_at DESC.

## Supabase Client

App page imports: `import { createClient } from '../../lib/supabase-client'`
Uses `createBrowserClient` from `@supabase/ssr`.
Landing page does NOT use Supabase.
