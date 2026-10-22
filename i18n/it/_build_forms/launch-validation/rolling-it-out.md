---
layout: default
title: Messa in produzione
parent: Validazione all'avvio
nav_order: 7
translated_from: 399d39dbea694518926bcc20099d19438cbbac29
---

# Messa in produzione
{: .no_toc }

Portare un'istanza in enforce, e le limitazioni note
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Messa in produzione

`enforce` è il valore predefinito. Su un'istanza con script o altri sistemi che avviano moduli via
REST, arrivaci per gradi, osservando il log prima di rifiutare qualcosa:

1. Imposta `LAUNCH_VALIDATION=log` per l'intera istanza (prima di aggiornare, in caso di aggiornamento).
2. Lavora in questa modalità per un po' ed esamina il log: gli avvisi `would refuse` indicano avvii
   che violano le regole; gli avvisi `extravars differ` indicano moduli che calcolano qualcosa
   in modo diverso sul server (un timestamp, dati esterni). Decidi per ogni modulo se la cosa
   conta.
3. Passa quei moduli a `launchValidation: enforce`. I chiamanti che inviavano valori non validi o
   extravars inventate ora ricevono un `422` con il motivo.
4. Quando ogni modulo si comporta come previsto, rimuovi `LAUNCH_VALIDATION` (o impostalo a `enforce`) per l'intera istanza.

---

## Limitazioni

La validazione all'avvio non copre ancora tutto:

- I **moduli wizard** non si possono rilanciare con modifiche, e un job wizard avviato prima della 7.0
  non si può rilanciare con `enforce` (non salvava i valori dei suoi passi). Il server MCP
  non può avviare moduli wizard.
- La **risoluzione dei segnaposto** nel browser usa ancora una propria copia del codice del server; in
  rari casi limite (`__undefined__`, apici dentro le espressioni) i due potrebbero risolvere un
  segnaposto in modo diverso. `log` rivela queste differenze.
- Le espressioni **`runLocal`** girano nel motore JavaScript del browser nel browser e in una
  sandbox sul server; lo stesso codice produce lo stesso risultato, tranne quando dipende dal
  fuso orario o dalle impostazioni locali del browser.

---

## Moduli wizard

Un [wizard](../forms/wizard.html) viene controllato passo per passo: il browser invia i valori di
ogni passo, e il server controlla ogni passo che l'utente invierebbe rispetto al suo sottomodulo.

- Un passo viene escluso quando è `optional` e l'utente l'ha saltato, oppure quando il suo `when` è falso.
- Un passo legge i passi precedenti tramite `$(__parent__.<step>.<field>)`, con i loro valori controllati.
- Gli errori indicano il passo e il campo, come `<step>.<field>`.
- Con `enforce`, le extravars vengono costruite sul server, ogni passo sotto il suo `defaultModel`.
- I campi file non sono supportati in un wizard.
