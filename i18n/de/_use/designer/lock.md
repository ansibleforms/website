---
layout: default
title: Die Designer-Sperre
parent: Designer
nav_order: 1
translated_from: f23a01e973e287a772930e69ca9ccaa7cb463c65
---

# Die Designer-Sperre
{: .no_toc }

Es bearbeitet immer nur eine Person gleichzeitig
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Die Sperre übernehmen

Der Designer ist aus, bis Sie ihn mit dem Schalter oben rechts im Designer einschalten. Das Einschalten übernimmt die
Sperre: Ab dann sind Sie der Einzige, der speichern kann, bis Sie ihn wieder ausschalten.

Ohne die Sperre zeigt der Designer **Designer ist nicht aktiv**, und es lässt sich nichts bearbeiten.

Speichervorgänge überschneiden sich nie: Ab 7.3.0 wird, solange ein Speichern, ein Push oder ein Laden läuft, ein zweites **Speichern** (ein Doppelklick oder gedrückt gehaltenes Strg+S)
ignoriert, sodass es kein zweites Backup und keinen zweiten Commit schreiben kann, der mit dem ersten konkurriert.

---

## Wenn jemand anderes sie hat

Solange ein anderer Benutzer die Sperre hält, zeigt der Designer **Der Designer wird von** diesem Benutzer **verwendet**, und sonst nichts: keine Bereiche,
keine Dateien.

Der Schalter erscheint eingeschaltet, aber ausgegraut, mit **Gesperrt von** und dem Namen des Benutzers daneben. Sie können die Sperre übernehmen, sobald dieser
den Designer ausschaltet. Jeder geöffnete Designer sieht sofort, wenn die Sperre übernommen oder freigegeben wird, ohne Neuladen.

Wenn zwei Benutzer den Designer im selben Moment einschalten, erhält einer von ihnen die Sperre. Ab 7.3.0 sieht der andere, wer sie hält,
und jeder Editor bleibt schreibgeschützt, sodass sich nichts eintippen lässt, was nicht gespeichert werden könnte.

---

## Die Sperre eines anderen freigeben

Ein Admin kann eine Sperre freigeben, die jemand anderes hält, etwa wenn dieser mit geöffnetem Designer nach Hause gegangen ist.

**Freigeben**, neben **Gesperrt von**, erscheint nur für Admins. Es fragt zuerst nach: Die nicht gespeicherten Änderungen des Benutzers gehen verloren.

Ab 7.3.0 erfährt der Benutzer, dessen Sperre freigegeben wurde, davon und von wem: **Ihre Designer-Sperre wurde von** dem Namen des Admins **freigegeben**,
mit **Nicht gespeicherte Änderungen können nicht mehr gespeichert werden.** Sein Designer übernimmt die Sperre nicht von selbst zurück; er schaltet ihn wieder ein,
wenn er weitermachen will.

---

## Eine vergessene Sperre

Eine Sperre, die niemand nutzt, gibt sich selbst frei, sodass niemand auf einen Designer wartet, den niemand geöffnet hat.

Der geöffnete Designer des Inhabers teilt dem Server laufend mit, dass er noch da ist. Hat der Server
5 Minuten lang nichts von ihm gehört, weil der Browser geschlossen, der Computer heruntergefahren wurde oder das Netzwerk weg ist, ist die Sperre wieder frei. Kehrt
der Inhaber zum Designer zurück, übernimmt dieser die Sperre wieder, sofern niemand anderes sie hat. Die Freigabe durch einen Admin ist die Ausnahme: Danach wird die
Sperre nicht zurückgenommen.
