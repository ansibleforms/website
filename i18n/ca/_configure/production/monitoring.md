---
layout: default
title: Supervisió
parent: En producció
nav_order: 5
translated_from: b2bf7ba817910d15cd4fe5c5eb5881dba1ebacd5
---

# Supervisió
{: .no_toc }

Sondes de salut per a un balancejador de càrrega o Kubernetes, mètriques de Prometheus i la pàgina Estat
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Sondes de salut

Dos endpoints indiquen a un balancejador de càrrega, a un healthcheck de contenidor o a Kubernetes si un procés pot rebre trànsit.
Cap dels dos no necessita iniciar sessió, i cap dels dos no retorna res sobre la configuració:

| Endpoint | Respon | Fes-lo servir per a |
|----------|---------|------------|
| `/api/v2/live` | `200` amb `{"status":"live"}` mentre el procés s'executa | Una sonda de liveness: reinicia el procés quan deixa de respondre |
| `/api/v2/ready` | `200` amb `{"status":"ready"}`, o `503` amb `{"status":"not ready","reason":"..."}` | Una sonda de readiness: envia trànsit només als processos preparats |

Un procés està preparat quan es compleix tot això:

* no s'està aturant (`stopping`)
* la base de dades respon (`database unreachable`)
* l'esquema existeix (`schema not provisioned`) i és complet, amb totes les taules, columnes i índexs d'aquesta versió
  (`schema not upgraded`); aquesta última comprovació es desa en memòria cau durant 30 segons, de manera que una sonda cada pocs segons continua sent barata

Sota un [`BASE_URL`](../customization/server.html#env_BASE_URL) els camins comencen per aquest valor, per exemple
`/ansibleforms/api/v2/ready`. Un entorn d'execució (RTE) respon les mateixes sondes a `/live` i `/ready`, sense la
comprovació de completesa de l'esquema; no està preparat mentre buida les seves tasques en aturar-se, de manera que no se li envia cap tasca nova. Un RTE sortint
tampoc no està preparat (`not connected to the app`) fins que el seu sòcol cap a l'aplicació està obert.
Un procés iniciat amb `AF_ROLE=worker` no té interfície web: només respon `/api/v2/version` i `/health` per al healthcheck
del seu contenidor. Vegeu [Escalat](scaling.html) per als rols.

---

## Mètriques de Prometheus

Posa a [`METRICS_TOKEN`](../customization/features.html#env_METRICS_TOKEN) una cadena aleatòria llarga per servir mètriques de Prometheus.
Un procés que serveix l'aplicació web respon a `/api/v2/metrics`, i un RTE a `/metrics`:

```yaml
scrape_configs:
  - job_name: ansibleforms
    metrics_path: /api/v2/metrics
    authorization:
      type: Bearer
      credentials: <METRICS_TOKEN>
    static_configs:
      - targets: ['forms01.example.com:8000']
```

Sense `METRICS_TOKEN` els endpoints responen `404`, com si no existissin, i una petició sense la capçalera
`Authorization: Bearer <token>` correcta rep `401`. Cada procés informa de les seves pròpies xifres, així que fes scrape de cadascun:

| Mètrica | Què mesura |
|--------|------------------|
| `af_process_*`, `af_nodejs_*` | El procés: CPU, memòria, retard del bucle d'esdeveniments, recollida d'escombraries |
| `af_http_requests_total{route,method,status}` | Les peticions servides |
| `af_http_request_duration_seconds{route}` | Quant de temps han trigat |
| `af_jobs{status}` | Tasques en execució (`running`) o pendents d'aprovació (`approve`) ara mateix |
| `af_jobs_ended_24h{status}` | Tasques que han acabat les últimes 24 hores, per estat |
| `af_nodes{role,alive}` | Els processos registrats a la base de dades, per rol, vius o no |
| `af_login_failures_total`, `af_login_lockouts_total` | Inicis de sessió fallits i bloquejos de comptes |
| `af_rte_running_jobs`, `af_rte_max_jobs` | En un RTE: els playbooks que executa ara, i quants en pot executar alhora |
| `af_rte_socket_connected` | En un RTE en mode sòcol: `1` mentre el seu sòcol cap a l'aplicació està obert, `0` quan no ho està |

Les xifres de tasques i de nodes es llegeixen de la base de dades a cada scrape. Quan la base de dades no respon, es deixen
fora, i l'scrape funciona igualment amb les altres mètriques.

---

## La pàgina Estat

La pàgina **Estat**, a **Configuració > Sistema**, mostra als usuaris amb l'opció de rol `showSettings` com va la instància.
Només llegeix, així que actualitzar-la mai no envia cap correu ni llança cap tasca. Té dues pestanyes, i el nombre de problemes es mostra a l'etiqueta de la pestanya **Comprovacions**.

### Comprovacions

Cada comprovació és verda (correcta), ambre (requereix atenció) o vermella (un problema), amb els detalls en desplegar la fila:

| Comprovació | Què examina |
|-------|------------------|
| Connexió amb la base de dades | La base de dades respon |
| Usuari de la base de dades | Ambre quan l'usuari té permisos sobre totes les bases de dades, com `root`, en lloc de només `AnsibleForms.*` |
| Esquema de la base de dades | Existeixen totes les taules, columnes i índexs d'aquesta versió, i quin pedaç ha fallat quan no és així |
| Planificador | Un worker executa les tasques del sistema, i cap no ha deixat de planificar-se |
| Nodes | Els processos de la base de dades, ambre quan executen versions diferents |
| Tasques | Tasques en execució i tasques pendents d'aprovació, ambre quan una tasca fa més de 24 hores que s'executa |
| Eines de còpia de seguretat | L'ordre de bolcat de [`MYSQLDUMP_COMMAND`](../customization/retention.html#env_MYSQLDUMP_COMMAND) existeix, i la seva versió |
| Darrera còpia de seguretat | Ambre quan no n'hi ha cap o la més recent té més de dos dies, vermell quan no té cap bolcat utilitzable |
| Bloqueig del dissenyador | Qui té el bloqueig del dissenyador, ambre quan fa més de 8 hores que el té |
| Repositoris | Vermell quan un repositori ha fallat o no té arbre de treball al disc |
| Config seed | El fitxer de la [llavor de configuració](../seed/) es pot llegir i analitzar, i la seva darrera recàrrega ha funcionat |
| Magatzems de secrets | Tots els magatzems de secrets responen, ambre quan el token d'un HashiCorp Vault caduca aviat |
| Runners | Tots els runners responen, ambre quan no n'hi ha cap o no hi ha cap RTE predeterminat |
| Expressions del servidor | Ambre quan [`EXPRESSION_SANITIZER`](../customization/security.html#env_EXPRESSION_SANITIZER) és `legacy` |
| Secrets | Ambre quan `ENCRYPTION_SECRET` és el valor predeterminat públic o `ACCESS_TOKEN_SECRET` no està definit |
| LDAP | El servidor LDAP és accessible i el seu certificat TLS és vàlid, sense iniciar-hi sessió |
| Emmagatzematge de tasques | La mida de les taules de tasques, ambre per sobre d'1 GB quan no hi ha cap retenció de tasques definida |
| Carpetes amb permís d'escriptura | Es pot escriure a totes les carpetes configurades |
| Espai en disc | El disc que conté les còpies de seguretat, ambre a partir d'un 85% d'ús i vermell a partir d'un 95% |

### Informació

Dades de la instància que no tenen cap veredicte, les primeres coses que es demanen en una conversa de suport: la versió
d'AnsibleForms, la URL base, la versió i l'amfitrió de la base de dades, l'origen de la configuració, la llavor de configuració, els ajustos
de retenció, els mètodes d'autenticació, el servidor del [canal de correu](../notification-channels.html) actiu, el nivell i el camí
del registre, el temps en funcionament, la zona horària, la versió de Node.js i la plataforma.

La pàgina llegeix `/api/v2/health`, que necessita un usuari amb la sessió iniciada i `showSettings`. Per a un sistema de supervisió, fes servir
les sondes i les mètriques de més amunt.
