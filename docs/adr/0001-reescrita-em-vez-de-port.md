# Reescrita do zero em vez de port do código original

O Bridge 2 é escrito do zero em Aurelia 2; o código do Bridge original serve apenas como especificação de comportamento, e a página de workarounds da issue #579 como lista de armadilhas do MaterializeCSS 2. Traduzir o código linha a linha arrastaria `aurelia-typed-observable-plugin`, polyfills e padrões do Aurelia 1 sem equivalente no Aurelia 2, e os workarounds da issue foram feitos sobre o Aurelia 1.

A API pública (nomes dos elementos e atributos `md-*`, bindables e eventos) é mantida para que a migração de um Sistema consumidor seja quase só trocar o pacote. A marcação gerada não é mantida: os campos de formulário passam a gerar `fieldset.form-field` (Material Design 3) em vez de `.input-field`, e as cores da paleta antiga não são emuladas.

## Considered Options

- **Port linha a linha do Bridge original**: rejeitado pelos motivos acima.
- **API redesenhada livremente**: rejeitado porque obrigaria a reescrever cada template dos sistemas que migram do Aurelia 1.
