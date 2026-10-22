---
layout: default
title: Autenticazione
nav_order: 3
has_children: true
has_toc: false
permalink: /authentication/
translated_from: 024cff3760cf611daeacea8aea7d72b85c0a6d17
---

# Autenticazione
{: .no_toc }

Scegli come accedono gli utenti, e come il loro account e i loro gruppi portano ai ruoli
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Metodi di accesso

AnsibleForms supporta quattro metodi di accesso, e più di uno può essere attivo allo stesso tempo:

| Metodo | Quando usarlo | Pagina |
|---|---|---|
| Account locali | L'admin integrato, gli account di servizio, i team piccoli, o una riserva quando la directory non è disponibile. | [Account locali](local.html) |
| LDAP | Utenti e gruppi stanno in Active Directory, OpenLDAP o un'altra directory LDAP. | [LDAP](ldap.html) |
| Entra ID | Gli utenti accedono con il loro account Microsoft 365 / Entra ID (single sign-on). | [Entra ID](entra-id.html) |
| OIDC | Single sign-on tramite un altro provider OpenID Connect, come Keycloak. | [OIDC](oidc.html) |

Gli account locali e LDAP si configurano in **Accesso > Utenti**, **Gruppi** e **LDAP**; Entra ID e OIDC in
**Accesso > SSO**.

---

## Come un accesso sceglie il metodo

La pagina di accesso ha un modulo con nome utente e password, più un pulsante per ogni provider di single sign-on abilitato:

- **Nome utente e password** vengono verificati prima sugli utenti locali. Solo quando nessun utente locale ha quel nome, e LDAP
  è abilitato, si prova la directory. Un utente locale con la password sbagliata viene rifiutato senza interpellare LDAP.
- **I pulsanti Entra ID e OpenID** compaiono sotto **Accedi** quando un provider di quel tipo è abilitato. Mandano il browser
  al provider e poi indietro; nessuna password arriva ad AnsibleForms.

Si possono abilitare un solo provider Entra ID e un solo provider OIDC alla volta: abilitarne uno disattiva gli altri del suo tipo.
Un accesso con nome utente e password non riuscito mostra sempre lo stesso messaggio generico; il motivo è nel log del server e nel log di audit.

---

## Attivare il single sign-on

Dalla 7.3.0 ogni provider in **Accesso > SSO** ha due interruttori propri, che si applicano senza riavvio:

| Interruttore | Effetto |
|---|---|
| **Abilitato** | Mostra il pulsante del provider nella pagina di accesso e ne accetta l'accesso. Attivarlo disattiva gli altri provider del suo tipo. |
| **Salta la pagina di accesso** | Gli utenti vanno direttamente a questo provider, senza la pagina di accesso, finché il provider è abilitato. Attivarlo per un provider lo disattiva per gli altri; è in grigio su un provider disattivato. |

Il modulo con nome utente e password resta raggiungibile in `/login?local`, per l'admin locale o quando il provider non funziona,
e viene mostrato dopo la disconnessione e quando un accesso single sign-on torna con un errore.

Le variabili `ENABLE_SSO` e `SSO_AUTO_LOGIN` sono rimosse nella 7.3.0. Il primo avvio della 7.3.0 le legge una volta, e
registra un avviso a ogni avvio finché sono ancora impostate, quindi toglile dall'ambiente dopo l'aggiornamento:

| Variabile prima della 7.3.0 | Cosa fa l'aggiornamento |
|---|---|
| `ENABLE_SSO=0` | Disattiva tutti i provider: i provider restano configurati, senza pulsante nella pagina di accesso |
| `SSO_AUTO_LOGIN=1` | Attiva **Salta la pagina di accesso** per il provider abilitato, quando ne è abilitato esattamente uno e `ENABLE_SSO` non è `0` |

---

## Dall'utente ai ruoli

Ogni accesso produce un utente con un **tipo** (`local`, `ldap`, `azuread` o `oidc`), un nome utente e un elenco di gruppi.
Ogni gruppo riceve il prefisso del suo tipo, così un gruppo Entra ID viene salvato e mostrato come `azuread/...`:

| Metodo di accesso | Nome utente | Gruppi |
|---|---|---|
| Locale | il nome utente locale | `local/<group>`, uno per ogni gruppo locale dell'utente |
| LDAP, directory `main` | il valore dell'attributo Username | `ldap/<cn>`, il CN di ogni gruppo restituito dalla directory |
| LDAP, un'altra directory | `<directory>/<username>` | `ldap/<directory>/<cn>`, vedi [Più directory](ldap.html#several-directories) |
| Entra ID | la claim `upn`, o `preferred_username` quando il token non ha `upn` | `azuread/<object id>` e `azuread/<display name>` di ogni gruppo, letti da Microsoft Graph |
| OIDC | la claim `preferred_username` | `oidc/<name>`, dalla claim `groups` dell'ID token |

I [ruoli](../config/roles.html) in config.yaml confrontano poi questi valori: un ruolo si applica quando uno dei suoi `groups` è uno
dei gruppi dell'utente, o quando i suoi `users` contengono `<type>/<username>`. Ogni utente riceve anche il ruolo `default`. Dalla 7.3.0 un
ruolo indica un membro Entra ID come `entraid/<group>` o `entraid/<upn>`, che corrisponde al valore `azuread/` salvato; `azuread/`
in un ruolo funziona ancora e verrà rimosso nella 8.0. Il profilo e le extravars del job continuano a mostrare `azuread/`.

```yaml
roles:
  - name: admin
    groups:
      - local/admins
      - ldap/AF-Admins
      - entraid/AF-Admins
  - name: operator
    groups:
      - oidc/af-operators
    users:
      - ldap/jdoe
```

La pagina del **profilo** di un utente elenca il tipo di accesso, i gruppi e i ruoli, ed è il modo più rapido per verificare una corrispondenza.
L'opzione di ruolo `allowLogin` può rifiutare l'accesso degli utenti che non corrispondono a nessun ruolo: impostala a `false` su `default` e a
`true` sui ruoli che possono accedere.
