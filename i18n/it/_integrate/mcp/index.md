---
layout: default
title: Server MCP
nav_order: 2
has_children: true
has_toc: false
permalink: /mcp/
translated_from: a5acf44b528914d81ce5c387c685d4fd41a0fdd6
---

# Server MCP
{: .no_toc }

Lascia che gli agenti di IA usino i tuoi moduli tramite il Model Context Protocol
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per amministratori e integratori: lascia che i client MCP elenchino, compilino e avviino moduli come l'utente di cui hanno il token.

AnsibleForms può servire un
server [Model Context Protocol](https://modelcontextprotocol.io), così che un client MCP, come
un backend di chat o un assistente dell'IDE, possa elencare i moduli che un utente può usare, determinarne i campi,
avviare job e seguirne l'avanzamento.

---

## Cos'è, e cosa non è

Il server MCP è un'interfaccia tecnica allo stesso flusso dei moduli usato dal browser. Gira
**come l'utente di cui riceve il token**: gli stessi ruoli dei moduli, la stessa visibilità dei job, gli
stessi controlli sulle extravars riservate di un invio dal browser.

Non aggiunge nessuna politica di IA propria. Se un agente debba chiedere conferma prima di un avvio,
quali moduli possa usare, o quante richieste possa fare, spetta al client MCP. Lo
strumento di avvio è contrassegnato come distruttivo, quindi un client ben fatto chiede prima conferma,
ma il server non lo impone.

---

## In questa sezione

Ogni argomento ha la sua pagina:

| Pagina | Cosa tratta |
|---|---|
| [Configurazione](setup.html) | Attiva il server e autentica il client |
| [Strumenti](tools.html) | Gli strumenti che un agente usa per compilare, approvare e rilanciare moduli |
| [Limitazioni](limitations.html) | Le espressioni eseguite sul server, e ciò che il server MCP non fa |
