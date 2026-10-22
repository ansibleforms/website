---
layout: default
title: Comptes locals
parent: Autenticació
nav_order: 1
translated_from: 002a371f2b4dbe5cc9c99ee569b8cf17a2a4ac88
---

# Comptes locals
{: .no_toc }

L'admin integrat, i els usuaris i grups desats a la base de dades d'AnsibleForms
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## L'admin integrat

Cada arrencada crea el grup local `admins` i l'usuari admin si no existeixen; tres variables controlen l'admin:

| Variable | Predeterminat | Significat |
|---|---|---|
| [`ADMIN_USERNAME`](../customization/server.html#env_ADMIN_USERNAME) | `admin` | Nom d'usuari de l'admin, creat al grup `admins` quan cap usuari no té aquest nom. |
| [`ADMIN_PASSWORD`](../customization/server.html#env_ADMIN_PASSWORD) | `AnsibleForms!123` | Contrasenya que rep l'admin quan es crea (o es restableix). |
| [`REINIT_ADMIN`](../customization/server.html#env_REINIT_ADMIN) | `0` | `1` restableix la contrasenya de l'admin a `ADMIN_PASSWORD` i el torna a posar a `admins`. |

`ADMIN_PASSWORD` només s'utilitza quan l'usuari es crea o es restableix: canviar-la després no fa res per si sol.

Un usuari local que inicia sessió amb la contrasenya predeterminada pública `AnsibleForms!123` només la pot canviar. El navegador obre una
pàgina de canvi de contrasenya que no es pot tancar, i el servidor respon a qualsevol altra petició amb `403` (codi
`password_change_required`) fins que es canvia la contrasenya. La contrasenya nova ha de ser diferent de la predeterminada; després del
canvi, l'usuari torna a iniciar sessió amb ella. Defineix `ADMIN_PASSWORD` amb el teu propi valor abans de la primera arrencada per saltar-te aquest pas.

Canviar `ADMIN_USERNAME` després de la primera arrencada crea un segon usuari admin amb aquest nom; l'antic es conserva.

{: .warning }
> `REINIT_ADMIN=1` restableix la contrasenya a **cada** arrencada mentre està definida. Fes-la servir per recuperar una contrasenya d'admin perduda,
> i després treu-la i reinicia.

---

## Usuaris i grups

Els usuaris i grups locals es gestionen a **Accés > Usuaris** i **Accés > Grups**. Un usuari té aquests camps:

| Camp | Significat |
|---|---|
| Nom d'usuari | El nom d'inici de sessió. Ha de ser únic. |
| Descripció | Opcional. |
| Contrasenya | Es desa com a hash. Canvia-la més endavant amb l'acció **Canvia la contrasenya**. |
| Correu electrònic | Opcional. |
| Grup | El primer grup local de l'usuari. Afegeix-ne més a la pestanya **Grups** de la pàgina de l'usuari. |

Els usuaris locals canvien la seva pròpia contrasenya al seu perfil; els altres usuaris ho fan al seu directori o proveïdor d'identitat.

Un usuari pot pertànyer a diversos grups, i rep els rols de tots ells. La pestanya **Grups** de la pàgina d'un usuari afegeix i
treu grups, igual que la pestanya **Usuaris** de la pàgina d'un grup. Un usuari conserva almenys un grup: l'últim no es pot
treure.

Un grup que encara té usuaris no es pot suprimir: primer treu-ne els usuaris. El grup `admins` no es pot suprimir ni
reanomenar mai, i l'usuari `admin` no es pot suprimir mai.

---

## Permetre l'inici de sessió

La pestanya **Detalls** de la pàgina d'un usuari té un interruptor **Permet l'inici de sessió**, que també s'ofereix com a **Bloqueja l'inici de sessió** i **Permet
l'inici de sessió** al menú de fila de la llista d'usuaris. Existeix tant per als usuaris locals com per als usuaris LDAP i SSO:

- **Activat**: l'usuari inicia sessió amb normalitat.
- **Desactivat**: les sessions de l'usuari acaben a l'instant i es rebutja qualsevol inici de sessió, fins que un admin el torni a activar. La pàgina
  demana confirmació abans.

L'interruptor no es pot desactivar per a l'usuari `admin`, la via per tornar a entrar, ni el pot desactivar un admin per al seu propi compte. La pàgina
d'un usuari LDAP o SSO també té **Tanca les sessions**, que tanca la sessió de l'usuari a tot arreu sense bloquejar-lo.

---

## Assignació a rols

Els rols nomenen els grups locals com a `local/<group>` i els usuaris com a `local/<user>`; per defecte `admins` rep `admin`:

```yaml
roles:
  - name: admin
    groups:
      - local/admins
  - name: operator
    groups:
      - local/operators
    users:
      - local/svc-backup
```

Mantén `local/admins` al rol `admin`, perquè l'admin integrat sempre pugui iniciar sessió, fins i tot quan el directori o el
proveïdor d'identitat no estan disponibles. Quan config.yaml no es pot carregar de cap manera, els membres de `local/admins` continuen rebent el
rol `admin`, així que pots iniciar sessió i corregir-ho. Vegeu [Rols](../config/roles.html) per a les opcions dels rols.

---

## Comptes locals i LDAP

Un inici de sessió amb usuari i contrasenya comprova els usuaris locals abans que LDAP. Quan un usuari local té el mateix nom que un usuari
del directori, el compte local sempre guanya i la contrasenya del directori no funciona per a aquest nom. Dona als comptes locals noms
que no puguin coincidir amb comptes del directori, per exemple amb un prefix `svc-`.
