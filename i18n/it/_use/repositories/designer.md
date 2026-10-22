---
layout: default
title: Designer e push
parent: Repository Git
nav_order: 4
translated_from: 9f1f2463b8bc0fb3c8b5b934435c305fef1f7f20
---

# Designer e push
{: .no_toc }

Modificare i moduli nel designer e inviarli al repository con push
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Modificare e fare il push dal designer

Con un repository usato per i moduli, il designer modifica i file nella sua copia di lavoro e li invia di nuovo al remoto con push.

| Pulsante | Cosa fa |
|---|---|
| **Salva (locale)** | Scrive i moduli e `config.yaml` nelle copie di lavoro, senza fare commit |
| **Salva (repository)** | Fa il commit e il push delle modifiche salvate; attivo quando ci sono modifiche non ancora inviate |
| **Carica (repository)** | Fa il pull dei repository dei moduli e ricarica il designer, dopo una conferma se ci sono modifiche non salvate |

I moduli restano nel loro repository; quelli nuovi attendono, già utilizzabili, in [`FORMS_STAGING_PATH`](../customization/paths.html#env_FORMS_STAGING_PATH) finché non fai il push.
Un modulo salvato in una sottocartella mantiene il suo percorso relativo: `team/deploy.yaml` viene inviato in `team/deploy.yaml` sotto la cartella dei moduli
del repository. Un nuovo modulo il cui percorso esiste già lì non viene sovrascritto; resta nello staging, quindi rinominalo.
Con più repository di moduli, **Salva (repository)** e **Carica (repository)** chiedono quale, proponendo per primo quello con `config.yaml`.

Un push mette in stage tutte le modifiche, ne fa il commit come `AnsibleForms` con il messaggio `Forms sync by <user>`, poi fa il fetch, il rebase sul
remoto e il push, riprovando fino a cinque volte. Un conflitto di rebase viene annullato e i file in conflitto vengono elencati;
correggili nel remoto, oppure usa **Reimposta** nella pagina Repository. **Push** nella pagina Repository fa la stessa cosa.

Quando un unico repository di moduli viene clonato vuoto, AnsibleForms copia il `config.yaml` locale e i moduli nella sua copia
di lavoro, così un push (**Salva (repository)**, o **Push** nella pagina Repository) li pubblica. Altro sul designer si trova in [Designer e git](../gui/designer-and-git.html).
