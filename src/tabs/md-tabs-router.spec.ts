import { afterEach, describe, expect, it, vi } from "vitest";
import { createFixture } from "@aurelia/testing";
import { RouterConfiguration } from "@aurelia/router";
import * as M from "@materializecss/materialize";
import { fakeWidget } from "../../test/fake-widget";
import { MaterializeBridge } from "../index";

// With @aurelia/router registered, every <a href> of a template belongs to the router.
describe("md-tabs with @aurelia/router", () =>
{
  afterEach(() => vi.restoreAllMocks());

  it("takes its links back from the router, with the addresses as they were written", async () =>
  {
    const tabs = fakeWidget(M.Tabs, () => ({ select: vi.fn(), updateTabIndicator: vi.fn(), index: 0 }));
    const html = `<ul id="tabs" md-tabs><li><a href="#summary">Summary</a></li><li><a href="#details">Details</a></li></ul>
                  <a id="route-link" href="customers">Customers</a>
                  <div id="summary"></div><div id="details"></div>`;
    const view = await createFixture(html, class {}, [RouterConfiguration, MaterializeBridge]).started;

    await vi.waitFor(() => expect(tabs.init).toHaveBeenCalledOnce());

    // The router rewrites the links it owns; a tab link must be exactly what was written.
    expect(view.getAllBy("#tabs a").map(link => link.getAttribute("href"))).toEqual(["#summary", "#details"]);
    expect(view.getAllBy("#tabs a[external]").length).toBe(2);
    expect(view.getBy("#route-link")?.getAttribute("href")).not.toBe("customers");
  });
});
