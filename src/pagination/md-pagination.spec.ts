import { describe, expect, it, vi } from "vitest";
import { createFixture } from "@aurelia/testing";
import { MaterializeBridge } from "../index";

class List
{
  public page: number = 1;
  public pages: number = 20;
  public changes: number[] = [];
}

const html = `<md-pagination id="pages" pages.bind="pages" visible-page-links="5" active-page.bind="page"
                             md-on-page-changed.trigger="changes.push($event.detail)"></md-pagination>`;

describe("md-pagination", () =>
{
  // The page numbers on show, with the active one between brackets.
  function shown(view: { getAllBy(selector: string): HTMLElement[] }): string
  {
    return view.getAllBy("#pages li.page").map(page => page.classList.contains("active") ? `[${page.textContent?.trim()}]` : page.textContent?.trim()).join(" ");
  }

  it("shows a window of page numbers with the active one marked", async () =>
  {
    const view = await createFixture(html, List, [MaterializeBridge]).started;

    expect(shown(view)).toBe("[1] 2 3 4 5");
    expect(view.getBy("#pages li.first-page")?.classList.contains("disabled")).toBe(true);
    expect(view.getBy("#pages li.previous-page")?.classList.contains("disabled")).toBe(true);
    expect(view.getBy("#pages li.next-page")?.classList.contains("disabled")).toBe(false);
  });

  it("goes to the page the user clicks and announces it", async () =>
  {
    const view = await createFixture(html, List, [MaterializeBridge]).started;

    view.getAllBy("#pages li.page")[3].click();

    await vi.waitFor(() => expect(view.component.page).toBe(4));
    expect(view.component.changes).toEqual([4]);
  });

  it("moves with next, previous, last and first", async () =>
  {
    const view = await createFixture(html, List, [MaterializeBridge]).started;

    view.trigger.click("#pages li.next-page");
    await vi.waitFor(() => expect(view.component.page).toBe(2));

    view.trigger.click("#pages li.last-page");
    await vi.waitFor(() => expect(view.component.page).toBe(20));
    await vi.waitFor(() => expect(shown(view)).toBe("16 17 18 19 [20]"));
    expect(view.getBy("#pages li.next-page")?.classList.contains("disabled")).toBe(true);

    view.trigger.click("#pages li.previous-page");
    await vi.waitFor(() => expect(view.component.page).toBe(19));

    view.trigger.click("#pages li.first-page");
    await vi.waitFor(() => expect(view.component.page).toBe(1));
    expect(view.component.changes).toEqual([2, 20, 19, 1]);
  });

  it("does nothing on first and previous at the first page", async () =>
  {
    const view = await createFixture(html, List, [MaterializeBridge]).started;

    view.trigger.click("#pages li.first-page");
    view.trigger.click("#pages li.previous-page");

    expect(view.component.changes).toEqual([]);
  });

  it("follows the page set from code", async () =>
  {
    const view = await createFixture(html, List, [MaterializeBridge]).started;

    view.component.page = 10;

    await vi.waitFor(() => expect(shown(view)).toBe("8 9 [10] 11 12"));
  });

  it("starts again from the first page when the number of pages changes", async () =>
  {
    const view = await createFixture(html, List, [MaterializeBridge]).started;
    view.component.page = 10;
    await vi.waitFor(() => expect(shown(view)).toContain("[10]"));

    view.component.pages = 3;

    await vi.waitFor(() => expect(view.component.page).toBe(1));
    expect(shown(view)).toBe("[1] 2 3");
  });

  it("hides the groups of buttons that are switched off", async () =>
  {
    const view = await createFixture(`<md-pagination id="pages" pages="3" show-first-last.bind="false" show-prev-next.bind="false"></md-pagination>`, class {}, [MaterializeBridge]).started;

    expect(view.queryBy("#pages li.first-page")).toBeNull();
    expect(view.queryBy("#pages li.next-page")).toBeNull();
    expect(view.getAllBy("#pages li.page").length).toBe(3);
  });
});
