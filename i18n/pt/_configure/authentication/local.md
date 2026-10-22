---
layout: default
title: Contas locais
parent: Autenticação
nav_order: 1
translated_from: 002a371f2b4dbe5cc9c99ee569b8cf17a2a4ac88
---

# Contas locais
{: .no_toc }

O admin integrado, e os utilizadores e grupos guardados na base de dados do AnsibleForms
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## O admin integrado

Cada arranque cria o grupo local `admins` e o utilizador admin se não existirem; três variáveis controlam o admin:

| Variável | Predefinição | Significado |
|---|---|---|
| [`ADMIN_USERNAME`](../customization/server.html#env_ADMIN_USERNAME) | `admin` | Nome de utilizador do admin, criado no grupo `admins` quando nenhum utilizador tem esse nome. |
| [`ADMIN_PASSWORD`](../customization/server.html#env_ADMIN_PASSWORD) | `AnsibleForms!123` | Palavra-passe dada ao admin quando é criado (ou reposto). |
| [`REINIT_ADMIN`](../customization/server.html#env_REINIT_ADMIN) | `0` | `1` repõe a palavra-passe do admin para `ADMIN_PASSWORD` e volta a colocá-lo em `admins`. |

`ADMIN_PASSWORD` só é usada quando o utilizador é criado ou reposto: alterá-la mais tarde não faz nada por si só.

Um utilizador local que inicia sessão com a palavra-passe predefinida pública `AnsibleForms!123` só pode alterá-la. O navegador abre uma
página de alteração de palavra-passe que não pode ser fechada, e o servidor responde a qualquer outro pedido com `403` (código
`password_change_required`) até a palavra-passe ser alterada. A nova palavra-passe tem de ser diferente da predefinida; depois da
alteração, o utilizador inicia sessão de novo com ela. Defina `ADMIN_PASSWORD` com o seu próprio valor antes do primeiro arranque para saltar este passo.

Alterar `ADMIN_USERNAME` depois do primeiro arranque cria um segundo utilizador admin com esse nome; o antigo é mantido.

{: .warning }
> `REINIT_ADMIN=1` repõe a palavra-passe em **cada** arranque enquanto estiver definida. Use-a para recuperar uma palavra-passe de admin perdida,
> depois remova-a e reinicie.

---

## Utilizadores e grupos

Os utilizadores e grupos locais gerem-se em **Acesso > Utilizadores** e **Acesso > Grupos**. Um utilizador tem estes campos:

| Campo | Significado |
|---|---|
| Nome de utilizador | O nome de início de sessão. Tem de ser único. |
| Descrição | Opcional. |
| Palavra-passe | Guardada como hash. Altere-a mais tarde com a ação **Alterar palavra-passe**. |
| Email | Opcional. |
| Grupo | O primeiro grupo local do utilizador. Adicione mais no separador **Grupos** da página do utilizador. |

Os utilizadores locais alteram a sua própria palavra-passe no seu perfil; os outros utilizadores fazem-no no seu diretório ou fornecedor de identidade.

Um utilizador pode pertencer a vários grupos, e recebe as funções de todos eles. O separador **Grupos** da página de um utilizador adiciona e
remove grupos, tal como o separador **Utilizadores** da página de um grupo. Um utilizador mantém pelo menos um grupo: o último não pode
ser removido.

Um grupo que ainda tem utilizadores não pode ser eliminado: remova primeiro os seus utilizadores. O grupo `admins` nunca pode ser eliminado nem
renomeado, e o utilizador `admin` nunca pode ser eliminado.

---

## Permitir o início de sessão

O separador **Detalhes** da página de um utilizador tem um interruptor **Permitir início de sessão**, também disponível como **Bloquear início de sessão** e **Permitir
início de sessão** no menu de linha da lista de utilizadores. Existe tanto para os utilizadores locais como para os utilizadores LDAP e SSO:

- **Ligado**: o utilizador inicia sessão normalmente.
- **Desligado**: as sessões do utilizador terminam de imediato e todos os inícios de sessão são recusados, até um admin voltar a ligá-lo. A página
  pede confirmação antes.

O interruptor não pode ser desligado para o utilizador `admin`, a forma de voltar a entrar, nem por um admin para a sua própria conta. A página de
um utilizador LDAP ou SSO tem também **Terminar sessões**, que termina a sessão do utilizador em todo o lado sem o bloquear.

---

## Mapeamento para funções

As funções nomeiam os grupos locais como `local/<group>` e os utilizadores como `local/<user>`; por predefinição, `admins` recebe `admin`:

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

Mantenha `local/admins` na função `admin`, para que o admin integrado possa sempre iniciar sessão, mesmo quando o diretório ou o
fornecedor de identidade não estão disponíveis. Quando o config.yaml não pode ser carregado de todo, os membros de `local/admins` continuam a receber a
função `admin`, para que possa iniciar sessão e corrigi-lo. Consulte [Funções](../config/roles.html) para as opções de função.

---

## Contas locais e LDAP

Um início de sessão com nome de utilizador e palavra-passe verifica os utilizadores locais antes do LDAP. Quando um utilizador local tem o mesmo nome que um utilizador
do diretório, a conta local ganha sempre e a palavra-passe do diretório não funciona para esse nome. Dê às contas locais nomes
que não possam coincidir com contas do diretório, por exemplo com um prefixo `svc-`.
