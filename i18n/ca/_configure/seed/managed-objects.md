---
layout: default
title: Objectes gestionats
parent: Llavor de configuració
nav_order: 2
translated_from: b007fcc08a96c4035422a238ae335bf4eedd48c5
---

# Objectes gestionats
{: .no_toc }

Com la llavor és propietària dels objectes que llista, i com manté els secrets fora
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Les seccions d'una sola fila són tot o res

`ldap`, `settings` i `chat_assistant` (`chat` abans de la 7.8.0) són cadascuna una **sola fila**, així que la llavor n'ha de declarar tots els camps.

Una llavor que omet un camp es nega a arrencar i el nomena:

```
Config seed failed, refusing to start: Seed file validation failed: /settings must have required property 'url'
```

Declara un valor buit explícitament amb `""` o `false`. Alguns camps són opcionals, i un que s'omet es deixa sense canvis:

| Secció | Camps opcionals |
|---|---|
| `ldap` | `description`, `credential` (una credencial amb què fer bind) i `groupfilter` |
| `chat_assistant` | `auth_type`, `api_version`, `request_user`, `ignore_certs`, `extra_headers`, i `credential` des de la 7.8.0 |
| `settings` | Les claus `mail_*`, obsoletes des de la 7.6.0 (vegeu [Exemple](example.html)) |

`settings` només cobreix la URL i les claus de correu obsoletes; tota la resta de la configuració continua sent editable.

---

## El fitxer no conté cap secret

Cada `${VARIABLE}` se substitueix per aquella variable d'entorn (a Kubernetes, des d'un `Secret`), de manera que el fitxer pot viure a Git.

Una variable que no està definida és un **error fatal**, així que un marcador mai no pot acabar desat com a contrasenya.

Les credencials també poden fer servir un [magatzem de secrets](../secret-stores) (`secret_store`, `secret_ref`); `vault_path` desapareix a la 8.

---

## Objectes gestionats

Un objecte de les seccions de llista (`runners`, `secret_stores`, `credentials`, `databases`, `sso`, `repositories`, `syslog`,
`notifications` i `labels`) o d'una secció d'una sola fila que ve de la llavor es marca com a **gestionat**:

- S'imposa a **cada** arrencada, de manera que el fitxer continua sent la referència.
- És només de lectura: l'API respon **403**, la interfície desactiva Edita i Suprimeix, i la seva pròpia pàgina diu que ve del fitxer de la
  llavor de configuració i que és només de lectura.
- Només la llavor pot posar o treure la marca.

Els objectes creats a mà **no es toquen mai**, tret que la llavor declari el mateix nom. Aquell registre llavors s'**adopta**:
els camps declarats s'imposen i passa a ser només de lectura. L'adopció es registra com a avís i al rastre d'auditoria.

Aplicar la llavor és idempotent: els registres que ja coincideixen es deixen tranquils, de manera que un reinici normalment informa de `0 updated`.

Un repositori declarat l'arbre de treball del qual falta es **torna a clonar** a cada arrencada, de manera que un primer clonatge fallit es
torna a provar. La fila *Repositoris* de la pàgina Estat mostra qualsevol repositori sense arbre de treball.

Des de la 7.8.0 un [repositori git](../repositories/) pot contenir els mateixos tipus d'objectes. Un objecte que conté un repositori continua sent
del repositori: l'element de la llavor per a ell no s'aplica, i el registre del servidor ho diu. Un repositori que declara la llavor continua sent de la llavor.

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

Treure `CONFIG_SEED_PATH` desactiva la llavor: la següent arrencada allibera tots els registres i camps que gestionava la llavor, com ho faria
una llavor buida aplicada. Els registres conserven els seus valors i tornen a ser editables, i el registre del servidor i el registre d'auditoria diuen què s'ha alliberat.

Un `CONFIG_SEED_PATH` el fitxer del qual falta no allibera res: el servidor es nega a arrencar, perquè un fitxer muntat potser només
arriba tard.

---

## Ajustos que declara la llavor

La llavor és propietària de les seccions afegides a la 7.8.0 de manera menys estricta que dels objectes gestionats, i ho és de dues maneres.

| Seccions | Com en és propietària la llavor |
|---|---|
| `defaults`, `logo`, `icon`, `name`, `links`, `mcp` | Camp per camp: cada camp declarat és només de lectura a la seva pàgina, amb un avís, i l'API en rebutja el canvi (403) |
| `users`, `groups`, `announcements`, `disclaimer`, `ssh` | Es creen o es canvien a cada aplicació, mai no es bloquegen ni se suprimeixen |

Un camp de `defaults`, `logo`, `icon`, `name`, `links` o `mcp` que la llavor ja no declara s'allibera, i s'alliberen tots quan es desactiva la
llavor. Un logotip o una icona de la llavor no es poden pujar ni treure a l'aplicació. Quan un repositori conté la mateixa pàgina, la llavor
conserva els camps que declara i el repositori conté els altres.

Un usuari, un grup, un anunci, una versió de l'avís legal o la clau SSH i els amfitrions coneguts de la llavor continuen sent editables a
l'aplicació, i la següent aplicació torna a escriure els valors de la llavor on difereixen. Treure un element del fitxer el deixa a l'aplicació,
i `prune` no en suprimeix cap.
