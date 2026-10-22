---
layout: default
title: Einschalten
parent: Chat-Assistent
nav_order: 1
translated_from: 9277301a5a83fdc57c5acd1ba4687f8b16497081
---

# Einschalten
{: .no_toc }

Den Assistenten aktivieren und Formulare darin anbieten
{: .fs-6 .fw-300 }

---

Der Assistent braucht alle vier der folgenden Punkte:

1. **`ENABLE_CHAT=1`** - die Umgebungsvariable. Auf der Einstellungsseite geändert, gilt sie sofort, ohne Neustart; solange
   sie aus ist, antworten die Chat-Endpunkte `404`. Siehe [`ENABLE_CHAT`](../customization/features.html#env_ENABLE_CHAT).
2. **Ein Modellanbieter** - Einstellungen -> Verbindungen -> **Chat-Assistent** (oder der [Konfigurations-Seed](../seed) auf Kubernetes).
3. **Formulare, die teilnehmen** - `enableForChat: true` bei jedem Formular; der Assistent ignoriert alle anderen.
4. **Benutzer, die ihn verwenden dürfen** - die Rollenoption `allowChat` (Standard: true). Setzen Sie
   `allowChat: false` bei einer Rolle, um ihre Mitglieder auszuschließen.

Die Chat-Schaltfläche erscheint für einen Benutzer, sobald alle vier Bedingungen erfüllt sind.
