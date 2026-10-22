---
layout: default
title: Credenziali
nav_order: 6
has_children: true
has_toc: false
permalink: /credentials.html
translated_from: 08110077a1cf59a4a52e078fc2ebc252f7cae48d
---

# Credenziali
{: .no_toc }

Salva gli accessi con cui si connettono moduli, repository, archivi di segreti e canali di notifica
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per gli amministratori: aggiungi gli utenti, le password e i token con cui si connette AnsibleForms, conservati cifrati o letti da un archivio di segreti.

---

## In questa sezione

| Pagina | Cosa tratta |
|---|---|
| [Tipi di credenziale](credentials/types.html) | Cosa contiene ogni tipo, e dove si può scegliere |
| [La pagina delle credenziali](credentials/list.html) | La lista delle credenziali, e la finestra di dialogo che ne aggiunge una |
| [La pagina di una credenziale](credentials/credential-page.html) | Le schede di una credenziale, e cosa la usa |

---

## Come funziona

Una **credenziale** è un accesso con un nome, aggiunto in **Connessioni > Credenziali**. I moduli e gli altri oggetti di amministrazione
la indicano con il suo nome, così la password stessa non compare mai in un modulo. Il suo utente e la sua password sono conservati nel
database di AnsibleForms, cifrati con `ENCRYPTION_SECRET`, oppure letti da un [archivio di segreti](secret-stores/) ogni volta che
la credenziale viene usata.

---

## Chi può modificare una credenziale

Dalla 7.3.0 una credenziale da cui dipende una connessione o un accesso può essere aggiunta, modificata o eliminata solo da un admin:

| Credenziali | Perché |
|---|---|
| Tipi di connessione: `rte`, `awx`, `aap`, `ascender`, `semaphore`, `rundeck`, `jenkins`, `vault` e `cyberark` | Un runner o un archivio di segreti ne prende l'indirizzo e il segreto |
| Tipi di accesso: `oidc`, `entraid` e `ldap` | Un provider SSO o una directory LDAP fa accedere gli utenti con essa |
| Qualsiasi credenziale indicata da un runner | Il runner accede con essa, e anche una modifica del runner stesso richiede un admin |

Gli altri utenti con accesso alle credenziali le vedono in sola lettura. Un utente che potesse puntare una credenziale del genere verso un altro
server riceverebbe ogni segreto inviato tramite essa, ed è per questo che la regola segue quella dei runner. Altre tre regole
tengono questi utenti lontani dai segreti che altrimenti non potrebbero leggere:

- **Indicare una credenziale protetta**: solo un admin può indicare una di queste credenziali altrove, per esempio in un repository,
  in un canale di notifica o nelle impostazioni dell'assistente chat. Una credenziale che legge la sua password da un archivio di segreti è
  protetta allo stesso modo, qualunque sia il suo tipo.
- **Scegliere un archivio di segreti**: solo un admin può puntare una credenziale verso un [archivio di segreti](secret-stores/), o cambiare
  l'archivio o il riferimento che legge; un altro utente può comunque rimandarli invariati, o svuotarli tutti.
- **Spostare una credenziale**: quando un altro utente cambia dove accede una credenziale (il suo host, la porta, l'issuer, il tenant o
  l'indirizzo del server) senza digitare di nuovo la password, la password salvata viene cancellata, e così il riferimento all'archivio
  di segreti che legge, in modo che il vecchio segreto non vada mai alla nuova destinazione.

---

## Credenziali in uso

Una credenziale ancora indicata da dei record non si può eliminare né rinominare, perché questi resterebbero a puntare verso il nulla.
Il rifiuto indica quanti record la usano; la scheda **Usato da** della [sua pagina](credentials/credential-page.html) li elenca.
Puntali prima verso un'altra credenziale, poi eliminala o rinominala.
