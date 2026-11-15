import { afterEach, describe, expect, it, vi } from "vitest";
import { createFixture } from "@aurelia/testing";
import * as M from "@materializecss/materialize";
import { fakeWidget } from "../../test/fake-widget";
import { MaterializeBridge } from "../index";

class Toolbar
{
  public hint: string = "Deletes the record";
  public isVisible: boolean = true;
}

const html = `<button if.bind="isVisible" id="delete" md-tooltip="html.bind: hint; position: top; delay: 80">Delete</button>`;

describe("md-tooltip", () =>
{
  afterEach(() => vi.restoreAllMocks());

  it("builds the tooltip with the text, position and delay", async () =>
  {
    const tooltip = fakeWidget(M.Tooltip, () => ({}));
    await createFixture(html, Toolbar, [MaterializeBridge]).started;

    expect(tooltip.lastOptions).toEqual({ text: "Deletes the record", position: "top", exitDelay: 80 });
  });

  it("rebuilds the tooltip when the text changes, and has none without text", async () =>
  {
    const tooltip = fakeWidget(M.Tooltip, () => ({}));
    const view = await createFixture(html, Toolbar, [MaterializeBridge]).started;
    const first = tooltip.widget;

    view.component.hint = "Removes the record";
    await vi.waitFor(() => expect(tooltip.lastOptions.text).toBe("Removes the record"));
    expect(first.destroy).toHaveBeenCalledOnce();

    const second = tooltip.widget;
    view.component.hint = "";
    await vi.waitFor(() => expect(second.destroy).toHaveBeenCalledOnce());
    expect(tooltip.init).toHaveBeenCalledTimes(2);
  });

  it("destroys the tooltip with the element", async () =>
  {
    const tooltip = fakeWidget(M.Tooltip, () => ({}));
    const view = await createFixture(html, Toolbar, [MaterializeBridge]).started;
    const widget = tooltip.widget;

    view.component.isVisible = false;

    await vi.waitFor(() => expect(widget.destroy).toHaveBeenCalledOnce());
  });
});
