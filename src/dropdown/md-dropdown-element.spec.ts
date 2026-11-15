import { afterEach, describe, expect, it, vi } from "vitest";
import { createFixture } from "@aurelia/testing";
import * as M from "@materializecss/materialize";
import { fakeWidget } from "../../test/fake-widget";
import { MaterializeBridge, type MdDropdownElement } from "../index";

class Account
{
  public menu!: MdDropdownElement;
  public isVisible: boolean = true;
  public events: string[] = [];
}

const html = `<md-dropdown if.bind="isVisible" id="account" class="tonal" title="Account" cover-trigger.bind="false" component.ref="menu"
                           md-on-open-end.trigger="events.push('open')">
                <li id="profile"><a>Profile</a></li>
              </md-dropdown>`;

function fakeDropdown()
{
  return fakeWidget(M.Dropdown, () => ({ open: vi.fn(), close: vi.fn(), recalculateDimensions: vi.fn() }));
}

describe("md-dropdown element", () =>
{
  afterEach(() => vi.restoreAllMocks());

  it("is itself the button, with the title as its text and the element's own classes kept", async () =>
  {
    fakeDropdown();
    const view = await createFixture(html, Account, [MaterializeBridge]).started;
    const button = view.getBy("#account");

    expect(button?.className.split(/\s+/).sort()).toEqual(["btn", "dropdown-trigger", "tonal", "waves-effect"]);
    expect(button?.textContent?.trim().startsWith("Account")).toBe(true);
    expect(button?.getAttribute("role")).toBe("button");
    expect(button?.getAttribute("tabindex")).toBe("0");
  });

  it("puts the items in Materialize's list and points the button to it", async () =>
  {
    const dropdown = fakeDropdown();
    const view = await createFixture(html, Account, [MaterializeBridge]).started;
    const list = view.getBy("ul.dropdown-content");

    expect(list?.querySelector("#profile")).not.toBeNull();
    expect(view.getBy("#account")?.getAttribute("data-target")).toBe(list?.id);
    expect(dropdown.init.mock.calls[0][0]).toBe(view.getBy("#account"));
  });

  it("builds the widget with the given options only", async () =>
  {
    const dropdown = fakeDropdown();
    await createFixture(html, Account, [MaterializeBridge]).started;

    expect(dropdown.lastOptions.coverTrigger).toBe(false);
    expect("alignment" in dropdown.lastOptions).toBe(false);
  });

  it("announces what the widget does, and opens and closes from code", async () =>
  {
    const dropdown = fakeDropdown();
    const view = await createFixture(html, Account, [MaterializeBridge]).started;

    dropdown.lastOptions.onOpenEnd();
    view.component.menu.open();
    view.component.menu.close();

    expect(view.component.events).toEqual(["open"]);
    expect(dropdown.widget.open).toHaveBeenCalledOnce();
    expect(dropdown.widget.close).toHaveBeenCalledOnce();
  });

  it("leaves nothing behind when it is removed, even after Materialize moved the list out of it", async () =>
  {
    const dropdown = fakeDropdown();
    const view = await createFixture(`<section id="page">${html}</section>`, Account, [MaterializeBridge]).started;
    const widget = dropdown.widget;

    // What the real widget does when it is built.
    const list = view.getBy("ul.dropdown-content") as HTMLElement;
    view.getBy("#account")?.after(list);

    view.component.isVisible = false;

    await vi.waitFor(() => expect(view.queryBy("#account")).toBeNull());
    expect(widget.destroy).toHaveBeenCalledOnce();
    expect(view.queryBy("#page ul")).toBeNull();
  });

  it("does not get in the way of the md-dropdown attribute", async () =>
  {
    fakeDropdown();
    const both = `<a id="trigger" md-dropdown="activates: other-menu">Other</a><ul id="other-menu"><li><a>Item</a></li></ul>
                  <md-dropdown id="account" title="Account"><li><a>Profile</a></li></md-dropdown>`;
    const view = await createFixture(both, class {}, [MaterializeBridge]).started;

    expect(view.getBy("#trigger")?.getAttribute("data-target")).toBe("other-menu");
    expect(view.getBy("#account")?.classList.contains("dropdown-trigger")).toBe(true);
  });
});
