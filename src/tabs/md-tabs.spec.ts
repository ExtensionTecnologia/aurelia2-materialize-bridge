import { afterEach, describe, expect, it, vi } from "vitest";
import { createFixture } from "@aurelia/testing";
import * as M from "@materializecss/materialize";
import { fakeWidget } from "../../test/fake-widget";
import { MaterializeBridge, type MdTabs } from "../index";

class Record
{
  public tabs!: MdTabs;
  public isFixed: boolean = true;
  public isVisible: boolean = true;
  public selected: string[] = [];
  public shown: string[] = [];
}

const html = `<ul if.bind="isVisible" id="tabs" md-tabs="fixed.bind: isFixed; swipeable.bind: false" md-tabs.ref="tabs"
                  md-on-selected.trigger="selected.push($event.detail)" md-on-show.trigger="shown.push($event.detail.newContent.id)">
                <li><a id="summary-link" href="#summary">Summary</a></li>
                <li><a href="#details">Details</a></li>
              </ul>
              <div id="summary">Summary</div>
              <div id="details">Details</div>`;

function fakeTabs()
{
  return fakeWidget(M.Tabs, () => ({ select: vi.fn(), updateTabIndicator: vi.fn(), index: 1 }));
}

describe("md-tabs", () =>
{
  afterEach(() => vi.restoreAllMocks());

  it("adds Materialize's classes to the list and to each tab", async () =>
  {
    fakeTabs();
    const view = await createFixture(html, Record, [MaterializeBridge]).started;

    expect(view.getBy("#tabs")?.className).toContain("tabs");
    expect(view.getBy("#tabs")?.classList.contains("tabs-fixed-width")).toBe(true);
    expect(view.getAllBy("#tabs li.tab").length).toBe(2);
  });

  it("marks the links as external, so the router leaves them alone", async () =>
  {
    fakeTabs();
    const view = await createFixture(html, Record, [MaterializeBridge]).started;

    expect(view.getAllBy("#tabs a[external]").length).toBe(2);
  });

  it("waits for tabs made by repeat.for before building the widget", async () =>
  {
    const tabs = fakeTabs();
    class Sections { public names: string[] = ["summary", "details", "history"]; }
    const repeated = `<ul id="tabs" md-tabs><li repeat.for="name of names"><a href="#\${name}">\${name}</a></li></ul>
                      <div repeat.for="name of names" id.bind="name">\${name}</div>`;
    const view = await createFixture(repeated, Sections, [MaterializeBridge]).started;

    await vi.waitFor(() => expect(tabs.init).toHaveBeenCalledOnce());
    expect(view.getAllBy("#tabs li.tab").length).toBe(3);
  });

  it("builds the widget with the given options only", async () =>
  {
    const tabs = fakeTabs();
    await createFixture(html, Record, [MaterializeBridge]).started;

    expect(tabs.lastOptions.swipeable).toBe(false);
    expect("responsiveThreshold" in tabs.lastOptions).toBe(false);
  });

  it("announces the tab the user clicked and the content shown", async () =>
  {
    const tabs = fakeTabs();
    const view = await createFixture(html, Record, [MaterializeBridge]).started;

    view.trigger.click("#summary-link");
    tabs.lastOptions.onShow(view.getBy("#details"));

    expect(view.component.selected).toEqual(["#summary"]);
    expect(view.component.shown).toEqual(["details"]);
  });

  it("selects a tab from code and tells which one is on show", async () =>
  {
    const tabs = fakeTabs();
    const view = await createFixture(html, Record, [MaterializeBridge]).started;

    view.component.tabs.select("details");

    expect(tabs.widget.select).toHaveBeenCalledWith("details");
    expect(view.component.tabs.selectedTab).toBe(1);
  });

  it("switches the full-width style", async () =>
  {
    fakeTabs();
    const view = await createFixture(html, Record, [MaterializeBridge]).started;

    view.component.isFixed = false;

    await vi.waitFor(() => expect(view.getBy("#tabs")?.classList.contains("tabs-fixed-width")).toBe(false));
  });

  it("rebuilds on refresh and destroys the widget with the list", async () =>
  {
    const tabs = fakeTabs();
    const view = await createFixture(html, Record, [MaterializeBridge]).started;
    const first = tabs.widget;

    view.component.tabs.refresh();
    expect(first.destroy).toHaveBeenCalledOnce();
    expect(tabs.init).toHaveBeenCalledTimes(2);

    const second = tabs.widget;
    view.component.isVisible = false;
    await vi.waitFor(() => expect(second.destroy).toHaveBeenCalledOnce());
  });
});
