# Aurelia Materialize Bridge 2

Biblioteca de componentes `md-*` que une o Aurelia 2 ao MaterializeCSS 2, sucessora do aurelia-materialize-bridge.

## Language

**Bridge original**:
O pacote `aurelia-materialize-bridge` para Aurelia 1 e MaterializeCSS 1, usado como especificação de comportamento.
_Avoid_: bridge v1, AMB, bridge antigo

**Bridge 2**:
Este projeto: a biblioteca de componentes `md-*` para Aurelia 2 e MaterializeCSS 2.
_Avoid_: bridge novo, port

**Componente**:
Um elemento ou atributo `md-*` oferecido pelo Bridge 2.
_Avoid_: widget, controle, View

**Invólucro**:
Um Componente que só aplica marcação e classes do MaterializeCSS, sem iniciar nenhum script dele.
_Avoid_: wrapper, componente fino

**Conjunto inicial**:
Os Componentes que compõem a primeira versão publicada do Bridge 2.
_Avoid_: núcleo, core, MVP

**Componente adiado**:
Um componente do Bridge original que fica fora do Conjunto inicial e entra conforme a demanda.
_Avoid_: componente futuro, backlog

**Sistema consumidor**:
Uma aplicação Aurelia 2 que instala e usa o Bridge 2.
_Avoid_: cliente, app

## Termos de outros contextos

**Core** e **View** pertencem aos Sistemas consumidores, não a este repositório; não use esses termos para partes do Bridge 2.
