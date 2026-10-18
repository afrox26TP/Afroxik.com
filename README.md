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

- Texty v češtině a angličtině: `Afroxik.com/src/lib/i18n.js`. Jazyk se poprvé vybere podle prohlížeče,
  přepínač CZ/EN je v navigaci a volba se pamatuje. Anglická verze má adresu `/en`.
- Kontakty a toolbox: `Afroxik.com/src/lib/content.js`
- Projekty: veřejná repa z GitHubu, prohlížeč je načítá přes GitHub API (bez tokenu, s 10min cache v localStorage).
  Název, popis, jazyk, topics, web (pole Website) a čas posledního pushe se berou z GitHubu. Stránka na GitHub
  nečeká: hned ukáže projekty z minulé návštěvy a čerstvé doplní, až dorazí. V `content.js` jde repo skrýt (`hiddenRepos`),
  přidat repo z cizího účtu (`extraRepos`), doplnit web, který GitHub nemá (`homepages`), a vybrat to, které se ukáže jako velký 3D screenshot
  pod úvodem (`featured`).
- Meta tagy a náhled pro sdílení odkazu: `index.html` a `Afroxik.com/public/og-image.jpg` (1200×630).
  Anglickou kopii pro `/en` (`en.html`) vyrobí build podle `englishMeta` ve `vite.config.js`.
- Vstup aplikace: `src/main.jsx`
- Kompozice stránky: `Afroxik.com/src/App.jsx`
- Sekce: `Afroxik.com/src/components/sections/` (Hero, Showcase, Projects, About, Contact)
- Navigace, preloader, patička: `Afroxik.com/src/components/site/`
- Styly: `Afroxik.com/src/index.css` (čisté CSS, nezávislé na Tailwindu)
- Fonty: Doto (nadpisy) a Manrope (text), obojí včetně latin-ext kvůli české diakritice.

Projekt nepoužívá databázi ani serverový backend.

## Hra v prohlížeči

Ročníková práce (RP-2025-26) běží na `/play/` přímo z tohoto webu. Cloudflare bere soubory do 25 MiB a `index.wasm`
z Godotu má přes 35 MB, proto jsou `index.wasm` a `index.pck` zabalené gzipem a `index.html` hry má navíc skript,
který je v prohlížeči rozbalí dřív, než si je Godot načte (`DecompressionStream`, prohlížeče od roku 2023).

Nová verze hry: v Godotu exportuj preset Web (Thread Support vypnuté, soubor pojmenuj `index.html`) a pak:

```bash
node Afroxik.com/scripts/import-game.mjs "C:/cesta/k/exportu" "European Sidequest"
```

Skript složku `Afroxik.com/public/play/` vyprázdní, zabalí oba velké soubory, zkopíruje zbytek, vloží rozbalovací skript
a nastaví titulek. Zabalené soubory mají v adrese verzi (`?v=`), takže se nikdy nesejdou se starou verzí z cache.
Tlačítko „Hrát v prohlížeči“ v showcase bere adresu z `featured.play` v `content.js`.

## Kočka „Dam dam didi didi“

Létající kamarád: `Afroxik.com/src/components/site/CatBuddy.jsx`, média v `Afroxik.com/public/media/`.
Video má zelené pozadí, které se klíčuje až v prohlížeči (WebGL shader), takže stačí jedno MP4.
Tlačítkem s kočkou v navigaci ji návštěvník schová: odletí do loga a tancuje tam. Když lítá venku,
je v logu jen její šedá silueta (`SiteNav.jsx`, `.brand__home`).
Stejná kočka je i favicon: `Afroxik.com/public/favicon.ico` (hlava, 16/32/48 px) a `apple-touch-icon.png` (180 px).

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
- Cache nastavuje `Afroxik.com/public/_headers`: soubory z buildu (`/assets/*`, s hashem v názvu) rok,
  fonty, obrázky a média měsíc. Když takový soubor vyměníš, dej mu nový název, jinak ho návštěvníci uvidí až za měsíc.
- Preloader se ukáže jen při první návštěvě v záložce, při dalším načtení se jde rovnou na web.
- Showcase je vidět hned (screenshot je lokální, v mobilní velikosti od 720 px), popis a tagy doplní GitHub.
- Hlavní varianta automaticky omezuje náročné efekty na kompaktních displejích, coarse-pointer zařízeních a slabším hardwaru.
- Uživatel může ručně zvolit režim `Auto`, `High` nebo `Low` (přepínač je v navigaci).
- WebGL plasma se vykresluje jen v úvodní sekci; po odscrollování se pozastaví.
- Respektuje `prefers-reduced-motion`.
- Fonty a projektové obrázky se při buildu kopírují do správných veřejných cest.
