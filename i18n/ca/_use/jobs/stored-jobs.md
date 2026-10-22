---
layout: default
title: Tasques desades
parent: Tasques
nav_order: 5
redirect_from:
  - /schedules/stored-jobs.html
translated_from: c4e55de429d31936d8735965a2f487c070b9140d
---

# Tasques desades
{: .no_toc }

Guarda les dades d'un formulari per tornar-les a carregar més tard
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Tasques desades

Les tasques desades guarden els valors d'un formulari perquè els puguis tornar a carregar, en lloc d'omplir els mateixos camps cada vegada.

Per desar, omple el formulari, obre el desplegable que hi ha al costat d'**Envia** i tria **Desa**. A **Desa les dades del formulari**, introdueix un
**Nom**, una **Descripció** opcional i una data a **Caduca el (opcional)**, i desa. Els camps de contrasenya i de constant
no es desen mai. Un subformulari té la mateixa acció **Desa** al costat del seu botó per desar, i guarda els valors inacabats sense
validar-los.

Per carregar, selecciona **Carrega des de les desades** a la part superior del formulari. **Carrega un formulari desat** mostra les teves tasques desades per a aquest formulari, amb
les seves dates de creació i de caducitat; selecciona'n una per omplir el formulari amb els seus valors. No s'executa res fins que l'envies.

Les tasques desades es guarden a la base de dades d'AnsibleForms (taula `stored_jobs`), amb el nom del formulari, el teu usuari com a
`<type>/<username>` (per exemple `local/admin`) i els valors en JSON. Un nom ha de ser únic per usuari i formulari; desar-ne
un segon amb el mateix nom falla amb "A saved form with this name already exists".

---

## Gestionar les tasques desades

La pàgina **Tasques desades** mostra les tasques desades amb el seu formulari, l'usuari i les dates de creació i de caducitat, i necessita `allowStoredJobs`.

- **Edita** obre la pàgina pròpia de la tasca desada: els seus **Detalls** (nom, formulari, caducitat) i els seus **Valors**, els valors
  dels camps desats en YAML, que s'hi poden canviar i desar.
- **Obre al formulari** obre el seu formulari amb els valors desats emplenats; no s'executa res fins que l'envies.
- **Suprimeix** l'elimina. Pots suprimir les teves pròpies tasques desades; els usuaris amb `showSettings` en poden suprimir qualsevol.
- Les tasques desades amb una data a **Caduca el** ja passada se suprimeixen automàticament cada dia a les 04:00 (a `LOG_TZ`).
