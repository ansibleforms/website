---
layout: default
title: Utenti e gruppi della directory
parent: Utenti e gruppi
nav_order: 4
translated_from: 4798556ab97e1c3567a81681919e13c57d7a5b4f
---

# Utenti e gruppi della directory
{: .no_toc }

Utenti e gruppi LDAP, Entra ID e OIDC, come visti l'ultima volta
{: .fs-6 .fw-300 }

Un utente LDAP, Entra ID o OIDC ha la sua pagina in `/settings/users/<source>/<name>`, con `ldap`, `azuread` o `oidc`
come origine, come `/settings/users/ldap/jdoe`. Mostra ciò che è stato registrato all'ultimo accesso dell'utente, in sola lettura,
perché è la directory o l'identity provider a stabilire chi è l'utente e quali sono i suoi gruppi.

Le sue schede sono quelle di un utente locale. **Dettagli** ha l'interruttore **Consenti accesso**, il nome utente, l'origine, il nome,
l'email, quando l'utente è stato visto per la prima volta e il suo ultimo accesso. **Gruppi** elenca i gruppi dell'ultimo accesso.
**Token API** elenca i token API dell'utente, e **Revoca** ne termina uno subito.

In alto a destra, **Termina sessioni** disconnette subito l'utente ovunque. **Dimentica** rimuove il record, che torna
al suo accesso successivo; i suoi job, job salvati e pianificazioni restano. Un utente bloccato non si può dimenticare, perché
lo farebbe rientrare: il server risponde `409`, quindi consentine prima l'accesso.

I gruppi di questo record sono anche i gruppi con cui lavora la sessione dell'utente, letti in tempo reale. Dimenticare un utente che ha
effettuato l'accesso lo lascia senza gruppi, e senza i ruoli che quei gruppi concedono, finché non accede di nuovo.

Un gruppo della directory ha la sua pagina in `/settings/groups/<source>/<name>`, in sola lettura, con le schede **Dettagli**,
**Utenti** (gli utenti visti in esso al loro ultimo accesso), **Ruoli** e **Moduli**.
