---
layout: default
title: Contrasenyes
parent: Validació del llançament
nav_order: 5
translated_from: 2fc2d2e8cdd997efaf221bd8e0114df2a4ee873e
---

# Contrasenyes
{: .no_toc }

Com es validen, es desen i es mantenen fora de les API els camps de contrasenya
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Un camp de contrasenya es valida com qualsevol altre camp. Ara bé, el seu valor es queda al servidor i no es retorna mai a
cap client.

---

## On es desa una contrasenya

El servidor desa la contrasenya amb la tasca, a les seves extravars:

* Així, una **aprovació** pot continuar la tasca amb la contrasenya que ha introduït l'usuari.
* Un **rellançament tal com es va executar** la pot tornar a fer servir, quan la validació del llançament no és `enforce`.

La contrasenya desada només es fa servir al servidor.

---

## Què retornen les API

Cap API no retorna mai una contrasenya:

* Una tasca llegida a través de l'API REST o del `get_job` del servidor MCP emmascara tots els camps `password` del seu formulari, també dins de
  les files de llista i dels subformularis YAML.
* `MASK_EXTRAVARS_REGEX` (per defecte `password|secret|token`) també emmascara totes les extravars el nom de les quals hi coincideix, per als
  secrets que no són camps de contrasenya.

---

## Què rep un rellançament

Per emplenar per endavant un rellançament, el navegador rep les dades en brut del formulari de la tasca. Aquestes dades no contenen mai cap contrasenya, ni tan sols dins de
les files de llista o dels subformularis YAML, de manera que l'usuari torna a introduir la contrasenya.

Un camp de contrasenya que les dependències del formulari amaguen no és necessari, i no s'ha de tornar a introduir.
