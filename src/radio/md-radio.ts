import { bindable, BindingMode } from "aurelia";
import { booleanAttribute } from "../common/boolean-attribute";

export class MdRadio
{
  // The value (or model) of the radio chosen in the group.
  @bindable({ mode: BindingMode.twoWay }) public checked: unknown;
  @bindable public name: string | null = null;
  @bindable public value: string = "";
  // Use model instead of value when the choice is not a string (an object, a number, a boolean).
  @bindable public model: unknown;
  @bindable({ set: booleanAttribute }) public gap: boolean = false;
  @bindable({ set: booleanAttribute }) public disabled: boolean = false;
  @bindable({ set: booleanAttribute }) public readonly: boolean = false;

  // A read-only radio keeps its state when clicked.
  public onClick(event: Event): void
  {
    if (this.readonly)
      event.preventDefault();
  }
}
