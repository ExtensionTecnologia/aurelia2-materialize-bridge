import { describe, expect, it } from "vitest";
import { createFixture } from "@aurelia/testing";
import { MaterializeBridge } from "../index";

describe("md-navbar", () =>
{
  it("renders the content in Materialize's navbar", async () =>
  {
    const view = await createFixture(`<md-navbar id="bar"><a id="brand" class="brand-logo">Brand</a></md-navbar>`, class {}, [MaterializeBridge]).started;

    expect(view.getBy("#bar nav.navbar > .nav-wrapper > #brand")).not.toBeNull();
    expect(view.getBy("#bar > div")?.classList.contains("navbar-fixed")).toBe(false);
  });

  it("can stay at the top of the screen and grow with its content", async () =>
  {
    const view = await createFixture(`<md-navbar id="bar" fixed auto-height></md-navbar>`, class {}, [MaterializeBridge]).started;

    expect(view.getBy("#bar > div")?.classList.contains("navbar-fixed")).toBe(true);
    expect(view.getBy("#bar nav")?.classList.contains("auto-height")).toBe(true);
  });

  it("renders the extra content under the bar's row", async () =>
  {
    const view = await createFixture(`<md-navbar id="bar"><ul au-slot="content" id="extra"></ul></md-navbar>`, class {}, [MaterializeBridge]).started;

    expect(view.getBy("#bar nav > #extra")).not.toBeNull();
  });
});
