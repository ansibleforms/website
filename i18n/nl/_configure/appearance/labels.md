---
layout: default
title: Labels
parent: Uiterlijk
nav_order: 6
redirect_from:
  - /appearance/environment.html
translated_from: 2b439f61976fc2cc161250c82c629ec40713ef2c
---

# Labels
{: .no_toc }

Labels naast het logo die aangeven welke instantie dit is
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## De lijst

Vanaf 7.3.0 bevat **Instellingen > Uiterlijk > Labels** meerdere labels naast het logo in de kopbalk, zoals PRODUCTION en EU:

| Kolom | Betekenis |
|---|---|
| **Ingeschakeld** | Of het label naast het logo en op de aanmeldpagina verschijnt |
| **Label** | De tekst ervan, getoond als het gekleurde pilletje in de kopbalk |

De rijen staan in de volgorde van de kopbalk. Een klik op een rij, of **Bewerken** in het menu van de rij, opent de pagina van het label; het menu van de rij heeft ook
**Inschakelen** of **Uitschakelen**, afhankelijk van wat van toepassing is, **Omhoog** en **Omlaag** om de volgorde te wijzigen, en **Verwijderen**.

De kopbalk en de aanmeldpagina tonen de ingeschakelde labels in hun volgorde. Boven de drie bevat een grijze **+N** de overige in zijn tooltip,
en een telefoon toont het eerste label en de **+N**. Een opgeslagen label verschijnt meteen in alle geopende browsers.

---

## Een label toevoegen

**Label toevoegen** opent een dialoogvenster met de twee velden van het label, beide verplicht:

| Veld | Betekenis |
|---|---|
| **Label** | De tekst van het label, zoals PRODUCTION |
| **Kleur** | Blauw, groen, oranjegeel, oranje, rood of grijs, als ronde stalen; eerst rood |

Een voorbeeld toont de kopbalk met alle ingeschakelde labels en het nieuwe terwijl het wordt getypt. Een nieuw label is ingeschakeld en komt na de
andere. De pagina ervan heeft één tabblad, **Details**, met dezelfde velden, de schakelaar **Ingeschakeld**, die meteen wordt opgeslagen, en het voorbeeld.

---

## Het omgevingslabel van 7.2

Tot en met 7.2 stelde **Instellingen > Uiterlijk > Omgeving** één label naast het logo in.

Met één label lezen PRODUCTION EU en PRODUCTION US allebei PRODUCTION wanneer meerdere instanties naast elkaar open staan. Vanaf 7.3.0
maakt de upgrade van dat label het eerste van de lijst, met zijn tekst, zijn kleur en of het werd getoond, en het oude adres
**Omgeving** opent de lijst.

---

## Labels in de configuratie-seed

Vanaf 7.3.0 declareert de [configuratie-seed](../seed/) labels in zijn sectie `labels`, elk met de tekst en optioneel de kleur:

```yaml
labels:
  items:
    - name: PRODUCTION
      color: red
    - name: EU
      color: blue
      enabled: true
      position: 2
```

`color` is een van `blue`, `green`, `amber`, `orange`, `red` of `grey`, en `position` bepaalt de volgorde, laagste eerst. Een label dat
in de seed is gedeclareerd, is op zijn pagina alleen-lezen, zoals elk [beheerd object](../seed/managed-objects.html).
