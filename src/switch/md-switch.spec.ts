import { describe, expect, it, vi } from "vitest";
import { createFixture } from "@aurelia/testing";
import { MaterializeBridge } from "../index";

class Settings
{
  public emails: boolean = false;
}

describe("md-switch", () =>
{
  it("renders the Materialize switch with the default labels", async () =>
  {
    const view = await createFixture(`<md-switch id="emails" checked.bind="emails"></md-switch>`, Settings, [MaterializeBridge]).started;

    expect(view.getBy("#emails .switch label .lever")).not.toBeNull();
    expect(view.getBy("#emails label")?.textContent?.replace(/\s+/g, " ").trim()).toBe("Off On");
  });

  it("renders the given labels", async () =>
  {
    const view = await createFixture(`<md-switch id="emails" label-off="No" label-on="Yes" checked.bind="emails"></md-switch>`, Settings, [MaterializeBridge]).started;

    expect(view.getBy("#emails label")?.textContent?.replace(/\s+/g, " ").trim()).toBe("No Yes");
  });

  it("binds the state both ways", async () =>
  {
    const view = await createFixture(`<md-switch id="emails" checked.bind="emails"></md-switch>`, Settings, [MaterializeBridge]).started;
    const checkbox = view.getBy("#emails input") as HTMLInputElement;

    checkbox.click();
    expect(view.component.emails).toBe(true);

    view.component.emails = false;
    await vi.waitFor(() => expect(checkbox.checked).toBe(false));
  });

  it("does not change when read-only, and can be disabled", async () =>
  {
    const html = `<md-switch id="emails" checked.bind="emails" readonly></md-switch>
                  <md-switch id="sms" disabled></md-switch>`;
    const view = await createFixture(html, Settings, [MaterializeBridge]).started;

    (view.getBy("#emails input") as HTMLInputElement).click();

    expect(view.component.emails).toBe(false);
    expect((view.getBy("#sms input") as HTMLInputElement).disabled).toBe(true);
  });
});
