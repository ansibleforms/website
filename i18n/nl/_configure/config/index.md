---
layout: default
title: config.yaml
nav_order: 5
has_children: true
has_toc: false
permalink: /config/
translated_from: 6c0e2d282bc1dc386b7392e3af1f60fea593f12b
---

# config.yaml
{: .no_toc }

Categorieën, rollen en constanten voor alle formulieren
{: .fs-6 .fw-300 }

---

Voor beheerders: het bestand config.yaml met de categorieën, rollen en constanten die alle formulieren delen.

AnsibleForms gebruikt een bestand config.yaml om categorieën, rollen en constanten te configureren. Als er geen bestand is, wordt er een gegenereerd met een minimale configuratie. De configuratie kan ook in de database worden geïmporteerd, zodat er geen bestand config.yaml meer nodig is.

---

## Overzicht

Het bestand config.yaml bevat de configuratie van de categorieën, rollen en constanten die AnsibleForms gebruikt.

**VIDEO**: [Je eerste formulier maken](https://www.youtube.com/watch?v=lIhYZ9Et5Ic)

De volgende minimale config.yaml dient als startpunt. Hij bevat alleen de verplichte categorie `Default` en de verplichte rollen `admin` en `default`.

```yaml
categories: # a list of categories to group forms
  - name: Default
    icon: bars
roles: # a list of roles
  - name: admin
    groups:
      - local/admins
  - name: default
    groups: []
    options:
      allowJobRelaunch: true
constants: {} # free objects to re-use over all forms
```

---

## Prioriteit bij het laden van de configuratie

AnsibleForms laadt het bestand config.yaml in de volgende volgorde (de eerste treffer wint):

1. **UIT DE DATABASE** : de configuratie die in de database is geïmporteerd, alleen als `ENABLE_CONFIG_IN_DATABASE=1`, of als die
   variabele niet is ingesteld en de configuratiebron die in de database is opgeslagen `database` is (een lege kopie valt terug op het bestand)
2. **UIT EEN REPOSITORY (use_for_config)** : de repository met de schakelaar "gebruiken voor configuratie" ingeschakeld (nieuw in 6.1.0)
3. **UIT EEN REPOSITORY (use_for_forms)** : de repository met de schakelaar "gebruiken voor formulieren" ingeschakeld (terugvaloptie voor achterwaartse compatibiliteit)
4. **UIT EEN LOKAAL BESTAND** : het lokale bestand `config.yaml` (omgevingsvariabele CONFIG_PATH)

{: .warning }
> **Let op:** schakel "gebruiken voor configuratie" op slechts één repository in. Als meerdere het ingeschakeld hebben, wordt een waarschuwing gelogd en wordt de eerste gebruikt.

---

## In deze sectie

Het bestand heeft drie attributen op het hoogste niveau, en elk heeft een eigen pagina:

| Pagina | Wat er aan bod komt |
|---|---|
| [Categorieën](categories.html) | De formulieren op het dashboard groeperen in een boom van categorieën met pictogrammen |
| [Rollen](roles.html) | Gebruikers en groepen aan rollen koppelen, en instellen wat elke rol mag doen |
| [Constanten](constants.html) | Vrije objecten die elk formulier kan hergebruiken |
