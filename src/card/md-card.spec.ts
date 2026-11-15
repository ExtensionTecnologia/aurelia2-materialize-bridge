import { afterEach, describe, expect, it, vi } from "vitest";
import { createFixture } from "@aurelia/testing";
import * as M from "@materializecss/materialize";
import { fakeWidget } from "../../test/fake-widget";
import { MaterializeBridge } from "../index";

describe("md-card", () =>
{
  afterEach(() => vi.restoreAllMocks());

  it("renders the title and the content in a Materialize card", async () =>
  {
    const view = await createFixture(`<md-card id="card" md-title="Report" size="small" md-class="hoverable"><p id="text">Content</p></md-card>`, class {}, [MaterializeBridge]).started;

    expect(view.getBy("#card > div.card")?.className.split(/\s+/).filter(name => name != "").sort()).toEqual(["card", "hoverable", "small"]);
    view.assertText("#card .card-content > .card-title", "Report");
    expect(view.getBy("#card .card-content > #text")).not.toBeNull();
    expect(view.queryBy("#card .card-image")).toBeNull();
    expect(view.queryBy("#card .card-action")).toBeNull();
    expect(view.queryBy("#card .card-reveal")).toBeNull();
  });

  it("accepts the old name of the title", async () =>
  {
    const view = await createFixture(`<md-card id="card" title="Report"></md-card>`, class {}, [MaterializeBridge]).started;

    view.assertText("#card .card-title", "Report");
  });

  it("puts the title over the image when there is one", async () =>
  {
    const view = await createFixture(`<md-card id="card" md-title="Report" image="report.png" horizontal></md-card>`, class {}, [MaterializeBridge]).started;

    expect(view.getBy("#card .card-image img")?.getAttribute("src")).toBe("report.png");
    view.assertText("#card .card-image > .card-title", "Report");
    expect(view.queryBy("#card .card-content > .card-title")).toBeNull();
    expect(view.getBy("#card > div.card")?.classList.contains("horizontal")).toBe(true);
  });

  it("renders the actions given for the action row", async () =>
  {
    const view = await createFixture(`<md-card id="card" md-title="Report" action sticky-action><a au-slot="action" id="open">Open</a></md-card>`, class {}, [MaterializeBridge]).started;

    expect(view.getBy("#card .card-action > #open")).not.toBeNull();
    expect(view.getBy("#card > div.card")?.classList.contains("sticky-action")).toBe(true);
  });

  it("has a hidden panel, opened by the title, when reveal is set", async () =>
  {
    const cards = fakeWidget(M.Cards, () => ({}));
    const view = await createFixture(`<md-card id="card" md-title="Report" reveal><p au-slot="reveal-text" id="more">More</p></md-card>`, class {}, [MaterializeBridge]).started;

    expect(view.getBy("#card .card-content > .card-title.activator")).not.toBeNull();
    expect(view.getBy("#card .card-reveal > #more")).not.toBeNull();
    expect(cards.init.mock.calls[0][0]).toBe(view.getBy("#card > div.card"));
  });

  it("needs no script without reveal", async () =>
  {
    const cards = fakeWidget(M.Cards, () => ({}));
    await createFixture(`<md-card id="card" md-title="Report"></md-card>`, class {}, [MaterializeBridge]).started;

    expect(cards.init).not.toHaveBeenCalled();
  });
});
