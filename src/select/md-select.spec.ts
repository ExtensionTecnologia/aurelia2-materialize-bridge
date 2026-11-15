import { afterEach, describe, expect, it, vi } from "vitest";
import { newInstanceForScope, resolve } from "aurelia";
import { createFixture } from "@aurelia/testing";
import { IValidationRules } from "@aurelia/validation";
import { IValidationController, ValidationHtmlConfiguration, ValidationTrigger } from "@aurelia/validation-html";
import * as M from "@materializecss/materialize";
import { MaterializeBridge } from "../index";
import { MaterializeBridgeValidation } from "../validation/index";

// The Materialize widget itself needs a real browser (it is checked in the demo app). Here it is
// replaced by a stand-in, and the tests check when the bridge builds and destroys it.
function fakeFormSelect()
{
  const widgets: { wrapper: HTMLDivElement, destroy: ReturnType<typeof vi.fn>, dropdown: { open: ReturnType<typeof vi.fn> } }[] = [];

  const init = vi.spyOn(M.FormSelect, "init").mockImplementation((() =>
  {
    const widget = { wrapper: document.createElement("div"), destroy: vi.fn(), dropdown: { open: vi.fn() } };
    widgets.push(widget);
    return widget;
  }) as never);

  return { init, widgets };
}

class Address
{
  public state: string = "";
}

class AddressForm
{
  private readonly validationController = resolve(newInstanceForScope(IValidationController));

  public address: Address = new Address();
  public states: string[] = ["SP", "RJ"];
  public isVisible: boolean = true;
  public isDisabled: boolean = false;
  public isReadonly: boolean = false;
  public label: string = "State";

  public constructor()
  {
    const rules = resolve(IValidationRules);
    rules.off(Address);
    rules.on(Address).ensure("state").required().withMessage("State is required.");
  }

  public async save(): Promise<void>
  {
    await this.validationController.validate();
  }
}

const Validation = ValidationHtmlConfiguration.customize(options =>
{
  options.DefaultTrigger = ValidationTrigger.manual;
});

const formHtml = `
  <section id="form">
    <select if.bind="isVisible" id="state" md-select="label.bind: label; disabled.bind: isDisabled; readonly.bind: isReadonly" value.bind="address.state & validate">
      <option value="">Choose</option>
      <option repeat.for="state of states" value.bind="state">\${state}</option>
    </select>
  </section>
  <button id="save" click.trigger="save()">Save</button>`;

const dependencies = [MaterializeBridge, MaterializeBridgeValidation, Validation];

// Mounts the form and waits until the widget has been built from the complete <select>
// (the repeated options arrive just after the select itself).
async function createForm()
{
  const view = await createFixture(formHtml, AddressForm, dependencies).started;
  await settle();
  return view;
}

function settle(): Promise<void>
{
  return new Promise(resolvePromise => setTimeout(resolvePromise, 60));
}

describe("md-select", () =>
{
  afterEach(() => vi.restoreAllMocks());

  it("puts the select in a Material Design 3 outlined field and builds the widget", async () =>
  {
    const { init } = fakeFormSelect();
    const view = await createForm();

    view.assertText("#form > div.md-select > fieldset.form-field > legend", "State");
    expect(view.getBy("#form fieldset.form-field select#state")?.getAttribute("aria-label")).toBe("State");
    expect(init).toHaveBeenCalled();
    expect(init.mock.lastCall?.[0]).toBe(view.getBy("#state"));
  });

  it("keeps the native binding of the value", async () =>
  {
    fakeFormSelect();
    const view = await createForm();
    const select = view.getBy("#state") as HTMLSelectElement;

    select.value = "RJ";
    select.dispatchEvent(new Event("change", { bubbles: true }));

    expect(view.component.address.state).toBe("RJ");
  });

  it("rebuilds the widget when the value changes from code", async () =>
  {
    const { init, widgets } = fakeFormSelect();
    const view = await createForm();
    const builds = init.mock.calls.length;
    const widget = widgets[widgets.length - 1];

    view.component.address.state = "SP";

    await vi.waitFor(() => expect(init).toHaveBeenCalledTimes(builds + 1));
    expect(widget.destroy).toHaveBeenCalledOnce();
  });

  it("rebuilds the widget when the options change", async () =>
  {
    const { init } = fakeFormSelect();
    const view = await createForm();
    const builds = init.mock.calls.length;

    view.component.states.push("MG");

    await vi.waitFor(() => expect(init).toHaveBeenCalledTimes(builds + 1));
  });

  it("does not rebuild the widget when the user chooses in it", async () =>
  {
    const { init } = fakeFormSelect();
    const view = await createForm();
    const select = view.getBy("#state") as HTMLSelectElement;
    const builds = init.mock.calls.length;

    select.value = "RJ";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    await settle();

    expect(init).toHaveBeenCalledTimes(builds);
  });

  it("updates the label", async () =>
  {
    fakeFormSelect();
    const view = await createForm();

    view.component.label = "Province";

    await vi.waitFor(() => view.assertText("#form legend", "Province"));
  });

  it("disables the select, its box and the widget", async () =>
  {
    const { init } = fakeFormSelect();
    const view = await createForm();
    const builds = init.mock.calls.length;

    view.component.isDisabled = true;

    await vi.waitFor(() => expect(init).toHaveBeenCalledTimes(builds + 1));
    expect((view.getBy("#state") as HTMLSelectElement).disabled).toBe(true);
    expect((view.getBy("#form fieldset") as HTMLFieldSetElement).disabled).toBe(true);
  });

  it("blocks the widget when read-only", async () =>
  {
    const { widgets } = fakeFormSelect();
    const view = await createForm();

    view.component.isReadonly = true;

    await vi.waitFor(() => expect(widgets[widgets.length - 1].wrapper.inert).toBe(true));
  });

  it("shows its validation error under the box and removes it when corrected", async () =>
  {
    fakeFormSelect();
    const view = await createForm();

    view.trigger.click("#save");
    await vi.waitFor(() => view.assertText("#form > div.md-select > p.error-text", "State is required."));
    expect(view.queryBy("#form fieldset p")).toBeNull();
    expect(view.getBy("#form > div.md-select")?.classList.contains("invalid")).toBe(true);

    view.component.address.state = "SP";
    view.trigger.click("#save");
    await vi.waitFor(() => expect(view.queryBy("#form p.error-text")).toBeNull());
    expect(view.getBy("#form > div.md-select")?.classList.contains("invalid")).toBe(false);
  });

  it("destroys the widget and leaves nothing behind when the select is removed", async () =>
  {
    const { widgets } = fakeFormSelect();
    const view = await createForm();
    const widget = widgets[widgets.length - 1];

    view.component.isVisible = false;

    await vi.waitFor(() => expect(view.queryBy("#state")).toBeNull());
    expect(widget.destroy).toHaveBeenCalledOnce();
    expect(view.queryBy("#form div.md-select")).toBeNull();
    expect(view.queryBy("#form fieldset")).toBeNull();
  });

  it("leaves a browser-default select native", async () =>
  {
    const { init } = fakeFormSelect();
    const view = await createFixture(`<section id="form"><select id="state" class="browser-default" md-select="label: State"></select></section>`, class {}, dependencies).started;

    expect(init).not.toHaveBeenCalled();
    expect(view.queryBy("#form fieldset")).toBeNull();
  });
});
