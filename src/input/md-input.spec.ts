import { describe, expect, it, vi } from "vitest";
import { newInstanceForScope, resolve } from "aurelia";
import { createFixture } from "@aurelia/testing";
import { IValidationRules } from "@aurelia/validation";
import { IValidationController, ValidationHtmlConfiguration, ValidationTrigger } from "@aurelia/validation-html";
import { MaterializeBridge } from "../index";
import { MaterializeBridgeValidation } from "../validation/index";

class Person
{
  public name: string = "";
}

// A form as a consuming system would write it: no error markup, no error arrays.
class PersonForm
{
  private readonly validationController = resolve(newInstanceForScope(IValidationController));

  public person: Person = new Person();
  public isDisabled: boolean = false;

  public constructor()
  {
    const rules = resolve(IValidationRules);
    rules.off(Person);
    rules.on(Person).ensure("name").required().withMessage("Name is required.");
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
  <md-input id="person-name" label="Name" value.bind="person.name & validate" disabled.bind="isDisabled"></md-input>
  <button id="save" click.trigger="save()">Save</button>`;

describe("md-input", () =>
{
  it("renders the Material Design 3 outlined field with its label", async () =>
  {
    const view = await createFixture(formHtml, PersonForm, [MaterializeBridge, Validation]).started;

    view.assertText("#person-name fieldset.form-field legend", "Name");
    expect(view.getBy("#person-name input")?.getAttribute("aria-label")).toBe("Name");
  });

  it("binds the value both ways", async () =>
  {
    const view = await createFixture(formHtml, PersonForm, [MaterializeBridge, Validation]).started;

    view.type("#person-name input", "Ana");
    expect(view.component.person.name).toBe("Ana");

    view.component.person.name = "Bruno";
    await vi.waitFor(() => view.assertValue("#person-name input", "Bruno"));
  });

  it("disables the field and its box", async () =>
  {
    const view = await createFixture(formHtml, PersonForm, [MaterializeBridge, Validation]).started;

    view.component.isDisabled = true;

    await vi.waitFor(() => expect(view.getBy("#person-name input")?.hasAttribute("disabled")).toBe(true));
    expect(view.getBy("#person-name fieldset")?.hasAttribute("disabled")).toBe(true);
  });

  it("accepts disabled as a bare attribute", async () =>
  {
    const view = await createFixture(`<md-input id="code" label="Code" disabled></md-input>`, class {}, [MaterializeBridge]).started;

    expect(view.getBy("#code input")?.hasAttribute("disabled")).toBe(true);
  });

  it("shows its own validation error under the box, outside the fieldset", async () =>
  {
    const view = await createFixture(formHtml, PersonForm, [MaterializeBridge, MaterializeBridgeValidation, Validation]).started;

    view.trigger.click("#save");

    await vi.waitFor(() => view.assertText("#person-name > p.error-text", "Name is required."));
    expect(view.queryBy("#person-name fieldset p")).toBeNull();
    expect(view.getBy("#person-name")?.classList.contains("invalid")).toBe(true);
  });

  it("removes the error once the field is corrected and validated again", async () =>
  {
    const view = await createFixture(formHtml, PersonForm, [MaterializeBridge, MaterializeBridgeValidation, Validation]).started;

    view.trigger.click("#save");
    await vi.waitFor(() => view.getBy("#person-name > p.error-text"));

    view.type("#person-name input", "Ana");
    view.trigger.click("#save");

    await vi.waitFor(() => expect(view.queryBy("#person-name > p.error-text")).toBeNull());
    expect(view.getBy("#person-name")?.classList.contains("invalid")).toBe(false);
  });

  it("shows only its own error when the form has several fields", async () =>
  {
    const twoFields = formHtml + `<md-input id="person-nickname" label="Nickname" value.bind="nickname"></md-input>`;
    const view = await createFixture(twoFields, PersonForm, [MaterializeBridge, MaterializeBridgeValidation, Validation]).started;

    view.trigger.click("#save");

    await vi.waitFor(() => view.getBy("#person-name > p.error-text"));
    expect(view.queryBy("#person-nickname > p.error-text")).toBeNull();
  });

  it("works without the validation registration, showing no error", async () =>
  {
    const view = await createFixture(formHtml, PersonForm, [MaterializeBridge, Validation]).started;

    view.trigger.click("#save");
    await new Promise(resolvePromise => setTimeout(resolvePromise, 50));

    expect(view.queryBy("#person-name > p.error-text")).toBeNull();
  });
});

describe("md-input attributes", () =>
{
  it("passes the native attributes to the input and leaves out the ones not given", async () =>
  {
    const html = `<md-input id="age" label="Age" type="number" min="0" max="120" placeholder="Years" name="age" autocomplete="off" maxlength="3"></md-input>`;
    const view = await createFixture(html, class {}, [MaterializeBridge]).started;
    const input = view.getBy("#age input");

    expect(input?.getAttribute("type")).toBe("number");
    expect(input?.getAttribute("min")).toBe("0");
    expect(input?.getAttribute("max")).toBe("120");
    expect(input?.getAttribute("placeholder")).toBe("Years");
    expect(input?.getAttribute("name")).toBe("age");
    expect(input?.getAttribute("autocomplete")).toBe("off");
    expect(input?.getAttribute("maxlength")).toBe("3");

    const plain = await createFixture(`<md-input id="plain" label="Plain"></md-input>`, class {}, [MaterializeBridge]).started;
    expect(plain.getBy("#plain input")?.hasAttribute("min")).toBe(false);
    expect(plain.getBy("#plain input")?.hasAttribute("placeholder")).toBe(false);
    expect(plain.getBy("#plain input")?.hasAttribute("name")).toBe(false);
  });

  it("renders a textarea when text-area is set and binds its value", async () =>
  {
    class Notes { public text: string = "first"; }
    const view = await createFixture(`<md-input id="notes" label="Notes" text-area value.bind="text"></md-input>`, Notes, [MaterializeBridge]).started;

    expect(view.queryBy("#notes input")).toBeNull();
    view.assertValue("#notes fieldset.form-field textarea", "first");

    view.type("#notes textarea", "second");
    expect(view.component.text).toBe("second");
  });

  it("fires blur and focus on the element itself", async () =>
  {
    class Events { public log: string[] = []; }
    const html = `<md-input id="field" label="Field" focus.trigger="log.push('focus')" blur.trigger="log.push('blur')"></md-input>`;
    const view = await createFixture(html, Events, [MaterializeBridge]).started;

    view.trigger("#field input", "focus");
    view.trigger("#field input", "blur");

    expect(view.component.log).toEqual(["focus", "blur"]);
  });

  it("leaves the field on Enter when blur-on-enter is set", async () =>
  {
    const view = await createFixture(`<md-input id="field" label="Field" blur-on-enter></md-input>`, class {}, [MaterializeBridge]).started;
    const input = view.getBy("#field input") as HTMLInputElement;
    const blur = vi.spyOn(input, "blur");

    input.dispatchEvent(new KeyboardEvent("keyup", { key: "a" }));
    expect(blur).not.toHaveBeenCalled();

    input.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter" }));
    expect(blur).toHaveBeenCalledOnce();
  });

  it("takes only the width it needs when inline", async () =>
  {
    class Search { public isInline: boolean = true; }
    const view = await createFixture(`<md-input id="search" label="Search" inline.bind="isInline"></md-input>`, Search, [MaterializeBridge]).started;

    expect(view.getBy("#search")?.classList.contains("inline")).toBe(true);

    view.component.isInline = false;
    await vi.waitFor(() => expect(view.getBy("#search")?.classList.contains("inline")).toBe(false));
  });

  it("works in a component that has no validation controller", async () =>
  {
    const view = await createFixture(`<md-input id="code" label="Code"></md-input>`, class {}, [MaterializeBridge, MaterializeBridgeValidation]).started;

    view.assertText("#code legend", "Code");
  });

  it("hides the validation message when show-errortext is false", async () =>
  {
    const html = `<md-input id="person-name" label="Name" show-errortext.bind="false" value.bind="person.name & validate"></md-input>
                  <button id="save" click.trigger="save()">Save</button>`;
    const view = await createFixture(html, PersonForm, [MaterializeBridge, MaterializeBridgeValidation, Validation]).started;

    view.trigger.click("#save");
    await vi.waitFor(() => expect(view.getBy("#person-name")?.classList.contains("invalid")).toBe(true));

    expect(view.queryBy("#person-name p.error-text")).toBeNull();
  });
});
