---
layout: default
title: La pagina delle credenziali
parent: Credenziali
nav_order: 2
translated_from: 986d768c15d0b91bdc3760026bd904d3f89ff3e0
---

# La pagina delle credenziali
{: .no_toc }

La lista delle credenziali, e la finestra di dialogo che ne aggiunge una
{: .fs-6 .fw-300 }

La pagina in **Connessioni > Credenziali** elenca ogni credenziale con il suo **Nome**, **Tipo**, **Descrizione** e **Usato da**, il
numero di record, moduli e workflow che la indicano (vedi [Credenziali in uso](../credentials.html#credentials-in-use)).

**Aggiungi credenziale** apre una finestra di dialogo a passaggi:

| Passaggio | Campi |
|---|---|
| Credenziale | Nome e descrizione, entrambi obbligatori. |
| Tipo | Uno di 18 tipi, vedi sotto. |
| Accesso | Con cosa accede il tipo e dove, vedi sotto. |
| Archivio | Dove sono conservati l'utente e la password: **Database** (cifrati nel database di AnsibleForms) o **Archivio di segreti**, con l'archivio e il **Riferimento** al suo interno. Non per CyberArk né per HashiCorp Vault, con cui accede un archivio di segreti. |

Il passaggio **Tipo** elenca i tipi per nome: AAP, API, Ascender, AWX, CyberArk, Database, Git, HashiCorp Vault, Jenkins, LDAP,
Microsoft Entra ID, Open ID, RTE, Rundeck, Semaphore, SMTP, SSH, e Utente e password (vedi [Tipi di credenziale](types.html)).

Il passaggio **Accesso** contiene ogni campo del tipo, indirizzo compreso; non c'è un passaggio separato per la connessione:

| Tipi | Campi del passaggio Accesso |
|---|---|
| Tutti i tipi tranne CyberArk | La password, o ciò che ne fa le veci: la password di bind di LDAP, il client secret di Entra ID e Open ID, il token di HashiCorp Vault, il token RTE, il token API di Semaphore, Rundeck e Jenkins, un token o una password per AWX, AAP e Ascender |
| Tutti i tipi tranne HashiCorp Vault, RTE, Semaphore e Rundeck | L'utente: l'AppID di CyberArk, il bind DN di LDAP, il client ID di Entra ID e Open ID, facoltativo per AWX, AAP e Ascender |
| SSH, Database | **Host** e **Porta**; per un database anche il **Tipo database** e il **Database** |
| SMTP | **Server mail** (obbligatorio), la sua **Porta** e **Usa TLS** |
| LDAP | I **Server** della directory (obbligatori), la sua **Porta** e **Abilita TLS**; con TLS, **Ignora certificati**, il **Bundle CA** e un **Certificato client** |
| Microsoft Entra ID | **Tenant ID** (obbligatorio) e **URI di reindirizzamento** |
| Open ID | **Issuer** (obbligatorio) e **URI di reindirizzamento** |
| HashiCorp Vault, CyberArk, RTE, AWX, AAP, Ascender, Semaphore, Rundeck, Jenkins | **Server**, l'indirizzo a cui accede, obbligatorio, con **Salta la verifica del certificato** e il **Bundle CA** |
| CyberArk | **Certificato client** e **Chiave client** |

Una riga apre la pagina della credenziale. Il suo menu offre **Modifica**, **Testa connessione** (solo credenziali database) ed **Elimina**. La
password si cambia nella pagina della credenziale, nella sua scheda **Accesso**.
