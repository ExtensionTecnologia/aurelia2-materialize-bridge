# aurelia2-materialize-bridge

[MaterializeCSS 2](https://materializeweb.com) components for [Aurelia 2](https://aurelia.io), with the look of Material Design 3.

You write `<md-input label="Name" value.bind="customer.name">` in a template and get a Materialize field that is bound to your data, shows its own validation message and cleans up after itself when the screen goes away.

This is the successor of [aurelia-materialize-bridge](https://github.com/aurelia-ui-toolkits/aurelia-materialize-bridge), which was made for Aurelia 1 and MaterializeCSS 1. The names of the components and of their options were kept wherever possible. If you are coming from it, read [MIGRATION.md](MIGRATION.md).

## Status

Version 0.1.0. It is **not on npm yet**.

It works with exactly these versions, and nothing else has been tried:

| Package | Version |
|---|---|
| `aurelia` | 2.0.0-rc.2 |
| `@materializecss/materialize` | 2.3.x (2.3.3 was used for all testing) |

MaterializeCSS 2.4 is not supported: it changes the markup of several components. MaterializeCSS 1 and Aurelia 1 are not supported either.

## Contents

- [Install](#install)
- [Set up](#set-up)
- [A first form](#a-first-form)
- [How the components are written](#how-the-components-are-written)
- [Validation](#validation)
- [Form fields](#form-fields)
- [Components with behaviour](#components-with-behaviour)
- [Components that are only looks](#components-that-are-only-looks)
- [Defaults for the whole application](#defaults-for-the-whole-application)
- [Things to know](#things-to-know)
- [Working on the bridge](#working-on-the-bridge)

## Install

```
npm install aurelia2-materialize-bridge @materializecss/materialize@2.3.3
```

Your project already has `aurelia`. If you use validation, it also has `@aurelia/validation` and `@aurelia/validation-html`; the bridge does not need them otherwise.

## Set up

Three things, once per application.

**1. Register the bridge and load the two style sheets**, in `main.ts`:

```ts
import Aurelia from "aurelia";
import { MaterializeBridge } from "aurelia2-materialize-bridge";
import "@materializecss/materialize/dist/css/materialize.min.css";
import "aurelia2-materialize-bridge/style.css";
import { MyApp } from "./my-app";

Aurelia
  .register(MaterializeBridge)
  .app(MyApp)
  .start();
```

The bridge's own style sheet is small. It must come after Materialize's.

**2. Load the icon font**, in `index.html`. The pagination and the cards use it, and you will want it for your own icons:

```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
```

**3. Nothing else.** Every component is now available in every template, with no `<import>`.

## A first form

```html
<form class="row" novalidate submit.trigger:prevent="save()">
  <md-input class="s12 m6" label="Name" value.bind="customer.name"></md-input>
  <md-input class="s12 m6" label="E-mail" type="email" value.bind="customer.email"></md-input>

  <div class="s12 m6">
    <select md-select="label: State" value.bind="customer.state">
      <option value="">Choose</option>
      <option value="SP">São Paulo</option>
      <option value="RJ">Rio de Janeiro</option>
    </select>
  </div>

  <md-datepicker class="s12 m6" label="Birth date" value.bind="customer.birthDate"></md-datepicker>

  <md-checkbox class="s12" checked.bind="customer.acceptsTerms">I accept the terms</md-checkbox>

  <div class="s12">
    <button type="submit" class="filled" md-button>Save</button>
    <button type="button" md-button="flat: true" click.trigger="cancel()">Cancel</button>
  </div>
</form>
```

```ts
export class MyApp
{
  public customer = { name: "", email: "", state: "", birthDate: null as Date | null, acceptsTerms: false };

  public save(): void { /* ... */ }
  public cancel(): void { /* ... */ }
}
```

What to notice:

- `class="row"` on the form and `s12 m6` on each field is Materialize's grid: full width on a phone, two columns from a tablet up. The classes go on the component itself.
- `md-select` goes on a normal `<select>`. It builds a box around the select, so the grid classes go on a `<div>` around it.
- `filled` on the button is one of Material Design 3's button styles. See [md-button](#md-button).

## How the components are written

There are two kinds, and they are written differently.

**Elements** have their own tag, and each option is an attribute:

```html
<md-input label="Name" disabled.bind="isSaving"></md-input>
```

**Attributes** go on a tag you already have. With one option, or none, it is simple. With several, separate them with `;`, each as `name: value`:

```html
<button md-button>Save</button>
<button md-button="flat: true; disabled.bind: isSaving">Cancel</button>
```

An option that is on or off can be written with no value on an element: `<md-input disabled>` is the same as `disabled.bind="true"`.

**Events** of the components are named `md-on-…` and are listened to like any other event. What they carry is in `$event.detail`:

```html
<md-pagination pages="20" md-on-page-changed.trigger="load($event.detail)"></md-pagination>
```

**Calling a component from code** needs a reference to it. For an element use `component.ref`; for an attribute use the attribute's own name followed by `.ref`:

```html
<md-sidenav component.ref="menu">…</md-sidenav>
<div md-modal md-modal.ref="confirmation">…</div>
<button click.trigger="confirmation.open()">Delete</button>
```

```ts
import { type MdModal, type MdSidenav } from "aurelia2-materialize-bridge";

export class MyApp
{
  public menu!: MdSidenav;
  public confirmation!: MdModal;
}
```

## Validation

With `@aurelia/validation`, each field shows its own message under itself and turns its outline to the error colour. You write no markup for the messages.

Register the validation part of the bridge beside the bridge, once:

```ts
import { ValidationHtmlConfiguration } from "@aurelia/validation-html";
import { MaterializeBridge } from "aurelia2-materialize-bridge";
import { MaterializeBridgeValidation } from "aurelia2-materialize-bridge/validation";

Aurelia
  .register(MaterializeBridge, MaterializeBridgeValidation, ValidationHtmlConfiguration)
  .app(MyApp)
  .start();
```

Then add `& validate` to the binding of each field that has rules, as you would on a plain `<input>`:

```html
<form novalidate submit.trigger:prevent="save()">
  <md-input label="Name" value.bind="customer.name & validate"></md-input>
  <select md-select="label: State" value.bind="customer.state & validate">…</select>
  <md-checkbox checked.bind="customer.acceptsTerms & validate">I accept the terms</md-checkbox>
</form>
```

```ts
import { newInstanceForScope, resolve } from "aurelia";
import { IValidationController } from "@aurelia/validation-html";

export class MyApp
{
  private readonly validationController = resolve(newInstanceForScope(IValidationController));

  public async save(): Promise<void>
  {
    const result = await this.validationController.validate();
    if (!result.valid)
      return;

    // ... save
  }
}
```

Two things that are easy to miss:

- **Put `novalidate` on the form.** Without it, the browser checks `type="email"` and `required` by itself and stops the submit before your rules run, so your messages never appear.
- **A valid field has no special colour.** Material Design 3 has an error state but no success state.

Fields that show a message: `md-input`, `md-select`, `md-datepicker`, `md-timepicker`, `md-checkbox`, `md-switch`. `md-radio` does not, because the message would repeat on every radio of the group; show it once beside the group.

To hide the text and keep only the red outline, set `show-errortext.bind="false"` on the field.

## Form fields

### md-input

A text field, or a text area.

```html
<md-input label="Name" value.bind="customer.name"></md-input>
<md-input label="Age" type="number" min="0" max="120" value.bind="customer.age"></md-input>
<md-input label="Notes" text-area value.bind="customer.notes"></md-input>
```

| Option | What it does |
|---|---|
| `value` | The text. Bound both ways. |
| `label` | The label on the outline of the field. |
| `type` | `text` (the default), `email`, `password`, `number`, `tel`, … |
| `text-area` | Makes it a text area of four lines, which the user can resize. |
| `placeholder`, `name`, `autocomplete`, `min`, `max`, `step`, `maxlength` | Passed to the `<input>` as they are. |
| `disabled`, `readonly` | As on an `<input>`. |
| `inline` | The field takes only the width it needs, so it can sit in a line of text. |
| `blur-on-enter` | Pressing Enter leaves the field. |
| `update-trigger` | When what was typed is passed on to `value`. It is at every keystroke when not given; `update-trigger="blur"` waits until the user leaves the field. Up to three event names, as text (`"blur, change"`) or as a list (`update-trigger.bind="['blur']"`). |
| `show-errortext` | `false` hides the validation message. |

It announces `focus` and `blur`. From code, `focus()` puts the cursor in it.

### md-select

Turns a `<select>` into Materialize's select. Your `<option>` elements and your `value.bind` stay exactly as they would be without it.

```html
<select md-select="label: State" value.bind="customer.state">
  <option value="">Choose</option>
  <option repeat.for="state of states" value.bind="state.code">${state.name}</option>
</select>

<select multiple md-select="label: Languages" value.bind="customer.languages">…</select>
```

| Option | What it does |
|---|---|
| `label` | The label on the outline. |
| `disabled` | Disables the select. |
| `readonly` | Shows the choice but does not open. |
| `show-errortext` | `false` hides the validation message. |
| `dropdown-options` | An object with Materialize's own options for the list that opens. |

Options added later, and a value changed from code, are noticed by themselves. From code, `open()` opens the list.

A `<select class="browser-default">` is left as the browser's own select.

### md-checkbox

```html
<md-checkbox checked.bind="customer.acceptsTerms">I accept the terms</md-checkbox>
```

Several checkboxes can share one array. Each adds and removes its own `model`:

```html
<md-checkbox repeat.for="colour of colours" model.bind="colour" checked.bind="chosenColours">${colour.name}</md-checkbox>
```

| Option | What it does |
|---|---|
| `checked` | `true` or `false`; or an array, as above. `null` shows the "partly checked" dash. Bound both ways. |
| `model` | What this checkbox adds to the array. |
| `matcher` | A function `(a, b) => boolean` that says when two models are the same. Needed when the objects in the array are copies. |
| `disabled`, `readonly` | A read-only checkbox looks normal but does not change. |

### md-radio

One of several choices. Radios with the same `name` and the same `checked` are a group.

```html
<md-radio name="plan" value="monthly" checked.bind="customer.plan">Monthly</md-radio>
<md-radio name="plan" value="yearly" checked.bind="customer.plan">Yearly</md-radio>
```

| Option | What it does |
|---|---|
| `checked` | The value of the radio chosen in the group. Bound both ways. |
| `value` | The value of this radio, a text. |
| `model` | Use it instead of `value` when the choice is not a text: `model.bind="12"`. |
| `name` | The name of the group. |
| `gap` | Draws the dot with a ring around it. |
| `disabled`, `readonly` | |

### md-switch

An on/off setting.

```html
<md-switch label-off="" label-on="Receive e-mails" checked.bind="customer.receivesEmails"></md-switch>
```

| Option | What it does |
|---|---|
| `checked` | `true` or `false`. Bound both ways. |
| `label-off`, `label-on` | The texts before and after the switch. They are "Off" and "On" when not given. |
| `disabled`, `readonly` | |

### md-datepicker

A field that opens a calendar. The value is a `Date`, or `null` when empty.

```html
<md-datepicker label="Birth date" value.bind="customer.birthDate"></md-datepicker>

<md-datepicker label="Delivery" auto-close.bind="false" show-clear-btn
               min-date.bind="today" disable-weekends value.bind="order.delivery"></md-datepicker>
```

| Option | What it does |
|---|---|
| `value` | The date. Bound both ways. |
| `label`, `placeholder`, `disabled`, `inline`, `show-errortext` | As in `md-input`. |
| `format` | How the date is written in the field, for example `dd/mm/yyyy`. Materialize's default is `mmm dd, yyyy`. |
| `auto-close` | When not given, choosing a day closes the calendar. `auto-close.bind="false"` gives it Ok and Cancel buttons instead. |
| `show-clear-btn` | Adds a Clear button, the only way for the user to empty the field. |
| `min-date`, `max-date` | The first and last day that can be chosen. |
| `disable-weekends`, `disable-day-fn` | Days that cannot be chosen. |
| `first-day` | The first day of the week: `0` is Sunday, `1` is Monday. |
| `i18n` | The names of months and days and the texts of the buttons. |

These other options of Materialize's datepicker are also accepted, with the same meaning: `parse`, `default-date`, `set-default-date`, `year-range`, `is-rtl`, `show-month-after-year`, `show-days-in-next-and-previous-months`, `container`, `events`.

The options are read once, when the field appears. It announces `change` when the user picks a date, and `md-on-select` (the day is in `$event.detail.selectedDate`) for each day clicked. From code, `open()` opens the calendar.

You will usually want the same format and the same language everywhere: see [Defaults for the whole application](#defaults-for-the-whole-application).

### md-timepicker

A field that opens a clock. The value is a text, as the picker writes it: `"14:30"`, or `"02:30 PM"` with the twelve-hour clock.

```html
<md-timepicker label="Meeting" twelve-hour.bind="false" value.bind="meeting.start"></md-timepicker>
```

| Option | What it does |
|---|---|
| `value` | The time. Bound both ways. |
| `label`, `placeholder`, `disabled`, `inline`, `show-errortext` | As in `md-input`. |
| `twelve-hour` | `false` for the 24-hour clock. Materialize's default is the twelve-hour clock. |
| `auto-close` | When not given, choosing the minutes closes the clock. `auto-close.bind="false"` gives it Ok and Cancel buttons. |
| `show-clear-btn` | Adds a Clear button. |
| `default-time` | The time shown when the field is empty: `now` or a time like `13:14`. |
| `i18n` | The texts of the buttons. |

Also accepted, as in Materialize: `duration`, `container`, `from-now`, `vibrate`.

It announces `change`, and `md-on-select` (`$event.detail.hour` and `.minute`). From code, `open()` opens the clock.

## Components with behaviour

### md-modal

A box over the page, opened and closed from your code.

```html
<button click.trigger="confirmation.open()">Delete</button>

<div md-modal md-modal.ref="confirmation">
  <div class="modal-header"><h4>Delete the record?</h4></div>
  <div class="modal-content"><p>This cannot be undone.</p></div>
  <div class="modal-footer">
    <button md-button="flat: true" click.trigger="confirmation.close()">Cancel</button>
    <button md-button="flat: true" class="modal-action default" click.trigger="deleteRecord()">Delete</button>
  </div>
</div>
```

| Option | What it does |
|---|---|
| `dismissible` | `true` (the default): Esc or a click outside closes it. `false`: only your code closes it. |
| `bottom-sheet` | The box slides up from the bottom of the screen. |

From code: `open()`, `close()` and `isOpen`. It announces `md-on-open-start`, `md-on-open-end`, `md-on-close-start` and `md-on-close-end`.

The button with the classes `modal-action default` is the one pressed when the user hits Enter.

### md-dropdown

Makes an element open a menu. The menu is a list anywhere in the same template, pointed to by its `id`.

```html
<a class="btn tonal" md-dropdown="activates: account-menu">Account</a>

<ul id="account-menu">
  <li><a click.trigger="openProfile()">Profile</a></li>
  <li class="divider" tabindex="-1"></li>
  <li><a click.trigger="signOut()">Sign out</a></li>
</ul>
```

| Option | What it does |
|---|---|
| `activates` | The `id` of the list. |
| `ref` | The list itself, instead of its `id`: `ref.bind: menuList`. |
| `cover-trigger` | `false` opens the menu under the element instead of over it. |
| `alignment` | `left` or `right`. |
| `hover` | Opens when the pointer is over the element. |
| `close-on-click` | `false` keeps the menu open after a choice. |
| `constrain-width` | `false` lets the menu be wider than the element. |
| `container`, `in-duration`, `out-duration` | As in Materialize. |

From code: `open()`, `close()`, `recalculateDimensions()`. It announces `md-on-open-start`, `md-on-open-end`, `md-on-close-start`, `md-on-close-end`.

### md-sidenav

The menu that slides in from the side. `md-sidenav-collapse` goes on whatever opens and closes it.

```html
<a md-sidenav-collapse="ref.bind: menu" aria-label="Open menu"><i class="material-icons">menu</i></a>

<md-sidenav component.ref="menu">
  <li><a class="subheader">Records</a></li>
  <li><a class="sidenav-close" load="customers">Customers</a></li>
  <li><a class="sidenav-close" load="suppliers">Suppliers</a></li>
</md-sidenav>
```

The class `sidenav-close` on a link makes the menu close when the link is clicked.

| Option | What it does |
|---|---|
| `edge` | `left` (the default) or `right`. |
| `fixed` | The menu is always visible on large screens. Your content then needs its own left margin. |
| `draggable` | `false` stops the menu from being dragged open on a touch screen. |
| `in-duration`, `out-duration` | As in Materialize. |

From code: `open()`, `close()` and `isOpen`. It announces `md-on-open-start`, `md-on-open-end`, `md-on-close-start`, `md-on-close-end`.

### md-tabs

A list of links becomes the tabs. Each link points to the `id` of its content.

```html
<ul md-tabs>
  <li><a href="#summary">Summary</a></li>
  <li><a href="#details">Details</a></li>
</ul>
<div id="summary">…</div>
<div id="details">…</div>
```

| Option | What it does |
|---|---|
| `fixed` | The tabs share the whole width equally. |
| `transparent` | No background. |
| `swipeable` | The contents can be swiped on a touch screen. |
| `responsive-threshold` | As in Materialize. |

From code: `select("details")` shows a tab, `selectedTab` is the position of the one on show (from 0), and `refresh()` rebuilds the tabs after you add or remove one.

It announces `md-on-selected` (the link's `href`, such as `#details`, is in `$event.detail`) and `md-on-show` (the content shown is in `$event.detail.newContent`).

### md-collapsible

A list of sections that open and close.

```html
<ul md-collapsible>
  <li>
    <div class="collapsible-header"><i class="material-icons">help</i>How do I pay?</div>
    <div class="collapsible-body"><p>By card or bank transfer.</p></div>
  </li>
  <li class="active">
    <div class="collapsible-header">This one starts open</div>
    <div class="collapsible-body"><p>…</p></div>
  </li>
</ul>
```

| Option | What it does |
|---|---|
| `accordion` | `true` (the default): opening a section closes the others. `accordion.bind: false` lets several stay open. |
| `popout` | The open section stands out from the list. |
| `in-duration`, `out-duration` | As in Materialize. |

From code: `open(1)` and `close(1)`, counting sections from 0. It announces `md-on-open-start`, `md-on-open-end`, `md-on-close-start`, `md-on-close-end`, with the section in `$event.detail.el`.

### md-tooltip

A short text that appears when the pointer is over the element.

```html
<button md-tooltip="html: Deletes the record; position: top">Delete</button>
```

| Option | What it does |
|---|---|
| `html` | The text. It is shown as plain text; the name comes from the original bridge. |
| `position` | `top`, `right`, `bottom` (the default) or `left`. |
| `delay` | Milliseconds the text stays after the pointer leaves. |

### Toasts

A toast is a short message that appears and goes away by itself. It is shown from code, with `MdToastService`:

```ts
import { resolve } from "aurelia";
import { MdToastService } from "aurelia2-materialize-bridge";

export class MyApp
{
  private readonly toastService = resolve(MdToastService);

  public async save(): Promise<void>
  {
    // ... save
    void this.toastService.show("Customer saved!");
  }
}
```

`show(text, displayLength)` takes the text and, if you want, how many milliseconds it stays (4000 when not given). It gives back a promise that completes when the toast has gone. `removeAll()` removes every toast on the screen.

## Components that are only looks

### md-button

Gives a `<button>` or an `<a>` Materialize's button look.

```html
<button class="filled" md-button>Save</button>
<button class="tonal" md-button="small: true">Draft</button>
<button md-button="flat: true">Cancel</button>
<button class="filled" md-button="disabled.bind: isSaving">Send</button>
<a class="filled" md-button="floating: true" aria-label="Add"><i class="material-icons">add</i></a>
```

The style of the button is a class you add yourself. Material Design 3 has four, from the most to the least prominent: `filled`, `tonal`, `elevated`, `outlined`. Use one `filled` button per screen, for the main action. A button with none of them is plain grey.

| Option | What it does |
|---|---|
| `flat` | A text button, with no background. For the least important actions. |
| `floating` | A round button, for one icon. |
| `large`, `small` | The size. |
| `disabled` | Disables it. |
| `pulse` | Makes it pulse, to draw attention. |

### md-card

```html
<md-card md-title="Monthly report" action>
  <p>Sales grew this month.</p>
  <a au-slot="action" class="btn btn-flat" load="reports">Open</a>
</md-card>

<md-card md-title="Ana Souza" image.bind="customer.photo" reveal>
  <p>Customer since 2019.</p>
  <p au-slot="reveal-text">This appears when the title is clicked.</p>
</md-card>
```

What goes between the tags is the content of the card. Two other places are filled by marking an element with `au-slot`: `action`, the row of links at the bottom, and `reveal-text`, the hidden panel.

| Option | What it does |
|---|---|
| `md-title` | The title. |
| `image` | The address of a picture, shown at the top with the title over it. |
| `action` | The card has the row of actions. |
| `reveal` | The card has the hidden panel, opened by a click on the title or the picture. |
| `horizontal` | The picture goes at the side. |
| `size` | `small`, `medium` or `large`: a fixed height. |
| `sticky-action` | The actions stay visible when the hidden panel is open. |
| `md-class` | Extra classes for the card, such as `hoverable`. |

### md-navbar

The bar at the top.

```html
<md-navbar fixed>
  <a class="brand-logo">My system</a>
  <ul class="ml-auto hide-on-med-and-down">
    <li><a load="customers">Customers</a></li>
    <li><a load="suppliers">Suppliers</a></li>
  </ul>
</md-navbar>
```

| Option | What it does |
|---|---|
| `fixed` | The bar stays at the top while the page scrolls. |
| `auto-height` | The bar grows with its content. |

### md-progress

A bar or a spinner, to show that something is happening.

```html
<md-progress value.bind="percentDone"></md-progress>   <!-- a bar filled to a percentage -->
<md-progress></md-progress>                            <!-- a bar that runs endlessly -->
<md-progress type="circular"></md-progress>            <!-- a spinner -->
```

| Option | What it does |
|---|---|
| `type` | `linear` (the default) is a bar, `circular` a spinner. |
| `value` | For the bar: a percentage from 0 to 100. Without it the bar runs endlessly. |
| `color` | For the spinner: `blue` (the default), `red`, `yellow`, `green`, or `flashing` to go through the four. |
| `size` | For the spinner: `big` (the default), `small`, or empty for the middle size. |
| `pixel-size` | For the spinner: an exact size in pixels, instead of `size`. |

### md-pagination

The row of page numbers. It only shows and changes the page number; loading the page is yours to do.

```html
<md-pagination pages.bind="pageCount" active-page.bind="page" md-on-page-changed.trigger="loadPage($event.detail)"></md-pagination>
```

| Option | What it does |
|---|---|
| `active-page` | The page on show, from 1. Bound both ways. |
| `pages` | How many pages there are. Changing it goes back to page 1. |
| `visible-page-links` | How many page numbers are shown at most (15 when not given). |
| `show-first-last`, `show-prev-next`, `show-page-links` | `false` hides that group of buttons. |

It announces `md-on-page-changed`, with the new page in `$event.detail`.

## Defaults for the whole application

The date and time pickers have many options, and you will usually want the same ones everywhere. Set them once, where you register the bridge. An option given on a component still wins.

```ts
const Bridge = MaterializeBridge.customize(options =>
{
  options.datepicker.format = "dd/mm/yyyy";
  options.datepicker.firstDay = 1;
  options.datepicker.i18n = {
    cancel: "Cancelar", clear: "Limpar", done: "Ok",
    months: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
    monthsShort: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
    weekdays: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
    weekdaysShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
    weekdaysAbbrev: ["D", "S", "T", "Q", "Q", "S", "S"]
  };

  options.timepicker.twelveHour = false;
  options.timepicker.i18n = { cancel: "Cancelar", clear: "Limpar", done: "Ok" };
});

Aurelia
  .register(Bridge)      // instead of MaterializeBridge
  .app(MyApp)
  .start();
```

`options.datepicker` and `options.timepicker` take any option of Materialize's own pickers, written as in Materialize (`firstDay`, not `first-day`).

## Things to know

**Colours.** MaterializeCSS 2 has no `red darken-2` or `teal-text`. Colours come from the theme, by role: `primary`, `secondary-container`, `error-text`, and so on. The theme itself is changed with Materialize's CSS variables.

**The pickers have fixes of our own.** In MaterializeCSS 2.3.3 the date and time pickers have defects: the box opens at the end of the page, the calendar loses its buttons, and others. The bridge works around them, so what you see is not exactly plain Materialize. The list is in [docs/adr/0004](docs/adr/0004-contornos-para-defeitos-dos-pickers.md) (in Portuguese).

**Limits of Materialize that the bridge does not fix:**

- In the time picker, the hour cannot be typed as `00` or with a leading zero. Choosing it on the clock works.
- On a screen 320 pixels wide, the calendar is a little wider than its box and scrolls sideways.

**Not available yet,** compared with the original bridge: the `<md-dropdown>` element (the `md-dropdown` attribute is), and the components outside this first set (autocomplete, chips, carousel, collection, file input, range, and others).

**Not tried yet:** `md-tabs` inside a screen reached through `@aurelia/router`. The tab links are marked `external` so that the router leaves them alone, but this was not seen working with the router.

## Working on the bridge

```
npm install
npm start           # the demo app, at http://localhost:9000, with every component
npm test            # the unit tests
npm run typecheck
npm run build       # builds the package into dist/
```

The demo app, in `demo/`, is the place to see a component working and to check a change in a real browser. Some things only show there: where a picker opens, how a menu is positioned, what the keyboard does.

Each component is a folder in `src/`: the class, its template when it has one, and its tests. Project conventions are in [AGENTS.md](AGENTS.md), the vocabulary in [GLOSSARY.md](GLOSSARY.md) and the reasons for the main decisions in [docs/adr/](docs/adr/). Those three are written in Portuguese.

## License

[MIT](LICENSE). Copyright (c) 2026 Rodrigo Otávio.
