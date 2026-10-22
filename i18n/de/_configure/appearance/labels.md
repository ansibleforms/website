---
layout: default
title: Labels
parent: Erscheinungsbild
nav_order: 6
redirect_from:
  - /appearance/environment.html
translated_from: 2b439f61976fc2cc161250c82c629ec40713ef2c
---

# Labels
{: .no_toc }

Labels neben dem Logo, die zeigen, welche Instanz das ist
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Die Liste

Ab 7.3.0 enthält **Einstellungen > Erscheinungsbild > Labels** mehrere Labels neben dem Logo der Kopfzeile, etwa PRODUCTION und EU:

| Spalte | Bedeutung |
|---|---|
| **Aktiviert** | Ob das Label neben dem Logo und auf der Anmeldeseite erscheint |
| **Label** | Sein Text, so dargestellt wie die farbige Pille in der Kopfzeile |

Die Zeilen stehen in der Reihenfolge der Kopfzeile. Ein Klick auf eine Zeile oder **Bearbeiten** im Menü der Zeile öffnet die Seite des Labels; das Menü der Zeile enthält außerdem
**Aktivieren** oder **Deaktivieren**, je nachdem, was zutrifft, **Nach oben** und **Nach unten**, um die Reihenfolge zu ändern, sowie **Löschen**.

Die Kopfzeile und die Anmeldeseite zeigen die aktivierten Labels in ihrer Reihenfolge. Ab dem vierten fasst ein graues **+N** die übrigen in seinem Tooltip zusammen,
und ein Smartphone zeigt das erste Label und das **+N**. Ein gespeichertes Label erscheint sofort in jedem geöffneten Browser.

---

## Ein Label hinzufügen

**Label hinzufügen** öffnet einen Dialog mit den beiden Feldern des Labels, beide erforderlich:

| Feld | Bedeutung |
|---|---|
| **Label** | Der Text des Labels, etwa PRODUCTION |
| **Farbe** | Blau, Grün, Bernstein, Orange, Rot oder Grau, als runde Farbfelder; anfangs Rot |

Eine Vorschau zeigt die Kopfzeile mit jedem aktivierten Label und dem neuen, während es eingegeben wird. Ein neues Label ist aktiviert und kommt nach den
anderen. Seine Seite hat einen Tab, **Details**, mit denselben Feldern, dem Schalter **Aktiviert**, der sofort gespeichert wird, und der Vorschau.

---

## Das Umgebungslabel aus 7.2

Bis 7.2 legte **Einstellungen > Erscheinungsbild > Umgebung** ein einziges Label neben dem Logo fest.

Mit nur einem Label zeigen PRODUCTION EU und PRODUCTION US beide PRODUCTION, wenn mehrere Instanzen nebeneinander geöffnet sind. Ab 7.3.0
macht das Upgrade dieses Label zum ersten der Liste, mit seinem Text, seiner Farbe und dem Wissen, ob es angezeigt wurde, und die alte Adresse **Umgebung**
öffnet die Liste.

---

## Labels im Config-Seed

Ab 7.3.0 deklariert der [Config-Seed](../seed/) Labels in seinem Abschnitt `labels`, jedes mit seinem Text und optional seiner Farbe:

```yaml
labels:
  items:
    - name: PRODUCTION
      color: red
    - name: EU
      color: blue
      enabled: true
      position: 2
```

`color` ist eines von `blue`, `green`, `amber`, `orange`, `red` oder `grey`, und `position` ordnet sie, das niedrigste zuerst. Ein im Seed
deklariertes Label ist auf seiner Seite schreibgeschützt, wie jedes [verwaltete Objekt](../seed/managed-objects.html).
