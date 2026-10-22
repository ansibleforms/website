---
layout: default
title: Permessi
parent: Il tuo profilo
nav_order: 4
translated_from: 08770187a1159539d1d450cf7dddf80c6943cfed
---

# Permessi
{: .no_toc }

Cosa ti permettono di fare i tuoi ruoli
{: .fs-6 .fw-300 }

---

Le opzioni di ruolo sono raggruppate in schede, ognuna con il numero di opzioni che hai, come `5/8`:

| Scheda | Opzioni relative a |
|---|---|
| **Accesso e integrazioni** | L'accesso, l'assistente chat, il server MCP, il caricamento di file e i token API |
| **Designer** | Aprire il designer, e modificare moduli, playbook, workflow, inventari e file di variabili |
| **Job** | Vedere i job e le loro extravars o artefatti, rilanciare, eliminare, pianificare e salvare job |
| **Impostazioni** | Le pagine delle impostazioni, i log, il registro di audit e i backup |
| **Altro** | Un'opzione impostata a mano in un ruolo che non rientra in nessun'altra scheda; sempre l'ultima scheda |

Le altre schede sono in ordine alfabetico. Ogni scheda è una tabella con le colonne **Impostazione** (l'opzione), **Descrizione**
(cosa fa) e **Il tuo accesso**: **Consentito** o **Non consentito**. Un'opzione che vale a causa di un'altra lo dice
sotto la sua descrizione: **Incluso in** un'opzione che hai la attiva, e **Richiede** un'opzione che non hai la tiene disattivata.

Le opzioni vengono dalle `options` dei tuoi ruoli in `config.yaml`; la pagina [Ruoli](../config/roles.html) spiega come
si combinano.
