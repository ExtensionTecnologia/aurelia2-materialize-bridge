import { bindable, BindingMode, INode, resolve } from "aurelia";
import * as M from "@materializecss/materialize";
import { booleanAttribute, optionalBoolean, optionalNumber } from "../common/boolean-attribute";
import { FieldErrors } from "../common/field-errors";
import { fireEvent, fireMaterializeEvent } from "../common/fire-event";
import { givenOptions, type TimepickerOptions } from "../common/materialize-options";
import { IMaterializeBridgeOptions } from "../configuration";
import "../common/picker-modal.css";

export class MdTimepicker
{
  private readonly host = resolve(INode) as HTMLElement;
  private readonly bridgeOptions = resolve(IMaterializeBridgeOptions);
  private instance: M.Timepicker | null = null;

  public input!: HTMLInputElement;

  // Validation messages of this field, shown under the outlined box.
  public readonly fieldErrors = new FieldErrors();

  // The time as the picker writes it: "14:30", or "02:30 PM" with twelve-hour.
  @bindable({ mode: BindingMode.twoWay }) public value: string = "";
  @bindable public label: string = "";
  @bindable public placeholder: string | null = null;
  @bindable({ set: booleanAttribute }) public disabled: boolean = false;
  @bindable({ set: booleanAttribute }) public inline: boolean = false;
  @bindable({ set: booleanAttribute }) public showErrortext: boolean = true;

  // Options of the Materialize timepicker, read once when the component is attached.
  // The ones not given come from MaterializeBridge.customize(), then from Materialize.
  @bindable public duration: number | undefined;
  @bindable public container: HTMLElement | string | undefined;
  @bindable public showClearBtn: boolean | undefined;
  @bindable public defaultTime: string | undefined;
  @bindable public fromNow: number | undefined;
  @bindable public i18n: TimepickerOptions["i18n"];
  @bindable public twelveHour: boolean | undefined;
  @bindable public vibrate: boolean | undefined;
  // true: choosing the minutes closes the picker. false: the picker has Ok and Cancel buttons.
  @bindable public autoClose: boolean | undefined;

  public binding(): void
  {
    this.inlineChanged();
    this.fieldErrors.start();
  }

  public attached(): void
  {
    this.createWidget();
    this.input.addEventListener("change", this.onWidgetChange);
  }

  // Builds the picker from the bound time. Materialize reads the time of the field only when the picker
  // is built, so it is built again whenever the time changes from code.
  private createWidget(): void
  {
    this.destroyWidget();
    this.input.value = this.value ?? "";

    this.instance = M.Timepicker.init(this.input, {
      ...this.bridgeOptions.timepicker,
      ...givenOptions<TimepickerOptions>({
        duration: optionalNumber(this.duration),
        container: this.container,
        showClearBtn: optionalBoolean(this.showClearBtn),
        defaultTime: this.defaultTime,
        fromNow: optionalNumber(this.fromNow),
        i18n: this.i18n,
        twelveHour: optionalBoolean(this.twelveHour),
        vibrate: optionalBoolean(this.vibrate),
        autoSubmit: optionalBoolean(this.autoClose) as true | undefined
      }),
      onSelect: (hour, minute) => fireMaterializeEvent(this.host, "select", { hour, minute })
    });
  }

  private destroyWidget(): void
  {
    // Materialize's destroy() leaves the picker's dialog in the page.
    this.instance?.containerEl.closest("dialog")?.remove();
    this.instance?.destroy();
    this.instance = null;
  }

  public detaching(): void
  {
    this.input.removeEventListener("change", this.onWidgetChange);
    this.destroyWidget();
  }

  public unbinding(): void
  {
    this.fieldErrors.stop();
  }

  public valueChanged(): void
  {
    // Nothing to do when the change is the picker's own, already shown in the field.
    if (this.instance != null && this.input.value != (this.value ?? ""))
      this.createWidget();
  }

  public inlineChanged(): void
  {
    this.host.classList.toggle("inline", this.inline);
  }

  // Opens the picker.
  public open(): void
  {
    this.input.click();
  }

  // The user confirmed (or cleared) a time in the picker.
  private onWidgetChange = (event: Event): void =>
  {
    // The widget's own event stops here; the component announces the change after updating its value.
    event.stopPropagation();

    this.value = this.input.value;

    fireEvent(this.host, "change");
    fireEvent(this.host, "blur");
  };
}
