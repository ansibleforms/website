---
layout: default
title: LDAP
parent: Autenticação
nav_order: 2
translated_from: a4089d681ad976e31e7ddefb29588bd3ca334dab
---

# LDAP
{: .no_toc }

Deixe os utilizadores do diretório iniciar sessão com a sua própria palavra-passe, e dê-lhes funções através dos seus grupos do diretório
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Como funciona

O AnsibleForms liga-se ao diretório com uma conta de bind, procura o utilizador e depois faz bind como esse utilizador para verificar
a palavra-passe:

1. O utilizador inicia sessão com nome de utilizador e palavra-passe. Quando nenhum utilizador **local** tem esse nome, tenta-se o LDAP.
2. O AnsibleForms faz bind com a conta de bind da credencial do diretório, e procura em **Base de pesquisa** uma entrada cujo
   **Atributo do nome de utilizador** seja igual ao nome de utilizador.
3. Faz bind como a entrada encontrada, com a palavra-passe que foi escrita.
4. Os grupos são lidos da entrada (ou de uma pesquisa de grupos), filtrados e prefixados com `ldap/`.

Um nome de utilizador em formato UPN (`jdoe@example.com`) que não encontra nenhum utilizador é tentado de novo uma vez com a parte antes do `@`, para que os utilizadores
possam iniciar sessão com qualquer das formas, mesmo quando o Atributo do nome de utilizador contém o nome curto. Uma palavra-passe errada nunca é tentada de novo.

Um único conjunto de definições serve o Active Directory, o OpenLDAP e outros; a partir da 7.3.0 pode haver [vários diretórios](#several-directories).

---

## Definições

A partir da 7.3.0, as definições são por diretório. **Acesso > LDAP** lista os diretórios, pela ordem em que um nome de utilizador simples é procurado:

![Acesso > LDAP](../assets/screenshots/ldap.jpg)

| Menu da linha | O que faz |
|---|---|
| Editar | Abre a página do diretório |
| Testar ligação | Tenta um início de sessão com um nome de utilizador e uma palavra-passe de teste, consulte [Testar a ligação](#testing-the-connection) |
| Ativar, Desativar | Liga ou desliga o diretório; `main` é desativado em vez de eliminado |
| Mover para cima, Mover para baixo | Altera a sua posição na ordem de procura |
| Eliminar | Remove o diretório; aparece mas fica desativado em `main` |

Adicionar um diretório pede os seus campos em quatro passos, os separadores da sua página. **Detalhes** contém **Ativado**, o **Nome** e uma **Descrição**:

| Separador | Definição | Significado |
|---|---|---|
| Credenciais | Credencial | Obrigatória. Uma credencial `ldap` de [Ligações > Credenciais](../credentials.html), que contém a ligação, ver abaixo |
| Utilizadores | Base de pesquisa | DN onde começa a pesquisa de utilizadores, ex. `OU=Users,DC=example,DC=com`. As subárvores também são pesquisadas |
| Utilizadores | Atributo do nome de utilizador | Atributo comparado com o nome de início de sessão: `sAMAccountName` no AD (a predefinição), `uid` no OpenLDAP |
| Utilizadores | Atributo de email | Atributo que contém o endereço de email, normalmente `mail` |
| Utilizadores | Domínios de início de sessão | Domínios cujos inícios de sessão `user@domain` vão diretamente para este diretório, consulte [Vários diretórios](#several-directories) |
| Grupos | Atributo de grupos | Atributo da entrada do utilizador que contém os grupos (`memberOf`, a predefinição), ou `groups` com uma pesquisa de grupos |
| Grupos | Base de pesquisa de grupos | DN onde começa a pesquisa de grupos |
| Grupos | Classe de grupo | objectClass dos grupos, ex. `group`, `groupOfNames` ou `posixGroup` |
| Grupos | Atributo de membro do grupo | Atributo de um grupo que lista os seus membros, ex. `member`, `uniqueMember` ou `memberUid`; predefinição `member` |
| Grupos | Atributo de Utilizador do Membro do Grupo | Atributo do utilizador que esses valores de membro contêm, ex. `dn` ou `uid`; predefinição `dn` |
| Grupos | Filtro de grupos | Expressão regular; só ficam os grupos cujo nome corresponde. Vazio mantém todos os grupos |

As predefinições dos três últimos campos de grupos só se aplicam quando se usa a pesquisa de grupos, consulte a secção seguinte.

A credencial `ldap` contém como se chega ao diretório e com que conta se pesquisa:

| Campo | Significado |
|---|---|
| Servidores | Um por campo, como `host`, `host:port` ou `ldaps://host:port`, tentados por esta ordem: quando um não está acessível, tenta-se o seguinte |
| Porta | `389` para LDAP simples, `636` para LDAPS |
| Ativar TLS | Ligar com LDAPS (`ldaps://`). O StartTLS na porta 389 não é suportado |
| Ignorar certificados | Ignorar a validação do certificado do servidor. Só aparece com **Ativar TLS** |
| Certificado | O certificado de cliente que o AnsibleForms apresenta aos servidores, em PEM, quando os certificados são verificados |
| CA bundle | O ou os certificados de CA que assinaram o certificado do servidor, em PEM, quando os certificados são verificados |
| DN do utilizador de bind | O DN da conta de serviço que pesquisa o diretório |
| Palavra-passe do utilizador de bind | A sua palavra-passe, guardada cifrada ou lida de um [cofre de segredos](../secret-stores/) |

Só um admin pode adicionar ou alterar uma credencial `ldap`, consulte [Quem pode alterar uma credencial](../credentials.html#who-may-change-a-credential).
Até à 7.2.0, os servidores, o TLS e a conta de bind eram campos das definições LDAP. A atualização para a 7.3.0 move-os para uma credencial,
consulte [Endereços nas credenciais](../credentials/types.html#addresses-in-credentials):

| O diretório antes da atualização | Para onde vão os seus servidores |
|---|---|
| O seu próprio DN e palavra-passe de bind, sem credencial | Uma nova credencial `ldap` chamada `<directory>-ldap`, como `main-ldap` |
| Uma credencial sem servidores | Para essa credencial |
| Uma credencial que já contém outros servidores | Uma cópia da credencial chamada `<credential>-<directory>`, que o diretório passa a nomear |

Um nome já ocupado recebe `-2`, `-3` e assim sucessivamente. Um diretório do config seed fica como está: o seed é o seu dono.

---

## Grupos

Os grupos vêm de um de dois sítios, e o **Atributo de grupos** decide qual se usa:

- **Um atributo da entrada do utilizador**, normalmente `memberOf`. É a configuração habitual no Active Directory, e no
  OpenLDAP com o overlay `memberof`.
- **Uma pesquisa de grupos**, para diretórios sem `memberOf`. Só corre quando **Base de pesquisa de grupos** e **Classe de grupo**
  estão ambos definidos: o AnsibleForms procura então grupos dessa classe cujo **Atributo de membro do grupo** contém o
  **Atributo de Utilizador do Membro do Grupo** do utilizador, e guarda o resultado no atributo `groups`. Defina **Atributo de grupos** como `groups`
  para a usar.

{: .note }
> Com **Atributo de grupos** `memberOf`, uma pesquisa de grupos configurada corre, mas o seu resultado não é usado para as funções.

Cada grupo é um DN, e o AnsibleForms fica com o seu primeiro CN: `CN=AF-Admins,OU=Groups,DC=example,DC=com` passa a `AF-Admins`.
O **Filtro de grupos** aplica-se depois a esse nome, e os grupos que restam recebem o prefixo `ldap/`: `ldap/AF-Admins`.

Em diretórios grandes, o filtro mantém pequenos os tokens e as tarefas; uma expressão regular inválida mantém todos os grupos e fica registada.

---

## Mapeamento para funções

No config.yaml, um grupo LDAP é `ldap/<group CN>` e um utilizador LDAP é `ldap/<username>`, ambos sensíveis a maiúsculas e minúsculas:

```yaml
roles:
  - name: admin
    groups:
      - local/admins
      - ldap/AF-Admins
  - name: operator
    groups:
      - ldap/AF-Operators
    users:
      - ldap/jdoe
```

O nome de utilizador é o valor do **Atributo do nome de utilizador** tal como o diretório o devolve, não como o utilizador o escreveu.
Consulte [Funções](../config/roles.html) para as opções de função.

---

## Vários diretórios

A partir da 7.3.0 pode haver vários diretórios, cada um com os seus servidores, utilizadores e grupos. Os seus nomes distinguem os seus membros:

| Diretório | Nome de utilizador | Grupos | Numa função |
|---|---|---|---|
| `main` | `jdoe` | `ldap/AF-Admins` | `ldap/jdoe`, `ldap/AF-Admins` |
| Qualquer outro, como `corp` | `corp/jdoe` | `ldap/corp/AF-Admins` | `ldap/corp/jdoe`, `ldap/corp/AF-Admins` |

Um utilizador nomeia o diretório ao iniciar sessão como `corp\jdoe` ou `corp/jdoe`, ou inicia sessão com um endereço de um domínio que o diretório
detém. Um nome de utilizador simples é tentado em todos os diretórios ativados, pela sua ordem, tal como um nome como `other\jdoe` quando nenhum
diretório se chama `other`: nesse caso é procurado tal como foi escrito.

O primeiro diretório que conhece o utilizador decide: uma palavra-passe errada aí é a resposta, e o diretório seguinte não é
tentado, já que pode conter outra pessoa com esse nome. Um diretório que não está acessível é ignorado.

O diretório chamado `default` até à 7.2.0 chama-se `main` a partir da 7.3.0: a atualização renomeia-o, e uma instalação nova começa
com `main`. Os seus membros mantêm os nomes curtos, por isso as funções que os nomeiam não precisam de alterações. O diretório `main` não pode ser
renomeado, e um nome de diretório só contém letras, dígitos, `-` e `_`.

---

## Testar a ligação

**Testar ligação** pede um nome de utilizador e uma palavra-passe de teste, e tenta um início de sessão com as definições que estão no ecrã, guardadas ou não.
Se correr bem, mostra a entrada do utilizador no diretório, que indica os nomes exatos dos atributos e os DN dos grupos a usar.

Um utilizador de teste que não existe também dá sucesso: a ligação e a conta de bind funcionam, só o utilizador não é
encontrado. Erros típicos:

| Mensagem | Causa |
|---|---|
| `Bad server or port (connection failed)` | O nome do host não resolve ou a porta não está acessível. |
| `Wrong binding credentials` | O DN ou a palavra-passe de bind da credencial do diretório estão errados. |
| `Unable to verify the certificate` | O certificado do servidor não está assinado pelo CA bundle da credencial. |
| `Certificate is not valid` | O Certificado ou o CA bundle da credencial não contêm um certificado PEM válido. |

---

## Exemplo de Active Directory

Este exemplo liga-se a dois controladores de domínio por LDAPS e mantém só os grupos cujo nome começa por `AF-`:

| Definição | Valor |
|---|---|
| Credencial > Servidores | `dc01.example.com`, depois `dc02.example.com` |
| Credencial > Porta | `636` |
| Credencial > Ativar TLS | ligado |
| Credencial > Ignorar certificados | desligado, com um certificado de cliente e a cadeia de CA da CA empresarial |
| Credencial > DN do utilizador de bind | `CN=svc-ansibleforms,OU=Service Accounts,DC=example,DC=com` |
| Base de pesquisa | `OU=Users,DC=example,DC=com` |
| Atributo de email | `mail` |
| Atributo do nome de utilizador | `sAMAccountName` |
| Atributo de grupos | `memberOf` |
| Filtro de grupos | `^AF-` |

Os membros de `CN=AF-Operators,…` correspondem a funções com `ldap/AF-Operators`, e iniciam sessão como `jdoe` ou `jdoe@example.com`.

---

## Exemplo de OpenLDAP

Este exemplo usa uma pesquisa de grupos em entradas `groupOfNames`, por isso funciona sem o overlay `memberof`:

| Definição | Valor |
|---|---|
| Credencial > Servidores | `ldap.example.com` |
| Credencial > Porta | `636` |
| Credencial > Ativar TLS | ligado |
| Credencial > DN do utilizador de bind | `cn=readonly,dc=example,dc=com` |
| Base de pesquisa | `ou=people,dc=example,dc=com` |
| Atributo de email | `mail` |
| Atributo do nome de utilizador | `uid` |
| Atributo de grupos | `groups` |
| Base de pesquisa de grupos | `ou=groups,dc=example,dc=com` |
| Classe de grupo | `groupOfNames` |
| Atributo de membro do grupo | `member` |
| Atributo de Utilizador do Membro do Grupo | `dn` |

Um utilizador listado em `cn=af-admins,ou=groups,dc=example,dc=com` recebe o grupo `ldap/af-admins`. Para grupos `posixGroup`,
use **Atributo de membro do grupo** `memberUid` e **Atributo de Utilizador do Membro do Grupo** `uid`.

Com o overlay `memberof`, deixe vazios os campos da pesquisa de grupos e defina **Atributo de grupos** como `memberOf`.

---

## Problemas comuns

A maior parte dos problemas de LDAP reduz-se a um destes:

- **Um utilizador local com o mesmo nome.** Os utilizadores locais são verificados primeiro, por isso o diretório nunca é consultado para esse nome.
- **Sem grupos, ou com os errados.** O Atributo de grupos tem de existir (`groups` com uma pesquisa de grupos); `memberOf` ignora o aninhamento.
- **Nomes de grupo que não correspondem.** Use `ldap/<CN>` com as mesmas maiúsculas e minúsculas, e verifique se o Filtro de grupos mantém o grupo.
- **DN de grupos que não começam por um CN.** Só o primeiro valor `CN=` é usado como nome do grupo, por isso todos os DN de grupo
  têm de começar por `CN=` (ou `cn=`).
- **Certificados.** O TLS precisa dos dois campos de certificado da credencial e de um nome de servidor que corresponda; Ignorar certificados é só para testes.
- **Definições que não podem ser guardadas.** Quando um diretório vem do [config seed](../seed/managed-objects.html), a sua página
  é só de leitura: altere antes o ficheiro de seed.

Um início de sessão falhado mostra uma mensagem genérica. O motivo é registado pelo servidor e guardado no registo de auditoria, e no Active
Directory é traduzido a partir do código do diretório, ex. `Wrong password`, `Account locked` ou `Password expired`.
