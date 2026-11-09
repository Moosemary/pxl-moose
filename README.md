# pxl moose

Ett retro-plattformsspel i 2D, i stil med Super Mario Bros, där du styr en pixlig älg genom den svenska skogen.

**Spela:** https://moosemary.github.io/pxl-moose/

Allt körs i webbläsaren. All grafik och allt ljud skapas med kod (canvas och Web Audio) – det finns inga bild- eller ljudfiler. Loggan, med spelets älg, ritas också med kod. Det enda externa är typsnittet (se nedan).

## Så spelar du

Älgen springer åt höger genom skogen och kameran följer efter. Ta dig hela vägen till flaggan i slutet av banan.

| Handling | Tangenter |
|---|---|
| Gå vänster / höger | ← → eller A D |
| Hoppa (och simma uppåt) | Mellanslag eller ↑ |
| Starta, fortsätta | Mellanslag eller Enter |
| Paus | P eller Esc |
| Ljud av/på | M |
| Felsökning (uppdateringar per sekund) | F3 |

- Du har **tre liv**. Poäng och liv syns hela tiden. Är livena slut blir det **MOOSE OVER**, och du kan börja om.
- Du får **ett extraliv för var 500:e poäng**.
- **Rösen** (stenhögar med flagga) är kontrollpunkter. Ramlar du i ett hål börjar du om vid det senaste röset.

### Mat som ger poäng
Saftiga kvistar av sälg och vide (10), granskott (15) och blåbärsris (25). På kalhyggena finns mest mat.

### Farorna
- **Hål** i marken – ramlar du ner förlorar du ett liv.
- **Björnar och vargar** går fram och tillbaka. Hoppa på dem så försvinner de, men går du in i dem förlorar du ett liv.
- **Jägare i jakttorn** står stilla och skjuter när du kommer inom synhåll. På kalhyggena ser de dig på mycket längre håll, så använd stenarna som skydd. Rakt under tornet är du säker.
- **Jakthund med jägare:** går du in i hunden skäller den och du blir förlamad en stund, och då kan jägaren skjuta. Hoppa på hunden i stället!
- **Bilar, bussar och tåg** är alltid farliga. Vänta in ett glapp i trafiken, och tänk på att rälsens ljus blinkar innan tåget kommer.
- Älgen kan **simma**: håll hoppknappen för att simma uppåt, och tryck på den igen vid ytan för att hoppa upp på land. Den kan inte klättra i träd.

## Rita om banan

Banan ligger i [`src/level.js`](src/level.js) som ett rutnät av tecken, där varje tecken är en ruta. Överst i filen förklaras alla tecken (mark, stenar, vatten, väg, räls, mat, fiender, jägare, tåg, kontrollpunkter, start och mål). Ändra filen och ladda om sidan.

Miljöerna (granskog, lövskog, kalhygge, vattendrag och vägen) anges som kolumnintervall längst ned i samma fil, och styr både utseende och hur långt jägarna ser.

Några värden som är lätta att justera:

- Extraliv, antal liv: [`src/config.js`](src/config.js)
- Hopp, fart och simning: överst i [`src/player.js`](src/player.js)
- Färger på landskapet: överst i [`src/backdrop.js`](src/backdrop.js)

## Bygga själv

Du behöver [Node.js](https://nodejs.org/).

```bash
npm install
npm run dev      # startar spelet lokalt
npm run build    # bygger till dist/
```

Tekniskt är det Vite och vanlig JavaScript, ritat på en `<canvas>`, utan spelmotor och utan React. Spelet uppdateras i ett fast tidssteg (60 gånger per sekund), så det går lika fort på alla skärmar.

## Publicering

Varje push till `main` bygger och publicerar spelet på GitHub Pages med GitHub Actions (se `.github/workflows/deploy.yml`). Under *Settings → Pages* ska *Source* vara *GitHub Actions*.

## Typsnitt och logga

Texten använder pixeltypsnittet [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) (SIL Open Font License 1.1). Fontfilen ligger i repot (`src/fonts/`, tillsammans med licenstexten), så ingenting hämtas från Google när någon spelar. Typsnittet saknar versalt Å (det ritas som ett vanligt A), så undvik det i versaler. Gemena å, ä, ö och versalerna Ä och Ö fungerar.

Loggan ritas i [`src/logo.js`](src/logo.js) och används både på startskärmen och i sidhuvudet. Sidans footer ("Made by Moosemary Digital") ligger i [`index.html`](index.html).

## Kodöversikt

| Fil | Innehåll |
|---|---|
| `src/main.js` | Start, ritning och skalning |
| `src/game.js` | Spelets tillstånd, poäng, liv, kontrollpunkter |
| `src/player.js` | Älgens rörelse, hopp och simning |
| `src/enemies.js`, `src/hunters.js`, `src/traffic.js` | Fiender, jägare, bilar och tåg |
| `src/level.js`, `src/levelParser.js` | Banan och hur den läses |
| `src/backdrop.js`, `src/tiles.js`, `src/mooseSprite.js`, `src/foodSprites.js` | Grafik |
| `src/audio.js` | Ljud |
| `src/text.js`, `src/logo.js`, `src/fonts/` | Text, logga och typsnitt |
