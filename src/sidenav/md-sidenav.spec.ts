import { afterEach, describe, expect, it, vi } from "vitest";
import { createFixture } from "@aurelia/testing";
import * as M from "@materializecss/materialize";
import { fakeWidget } from "../../test/fake-widget";
import { MaterializeBridge } from "../index";

class Shell
{
  public isVisible: boolean = true;
  public isFixed: boolean = false;
  public events: string[] = [];
}

const html = `<a id="menu-button" md-sidenav-collapse="ref.bind: menu">Menu</a>
              <md-sidenav if.bind="isVisible" id="menu" component.ref="menu" edge="right" draggable.bind="false" fixed.bind="isFixed"
                          md-on-open-end.trigger="events.push('open')">
                <li id="item"><a>Home</a></li>
              </md-sidenav>`;

// A sidenav that remembers whether it is open, as Materialize's does.
function fakeSidenav()
{
  return fakeWidget(M.Sidenav, () =>
  {
    const widget = { isOpen: false, open: vi.fn(() => { widget.isOpen = true; }), close: vi.fn(() => { widget.isOpen = false; }) };
    return widget;
  });
}

describe("md-sidenav", () =>
{
  afterEach(() => vi.restoreAllMocks());

  it("renders the items in Materialize's sidenav list and builds the widget on it", async () =>
  {
    const sidenav = fakeSidenav();
    const view = await createFixture(html, Shell, [MaterializeBridge]).started;

    expect(view.getBy("#menu > ul.sidenav > #item")).not.toBeNull();
    expect(sidenav.init.mock.calls[0][0]).toBe(view.getBy("#menu > ul.sidenav"));
    expect(sidenav.lastOptions.edge).toBe("right");
    expect(sidenav.lastOptions.draggable).toBe(false);
    expect("inDuration" in sidenav.lastOptions).toBe(false);
  });

  it("opens and closes with the element marked md-sidenav-collapse", async () =>
  {
    const sidenav = fakeSidenav();
    const view = await createFixture(html, Shell, [MaterializeBridge]).started;

    view.trigger.click("#menu-button");
    expect(sidenav.widget.open).toHaveBeenCalledOnce();

    view.trigger.click("#menu-button");
    expect(sidenav.widget.close).toHaveBeenCalledOnce();
  });

  it("announces what the widget does as md-on events", async () =>
  {
    const sidenav = fakeSidenav();
    const view = await createFixture(html, Shell, [MaterializeBridge]).started;

    sidenav.lastOptions.onOpenEnd(view.getBy("#menu > ul"));

    expect(view.component.events).toEqual(["open"]);
  });

  it("switches the always-visible style", async () =>
  {
    fakeSidenav();
    const view = await createFixture(html, Shell, [MaterializeBridge]).started;

    view.component.isFixed = true;

    await vi.waitFor(() => expect(view.getBy("#menu > ul")?.classList.contains("sidenav-fixed")).toBe(true));
  });

  it("destroys the widget with the component", async () =>
  {
    const sidenav = fakeSidenav();
    const view = await createFixture(html, Shell, [MaterializeBridge]).started;
    const widget = sidenav.widget;

    view.component.isVisible = false;

    await vi.waitFor(() => expect(widget.destroy).toHaveBeenCalledOnce());
  });
});
