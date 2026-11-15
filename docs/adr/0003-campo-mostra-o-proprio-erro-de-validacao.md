# O campo mostra o próprio erro de validação

Cada Componente de formulário desenha as mensagens de erro do `@aurelia/validation` abaixo do seu `fieldset`, sem marcação nem código extra no Sistema consumidor: basta `value.bind="x & validate"`. O protótipo com o `md-input` confirmou que isso funciona na 2.0.0-rc.2, em teste e em navegador real.

Para o `@aurelia/validation-html` continuar opcional, o pacote principal não o importa. O campo pede as mensagens por uma interface própria (`IFieldErrorSource`), e a implementação que lê o controller de validação fica numa entrada separada, `aurelia2-materialize-bridge/validation`, registrada uma vez no `main.ts` com `MaterializeBridgeValidation`. Sem esse registro o campo funciona e não mostra erros.

## Considered Options

- **Bridge não se envolve**: o Sistema consumidor escreve uma `div` com `validation-errors`, um `<p>` e um array por campo. Rejeitado por repetir marcação em todo formulário.
- **Renderer registrado por View**, como o `MaterializeFormValidationRenderer` do Bridge original: custa uma linha por View. Fica como recuo se uma versão futura do Aurelia quebrar o caminho escolhido.

## Consequences

- Um formulário com campos `type="email"` ou `required` precisa de `novalidate`, senão a validação nativa do navegador bloqueia o envio antes de as regras rodarem.
