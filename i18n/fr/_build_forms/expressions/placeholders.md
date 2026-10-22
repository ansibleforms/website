---
layout: default
title: Espaces réservés
parent: Expressions
nav_order: 0.5
translated_from: bd63e437a4f77c707a1bf8d8ee99b1516063b62a
---

# Espaces réservés
{: .no_toc }

Faire référence à un autre champ, à une constante ou à l'utilisateur actuel avec `$(...)`
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Qu'est-ce qu'un espace réservé

Un espace réservé est une référence écrite sous la forme `$(reference)`. Il est remplacé par une valeur avant que le texte qui le contient soit utilisé.

Les espaces réservés fonctionnent dans `expression`, `query` et `default` (évalué avec `evalDefault`) d'un champ, ainsi que dans son `label`,
son `help` et son `placeholder`. Un champ qui contient un espace réservé dépend du champ qu'il nomme : il attend que ce champ ait une
valeur, et il est réévalué chaque fois que cette valeur change. C'est ainsi que l'on construit des listes déroulantes en cascade.

```yaml
- name: city
  type: enum
  values: [Amsterdam, Brussels]
- name: datacenter
  type: enum
  dbConfig: { name: CMDB, type: mysql }
  query: select name from cmdb.datacenter where city='$(city)'
```

---

## À quoi un espace réservé peut faire référence

Un espace réservé nomme un champ du formulaire, ou l'une des références suivantes, présentes dans tout formulaire :

| Référence | Ce qu'elle contient |
|---|---|
| `$(field)` | la valeur d'un autre champ du formulaire |
| `$(name)`, une constante | une [constante](../config/constants.html) de `config.yaml`, ou une valeur des `varsFiles` du formulaire |
| `$(__user__)` | l'utilisateur connecté : `username`, `type`, `groups`, `roles` |
| `$(__parent__.field)` | dans un [sous-formulaire](../forms/subform.html) (une ligne de liste, une étape d'assistant), une valeur du formulaire parent |

```yaml
expression: "'$(__user__.username)'"
expression: $(__user__.groups)
```

---

## Accéder à une partie d'une valeur

La notation par point et par index lit une partie d'une valeur, tant que le chemin ne contient que des lettres, des chiffres, `_`, `-`, `.` et `[n]` :

| Espace réservé | Sur | Donne |
|---|---|---|
| `$(field)` | un champ texte, nombre ou mot de passe | la valeur |
| `$(field)` | un enum d'enregistrements | la `placeholderColumn` de l'enregistrement sélectionné, sinon sa première colonne |
| `$(field.col)` | un enum d'enregistrements | cette colonne de l'enregistrement sélectionné |
| `$(field)` | un enum avec `multiple: true` | la colonne choisie de chaque enregistrement sélectionné, sous forme de tableau |
| `$(field)` | une expression, une liste ou une constante | la valeur entière (une liste donne ses lignes) |
| `$(field.a.b)`, `$(f[0].x)` | une expression, une liste ou une constante | cette partie de l'objet ou du tableau |

Définir `placeholderColumn: "*"` sur un enum fait que `$(field)` donne tout l'enregistrement sélectionné au lieu d'une seule colonne.

```yaml
- name: city
  type: enum
  dbConfig: { name: CMDB, type: mysql }
  query: select id, name from cmdb.city
  valueColumn: name
  placeholderColumn: id        # $(city) gives the id; $(city.name) still gives the name
- name: servers
  type: expression
  expression: "[{name: 'web1'}, {name: 'web2'}]"
  runLocal: true
- name: first_server
  type: expression
  expression: $(servers[0].name)   # 'web1'
  runLocal: true
```

---

## Comment la valeur est insérée

La manière dont une valeur est insérée dans le texte dépend de l'endroit où se trouve l'espace réservé.

| Où | Exemple | Devient |
|---|---|---|
| une expression, hors guillemets | `$(count) + 1` | un littéral JavaScript : un nombre reste un nombre, un texte devient une chaîne entre guillemets, un objet ou un tableau un littéral |
| une expression, une chaîne entre guillemets entière | `fn.fnLs('$(dir)')` | le même littéral, guillemets compris, pour qu'une valeur contenant un guillemet ne puisse pas en sortir |
| une expression, à l'intérieur d'une chaîne plus longue | `'$(dir)/vars'` | le texte, échappé pour cette chaîne |
| une requête, un libellé, un texte d'aide | `where city='$(city)'` | le texte |

Un champ dont les espaces réservés ne peuvent pas encore tous être résolus n'est pas évalué ; avec `ignoreIncomplete: true`, une valeur manquante est
insérée sous la forme `undefined` à la place.

### Backticks et `${` dans une valeur

Depuis la 7.3.0, une valeur de champ ne peut pas s'exécuter comme du code quand le serveur l'insère dans une expression (expressions distantes, validation
au lancement, MCP et chat). Un backtick ou `${` dans la valeur est écrit sous forme d'échappement unicode (`\u0060`, `\u0024{`), pour qu'il reste
du texte même à l'intérieur d'un template literal. Les expressions côté serveur refusent complètement les template literals ; utilisez `runLocal` pour ceux-ci.

Une expression `runLocal` évaluée dans le navigateur insère la valeur comme l'indique le tableau ci-dessus, sans cet échappement : ne mettez donc pas
d'espace réservé à l'intérieur d'un template literal dans ce cas.

---

## Voir aussi

Pages et entrées de FAQ liées :

- [Expressions locales](local.html) et [Expressions distantes](remote.html) : là où la plupart des espaces réservés sont utilisés
- [FAQ : Listes déroulantes en cascade](../faq.html#cascaded-dropdowns) et [Espaces réservés de champ](../faq.html#field-placeholders) : d'autres exemples
- [FAQ : Comment accéder aux données du formulaire parent dans un sous-formulaire ?](../faq.html#how-do-i-access-parent-form-data-inside-a-subform)
