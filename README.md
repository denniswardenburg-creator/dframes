# DFRAMES.NL fotowebsite

De website staat klaar met een zijmenu voor 2018 tot en met 2026 en een fotoserie `2026 / IJsland`.

De getoonde foto's staan als webvriendelijke kopieën in `assets/photos/2026/ijsland/`. De grote originele bestanden in `2026/ijsland/` blijven ongemoeid.

Foto's toevoegen:

1. Plaats de webversie van de foto in `assets/photos/2026/ijsland/`.
2. Open `site-data.js`.
3. Voeg per foto een regel toe in `photos`, bijvoorbeeld:

```js
{
  src: "assets/photos/2026/ijsland/mijn-foto.jpg",
  title: "Zwarte kust",
  alt: "Zwarte kustlijn in IJsland"
}
```

Een website kan downloaden of opslaan niet volledig blokkeren, omdat de browser de afbeelding moet laden om hem te tonen. Deze site maakt eenvoudig opslaan wel lastiger door geen downloadlinks te tonen, slepen uit te zetten en rechtsklikken op de fotoweergave te blokkeren.
