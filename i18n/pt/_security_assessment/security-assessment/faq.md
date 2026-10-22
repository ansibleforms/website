---
layout: default
title: FAQ da avaliação
nav_order: 6
translated_from: 731a656c844e6262715e5c8d0a7a291e3b6321f2
---

# FAQ da avaliação
{: .no_toc }

Respostas curtas às perguntas que os questionários de segurança mais fazem
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Dados e alojamento

Onde ficam os dados, e quem lhes pode aceder:

| Pergunta | Resposta |
|---|---|
| Onde são guardados os nossos dados? | Na base de dados MySQL ou MariaDB que gere, e na pasta persistente da sua instância. O AnsibleForms é auto-alojado, sem nenhum serviço na nuvem por trás. |
| Envia dados a quem o faz? | Não. Não há telemetria, nem relatórios de utilização, nem verificação de atualizações. |
| A que se liga? | Só aos sistemas que um administrador configura: ver [Ligações de saída](measures.html#outbound-connections). |
| Usa IA ou envia dados a um fornecedor de modelos? | Só com o [assistente de chat](../chat/) ligado, que está desligado por predefinição. Nesse caso, envia as definições dos formulários e os valores a ser preenchidos ao fornecedor que configurar. |
| Pode funcionar sem acesso à internet? | Sim. A aplicação não precisa de acesso à internet; os playbooks precisam daquilo a que as suas tarefas acedem. |

---

## Cifragem

O que é cifrado, e com que chaves:

| Pergunta | Resposta |
|---|---|
| Os dados são cifrados em trânsito? | Com [HTTPS](../security/https.html), servido pela aplicação ou pelo seu proxy inverso, e `wss://` entre a aplicação e os seus ambientes de execução. |
| Os dados são cifrados em repouso? | Todos os segredos guardados são cifrados pela aplicação com AES-256. As tarefas e o seu resultado são guardados tal como são: use a cifragem em repouso da própria base de dados. Ver [Segredos guardados](measures.html#stored-secrets). |
| Quem tem as chaves? | O utilizador: o [`ENCRYPTION_SECRET`](../security/secrets.html) é definido por si, fica fora das cópias de segurança e pode ser rodado. |
| Os segredos podem ficar no nosso cofre? | Sim: o [HashiCorp Vault e o CyberArk](../secret-stores/) são lidos quando uma tarefa precisa deles. |

---

## Acesso e responsabilização

Quem pode iniciar sessão, o que pode fazer e o que fica registado:

| Pergunta | Resposta |
|---|---|
| Suporta início de sessão único? | Sim: LDAP / Active Directory, OpenID Connect e Entra ID. Ver [Autenticação](../authentication/). |
| Suporta autenticação multifator? | Através do início de sessão único: aplica-se o MFA do seu fornecedor de identidade. As contas locais não têm nenhum próprio. |
| Como são geridas as permissões? | Com funções associadas a grupos, verificadas pelo servidor em cada pedido. Ver [Permissões](measures.html#permissions). |
| Há um registo de auditoria? | Sim: todas as alterações e todas as tentativas recusadas, guardadas 365 dias por predefinição e reencaminháveis para syslog. Ver [Registo de auditoria](measures.html#audit-trail). |
| Há uma palavra-passe predefinida? | A primeira conta de administrador tem uma palavra-passe predefinida pública, que tem de ser alterada no primeiro início de sessão. Ver [A conta de administrador](../security/hardening.html#the-admin-account). |

---

## Vulnerabilidades e atualizações

Como os problemas são encontrados, corrigidos e anunciados:

| Pergunta | Resposta |
|---|---|
| Foram encontradas vulnerabilidades? | Sim. Todas as publicadas estão enumeradas em [Avisos de segurança](advisories.html), com a versão que as corrigiu. |
| Como reportamos uma? | Em privado, através do GitHub: ver [Reportar uma vulnerabilidade](reporting.html). |
| Como é verificado o código? | Análise estática CodeQL e revisão de dependências em cada pull request, testes automáticos e atualizações do Dependabot. Ver [Desenvolvimento seguro](development.html). |
| Que versões recebem correções de segurança? | 7.x e 6.5.x. Ver [Versões suportadas](development.html#supported-versions). |
| Como ficamos a saber de um aviso novo? | Siga os alertas de segurança do repositório no GitHub. Ver [Ser avisado dos novos avisos](advisories.html#being-told-of-new-advisories). |
| Foi alvo de testes de intrusão? | Não está publicado nenhum relatório de testes de intrusão de terceiros. O código é público, pelo que a sua própria equipa ou o seu auditor o pode avaliar, e as conclusões reportam-se como acima. |

---

## Imagens e cadeia de fornecimento

De onde vêm as imagens, e como verificá-las:

| Pergunta | Resposta |
|---|---|
| Onde são publicadas as imagens? | No GitHub Container Registry, `ghcr.io/ansibleforms/ansibleforms`, construídas por workflows públicos do GitHub Actions. Ver [Versões e imagens](development.html#releases-and-images). |
| Os contentores correm como root? | Não: como o utilizador sem privilégios `node`. |
| As imagens são assinadas? | Ainda não. Faça pull delas por digest (`@sha256:...`) para ter a certeza de que corre a imagem que reviu. |
| Há um SBOM? | Ainda não é publicado nenhum com as imagens. Um scanner como o Trivy ou o Syft constrói um a partir da imagem. |
| As imagens são analisadas à procura de vulnerabilidades? | Não no pipeline de publicação. As suas imagens base estão fixadas por digest e são mantidas atualizadas pelo Dependabot; analise as imagens no seu próprio registo para aplicar a sua própria política. |
| Sob que licença está? | GPL-3.0, open source, sem garantia. |
