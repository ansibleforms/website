---
layout: default
title: CyberArk
parent: Archivi di segreti
nav_order: 2
translated_from: f001addbd5578169444a321ab9e668e54139842b
---

# CyberArk
{: .no_toc }

Leggi le credenziali dal CyberArk Central Credential Provider (CCP)
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

{: .warning }
> **Sperimentale.** Non ancora testato su un'installazione CyberArk reale; segnala ciò che riscontri.

Il CCP è l'interfaccia REST dell'Application Access Manager di CyberArk.

---

## Campi dell'archivio

Oltre ai [campi che ha ogni archivio](./#adding-a-store), un archivio CyberArk ha questi campi:

| Campo | Significato |
|---|---|
| Credenziale | Una credenziale **CyberArk** di [Connessioni > Credenziali](../credentials.html): l'URL di base del CCP, es. `https://ccp.example.com` (viene aggiunto `/AIMWebService/api/Accounts`), le sue impostazioni TLS, il suo AppID (l'applicazione definita per AnsibleForms in CyberArk), e un certificato client e una chiave in PEM, solo quando l'AppID li richiede. |

---

## Riferimento al segreto

Il riferimento al segreto identifica l'account come coppie chiave-valore separate da `;`:

```
Safe=Linux;Object=root-srv01
Safe=DB;UserName=forms;Address=db01.example.com
Query=Safe=Linux;Folder=Root;Object=root-srv01
```

- Chiavi ammesse: `Safe`, `Folder`, `Object`, `UserName`, `Address`, `Database`, `PolicyID`,
  `Reason`, `Query`, `QueryFormat`, `ConnectionTimeout`, `FailRequestOnPasswordChange`.
- `Query=` passa il resto del riferimento come query CCP nativa, con `QueryFormat=Exact`
  a meno che tu non lo imposti diversamente.
- Un `AppID` nel riferimento viene ignorato: si usa sempre l'AppID dell'archivio.
- La password dell'account (`Content`) diventa la password; `UserName`, `Address`, `Port` e
  `Database` compilano utente, host, porta e nome del database.

---

## Opzioni aggiuntive

Le opzioni aggiuntive dell'archivio si impostano come oggetto JSON:

| Chiave | Significato |
|---|---|
| `reason` | Inviato come `Reason` quando il riferimento non ne ha uno, per l'audit di CyberArk. |
| `check_ref` | Un riferimento che **Testa connessione** legge davvero. Senza, il test verifica solo che il CCP risponda e accetti l'AppID. |
| `timeout_ms` | Timeout della richiesta, predefinito 10000. |

Per esempio, per inviare un motivo e far leggere a **Testa connessione** un account di prova:

```json
{ "reason": "AnsibleForms", "check_ref": "Safe=Test;Object=ansibleforms-probe" }
```
