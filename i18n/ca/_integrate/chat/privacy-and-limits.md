---
layout: default
title: Privadesa i límits
parent: Assistent de xat
nav_order: 3
translated_from: d29279a71f7aaa5553602f5a463132c842600690
---

# Privadesa i límits
{: .no_toc }

Què surt de la xarxa, i els límits per usuari
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Què surt de la xarxa

Dels formularis que hi participen, s'envia al proveïdor el següent:

- els noms i les descripcions dels formularis, les etiquetes dels camps, els textos d'ajuda, les opcions i els valors que s'estan
  emplenant;
- la conversa.

El següent no s'envia mai al proveïdor, a la pàgina ni al registre:

- les contrasenyes (l'usuari les introdueix al navegador), les credencials desades i la clau d'API;
- la sortida d'una tasca, i les seves extravars desades (l'assistent només llegeix l'estat d'una tasca, i només
  quan **Deixa que l'assistent segueixi els seus jobs** està activat a la configuració).

Tot el que hi ha sota una clau que sembla un secret (`password`, `secret`, `token`, `api_key`, ...)
s'emmascara abans que el model o la pàgina ho vegin.

Per mantenir les dades dels formularis a casa, fes servir el teu propi tenant (Azure OpenAI) o un model local (Ollama), no una API pública.

---

## Límits

Els límits següents es defineixen a la pàgina de configuració:

- **Missatges per conversa** (20) - després dels quals l'usuari ha de començar una conversa nova.
- **Rondes d'eines per missatge** (6) - quantes vegades pot cridar el model una eina abans de respondre.
- **Temps d'espera** (60 s) - per crida al proveïdor.

Els límits següents són fixos: un missatge alhora per conversa, com a màxim 4000 caràcters per missatge, 60 missatges per
usuari i hora, i 5 converses per usuari. Una conversa es descarta després de 2 hores sense cap missatge.

Una targeta de resum amb un botó **Llança** es pot fer servir una sola vegada, i caduca al cap de 15 minuts: aleshores Llança respon que el
resum ha caducat, i l'usuari en demana un de nou a l'assistent. Les converses i els resums es guarden a la memòria, així que després
d'un reinici l'usuari ha de començar una conversa nova.
