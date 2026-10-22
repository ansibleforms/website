---
layout: default
title: Pujades de fitxers
parent: Validació del llançament
nav_order: 4
translated_from: 5756d90b62ddac51996f0bdb05befd6bf5589e0d
---

# Pujades de fitxers
{: .no_toc }

Com es validen els camps de fitxer
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Un camp de fitxer no es fia mai del que diu la petició de llançament sobre un fitxer. La validació del llançament comprova el fitxer mateix, al
disc del servidor.

---

## Com arriba una pujada a una tasca

Un fitxer es puja abans de llançar el formulari, en dos passos:

1. El navegador puja el fitxer amb `POST /api/v2/job/upload`. El servidor el desa a `UPLOAD_PATH`.
2. La petició de llançament descriu aquesta pujada a la seva part `files`.

Després, la validació del llançament compara la descripció amb el disc:

* El fitxer ha d'existir dins d'`UPLOAD_PATH`.
* El seu camí i la seva mida es llegeixen del disc, mai de la petició.

---

## Què s'accepta

Un camp de fitxer només obté un valor d'una pujada verificada. Qualsevol altra cosa es descarta:

* Un camí que qui fa la crida escrigui a `rawFormData` o a `extravars` s'ignora.
* Un camp de fitxer obligatori sense una pujada real es notifica com a `missing`.

---

## Regles de fitxer

Les regles d'un camp de fitxer es comproven amb la pujada real, amb les mides en bytes:

```yaml
- name: firmware
  type: file
  required: true
  maxSize: 104857600        # 100 MB
  regex:
    expression: '\.bin$'
    description: Upload a .bin firmware image
```

`minSize` i `maxSize` comparen la mida real del fitxer, i `regex`, el seu nom. Independentment de qualsevol formulari,
`UPLOAD_MAX_GB` limita la mida d'una sola pujada (10 GB per defecte).
