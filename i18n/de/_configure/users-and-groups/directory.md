---
layout: default
title: Verzeichnisbenutzer und -gruppen
parent: Benutzer und Gruppen
nav_order: 4
translated_from: 4798556ab97e1c3567a81681919e13c57d7a5b4f
---

# Verzeichnisbenutzer und -gruppen
{: .no_toc }

Benutzer und Gruppen aus LDAP, Entra ID und OIDC, wie zuletzt gesehen
{: .fs-6 .fw-300 }

Ein Benutzer aus LDAP, Entra ID oder OIDC hat seine Seite unter `/settings/users/<source>/<name>`, mit `ldap`, `azuread` oder `oidc`
als Herkunft, etwa `/settings/users/ldap/jdoe`. Sie zeigt schreibgeschützt, was bei der letzten Anmeldung des Benutzers festgehalten wurde,
da das Verzeichnis oder der Identitätsanbieter bestimmt, wer der Benutzer ist und welche Gruppen er hat.

Ihre Tabs sind die eines lokalen Benutzers. **Details** hat den Schalter **Anmeldung erlauben**, den Benutzernamen, die Herkunft, den Namen,
die E-Mail, wann der Benutzer zum ersten Mal gesehen wurde, und seine letzte Anmeldung. **Gruppen** listet die Gruppen der letzten Anmeldung auf.
**API-Tokens** listet die API-Token des Benutzers auf, und **Widerrufen** beendet eines sofort.

Oben rechts meldet **Sitzungen beenden** den Benutzer jetzt überall ab. **Vergessen** entfernt den Datensatz, der bei seiner nächsten Anmeldung
zurückkommt; seine Jobs, gespeicherten Jobs und Zeitpläne bleiben. Ein gesperrter Benutzer kann nicht vergessen werden, da ihn das
wieder hereinlassen würde: Der Server antwortet mit `409`, erlauben Sie also zuerst seine Anmeldung.

Die Gruppen dieses Datensatzes sind auch die Gruppen, mit denen die Sitzung des Benutzers arbeitet, live gelesen. Einen angemeldeten Benutzer zu vergessen,
lässt ihn ohne Gruppen und ohne die Rollen, die diese Gruppen gewähren, bis er sich erneut anmeldet.

Eine Verzeichnisgruppe hat ihre Seite unter `/settings/groups/<source>/<name>`, schreibgeschützt, mit den Tabs **Details**,
**Benutzer** (die Benutzer, die bei ihrer letzten Anmeldung darin gesehen wurden), **Rollen** und **Formulare**.
