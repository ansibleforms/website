---
layout: default
title: Carregamento de ficheiros
parent: Validação no lançamento
nav_order: 4
translated_from: 5756d90b62ddac51996f0bdb05befd6bf5589e0d
---

# Carregamento de ficheiros
{: .no_toc }

Como são validados os campos de ficheiro
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Um campo de ficheiro nunca confia no que o pedido de lançamento diz sobre um ficheiro. A validação no lançamento verifica o próprio ficheiro, no
disco do servidor.

---

## Como um ficheiro carregado chega a uma tarefa

Um ficheiro é carregado antes de o formulário ser lançado, em dois passos:

1. O navegador carrega o ficheiro com `POST /api/v2/job/upload`. O servidor guarda-o em `UPLOAD_PATH`.
2. O pedido de lançamento descreve esse carregamento na sua parte `files`.

A validação no lançamento compara depois a descrição com o disco:

* O ficheiro tem de existir dentro de `UPLOAD_PATH`.
* O seu caminho e o seu tamanho são lidos do disco, nunca do pedido.

---

## O que é aceite

Um campo de ficheiro só recebe um valor de um carregamento verificado. Tudo o resto é descartado:

* Um caminho que quem chama escreva em `rawFormData` ou `extravars` é ignorado.
* Um campo de ficheiro obrigatório sem um carregamento real é reportado como `missing`.

---

## Regras dos ficheiros

As regras de um campo de ficheiro são verificadas sobre o ficheiro realmente carregado, com os tamanhos em bytes:

```yaml
- name: firmware
  type: file
  required: true
  maxSize: 104857600        # 100 MB
  regex:
    expression: '\.bin$'
    description: Upload a .bin firmware image
```

`minSize` e `maxSize` comparam o tamanho real do ficheiro, e `regex` o seu nome. Independentemente de qualquer formulário,
`UPLOAD_MAX_GB` limita o tamanho de um único carregamento (10 GB por predefinição).
