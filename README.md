# DFRAMES.NL fotowebsite

De website staat klaar met een zijmenu voor 2018 tot en met 2026 en fotoseries voor onder andere `2026 / IJsland`, `2026 / Koningssteen`, `2026 / Maasduinen`, `2025 / Burgers' Zoo`, `2025 / Reigersbroek`, `2025 / Texel`, `2024 / Texel` en `2019 / Faroer`.

De getoonde foto's staan als webvriendelijke kopieen in `assets/photos/`. De grote originele bestanden in de jaargangen blijven ongemoeid.

Foto's toevoegen:

1. Plaats de webversie van de foto in de juiste map onder `assets/photos/`.
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




