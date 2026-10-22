---
layout: default
title: Inloggegevens
parent: Expressies
nav_order: 4
translated_from: bfa50c90495c68300d189f9a0eb38e25df9e7c8e
---

# Inloggegevens
{: .no_toc }

Opgeslagen inloggegevens lezen in een expressie
{: .fs-6 .fw-300 }

---

Lees opgeslagen inloggegevens op naam of via een reguliere expressie, met een terugvaloptie:

```javascript
fn.fnCredentials('credentialname_or_regex','fallback_credentialname_or_regex')

// Try to use `fnRestBasic` and `fnRestJwtSecure` if possible, this avoids passwords and tokens going over the network.

// output : a credential object with all properties (user, password, host, port)
```

Eerst wordt de exacte naam geprobeerd. Heeft geen enkele referentie die naam, dan wordt de naam als reguliere expressie gebruikt, en daarna wordt de terugvaloptie geprobeerd.

#### Beperkt per rol

Wanneer een van de rollen van de gebruiker `credentials` opsomt in `config.yaml`, geeft `fn.fnCredentials` alleen een referentie terug die zo'n rol
toestaat: de patronen van de rol worden vergeleken met de naam van de gevonden referentie (op naam, via reguliere expressie of via de terugvaloptie),
en elke andere wordt geweigerd. Rollen zonder die lijst beperken het niet, en een admin wordt nooit beperkt.

#### Inloggegevens uit een secret store

Een referentie die een [secret store](../secret-stores) noemt, haalt haar `user` en `password`
tijdens de uitvoering uit die store. `fn.fnCredentials('myapp')` blijft ongewijzigd werken.

Een geheim kan ook zonder rij met inloggegevens worden gelezen, overal waar een naam van een referentie wordt geaccepteerd
(ook in `fnRestBasic`, `fnRestJwtSecure` en de headervervangingen van `fnRestAdvanced`):

```javascript
fn.fnCredentials('secret:vault:secret/ontap')   // secret:<store>:<reference>
fn.fnCredentials('vault:secret/ontap')          // the store named `vault`
```

De sleutels van het geheim worden gekoppeld zoals beschreven onder [Sleutelnamen](../secret-stores#key-names).
Een geheim met een andere vorm wordt omgevormd met een `jq`-expressie als derde argument:

```javascript
// secret: { "creds": { "u": "admin", "p": "Netapp12" } }
fn.fnCredentials('vault:secret/weird','','.creds | { user: .u, password: .p }')
```
