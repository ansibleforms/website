---
layout: default
title: Segnalare una vulnerabilità
nav_order: 4
translated_from: 382775f2312f05fd6dcd85154cb81c2709000d69
---

# Segnalare una vulnerabilità
{: .no_toc }

Come segnalare in privato un problema di sicurezza, e cosa succede dopo
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Segnalalo in privato

AnsibleForms custodisce credenziali e token di vault, quindi non segnalare mai un problema di sicurezza in una issue pubblica:

1. Apri **[Report a vulnerability](https://github.com/ansibleforms/ansibleforms/security/advisories/new)**: un advisory privato visibile solo ai maintainer.
2. Se quella pagina non è disponibile per te, apri una normale issue che dica soltanto che hai una segnalazione di sicurezza e chieda
   un canale privato: nessun dettaglio, nessun modo per riprodurlo, nessun numero di versione. Un maintainer apre un advisory privato e
   ti invita.

La policy completa è il [SECURITY.md](https://github.com/ansibleforms/ansibleforms/blob/main/SECURITY.md) del repository.

---

## Cosa includere

Più di queste informazioni contiene una segnalazione, più velocemente viene corretta:

* Cosa ottiene un attaccante: i dati di un altro utente, un playbook che non potrebbe eseguire, l'host, o diritti di amministratore.
* La versione, e come è distribuita: Docker, Kubernetes, o installata in modo nativo.
* Un modo per riprodurlo, o la richiesta che lo innesca.
* Se richiede un utente autenticato, e con quali [opzioni di ruolo](../config/roles.html).

---

## Cosa succede dopo

Una segnalazione passa per lo stesso advisory privato dal primo messaggio alla pubblicazione:

| Passo | Cosa ricevi |
|---|---|
| Presa in carico | La conferma che la segnalazione è arrivata, e se si riesce a riprodurla |
| Accettata | Una correzione nella prossima release di ogni [versione supportata](development.html#supported-versions), e un advisory pubblicato che ti cita, a meno che tu preferisca non essere nominato |
| Respinta | La motivazione, di solito che il comportamento richiede un permesso che chi l'ha segnalato aveva già |

Una volta rilasciata la correzione, l'advisory viene pubblicato e compare in [Advisory di sicurezza](advisories.html).

---

## Ambito

La policy traccia il confine dove lo traccia il modello dei ruoli:

| Nell'ambito | Fuori ambito |
|---|---|
| Qualsiasi cosa un utente autenticato possa raggiungere oltre ciò che gli concede il suo ruolo | Risultati che richiedono che l'account admin sia già compromesso: un admin che esegue qualsiasi playbook è il prodotto stesso |
| Qualsiasi cosa raggiungibile senza accedere | Report di scanner senza un impatto dimostrato |
| Credenziali salvate che diventano leggibili, o scritte in un log | |
| Injection nella shell, nel database o nel browser | |
