---
layout: default
title: FAQ sulla valutazione
nav_order: 6
translated_from: 731a656c844e6262715e5c8d0a7a291e3b6321f2
---

# FAQ sulla valutazione
{: .no_toc }

Risposte brevi alle domande più frequenti dei questionari di sicurezza
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Dati e hosting

Dove si trovano i dati, e chi può raggiungerli:

| Domanda | Risposta |
|---|---|
| Dove vengono conservati i nostri dati? | Nel database MySQL o MariaDB che gestisci tu, e nella cartella persistente della tua istanza. AnsibleForms è self-hosted, senza alcun servizio cloud alle spalle. |
| Invia dati a chi lo sviluppa? | No. Non c'è telemetria, nessuna raccolta di dati d'uso e nessun controllo degli aggiornamenti. |
| A cosa si connette? | Solo ai sistemi configurati da un amministratore: vedi [Connessioni in uscita](measures.html#outbound-connections). |
| Usa l'IA o invia dati a un fornitore di modelli? | Solo con l'[assistente chat](../chat/) attivo, che per impostazione predefinita è disattivato. In quel caso invia le definizioni dei moduli e i valori in compilazione al fornitore che configuri. |
| Può funzionare senza accesso a Internet? | Sì. L'applicazione non ha bisogno di accesso a Internet; i playbook hanno bisogno di ciò che raggiungono i loro task. |

---

## Cifratura

Cosa viene cifrato, e con quali chiavi:

| Domanda | Risposta |
|---|---|
| I dati sono cifrati in transito? | Con [HTTPS](../security/https.html), servito dall'applicazione o dal tuo reverse proxy, e con `wss://` tra l'applicazione e i suoi ambienti di esecuzione. |
| I dati sono cifrati a riposo? | Ogni segreto salvato viene cifrato dall'applicazione con AES-256. I job e il loro output vengono salvati così come sono: usa la cifratura a riposo del database stesso. Vedi [Segreti salvati](measures.html#stored-secrets). |
| Chi detiene le chiavi? | Tu: l'[`ENCRYPTION_SECRET`](../security/secrets.html) lo imposti tu, resta fuori dai backup, e si può ruotare. |
| I segreti possono restare nel nostro vault? | Sì: [HashiCorp Vault e CyberArk](../secret-stores/) vengono letti quando un job ne ha bisogno. |

---

## Accesso e responsabilità

Chi può accedere, cosa può fare, e cosa viene registrato:

| Domanda | Risposta |
|---|---|
| Supporta il single sign-on? | Sì: LDAP / Active Directory, OpenID Connect ed Entra ID. Vedi [Autenticazione](../authentication/). |
| Supporta l'autenticazione a più fattori? | Tramite il single sign-on: vale l'MFA del tuo provider di identità. Gli account locali non ne hanno una propria. |
| Come vengono gestiti i permessi? | Con ruoli associati a gruppi, controllati dal server a ogni richiesta. Vedi [Permessi](measures.html#permissions). |
| C'è un registro di audit? | Sì: ogni modifica e ogni tentativo rifiutato, conservati per 365 giorni per impostazione predefinita e inoltrabili a syslog. Vedi [Traccia di audit](measures.html#audit-trail). |
| C'è una password predefinita? | Il primo account admin ha una password predefinita pubblica, che va cambiata al primo accesso. Vedi [L'account admin](../security/hardening.html#the-admin-account). |

---

## Vulnerabilità e aggiornamenti

Come i problemi vengono trovati, corretti e annunciati:

| Domanda | Risposta |
|---|---|
| Sono state trovate vulnerabilità? | Sì. Ognuna di quelle pubblicate è elencata in [Advisory di sicurezza](advisories.html), con la versione che l'ha corretta. |
| Come ne segnaliamo una? | In privato, tramite GitHub: vedi [Segnalare una vulnerabilità](reporting.html). |
| Come viene controllato il codice? | Analisi statica con CodeQL e revisione delle dipendenze su ogni pull request, test automatici, e aggiornamenti con Dependabot. Vedi [Sviluppo sicuro](development.html). |
| Quali versioni ricevono correzioni di sicurezza? | 7.x e 6.5.x. Vedi [Versioni supportate](development.html#supported-versions). |
| Come veniamo a sapere di un nuovo advisory? | Segui gli avvisi di sicurezza del repository su GitHub. Vedi [Essere avvisati dei nuovi advisory](advisories.html#being-told-of-new-advisories). |
| È stato sottoposto a penetration test? | Non è pubblicato alcun report di penetration test di terze parti. Il codice è pubblico, quindi il tuo team o il tuo tester può valutarlo, e i risultati si segnalano come descritto sopra. |

---

## Immagini e supply chain

Da dove vengono le immagini, e come verificarle:

| Domanda | Risposta |
|---|---|
| Dove vengono pubblicate le immagini? | Sul GitHub Container Registry, `ghcr.io/ansibleforms/ansibleforms`, costruite da workflow pubblici di GitHub Actions. Vedi [Release e immagini](development.html#releases-and-images). |
| I container girano come root? | No: con l'utente non privilegiato `node`. |
| Le immagini sono firmate? | Non ancora. Scaricale per digest (`@sha256:...`) per essere sicuro di eseguire l'immagine che hai revisionato. |
| C'è uno SBOM? | Non ne viene ancora pubblicato uno con le immagini. Uno scanner come Trivy o Syft ne costruisce uno a partire dall'immagine. |
| Le immagini vengono analizzate per le vulnerabilità? | Non nella pipeline di release. Le loro immagini base sono fissate per digest e mantenute aggiornate da Dependabot; analizza le immagini nel tuo registry per applicare la tua policy. |
| Con quale licenza è distribuito? | GPL-3.0, open source, senza garanzia. |
