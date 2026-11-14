---
layout: default
title: Mail
parent: Canali di notifica
nav_order: 1
translated_from: 8348d14d37bdc4afc9b68869be9fe8021197597e
---

# Mail
{: .no_toc }

I server mail, quello predefinito, e come accedono
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Il canale mail

Un canale mail è il server tramite cui l'app invia le sue mail: un server SMTP, o Microsoft 365 dalla 7.6.0. Puoi tenerne più di uno;
quello contrassegnato come **Predefinito** è il server con cui l'app invia le sue mail quando un modulo non indica nessun canale mail:

| Passaggio | Campo | Significato |
|---|---|---|
| Credenziali | Credenziale | Una credenziale **smtp** di [Connessioni > Credenziali](../credentials.html) (il server mail, la sua porta e il TLS, e l'accesso), o una credenziale **Microsoft Entra ID** per inviare tramite [Microsoft 365](microsoft-365.html). Facoltativa dalla 7.6.0: senza, si invia tramite il server mail del canale stesso, vedi sotto. |
| Credenziali | Server mail, Porta mail, Usa TLS | Solo senza credenziale: il server tramite cui il canale invia senza accesso (un relay). **Server mail** è allora obbligatorio. |
| Credenziali | Invia tramite | Solo con una credenziale Microsoft Entra ID: **Microsoft Graph** (il predefinito) o **SMTP (OAuth2)**, vedi [Microsoft 365](microsoft-365.html). |
| Mittente | Mittente mail | L'indirizzo del mittente che vedono i destinatari. Con Microsoft 365, la casella di posta da cui parte la mail. |

---

## Un relay senza accesso

Un server mail che accetta mail senza accesso (un relay) si può usare in due modi, ed entrambi inviano senza autenticazione:

- **Una credenziale smtp con solo il suo server**: il suo **Utente (facoltativo)** e la sua **Password (facoltativa)** restano vuoti.
- **Nessuna credenziale** (dalla 7.6.0): il passaggio **Credenziali** chiede il **Server mail**, la **Porta mail** e **Usa TLS** del canale.

Un canale che indica una credenziale con il proprio server dimentica un server digitato prima sul canale stesso.

---

## Il canale predefinito

Il primo canale mail diventa il predefinito, e **Imposta come predefinito** nel menu della riga lo sposta su un altro. L'interruttore
**Predefinito** nella scheda **Dettagli** della pagina di un canale mail fa lo stesso.

Dalla 7.6.0, l'app non invia nessuna mail finché nessun canale mail è il predefinito, o finché quello predefinito è disattivato. Prima,
ricadeva sulle impostazioni mail della pagina delle impostazioni o del config seed. L'aggiornamento alla 7.6.0 trasforma quelle impostazioni
nel canale mail predefinito `default` quando nessun canale mail era ancora attivo: con un accesso, indica una nuova credenziale smtp
`mail-login`; per un relay, ha il proprio server e nessuna credenziale. Nel [config seed](../seed/), dichiara un canale mail sotto
`notification_channels:` (vedi [Esempio](../seed/example.html)): le vecchie chiavi `mail_*` sotto `settings:` funzionano ancora ma sono deprecate.
