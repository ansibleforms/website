---
layout: default
title: Amministrazione
parent: Tour dell'interfaccia
nav_order: 3
redirect_from:
  - /gui/settings.html
  - /gui/ldap-configuration.html
  - /gui/credential-manager.html
  - /gui/backups.html
  - /gui/restore.html
  - /gui/server-log.html
  - /gui/swagger-interface.html
translated_from: 65b6b65919b22de7d7973732ebd29647e20f3184
---

# Amministrazione
{: .no_toc }

Il menu Impostazioni: il sistema, il suo aspetto, l'accesso, le connessioni e i log
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Il menu Impostazioni

**Impostazioni** nell'intestazione apre le pagine di amministrazione, raggruppate nel menu a sinistra sotto **Sistema**, **Aspetto**,
**Accesso**, **Connessioni** e **Log**. Ogni voce compare solo a un utente con l'opzione di ruolo che la sua pagina richiede:
`allowBackupOps` per **Backup**, `showLogs` per **Log del server**, e `showSettings` per ogni altra pagina.
Dalla 7.3.0 tre opzioni ne aprono una parte senza il resto:

| Opzione di ruolo | Apre |
|---|---|
| `showAppearanceSettings` | Le pagine di **Aspetto** |
| `showConnectionsSettings` | Le pagine di **Connessioni**, tranne **Syslog**; repository, archivi di segreti e credenziali protette restano modificabili solo da un admin |
| `showAuditLog` | Il **Registro di audit** |

Vedi [Ruoli](../config/roles.html#role-options) per le opzioni di ruolo.

---

## Elenchi e pagine dei record

Dalla 7.3.0 gli elenchi delle impostazioni e le pagine dei record condividono un unico layout, con i loro controlli su una riga a sé sotto il titolo:

| Parte | Come funziona |
|---|---|
| Casella di ricerca | La prima di quella riga in ogni pagina delle impostazioni e pagina di record. Una parola restringe tutte le schede insieme: i campi, le righe o le linee corrispondenti compaiono sotto il nome della loro scheda |
| Righe per pagina | Una tabella mostra tante righe quante ne entrano nello schermo finché non si sceglie un numero di righe per pagina: 10, 20, 50 o 100 |
| Colonne | Ogni colonna con un nome si può ordinare, e una cella vuota mostra `–` |
| Caselle di controllo | Le righe le hanno solo dove si può fare qualcosa con le righe spuntate, e il menu della riga (⋮) offre la stessa azione |
| Menu della riga | Etichette brevi, come **Modifica** ed **Elimina**. Un elenco con una colonna **Abilitato** la mette per prima, e offre **Attiva** o **Disattiva** nel menu di ogni riga, a seconda dei casi |

Gli elenchi con una colonna **Abilitato** sono i provider SSO, le directory LDAP, i runner, le pianificazioni, i canali di
notifica, i server syslog, gli annunci, le etichette e le versioni del disclaimer.

---

## Sistema

L'istanza stessa: le sue impostazioni, il suo stato di salute e i suoi backup.

| Pagina | A cosa serve |
|---|---|
| **Generale** | Le variabili d'ambiente, in schede da Configurazione a Registrazione. Vedi [Variabili d'ambiente](../customization/). |
| **Stato** | Lo stato di salute dell'istanza e dei sistemi da cui dipende, nelle schede Controlli e Informazioni. Vedi [Monitoraggio](../production/monitoring.html). |
| **Backup** | Crea, ripristina ed elimina i backup del database, di config.yaml e dei moduli. Vedi [Backup](../production/backups.html). |

![Impostazioni > Generale, la scheda Configurazione](../assets/screenshots/settings.jpg)

### Backup

L'elenco dei backup, notturni e manuali: **Aggiungi backup** ne crea uno subito, e il menu di una riga ha **Mostra backup**, **Ripristina** ed **Elimina**.

![Impostazioni > Backup](../assets/screenshots/backups.jpg)

### Ripristino

**Ripristina** mostra cosa contiene il backup, poi lo ripristina; **Crea un nuovo backup prima del ripristino (consigliato)** è spuntato per impostazione predefinita.

![Ripristino di un backup](../assets/screenshots/restore.jpg)

---

## Aspetto

Come appare l'istanza per tutti, e i messaggi che mostra.

| Pagina | A cosa serve |
|---|---|
| **Valori predefiniti** | Il tema, la lingua, la vista dei moduli, il fuso orario e il formato della data degli utenti che non ne hanno scelto nessuno. Vedi [Valori predefiniti](../appearance/defaults.html). |
| **Nome** | Il nome nella scheda del browser e nella pagina di accesso. Vedi [Nome](../appearance/name.html). |
| **Logo** | Il tuo logo nell'intestazione. Vedi [Logo](../appearance/logo.html). |
| **Icona** | La tua icona nella scheda del browser. Vedi [Icona](../appearance/icon.html). |
| **Collegamenti** | Il link al Designer, e i tuoi link e menu nell'intestazione. Vedi [Collegamenti](../appearance/links.html). |
| **Etichette** | Etichette accanto al logo, come PRODUCTION ed EU. Vedi [Etichette](../appearance/labels.html). |
| **Annunci** | Messaggi sotto l'intestazione, ognuno dal suo inizio alla sua fine. Vedi [Annunci](../announcements.html). |

---

## Accesso

Chi può accedere, e cosa può fare una volta entrato.

| Pagina | A cosa serve |
|---|---|
| **Disclaimer** | Termini che ogni utente accetta una volta, e chi ha accettato quale versione. Vedi [Disclaimer](../disclaimer.html). |
| **Utenti** | Gli utenti locali, e quelli LDAP e single sign-on. Vedi [Utenti e gruppi](../users-and-groups.html). |
| **Gruppi** | I gruppi locali, e quelli LDAP e single sign-on. Vedi [Utenti e gruppi](../users-and-groups/local-group.html). |
| **Ruoli** | I ruoli di config.yaml: chi li ha e cosa consentono. Vedi [Ruoli](../config/roles.html). |
| **LDAP** | Accesso con una directory LDAP o Active Directory. Vedi [LDAP](../authentication/ldap.html). |
| **SSO** | Single sign-on con provider Entra ID o OpenID Connect. Vedi [Autenticazione](../authentication/). |

![Accesso > LDAP, la directory principale](../assets/screenshots/ldap.jpg)

---

## Connessioni

I sistemi che AnsibleForms raggiunge, e con cosa vi accede.

| Pagina | A cosa serve |
|---|---|
| **Repository** | I repository git da cui provengono i moduli e i playbook. Vedi [Repository Git](../repositories/). |
| **Credenziali** | Gli account e i segreti usati da moduli, playbook e connessioni. Vedi [Credenziali](../credentials.html). |
| **Archivi di segreti** | HashiCorp Vault e CyberArk, da cui si possono leggere le credenziali. Vedi [Archivi di segreti](../secret-stores/). |
| **Runner** | Dove girano i job: container RTE per i playbook, e AWX e simili per i template. Vedi [Runner](../runners.html). |
| **SSH** | La coppia di chiavi con cui l'app si collega a git, e gli host conosciuti. Vedi [SSH](../repositories/authentication.html#ssh-with-the-generated-key). |
| **Notifiche** | Server SMTP, Slack, Microsoft Teams, Telegram e webhook. Vedi [Canali di notifica](../notification-channels.html). |
| **Assistente chat** | Il fornitore di IA dell'assistente chat. Vedi [Assistente chat](../chat/). |
| **MCP** | Il server MCP per gli agenti di IA. Vedi [MCP](../mcp/). |
| **Syslog** | Server syslog che ricevono il log del server, il registro di audit, o entrambi. Vedi [Syslog](../production/logs.html#syslog). |

![Connessioni > Credenziali, la scheda Connessione di una credenziale](../assets/screenshots/credentials.jpg)

---

## Log

Cosa è successo sull'istanza.

| Pagina | A cosa serve |
|---|---|
| **Registro di audit** | Chi ha cambiato cosa, e se era consentito, filtrato per utente, azione ed esito. Vedi [Traccia di audit](../production/logs.html#audit-trail). |
| **Log del server** | Il log del server stesso, per la risoluzione dei problemi. Vedi [Log](../production/logs.html). |

### Log del server

Le ultime righe del log, le più recenti in fondo, seguite man mano che vengono scritte. La casella di ricerca le filtra (un'espressione
regolare), **Cancella** svuota la vista, non il log, e **Scarica** salva l'intero log.

![Log > Log del server](../assets/screenshots/logs.jpg)

---

## Documentazione API

**Documentazione API** nel menu di aiuto (il punto interrogativo nell'intestazione) porta alla Swagger UI dell'API REST su `/api/v2/docs`.
Vedi [API](../api/).

![Interfaccia Swagger](../assets/screenshots/swagger.jpg)
