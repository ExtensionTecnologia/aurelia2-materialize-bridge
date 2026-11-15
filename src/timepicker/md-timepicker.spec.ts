import { describe, expect, it, vi } from "vitest";
import { createFixture } from "@aurelia/testing";
import { MaterializeBridge } from "../index";

class Meeting
{
  public start: string = "14:30";
  public isVisible: boolean = true;
  public changes: number = 0;
}

const html = `<md-timepicker if.bind="isVisible" id="start" label="Start" twelve-hour.bind="false" auto-close.bind="false" show-clear-btn
                             value.bind="start" change.trigger="changes = changes + 1"></md-timepicker>`;

function footerButton(text: string): HTMLButtonElement | undefined
{
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>("dialog.timepicker-modal .modal-footer button"));
  return buttons.find(button => button.textContent?.trim() == text);
}

// Types in the hours or minutes box of the open picker, the way Materialize listens for it.
function typeInPicker(box: HTMLInputElement, text: string): void
{
  box.dispatchEvent(new Event("focus"));
  box.value = text;
  box.dispatchEvent(new Event("keyup", { bubbles: true }));
}

describe("md-timepicker", () =>
{
  it("renders the outlined field and shows the bound time", async () =>
  {
    const view = await createFixture(html, Meeting, [MaterializeBridge]).started;

    view.assertText("#start fieldset.form-field legend", "Start");
    view.assertValue("#start input", "14:30");
  });

  it("shows a time set from code", async () =>
  {
    const view = await createFixture(html, Meeting, [MaterializeBridge]).started;

    view.component.start = "08:05";

    await vi.waitFor(() => view.assertValue("#start input", "08:05"));
    expect(document.querySelectorAll("dialog.timepicker-modal").length).toBe(1);
    expect((document.querySelector("dialog.timepicker-modal .timepicker-input-hours") as HTMLInputElement).value).toBe("08");
    expect((document.querySelector("dialog.timepicker-modal .timepicker-input-minutes") as HTMLInputElement).value).toBe("05");
  });

  it("updates the bound time when the user confirms, and announces it", async () =>
  {
    const view = await createFixture(html, Meeting, [MaterializeBridge]).started;
    const hours = document.querySelector("dialog.timepicker-modal .timepicker-input-hours") as HTMLInputElement;
    const minutes = document.querySelector("dialog.timepicker-modal .timepicker-input-minutes") as HTMLInputElement;

    view.trigger.click("#start input");
    typeInPicker(hours, "07");
    typeInPicker(minutes, "45");
    footerButton("Ok")?.click();

    await vi.waitFor(() => expect(view.component.start).toBe("07:45"));
    expect(view.component.changes).toBe(1);
  });

  it("empties the bound time when the user clears", async () =>
  {
    const view = await createFixture(html, Meeting, [MaterializeBridge]).started;

    view.trigger.click("#start input");
    footerButton("Clear")?.click();

    await vi.waitFor(() => expect(view.component.start).toBe(""));
  });

  it("takes the texts of the buttons from the configured options", async () =>
  {
    const Portuguese = MaterializeBridge.customize(options =>
    {
      options.timepicker.i18n = { cancel: "Cancelar", clear: "Limpar", done: "Confirmar" };
    });
    await createFixture(html, Meeting, [Portuguese]).started;

    expect(footerButton("Confirmar")).toBeDefined();
    expect(footerButton("Limpar")).toBeDefined();
  });

  it("removes the picker's dialog from the page with the component", async () =>
  {
    const view = await createFixture(html, Meeting, [MaterializeBridge]).started;
    expect(document.querySelectorAll("dialog.timepicker-modal").length).toBe(1);

    view.component.isVisible = false;

    await vi.waitFor(() => expect(document.querySelectorAll("dialog.timepicker-modal").length).toBe(0));
  });
});
