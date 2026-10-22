---
layout: default
title: Anmeldedaten
parent: Ausdrücke
nav_order: 4
translated_from: bfa50c90495c68300d189f9a0eb38e25df9e7c8e
---

# Anmeldedaten
{: .no_toc }

Gespeicherte Anmeldedaten in einem Ausdruck lesen
{: .fs-6 .fw-300 }

---

Gespeicherte Anmeldedaten nach Name oder per regulärem Ausdruck lesen, mit einer Alternative:

```javascript
fn.fnCredentials('credentialname_or_regex','fallback_credentialname_or_regex')

// Try to use `fnRestBasic` and `fnRestJwtSecure` if possible, this avoids passwords and tokens going over the network.

// output : a credential object with all properties (user, password, host, port)
```

Zuerst wird der exakte Name versucht. Gibt es keine Anmeldedaten mit diesem Namen, wird der Name als regulärer Ausdruck verwendet, und danach wird die Alternative versucht.

#### Durch Rollen begrenzt

Wenn eine der Rollen des Benutzers in `config.yaml` die Liste `credentials` enthält, gibt `fn.fnCredentials` nur Anmeldedaten zurück, die eine solche Rolle
erlaubt: Die Muster der Rolle werden mit dem Namen der gefundenen Anmeldedaten verglichen (per Name, regulärem Ausdruck oder Alternative),
und alle anderen werden abgelehnt. Rollen ohne diese Liste begrenzen nichts, und ein Admin wird nie begrenzt.

#### Anmeldedaten aus einem Secret Store

Anmeldedaten, die einen [Secret Store](../secret-stores) angeben, erhalten ihren `user` und ihr `password`
zur Laufzeit aus diesem Store. `fn.fnCredentials('myapp')` funktioniert unverändert weiter.

Ein Secret lässt sich auch ohne Anmeldedaten-Eintrag lesen, überall dort, wo ein Name von Anmeldedaten akzeptiert wird
(auch in `fnRestBasic`, `fnRestJwtSecure` und den Header-Ersetzungen von `fnRestAdvanced`):

```javascript
fn.fnCredentials('secret:vault:secret/ontap')   // secret:<store>:<reference>
fn.fnCredentials('vault:secret/ontap')          // the store named `vault`
```

Die Schlüssel des Secrets werden wie unter [Schlüsselnamen](../secret-stores#key-names) beschrieben zugeordnet.
Ein Secret mit anderer Struktur wird mit einem `jq`-Ausdruck als drittem Argument umgeformt:

```javascript
// secret: { "creds": { "u": "admin", "p": "Netapp12" } }
fn.fnCredentials('vault:secret/weird','','.creds | { user: .u, password: .p }')
```
