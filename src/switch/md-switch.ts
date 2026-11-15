import { bindable, BindingMode, INode, resolve } from "aurelia";
import { booleanAttribute } from "../common/boolean-attribute";
import { FieldErrors } from "../common/field-errors";
import { fireEvent } from "../common/fire-event";

export class MdSwitch
{
  private readonly host = resolve(INode) as HTMLElement;

  // Validation messages of this field, shown under the switch.
  public readonly fieldErrors = new FieldErrors();

  @bindable({ mode: BindingMode.twoWay, set: booleanAttribute }) public checked: boolean = false;
  @bindable public labelOff: string = "Off";
  @bindable public labelOn: string = "On";
  @bindable({ set: booleanAttribute }) public disabled: boolean = false;
  @bindable({ set: booleanAttribute }) public readonly: boolean = false;

  public binding(): void
  {
    this.fieldErrors.start();
  }

  public unbinding(): void
  {
    this.fieldErrors.stop();
  }

  // A read-only switch keeps its state when clicked.
  public onClick(event: Event): void
  {
    if (this.readonly)
      event.preventDefault();
  }

  public onBlur(): void
  {
    fireEvent(this.host, "blur");
  }
}
