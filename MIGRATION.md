# Migrating from aurelia-materialize-bridge

Element names, attribute names, bindables and events are kept wherever MaterializeCSS 2 and Material Design 3 allow it. This page lists what is different. It grows with each component.

## Setup

| Before (Aurelia 1) | Now (Aurelia 2) |
|---|---|
| `aurelia.use.plugin("aurelia-materialize-bridge", b => b.useAll())` | `Aurelia.register(MaterializeBridge)` |
| `controller.addRenderer(new MaterializeFormValidationRenderer())` in every view model | `Aurelia.register(MaterializeBridgeValidation)` once, from `aurelia2-materialize-bridge/validation` |
| the bridge's CSS came with the plugin | `import "aurelia2-materialize-bridge/style.css"` once, after the Materialize CSS |

| `b.useAll()` with global options on the config builder | `MaterializeBridge.customize(options => { options.datepicker.format = "dd/mm/yyyy"; })` |

Requires `aurelia` 2.0.0-rc.2 and `@materializecss/materialize` 2.3.x. MaterializeCSS 1 and 2.4 are not supported.

## All form fields

- **The markup is Material Design 3.** Text fields and selects render `fieldset.form-field` with a `legend` (the outlined field), not `div.input-field` with a floating `label`. Your own CSS that targets `.input-field` inside these components no longer matches.
- **Validation messages** are a `p.error-text` under the field, not a `span.helper-text` inside it. A field with a validation error gets the Material Design 3 error state (outline and label in the error colour) through the class `invalid` on the component's element, not on the input. There is no `valid` class and no green state: Material Design 3 has no success state.
- **Add `novalidate` to forms validated by `@aurelia/validation`.** Otherwise the browser's own validation of `type="email"`, `required` and similar blocks the submit before your rules run.
- **Colours of the old palette** (`red darken-2`, `teal-text`) do not exist in MaterializeCSS 2. Use the Material Design 3 colour roles (`primary`, `error-text`, ...).

## md-input

| Bindable | Change |
|---|---|
| `label` | no longer two-way |
| `validate`, `validate-error`, `validate-success` | removed: they drove the `.input-field` helper text, which the outlined field does not have. Use `@aurelia/validation` |
| `update-trigger` | kept. It also accepts the events as text: `update-trigger="blur"`. At most three events, as in the original |
| `maxlength` | no default (was 524288, the browser's own limit) |
| `text-area` | renders a plain `textarea` with four rows that the user can resize; it does not grow by itself |

## md-autocomplete

- Still an attribute on an `<md-input>` or on an `<input>`: `<md-input label="Fruit" value.bind="fruit" md-autocomplete="values.bind: fruits">`.
- **`values` is a list now**, as in Materialize 2: `[{ id: 1, text: "Apple", image: "apple.png" }]`, where it was `{ "Apple": "apple.png", "Banana": null }`. The old object is still accepted, with a warning on the console; each text becomes its own `id`.
- **`limit` is removed.** Materialize 2 has no such option, and the bridge does not cut the list it is given. Give fewer entries, or use `search` and let the function decide how many to return.
- `search` is new: a function that finds the entries for the typed text, for a search on a server.
- `md-on-autocomplete` is kept, and still means that the user chose an entry. `$event.detail.text` is kept; `$event.detail.entry` is new and has the `id`.
- `md-on-deselect` is new: the user edited the field after choosing, and the text is no longer the one of the entry.

## md-select

- Still an attribute on a native `<select>`: `<select md-select="label: State" value.bind="state">`.
- The wrapper around the select is `div.md-select > fieldset.form-field`.
- `enable-option-observer` is removed: changes to the options and to the value are always noticed.

## md-checkbox

- `filled-in` is removed: MaterializeCSS 2 has a single checkbox style.

## md-radio

- Does not show validation messages: put the message once, beside the group.

## md-switch

No changes.

## md-file

- **`files` is a bindable now**, a list of `File` bound both ways, where the original kept a `FileList` inside the component. Set it to `[]` or `null` to clear the choice.
- **`label-value` is removed.** The box always shows the names of the chosen files.
- `label` is new: the label on the outline of the box. `accept` is new.
- The box is an outlined field, `fieldset.form-field`, like the other fields. The button is `btn tonal`, where it was `btn accent`.
- `md-on-change` is kept, with `$event.detail.files`, and is now fired on the `md-file` element. The bridge's own `change` event is gone: the browser's `change` of the inside input still reaches the element, without `detail`.
- `readonly` now keeps any other file from being chosen. It did nothing before, because a file input has no read-only state.
- Shows its validation messages, like the other fields.

## md-datepicker and md-timepicker

- Options not given on the component come from `MaterializeBridge.customize()` (`options.datepicker`, `options.timepicker`), then from Materialize. The display is `modal` unless you set `displayPlugin`.
- Events: `md-on-select` is kept. `md-on-open` and `md-on-close` are removed (Materialize 2 has no callbacks for them); `md-on-draw` is kept on the datepicker.
- `open()` is kept; `close()` is removed (Materialize 2 deprecated both and offers no way to close from code).
- `auto-close` is no longer false by default: when it is not given, the picker closes on choosing (Materialize 2's default). `auto-close.bind="false"` shows the Ok and Cancel buttons, `show-clear-btn` the Clear button.

## Getting a component from the template

In Aurelia 2 the reference to an attribute's class is `<name>.ref`, and to an element's class `component.ref`:

| Before | Now |
|---|---|
| `<div md-modal view-model.ref="modal">` | `<div md-modal md-modal.ref="modal">` |
| `<md-sidenav view-model.ref="menu">` | `<md-sidenav component.ref="menu">` |

## md-modal

- Materialize 2 has no script for modals. The modal is the browser's own popover with Materialize's look; `open()`, `close()` and the four `md-on-*` events are kept.
- `dismissible="false"` means the modal closes only from code (no Esc, no click outside).
- `opacity`, `in-duration`, `out-duration`, `starting-top`, `ending-top`, `prevent-scrolling` and `fixed-footer` are removed: nothing in Materialize 2 uses them.

## md-dropdown

- Both the attribute and the `<md-dropdown>` element are kept.
- In the element, the items go in a `ul.dropdown-content` (it was a `div`): put `<li>` elements directly inside `<md-dropdown>`. The element itself is still the button, so your classes on it (`tonal`, `filled`) style the button.
- `auto-trigger` and `md-title` are removed: Materialize 2 has no such options.

## md-sidenav

- The items go in a `ul.sidenav` (it was a `div.sidenav`): put `<li>` elements directly inside `<md-sidenav>`.
- `md-sidenav-collapse="ref.bind: menu"` is kept.

## md-tabs

- Works in a screen reached through `@aurelia/router` with no change to the links: the bridge marks them `external` and makes the router leave them as written.
- `select(id)` announces `md-on-selected` once, through the click Materialize makes on the tab.

## md-collapsible

No changes.

## md-tooltip

- `html` is shown as plain text: Materialize 2 tooltips do not render HTML.

## MdToastService

- `show(text, …)`: the text is plain text, not HTML. The other parameters and `removeAll()` are kept.

## Content given to a component's named places

Aurelia 2 uses `au-slot` where Aurelia 1 used `slot`:

| Before | Now |
|---|---|
| `<div slot="action">` inside `<md-card>` | `<div au-slot="action">` |
| `<div slot="reveal-text">` inside `<md-card>` | `<div au-slot="reveal-text">` |
| `<ul slot="content">` inside `<md-navbar>` | `<ul au-slot="content">` |

## md-button

- The Material Design 3 variants are classes you add yourself: `filled`, `tonal`, `outlined`, `elevated`. A button without one of them is Materialize's plain grey button.
- `flat` adds `btn-flat` and keeps `btn` (Materialize 2 uses both).
- `disabled` also disables a real `<button>`, not only its look.
- The ripple is always on (`waves-effect`); the global `autoButtonWaves` option is gone. `waves-light` and `waves-secondary` are no longer added: Materialize 2 does not have them.

## md-card

- The picture on the card no longer has a ripple.
- The picture gets the title as its `alt` text.

## md-navbar

- `extended` is removed: Materialize 2 has no `nav-extended`.

## md-progress

- `color` is `blue` when not given (it had no default, which gave a spinner without colour).
- `value="0"` is an empty bar. In the original, zero gave the endless bar.
- `value` and `pixel-size` are no longer two-way.

## md-pagination

- The window of page numbers always includes the last pages. In the original, with an odd `visible-page-links` the last page could not be reached by its number.
- A single "…" is shown at each end when there are more pages, and it is not clickable.
- `page-links` is no longer a bindable: it is worked out from the other values.
