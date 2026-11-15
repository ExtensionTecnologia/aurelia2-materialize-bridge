import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createFixture } from "@aurelia/testing";
import { MaterializeBridge, type MdModal } from "../index";

// jsdom has no popover. This stands in for the browser: it announces the change the way a browser does.
function announce(element: HTMLElement, newState: "open" | "closed"): void
{
  for (const name of ["beforetoggle", "toggle"])
  {
    const event = new Event(name);
    Object.defineProperty(event, "newState", { value: newState });
    element.dispatchEvent(event);
  }
}

beforeAll(() =>
{
  HTMLElement.prototype.showPopover = function (this: HTMLElement) { announce(this, "open"); };
  HTMLElement.prototype.hidePopover = function (this: HTMLElement) { announce(this, "closed"); };
});

afterAll(() =>
{
  Reflect.deleteProperty(HTMLElement.prototype, "showPopover");
  Reflect.deleteProperty(HTMLElement.prototype, "hidePopover");
});

class Page
{
  public confirmation!: MdModal;
  public isDismissible: boolean = true;
  public events: string[] = [];
  public confirmed: number = 0;
}

const html = `<div id="confirmation" md-modal="dismissible.bind: isDismissible; bottom-sheet: true" md-modal.ref="confirmation"
                   md-on-open-start.trigger="events.push('open-start')" md-on-open-end.trigger="events.push('open-end')"
                   md-on-close-start.trigger="events.push('close-start')" md-on-close-end.trigger="events.push('close-end')">
                <div class="modal-content"><input id="reason"></div>
                <div class="modal-footer"><button id="ok" class="modal-action default" click.trigger="confirmed = confirmed + 1">Ok</button></div>
              </div>`;

describe("md-modal", () =>
{
  it("turns the element into a Materialize modal that the browser shows as a popover", async () =>
  {
    const view = await createFixture(html, Page, [MaterializeBridge]).started;
    const modal = view.getBy("#confirmation");

    expect(modal?.classList.contains("modal")).toBe(true);
    expect(modal?.classList.contains("bottom-sheet")).toBe(true);
    expect(modal?.getAttribute("popover")).toBe("auto");
  });

  it("can only be closed from code when it is not dismissible", async () =>
  {
    const view = await createFixture(html, Page, [MaterializeBridge]).started;

    view.component.isDismissible = false;

    await vi.waitFor(() => expect(view.getBy("#confirmation")?.getAttribute("popover")).toBe("manual"));
  });

  it("opens and closes from code, announcing each step", async () =>
  {
    const view = await createFixture(html, Page, [MaterializeBridge]).started;

    view.component.confirmation.open();
    expect(view.component.confirmation.isOpen).toBe(true);

    view.component.confirmation.close();
    expect(view.component.confirmation.isOpen).toBe(false);
    expect(view.component.events).toEqual(["open-start", "open-end", "close-start", "close-end"]);
  });

  it("does not open twice nor close when it is not open", async () =>
  {
    const view = await createFixture(html, Page, [MaterializeBridge]).started;

    view.component.confirmation.close();
    view.component.confirmation.open();
    view.component.confirmation.open();

    expect(view.component.events).toEqual(["open-start", "open-end"]);
  });

  it("knows when the browser closed it (Esc, a click outside)", async () =>
  {
    const view = await createFixture(html, Page, [MaterializeBridge]).started;

    view.component.confirmation.open();
    announce(view.getBy("#confirmation") as HTMLElement, "closed");

    expect(view.component.confirmation.isOpen).toBe(false);
  });

  it("clicks the default action when the user presses Enter", async () =>
  {
    const view = await createFixture(html, Page, [MaterializeBridge]).started;

    view.getBy("#reason")?.dispatchEvent(new KeyboardEvent("keydown", { key: "a", bubbles: true }));
    expect(view.component.confirmed).toBe(0);

    const enter = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    view.getBy("#reason")?.dispatchEvent(enter);
    expect(view.component.confirmed).toBe(1);
    expect(enter.defaultPrevented).toBe(true);
  });
});
