import { describe, expect, it, vi } from "vitest";
import { createFixture } from "@aurelia/testing";
import { MaterializeBridge } from "../index";

class Toolbar
{
  public isBusy: boolean = false;
  public isVisible: boolean = true;
}

const html = `<button if.bind="isVisible" id="save" class="filled" md-button="disabled.bind: isBusy; pulse.bind: isBusy; large: true">Save</button>
              <a id="add" md-button="floating: true; flat: true; disabled.bind: isBusy">Add</a>`;

describe("md-button", () =>
{
  it("adds Materialize's button classes and keeps the element's own", async () =>
  {
    const view = await createFixture(html, Toolbar, [MaterializeBridge]).started;

    expect(view.getBy("#save")?.className.split(" ").sort()).toEqual(["btn", "btn-large", "filled", "waves-effect"]);
    expect(view.getBy("#add")?.className.split(" ").sort()).toEqual(["btn", "btn-flat", "btn-floating", "waves-effect"]);
  });

  it("disables a button for real and marks a link as disabled", async () =>
  {
    const view = await createFixture(html, Toolbar, [MaterializeBridge]).started;

    view.component.isBusy = true;

    await vi.waitFor(() => expect((view.getBy("#save") as HTMLButtonElement).disabled).toBe(true));
    expect(view.getBy("#save")?.classList.contains("disabled")).toBe(true);
    expect(view.getBy("#save")?.classList.contains("pulse")).toBe(true);
    expect(view.getBy("#add")?.classList.contains("disabled")).toBe(true);

    view.component.isBusy = false;
    await vi.waitFor(() => expect((view.getBy("#save") as HTMLButtonElement).disabled).toBe(false));
    expect(view.getBy("#save")?.classList.contains("disabled")).toBe(false);
  });
});
