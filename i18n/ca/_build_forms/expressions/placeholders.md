---
layout: default
title: Marcadors
parent: Expressions
nav_order: 0.5
translated_from: bd63e437a4f77c707a1bf8d8ee99b1516063b62a
---

# Marcadors
{: .no_toc }

Fes referència a un altre camp, a una constant o a l'usuari actual amb `$(...)`
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Què és un marcador

Un marcador és una referència escrita com a `$(reference)`. Se substitueix per un valor abans que s'utilitzi el text que el conté.

Els marcadors funcionen a l'`expression`, la `query` i el `default` d'un camp (aquest últim avaluat amb `evalDefault`), i també al seu `label`,
`help` i `placeholder`. Un camp que conté un marcador depèn del camp que anomena: espera fins que aquest camp tingui un
valor, i es torna a avaluar cada vegada que aquest valor canvia. Així es construeixen els desplegables en cascada.

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

## A què pot fer referència un marcador

Un marcador anomena un camp del formulari, o un d'aquests, que tenen tots els formularis:

| Referència | Què conté |
|---|---|
| `$(field)` | el valor d'un altre camp del formulari |
| `$(name)`, una constant | una [constant](../config/constants.html) de `config.yaml`, o un valor dels `varsFiles` del formulari |
| `$(__user__)` | l'usuari que ha iniciat la sessió: `username`, `type`, `groups`, `roles` |
| `$(__parent__.field)` | en un [subformulari](../forms/subform.html) (una fila d'una llista, un pas d'un assistent), un valor del formulari pare |

```yaml
expression: "'$(__user__.username)'"
expression: $(__user__.groups)
```

---

## Accedir a una part d'un valor

La notació de punt i d'índex llegeix una part d'un valor, sempre que el camí només contingui lletres, dígits, `_`, `-`, `.` i `[n]`:

| Marcador | Sobre | Dona |
|---|---|---|
| `$(field)` | un camp de text, de número o de contrasenya | el valor |
| `$(field)` | un enum de registres | la `placeholderColumn` del registre seleccionat, o si no la seva primera columna |
| `$(field.col)` | un enum de registres | aquesta columna del registre seleccionat |
| `$(field)` | un enum amb `multiple: true` | la columna triada de cada registre seleccionat, com a matriu |
| `$(field)` | una expressió, una llista o una constant | el valor sencer (una llista dona les seves files) |
| `$(field.a.b)`, `$(f[0].x)` | una expressió, una llista o una constant | aquesta part de l'objecte o de la matriu |

Posar `placeholderColumn: "*"` en un enum fa que `$(field)` doni tot el registre seleccionat en lloc d'una sola columna.

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

## Com s'insereix el valor

La manera com s'insereix un valor al text depèn d'on es troba el marcador.

| On | Exemple | Es converteix en |
|---|---|---|
| una expressió, fora de cometes | `$(count) + 1` | un literal JavaScript: un número continua sent un número, un text es converteix en una cadena entre cometes, un objecte o una matriu en un literal |
| una expressió, tota una cadena entre cometes | `fn.fnLs('$(dir)')` | el mateix literal, cometes incloses, de manera que un valor amb una cometa no se'n pot escapar |
| una expressió, dins d'una cadena més llarga | `'$(dir)/vars'` | el text, escapat per a aquesta cadena |
| una consulta, una etiqueta, un text d'ajuda | `where city='$(city)'` | el text |

Un camp els marcadors del qual encara no es poden resoldre tots no s'avalua; amb `ignoreIncomplete: true`, un valor que falta
s'insereix com a `undefined`.

### Accents greus i `${` en un valor

A partir de la 7.3.0, el valor d'un camp no es pot executar com a codi quan el servidor l'insereix en una expressió (expressions remotes, validació
del llançament, MCP i xat). Un accent greu o un `${` al valor s'escriu com una seqüència d'escapament Unicode (```, `${`), de manera que continua sent
text fins i tot dins d'una plantilla literal. Les expressions del costat del servidor rebutgen del tot les plantilles literals; per a això fes servir `runLocal`.

Una expressió `runLocal` avaluada al navegador insereix el valor tal com indica la taula anterior, sense aquest escapament, així que no posis
un marcador dins d'una plantilla literal en aquest cas.

---

## Vegeu també

Pàgines relacionades i entrades de les PMF:

- [Expressions locals](local.html) i [Expressions remotes](remote.html): on s'utilitzen la majoria dels marcadors
- [PMF: Desplegables en cascada](../faq.html#cascaded-dropdowns) i [Marcadors de camp](../faq.html#field-placeholders): més exemples
- [PMF: Com accedeixo a les dades del formulari pare des d'un subformulari?](../faq.html#how-do-i-access-parent-form-data-inside-a-subform)
