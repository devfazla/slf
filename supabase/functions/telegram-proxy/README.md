# Deploying the Telegram Proxy Edge Function

## Why This Is Needed

Telegram blocks browser user agents. Direct client-side calls to `api.telegram.org` from browsers always get `ERR_CONNECTION_TIMED_OUT`. The Supabase Edge Function acts as a server-side proxy to bypass this restriction.

## Deployment Steps

### 1. Install Supabase CLI (if not installed)

```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link to your project

```bash
supabase link --project-ref tqusynzazbiisgbxvulw
```

### 4. Deploy the edge function

```bash
supabase functions deploy telegram-proxy
```

### 5. Set secrets (optional - bot token can be passed from client)

If you want to store the bot token server-side instead of passing it from the client:

```bash
supabase secrets set TELEGRAM_BOT_TOKEN=your_bot_token
```

### 6. Test the proxy

After deployment, test with curl:

```bash
curl -X POST https://tqusynzazbiisgbxvulw.supabase.co/functions/v1/telegram-proxy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"botToken":"YOUR_BOT_TOKEN","method":"sendMessage","body":{"chat_id":"YOUR_CHAT_ID","text":"Hello from SelfDesk!"}}'
```

## Alternative: Deploy via Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **Edge Functions** in the sidebar
4. Click **Create Function**
5. Name it `telegram-proxy`
6. Paste the contents of `supabase/functions/telegram-proxy/index.ts`
7. Click **Deploy**

## Architecture

```
Browser → Supabase Edge Function → api.telegram.org
         (proxy bypasses UA block)
```

The client sends all Telegram API requests through the Supabase Edge Function, which forwards them to `api.telegram.org` with a server-side user agent.
