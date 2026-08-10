# Afrox web

Statické React portfolio s plasma pozadím a optimalizovanými glass panely.

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

- Společná statická data: `src/lib/content.js`
- Vstup aplikace: `src/main.jsx`
- Hlavní stránka: `Afroxik.com/src/App.jsx`

Projekt nepoužívá databázi ani serverový backend.

## Výkon

- React, efekty a ostatní knihovny jsou rozdělené do cacheovatelných vendor chunků.
- Hlavní varianta automaticky omezuje náročné efekty na kompaktních displejích, coarse-pointer zařízeních a slabším hardwaru.
- Uživatel může ručně zvolit režim `Auto`, `High` nebo `Low`.
- Fonty a projektové obrázky se při buildu kopírují do správných veřejných cest.
