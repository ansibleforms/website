---
layout: default
title: Härtung
parent: Sicherheit
nav_order: 1
redirect_from:
  - /production/hardening.html
translated_from: be22a8ac091b17a67815ab392de93cd0ff519dd9
---

# Härtung
{: .no_toc }

Das Admin-Konto, Anmeldegrenzen, die Datenbank, Ausdrücke, Jobdaten, die Browser-Richtlinie, optionale Funktionen und Rollenoptionen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Das Admin-Konto

Das lokale Admin-Konto wird beim ersten Start aus [`ADMIN_USERNAME`](../customization/server.html#env_ADMIN_USERNAME)
und [`ADMIN_PASSWORD`](../customization/server.html#env_ADMIN_PASSWORD) angelegt, dessen Standard `AnsibleForms!123` ist.

* Eine Anmeldung mit dem öffentlich bekannten Standardpasswort `AnsibleForms!123` muss es zuerst ändern: Bis dahin beantwortet der Server
  jede Anfrage außer der Passwortänderung mit `403` (Code `password_change_required`), und der Browser zeigt eine
  Seite zum Ändern des Passworts, die sich nicht schließen lässt. Das neue Passwort darf nicht wieder der Standard sein.
* `ADMIN_PASSWORD` wird nur beim ersten Anlegen des Kontos gelesen: Setzen Sie vor dem ersten Start einen eigenen Wert.
* [`REINIT_ADMIN`](../customization/server.html#env_REINIT_ADMIN)`=1` setzt das Passwort bei jedem Start auf `ADMIN_PASSWORD`
  zurück. Verwenden Sie es nur, um ein verlorenes Passwort wiederherzustellen, entfernen Sie es dann und starten Sie neu.
* Setzen Sie zuerst die beiden Hauptgeheimnisse: siehe [Geheimnisse und Verschlüsselung](secrets.html).
* Sobald die Anmeldung über LDAP oder SSO funktioniert, behalten Sie den lokalen Admin nur für Notfälle, mit einem langen Passwort in Ihrem Tresor.

---

## Anmeldegrenzen und Passwörter

Das Erraten von Passwörtern wird durch drei Grenzen gebremst. Die Fehlschläge werden in der Datenbank gezählt, sodass jeder App-Knoten dieselben
Versuche sieht, und jede Grenze gilt ohne Neustart:

| Variable | Standard | Was sie tut |
|----------|---------|--------------|
| [`LOGIN_MAX_FAILURES`](../customization/security.html#env_LOGIN_MAX_FAILURES) | `5` | Nach so vielen fehlgeschlagenen Anmeldungen wird ein lokales oder LDAP-Konto für `LOGIN_LOCKOUT_MINUTES` gesperrt. |
| [`LOGIN_MAX_FAILURES_PER_IP`](../customization/security.html#env_LOGIN_MAX_FAILURES_PER_IP) | `30` | Eine Adresse mit so vielen fehlgeschlagenen Anmeldungen innerhalb von `LOGIN_LOCKOUT_MINUTES` wird bis zum Ende dieses Zeitfensters zurückgehalten: eine Adresse, die viele Konten probiert. |
| [`LOGIN_LOCKOUT_MINUTES`](../customization/security.html#env_LOGIN_LOCKOUT_MINUTES) | `15` | Wie lange ein Konto gesperrt bleibt, und das Zeitfenster, in dem Fehlschläge gezählt werden. |
| [`AUTH_RATE_LIMIT`](../customization/security.html#env_AUTH_RATE_LIMIT) | `120` | Anfragen pro Minute von einer Adresse, pro App-Knoten, an Anmeldung, Abmeldung, Token-Erneuerung und die Single-Sign-on-Callbacks. |

Ein gesperrtes Konto oder eine zurückgehaltene Adresse erhält `429` mit einem Header `Retry-After`, bevor ein Passwort geprüft wird, und
unabhängig davon, ob das Konto existiert; über `AUTH_RATE_LIMIT` lautet die Antwort ebenfalls `429`. Eine erfolgreiche Anmeldung setzt den
Zähler des Kontos zurück, ebenso ein Admin, der das Passwort des Benutzers setzt. `0` schaltet eine Grenze ab; `LOGIN_LOCKOUT_MINUTES=0`
schaltet sowohl die Sperre als auch die adressbezogene Grenze ab.

`LOGIN_MAX_FAILURES_PER_IP` und `AUTH_RATE_LIMIT` zählen pro Client-Adresse: Setzen Sie hinter einem Reverse Proxy `TRUST_PROXY`,
damit die Adresse die des Clients und nicht die des Proxys ist, siehe [Client-Adressen](../production/reverse-proxy.html#client-addresses).

Ein über die Anwendung gesetztes lokales Passwort, für einen neuen Benutzer, durch einen Admin oder durch Benutzer, die ihr eigenes ändern, muss
mindestens [`PASSWORD_MIN_LENGTH`](../customization/security.html#env_PASSWORD_MIN_LENGTH) Zeichen haben (standardmäßig `8`,
`0` prüft keine Länge). Es darf weder der Benutzername noch das öffentlich bekannte Standardpasswort sein. `ADMIN_PASSWORD` wird nicht geprüft.

---

## Die Datenbank

AnsibleForms hält alle Anmeldedaten und Jobs in seiner MySQL-Datenbank, halten Sie diese Datenbank also vom Netz fern:

* Das docker-compose-Projekt veröffentlicht MySQL auf dem Host (`MYSQLDB_LOCAL_PORT`, `3306`) und wird mit dem
  root-Passwort `AnsibleForms!123` ausgeliefert. Entfernen Sie dieses Port-Mapping oder binden Sie es an `127.0.0.1`, und ändern Sie das Passwort.
* Verbinden Sie sich mit einem eigenen Konto statt mit `root`, gesetzt in [`DB_USER`](../customization/server.html#env_DB_USER) und
  [`DB_PASSWORD`](../customization/server.html#env_DB_PASSWORD). Es braucht nur Rechte auf das Schema `AnsibleForms`:

  ```sql
  CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
  GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
  ```

  Das deckt das Anlegen des Schemas (einschließlich `CREATE DATABASE`), das Patchen bei Upgrades sowie die
  [Backups](../production/backups.html) und Wiederherstellungen ab, die als derselbe Benutzer laufen: Der Dump wird mit
  `--no-tablespaces` erstellt, daher ist kein serverweites Recht wie `PROCESS` nötig. Ersetzen Sie `%` wo möglich durch die Adresse der
  Anwendung. Ein Benutzer mit Rechten auf jede Datenbank, wie `root` sie hat, macht aus einer Lücke in der Anwendung
  eine Lücke im gesamten Datenbankserver: Die Seite **Status** warnt davor in ihrer Prüfung **Datenbankbenutzer**, und das Protokoll
  bei jedem Start.
* Setzen Sie [`ALLOW_SCHEMA_CREATION`](../customization/server.html#env_ALLOW_SCHEMA_CREATION) auf `0`, sobald das Schema existiert.
  Das Anlegen des Schemas löscht zuerst jede Tabelle; mit `0` können es weder der Bootstrap beim Start noch der Endpunkt
  `/api/v2/schema` ausführen.

---

## Ausdrücke und ausgehende Aufrufe

Server-Ausdrücke laufen für jeden angemeldeten Benutzer auf dem Server, daher sind der Sanitizer und die ausgehenden Filter wichtig:

* [`EXPRESSION_SANITIZER`](../customization/security.html#env_EXPRESSION_SANITIZER) : `strict` oder `paranoid`, nie `legacy`, das Benutzer Servercode ausführen lässt.
* [`REST_DENIED_HOSTS`](../customization/security.html#env_REST_DENIED_HOSTS) : Hosts, die REST-Ausdrücke nicht erreichen dürfen, z. B. `169.254.169.254,127.0.0.0/8`.
* [`REST_ALLOWED_HOSTS`](../customization/security.html#env_REST_ALLOWED_HOSTS) : Wenn gesetzt, können REST-Ausdrücke
  nur diese Hosts und Bereiche erreichen. Die Sperrliste gewinnt über sie.

Beide Listen decken nur die REST-Hilfsfunktionen von AnsibleForms selbst ab; Playbooks laufen außerhalb davon und werden nicht gefiltert.

Ab 7.3.0 prüfen die REST-Hilfsfunktionen das Zertifikat des Endpunkts, wie jede andere Verbindung.
[`REST_IGNORE_CERTS`](../customization/security.html#env_REST_IGNORE_CERTS)`=1` schaltet die Prüfung ab: Verwenden Sie es nur für
Endpunkte mit selbstsigniertem Zertifikat.

---

## Jobdaten

Extravars und Ausgabe von Jobs werden in der Datenbank gespeichert und jedem angezeigt, der den Job sehen kann:

* [`MASK_EXTRAVARS_REGEX`](../customization/security.html#env_MASK_EXTRAVARS_REGEX) : Extravars, deren Schlüssel passt, werden
  als `********` angezeigt. Der Standard ist `password|secret|token`; Passwortfelder werden immer maskiert. Erweitern Sie ihn um
  die Namen, die Ihre Formulare verwenden, zum Beispiel `password|secret|token|apikey|passphrase`.
* [`EXTRAVARS_USER_FIELDS`](../customization/security.html#env_EXTRAVARS_USER_FIELDS) : kürzt das Objekt `ansibleforms_user`,
  das mit jedem Job gesendet wird und sonst alle Gruppenmitgliedschaften des Benutzers enthält.
* [`REGEX_FILTER_JOB_OUTPUT`](../customization/security.html#env_REGEX_FILTER_JOB_OUTPUT) blendet nur geschwätzige Tasks aus; verbergen Sie Geheimnisse mit `no_log`.

---

## Die Content-Security-Policy

Die Oberfläche wird mit einem Header Content-Security-Policy ausgeliefert, der begrenzt, was eine Seite im Browser laden und ausführen darf:

* Skripte kommen nur von der Anwendung selbst, daher läuft ein in eine Seite eingeschleustes Skript nicht.
* Keine andere Website darf die Oberfläche in einem Frame anzeigen.
* Sie erlaubt, was die Anwendung braucht: lokale Formularausdrücke, die im Browser ausgewertet werden (`'unsafe-eval'`),
  Inline-Styles, Bilder von beliebigen URLs (Formular- und Kategoriebilder) und die Worker des Code-Editors.

[`CONTENT_SECURITY_POLICY`](../customization/security.html#env_CONTENT_SECURITY_POLICY) ist standardmäßig `1` und sollte
so bleiben. Mit `0` wird die Richtlinie als `Content-Security-Policy-Report-Only` gesendet: Die Browserkonsole listet auf, was sie
blockieren würde, und nichts wird blockiert. Verwenden Sie `0` nur für eine Einrichtung, die noch nicht mit der Richtlinie funktioniert, etwa ein Reverse Proxy,
der ein eigenes Skript einschleust. Eine Änderung auf der Einstellungsseite gilt ohne Neustart.

---

## Die Einstellungsseiten und der Designer

Administratoren können einen Großteil der Konfiguration im Browser ändern. Schränken Sie das ein, wo die Konfiguration anderswo liegt:

* [`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT)`=0` : schreibgeschützte Einstellungen, für eine [verwaltete Umgebung](../seed/environment-and-audit.html).
* [`SHOW_DESIGNER`](../customization/features.html#env_SHOW_DESIGNER)`=0` : entfernt den integrierten Designer, wenn Formulare
  in Git gepflegt werden.

---

## Optionale Funktionen

Diese Funktionen sind standardmäßig aus. Schalten Sie sie nur ein, wenn Sie sie verwenden; eine Änderung auf der Einstellungsseite gilt ohne Neustart:

* [`ENABLE_MCP`](../customization/features.html#env_ENABLE_MCP) : stellt den [MCP-Server](../mcp/) unter `/api/v2/mcp` bereit,
  sodass MCP-Clients Formulare mit dem Token eines Benutzers starten können.
* [`ENABLE_CHAT`](../customization/features.html#env_ENABLE_CHAT) : der [Chat-Assistent](../chat/). Formulardefinitionen
  und die gerade eingegebenen Werte werden an den konfigurierten Modellanbieter gesendet.

[`LAUNCH_VALIDATION`](../customization/features.html#env_LAUNCH_VALIDATION) funktioniert umgekehrt: Es ist standardmäßig `enforce`,
daher weist der Server einen Start ab, dessen Werte die Regeln des Formulars verletzen, einschließlich Starts über die REST-API.
Lassen Sie es dabei: `log` protokolliert nur, was abgewiesen würde, und `off` prüft nichts, siehe [Startvalidierung](../launch-validation/).

---

## Rollenoptionen

Einige Rollenoptionen in [config.yaml](../config/roles.html) gewähren mehr, als ihr Name vermuten lässt. Vergeben Sie sie mit Bedacht:

| Option | Warum sie wichtig ist |
|--------|----------------|
| `allowScheduledJobs` | Ein Benutzer mit ihr sieht jeden Zeitplan und kann ihn ändern, und ein Zeitplan läuft mit Admin-Rechten, für jedes Formular. Behandeln Sie sie als Option auf Admin-Ebene. |
| `allowBackupOps` | Umfasst die **Wiederherstellung**, die die gesamte Datenbank ersetzt. |
| `showSettings` | Öffnet die Administrationsseiten. Ohne die Rolle admin kann sie die Konten und Gruppen, die die Rolle admin nennt, nicht ändern, siehe [Benutzer und Gruppen](../users-and-groups.html#accounts-that-grant-admin). |
| `showLogs` | Zeigt das Serverprotokoll, das Hostnamen, Benutzernamen und Fehlerdetails enthalten kann. |
| `showConnectionsSettings` | Öffnet die Verbindungsseiten: Anmeldedaten, Runner, Benachrichtigungskanäle und mehr. Das Hinzufügen, Ändern und Löschen von Runnern und Secret Stores bleibt Sache eines Admins, ebenso die Anmeldedaten von Verbindungen und Anmeldungen. Bei einem Repository bleiben das Hinzufügen oder Löschen sowie das Ändern seiner Adresse, seines Branches oder seiner `use_for_*`-Flags Sache eines Admins. |
| `showAllJobLogs` | Zeigt die Jobs jedes Benutzers, nicht nur die eigenen. |
| `manageAllJobs` | Bricht die Jobs jedes Benutzers ab, löscht sie und startet sie neu. |
| `allowApiTokens` | Lässt den Benutzer API-Token erstellen, die bis zu [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) (standardmäßig 90) leben. Abmelden mit einem Token oder sein Widerruf beendet es, und eine Passwortänderung beendet alle Token des Benutzers, siehe [Token](secrets.html#tokens). |
| `extendedTokenExpiration` | Lässt den Benutzer mit `allowApiTokens` auch API-Token erstellen, die nie ablaufen. |
| `allowFileUploads` | Lässt den Benutzer Dateien über die Dateifelder eines Formulars hochladen. Für jeden Benutzer eingeschaltet, sofern keine Rolle es ausschaltet. |
| `allowChat`, `allowMcp` | Lassen den Benutzer den Chat-Assistenten und den MCP-Server verwenden, wenn sie eingeschaltet sind. `allowChat` ist für jeden Benutzer eingeschaltet, sofern keine Rolle es ausschaltet, und `allowMcp` folgt `allowChat`, sofern keine Rolle es setzt. |

Ein Benutzer ohne die Rolle `admin` erhält keine der obigen Optionen auf Admin-Ebene, sofern keine Rolle sie ihm gibt. Setzt die Rolle `admin`
keine Optionen, erhalten ihre Benutzer `showSettings`, `showDesigner`, `showLogs`, `showAuditLog`, `allowBackupOps`,
`allowJobRelaunch`, `showAllJobLogs`, `manageAllJobs` und `allowScheduledJobs`. `allowApiTokens` und
`extendedTokenExpiration` bleiben selbst für die Rolle `admin` aus: Setzen Sie sie bei den Rollen, die sie brauchen.

Setzen mehrere Rollen eines Benutzers dieselbe Option, gewinnt `false`. Die Optionen der Rolle `default` ergänzen nur die Optionen,
die keine der eigenen Rollen des Benutzers setzt; sie setzen sie nie außer Kraft.
