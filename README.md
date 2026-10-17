# Afrox web

Statické React portfolio s plasma pozadím, plovoucí navigací a sekcemi Projekty, O mně a Kontakt.

## Vývoj

```bash
npm install
npm run dev
```

Lokální adresa: `http://localhost:5173/`

## Kontrola a build

```bash
npm run lint
npm run build
npm run preview
```

Produkční výstup vznikne v `dist/`.

## Obsah a struktura

- Texty, projekty, kontakty a toolbox: `Afroxik.com/src/lib/content.js` – nový projekt stačí přidat sem
  (projekt s polem `showcase` se zobrazí jako velký 3D screenshot pod úvodem).
- Vstup aplikace: `src/main.jsx`
- Kompozice stránky: `Afroxik.com/src/App.jsx`
- Sekce: `Afroxik.com/src/components/sections/` (Hero, Showcase, Projects, About, Contact)
- Navigace, preloader, patička: `Afroxik.com/src/components/site/`
- Styly: `Afroxik.com/src/index.css` (čisté CSS, nezávislé na Tailwindu)
- Fonty: Doto (nadpisy) a Manrope (text), obojí včetně latin-ext kvůli české diakritice.

Projekt nepoužívá databázi ani serverový backend.

## Kočka „Dam dam didi didi“

Létající kamarád: `Afroxik.com/src/components/site/CatBuddy.jsx`, média v `Afroxik.com/public/media/`.
Video má zelené pozadí, které se klíčuje až v prohlížeči (WebGL shader), takže stačí jedno MP4.
Návštěvník kočku vypne tlačítkem s kočkou v navigaci.

Přegenerování videa z greenscreen šablony (1080p, kočka v oblasti x 992–1520, y 268–860):

```bash
ffmpeg -i damdamdidi.mp4 -an -vf "crop=576:640:968:244,scale=360:400:flags=lanczos,fps=30,format=yuv420p" \
  -c:v libx264 -preset slow -crf 27 -movflags +faststart Afroxik.com/public/media/damdam-cat.mp4
ffmpeg -ss 7.6 -i damdamdidi.mp4 -frames:v 1 \
  -vf "crop=576:640:968:244,scale=360:400:flags=lanczos,chromakey=0x01FC10:0.22:0.06,despill=type=green,format=yuva420p" \
  -c:v libwebp -q:v 88 Afroxik.com/public/media/damdam-cat.webp
```

Zvuk `Afroxik.com/public/media/damdam.m4a` je původní stopa (`videoplayback.m4a`).

## Výkon

- React, efekty a ostatní knihovny jsou rozdělené do cacheovatelných vendor chunků.
- Hlavní varianta automaticky omezuje náročné efekty na kompaktních displejích, coarse-pointer zařízeních a slabším hardwaru.
- Uživatel může ručně zvolit režim `Auto`, `High` nebo `Low` (přepínač je v navigaci).
- WebGL plasma se vykresluje jen v úvodní sekci; po odscrollování se pozastaví.
- Respektuje `prefers-reduced-motion`.
- Fonty a projektové obrázky se při buildu kopírují do správných veřejných cest.
