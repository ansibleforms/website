---
layout: default
title: En producció
nav_order: 12
has_children: true
has_toc: false
permalink: /production/
translated_from: 2d7f4be84a76837fae34c1b414a229448bfae4ea
---

# En producció
{: .no_toc }

Publica, fes còpies de seguretat i supervisa una instància de la qual depenen persones
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Abans de posar-la en marxa

Els valors predeterminats posen una instància en marxa ràpidament, però alguns només estan pensats per a una primera ullada. AnsibleForms
registra un avís `[SECURITY]` en arrencar quan `ENCRYPTION_SECRET` o `ACCESS_TOKEN_SECRET` no estan definides, i la
pàgina **Estat** informa de les còpies de seguretat, dels ajustos de retenció i del sanejador d'expressions.

---

## Llista de comprovació per a producció

Revisa aquests punts una vegada abans que els usuaris depenguin de la instància, i un altre cop després d'una actualització important:

| Punt | Què cal fer | Detalls |
|------|------------|---------|
| Contrasenya de l'admin | Canvia la contrasenya del compte d'admin local | [Enduriment](../security/hardening.html#the-admin-account) |
| Secret de xifratge | Defineix [`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) abans de desar cap credencial | [Secrets i xifratge](../security/secrets.html#the-two-master-secrets) |
| Secret dels tokens | Defineix [`ACCESS_TOKEN_SECRET`](../customization/security.html#env_ACCESS_TOKEN_SECRET), perquè les sessions sobrevisquin a un reinici | [Secrets i xifratge](../security/secrets.html#the-two-master-secrets) |
| HTTPS | Termina el TLS amb el teu propi certificat, no amb el d'exemple | [HTTPS](../security/https.html) |
| Proxy invers | Publica la instància darrere d'un proxy, opcionalment sota [`BASE_URL`](../customization/server.html#env_BASE_URL) | [Proxy invers](reverse-proxy.html) |
| Endpoint de l'esquema | Posa [`ALLOW_SCHEMA_CREATION`](../customization/server.html#env_ALLOW_SCHEMA_CREATION) a `0` un cop existeix l'esquema | [Enduriment](../security/hardening.html#the-database) |
| Crides de sortida | Restringeix les expressions REST amb [`REST_DENIED_HOSTS`](../customization/security.html#env_REST_DENIED_HOSTS) | [Enduriment](../security/hardening.html#expressions-and-outbound-calls) |
| Funcions opcionals | Deixa MCP i l'assistent de xat desactivats si no els fas servir | [Enduriment](../security/hardening.html#optional-features) |
| Còpies de seguretat | Comprova que la còpia nocturna funciona, i copia-la fora de l'amfitrió | [Còpies de seguretat](backups.html) |
| Retenció | Decideix quant de temps es conserven les tasques i les entrades d'auditoria | [Registres](logs.html#retention) |

---

## En aquesta secció

Cada tema té la seva pròpia pàgina; la protecció de la instància es tracta a [Seguretat](../security/):

| Pàgina | Què hi trobaràs |
|---|---|
| [Proxy invers](reverse-proxy.html) | Publicar AnsibleForms darrere de Nginx, Traefik o Apache, a l'arrel o sota un subcamí |
| [Còpies de seguretat](backups.html) | Còpies nocturnes, què contenen, restauracions, i què més cal conservar |
| [Registres](logs.html) | Fitxers de registre, syslog, el rastre d'auditoria, i la retenció de tasques i entrades d'auditoria |
| [Escalat](scaling.html) | Diversos nodes d'aplicació amb un worker; l'RTE té la seva pròpia secció, [Entorns d'execució](../rte/) |
| [Supervisió](monitoring.html) | Sondes de salut, mètriques de Prometheus i la pàgina Estat |

