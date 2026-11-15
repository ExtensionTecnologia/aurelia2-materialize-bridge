import { bindable, customAttribute, INode, resolve } from "aurelia";
import { booleanAttribute } from "../common/boolean-attribute";

// Gives a button or link the Materialize button classes: <button md-button="flat: true; disabled.bind: isBusy">
// The Material Design 3 variants are plain classes you add yourself: filled, tonal, outlined, elevated.
@customAttribute("md-button")
export class MdButton
{
  private readonly button = resolve(INode) as HTMLElement;

  @bindable({ set: booleanAttribute }) public disabled: boolean = false;
  // A text button, without background.
  @bindable({ set: booleanAttribute }) public flat: boolean = false;
  @bindable({ set: booleanAttribute }) public floating: boolean = false;
  @bindable({ set: booleanAttribute }) public large: boolean = false;
  @bindable({ set: booleanAttribute }) public small: boolean = false;
  @bindable({ set: booleanAttribute }) public pulse: boolean = false;

  public attached(): void
  {
    this.button.classList.add("btn", "waves-effect");
    this.button.classList.toggle("btn-floating", this.floating);
    this.button.classList.toggle("btn-large", this.large);
    this.button.classList.toggle("btn-small", this.small);
    this.flatChanged();
    this.disabledChanged();
    this.pulseChanged();
  }

  public detaching(): void
  {
    this.button.classList.remove("btn", "btn-flat", "btn-floating", "btn-large", "btn-small", "disabled", "pulse", "waves-effect");
  }

  public flatChanged(): void
  {
    this.button.classList.toggle("btn-flat", this.flat);
  }

  public pulseChanged(): void
  {
    this.button.classList.toggle("pulse", this.pulse);
  }

  public disabledChanged(): void
  {
    this.button.classList.toggle("disabled", this.disabled);
    // A link has no disabled state of its own; a real button does, and it also stops the keyboard.
    if (this.button instanceof HTMLButtonElement)
      this.button.disabled = this.disabled;
  }
}
