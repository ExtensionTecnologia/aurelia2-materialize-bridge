import { describe, expect, it } from "vitest";
import { newInstanceForScope, resolve } from "aurelia";
import { createFixture } from "@aurelia/testing";
import { IValidationRules } from "@aurelia/validation";
import { IValidationController, ValidationHtmlConfiguration, ValidationTrigger } from "@aurelia/validation-html";
import { MaterializeBridge } from "../index";
import { MaterializeBridgeValidation } from "../validation/index";

class Request
{
  public attachments: File[] | null = [];
}

// A form as a consuming system would write it.
class RequestForm
{
  private readonly validationController = resolve(newInstanceForScope(IValidationController));

  public request: Request = new Request();
  public isDisabled: boolean = false;
  public isReadonly: boolean = false;
  public chosen: File[][] = [];

  public constructor()
  {
    const rules = resolve(IValidationRules);
    rules.off(Request);
    rules.on(Request).ensure("attachments").satisfies(files => files != null && files.length > 0).withMessage("Attach a file.");
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

const html = `<md-file id="attachments" label="Attachments" caption="Choose" files.bind="request.attachments & validate" multiple accept=".pdf"
  disabled.bind="isDisabled" readonly.bind="isReadonly" md-on-change.trigger="chosen.push($event.detail.files)"></md-file>`;

async function start()
{
  return createFixture(html, RequestForm, [MaterializeBridge, MaterializeBridgeValidation, Validation]).started;
}

type View = Awaited<ReturnType<typeof start>>;

function fileInput(view: View): HTMLInputElement
{
  return view.getBy("#attachments input[type=file]") as HTMLInputElement;
}

// What the browser does when the user chooses files: jsdom cannot open its window, so the files are put in place.
function choose(view: View, ...names: string[]): File[]
{
  const files = names.map(name => new File(["content"], name, { type: "application/pdf" }));
  Object.defineProperty(fileInput(view), "files", { value: files, configurable: true });
  fileInput(view).dispatchEvent(new Event("change", { bubbles: true }));
  return files;
}

describe("md-file", () =>
{
  it("renders a button with its caption beside the outlined box with the label", async () =>
  {
    const view = await start();

    view.assertText("#attachments .file-field .btn span", "Choose");
    view.assertText("#attachments fieldset.form-field legend", "Attachments");
    expect(fileInput(view).getAttribute("aria-label")).toBe("Attachments");
    expect(fileInput(view).multiple).toBe(true);
    expect(fileInput(view).getAttribute("accept")).toBe(".pdf");
  });

  it("gives the chosen files to the binding, shows their names and announces the choice", async () =>
  {
    const view = await start();

    const files = choose(view, "contract.pdf", "id.pdf");

    expect(view.component.request.attachments).toEqual(files);
    await Promise.resolve();
    view.assertValue("#attachments input.file-path", "contract.pdf, id.pdf");
    expect(view.component.chosen).toEqual([files]);
  });

  it("clears the choice when the code sets no files, without announcing it", async () =>
  {
    const view = await start();
    choose(view, "contract.pdf");
    fileInput(view).value = "";

    view.component.request.attachments = null;
    await Promise.resolve();

    view.assertValue("#attachments input.file-path", "");
    expect(fileInput(view).value).toBe("");
    expect(view.component.chosen.length).toBe(1);
  });

  it("shows the names of files set from code", async () =>
  {
    const view = await start();

    view.component.request.attachments = [new File([""], "report.pdf")];
    await Promise.resolve();

    view.assertValue("#attachments input.file-path", "report.pdf");
  });

  it("disables the button and the box", async () =>
  {
    const view = await start();

    view.component.isDisabled = true;
    await Promise.resolve();

    expect(fileInput(view).disabled).toBe(true);
    expect(view.getBy("#attachments .btn")?.classList.contains("disabled")).toBe(true);
    expect((view.getBy("#attachments fieldset") as HTMLFieldSetElement).disabled).toBe(true);
  });

  it("when read-only, keeps the names and the look but lets nothing be chosen", async () =>
  {
    const view = await start();
    choose(view, "contract.pdf");

    view.component.isReadonly = true;
    await Promise.resolve();

    expect(fileInput(view).disabled).toBe(true);
    expect(view.getBy("#attachments .btn")?.classList.contains("disabled")).toBe(false);
    expect((view.getBy("#attachments fieldset") as HTMLFieldSetElement).disabled).toBe(false);
    view.assertValue("#attachments input.file-path", "contract.pdf");
  });

  it("shows its own validation message, and drops it when a file is chosen", async () =>
  {
    const view = await start();

    await view.component.save();
    await Promise.resolve();
    view.assertText("#attachments p.error-text", "Attach a file.");
    expect(view.getBy("#attachments")?.classList.contains("invalid")).toBe(true);

    choose(view, "contract.pdf");
    await view.component.save();
    await Promise.resolve();
    expect(view.queryBy("#attachments p.error-text")).toBeNull();
  });
});
