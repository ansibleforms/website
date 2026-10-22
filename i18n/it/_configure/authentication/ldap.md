---
layout: default
title: LDAP
parent: Autenticazione
nav_order: 2
translated_from: a4089d681ad976e31e7ddefb29588bd3ca334dab
---

# LDAP
{: .no_toc }

Fai accedere gli utenti della directory con la loro password, e assegna loro i ruoli tramite i loro gruppi della directory
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Come funziona

AnsibleForms si connette alla directory con un account di bind, cerca l'utente e poi esegue il bind come quell'utente per verificare
la password:

1. L'utente accede con nome utente e password. Quando nessun utente **locale** ha quel nome, si prova LDAP.
2. AnsibleForms esegue il bind con l'account di bind della credenziale della directory, e cerca in **Base di ricerca** una voce il cui
   **Attributo nome utente** è uguale al nome utente.
3. Esegue il bind come la voce trovata, con la password digitata.
4. I gruppi vengono letti dalla voce (o da una ricerca di gruppi), filtrati, e ricevono il prefisso `ldap/`.

Un nome utente in forma UPN (`jdoe@example.com`) che non trova nessun utente viene riprovato una volta con la parte prima della `@`, così gli utenti
possono accedere con l'una o l'altra forma anche quando l'Attributo nome utente contiene il nome breve. Una password sbagliata non viene mai riprovata.

Un unico insieme di impostazioni serve Active Directory, OpenLDAP e altri; dalla 7.3.0 possono esserci [più directory](#several-directories).

---

## Impostazioni

Dalla 7.3.0 le impostazioni sono per directory. **Accesso > LDAP** elenca le directory, nell'ordine in cui si cerca un nome utente semplice:

![Accesso > LDAP](../assets/screenshots/ldap.jpg)

| Menu di riga | Cosa fa |
|---|---|
| Modifica | Apre la pagina della directory |
| Testa connessione | Prova un accesso con un nome utente e una password di test, vedi [Testare la connessione](#testing-the-connection) |
| Attiva, Disattiva | Attiva o disattiva la directory; `main` viene disattivata invece che eliminata |
| Sposta su, Sposta giù | Cambia la sua posizione nell'ordine di ricerca |
| Elimina | Rimuove la directory; mostrato ma disabilitato su `main` |

Aggiungere una directory chiede i suoi campi in quattro passaggi, le schede della sua pagina. **Dettagli** contiene **Abilitato**, il **Nome** e una **Descrizione**:

| Scheda | Impostazione | Significato |
|---|---|---|
| Credenziali | Credenziale | Obbligatoria. Una credenziale `ldap` di [Connessioni > Credenziali](../credentials.html), che contiene la connessione, vedi sotto |
| Utenti | Base di ricerca | DN da cui parte la ricerca degli utenti, es. `OU=Users,DC=example,DC=com`. Si cerca anche nei sottoalberi |
| Utenti | Attributo nome utente | Attributo confrontato con il nome di accesso: `sAMAccountName` in AD (il predefinito), `uid` in OpenLDAP |
| Utenti | Attributo mail | Attributo che contiene l'indirizzo email, di solito `mail` |
| Utenti | Domini di accesso | Domini i cui accessi `user@domain` vanno direttamente a questa directory, vedi [Più directory](#several-directories) |
| Gruppi | Attributo gruppi | Attributo della voce utente che contiene i gruppi (`memberOf`, il predefinito), oppure `groups` con una ricerca di gruppi |
| Gruppi | Base ricerca gruppi | DN da cui parte la ricerca dei gruppi |
| Gruppi | Classe gruppo | objectClass dei gruppi, es. `group`, `groupOfNames` o `posixGroup` |
| Gruppi | Attributo membro gruppo | Attributo di un gruppo che elenca i suoi membri, es. `member`, `uniqueMember` o `memberUid`; predefinito `member` |
| Gruppi | Attributo utente membro gruppo | Attributo dell'utente contenuto in quei valori di membro, es. `dn` o `uid`; predefinito `dn` |
| Gruppi | Filtro gruppi | Espressione regolare; si tengono solo i gruppi il cui nome corrisponde. Vuoto tiene tutti i gruppi |

I valori predefiniti degli ultimi tre campi dei gruppi si applicano solo quando si usa la ricerca di gruppi, vedi la sezione successiva.

La credenziale `ldap` contiene come si raggiunge la directory e con quale identità la si interroga:

| Campo | Significato |
|---|---|
| Server | Uno per campo, come `host`, `host:port` o `ldaps://host:port`, provati in questo ordine: quando uno non è raggiungibile, si passa al successivo |
| Porta | `389` per LDAP semplice, `636` per LDAPS |
| Abilita TLS | Connessione con LDAPS (`ldaps://`). StartTLS sulla porta 389 non è supportato |
| Ignora certificati | Salta la validazione del certificato del server. Mostrato solo con **Abilita TLS** |
| Certificato | Il certificato client che AnsibleForms presenta ai server, in PEM, quando i certificati vengono verificati |
| Bundle CA | Il o i certificati CA che hanno firmato il certificato del server, in PEM, quando i certificati vengono verificati |
| Bind user DN | Il DN dell'account di servizio che interroga la directory |
| Password bind user | La sua password, salvata cifrata o letta da un [archivio di segreti](../secret-stores/) |

Solo un admin può aggiungere o modificare una credenziale `ldap`, vedi [Chi può modificare una credenziale](../credentials.html#who-may-change-a-credential).
Fino alla 7.2.0 i server, il TLS e l'account di bind erano campi delle impostazioni LDAP. L'aggiornamento alla 7.3.0 li sposta in una credenziale,
vedi [Indirizzi nelle credenziali](../credentials/types.html#addresses-in-credentials):

| La directory prima dell'aggiornamento | Dove vanno i suoi server |
|---|---|
| Un bind DN e una password propri, nessuna credenziale | Una nuova credenziale `ldap` chiamata `<directory>-ldap`, come `main-ldap` |
| Una credenziale senza server | In quella credenziale |
| Una credenziale che contiene già altri server | Una copia della credenziale chiamata `<credential>-<directory>`, che la directory poi indica |

Un nome già in uso riceve `-2`, `-3` e così via. Una directory del config seed resta com'è: è del seed.

---

## Gruppi

I gruppi arrivano da uno di due posti, e l'**Attributo gruppi** decide quale si usa:

- **Un attributo della voce utente**, di solito `memberOf`. È la configurazione comune per Active Directory, e per
  OpenLDAP con l'overlay `memberof`.
- **Una ricerca di gruppi**, per le directory senza `memberOf`. Viene eseguita solo quando **Base ricerca gruppi** e **Classe gruppo**
  sono entrambi impostati: AnsibleForms cerca allora i gruppi di quella classe il cui **Attributo membro gruppo** contiene
  l'**Attributo utente membro gruppo** dell'utente, e salva il risultato nell'attributo `groups`. Imposta **Attributo gruppi** a `groups`
  per usarla.

{: .note }
> Con **Attributo gruppi** `memberOf`, una ricerca di gruppi configurata viene eseguita ma il suo risultato non si usa per i ruoli.

Ogni gruppo è un DN, e AnsibleForms tiene il suo primo CN: `CN=AF-Admins,OU=Groups,DC=example,DC=com` diventa `AF-Admins`.
Il **Filtro gruppi** si applica poi a quel nome, e i gruppi rimasti ricevono il prefisso `ldap/`: `ldap/AF-Admins`.

Nelle directory grandi il filtro mantiene piccoli i token e i job; un'espressione regolare non valida tiene tutti i gruppi e viene registrata nel log.

---

## Corrispondenza con i ruoli

In config.yaml, un gruppo LDAP è `ldap/<group CN>` e un utente LDAP è `ldap/<username>`, entrambi sensibili a maiuscole e minuscole:

```yaml
roles:
  - name: admin
    groups:
      - local/admins
      - ldap/AF-Admins
  - name: operator
    groups:
      - ldap/AF-Operators
    users:
      - ldap/jdoe
```

Il nome utente è il valore dell'**Attributo nome utente** come lo restituisce la directory, non come l'ha digitato l'utente.
Vedi [Ruoli](../config/roles.html) per le opzioni dei ruoli.

---

## Più directory

Dalla 7.3.0 possono esserci più directory, ognuna con i suoi server, utenti e gruppi. I loro nomi distinguono i loro membri:

| Directory | Nome utente | Gruppi | In un ruolo |
|---|---|---|---|
| `main` | `jdoe` | `ldap/AF-Admins` | `ldap/jdoe`, `ldap/AF-Admins` |
| Qualsiasi altra, come `corp` | `corp/jdoe` | `ldap/corp/AF-Admins` | `ldap/corp/jdoe`, `ldap/corp/AF-Admins` |

Un utente indica la directory all'accesso come `corp\jdoe` o `corp/jdoe`, oppure accede con un indirizzo di un dominio che la directory
possiede. Un nome utente semplice si prova in ogni directory abilitata, nel loro ordine, e così anche un nome come `other\jdoe` quando nessuna
directory si chiama `other`: allora si cerca così come è stato digitato.

Decide la prima directory che conosce l'utente: una password sbagliata lì è la risposta, e la directory successiva non viene
provata, perché potrebbe contenere qualcun altro con quel nome. Una directory non raggiungibile viene saltata.

La directory chiamata `default` fino alla 7.2.0 si chiama `main` dalla 7.3.0: l'aggiornamento la rinomina, e una nuova installazione parte
con `main`. I suoi membri mantengono i loro nomi brevi, quindi i ruoli che li indicano non vanno modificati. La directory `main` non si può
rinominare, e il nome di una directory contiene solo lettere, cifre, `-` e `_`.

---

## Testare la connessione

**Testa connessione** chiede un nome utente e una password di test, e prova un accesso con le impostazioni sullo schermo, salvate o no.
Se riesce mostra la voce della directory dell'utente, che ti dice i nomi esatti degli attributi e i DN dei gruppi da usare.

Un utente di test che non esiste segnala comunque un successo: la connessione e l'account di bind funzionano, solo l'utente non
viene trovato. Errori tipici:

| Messaggio | Causa |
|---|---|
| `Bad server or port (connection failed)` | Il nome host non si risolve o la porta non è raggiungibile. |
| `Wrong binding credentials` | Il bind DN o la password della credenziale della directory sono sbagliati. |
| `Unable to verify the certificate` | Il certificato del server non è firmato dal Bundle CA della credenziale. |
| `Certificate is not valid` | Il Certificato o il Bundle CA della credenziale non contengono un certificato PEM valido. |

---

## Esempio con Active Directory

Questo esempio si connette a due domain controller via LDAPS e tiene solo i gruppi il cui nome inizia con `AF-`:

| Impostazione | Valore |
|---|---|
| Credenziale > Server | `dc01.example.com`, poi `dc02.example.com` |
| Credenziale > Porta | `636` |
| Credenziale > Abilita TLS | attivo |
| Credenziale > Ignora certificati | disattivo, con un certificato client e la catena CA della CA aziendale |
| Credenziale > Bind user DN | `CN=svc-ansibleforms,OU=Service Accounts,DC=example,DC=com` |
| Base di ricerca | `OU=Users,DC=example,DC=com` |
| Attributo mail | `mail` |
| Attributo nome utente | `sAMAccountName` |
| Attributo gruppi | `memberOf` |
| Filtro gruppi | `^AF-` |

I membri di `CN=AF-Operators,…` corrispondono ai ruoli con `ldap/AF-Operators`, e accedono come `jdoe` o `jdoe@example.com`.

---

## Esempio con OpenLDAP

Questo esempio usa una ricerca di gruppi sulle voci `groupOfNames`, quindi funziona senza l'overlay `memberof`:

| Impostazione | Valore |
|---|---|
| Credenziale > Server | `ldap.example.com` |
| Credenziale > Porta | `636` |
| Credenziale > Abilita TLS | attivo |
| Credenziale > Bind user DN | `cn=readonly,dc=example,dc=com` |
| Base di ricerca | `ou=people,dc=example,dc=com` |
| Attributo mail | `mail` |
| Attributo nome utente | `uid` |
| Attributo gruppi | `groups` |
| Base ricerca gruppi | `ou=groups,dc=example,dc=com` |
| Classe gruppo | `groupOfNames` |
| Attributo membro gruppo | `member` |
| Attributo utente membro gruppo | `dn` |

Un utente elencato in `cn=af-admins,ou=groups,dc=example,dc=com` riceve il gruppo `ldap/af-admins`. Per i gruppi `posixGroup`,
usa **Attributo membro gruppo** `memberUid` e **Attributo utente membro gruppo** `uid`.

Con l'overlay `memberof`, lascia vuoti i campi della ricerca di gruppi e imposta **Attributo gruppi** a `memberOf`.

---

## Errori comuni

La maggior parte dei problemi LDAP si riduce a uno di questi:

- **Un utente locale con lo stesso nome.** Gli utenti locali si verificano per primi, quindi alla directory non si chiede mai di quel nome.
- **Nessun gruppo, o quelli sbagliati.** L'Attributo gruppi deve esistere (`groups` con una ricerca di gruppi); `memberOf` ignora l'annidamento.
- **Nomi di gruppo che non corrispondono.** Usa `ldap/<CN>` con le stesse maiuscole e minuscole, e verifica che il Filtro gruppi tenga il gruppo.
- **DN di gruppo che non iniziano con un CN.** Come nome del gruppo si usa solo il primo valore `CN=`, quindi ogni DN di gruppo
  deve iniziare con `CN=` (o `cn=`).
- **Certificati.** Il TLS richiede entrambi i campi dei certificati della credenziale e un nome di server corrispondente; Ignora certificati è solo per i test.
- **Impostazioni che non si possono salvare.** Quando una directory viene dal [config seed](../seed/managed-objects.html), la sua pagina
  è in sola lettura: modifica invece il file del seed.

Un accesso non riuscito mostra un messaggio generico. Il motivo viene registrato dal server e conservato nel log di audit, e per Active
Directory viene tradotto dal codice della directory, es. `Wrong password`, `Account locked` o `Password expired`.
