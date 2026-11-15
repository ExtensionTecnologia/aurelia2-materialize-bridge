# MaterializeCSS fixado em 2.3.3 e Aurelia em 2.0.0-rc.2

As peerDependencies são `@materializecss/materialize` `>=2.3.3 <2.4.0` e `aurelia` `2.0.0-rc.2` exato, as versões fixadas nas skills `materializecss` e `aurelia2`. A 2.4.0 do MaterializeCSS foi testada e rejeitada: quebra dropdown, select, pickers, FAB e tamanhos de botão, e remove quatro plugins. O Aurelia 2 ainda não tem versão estável, e uma rc pode mudar a API entre releases.

## Consequences

- Não há compatibilidade com o MaterializeCSS 1 nem com o Aurelia 1.
- Subir qualquer uma das versões exige antes rodar o procedimento de atualização da skill correspondente (`references/updating.md`), que testa a versão candidata em navegador real.
