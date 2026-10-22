---
layout: default
title: Bestandsuploads
parent: Launch-validatie
nav_order: 4
translated_from: 5756d90b62ddac51996f0bdb05befd6bf5589e0d
---

# Bestandsuploads
{: .no_toc }

Hoe bestandsvelden worden gevalideerd
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Een bestandsveld vertrouwt nooit wat het startverzoek over een bestand zegt. Launch-validatie controleert het bestand zelf, op de
schijf van de server.

---

## Hoe een upload bij een job komt

Een bestand wordt geüpload voordat het formulier wordt gestart, in twee stappen:

1. De browser uploadt het bestand met `POST /api/v2/job/upload`. De server slaat het op in `UPLOAD_PATH`.
2. Het startverzoek beschrijft die upload in zijn deel `files`.

Launch-validatie controleert daarna de beschrijving tegen de schijf:

* Het bestand moet binnen `UPLOAD_PATH` bestaan.
* Het pad en de grootte worden van de schijf gelezen, nooit uit het verzoek.

---

## Wat wordt geaccepteerd

Een bestandsveld krijgt alleen een waarde uit een geverifieerde upload. Al het andere wordt genegeerd:

* Een pad dat de aanroeper in `rawFormData` of `extravars` schrijft, wordt genegeerd.
* Een verplicht bestandsveld zonder echte upload wordt gemeld als `missing`.

---

## Bestandsregels

De regels van een bestandsveld worden gecontroleerd tegen de echte upload, met groottes in bytes:

```yaml
- name: firmware
  type: file
  required: true
  maxSize: 104857600        # 100 MB
  regex:
    expression: '\.bin$'
    description: Upload a .bin firmware image
```

`minSize` en `maxSize` vergelijken de echte grootte van het bestand, en `regex` de bestandsnaam. Los van elk formulier
begrenst `UPLOAD_MAX_GB` de grootte van één upload (standaard 10 GB).
