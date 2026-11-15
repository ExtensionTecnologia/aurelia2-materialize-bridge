import { describe, expect, it, vi } from "vitest";
import { createFixture } from "@aurelia/testing";
import { MaterializeBridge } from "../index";

class Plan
{
  public chosen: string = "monthly";
  public months: number = 1;
}

const plansHtml = `
  <md-radio id="monthly" name="plan" value="monthly" checked.bind="chosen">Monthly</md-radio>
  <md-radio id="yearly" name="plan" value="yearly" checked.bind="chosen" gap>Yearly</md-radio>`;

describe("md-radio", () =>
{
  it("renders the label and marks the radio whose value is chosen", async () =>
  {
    const view = await createFixture(plansHtml, Plan, [MaterializeBridge]).started;

    view.assertText("#yearly label span", "Yearly");
    expect((view.getBy("#monthly input") as HTMLInputElement).checked).toBe(true);
    expect((view.getBy("#yearly input") as HTMLInputElement).checked).toBe(false);
    expect(view.getBy("#yearly input")?.getAttribute("name")).toBe("plan");
  });

  it("binds the chosen value both ways", async () =>
  {
    const view = await createFixture(plansHtml, Plan, [MaterializeBridge]).started;

    (view.getBy("#yearly input") as HTMLInputElement).click();
    expect(view.component.chosen).toBe("yearly");
    await vi.waitFor(() => expect((view.getBy("#monthly input") as HTMLInputElement).checked).toBe(false));

    view.component.chosen = "monthly";
    await vi.waitFor(() => expect((view.getBy("#monthly input") as HTMLInputElement).checked).toBe(true));
  });

  it("uses model for choices that are not strings", async () =>
  {
    const html = `<md-radio id="one" name="months" model.bind="1" checked.bind="months">1</md-radio>
                  <md-radio id="twelve" name="months" model.bind="12" checked.bind="months">12</md-radio>`;
    const view = await createFixture(html, Plan, [MaterializeBridge]).started;

    expect((view.getBy("#one input") as HTMLInputElement).checked).toBe(true);

    (view.getBy("#twelve input") as HTMLInputElement).click();
    expect(view.component.months).toBe(12);
  });

  it("adds the ring style with gap", async () =>
  {
    const view = await createFixture(plansHtml, Plan, [MaterializeBridge]).started;

    expect(view.getBy("#yearly input")?.classList.contains("with-gap")).toBe(true);
    expect(view.getBy("#monthly input")?.classList.contains("with-gap")).toBe(false);
  });

  it("does not change when read-only, and can be disabled", async () =>
  {
    const html = `<md-radio id="monthly" name="plan" value="monthly" checked.bind="chosen">Monthly</md-radio>
                  <md-radio id="yearly" name="plan" value="yearly" checked.bind="chosen" readonly>Yearly</md-radio>
                  <md-radio id="never" name="plan" value="never" checked.bind="chosen" disabled>Never</md-radio>`;
    const view = await createFixture(html, Plan, [MaterializeBridge]).started;

    (view.getBy("#yearly input") as HTMLInputElement).click();

    expect(view.component.chosen).toBe("monthly");
    expect((view.getBy("#never input") as HTMLInputElement).disabled).toBe(true);
  });
});
