---
layout: default
title: Versioni
parent: Disclaimer
nav_order: 2
translated_from: dcab4535a8f7e4aeaff321136564ab14d61dc3fa
---

# Versioni
{: .no_toc }

La pagina di una versione, e come cambiarne il testo come correzione o di nuovo per tutti
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## La pagina di una versione

Dalla 7.3.0 ogni versione ha una pagina propria, in `/settings/disclaimer/<version>`, con due schede:

| Scheda | Cosa contiene |
|---|---|
| **Dettagli** | Il titolo, il testo e l'etichetta della casella, e l'interruttore **Abilitato**, che viene salvato subito |
| **Accettazioni** | Chi ha accettato questa versione, vedi [Accettazioni](acceptances.html) |

**Anteprima** mostra la finestra di dialogo come la vedranno gli utenti, ed **Elimina** rimuove la versione con le sue accettazioni. La casella di ricerca sopra le
schede cerca in entrambe insieme: i campi corrispondenti in **Dettagli** e le righe corrispondenti in **Accettazioni**.

---

## Cambiare il testo

**Salva** su un titolo, un testo o un'etichetta della casella modificati che gli utenti hanno già accettato chiede **Chiedere di nuovo a tutti?**:

| Risposta | Cosa succede |
|---|---|
| **Chiedi di nuovo a tutti** | Le accettazioni di questa versione vengono cancellate, e ogni utente la accetta di nuovo alla sua richiesta successiva |
| **Mantieni come correzione** | Il testo viene riscritto, per esempio per un refuso, e le accettazioni continuano a valere: a nessuno viene chiesto di nuovo |

Una versione che nessuno ha ancora accettato si salva senza chiedere. Per conservare il testo accettato, [aggiungi una nuova versione](general.html#adding-a-version) e abilitala.
