---
layout: default
title: Designer und Push
parent: Git-Repositories
nav_order: 4
translated_from: 9f1f2463b8bc0fb3c8b5b934435c305fef1f7f20
---

# Designer und Push
{: .no_toc }

Formulare im Designer bearbeiten und ins Repository pushen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Aus dem Designer bearbeiten und pushen

Mit einem Repository, das für Formulare verwendet wird, bearbeitet der Designer die Dateien in dessen Arbeitskopie und pusht sie zurück zum Remote.

| Schaltfläche | Was sie macht |
|---|---|
| **Speichern (lokal)** | Schreibt die Formulare und `config.yaml` in die Arbeitskopien, ohne zu committen |
| **Speichern (Repository)** | Committet und pusht die gespeicherten Änderungen; aktiv, sobald es nicht gepushte Änderungen gibt |
| **Laden (Repository)** | Pullt die Formular-Repositories und lädt den Designer neu, nach einer Bestätigung, wenn Änderungen nicht gespeichert sind |

Formulare bleiben in ihrem Repository; neue warten, bereits nutzbar, in [`FORMS_STAGING_PATH`](../customization/paths.html#env_FORMS_STAGING_PATH), bis Sie pushen.
Ein in einem Unterordner gespeichertes Formular behält seinen relativen Pfad: `team/deploy.yaml` wird nach `team/deploy.yaml` unter dem Formularordner
des Repositorys gepusht. Ein neues Formular, dessen Pfad dort schon existiert, wird nicht überschrieben; es bleibt im Staging, benennen Sie es also um.
Mit mehreren Formular-Repositories fragen **Speichern (Repository)** und **Laden (Repository)**, welches gemeint ist, standardmäßig das mit `config.yaml`.

Ein Push stellt alle Änderungen bereit, committet sie als `AnsibleForms` mit der Nachricht `Forms sync by <user>`, holt dann die Änderungen, rebased auf
das Remote und pusht, mit bis zu fünf Wiederholungen. Ein Rebase-Konflikt wird abgebrochen, und die betroffenen Dateien werden aufgelistet;
beheben Sie sie im Remote oder verwenden Sie **Zurücksetzen** auf der Seite Repositories. **Push** auf der Seite Repositories macht dasselbe.

Wird ein einzelnes Formular-Repository leer geklont, kopiert AnsibleForms die lokale `config.yaml` und die Formulare in seine
Arbeitskopie, sodass ein Push (**Speichern (Repository)** oder **Push** auf der Seite Repositories) sie veröffentlicht. Mehr zum Designer steht unter [Designer und git](../gui/designer-and-git.html).
