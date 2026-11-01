---
layout: default
title: Sicurezza
nav_order: 15
has_children: true
has_toc: false
permalink: /security/
translated_from: e299ab0a4ffb1c12441a3b3fec6eaaef4a19de79
---

# Sicurezza
{: .no_toc }

Metti in sicurezza un'istanza: l'account admin, i suoi segreti, HTTPS e cosa possono fare gli utenti e i moduli
{: .fs-6 .fw-300 }

---

Per gli amministratori che preparano un'istanza per la produzione, e per le revisioni di sicurezza di un'istanza esistente.

---

## In questa sezione

Ogni argomento ha una pagina propria:

| Pagina | Cosa tratta |
|---|---|
| [Hardening](hardening.html) | L'account admin, i limiti di accesso, il database, le espressioni, i dati dei job, la policy del browser, le funzionalità facoltative e le opzioni dei ruoli |
| [HTTPS](https.html) | Dove termina il TLS, servire HTTPS dall'applicazione, e sostituire il certificato di esempio |
| [Segreti e cifratura](secrets.html) | `ENCRYPTION_SECRET`, `ACCESS_TOKEN_SECRET`, e la durata dei token |

Pagine correlate: [Autenticazione](../authentication/) per i metodi di accesso, [Validazione all'avvio](../launch-validation/) per
i controlli lato server di ogni avvio, e le [Variabili di sicurezza](../customization/security.html).
