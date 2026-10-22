---
layout: default
title: Predefinições
parent: Aparência
nav_order: 1
translated_from: 2974af3a3fc29115349fad94498cac9ecd8c6123
---

# Predefinições
{: .no_toc }

O tema, o idioma, o fuso horário e o formato de data para os utilizadores que não escolheram nenhum
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## As predefinições

**Predefinições** define o aspeto da aplicação para um utilizador que não fez uma escolha própria nas suas
[preferências](../profile/preferences.html); a escolha do próprio utilizador prevalece sempre:

| Campo | Opções | Sem escolha |
|---|---|---|
| **Tema predefinido** | Seguir o navegador, Claro, Escuro ou Cor, com uma de 12 cores para Cor | Seguir o navegador (Claro até à 7.2) |
| **Idioma predefinido** | Os idiomas da aplicação, guardado em [`DEFAULT_LANGUAGE`](../customization/server.html#env_DEFAULT_LANGUAGE) | Inglês |
| **Vista de formulários predefinida** | Mosaicos ou Lista, para a página de formulários | Mosaicos |
| **Fuso horário predefinido** | UTC, o navegador de cada utilizador, ou qualquer fuso pelo nome | UTC |
| **Formato de data predefinido** | `YYYY-MM-DD`, `DD/MM/YYYY`, `MM/DD/YYYY` ou `DD.MM.YYYY`, mostrado com a data de hoje | `YYYY-MM-DD` |

O idioma é uma variável de ambiente e aplica-se sem reiniciar. Com
[`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT) a `0`, a página mostra-o só de leitura.

A partir da 7.3.0, a página está organizada nos dois separadores das preferências do perfil, **Aparência** (tema, idioma e vista de formulários) e **Data e
hora** (fuso horário e formato de data, com uma pré-visualização da hora atual), e a sua caixa de pesquisa lista as correspondências sob o nome de cada separador.

---

## Seguir o navegador

A partir da 7.3.0, **Seguir o navegador** mostra a cada utilizador o tema claro ou escuro que o seu navegador pede, e muda com ele.

É a predefinição quando não se escolhe nenhum tema predefinido, por isso uma instalação nova segue o navegador. Passar o ponteiro por uma das cores de
**Cor** pré-visualiza a aplicação nessa cor; o tema que tinha volta quando o ponteiro sai, e nada é guardado até clicar em **Guardar**.
