---
layout: default
title: Objetos geridos
parent: Config seed
nav_order: 2
translated_from: b007fcc08a96c4035422a238ae335bf4eedd48c5
---

# Objetos geridos
{: .no_toc }

Como o seed é dono dos objetos que lista, e como mantém os segredos de fora
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## As secções de linha única são tudo ou nada

`ldap`, `settings` e `chat_assistant` (`chat` antes da 7.8.0) são cada uma uma **linha única**, por isso o seed tem de declarar todos os seus campos.

Um seed que omite um campo recusa-se a arrancar e indica-o:

```
Config seed failed, refusing to start: Seed file validation failed: /settings must have required property 'url'
```

Declare um valor vazio explicitamente com `""` ou `false`. Alguns campos são opcionais, e um que seja omitido fica sem alterações:

| Secção | Campos opcionais |
|---|---|
| `ldap` | `description`, `credential` (uma credencial com que fazer bind) e `groupfilter` |
| `chat_assistant` | `auth_type`, `api_version`, `request_user`, `ignore_certs`, `extra_headers`, e `credential` desde a 7.8.0 |
| `settings` | As chaves `mail_*`, obsoletas desde a 7.6.0 (consulte [Exemplo](example.html)) |

`settings` cobre só o URL, e as chaves de email obsoletas; todas as outras definições continuam editáveis.

---

## O ficheiro não contém segredos

Cada `${VARIABLE}` é substituída por essa variável de ambiente (no Kubernetes, a partir de um `Secret`), por isso o ficheiro pode viver no Git.

Uma variável não definida é um **erro fatal**, para que um marcador nunca possa acabar guardado como palavra-passe.

As credenciais também podem usar um [cofre de segredos](../secret-stores) (`secret_store`, `secret_ref`); `vault_path` desaparece na 8.

---

## Objetos geridos

Um objeto das secções de lista (`runners`, `secret_stores`, `credentials`, `databases`, `sso`, `repositories`, `syslog`,
`notifications` e `labels`) ou de uma secção de linha única que vem do seed fica marcado como **gerido**:

- É imposto em **cada** arranque, para que o ficheiro continue a ser a referência.
- É só de leitura: a API responde **403**, a interface desativa Editar e Eliminar, e a sua própria página diz que vem do ficheiro de config
  seed e é só de leitura.
- Só o seed pode definir ou retirar a marca.

Os objetos criados à mão **nunca são tocados**, a menos que o seed declare o mesmo nome. Esse registo é então **adotado**:
os campos declarados são impostos e passa a ser só de leitura. A adoção é registada como aviso e no registo de auditoria.

Aplicar o seed é idempotente: os registos que já correspondem ficam como estão, por isso um reinício normalmente indica `0 updated`.

Um repositório declarado cuja working tree falta é **clonado de novo** em cada arranque, por isso um primeiro clone falhado é
tentado de novo. A linha *Repositórios* da página Estado mostra qualquer repositório sem working tree.

Desde a 7.8.0, um [repositório git](../repositories/) pode conter os mesmos tipos de objetos. Um objeto que um repositório contém continua a ser
do repositório: o item do seed para ele não é aplicado, e o registo do servidor indica-o. Um repositório que o seed declara continua a ser do seed.

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

Retirar `CONFIG_SEED_PATH` desliga o seed: o arranque seguinte liberta todos os registos e campos que o seed geria, como faria um seed
vazio aplicado. Os registos mantêm os seus valores e voltam a ser editáveis, e o registo do servidor e o registo de auditoria indicam o que foi libertado.

Um `CONFIG_SEED_PATH` cujo ficheiro falta não liberta nada: o servidor recusa-se a arrancar, porque um ficheiro montado pode
apenas estar atrasado.

---

## Definições que o seed declara

As secções acrescentadas na 7.8.0 são detidas de forma menos estrita do que os objetos geridos, de duas maneiras.

| Secções | Como o seed é dono delas |
|---|---|
| `defaults`, `logo`, `icon`, `name`, `links`, `mcp` | Campo a campo: cada campo declarado é só de leitura na sua página, com um aviso, e a API recusa alterá-lo (403) |
| `users`, `groups`, `announcements`, `disclaimer`, `ssh` | Criados ou alterados em cada aplicação, nunca bloqueados nem eliminados |

Um campo de `defaults`, `logo`, `icon`, `name`, `links` ou `mcp` que o seed deixa de declarar é libertado, e todos o são
quando o seed é desligado. Um logótipo ou ícone do seed não pode ser carregado nem removido na aplicação. Quando um repositório contém a mesma página,
o seed fica com os campos que declara e o repositório contém os outros.

Um utilizador, um grupo, um anúncio, uma versão do aviso legal ou a chave SSH e os hosts conhecidos do seed continuam editáveis na aplicação, e a
aplicação seguinte volta a escrever os valores do seed onde diferem. Remover um item do ficheiro deixa-o na aplicação, e `prune` não elimina
nenhum deles.
