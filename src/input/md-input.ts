import { bindable, BindingMode, INode, resolve } from "aurelia";
import { booleanAttribute } from "../common/boolean-attribute";
import { FieldErrors } from "../common/field-errors";
import { fireEvent } from "../common/fire-event";

export class MdInput
{
  private readonly host = resolve(INode) as HTMLElement;

  // The <input>, or the <textarea> when text-area is set.
  public input!: HTMLInputElement | HTMLTextAreaElement;

  // Validation messages of this field, shown under the outlined box.
  public readonly fieldErrors = new FieldErrors();

  @bindable public label: string = "";
  @bindable({ mode: BindingMode.twoWay }) public value: string = "";
  @bindable public type: string = "text";
  @bindable public name: string | null = null;
  @bindable public placeholder: string | null = null;
  @bindable public autocomplete: string | null = null;
  @bindable public min: string | null = null;
  @bindable public max: string | null = null;
  @bindable public step: string = "any";
  @bindable public maxlength: number | null = null;
  @bindable({ set: booleanAttribute }) public disabled: boolean = false;
  @bindable({ set: booleanAttribute }) public readonly: boolean = false;
  @bindable({ set: booleanAttribute }) public textArea: boolean = false;
  @bindable({ set: booleanAttribute }) public blurOnEnter: boolean = false;
  @bindable({ set: booleanAttribute }) public showErrortext: boolean = true;
  // Lets the field sit in a line of text or beside other fields, instead of taking the whole width.
  @bindable({ set: booleanAttribute }) public inline: boolean = false;

  public binding(): void
  {
    this.inlineChanged();
    this.fieldErrors.start();
  }

  public unbinding(): void
  {
    this.fieldErrors.stop();
  }

  public inlineChanged(): void
  {
    this.host.classList.toggle("inline", this.inline);
  }

  public focus(): void
  {
    this.input.focus();
  }

  public onFocus(): void
  {
    fireEvent(this.host, "focus");
  }

  public onBlur(): void
  {
    fireEvent(this.host, "blur");
  }

  public onKeyup(event: KeyboardEvent): void
  {
    if (this.blurOnEnter && event.key == "Enter")
      this.input.blur();
  }
}
