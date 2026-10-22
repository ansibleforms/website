---
layout: default
title: Edição e auditoria
parent: Config seed
nav_order: 5
translated_from: 84af9202344ae1fc62b7b882fdc12f1799dd1bd3
---

# Edição e auditoria
{: .no_toc }

Bloquear as páginas de definições, e o que o registo de auditoria regista
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Desligar a edição do ambiente

`ALLOW_ENV_EDIT=0` torna as páginas de definições só de leitura. Todas as variáveis continuam a ser mostradas com
o valor em vigor e o motivo por que não podem ser alteradas, e o endpoint de gravação responde com
403.

Use-o sempre que o ambiente estiver declarado noutro sítio. Caso contrário, a página de definições escreve
`persistent/.env`, que num volume efémero se perde silenciosamente no reinício seguinte, e num
volume duradouro se afasta do manifesto que deveria ser a referência.

{: .note }
> As cópias de segurança incluem `persistent/.env` como `managed.env`, para que uma reconstrução recupere as definições da base de dados e
> dos caminhos. **`ENCRYPTION_SECRET` e `ACCESS_TOKEN_SECRET` são retiradas**:
> o dump ao lado contém todas as credenciais guardadas como texto cifrado AES, e escrever a chave que
> o decifra na mesma pasta faria com que bastasse uma cópia da cópia de segurança para as ler todas. Defina
> essas duas no host de destino; um comentário no ficheiro indica-o.
>
> O que resta pode ainda conter credenciais (`DB_PASSWORD`, `METRICS_TOKEN`, um `VAULT_TOKEN` antigo), por isso o ficheiro é
> escrito com `0600`. Restaurá-lo é um passo opcional à parte e não faz parte de um restauro normal,
> porque o host da base de dados e os caminhos que contém descrevem a máquina de onde veio a cópia de segurança. A
> caixa de diálogo de restauro lista o ficheiro e oferece o seu próprio botão *Restaurar ambiente*
> (`POST /api/v2/backup/:folder/restore-env`), que guarda o ficheiro anterior como `.env.bak`.

---

## O que fica registado

Cada aplicação que altera alguma coisa escreve uma entrada `seed.apply` no registo de auditoria, que nomeia
os objetos criados, atualizados, libertados e purgados. Os valores nunca são registados, porque a maioria
deles são segredos. Uma aplicação sem efeito não escreve nada, o que mantém o registo significativo. Uma
verificação periódica que encontra o ficheiro inalterado não tem efeito, por isso o registo não ganha uma linha a cada minuto.

Uma aplicação pedida através do endpoint é registada duas vezes de propósito, e as duas linhas
registam coisas diferentes: `config-seed.apply.create` é **quem** a pediu, `seed.apply` é
**o que** alterou.

A página Estado mostra o seed duas vezes: uma **verificação** de que o ficheiro continua legível e válido,
e de que o último recarregamento teve sucesso, e uma linha de **informação** que diz quantos registos
possui atualmente. A verificação é o único sítio que indica quando o ficheiro em disco e a configuração
em vigor divergiram, porque um recarregamento falhado deixa a instância a correr.
