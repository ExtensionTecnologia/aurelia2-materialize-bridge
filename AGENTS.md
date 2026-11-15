# Aurelia Materialize Bridge 2
Este projeto visa portar o aurelia-materialize-bridge original para o Aurelia 2 e MaterializeCSS 2, suportando as diretivas do Material Design 3.

## Como trabalhar
- Vocabulário do projeto: `GLOSSARY.md`. Decisões: `docs/adr/`.
- Versões fixadas: Aurelia 2.0.0-rc.2 e MaterializeCSS 2.3.3. Tire sintaxe e marcação das skills `aurelia2` e `materializecss`, não da memória nem dos sites de documentação.
- Código, comentários e documentação pública em inglês; este arquivo, o glossário e os ADRs em português.
- Cada Componente fica em `src/<nome>/md-<nome>.ts`, `.html` e `.spec.ts` (mais `.css` só quando o MaterializeCSS não cobre), e é registrado em `src/index.ts`.
- Toda diferença em relação ao Bridge original entra no `MIGRATION.md`.
- Comandos: `npm run typecheck`, `npm test`, `npm run build`, `npm start` (app de demonstração em `demo/`, porta 9000).
- Antes de dar um Componente por pronto, veja-o no app de demonstração num navegador real e confira o console.

## Referências
Github do aurelia-materialize-bridge original: https://github.com/aurelia-ui-toolkits/aurelia-materialize-bridge

Issue específica que comenta sobre como adaptar para as versões mais novas: https://github.com/aurelia-ui-toolkits/aurelia-materialize-bridge/issues/579

Página que demonstra como aplicar workarrounds para que funcionem com MaterializeCSS 2: https://request.land/help/en/org/note/tiaiUfNgDs9z6GbCTSeWohqmLi3a
