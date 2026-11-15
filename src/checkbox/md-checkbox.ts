import { bindable, BindingMode } from "aurelia";
import { booleanAttribute } from "../common/boolean-attribute";
import { FieldErrors } from "../common/field-errors";

export class MdCheckbox
{
  public checkbox!: HTMLInputElement;

  // Validation messages of this field, shown under the checkbox.
  public readonly fieldErrors = new FieldErrors();

  // true/false for a single checkbox; an array when several checkboxes share it (each adds its model).
  // null shows the checkbox as indeterminate.
  @bindable({ mode: BindingMode.twoWay }) public checked: boolean | unknown[] | null = false;
  @bindable public model: unknown;
  @bindable public matcher: ((a: unknown, b: unknown) => boolean) | undefined;
  @bindable({ set: booleanAttribute }) public disabled: boolean = false;
  @bindable({ set: booleanAttribute }) public readonly: boolean = false;

  public binding(): void
  {
    this.fieldErrors.start();
  }

  public attached(): void
  {
    this.checkbox.indeterminate = this.checked === null;
  }

  public unbinding(): void
  {
    this.fieldErrors.stop();
  }

  public checkedChanged(): void
  {
    if (this.checkbox != null)
      this.checkbox.indeterminate = this.checked === null;
  }

  // A read-only checkbox keeps its state when clicked.
  public onClick(event: Event): void
  {
    if (this.readonly)
      event.preventDefault();
  }
}
