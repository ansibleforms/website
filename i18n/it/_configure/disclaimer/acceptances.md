---
layout: default
title: Accettazioni
parent: Disclaimer
nav_order: 3
translated_from: 952000db809a111ac98ba2850a5eb8b31e7a96f5
---

# Accettazioni
{: .no_toc }

Chi ha accettato quale versione, e come chiederlo di nuovo a utenti scelti
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Chi ha accettato

Ogni accettazione viene registrata per l'utente e la versione, e la scheda **Accettazioni** della pagina di una versione le elenca, la più recente per prima:

| Colonna | Significato |
|---|---|
| **Utente** | Il nome utente |
| **Accesso** | Come ha effettuato l'accesso: Locale, LDAP, Microsoft Entra ID o OpenID Connect |
| **Accettato** | Quando |
| **Indirizzo IP** | Da dove |
| **Browser** | Il suo browser |

---

## Chiedere di nuovo agli utenti

Dalla 7.3.0 si può chiedere a utenti scelti di accettare di nuovo una versione, senza chiederlo a tutti.

**Richiedi di nuovo** nel menu di una riga, o sulle righe spuntate nella lista, cancella quelle accettazioni dopo una conferma: quegli utenti ricevono di nuovo il
disclaimer alla loro richiesta successiva, senza dover accedere di nuovo. La lista si può anche esportare, come ogni tabella.

Il [log di audit](../production/logs.html#audit-trail) registra anche ogni accettazione, ogni rifiuto e ogni modifica del disclaimer.
