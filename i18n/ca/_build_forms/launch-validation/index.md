---
layout: default
title: Validació del llançament
nav_order: 4
has_children: true
has_toc: false
permalink: /launch-validation/
translated_from: 6b86704480781edc0ab1c24c25993fc2e220abf3
---

# Validació del llançament
{: .no_toc }

Comprova al servidor cada llançament d'un formulari
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per a administradors i autors de formularis: fes que el servidor comprovi cada llançament, les seves regles i les seves extravars, l'enviï qui l'enviï.

La comprovació s'aplica sigui qui sigui o sigui el que sigui que llanci el formulari: el navegador, un script que crida l'API REST
o un agent d'IA a través del servidor MCP.

---

## Per què existeix

Les regles d'un formulari (`required`, `regex`, `minValue`, `sameAs`, ...) sempre s'han comprovat
al navegador. Després, el navegador envia dues coses a `POST /api/v2/job`:

- `rawFormData`: els valors dels camps tal com els ha omplert l'usuari;
- `extravars`: el que rep el playbook, construït al navegador a partir d'aquests valors.

Sense la validació del llançament, el servidor es fia de totes dues. Qualsevol persona amb un token vàlid pot cridar aquest
punt final directament i enviar-hi qualsevol extravar, sense que s'apliqui cap regex, camp obligatori ni regla de
llista. Per a un formulari que només es fa servir al navegador, això pot ser acceptable; per a un
formulari que altres sistemes llancen per REST, vol dir que les regles del formulari no s'apliquen en absolut.

A més, el servidor no té manera de distingir una petició del navegador d'una enviada per un
script: totes dues fan servir el mateix punt final, el mateix token i el mateix cos, i els usuaris poden modificar
qualsevol petició que enviï el seu propi navegador. Només es pot confiar en una comprovació feta al servidor, i la validació
del llançament és aquesta comprovació.

---

## Les tres vies d'entrada

La manera com es valida un llançament depèn de per on arriba i del mode de validació del llançament:

| Llançat per | Validat | Extravars amb què s'executa la tasca |
|---|---|---|
| **Servidor MCP** (agent d'IA) | sempre, al servidor | sempre construïdes pel servidor |
| **Navegador** o **API REST**, validació del llançament `off` | només al navegador | les que ha enviat el navegador (o qui fa la crida) |
| **Navegador** o **API REST**, validació del llançament `log` | al servidor, els rebuigs només es registren | les enviades; les diferències es registren |
| **Navegador** o **API REST**, validació del llançament `enforce` | al servidor, es rebutja si no és vàlid | **construïdes pel servidor** |

El navegador, el servidor MCP i la validació del llançament fan servir el mateix codi per a les regles (el
motor de formularis compartit): les mateixes regles, en el mateix ordre i amb els mateixos missatges. Un error que
mostra el navegador, el servidor el rebutja amb el mateix text.

---

## En aquesta secció

Cada tema té la seva pròpia pàgina:

| Pàgina | Què tracta |
|---|---|
| [Activar-la](switching-it-on.html) | Per a tota la instància, o per a un formulari |
| [Registrar i aplicar](log-and-enforce.html) | Què fa cada mode amb un llançament que incompleix les regles |
| [Files de llista](list-rows-and-subforms.html) | Com es validen les files dels camps list |
| [Pujades de fitxers](file-uploads.html) | Com es validen els camps de fitxer |
| [Contrasenyes](passwords.html) | Com es validen els camps de contrasenya i com es mantenen fora de les API |
| [Rellançament](relaunching.html) | Com es valida una tasca rellançada |
| [Desplegar-la](rolling-it-out.html) | Passar una instància a enforce, i les limitacions conegudes |
