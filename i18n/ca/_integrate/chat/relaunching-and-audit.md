---
layout: default
title: Rellançament i auditoria
parent: Assistent de xat
nav_order: 4
translated_from: b7d416fbf35e98de81e41ee53ba0d2ff9040fea0
---

# Rellançament i auditoria
{: .no_toc }

Rellançar des del xat, la traça d'auditoria i les limitacions
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Rellançament

Una petició com ara "Torna a executar la tasca 1234" (l'usuari ha d'escriure l'ID de la tasca) previsualitza un rellançament
amb les mateixes regles que `relaunch_job` del servidor MCP, inclosa la regla de contrasenyes de la
[validació del llançament](../launch-validation), i mostra un resum **Rellança**; el botó
el llança una vegada. "Torna a executar la tasca 1234 amb el servidor web02" només canvia aquest camp.

---

## Auditoria

Cada llançament des del xat es registra com a **chat.launch** amb l'usuari, la tasca, el formulari,
el proveïdor i el hash del payload del resum que es va aprovar. Els canvis a la configuració del xat es
registren com qualsevol altre canvi de configuració.

---

## Limitacions

L'assistent de xat encara no fa tot el que fa un navegador:

- Els **formularis d'assistent (wizard)** no hi poden participar (`enableForChat` s'hi rebutja), ni tampoc
  els camps que l'assistent no emplena: contrasenyes i pujades de fitxers.
- Les respostes arriben d'una sola peça; encara no s'admet el streaming.
- El model pot entendre malament una petició. La targeta de resum mostra exactament què s'enviarà;
  revisa-la abans de fer clic a **Llança**.
