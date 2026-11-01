---
layout: default
title: Utenti e gruppi
nav_order: 16
has_children: true
has_toc: false
permalink: /users-and-groups.html
translated_from: 07178b6b66a60d91e5a8ff3c417da3771730bc5e
---

# Utenti e gruppi
{: .no_toc }

Gli utenti e i gruppi locali, quelli LDAP e single sign-on accanto a loro, e come bloccare un accesso
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per gli amministratori: gestisci chi può accedere in **Impostazioni > Accesso > Utenti** e **Gruppi**, con l'opzione di ruolo `showSettings`.

L'admin integrato, l'ordine di accesso e la corrispondenza con i ruoli degli account locali sono in [Account locali](authentication/local.html).

---

## In questa sezione

| Pagina | Cosa tratta |
|---|---|
| [Un utente locale](users-and-groups/local-user.html) | Aggiungere un utente locale, e le schede della sua pagina |
| [Più gruppi](users-and-groups/several-groups.html) | Un utente locale in più gruppi, e i loro ruoli |
| [Un gruppo locale](users-and-groups/local-group.html) | La pagina di un gruppo locale e le sue schede |
| [Utenti e gruppi della directory](users-and-groups/directory.html) | Utenti e gruppi LDAP, Entra ID e OIDC, come visti l'ultima volta |
| [Bloccare un accesso](users-and-groups/blocking-a-sign-in.html) | Consenti accesso: bloccare un utente senza eliminare nulla |


---

## Le liste

Le liste **Utenti** e **Gruppi** mostrano gli utenti e i gruppi locali e, accanto a loro, quelli LDAP e single sign-on.

Un utente o un gruppo di LDAP, Entra ID o OIDC compare nella lista una volta che ha effettuato l'accesso (o è stato visto in un accesso), o una volta che un ruolo lo indica.
La colonna **Origine** dice da dove arriva ciascuno: Locale, LDAP, Microsoft Entra ID o OIDC. Dalla 7.3.0 la lista **Utenti** ha anche
una colonna **Ultimo accesso**, che dice quando ogni utente ha effettuato l'ultimo accesso.

Una riga apre la pagina del suo utente o gruppo. **Aggiungi utente** e **Aggiungi gruppo** ne creano uno locale.

---

## Account che concedono l'admin

Il ruolo admin in config.yaml indica gruppi e utenti locali, quindi solo un admin può modificare gli account e i gruppi che indica.

Un utente con `showSettings` ma senza il ruolo admin non può modificare, bloccare, cambiare di gruppo, impostare la password di o eliminare un
account locale indicato dal ruolo admin (direttamente o tramite uno dei suoi gruppi). Né può creare, rinominare o eliminare un gruppo
indicato dal ruolo admin, o metterci un utente. Lo stesso vale per un utente LDAP o SSO che corrisponde al ruolo admin: bloccarlo,
terminarne le sessioni, dimenticarlo e revocarne i token API spetta a un admin. Il server risponde a una richiesta del genere con `403`.
