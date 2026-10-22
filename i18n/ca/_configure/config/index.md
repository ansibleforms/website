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

Categories, rols i constants per a tots els formularis
{: .fs-6 .fw-300 }

---

Per a administradors: el fitxer config.yaml que conté les categories, els rols i les constants que comparteixen tots els formularis.

AnsibleForms utilitza un fitxer config.yaml per configurar categories, rols i constants. Si no se n'hi proporciona cap, se'n genera un amb una configuració mínima. La configuració també es pot importar a la base de dades, i llavors ja no cal cap fitxer config.yaml.

---

## Visió general

El fitxer config.yaml conté la configuració de les categories, els rols i les constants que utilitza AnsibleForms.

**VÍDEO**: [Crea el teu primer formulari](https://www.youtube.com/watch?v=lIhYZ9Et5Ic)

El config.yaml mínim següent serveix com a punt de partida. Només conté la categoria obligatòria `Default` i els rols obligatoris `admin` i `default`.

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

## Prioritat de càrrega de la configuració

AnsibleForms carrega el fitxer config.yaml en l'ordre següent (guanya la primera coincidència):

1. **DES DE LA BASE DE DADES** : la configuració importada a la base de dades, només quan `ENABLE_CONFIG_IN_DATABASE=1`, o quan aquesta
   variable no està definida i l'origen de configuració desat a la base de dades és `database` (una còpia buida recorre al fitxer)
2. **DES D'UN REPOSITORI (use_for_config)** : el repositori amb l'interruptor "utilitzar per a la configuració" activat (nou a la 6.1.0)
3. **DES D'UN REPOSITORI (use_for_forms)** : el repositori amb l'interruptor "utilitzar per als formularis" activat (alternativa per compatibilitat amb versions anteriors)
4. **DES D'UN FITXER LOCAL** : el fitxer local `config.yaml` (variable d'entorn CONFIG_PATH)

{: .warning }
> **Nota:** Activa "utilitzar per a la configuració" en un sol repositori. Si n'hi ha diversos que el tenen activat, es registra un avís i s'utilitza el primer.

---

## En aquesta secció

El fitxer té tres atributs de primer nivell, i cadascun té la seva pròpia pàgina:

| Pàgina | Què hi trobaràs |
|---|---|
| [Categories](categories.html) | Agrupa els formularis del tauler en un arbre de categories amb icones |
| [Rols](roles.html) | Assigna usuaris i grups a rols, i defineix què pot fer cada rol |
| [Constants](constants.html) | Objectes lliures que tots els formularis poden reutilitzar |
