---
layout: default
title: Registres
parent: En producció
nav_order: 3
translated_from: 17d3894c528610d4916fbdcf4beb5bbbacd2b266
---

# Registres
{: .no_toc }

Fitxers de registre, syslog, el rastre d'auditoria, i quant de temps es conserven les tasques i les entrades d'auditoria
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Fitxers de registre

AnsibleForms escriu dos registres amb rotació diària a [`LOG_PATH`](../customization/logging.html#env_LOG_PATH)
(`%PERSISTENT_FOLDER%/logs`), comprimeix els dies anteriors i els conserva durant [`LOG_RETENTION_DAYS`](../customization/logging.html#env_LOG_RETENTION_DAYS)
(30 per defecte, `0` conserva tots els fitxers; un canvi a la pàgina de configuració s'aplica a l'instant):

* `ansibleforms.<date>.log` : tot el que és de nivell [`LOG_LEVEL`](../customization/logging.html#env_LOG_LEVEL) o superior
* `ansibleforms.errors.<date>.log` : només els errors

La consola, que es llegeix amb `docker logs` o `kubectl logs`, té el seu propi nivell,
[`LOG_CONSOLE_LEVEL`](../customization/logging.html#env_LOG_CONSOLE_LEVEL). Tots dos són `notice` per defecte, que és l'adequat per a
producció; fes servir `info` o `debug` només mentre investigues un problema, i deixa
[`ENABLE_DB_QUERY_LOGGING`](../customization/features.html#env_ENABLE_DB_QUERY_LOGGING) desactivat. Els nivells es poden canviar a
les pàgines de configuració sense reiniciar, i la pàgina **Registre del servidor** mostra el registre als usuaris amb l'opció `showLogs`.

---

## Línies JSON

Per a un col·lector de registres com ara Loki, ELK o Splunk, posa [`LOG_FORMAT`](../customization/logging.html#env_LOG_FORMAT) a `json`. Cada
línia, a la consola i als fitxers, és llavors un objecte JSON en lloc de `<time> <level>: <message>`:

```json
{"time":"2026-10-12T08:15:02.113Z","level":"notice","message":"App running on port 8000!","role":"all","host":"forms01"}
```

| Camp | Contingut |
|-------|---------|
| `time` | L'hora, en ISO 8601 UTC |
| `level` | El nivell de registre |
| `message` | El missatge |
| `requestId` | La petició a la qual pertany la línia, quan s'ha escrit mentre se'n servia una |
| `role` | El rol del procés, [`AF_ROLE`](scaling.html), o `all` quan no està definit |
| `host` | El nom de host de la màquina o del contenidor on s'executa el procés |

Cada petició rep un id: la capçalera `X-Request-Id` que ha enviat un proxy invers, o un de nou. Es retorna a la capçalera
`X-Request-Id` de la resposta i el porten totes les línies escrites mentre se serveix la petició (com a `[req <id>]` a les línies de text),
de manera que una petició es pot seguir pel registre i relacionar amb les del proxy. Un canvi a la pàgina de configuració s'aplica a l'instant.

---

## Syslog

Els servidors syslog es gestionen a **Configuració > Connexions > Syslog**, de manera que un servidor syslog o un SIEM rep el registre a mesura que s'escriu.
Pots afegir diversos servidors, i cadascun té els seus propis ajustos:

| Ajust | Què fa |
|---------|--------------|
| Activat | Només els servidors activats reben alguna cosa, de manera que un servidor es pot aturar sense suprimir-lo; **Activa** i **Desactiva** al seu menú de fila també el canvien |
| Protocol | `udp4` (predeterminat), `udp6`, `tcp4`, `tcp6`, `tls4`, `tls6`, `unix` o `unix-connect` |
| Amfitrió i port | El servidor al qual s'envia, port `514` per defecte; un protocol `unix` pren en canvi un camí de sòcol |
| Rep | El registre del servidor, les entrades d'auditoria, o tots dos (el predeterminat per a un servidor nou) |
| Nivell | El nivell més baix del registre del servidor que rep, `info` per defecte; les entrades d'auditoria s'envien sempre |
| Format | `BSD` (RFC 3164, el predeterminat) o `RFC 5424` |

Un canvi s'aplica a tots els nodes sense reiniciar, i la pàgina del servidor té un botó que li envia un missatge de prova.
Un servidor al qual no es pot arribar mai no atura l'aplicació: l'error s'escriu a la consola.

Des de la 7.3.0 els servidors syslog necessiten tots els permisos de configuració, l'opció de rol [`showSettings`](../config/roles.html#role-options):
l'accés només a la configuració de connexions no n'hi ha prou, ja que un servidor syslog rep el registre del servidor i les entrades d'auditoria.

Les variables `LOG_SYSLOG_*` de versions anteriors estan obsoletes des de la 7. La primera arrencada que troba
[`LOG_SYSLOG_HOST`](../customization/logging.html#env_LOG_SYSLOG_HOST) definida les importa una sola vegada com el servidor `syslog`,
que rep el registre del servidor com abans, i a partir d'aleshores les ignora. Treu-les de l'entorn després d'aquesta primera
arrencada, i gestiona el servidor a la pàgina de configuració.

---

## Rastre d'auditoria

La pàgina **Registre d'auditoria** (a **Configuració > Registres**) registra qui ha canviat què, cosa que els fitxers de registre no responen bé.
Hi queda registrat:

* cada canvi fet a través de l'API (`POST`, `PUT`, `PATCH`, `DELETE`), inclosos els intents rebutjats amb 401 o 403
* els inicis de sessió, amb el nom d'usuari que s'ha provat
* els esdeveniments de la mateixa aplicació, com ara les còpies de seguretat nocturnes, les còpies eliminades, les tasques purgades i les aplicacions de la llavor de configuració

Cada entrada té la seva hora, l'actor (un usuari, o la mateixa aplicació per a les seves pròpies tasques), l'adreça IP del client,
l'acció, el seu objectiu i el seu resultat: `success`, `failure` o `denied`. La pàgina filtra per l'actor, l'acció i
el resultat, i la poden obrir els usuaris amb l'opció de rol `showSettings`.

L'adreça IP és la que veu AnsibleForms, que és la del proxy quan s'executa darrere d'un. Posa
[`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY) al nombre o a les adreces dels teus proxies, i AnsibleForms
registra en canvi l'adreça del client que el proxy indica a `X-Forwarded-For`; vegeu [Proxy invers](reverse-proxy.html).

Per conservar el rastre d'auditoria fora de la instància, per a un SIEM, afegeix un servidor syslog que rebi les entrades d'auditoria (vegeu
[Syslog](#syslog)). Cada entrada s'envia en el moment que es produeix, com una línia `audit {...}` amb l'entrada en JSON, sigui quin sigui el
nivell del servidor. La retenció de més avall no elimina la còpia de syslog, ni la substitueix una restauració de la base de dades.

---

## Retenció

Dues tasques diàries amb un ajust eviten que la base de dades creixi sense límit:

| Variable | Predeterminat | S'executa a les | Elimina |
|----------|---------|---------|---------|
| [`AUDIT_RETENTION_DAYS`](../customization/retention.html#env_AUDIT_RETENTION_DAYS) | `365` | 3:30 | Les entrades d'auditoria més antigues que això |
| [`JOB_RETENTION_DAYS`](../customization/retention.html#env_JOB_RETENTION_DAYS) | `0` (ho conserva tot) | 2:30 | Les tasques acabades més antigues que això, amb la seva sortida |

`0` ho conserva tot en tots dos casos. Dues tasques diàries més no tenen cap ajust: a les 3:00 s'eliminen els refresh tokens desats de més de 30 dies i
les revocacions de tokens caducades, i a les 4:00 les [tasques desades](../jobs/stored-jobs.html) que han passat la seva caducitat.
Les hores són a la zona horària de [`LOG_TZ`](../customization/logging.html#env_LOG_TZ), i les executa el worker.

La sortida de les tasques sol ser la taula que creix més de pressa: la pàgina **Estat** n'indica la mida
i avisa quan passa d'1 GB sense cap retenció definida. Les tasques en execució i les que esperen aprovació no s'eliminen mai.
Decideix una retenció de tasques que s'ajusti als teus requisits d'auditoria, i conserva el rastre d'auditoria almenys el mateix temps.
