---
layout: default
title: Caricamento di file
parent: Validazione all'avvio
nav_order: 4
translated_from: 5756d90b62ddac51996f0bdb05befd6bf5589e0d
---

# Caricamento di file
{: .no_toc }

Come vengono validati i campi file
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Un campo file non si fida mai di ciò che la richiesta di avvio dice su un file. La validazione all'avvio controlla il file stesso, sul
disco del server.

---

## Come un file caricato arriva a un job

Un file viene caricato prima che il modulo venga avviato, in due passi:

1. Il browser carica il file con `POST /api/v2/job/upload`. Il server lo salva in `UPLOAD_PATH`.
2. La richiesta di avvio descrive quel caricamento nella sua parte `files`.

La validazione all'avvio confronta poi la descrizione con il disco:

* Il file deve esistere dentro `UPLOAD_PATH`.
* Percorso e dimensione vengono letti dal disco, mai dalla richiesta.

---

## Cosa viene accettato

Un campo file riceve un valore solo da un caricamento verificato. Tutto il resto viene scartato:

* Un percorso che il chiamante scrive in `rawFormData` o `extravars` viene ignorato.
* Un campo file obbligatorio senza un caricamento reale viene segnalato come `missing`.

---

## Regole dei file

Le regole di un campo file vengono controllate sul caricamento reale, con le dimensioni in byte:

```yaml
- name: firmware
  type: file
  required: true
  maxSize: 104857600        # 100 MB
  regex:
    expression: '\.bin$'
    description: Upload a .bin firmware image
```

`minSize` e `maxSize` confrontano la dimensione reale del file, e `regex` il suo nome. Indipendentemente da qualsiasi modulo,
`UPLOAD_MAX_GB` limita la dimensione di un singolo caricamento (10 GB per impostazione predefinita).
