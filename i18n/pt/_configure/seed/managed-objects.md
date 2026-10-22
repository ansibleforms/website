---
layout: default
title: Objetos geridos
parent: Config seed
nav_order: 2
translated_from: dd0ea4d46391bf9b2e5928063cd30e33ac1285f9
---

# Objetos geridos
{: .no_toc }

Como o seed é dono dos objetos que lista, e como mantém os segredos de fora
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## As secções de linha única são tudo ou nada

`ldap`, `settings` e `chat` são cada uma uma **linha única**, por isso o seed tem de declarar todos os seus campos; as outras secções são listas.

Um seed que omite um campo recusa-se a arrancar e indica-o:

```
Config seed failed, refusing to start: Seed file validation failed: /settings must have required property 'mail_server'
```

Declare um valor vazio explicitamente com `""` ou `false`. Alguns campos são opcionais, e um que seja omitido fica sem alterações:

| Secção | Campos opcionais |
|---|---|
| `ldap` | `description`, `credential` (uma credencial com que fazer bind) e `groupfilter` |
| `chat` | `auth_type`, `api_version`, `request_user`, `ignore_certs` e `extra_headers` |
| `settings` | Nenhum |

`settings` cobre só os campos de email e o URL; todas as outras definições continuam editáveis.

---

## O ficheiro não contém segredos

Cada `${VARIABLE}` é substituída por essa variável de ambiente (no Kubernetes, a partir de um `Secret`), por isso o ficheiro pode viver no Git.

Uma variável não definida é um **erro fatal**, para que um marcador nunca possa acabar guardado como palavra-passe.

As credenciais também podem usar um [cofre de segredos](../secret-stores) (`secret_store`, `secret_ref`); `vault_path` desaparece na 8.

---

## Objetos geridos

Um objeto que vem do seed fica marcado como **gerido**:

- É imposto em **cada** arranque, para que o ficheiro continue a ser a referência.
- É só de leitura: a API responde **403**, a interface desativa Editar e Eliminar, e a sua própria página diz que vem do ficheiro de config
  seed e é só de leitura.
- Só o seed pode definir ou retirar a marca.

Os objetos criados à mão **nunca são tocados**, a menos que o seed declare o mesmo nome. Esse registo é então **adotado**:
os campos declarados são impostos e passa a ser só de leitura. A adoção é registada como aviso e no registo de auditoria.

Aplicar o seed é idempotente: os registos que já correspondem ficam como estão, por isso um reinício normalmente indica `0 updated`.

Um repositório declarado cuja working tree falta é **clonado de novo** em cada arranque, por isso um primeiro clone falhado é
tentado de novo. A linha *Repositórios* da página Estado mostra qualquer repositório sem working tree.

### Remover um objeto

Remover um objeto do ficheiro **liberta-o**: o registo fica e volta a ser editável. Eliminar uma secção inteira
faz o mesmo.

Acrescente `prune: true` a uma secção de lista para **eliminar** os registos geridos que o ficheiro já não declara:

```yaml
credentials:
  prune: true
  items:
    - name: production-db
      # anything else the seed used to manage is deleted
```

`prune` nunca elimina um registo criado à mão.

### Desligar o seed

Retirar `CONFIG_SEED_PATH` **não** liberta nada: o seed deixa de ser aplicado, e os registos que geria continuam geridos
e só de leitura. Para os voltar a editar, liberte-os primeiro: aponte `CONFIG_SEED_PATH` para um ficheiro sem eles (um ficheiro vazio não declara
nada e liberta todos os registos), deixe-o aplicar num arranque ou num recarregamento, e depois retire a variável. Os registos libertados ficam como
estão, e passam a ser editáveis.
