import { describe, expect, it, vi } from "vitest";
import { createFixture } from "@aurelia/testing";
import { MaterializeBridge } from "../index";

class Upload
{
  public done: number | null = 40;
}

describe("md-progress", () =>
{
  it("shows a bar filled to the given percentage", async () =>
  {
    const view = await createFixture(`<md-progress id="bar" value.bind="done"></md-progress>`, Upload, [MaterializeBridge]).started;

    expect((view.getBy("#bar .progress > .determinate") as HTMLElement).style.width).toBe("40%");

    view.component.done = 75;
    await vi.waitFor(() => expect((view.getBy("#bar .determinate") as HTMLElement).style.width).toBe("75%"));
  });

  it("shows zero as an empty bar, not as an endless one", async () =>
  {
    const view = await createFixture(`<md-progress id="bar" value="0"></md-progress>`, class {}, [MaterializeBridge]).started;

    expect((view.getBy("#bar .determinate") as HTMLElement).style.width).toBe("0%");
  });

  it("runs endlessly without a value", async () =>
  {
    const view = await createFixture(`<md-progress id="bar" value.bind="done"></md-progress>`, Upload, [MaterializeBridge]).started;

    view.component.done = null;

    await vi.waitFor(() => expect(view.getBy("#bar .progress > .indeterminate")).not.toBeNull());
    expect(view.queryBy("#bar .determinate")).toBeNull();
  });

  it("shows a spinner of the given size and colour", async () =>
  {
    const view = await createFixture(`<md-progress id="spinner" type="circular" size="small" color="red"></md-progress>`, class {}, [MaterializeBridge]).started;

    expect(view.getBy("#spinner .preloader-wrapper")?.className.split(/\s+/).sort()).toEqual(["active", "preloader-wrapper", "small"]);
    expect(view.getAllBy("#spinner .spinner-layer").length).toBe(1);
    expect(view.getBy("#spinner .spinner-layer")?.classList.contains("spinner-red-only")).toBe(true);
    expect(view.queryBy("#spinner .progress")).toBeNull();
  });

  it("goes through the four colours when flashing", async () =>
  {
    const view = await createFixture(`<md-progress id="spinner" type="circular" color="flashing"></md-progress>`, class {}, [MaterializeBridge]).started;

    expect(view.getAllBy("#spinner .spinner-layer").map(layer => layer.className.replace("spinner-layer ", "")))
      .toEqual(["spinner-blue", "spinner-red", "spinner-yellow", "spinner-green"]);
  });

  it("takes an exact size in pixels instead of a named size", async () =>
  {
    const view = await createFixture(`<md-progress id="spinner" type="circular" pixel-size="80"></md-progress>`, class {}, [MaterializeBridge]).started;
    const wrapper = view.getBy("#spinner .preloader-wrapper") as HTMLElement;

    expect(wrapper.style.width).toBe("80px");
    expect(wrapper.style.height).toBe("80px");
    expect(wrapper.classList.contains("big")).toBe(false);
  });
});
