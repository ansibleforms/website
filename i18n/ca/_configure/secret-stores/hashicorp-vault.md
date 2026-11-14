---
layout: default
title: HashiCorp Vault
parent: Magatzems de secrets
nav_order: 1
translated_from: 1134189481b234cb2b18edbabd74427e37d2f43c
---

# HashiCorp Vault
{: .no_toc }

Llegir i escriure credencials a HashiCorp Vault KV, llegir secrets dinàmics
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Camps del magatzem

A més dels [camps que té tot magatzem](./#adding-a-store), un magatzem HashiCorp Vault té aquests camps:

| Camp | Significat |
|---|---|
| Credencial | Una credencial **HashiCorp Vault** de [Connexions > Credencials](../credentials.html): l'adreça del Vault, els seus ajustos de TLS, i el token com a contrasenya, amb accés de lectura als camins que fan servir les teves credencials. **Afegeix una credencial** en crea una d'aquest tipus. AnsibleForms no renova el token. |
| Espai de noms | L'espai de noms de Vault Enterprise, enviat com a `X-Vault-Namespace`. Es mostra un cop activat **Vault Enterprise**, al pas **Tipus**. |
| Versió de KV | `2` (predeterminat) o `1`. |
| Punt de muntatge predeterminat | Es fa servir per a una referència sense barra, p. ex. `myapp` passa a ser `secret/data/myapp`. |

La referència del secret és el camí, p. ex. `secret/myapp/prod`. Per a KV v2 el segment `/data/`
s'insereix quan no el poses.

---

## Escriure credencials

Des de 7.6.0, l'usuari i la contrasenya d'una credencial es poden escriure al Vault en **Desar** (vegeu [Escriure credencials](./#writing-credentials)).

Activa **Permet l'escriptura** a les **Opcions** del magatzem, i indica on pot escriure:

| Camp | Significat |
|---|---|
| Permet l'escriptura | Permet que una credencial escrigui el seu usuari i contrasenya en aquest magatzem en **Desar**. Desactivat per defecte. |
| Prefix d'escriptura | El camí on, o sota el qual, s'escriuen les credencials, p. ex. `secret/ansibleforms`. Un muntatge sol, p. ex. `secret`, permet tot el muntatge. Obligatori amb l'escriptura activada. |

El secret s'escriu com a `username` i `password`, a KV v2 o v1 segons la **Versió KV** del magatzem. El testimoni necessita les capacitats
read, create i update sota el prefix; read comprova si ja hi ha un secret. Per a KV v2 i el prefix `secret/ansibleforms`:

```hcl
path "secret/data/ansibleforms/*" {
  capabilities = ["read", "create", "update"]
}
```

El camí d'un motor de secrets dinàmics, p. ex. `database/creds/readonly`, no s'escriu mai: Vault crea aquestes credencials ell mateix.

---

## Credencials dinàmiques de base de dades

Una referència de la forma `<mount>/creds/<role>`, p. ex. `database/creds/readonly`, llegeix d'un
motor de secrets dinàmics com el motor de bases de dades de Vault. Vault crea llavors un compte de base de dades
nou per a cada lectura, vàlid durant el lease.

- Un compte es reutilitza durant el 80% del seu lease, no durant el temps de memòria cau; amb memòria cau `0`, cada consulta en llegeix un de nou.
- Vault només retorna un usuari i una contrasenya: posa la resta de la connexió a la fila de la credencial.
- El lease no es revoca mai abans d'hora; el compte caduca quan Vault acaba el lease.

