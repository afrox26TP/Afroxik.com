# Personal main page
https://afrox26tp.com/
Jednoducha osobni stranka pres React + Vite + Tailwind. Obsah je pripraveny pro nacteni ze Supabase, ale kdyz databazi jeste nenastavis, appka se automaticky prepne na lokalni demo data.

## Stack

- React
- Vite
- Tailwind CSS
- Supabase jako jednoducha databaze bez vlastniho backend serveru

## Spusteni lokalne

```bash
npm install
npm run dev
```

## Co upravit

- Texty a demo data najdes v `src/lib/content.js`
- Hlavni layout je v `src/App.jsx`
- Pokud chces napojit databazi, nastav promenne z `.env.example`

## Supabase setup

1. V Supabase vytvor novy projekt.
2. Spust SQL ze souboru `supabase/schema.sql`.
3. Zkopiruj `.env.example` do `.env` a dopln `VITE_SUPABASE_URL` a `VITE_SUPABASE_ANON_KEY`.
4. Vloz vlastni projekty a updates do tabulek `projects` a `work_items`.

## Cloudflare Pages

1. Nahraj projekt do GitHubu.
2. V Cloudflare otevri `Workers & Pages -> Create -> Pages -> Connect to Git`.
3. Vyber repozitar `afrox26TP/Afroxik.com`.
4. Build settings nastav:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
5. Pokud chces data ze Supabase, pridej v `Settings -> Environment variables`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Klikni `Save and Deploy`.
7. V `Custom domains` pridej svoji domenu a potvrz DNS (kdyz mas domenu na Cloudflare, udela se to skoro automaticky).

Pokud nechces databazi hned resit, appka pobezi i bez ni na demo datech.
