---
layout: default
title: Datenschutz und Grenzen
parent: Chat-Assistent
nav_order: 3
translated_from: d29279a71f7aaa5553602f5a463132c842600690
---

# Datenschutz und Grenzen
{: .no_toc }

Was das Netzwerk verlässt, und die Grenzen pro Benutzer
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Was das Netzwerk verlässt

Für die teilnehmenden Formulare wird Folgendes an den Anbieter gesendet:

- die Formularnamen und -beschreibungen, die Feldbeschriftungen, Hilfetexte, Auswahlmöglichkeiten und die Werte, die gerade
  ausgefüllt werden;
- das Gespräch.

Folgendes wird nie an den Anbieter, die Seite oder das Protokoll gesendet:

- Passwörter (der Benutzer gibt diese im Browser ein), gespeicherte Anmeldedaten und der API-Schlüssel;
- die Ausgabe eines Jobs und seine gespeicherten Extravars (der Assistent liest nur den Status eines Jobs, und nur
  wenn **Den Assistenten seine Jobs verfolgen lassen** in den Einstellungen eingeschaltet ist).

Alles unter einem Schlüssel, der wie ein Secret aussieht (`password`, `secret`, `token`, `api_key`, ...),
wird maskiert, bevor das Modell oder die Seite es sieht.

Um Formulardaten im Haus zu behalten, verwenden Sie Ihren eigenen Tenant (Azure OpenAI) oder ein lokales Modell (Ollama), keine öffentliche API.

---

## Grenzen

Die folgenden Grenzen werden auf der Einstellungsseite festgelegt:

- **Nachrichten pro Gespräch** (20) - danach muss der Benutzer ein neues Gespräch beginnen.
- **Tool-Runden pro Nachricht** (6) - wie oft das Modell ein Tool aufrufen darf, bevor es antwortet.
- **Zeitlimit** (60 s) - pro Aufruf beim Anbieter.

Die folgenden Grenzen sind fest: eine Nachricht gleichzeitig pro Gespräch, höchstens 4000 Zeichen pro Nachricht, 60 Nachrichten pro
Benutzer und Stunde und 5 Gespräche pro Benutzer. Ein Gespräch wird nach 2 Stunden ohne Nachricht verworfen.

Eine Zusammenfassungskarte mit einer Schaltfläche **Starten** lässt sich einmal verwenden und läuft nach 15 Minuten ab: Starten antwortet dann, dass die
Zusammenfassung abgelaufen ist, und der Benutzer bittet den Assistenten um eine neue. Gespräche und Zusammenfassungen werden im Arbeitsspeicher gehalten, daher muss
der Benutzer nach einem Neustart ein neues Gespräch beginnen.
