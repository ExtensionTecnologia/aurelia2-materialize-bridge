# O Componente responde pelo estado que guarda, mas não altera os dados que recebe

A regra geral do projeto é entregar o comportamento do MaterializeCSS como ele é (ADR 0004). O `md-autocomplete` trouxe dois casos em que o Bridge original fazia mais do que o MaterializeCSS 2.3.3 faz, e eles foram decididos em sentidos opostos pelo mesmo critério:

- **Estado que o Componente guarda é responsabilidade dele.** Se o Componente sabe de algo que o Sistema consumidor precisa para não ficar com dado errado, ele avisa, mesmo que o MaterializeCSS não avise.
- **Dados que o Componente recebe não são alterados por ele.** Cortar, ordenar ou completar o que o Sistema consumidor entregou é decisão do Sistema consumidor.

## Os dois casos

**`md-on-deselect` existe.** O MaterializeCSS 2.3.3 só considera a escolha desfeita quando o campo fica vazio: o usuário escolhe "Apricot", digita "apricots", e o widget continua dizendo que Apricot está escolhida. Um Sistema consumidor que guarda o `id` da entrada gravaria o `id` errado. O Bridge 2 guarda qual entrada foi escolhida e dispara `md-on-deselect` uma vez, quando o usuário edita o campo e o texto deixa de ser o da entrada. O `md-on-autocomplete` continua significando só "o usuário escolheu", como no Bridge original.

**`limit` foi removido.** O MaterializeCSS 2 não tem mais a opção, e refazê-la seria o Componente cortar a lista que recebeu. Quem tem muitos registros usa o bindable `search` e decide no servidor quantos devolver.

## Considered Options

- **Só o que o MaterializeCSS avisa** (evento também ao esvaziar o campo, com entrada nula): rejeitado por ficar pela metade; a edição do texto, que é o caso que grava dado errado, não geraria aviso.
- **Aviso de escolha desfeita no próprio `md-on-autocomplete`**, com entrada nula: rejeitado porque um template migrado do Bridge original, que lê `detail.text` como o texto escolhido, passaria a receber o texto digitado sem erro nenhum.
- **Refazer o `limit` com uma busca própria**: rejeitado pelo segundo critério acima.

## Consequences

- A escolha é sobre o texto que o usuário vê no campo. Ela não é desfeita quando `values` muda e a entrada some da lista, nem é refeita quando o usuário digita de volta o texto de uma entrada: só clique ou Enter na lista escolhem.
- Quando o próprio Sistema consumidor troca o valor vinculado por código, o Bridge 2 esquece a escolha sem disparar evento: os eventos contam o que o usuário fez.
- Este critério vale para os próximos Componentes adiados. Antes de acrescentar comportamento que o MaterializeCSS não tem, pergunte de qual dos dois lados ele cai.
