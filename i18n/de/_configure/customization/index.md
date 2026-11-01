---
layout: default
title: Umgebungsvariablen
nav_order: 9
has_children: true
has_toc: false
permalink: /customization/
translated_from: e0bc1d7c5bd2df4a3f9036a2d9413a276b228156
---

# Umgebungsvariablen
{: .no_toc }

AnsibleForms mit Umgebungsvariablen konfigurieren
{: .fs-6 .fw-300 }

---

Für Administratoren, die AnsibleForms bereitstellen: die Umgebungsvariablen, die der Server liest, nach Themen gruppiert.

AnsibleForms wird über Umgebungsvariablen eingestellt, ob es mit Docker Compose, auf Kubernetes oder aus dem Quellcode läuft.

---

## Woher die Werte kommen

Der Server liest jede Variable aus der ersten dieser Quellen, die sie setzt; ein weiter oben stehender Wert gewinnt also immer:

1. **Die Prozessumgebung**: `environment:` und `env_file:` in docker-compose (die `.env` des Projekts wird so übergeben),
   `env` und `envFrom` auf Kubernetes oder die Shell, die `node` startet.
2. **`persistent/.env`**, die Datei, die die Einstellungsseiten schreiben (`data/.env` im docker-compose-Projekt, ein anderer Pfad mit
   `MANAGED_ENV_PATH`). Sie wird bei jedem Start gelesen, auch in Produktion, und überschreibt nie eine bereits gesetzte Variable.
3. **`server/.env.<NODE_ENV>`**, zum Beispiel `.env.development`. Wird nur gelesen, wenn `NODE_ENV` nicht `production` ist (oder mit
   `FORCE_DOTENV=1`), in der Praxis beim Betrieb [aus dem Quellcode](../installation/from-source.html) im Entwicklungsmodus.
4. **Der integrierte Standardwert**, in den Tabellen jeder Gruppe angegeben.

Die Einstellungsseiten unter **Einstellungen > Allgemein** zeigen den geltenden Wert und speichern Änderungen in `persistent/.env`. Viele Variablen
gelten, sobald sie gespeichert sind; die übrigen werden gespeichert, brauchen aber einen Neustart, und die Seite listet sie nach dem Speichern auf. Eine in
der Prozessumgebung gesetzte Variable lässt sich dort nicht ändern: Die Seite zeigt sie als *In der Umgebung gesetzt und hier nicht änderbar.*
Einige Variablen, etwa `ENCRYPTION_SECRET` und `ACCESS_TOKEN_SECRET`, können nie über die Seite geändert werden.

Die Variablen, die eine RTE liest, etwa `AF_ROLE`, `RTE_MODE`, `APP_URL` oder `RTE_MAX_JOBS`, stehen gar nicht auf den Einstellungsseiten: Die
App verwendet sie nicht, setzen Sie sie daher in der Umgebung, in der die RTE läuft. Die `RTE_*`-Variablen, die die App selbst liest,
`RTE_QUEUE_MINUTES` und `RTE_FILES_MAX_MB`, sind die Ausnahme und bleiben auf den Seiten. Vier RTE-Variablen, `RTE_MAX_JOBS`,
`RTE_CACHE_MB`, `RTE_FILES` und `RTE_DRAIN_SECONDS`, lassen sich stattdessen pro RTE auf ihrer Runner-Seite setzen, wo ein Wert die
Variable übertrifft (siehe [Die Einstellungen einer RTE](../runners/runner-page.html#an-rtes-settings)).

Mit [`ALLOW_ENV_EDIT`](configuration.html#env_ALLOW_ENV_EDIT)`=0` zeigen die Seiten die Werte nur an, und das Speichern wird abgewiesen. Verwenden Sie das,
wenn die Umgebung in einem Manifest deklariert ist, wie unter [Bearbeitung und Audit](../seed/environment-and-audit.html) beschrieben.

Der [Config-Seed](../seed/) setzt keine Umgebungsvariablen. Er deklariert Objekte, die in der Datenbank gespeichert werden, und die
`${ENV_VAR}`-Verweise darin werden aus der Umgebung des laufenden Servers aufgelöst.

Einige Variablen werden nur aus der Umgebung gelesen und stehen nicht in den Tabellen: `MANAGED_ENV_PATH` und `FORCE_DOTENV`, oben
beschrieben, sowie die System-Proxy-Variablen `HTTPS_PROXY` und `NO_PROXY` (auch in Kleinschreibung gelesen). Eine ausgehende RTE wählt sich über
`HTTPS_PROXY` bei der App ein, und eine eingehende RTE sendet ihren Registrierungsaufruf darüber, es sei denn, der Host der App steht in `NO_PROXY` (Hostnamen,
`.domain`-Suffixe oder `*` für jeden Host).

Mit <span class="af-badge af-badge-secret">Secret</span> markierte Variablen enthalten ein Passwort, Token oder einen Schlüssel: Halten Sie sie aus der
Versionsverwaltung heraus, zum Beispiel in einem Kubernetes-Secret oder einer `.env`-Datei, die nicht committet wird.

---

## In diesem Abschnitt

Die Variablen sind nach Themen gruppiert, mit einer Seite pro Gruppe:

| Seite | Inhalt |
|---|---|
{% for g in site.data.env_groups %}| [{{ g.title }}]({{ g.slug }}.html) | {{ g.lead | slice: 0 | upcase }}{{ g.lead | slice: 1, 500 }} |
{% endfor %}
{% capture other %}{% include env_vars_table.html rest=true %}{% endcapture %}
{% if other contains "<tr>" %}
---

## Weitere Variablen

Die folgenden Variablen sind noch keiner Gruppe zugeordnet:

{{ other }}
{% endif %}
