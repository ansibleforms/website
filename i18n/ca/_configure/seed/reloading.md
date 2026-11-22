---
layout: default
title: Recàrrega i arrencada
parent: Llavor de configuració
nav_order: 3
translated_from: d6cc2dfaf45589a284b52223737ed04ac4330e67
---

# Recàrrega i arrencada
{: .no_toc }

Canviar el fitxer sense reiniciar, i què passa en arrencar
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Canviar el fitxer sense reiniciar

La llavor es torna a llegir cada `CONFIG_SEED_RELOAD_SECONDS` (60 per defecte, `0` ho desactiva)
i es torna a aplicar quan el seu contingut ha canviat. Per tant, un canvi confirmat a git arriba
automàticament a una instància en funcionament: a Kubernetes, un `ConfigMap` es torna a muntar sota el pod en
aproximadament un minut, i la comprovació següent el detecta. No hi ha cap desplegament ni cap reinici, i cap
hook no ha de cridar res.

Per a un fitxer sense canvis, la comprovació calcula un hash i s'atura, de manera que mai no reescriu una fila que ja
ha aplicat.

Per aplicar el fitxer immediatament en lloc d'esperar la comprovació següent, fes servir qualsevol d'aquests:

```
POST /api/v2/config-seed/apply     # settings admin ; answers with what it did
kill -HUP 1                        # inside the container, no credentials needed
```

Tots dos **forcen** una aplicació encara que el fitxer no hagi canviat. Una aplicació forçada torna a imposar un
registre gestionat que s'ha editat directament a la base de dades, i torna a clonar un repositori declarat
l'arbre de treball del qual falta.

{: .note }
> Una recàrrega **mai no és fatal**, a diferència de l'aplicació en arrencar. Una instància que ja està
> en servei conserva la seva configuració actual, es registra el motiu, i la fila *Config seed*
> de la pàgina Estat es posa vermella i l'indica. Un error tipogràfic enviat a git no ha de poder fer caure
> una instància en funcionament sense cap acció d'un operador.
>
> El mateix contingut defectuós tampoc no es torna a provar a cada comprovació; si no, una sola edició dolenta
> escriuria el mateix error al registre indefinidament. Corregeix el fitxer, o crida l'endpoint per tornar-ho a provar
> immediatament.

---

## Una llavor defectuosa impedeix arrencar

Un fitxer il·legible, YAML no vàlid, un camp desconegut, un nom duplicat o una
`${VARIABLE}` sense resoldre fan que el servidor **surti** en lloc d'arrencar. Això només passa a l'**arrencada**:
vegeu la nota de més amunt per saber què fa el mateix fitxer a una instància que ja funciona.

És deliberat. Continuar amb la configuració anterior deixaria una instància el
comportament de la qual ja no coincideix amb el manifest que l'hauria de descriure, sense res que
n'informés. El motiu s'escriu a la sortida d'error estàndard a més del fitxer de registre, de manera que
`kubectl logs` i `docker logs` el mostren.

La validació és estricta: els camps desconeguts es rebutgen en lloc d'ignorar-se, i l'error nomena
la clau culpable:

```
Config seed failed, refusing to start: Seed file validation failed: /awx/items/0 must NOT have additional properties 'tokenn'
```

---

## Una base de dades buida s'aprovisiona sola

Amb `ALLOW_SCHEMA_CREATION` activat (el predeterminat), una base de dades que no conté **cap taula
d'AnsibleForms** rep el seu esquema en arrencar. Per tant, un desplegament nou arrenca
sense que ningú hagi de cridar manualment l'endpoint `/schema`.

La condició prèvia és estricta a propòsit: crear l'esquema **elimina primer totes les taules**, així que
només s'executa mai contra una base de dades completament buida. Una base de dades a la qual falta
una columna, o que té taules però cap compte d'usuari, *no* és buida i es deixa intacta;
els pedaços de l'esquema s'encarreguen d'aquests casos.
