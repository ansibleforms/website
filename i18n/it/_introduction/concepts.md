---
layout: default
title: Concetti
nav_order: 4
translated_from: d62ee1e491a725a384186e3909ae1f9cee654bde
---

# Concetti
{: .no_toc }

I termini usati in questa documentazione, ognuno collegato alla sua pagina
{: .fs-6 .fw-300 }

---

## Glossario

I termini usati in questa documentazione:

| Termine | Significato |
|---|---|
| **[Modulo](forms/)** | Una definizione YAML che raccoglie input ed esegue un playbook, un template o un workflow |
| **[Campo del modulo](formfields/)** | Un input di un modulo, come `text`, `enum` o `checkbox`; il suo valore diventa un'extravar |
| **[Categoria](config/categories.html)** | Un gruppo nell'albero dei moduli mostrato nella pagina Moduli, definito in `config.yaml` |
| **[Ruolo](config/roles.html)** | Un insieme di utenti e gruppi; un modulo elenca i ruoli che possono vederlo ed eseguirlo, `default` per tutti |
| **[Espressione](expressions/)** | JavaScript che calcola il valore di un campo, nel browser (`runLocal: true`) o sul server |
| **[Extravars](formfields/)** | Le variabili inviate al playbook o al template, costruite dai valori dei campi |
| **[Credenziale](expressions/credentials.html)** | Un login salvato, cifrato con `ENCRYPTION_SECRET`: un utente e una password (e host, porta, database), o dalla 7.3.0 l'indirizzo e i segreti di una directory LDAP, di un provider SSO, di un runner o di un HashiCorp Vault |
| **[Archivio di segreti](secret-stores/)** | Una connessione a HashiCorp Vault o CyberArk che fornisce l'utente e la password di una credenziale |
| **[Job](gui/forms-and-jobs.html)** | Un'esecuzione di un modulo, con il suo stato, le extravars e l'output, conservata nella cronologia dei job |
| **[Runner](runners.html)** | Dove gira un job, aggiunto in **Connessioni > Runner**: `rte` per i playbook, `awx` (AWX, o la variante `aap` o `ascender`), `semaphore`, `rundeck` o `jenkins` per template e job. Un modulo ne sceglie uno con `runner:`, o gira sul runner predefinito `rte` (playbook) o `awx` (template) |
| **[RTE](rte/)** | Un ambiente di runtime: il server AnsibleForms avviato con `AF_ROLE=rte` nel suo container, accanto a python e ansible, che esegue i playbook di un runner di tipo `rte` |
| **[Punto di approvazione](forms/approval.html)** | Una pausa in un job finché un utente con un ruolo di approvazione non lo approva o lo rifiuta |
| **[Workflow](workflows/)** | Un grafo di playbook, approvazioni e altri workflow collegati in caso di successo, di fallimento o sempre, con la sintassi di AWX |
| **[Modulo multistep](forms/multistep.html)** | Deprecato dalla 7: un modulo che esegue più playbook o template in sequenza; lo sostituisce un workflow |
| **[Canale di notifica](notification-channels.html)** | Un server di posta, un webhook di Slack o Teams, una chat Telegram o un webhook a cui vanno le notifiche e le richieste di approvazione |
| **[Designer](designer/)** | L'editor nel browser per moduli, playbook, inventari e workflow, usato da una persona alla volta |
| **[Subform](forms/subform.html)** | Un insieme riutilizzabile di campi che descrive le righe di un campo `list` o l'oggetto di un campo `yaml` |
| **[config.yaml](config/)** | Il file con le categorie, i ruoli e le costanti; i moduli stanno nei loro file |
| **[Config seed](seed/)** | Un file YAML (`CONFIG_SEED_PATH`) che dichiara gli oggetti di amministrazione, come runner e credenziali |
| **[Cartella persistente](customization/paths.html)** | La cartella che contiene i file che AnsibleForms deve conservare tra riavvii e aggiornamenti |
