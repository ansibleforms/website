---
layout: default
title: Designer e push
parent: Repositórios git
nav_order: 4
translated_from: 9f1f2463b8bc0fb3c8b5b934435c305fef1f7f20
---

# Designer e push
{: .no_toc }

Editar formulários no designer e enviá-los (push) para o repositório
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Editar e enviar a partir do designer

Com um repositório usado para formulários, o designer edita os ficheiros da sua cópia de trabalho e envia-os de volta para o remoto.

| Botão | O que faz |
|---|---|
| **Guardar (local)** | Escreve os formulários e o `config.yaml` nas cópias de trabalho, sem fazer commit |
| **Guardar (repositório)** | Faz commit e push das alterações guardadas; ativo quando há alterações por enviar |
| **Carregar (repositório)** | Faz pull dos repositórios de formulários e recarrega o designer, depois de uma confirmação se houver edições por guardar |

Os formulários ficam no seu repositório; os novos esperam, já utilizáveis, em [`FORMS_STAGING_PATH`](../customization/paths.html#env_FORMS_STAGING_PATH) até fazer push.
Um formulário guardado numa subpasta mantém o seu caminho relativo: `team/deploy.yaml` é enviado para `team/deploy.yaml` dentro da pasta de formulários
do repositório. Um formulário novo cujo caminho já existe lá não é substituído; fica na preparação, por isso mude-lhe o nome.
Com vários repositórios de formulários, **Guardar (repositório)** e **Carregar (repositório)** perguntam qual, sendo predefinido o do `config.yaml`.

Um push prepara todas as alterações, faz commit delas como `AnsibleForms` com a mensagem `Forms sync by <user>`, e depois faz fetch, rebase sobre
o remoto e push, tentando até cinco vezes. Um conflito de rebase é abortado e os ficheiros em conflito são listados;
corrija-os no remoto, ou use **Repor** na página Repositórios. **Push** na página Repositórios faz o mesmo.

Quando um único repositório de formulários é clonado vazio, o AnsibleForms copia o `config.yaml` local e os formulários para a sua cópia
de trabalho, para que um push (**Guardar (repositório)**, ou **Push** na página Repositórios) os publique. Há mais sobre o designer em [Designer e git](../gui/designer-and-git.html).
