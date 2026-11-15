# Contornos no Bridge 2 para defeitos dos pickers do MaterializeCSS 2.3.3

A regra geral do projeto é entregar o comportamento do MaterializeCSS como ele é e documentar as limitações, sem CSS nem script próprio para consertá-las. O `md-datepicker` e o `md-timepicker` são a exceção: na 2.3.3 os pickers têm defeitos que os deixam inutilizáveis ou dão dado errado, então o Bridge 2 os contorna.

## Contornos em vigor

| Defeito do MaterializeCSS 2.3.3 | Contorno | Onde |
|---|---|---|
| A caixa modal abre no fim da página, não no centro da tela, e no celular corta a última coluna do calendário | CSS que a fixa no centro, com a largura do conteúdo | `src/common/picker-modal.css` |
| No modo modal o datepicker perde os botões Ok, Cancelar e Limpar | Os botões são recriados no rodapé da caixa, chamando os métodos do próprio MaterializeCSS | `addModalButtons` em `md-datepicker.ts` |
| Ao abrir, o datepicker relê a data do campo no formato americano e a anuncia como selecionada | O anúncio é segurado durante a abertura e a data vinculada é reposta | `onOpening` / `onOpened` em `md-datepicker.ts` |
| As caixas de hora e minuto do timepicker não têm largura e saem da caixa | CSS que dá a largura do invólucro | `md-timepicker.css` |
| O timepicker só lê a hora do campo ao ser criado | O widget é recriado quando a hora muda por código | `createWidget` em `md-timepicker.ts` |
| `destroy()` deixa a caixa do picker na página | A caixa é removida junto com o Componente | `detaching` / `destroyWidget` |

## Consequences

- Cada contorno depende de detalhes internos da 2.3.3 (nomes de classes, métodos com `_`). Ao subir a versão do MaterializeCSS, confira um a um se o defeito ainda existe e remova o contorno que não for mais necessário.
- O modo `docked` não tem contorno: dentro do `fieldset.form-field` a caixa é posicionada no lugar errado. O padrão do Bridge 2 é `modal`.
- Fica sem contorno, por ser do próprio MaterializeCSS e não impedir o uso: não é possível digitar a hora 00 nem um zero à esquerda no timepicker.
