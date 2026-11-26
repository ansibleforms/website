---
layout: default
title: config.yaml
nav_order: 5
has_children: true
has_toc: false
permalink: /config/
translated_from: 8919bfbc931f85d08a064e868a9a6bb42461525a
---

# config.yaml
{: .no_toc }

Categorieën, rollen en constanten voor alle formulieren
{: .fs-6 .fw-300 }

---

Voor beheerders: het bestand config.yaml met de categorieën, rollen en constanten die alle formulieren delen.

AnsibleForms gebruikt een bestand config.yaml om categorieën, rollen en constanten te configureren. Als er geen bestand is, wordt er een gegenereerd met een minimale configuratie. De configuratie kan ook in de database worden geïmporteerd, zodat er geen bestand config.yaml meer nodig is, en elk van de drie kan in een git-repository worden bewaard.

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

Sinds 7.8.0 worden de categorieën, de rollen en de constanten elk apart gelezen, uit de eerste bron hieronder die ze bevat.

1. **UIT EEN REPOSITORY** : de repository met het gebruikstype **Categorieën**, **Rollen** of **Constanten**, uit haar bestand met
   `controller_categories:`, `controller_roles:` of `controller_constants:`, met elke naam en in elke map (zie
   [Configuratie in git](../repositories/config-as-code.html#roles-categories-and-constants))
2. **UIT DE config.yaml VAN DE REPOSITORY** : de gewone sleutel in de `config.yaml` van die repository, verouderd sinds 7.8.0 en vanaf
   8.0 niet meer gelezen; de serverlog, de pull-uitvoer en de pagina van de repository melden dat
3. **UIT DE DATABASE** : de configuratie die in de database is geïmporteerd, alleen als `ENABLE_CONFIG_IN_DATABASE=1`, of als die
   variabele niet is ingesteld en de configuratiebron die in de database is opgeslagen `database` is (een lege kopie valt terug op het bestand)
4. **UIT EEN LOKAAL BESTAND** : het lokale bestand `config.yaml` (omgevingsvariabele CONFIG_PATH)

{: .warning }
> **Let op:** de schakelaar **Gebruiken voor configuratie** bestaat niet meer sinds 7.8.0. Een upgrade geeft **Rollen**, **Categorieën** en **Constanten**
> aan de repository die hem had, en `use_for_config` in de config seed of de API is een verouderde alias van de drie.

---

## In deze sectie

Het bestand heeft drie attributen op het hoogste niveau, en elk heeft een eigen pagina:

| Pagina | Wat er aan bod komt |
|---|---|
| [Categorieën](categories.html) | De formulieren op het dashboard groeperen in een boom van categorieën met pictogrammen |
| [Rollen](roles.html) | Gebruikers en groepen aan rollen koppelen, en instellen wat elke rol mag doen |
| [Constanten](constants.html) | Vrije objecten die elk formulier kan hergebruiken |
