---
layout: default
title: Tasques desades
parent: Tasques
nav_order: 5
redirect_from:
  - /schedules/stored-jobs.html
translated_from: c3ccb3044f19e33eaa03668524bd617b0af6c033
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
**Nom**, una **Descripció** opcional i quan s'elimina a **Eliminat** (consulta [Quan s'elimina](#when-it-is-removed)), i desa. Els camps de contrasenya
i de constant no es desen mai. Un subformulari té la mateixa acció **Desa** al costat del seu botó per desar, i guarda els valors inacabats sense
validar-los.

Per carregar, selecciona **Carrega des de les desades** a la part superior del formulari. **Carrega un formulari desat** mostra les teves tasques desades per a aquest formulari, amb
les seves dates de creació i de caducitat; selecciona'n una per omplir el formulari amb els seus valors. No s'executa res fins que l'envies.

Les tasques desades es guarden a la base de dades d'AnsibleForms (taula `stored_jobs`), amb el nom del formulari, el teu usuari com a
`<type>/<username>` (per exemple `local/admin`) i els valors en JSON. Un nom ha de ser únic per usuari i formulari; desar-ne
un segon amb el mateix nom falla amb "A saved form with this name already exists".

---

## Gestionar les tasques desades

La pàgina **Tasques desades** mostra les tasques desades amb el seu formulari, l'usuari i les dates de creació i de caducitat, i necessita `allowStoredJobs`.

Des de la 7.6.0 `allowStoredJobs` sol obre **Tasques > Desades** i **Afegeix una tasca desada**, que abans també necessitaven `showSettings`
o `allowScheduledJobs`. La seva llista **Formulari** ofereix els formularis que obren els teus rols; els usuaris amb `showSettings` o amb
`allowScheduledJobs` hi tenen tots els formularis, sense cap límit de rol.

Des de la 7.7.0 la llista té una columna ordenable **Últim ús**, que separa les tasques desades en ús de les abandonades.

- **Edita** obre la pàgina pròpia de la tasca desada: els seus **Detalls** (nom, descripció, formulari, usuari, quan es va crear i fer servir per
  última vegada, i quan s'elimina), els seus **Valors**, els valors dels camps desats en YAML, que s'hi poden canviar i desar, i les seves **Execucions**.
- **Obre al formulari** obre el seu formulari amb els valors desats emplenats; no s'executa res fins que l'envies.
- **Suprimeix** l'elimina. Pots suprimir les teves pròpies tasques desades; els usuaris amb `showSettings` en poden suprimir qualsevol.

---

## Últim ús i execucions

Des de la 7.7.0 una tasca desada registra el seu últim ús i les tasques llançades des d'ella, per veure quines es fan servir.

Aquests llançaments compten com un ús d'una tasca desada:

| Llançament | Quan compta |
|---|---|
| El formulari obert des d'ella (**Obre al formulari**), o emplenat amb **Carrega des de les desades** | Quan es llança la tasca |
| **Executa més tard** des d'aquest formulari | Quan s'executa la tasca planificada, no quan es planifica |
| Un **rellançament** d'una tasca llançada des d'ella | Quan comença el rellançament, amb els mateixos valors o amb uns altres |
| `launch_job` o `plan_job` de l'MCP amb ella | Com a dalt |

Les execucions d'una programació no compten mai, ni tan sols les d'una creada a partir d'una tasca desada: una programació guarda la seva pròpia
còpia dels valors. Un llançament només compta si l'usuari pot veure la tasca desada; si s'ha suprimit o amagat des de llavors, s'omet i la tasca
s'executa igualment.

La pàgina de la tasca indica la tasca desada des de la qual es va llançar, amb un enllaç, quan la pots veure. La pestanya **Execucions** de la pàgina
de la tasca desada mostra les tasques llançades des d'ella que pots veure, amb el seu estat, inici, final i durada.

---

## Quan s'elimina

Cada tasca desada indica quan s'elimina: mai, en una data o quan fa uns dies que no es fa servir.

| Opció | Què fa |
|---|---|
| **Mai** | La conserva fins que algú la suprimeix. No s'ofereix mentre `STORED_JOB_UNUSED_DAYS` està definida |
| **En una data** | L'elimina en aquella data |
| **Si no es fa servir en N dies** | L'elimina quan fa aquests dies que no s'ha llançat cap tasca des d'ella |

Un administrador pot definir [`STORED_JOB_UNUSED_DAYS`](../customization/retention.html#env_STORED_JOB_UNUSED_DAYS)
(Configuració > General > Retenció). Llavors elimina totes les tasques desades que fa aquests dies que no es fan servir, els dies propis d'una tasca
desada només poden ser menys, el diàleg de **Desa** comença amb aquests dies, i una que s'elimina en una data també s'elimina quan passa aquest temps
sense fer-se servir. Els dies compten des de l'últim ús o, per a una tasca desada que no s'ha fet servir mai, des que es va desar. El seu valor per
defecte, 0, no elimina mai cap tasca desada pel fet de no fer-se servir.

Les tasques desades s'eliminen cada dia a les 04:00 (a `LOG_TZ`), quan arriba el primer de la seva data o dels seus dies.
