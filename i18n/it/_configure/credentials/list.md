---
layout: default
title: La pagina delle credenziali
parent: Credenziali
nav_order: 2
translated_from: 6e745bbf0a6688646a821d2bec900e5f0406f4ba
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
| Archivio | Dove sono conservati utente e password: **Database** (cifrati nel database di AnsibleForms) o **Archivio di segreti**. Sotto **Archivio di segreti**, **Punta a una chiave** legge un segreto già presente nell'archivio, e **Scrivi in una chiave** scrive nell'archivio, al **Salvataggio**, utente e password digitati nel passaggio **Accesso**. Poi scegli l'archivio e compila il **Riferimento**; il suo esempio segue l'archivio: un percorso di HashiCorp Vault o un account CyberArk. Non per CyberArk né HashiCorp Vault, con cui un archivio di segreti accede. |
| Accesso | Con cosa accede il tipo e dove, vedi sotto. |

Il passaggio **Tipo** elenca i tipi per nome: AAP, API, Ascender, AWX, CyberArk, Database, Git, HashiCorp Vault, Jenkins, LDAP,
Microsoft Entra ID, Open ID, RTE, Rundeck, Semaphore, SMTP, SSH, e Utente e password (vedi [Tipi di credenziale](types.html)).

Il passaggio **Accesso** contiene ogni campo del tipo, indirizzo compreso; non c'è un passaggio separato per la connessione:

| Tipi | Campi del passaggio Accesso |
|---|---|
| Tutti i tipi tranne CyberArk | La password, o ciò che ne fa le veci: la password di bind di LDAP, il client secret di Entra ID e Open ID, il token di HashiCorp Vault, il token RTE, il token API di Semaphore, Rundeck e Jenkins, un token o una password per AWX, AAP e Ascender |
| Tutti i tipi tranne HashiCorp Vault, RTE, Semaphore e Rundeck | L'utente: l'AppID di CyberArk, il bind DN di LDAP, il client ID di Entra ID e Open ID, facoltativo per AWX, AAP e Ascender |
| SSH, Database | **Host** e **Porta**; per un database anche il **Tipo database** e il **Database** |
| SSH | **Chiave privata** e la sua **Passphrase**, dalla 7.6.0; con una chiave, la password è facoltativa |
| Utente e password, API | **Host** e **Porta**, entrambi facoltativi, dalla 7.6.0 |
| SMTP | **Server mail** (obbligatorio), la sua **Porta** e **Usa TLS**; dalla 7.6.0 utente e password sono facoltativi, vuoti per un relay |
| LDAP | I **Server** della directory (obbligatori), la sua **Porta** e **Abilita TLS**; con TLS, **Ignora certificati**, il **Bundle CA** e un **Certificato client** |
| Microsoft Entra ID | **Tenant ID** (obbligatorio) e **URI di reindirizzamento**; dalla 7.6.0 **Accedi con**: **Segreto client** o **Certificato** (solo mail) |
| Open ID | **Issuer** (obbligatorio) e **URI di reindirizzamento** |
| HashiCorp Vault, CyberArk, RTE, AWX, AAP, Ascender, Semaphore, Rundeck, Jenkins | **Server**, l'indirizzo a cui accede, obbligatorio, con **Salta la verifica del certificato** e il **Bundle CA** |
| CyberArk | **Certificato client** e **Chiave client** |

Con **Punta a una chiave**, utente e password non vengono chiesti: li fornisce lo store. Il passo **Accesso** mantiene allora solo i campi di indirizzo del tipo (SSH, database, server di posta e di directory, l'indirizzo di un server, l'host e la porta facoltativi di Utente e password e API dalla 7.6.0), e un accesso Git non ha alcun passo **Accesso**: si salva dal passo **Archivio**.

Con **Scrivi in una chiave** (da 7.6.0), il passaggio **Accesso** chiede utente e password, e **Salva** li scrive nell'archivio al **Riferimento**; AnsibleForms conserva solo l'archivio e il riferimento. Vengono offerti solo gli archivi che consentono la scrittura, e **Aggiungi secret store** ne crea uno con la scrittura già attiva. Una chiave che contiene già un segreto viene sostituita solo se **Sovrascrivi un segreto già presente** è spuntato, vedi [Scrivere le credenziali](../secret-stores/#writing-credentials).

Una riga apre la pagina della credenziale. Il suo menu offre **Modifica**, **Testa connessione** (solo credenziali database) ed **Elimina**. La
password si cambia nella pagina della credenziale, nella sua scheda **Accesso**.
