---
layout: default
title: Ottenere aiuto
nav_order: 3
translated_from: dfdabe97bba34b6e588429ab17c3c458a136c81c
---

# Ottenere aiuto
{: .no_toc }

Dove fare una domanda, segnalare un bug o un problema di sicurezza, e proporre un miglioramento
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Prima di chiedere

La maggior parte delle risposte è già scritta da qualche parte; una rapida occhiata spesso evita un giro di domande e risposte:

1. Cerca in questo sito con la casella di ricerca in cima a ogni pagina.
2. Cerca il messaggio di errore esatto in [Risoluzione dei problemi](troubleshooting.html), e dai un'occhiata alle [FAQ](faq.html).
3. Controlla il log del server (**Impostazioni**, poi **Log del server**) e la pagina **Stato**, che segnalano la maggior parte dei problemi di configurazione.
4. Controlla il [Changelog](changelog.html): il problema potrebbe essere già risolto in una release più recente.

---

## Dove andare

Ogni tipo di richiesta ha il suo posto, tutti su GitHub:

| Vuoi | Vai a |
|---|---|
| Fare una domanda o condividere un'idea | [Discussions](https://github.com/ansibleforms/ansibleforms/discussions) |
| Segnalare un bug | [New issue → Bug report](https://github.com/ansibleforms/ansibleforms/issues/new/choose) |
| Proporre una funzionalità | [New issue → Feature request](https://github.com/ansibleforms/ansibleforms/issues/new/choose) |
| Segnalare un problema di sicurezza | [Report a vulnerability](https://github.com/ansibleforms/ansibleforms/security/advisories/new), in privato |
| Correggere o migliorare questa documentazione | **Edit this page on GitHub** in fondo a qualsiasi pagina, o una [issue sul sito](https://github.com/ansibleforms/website/issues) |

---

## Segnalare un bug

Una segnalazione riproducibile viene risolta più in fretta. Il template per i bug chiede quanto segue:

* **Versione** : mostrata sotto **Informazioni** nel menu di aiuto (**?**) della barra in alto
* **Distribuzione** : Docker, Docker Compose, Kubernetes, l'installer (e il suo motore), un'installazione nativa o dai sorgenti
* **Passi per riprodurre** : cosa hai fatto, cosa ti aspettavi, e cosa è successo invece
* **Prove** : le righe rilevanti del log del server, e uno screenshot quando il problema è visibile

Per un problema con un modulo, includi una definizione minima del modulo che lo mostri. Togli password, token, nomi host e qualsiasi
altro dato privato da log e moduli prima di pubblicarli: issue e discussioni sono pubbliche.

---

## Segnalare un problema di sicurezza

**Non aprire mai una issue pubblica per questo:** usa [Report a vulnerability](https://github.com/ansibleforms/ansibleforms/security/advisories/new), che vedono solo i maintainer.

La [politica di sicurezza](https://github.com/ansibleforms/ansibleforms/blob/main/SECURITY.md) elenca le versioni supportate e
cosa succede dopo la segnalazione.
