# Menú d'apps

Llançador de les meves aplicacions: Notícies, El Temps, Jocs, Economia i Vídeos.
Una sola pàgina estàtica (`index.html`), sense build ni dependències, instal·lable al mòbil (PWA).

## Afegir una app
1. Copia la icona de 192 px de l'app a `icones/` (p. ex. `icones/nova.png`).
2. Afegeix-la a la llista `APPS` del principi del `<script>` d'`index.html` (nom, descripció, URL, icona, color).
3. Afegeix la icona a `SHELL` de `sw.js` i puja la versió de `CACHE`.

## Fitxers
- `index.html` — la pàgina.
- `manifest.json`, `sw.js` — PWA (funciona sense connexió).
- `icon.svg`, `icon-192.png`, `icon-512.png` — icona del menú. Els PNG es fan amb `node genera-icones.js`.
- `icones/` — icones de cada app (còpies de les de cada projecte).
