---
layout: default
title: API REST
nav_order: 3
has_children: true
has_toc: false
permalink: /api/
translated_from: e14092fbd301073c7ed9be6839530efae43d4c6b
---

# API REST
{: .no_toc }

Avvia moduli e gestisci AnsibleForms dagli script
{: .fs-6 .fw-300 }

---

Per sviluppatori e automation engineer: avvia moduli e gestisci AnsibleForms dagli script.

Tutto ciò che fa l'interfaccia web passa dall'API REST, quindi script e altri strumenti possono fare lo stesso.

---

## Panoramica

L'API è servita sotto `/api/v2` sul server di AnsibleForms:

* **Riferimento completo** : queste pagine trattano ciò che gli script usano di più. Ogni endpoint è descritto, e si può provare, nella
  pagina Swagger integrata del server, `https://<your server>/api/v2/docs`.
* **Permessi** : una chiamata viene eseguita come l'utente di cui porta il token, con i ruoli di quell'utente, come nel browser.
* **Validazione all'avvio** : i job avviati tramite l'API possono essere controllati come gli avvii dal browser
  (vedi [Validazione all'avvio](../launch-validation/)).
* **Limiti di frequenza** : sono limitati solo gli endpoint di login, logout, rinnovo del token e single sign-on, il cambio password
  (`PUT /api/v2/profile`) e gli endpoint dei token API (`POST` e `DELETE /api/v2/profile/tokens`) (vedi
  [Autenticazione](authentication.html)). Le altre chiamate non hanno limiti di frequenza (l'[assistente chat](../chat/) ha limiti
  propri), quindi uno script dovrebbe regolare da sé il proprio ritmo, per esempio quando segue un job.

---

## In questa sezione

Ogni argomento ha la sua pagina:

| Pagina | Cosa tratta |
|---|---|
| [Autenticazione](authentication.html) | Accedi, rinnova il token, o usa un token di lunga durata |
| [Job](jobs.html) | Avvia un modulo, segui il job, interrompilo, rilancialo o approvalo |
| [Risposte ed errori](responses.html) | La forma di una risposta, e i codici di stato |
| [Eventi in tempo reale](events.html) | Sapere quando cambiano job e impostazioni, invece di interrogare a intervalli |
