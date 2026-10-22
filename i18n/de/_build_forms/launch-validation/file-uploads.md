---
layout: default
title: Datei-Uploads
parent: Start-Validierung
nav_order: 4
translated_from: 5756d90b62ddac51996f0bdb05befd6bf5589e0d
---

# Datei-Uploads
{: .no_toc }

Wie Dateifelder validiert werden
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Ein Dateifeld vertraut nie dem, was die Startanfrage über eine Datei sagt. Die Start-Validierung prüft die Datei selbst, auf der
Festplatte des Servers.

---

## Wie ein Upload zu einem Job gelangt

Eine Datei wird hochgeladen, bevor das Formular gestartet wird, in zwei Schritten:

1. Der Browser lädt die Datei mit `POST /api/v2/job/upload` hoch. Der Server speichert sie in `UPLOAD_PATH`.
2. Die Startanfrage beschreibt diesen Upload in ihrem Teil `files`.

Die Start-Validierung prüft dann die Beschreibung gegen die Festplatte:

* Die Datei muss innerhalb von `UPLOAD_PATH` existieren.
* Ihr Pfad und ihre Größe werden von der Festplatte gelesen, nie aus der Anfrage.

---

## Was akzeptiert wird

Ein Dateifeld erhält nur aus einem verifizierten Upload einen Wert. Alles andere wird verworfen:

* Ein Pfad, den der Aufrufer in `rawFormData` oder `extravars` schreibt, wird ignoriert.
* Ein Pflicht-Dateifeld ohne echten Upload wird als `missing` gemeldet.

---

## Dateiregeln

Die Regeln eines Dateifelds werden gegen den echten Upload geprüft, mit Größen in Bytes:

```yaml
- name: firmware
  type: file
  required: true
  maxSize: 104857600        # 100 MB
  regex:
    expression: '\.bin$'
    description: Upload a .bin firmware image
```

`minSize` und `maxSize` vergleichen die echte Größe der Datei, und `regex` ihren Dateinamen. Unabhängig von jedem Formular
begrenzt `UPLOAD_MAX_GB` die Größe eines einzelnen Uploads (standardmäßig 10 GB).
