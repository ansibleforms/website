---
layout: default
title: Account locali
parent: Autenticazione
nav_order: 1
translated_from: 002a371f2b4dbe5cc9c99ee569b8cf17a2a4ac88
---

# Account locali
{: .no_toc }

L'admin integrato, e gli utenti e i gruppi salvati nel database di AnsibleForms
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## L'admin integrato

Ogni avvio crea il gruppo locale `admins` e l'utente admin se mancano; tre variabili controllano l'admin:

| Variabile | Predefinito | Significato |
|---|---|---|
| [`ADMIN_USERNAME`](../customization/server.html#env_ADMIN_USERNAME) | `admin` | Nome utente dell'admin, creato nel gruppo `admins` quando nessun utente ha quel nome. |
| [`ADMIN_PASSWORD`](../customization/server.html#env_ADMIN_PASSWORD) | `AnsibleForms!123` | Password assegnata all'admin quando viene creato (o reimpostato). |
| [`REINIT_ADMIN`](../customization/server.html#env_REINIT_ADMIN) | `0` | `1` reimposta la password dell'admin a `ADMIN_PASSWORD` e lo rimette in `admins`. |

`ADMIN_PASSWORD` si usa solo quando l'utente viene creato o reimpostato: cambiarla dopo non ha alcun effetto da sola.

Un utente locale che accede con la password predefinita pubblica `AnsibleForms!123` può solo cambiarla. Il browser apre una
pagina di cambio password che non si può chiudere, e il server risponde a ogni altra richiesta con `403` (codice
`password_change_required`) finché la password non viene cambiata. La nuova password deve essere diversa da quella predefinita; dopo il
cambio, l'utente accede di nuovo con quella. Imposta `ADMIN_PASSWORD` con un tuo valore prima del primo avvio per saltare questo passaggio.

Cambiare `ADMIN_USERNAME` dopo il primo avvio crea un secondo utente admin con quel nome; quello vecchio resta.

{: .warning }
> `REINIT_ADMIN=1` reimposta la password a **ogni** avvio finché è impostata. Usala per recuperare una password dell'admin persa,
> poi rimuovila e riavvia.

---

## Utenti e gruppi

Gli utenti e i gruppi locali si gestiscono in **Accesso > Utenti** e **Accesso > Gruppi**. Un utente ha questi campi:

| Campo | Significato |
|---|---|
| Nome utente | Il nome di accesso. Deve essere unico. |
| Descrizione | Facoltativa. |
| Password | Salvata come hash. Cambiala in seguito con l'azione **Cambia password**. |
| Email | Facoltativa. |
| Gruppo | Il primo gruppo locale dell'utente. Aggiungine altri nella scheda **Gruppi** della pagina dell'utente. |

Gli utenti locali cambiano la propria password nel loro profilo; gli altri utenti lo fanno nella loro directory o nel loro identity provider.

Un utente può appartenere a più gruppi, e riceve i ruoli di tutti. La scheda **Gruppi** della pagina di un utente aggiunge e
rimuove gruppi, e lo stesso fa la scheda **Utenti** della pagina di un gruppo. Un utente conserva almeno un gruppo: l'ultimo non si può
rimuovere.

Un gruppo che ha ancora utenti non si può eliminare: rimuovi prima i suoi utenti. Il gruppo `admins` non si può mai eliminare né
rinominare, e l'utente `admin` non si può mai eliminare.

---

## Consentire l'accesso

La scheda **Dettagli** della pagina di un utente ha un interruttore **Consenti accesso**, offerto anche come **Blocca accesso** e **Consenti
accesso** nel menu di riga della lista degli utenti. Esiste allo stesso modo per gli utenti locali e per gli utenti LDAP e SSO:

- **Attivo**: l'utente accede come al solito.
- **Disattivo**: le sessioni dell'utente terminano subito e ogni accesso viene rifiutato, finché un admin non lo riattiva. La pagina
  chiede prima una conferma.

L'interruttore non si può disattivare per l'utente `admin`, la via per rientrare, né può farlo un admin per il proprio account. La pagina di
un utente LDAP o SSO ha anche **Termina sessioni**, che disconnette l'utente ovunque senza bloccarlo.

---

## Corrispondenza con i ruoli

I ruoli indicano i gruppi locali come `local/<group>` e gli utenti come `local/<user>`; per impostazione predefinita `admins` riceve `admin`:

```yaml
roles:
  - name: admin
    groups:
      - local/admins
  - name: operator
    groups:
      - local/operators
    users:
      - local/svc-backup
```

Tieni `local/admins` nel ruolo `admin`, così l'admin integrato può sempre accedere, anche quando la directory o
l'identity provider non sono disponibili. Quando config.yaml non si riesce a caricare affatto, i membri di `local/admins` ricevono comunque il
ruolo `admin`, così puoi accedere e correggerlo. Vedi [Ruoli](../config/roles.html) per le opzioni dei ruoli.

---

## Account locali e LDAP

Un accesso con nome utente e password verifica gli utenti locali prima di LDAP. Quando un utente locale ha lo stesso nome di un utente
della directory, vince sempre l'account locale e la password della directory non funziona per quel nome. Dai agli account locali nomi
che non possano entrare in conflitto con gli account della directory, per esempio con un prefisso `svc-`.
