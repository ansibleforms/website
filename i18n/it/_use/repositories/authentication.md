---
layout: default
title: Autenticazione
parent: Repository Git
nav_order: 2
translated_from: 9e2bb180b35951e97851c21f388db0d7d54d4c73
---

# Autenticazione
{: .no_toc }

HTTPS con un token, SSH con la chiave generata, e comandi git personalizzati
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Autenticazione

Il modo in cui AnsibleForms si autentica dipende dalla forma dell'**URI**.

### HTTPS con un token

Per un remoto HTTPS privato, scegli una **Credenziale** il cui utente è l'utente git e la cui password è un personal access token
(o la password).

Dalla 7.3.0 git accede tramite `GIT_ASKPASS`: l'utente e il token vengono passati a ogni comando git che parla con il server, mai inseriti
nell'URL, quindi non restano nel `.git/config` del clone e un token cambiato viene usato al pull o push successivo. Il token richiede
accesso in lettura per il pull, e in scrittura per il push. Un remoto pubblico non richiede alcuna credenziale.

Fino alla 7.2.0 entrambi venivano inseriti nell'URL, come `https://<user>:<token>@git.example.com/team/forms.git`. Un clone fatto allora mantiene
quell'URL fino al suo pull o push successivo, che riporta il suo remoto all'**URI** del repository stesso.

### SSH con la chiave generata

Per un remoto SSH, AnsibleForms si autentica con una propria coppia di chiavi, che genera al primo avvio.

1. Apri **Impostazioni > Connessioni > SSH**, nella scheda **Chiave**, e copia la **Chiave pubblica**.
2. Aggiungila sul server git, come deploy key del repository (con accesso in scrittura se fai push), oppure a un utente che ha accesso.
3. Aggiungi il repository con un **URI** SSH, per esempio `git@git.example.com:team/forms.git`, e non scegliere alcuna credenziale.

La coppia di chiavi si trova in `.ssh/id_rsa` sotto [`HOME_PATH`](../customization/paths.html#env_HOME_PATH), quindi tieni quella cartella su
uno storage persistente, altrimenti la chiave cambia quando il container viene ricreato.

Su un clone con un URI `user@host:path`, AnsibleForms esegue prima `ssh-keyscan` sull'host e aggiunge la sua chiave agli
host conosciuti. Per gli altri remoti, aggiungi l'host nella scheda **Host conosciuti** di **Impostazioni > Connessioni > SSH** prima del
primo clone.

### Comandi git personalizzati

I comandi di clone, pull e push si possono sostituire, per esempio per aggiungere opzioni git, con tre impostazioni.

| Impostazione | Predefinito | Cosa aggiunge AnsibleForms |
|---|---|---|
| [`GIT_CLONE_COMMAND`](../customization/configuration.html#env_GIT_CLONE_COMMAND) | `git clone` | `-b <branch>`, `--verbose`, l'URI e il nome |
| [`GIT_PULL_COMMAND`](../customization/configuration.html#env_GIT_PULL_COMMAND) | `git pull` | `--verbose` |
| [`GIT_PUSH_COMMAND`](../customization/configuration.html#env_GIT_PUSH_COMMAND) | `git push` | `-u origin HEAD` |

Dalla 7.3.0 questi comandi girano senza shell: gli apici funzionano, ma un operatore di shell come `;`, `|`, `&&` o `>` viene rifiutato.
