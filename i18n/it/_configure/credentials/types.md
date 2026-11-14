---
layout: default
title: Tipi di credenziale
parent: Credenziali
nav_order: 1
translated_from: d6f228571406245ed64b84cb0a6bf1888ae5d53c
---

# Tipi di credenziale
{: .no_toc }

Cosa contiene ogni tipo, e dove si può scegliere
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## I tipi

Il tipo dice a cosa serve una credenziale. Decide quali campi chiede la finestra di dialogo, e dove si può scegliere:

| Tipo | Cosa contiene | Usato da |
|---|---|---|
| Utente e password | Un utente e una password per qualsiasi accesso: una API REST con basic auth, un servizio e altro, con un host e una porta facoltativi. Il predefinito | Playbook, tramite le `credentials` di un modulo o un campo credenziale; [espressioni REST](../expressions/credentials.html) |
| SSH | Un utente con una password o una chiave privata per SSH verso un server, con il suo host e la sua porta | Playbook, tramite le `credentials` di un modulo, `ansibleCredentials` o un campo credenziale, e l'accesso di un nodo di workflow |
| Git | Un utente e una password o un token per repository git | [Repository](../repositories/authentication.html) |
| API | Un utente e una password o un token per una API REST, con un host e una porta facoltativi | [Espressioni REST](../expressions/credentials.html), il token di un bot Telegram, il bearer token di un webhook, la chiave API dell'assistente chat |
| Database | Un accesso a un database, con il suo tipo, host, porta e nome del database | Un [database](../databases.html) che i moduli interrogano (`dbConfig`), dalla 7.5.0, o direttamente il `dbConfig` di un modulo; `fnCredentials`; si può testare |
| CyberArk | L'indirizzo del CyberArk Central Credential Provider (CCP) e il suo TLS, e l'AppID, il certificato client e la chiave con cui accede un archivio CyberArk | Un archivio di segreti [CyberArk](../secret-stores/cyberark.html) |
| SMTP | Un server mail, la sua porta e il TLS, e il suo accesso facoltativo (nessuno per un relay) | Un [canale di notifica](../notification-channels.html) mail |
| LDAP | I server di una directory, la porta, il TLS e i certificati, e il suo bind DN e la password | Una [directory LDAP](../authentication/ldap.html) |
| Microsoft Entra ID | Una registrazione dell'app: il tenant ID, il client ID, il client secret o il certificato, e l'URI di reindirizzamento | Un [provider Entra ID](../authentication/entra-id.html); un canale mail che invia tramite [Microsoft 365](../notification-channels/microsoft-365.html) |
| Open ID | Il client di un provider: l'issuer, il client ID, il client secret e l'URI di reindirizzamento | Un [provider OIDC](../authentication/oidc.html) |
| RTE | Il token (`RTE_TOKEN`) e l'indirizzo di un RTE | Un [runner](../runners.html) RTE |
| AWX, AAP, Ascender | Il token o l'accesso, e l'indirizzo, di quella piattaforma | Un runner di quel tipo |
| Semaphore, Rundeck | Il token API e l'indirizzo di quel prodotto | Un runner di quel tipo |
| Jenkins | Un utente, il suo token API e l'indirizzo di un Jenkins | Un runner Jenkins |
| HashiCorp Vault | Il token e l'indirizzo con cui accede un archivio Vault | Un archivio di segreti [HashiCorp Vault](../secret-stores/hashicorp-vault.html) |

Una credenziale database può essere di tipo MySQL, MSSQL, PostgreSQL, Oracle o MongoDB. Dalla 7.5.0 viene scelta da un database di
[Connessioni > Database](../databases.html), e l'aggiornamento alla 7.5.0 crea un database per ognuna, con lo stesso nome.

Nell'API e nel [config seed](../seed/), i tipi sono `userpass`, `ssh`, `git`, `api`, `database`, `cyberark`, `smtp`,
`ldap`, `entraid`, `oidc`, `rte`, `awx`, `aap`, `ascender`, `semaphore`, `rundeck`, `jenkins` e `vault`. L'aggiornamento dalla 6
assegna a ogni credenziale il tipo `userpass`, o `database` a una credenziale di database: un modulo la usa come nella 6. Cambiala in SSH per un
accesso con cui si connette il playbook di un nodo di workflow, o in API per una API REST.

---

## Indirizzi nelle credenziali

Dalla 7.3.0 un accesso che funziona su un server porta con sé quel server, così il record che lo usa indica solo la credenziale:

| Record | Cosa è passato nella sua credenziale |
|---|---|
| Una directory LDAP | I suoi server, la porta, il TLS, i certificati e l'account di bind, in una credenziale `ldap` chiamata `<directory>-ldap` |
| Un provider SSO | Il suo client ID e secret, il tenant o l'issuer, e l'URI di reindirizzamento, in una credenziale `entraid` o `oidc` chiamata `<provider>-sso` |
| Un runner | Il suo indirizzo e il TLS, e il suo token o accesso, in una credenziale del suo tipo, `<runner>-token` o `<runner>-login` |
| Un archivio di segreti | Il suo indirizzo e il TLS, e il suo token (`<store>-token`) o l'AppID e il certificato CyberArk (`<store>-appid`) |
| Un canale mail | Il suo server, la porta e il TLS, nella sua credenziale `smtp`, o in una nuova chiamata `<channel>-smtp` |

L'aggiornamento alla 7.3.0 fa questi spostamenti una sola volta. Un record che indicava già una credenziale la mantiene, e ne riceve una copia quando
un altro record usava lo stesso accesso con un altro server. I record dichiarati nel [config seed](../seed/) restano come li ha il seed.
Le credenziali delle connessioni e degli accessi possono essere modificate solo da un admin, vedi [Chi può modificare una credenziale](../credentials.html#who-may-change-a-credential).

---

## Host e porta di un accesso

Dalla 7.6.0 anche una credenziale Utente e password o API può avere un **Host** e una **Porta**, facoltativi, nel passaggio **Accesso**.

Arrivano al playbook e alle espressioni con la credenziale, come `host` e `port`, accanto a `user` e `password`: tramite le
`credentials` di un modulo e [`fn.fnCredentials`](../expressions/credentials.html). Una credenziale letta da un archivio di segreti
mantiene il suo host e la sua porta, e prende quelli del segreto solo dove li lascia vuoti. Le credenziali SSH e database li hanno sempre avuti.

---

## La chiave privata di una credenziale SSH

Dalla 7.6.0 una credenziale SSH può accedere con una chiave privata, al posto della sua password o accanto a essa:

| Campo | Significato |
|---|---|
| Chiave privata | La chiave privata PEM o OpenSSH con cui accede il playbook. Salvata cifrata, non più mostrata: se la lasci vuota, resta quella salvata. |
| Passphrase | La passphrase della chiave, se ne ha una. Salvata cifrata. |
| Password | Facoltativa con una chiave privata. |

La pagina della credenziale ha un interruttore **Rimuovi la chiave privata salvata e la sua passphrase**, applicato al **Salva**. La
chiave e la sua passphrase non vengono mai restituite dall'API, e sono mascherate nell'output del job.

Quando un modulo indica la credenziale in `ansibleCredentials`, l'RTE scrive la chiave in un file temporaneo privato (in una cartella
tutta sua, leggibile solo dal suo utente) e la passa al playbook come `ansible_ssh_private_key_file`. Una chiave con passphrase viene
caricata in un `ssh-agent` avviato solo per quel job, e il file viene rimosso una volta caricata. Il file e l'agent spariscono alla fine
del job, anche se fallito o interrotto, così sull'RTE non resta nessuna chiave.

Le immagini RTE hanno `ssh-agent` e `ssh-add`; un RTE tuo che non li ha fa fallire, dicendolo, un job la cui chiave ha una passphrase.

Le `credentials` di un modulo che indicano una credenziale SSH passano la chiave al playbook come `private_key`, e la sua passphrase
come `private_key_passphrase`. Nel [config seed](../seed/), la chiave è il `client_key` della credenziale e la passphrase il `key_passphrase`.
