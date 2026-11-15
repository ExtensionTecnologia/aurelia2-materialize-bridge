import { afterEach, describe, expect, it, vi } from "vitest";
import { createFixture } from "@aurelia/testing";
import * as M from "@materializecss/materialize";
import { fakeWidget } from "../../test/fake-widget";
import { MaterializeBridge, type MdDropdown } from "../index";

class Account
{
  public dropdown!: MdDropdown;
  public list!: HTMLElement;
  public isVisible: boolean = true;
  public events: string[] = [];
}

const html = `<section id="page">
                <a if.bind="isVisible" id="trigger" md-dropdown="activates: account-menu; cover-trigger.bind: false; alignment: right" md-dropdown.ref="dropdown"
                   md-on-open-end.trigger="events.push('open')" md-on-close-end.trigger="events.push('closed')">Account</a>
                <ul id="account-menu"><li><a>Profile</a></li></ul>
              </section>`;

function fakeDropdown()
{
  return fakeWidget(M.Dropdown, () => ({ open: vi.fn(), close: vi.fn(), recalculateDimensions: vi.fn() }));
}

describe("md-dropdown", () =>
{
  afterEach(() => vi.restoreAllMocks());

  it("links the trigger to the list and adds Materialize's classes", async () =>
  {
    fakeDropdown();
    const view = await createFixture(html, Account, [MaterializeBridge]).started;

    expect(view.getBy("#trigger")?.classList.contains("dropdown-trigger")).toBe(true);
    expect(view.getBy("#trigger")?.getAttribute("data-target")).toBe("account-menu");
    expect(view.getBy("#account-menu")?.classList.contains("dropdown-content")).toBe(true);
  });

  it("builds the widget with the given options only", async () =>
  {
    const dropdown = fakeDropdown();
    await createFixture(html, Account, [MaterializeBridge]).started;

    expect(dropdown.lastOptions.coverTrigger).toBe(false);
    expect(dropdown.lastOptions.alignment).toBe("right");
    expect("hover" in dropdown.lastOptions).toBe(false);
  });

  it("accepts the list itself instead of its id, giving it an id when it has none", async () =>
  {
    fakeDropdown();
    const byRef = `<a id="trigger" md-dropdown="ref.bind: list">Account</a><ul ref="list"><li><a>Profile</a></li></ul>`;
    const view = await createFixture(byRef, Account, [MaterializeBridge]).started;

    const id = view.component.list.id;
    expect(id).not.toBe("");
    expect(view.getBy("#trigger")?.getAttribute("data-target")).toBe(id);
  });

  it("announces opening and closing, and opens and closes from code", async () =>
  {
    const dropdown = fakeDropdown();
    const view = await createFixture(html, Account, [MaterializeBridge]).started;

    dropdown.lastOptions.onOpenEnd();
    dropdown.lastOptions.onCloseEnd();
    view.component.dropdown.open();
    view.component.dropdown.close();

    expect(view.component.events).toEqual(["open", "closed"]);
    expect(dropdown.widget.open).toHaveBeenCalledOnce();
    expect(dropdown.widget.close).toHaveBeenCalledOnce();
  });

  it("destroys the widget with the trigger and leaves the list as it was", async () =>
  {
    const dropdown = fakeDropdown();
    const view = await createFixture(html, Account, [MaterializeBridge]).started;
    const widget = dropdown.widget;

    view.component.isVisible = false;

    await vi.waitFor(() => expect(widget.destroy).toHaveBeenCalledOnce());
    expect(view.getBy("#page > #account-menu")?.classList.contains("dropdown-content")).toBe(false);
  });
});
