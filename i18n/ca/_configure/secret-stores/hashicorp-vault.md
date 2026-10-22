---
layout: default
title: HashiCorp Vault
parent: Magatzems de secrets
nav_order: 1
translated_from: 33cbbea1ca86bf474182d220bd6824af81aa752f
---

# HashiCorp Vault
{: .no_toc }

Llegeix credencials d'HashiCorp Vault, de KV v1 o v2 o d'un motor de secrets dinàmics
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

## Credencials dinàmiques de base de dades

Una referència de la forma `<mount>/creds/<role>`, p. ex. `database/creds/readonly`, llegeix d'un
motor de secrets dinàmics com el motor de bases de dades de Vault. Vault crea llavors un compte de base de dades
nou per a cada lectura, vàlid durant el lease.

- Un compte es reutilitza durant el 80% del seu lease, no durant el temps de memòria cau; amb memòria cau `0`, cada consulta en llegeix un de nou.
- Vault només retorna un usuari i una contrasenya: posa la resta de la connexió a la fila de la credencial.
- El lease no es revoca mai abans d'hora; el compte caduca quan Vault acaba el lease.

