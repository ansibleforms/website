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

Categories, rols i constants per a tots els formularis
{: .fs-6 .fw-300 }

---

Per a administradors: el fitxer config.yaml que conté les categories, els rols i les constants que comparteixen tots els formularis.

AnsibleForms utilitza un fitxer config.yaml per configurar categories, rols i constants. Si no se n'hi proporciona cap, se'n genera un amb una configuració mínima. La configuració també es pot importar a la base de dades, i llavors ja no cal cap fitxer config.yaml, i cadascuna de les tres parts es pot guardar en un repositori git.

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

Des de la 7.8.0 les categories, els rols i les constants es llegeixen cadascun per separat, de la primera font de la llista que el contingui.

1. **DES D'UN REPOSITORI** : el repositori amb el tipus d'ús **Categories**, **Rols** o **Constants**, del fitxer que dona
   `controller_categories:`, `controller_roles:` o `controller_constants:`, amb qualsevol nom i a qualsevol carpeta (vegeu
   [Configuració a git](../repositories/config-as-code.html#roles-categories-and-constants))
2. **DES DEL config.yaml DEL REPOSITORI** : la clau simple al `config.yaml` d'aquest repositori, obsoleta des de la 7.8.0 i que ja no
   es llegeix a la 8.0; el log del servidor, la sortida del pull i la pàgina del repositori ho indiquen
3. **DES DE LA BASE DE DADES** : la configuració importada a la base de dades, només quan `ENABLE_CONFIG_IN_DATABASE=1`, o quan aquesta
   variable no està definida i l'origen de configuració desat a la base de dades és `database` (una còpia buida recorre al fitxer)
4. **DES D'UN FITXER LOCAL** : el fitxer local `config.yaml` (variable d'entorn CONFIG_PATH)

{: .warning }
> **Nota:** L'interruptor **Utilitzar per a la configuració ?** ha desaparegut des de la 7.8.0. Una actualització dona **Rols**, **Categories**
> i **Constants** al repositori que el tenia, i `use_for_config` al config seed o a l'API és un àlies obsolet dels tres.

---

## En aquesta secció

El fitxer té tres atributs de primer nivell, i cadascun té la seva pròpia pàgina:

| Pàgina | Què hi trobaràs |
|---|---|
| [Categories](categories.html) | Agrupa els formularis del tauler en un arbre de categories amb icones |
| [Rols](roles.html) | Assigna usuaris i grups a rols, i defineix què pot fer cada rol |
| [Constants](constants.html) | Objectes lliures que tots els formularis poden reutilitzar |
