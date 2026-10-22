---
layout: default
title: Objectes gestionats
parent: Llavor de configuració
nav_order: 2
translated_from: dd0ea4d46391bf9b2e5928063cd30e33ac1285f9
---

# Objectes gestionats
{: .no_toc }

Com la llavor és propietària dels objectes que llista, i com manté els secrets fora
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Les seccions d'una sola fila són tot o res

`ldap`, `settings` i `chat` són cadascuna una **sola fila**, així que la llavor n'ha de declarar tots els camps; les altres seccions són llistes.

Una llavor que omet un camp es nega a arrencar i el nomena:

```
Config seed failed, refusing to start: Seed file validation failed: /settings must have required property 'mail_server'
```

Declara un valor buit explícitament amb `""` o `false`. Alguns camps són opcionals, i un que s'omet es deixa sense canvis:

| Secció | Camps opcionals |
|---|---|
| `ldap` | `description`, `credential` (una credencial amb què fer bind) i `groupfilter` |
| `chat` | `auth_type`, `api_version`, `request_user`, `ignore_certs` i `extra_headers` |
| `settings` | Cap |

`settings` només cobreix els camps de correu i la URL; tota la resta de la configuració continua sent editable.

---

## El fitxer no conté cap secret

Cada `${VARIABLE}` se substitueix per aquella variable d'entorn (a Kubernetes, des d'un `Secret`), de manera que el fitxer pot viure a Git.

Una variable que no està definida és un **error fatal**, així que un marcador mai no pot acabar desat com a contrasenya.

Les credencials també poden fer servir un [magatzem de secrets](../secret-stores) (`secret_store`, `secret_ref`); `vault_path` desapareix a la 8.

---

## Objectes gestionats

Un objecte que ve de la llavor es marca com a **gestionat**:

- S'imposa a **cada** arrencada, de manera que el fitxer continua sent la referència.
- És només de lectura: l'API respon **403**, la interfície desactiva Edita i Suprimeix, i la seva pròpia pàgina diu que ve del fitxer de la
  llavor de configuració i que és només de lectura.
- Només la llavor pot posar o treure la marca.

Els objectes creats a mà **no es toquen mai**, tret que la llavor declari el mateix nom. Aquell registre llavors s'**adopta**:
els camps declarats s'imposen i passa a ser només de lectura. L'adopció es registra com a avís i al rastre d'auditoria.

Aplicar la llavor és idempotent: els registres que ja coincideixen es deixen tranquils, de manera que un reinici normalment informa de `0 updated`.

Un repositori declarat l'arbre de treball del qual falta es **torna a clonar** a cada arrencada, de manera que un primer clonatge fallit es
torna a provar. La fila *Repositoris* de la pàgina Estat mostra qualsevol repositori sense arbre de treball.

### Treure un objecte

Treure un objecte del fitxer l'**allibera**: el registre es queda i torna a ser editable. Suprimir una secció sencera
fa el mateix.

Afegeix `prune: true` a una secció de llista per **suprimir** els registres gestionats que el fitxer ja no declara:

```yaml
credentials:
  prune: true
  items:
    - name: production-db
      # anything else the seed used to manage is deleted
```

`prune` no suprimeix mai un registre creat a mà.

### Desactivar la llavor

Treure `CONFIG_SEED_PATH` **no** allibera res: la llavor ja no s'aplica, i els registres que gestionava continuen gestionats
i només de lectura. Per tornar-los a editar, primer allibera'ls: apunta `CONFIG_SEED_PATH` a un fitxer sense ells (un fitxer buit no declara
res i allibera tots els registres), deixa que s'apliqui en una arrencada o una recàrrega, i després treu la variable. Els registres alliberats es queden tal com
estan, i passen a ser editables.
