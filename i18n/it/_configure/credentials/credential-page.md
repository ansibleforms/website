---
layout: default
title: "La pagina di una credenziale"
parent: Credenziali
nav_order: 3
translated_from: 204eca949763c8c23625369f1d8d8d0d06545c87
---

# La pagina di una credenziale
{: .no_toc }

Le schede di una credenziale, e cosa la usa
{: .fs-6 .fw-300 }

La pagina di una credenziale mostra i passaggi della sua finestra di dialogo come schede, più cosa la usa:

| Scheda | Cosa contiene |
|---|---|
| Dettagli | Nome e descrizione. |
| Tipo | A cosa serve la credenziale. |
| Accesso | Ogni campo del suo tipo, come nel passaggio **Accesso** della finestra di dialogo: l'utente, la password, e dove accede (host e porta, il database, il server mail, i server della directory, il tenant o l'issuer, l'indirizzo del server e il suo TLS). Per una credenziale CyberArk, l'AppID, il certificato client e la chiave. |
| Archivio | Database o Archivio di segreti, e l'archivio e il riferimento. Non per CyberArk né per HashiCorp Vault. |
| Usato da | Tutto ciò che indica questa credenziale: archivi di segreti, canali di notifica, repository, directory LDAP, provider SSO, runner, [database](../databases.html) (dalla 7.5.0), l'assistente chat, i moduli e i workflow del designer. Una riga lo apre. |

La password si digita nella scheda **Accesso**, e una volta salvata non viene più mostrata: se la lasci vuota, resta quella salvata. Per una credenziale
CyberArk, lascia vuota la chiave client per mantenere quella salvata. In alto a destra ci sono **Testa connessione** (solo credenziali database),
**Elimina** e **Salva**.

Dalla 7.3.0, **Elimina** e un nuovo nome vengono rifiutati finché **Usato da** elenca qualcosa, vedi [Credenziali in uso](../credentials.html#credentials-in-use).

Una credenziale dichiarata nel [config seed](../seed/) è in sola lettura in questa pagina: modificala invece nel file del seed.
