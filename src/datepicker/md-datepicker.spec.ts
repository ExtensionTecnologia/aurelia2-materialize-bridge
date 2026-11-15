import { describe, expect, it, vi } from "vitest";
import { createFixture } from "@aurelia/testing";
import { MaterializeBridge } from "../index";

class Trip
{
  public departure: Date | null = new Date(2026, 3, 3);
  public isVisible: boolean = true;
  public selected: Date | null = null;
  public changes: number = 0;
}

const DayFirst = MaterializeBridge.customize(options =>
{
  options.datepicker.format = "dd/mm/yyyy";
});

const html = `<md-datepicker if.bind="isVisible" id="departure" label="Departure" value.bind="departure"
                             md-on-select.trigger="selected = $event.detail.selectedDate" change.trigger="changes = changes + 1"></md-datepicker>`;

// Clicks the given day in the calendar of the open picker.
function chooseDay(day: number): void
{
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>("dialog.datepicker-modal button.datepicker-day-button"));
  buttons.find(button => button.dataset.day == String(day))?.click();
}

function footerButton(text: string): HTMLButtonElement | undefined
{
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>("dialog.datepicker-modal .modal-footer button"));
  return buttons.find(button => button.textContent?.trim() == text);
}

describe("md-datepicker", () =>
{
  it("renders the outlined field and shows the bound date in the configured format", async () =>
  {
    const view = await createFixture(html, Trip, [DayFirst]).started;

    view.assertText("#departure fieldset.form-field legend", "Departure");
    view.assertValue("#departure input", "03/04/2026");
  });

  it("uses Materialize's own format when none is configured", async () =>
  {
    const view = await createFixture(html, Trip, [MaterializeBridge]).started;

    view.assertValue("#departure input", "Apr 03, 2026");
  });

  it("lets the component's own format win over the configured one", async () =>
  {
    const view = await createFixture(`<md-datepicker id="departure" format="yyyy-mm-dd" value.bind="departure"></md-datepicker>`, Trip, [DayFirst]).started;

    view.assertValue("#departure input", "2026-04-03");
  });

  it("shows a date set from code, and nothing for null", async () =>
  {
    const view = await createFixture(html, Trip, [DayFirst]).started;

    view.component.departure = new Date(2026, 11, 25);
    await vi.waitFor(() => view.assertValue("#departure input", "25/12/2026"));

    view.component.departure = null;
    await vi.waitFor(() => view.assertValue("#departure input", ""));
  });

  it("updates the bound date when the user chooses a day, and announces it", async () =>
  {
    const view = await createFixture(html, Trip, [DayFirst]).started;

    view.trigger.click("#departure input");
    chooseDay(20);

    await vi.waitFor(() => expect(view.component.departure?.toDateString()).toBe(new Date(2026, 3, 20).toDateString()));
    view.assertValue("#departure input", "20/04/2026");
    expect(view.component.selected?.toDateString()).toBe(new Date(2026, 3, 20).toDateString());
    expect(view.component.changes).toBe(1);
  });

  it("opens on the month of the bound date even when day and month could be swapped", async () =>
  {
    const view = await createFixture(html, Trip, [DayFirst]).started;

    view.trigger.click("#departure input");

    // 03/04/2026 read the American way would be 4 March.
    expect(document.querySelector("dialog.datepicker-modal td.is-selected button")?.getAttribute("data-month")).toBe("3");
    expect(view.component.selected).toBeNull();
  });

  it("has Ok, Cancel and Clear buttons when it does not close on choosing", async () =>
  {
    const buttonsHtml = `<md-datepicker id="departure" label="Departure" auto-close.bind="false" show-clear-btn value.bind="departure"></md-datepicker>`;
    const view = await createFixture(buttonsHtml, Trip, [DayFirst]).started;

    // Cancel keeps the bound date.
    view.trigger.click("#departure input");
    chooseDay(20);
    footerButton("Cancel")?.click();
    await new Promise(resolvePromise => setTimeout(resolvePromise, 30));
    expect(view.component.departure?.getDate()).toBe(3);

    // Ok takes the chosen day.
    view.trigger.click("#departure input");
    chooseDay(20);
    expect(view.component.departure?.getDate()).toBe(3);
    footerButton("Ok")?.click();
    await vi.waitFor(() => expect(view.component.departure?.getDate()).toBe(20));

    // Clear empties the bound date.
    view.trigger.click("#departure input");
    footerButton("Clear")?.click();
    await vi.waitFor(() => expect(view.component.departure).toBeNull());
    view.assertValue("#departure input", "");
  });

  it("has no buttons when it closes on choosing", async () =>
  {
    await createFixture(html, Trip, [DayFirst]).started;

    expect(document.querySelectorAll("dialog.datepicker-modal .modal-footer button").length).toBe(0);
  });

  it("removes the picker's dialog from the page with the component", async () =>
  {
    const view = await createFixture(html, Trip, [DayFirst]).started;
    expect(document.querySelectorAll("dialog.datepicker-modal").length).toBe(1);

    view.component.isVisible = false;

    await vi.waitFor(() => expect(document.querySelectorAll("dialog.datepicker-modal").length).toBe(0));
  });

  it("disables the field", async () =>
  {
    const view = await createFixture(`<md-datepicker id="departure" label="Departure" disabled></md-datepicker>`, class {}, [DayFirst]).started;

    expect((view.getBy("#departure input") as HTMLInputElement).disabled).toBe(true);
    expect((view.getBy("#departure fieldset") as HTMLFieldSetElement).disabled).toBe(true);
  });
});
