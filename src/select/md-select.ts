import { bindable, customAttribute, INode, optional, resolve } from "aurelia";
import * as M from "@materializecss/materialize";
import { booleanAttribute } from "../common/boolean-attribute";
import { IFieldErrorSource } from "../common/field-error-source";
import { type FormSelectOptions } from "../common/materialize-options";
import "./md-select.css";

// Turns a native <select> into the Materialize select, inside a Material Design 3 outlined field:
//   <select md-select="label: State" value.bind="person.state"> ... </select>
@customAttribute("md-select")
export class MdSelect
{
  private readonly select = resolve(INode) as HTMLSelectElement;
  private readonly errorSource = resolve(optional(IFieldErrorSource));
  private stopWatchingErrors: (() => void) | null = null;

  // Built around the <select> in attached(): div.md-select > fieldset.form-field > legend + select, then the errors.
  private wrapper: HTMLDivElement | null = null;
  private fieldset: HTMLFieldSetElement | null = null;
  private legend: HTMLLegendElement | null = null;

  private instance: M.FormSelect | null = null;
  // Which options were selected when the widget was last built or used; see readSelection().
  private selection: string = "";
  private selectionCheck: number = 0;
  // Rebuilds the widget when the options, or the disabled state, of the <select> change.
  private readonly optionsObserver = new MutationObserver(() => this.createWidget());

  @bindable public label: string = "";
  @bindable({ set: booleanAttribute }) public disabled: boolean = false;
  @bindable({ set: booleanAttribute }) public readonly: boolean = false;
  @bindable({ set: booleanAttribute }) public showErrortext: boolean = true;
  @bindable public dropdownOptions: FormSelectOptions["dropdownOptions"] = {};

  public attached(): void
  {
    // A select marked browser-default stays native, as in Materialize itself.
    if (this.select.classList.contains("browser-default"))
      return;

    this.wrapSelect();
    if (this.disabled)
      this.select.disabled = true;
    this.createWidget();

    this.select.addEventListener("change", this.rememberSelection);
    this.selectionCheck = window.requestAnimationFrame(this.checkSelection);

    if (this.errorSource != null)
      this.stopWatchingErrors = this.errorSource.watch(this.select, messages => this.showErrors(messages));
  }

  public detaching(): void
  {
    if (this.wrapper == null)
      return;

    this.stopWatchingErrors?.();
    this.stopWatchingErrors = null;
    window.cancelAnimationFrame(this.selectionCheck);
    this.optionsObserver.disconnect();
    this.select.removeEventListener("change", this.rememberSelection);
    this.instance?.destroy();
    this.instance = null;

    // Puts the <select> back where Aurelia rendered it, so Aurelia can remove it.
    this.wrapper.replaceWith(this.select);
    this.wrapper = null;
    this.fieldset = null;
    this.legend = null;
  }

  public labelChanged(): void
  {
    if (this.legend == null)
      return;

    this.legend.textContent = this.label;
    this.select.setAttribute("aria-label", this.label);
  }

  public disabledChanged(): void
  {
    // optionsObserver sees the change and rebuilds the widget.
    this.select.disabled = this.disabled;
  }

  public readonlyChanged(): void
  {
    if (this.instance != null)
      this.instance.wrapper.inert = this.readonly;
  }

  // Opens the list of options.
  public open(): void
  {
    this.instance?.dropdown.open();
  }

  // Rebuilds the widget from the <select>. Normally not needed: changes are noticed by themselves.
  public refresh(): void
  {
    if (this.wrapper != null)
      this.createWidget();
  }

  private wrapSelect(): void
  {
    this.wrapper = document.createElement("div");
    this.wrapper.classList.add("md-select");
    this.fieldset = document.createElement("fieldset");
    this.fieldset.classList.add("form-field");
    this.legend = document.createElement("legend");
    this.legend.textContent = this.label;

    this.select.replaceWith(this.wrapper);
    this.fieldset.append(this.legend, this.select);
    this.wrapper.append(this.fieldset);
    this.select.setAttribute("aria-label", this.label);
  }

  private createWidget(): void
  {
    // Not observed while Materialize works on the <select>, or its own changes would rebuild the widget again.
    this.optionsObserver.disconnect();

    this.instance?.destroy();
    this.instance = M.FormSelect.init(this.select, { dropdownOptions: this.dropdownOptions });
    this.instance.wrapper.inert = this.readonly;
    if (this.fieldset != null)
      this.fieldset.disabled = this.select.disabled;
    this.selection = this.readSelection();

    this.optionsObserver.observe(this.select, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["disabled", "value", "label"] });
  }

  // The positions of the selected options. Cheap to read, because it runs on every frame.
  private readSelection(): string
  {
    if (!this.select.multiple)
      return String(this.select.selectedIndex);

    return Array.from(this.select.selectedOptions, option => option.index).join(",");
  }

  // The user chose in the widget, which already shows the choice: nothing to rebuild.
  private rememberSelection = (): void =>
  {
    this.selection = this.readSelection();
  };

  // Neither Aurelia nor the browser announces a selection changed from code (a bound value),
  // so the selection is compared with what the widget shows once per frame.
  private checkSelection = (): void =>
  {
    if (this.readSelection() != this.selection)
      this.createWidget();

    this.selectionCheck = window.requestAnimationFrame(this.checkSelection);
  };

  // Validation messages go under the outlined box, outside the fieldset.
  private showErrors(messages: string[]): void
  {
    if (this.wrapper == null)
      return;

    // md-select.css draws the Material Design 3 error state from this class.
    this.wrapper.classList.toggle("invalid", messages.length > 0);
    this.wrapper.querySelectorAll(":scope > p.error-text").forEach(message => message.remove());
    if (!this.showErrortext)
      return;

    for (const message of messages)
    {
      const paragraph = document.createElement("p");
      paragraph.classList.add("label-medium", "error-text", "m-0");
      paragraph.textContent = message;
      this.wrapper.append(paragraph);
    }
  }
}
