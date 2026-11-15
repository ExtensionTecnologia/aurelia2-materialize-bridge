import { describe, expect, it, vi } from "vitest";
import { newInstanceForScope, resolve } from "aurelia";
import { createFixture } from "@aurelia/testing";
import { IValidationRules } from "@aurelia/validation";
import { IValidationController, ValidationHtmlConfiguration, ValidationTrigger } from "@aurelia/validation-html";
import { MaterializeBridge } from "../index";
import { MaterializeBridgeValidation } from "../validation/index";

class Terms
{
  public accepted: boolean | null = false;
  public colours: string[] = ["red"];
  public isReadonly: boolean = false;
  public isDisabled: boolean = false;
}

describe("md-checkbox", () =>
{
  it("renders the label text beside the checkbox", async () =>
  {
    const view = await createFixture(`<md-checkbox id="terms" checked.bind="accepted">I accept the terms</md-checkbox>`, Terms, [MaterializeBridge]).started;

    view.assertText("#terms label span", "I accept the terms");
  });

  it("binds a boolean both ways", async () =>
  {
    const view = await createFixture(`<md-checkbox id="terms" checked.bind="accepted">Terms</md-checkbox>`, Terms, [MaterializeBridge]).started;
    const checkbox = view.getBy("#terms input") as HTMLInputElement;

    checkbox.click();
    expect(view.component.accepted).toBe(true);

    view.component.accepted = false;
    await vi.waitFor(() => expect(checkbox.checked).toBe(false));
  });

  it("adds and removes its model in a shared array", async () =>
  {
    const html = `<md-checkbox id="red" model="red" checked.bind="colours">Red</md-checkbox>
                  <md-checkbox id="blue" model="blue" checked.bind="colours">Blue</md-checkbox>`;
    const view = await createFixture(html, Terms, [MaterializeBridge]).started;
    const red = view.getBy("#red input") as HTMLInputElement;
    const blue = view.getBy("#blue input") as HTMLInputElement;

    expect(red.checked).toBe(true);
    expect(blue.checked).toBe(false);

    blue.click();
    expect(view.component.colours).toEqual(["red", "blue"]);

    red.click();
    expect(view.component.colours).toEqual(["blue"]);
  });

  it("shows null as indeterminate", async () =>
  {
    const view = await createFixture(`<md-checkbox id="terms" checked.bind="accepted">Terms</md-checkbox>`, Terms, [MaterializeBridge]).started;
    const checkbox = view.getBy("#terms input") as HTMLInputElement;

    expect(checkbox.indeterminate).toBe(false);

    view.component.accepted = null;
    await vi.waitFor(() => expect(checkbox.indeterminate).toBe(true));
  });

  it("does not change when read-only", async () =>
  {
    const view = await createFixture(`<md-checkbox id="terms" checked.bind="accepted" readonly.bind="isReadonly">Terms</md-checkbox>`, Terms, [MaterializeBridge]).started;
    const checkbox = view.getBy("#terms input") as HTMLInputElement;

    view.component.isReadonly = true;
    await vi.waitFor(() => { checkbox.click(); expect(checkbox.checked).toBe(false); });
    expect(view.component.accepted).toBe(false);
  });

  it("disables the checkbox", async () =>
  {
    const view = await createFixture(`<md-checkbox id="terms" checked.bind="accepted" disabled>Terms</md-checkbox>`, Terms, [MaterializeBridge]).started;

    expect((view.getBy("#terms input") as HTMLInputElement).disabled).toBe(true);
  });

  it("shows its validation error under the label and marks itself invalid until corrected", async () =>
  {
    class Contract { public accepted: boolean = false; }
    class ContractForm
    {
      private readonly validationController = resolve(newInstanceForScope(IValidationController));
      public contract: Contract = new Contract();

      public constructor()
      {
        const rules = resolve(IValidationRules);
        rules.off(Contract);
        rules.on(Contract).ensure("accepted").satisfies((value: boolean) => value).withMessage("The terms must be accepted.");
      }

      public async save(): Promise<void>
      {
        await this.validationController.validate();
      }
    }
    const Validation = ValidationHtmlConfiguration.customize(options => { options.DefaultTrigger = ValidationTrigger.manual; });
    const html = `<md-checkbox id="terms" checked.bind="contract.accepted & validate">Terms</md-checkbox>
                  <button id="save" click.trigger="save()">Save</button>`;
    const view = await createFixture(html, ContractForm, [MaterializeBridge, MaterializeBridgeValidation, Validation]).started;

    view.trigger.click("#save");
    await vi.waitFor(() => view.assertText("#terms > p.error-text", "The terms must be accepted."));
    expect(view.getBy("#terms")?.classList.contains("invalid")).toBe(true);

    (view.getBy("#terms input") as HTMLInputElement).click();
    view.trigger.click("#save");
    await vi.waitFor(() => expect(view.getBy("#terms")?.classList.contains("invalid")).toBe(false));
  });
});
