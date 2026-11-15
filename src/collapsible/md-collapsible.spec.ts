import { afterEach, describe, expect, it, vi } from "vitest";
import { createFixture } from "@aurelia/testing";
import * as M from "@materializecss/materialize";
import { fakeWidget } from "../../test/fake-widget";
import { MaterializeBridge, type MdCollapsible } from "../index";

class Faq
{
  public questions!: MdCollapsible;
  public isAccordion: boolean = true;
  public isVisible: boolean = true;
  public events: string[] = [];
}

const html = `<ul if.bind="isVisible" id="faq" md-collapsible="accordion.bind: isAccordion; popout: true; in-duration: 100" md-collapsible.ref="questions"
                  md-on-open-end.trigger="events.push('open ' + $event.detail.el.id)">
                <li id="first"><div class="collapsible-header">First</div><div class="collapsible-body">Answer</div></li>
              </ul>`;

describe("md-collapsible", () =>
{
  afterEach(() => vi.restoreAllMocks());

  it("adds Materialize's classes and builds the widget with the given options", async () =>
  {
    const collapsible = fakeWidget(M.Collapsible, () => ({ open: vi.fn(), close: vi.fn() }));
    const view = await createFixture(html, Faq, [MaterializeBridge]).started;

    expect(view.getBy("#faq")?.classList.contains("collapsible")).toBe(true);
    expect(view.getBy("#faq")?.classList.contains("popout")).toBe(true);
    expect(collapsible.lastOptions.accordion).toBe(true);
    expect(collapsible.lastOptions.inDuration).toBe(100);
    expect("outDuration" in collapsible.lastOptions).toBe(false);
  });

  it("announces what the widget does as md-on events", async () =>
  {
    const collapsible = fakeWidget(M.Collapsible, () => ({ open: vi.fn(), close: vi.fn() }));
    const view = await createFixture(html, Faq, [MaterializeBridge]).started;

    collapsible.lastOptions.onOpenEnd(view.getBy("#first"));

    expect(view.component.events).toEqual(["open first"]);
  });

  it("opens and closes a section from code", async () =>
  {
    const collapsible = fakeWidget(M.Collapsible, () => ({ open: vi.fn(), close: vi.fn() }));
    const view = await createFixture(html, Faq, [MaterializeBridge]).started;

    view.component.questions.open(1);
    view.component.questions.close();

    expect(collapsible.widget.open).toHaveBeenCalledWith(1);
    expect(collapsible.widget.close).toHaveBeenCalledWith(0);
  });

  it("rebuilds the widget when accordion changes", async () =>
  {
    const collapsible = fakeWidget(M.Collapsible, () => ({ open: vi.fn(), close: vi.fn() }));
    const view = await createFixture(html, Faq, [MaterializeBridge]).started;
    const first = collapsible.widget;

    view.component.isAccordion = false;

    await vi.waitFor(() => expect(collapsible.init).toHaveBeenCalledTimes(2));
    expect(first.destroy).toHaveBeenCalledOnce();
    expect(collapsible.lastOptions.accordion).toBe(false);
  });

  it("destroys the widget with the list", async () =>
  {
    const collapsible = fakeWidget(M.Collapsible, () => ({ open: vi.fn(), close: vi.fn() }));
    const view = await createFixture(html, Faq, [MaterializeBridge]).started;
    const widget = collapsible.widget;

    view.component.isVisible = false;

    await vi.waitFor(() => expect(widget.destroy).toHaveBeenCalledOnce());
  });
});
