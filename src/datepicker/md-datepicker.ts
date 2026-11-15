import { bindable, BindingMode, INode, resolve } from "aurelia";
import * as M from "@materializecss/materialize";
import { booleanAttribute, optionalBoolean, optionalNumber } from "../common/boolean-attribute";
import { FieldErrors } from "../common/field-errors";
import { fireEvent, fireMaterializeEvent } from "../common/fire-event";
import { type DatepickerOptions, givenOptions } from "../common/materialize-options";
import { IMaterializeBridgeOptions } from "../configuration";
import "../common/picker-modal.css";

export class MdDatepicker
{
  private readonly host = resolve(INode) as HTMLElement;
  private readonly bridgeOptions = resolve(IMaterializeBridgeOptions);
  private instance: M.Datepicker | null = null;
  // True while a click on the field is opening the picker; see onOpening().
  private isOpening: boolean = false;

  public input!: HTMLInputElement;

  // Validation messages of this field, shown under the outlined box.
  public readonly fieldErrors = new FieldErrors();

  @bindable({ mode: BindingMode.twoWay }) public value: Date | null = null;
  @bindable public label: string = "";
  @bindable public placeholder: string | null = null;
  @bindable({ set: booleanAttribute }) public disabled: boolean = false;
  @bindable({ set: booleanAttribute }) public inline: boolean = false;
  @bindable({ set: booleanAttribute }) public showErrortext: boolean = true;

  // Options of the Materialize datepicker, read once when the component is attached.
  // The ones not given come from MaterializeBridge.customize(), then from Materialize.
  @bindable public format: DatepickerOptions["format"];
  @bindable public parse: DatepickerOptions["parse"];
  @bindable public defaultDate: Date | undefined;
  @bindable public setDefaultDate: boolean | undefined;
  @bindable public disableWeekends: boolean | undefined;
  @bindable public disableDayFn: DatepickerOptions["disableDayFn"];
  @bindable public firstDay: number | undefined;
  @bindable public minDate: Date | undefined;
  @bindable public maxDate: Date | undefined;
  @bindable public yearRange: number | number[] | undefined;
  @bindable public isRtl: boolean | undefined;
  @bindable public showMonthAfterYear: boolean | undefined;
  @bindable public showDaysInNextAndPreviousMonths: boolean | undefined;
  @bindable public container: HTMLElement | string | undefined;
  @bindable public showClearBtn: boolean | undefined;
  @bindable public i18n: DatepickerOptions["i18n"];
  @bindable public events: string[] | undefined;
  // true: choosing a day closes the picker. false: the picker has Ok and Cancel buttons.
  @bindable public autoClose: boolean | undefined;

  public binding(): void
  {
    this.inlineChanged();
    this.fieldErrors.start();
  }

  public attached(): void
  {
    const options: DatepickerOptions = {
      ...this.bridgeOptions.datepicker,
      ...givenOptions<DatepickerOptions>({
        format: this.format,
        parse: this.parse,
        defaultDate: this.defaultDate,
        setDefaultDate: optionalBoolean(this.setDefaultDate),
        disableWeekends: optionalBoolean(this.disableWeekends),
        disableDayFn: this.disableDayFn,
        firstDay: optionalNumber(this.firstDay),
        minDate: this.minDate,
        maxDate: this.maxDate,
        yearRange: this.yearRange,
        isRTL: optionalBoolean(this.isRtl),
        showMonthAfterYear: optionalBoolean(this.showMonthAfterYear),
        showDaysInNextAndPreviousMonths: optionalBoolean(this.showDaysInNextAndPreviousMonths),
        container: this.container,
        showClearBtn: optionalBoolean(this.showClearBtn),
        i18n: this.i18n,
        events: this.events,
        autoSubmit: optionalBoolean(this.autoClose) as true | undefined
      }),
      onSelect: selectedDate =>
      {
        if (!this.isOpening)
          fireMaterializeEvent(this.host, "select", { selectedDate });
      },
      onDraw: () => fireMaterializeEvent(this.host, "draw")
    };

    this.instance = M.Datepicker.init(this.input, options);
    if (options.displayPlugin == "modal")
      this.addModalButtons(this.instance);

    this.input.addEventListener("change", this.onWidgetChange);
    // On the component's element and in the capture phase, so that it runs before Materialize's own listener.
    this.host.addEventListener("click", this.onOpening, true);
    this.input.addEventListener("click", this.onOpened);
    this.showValueInWidget();
  }

  public detaching(): void
  {
    this.input.removeEventListener("change", this.onWidgetChange);
    this.host.removeEventListener("click", this.onOpening, true);
    this.input.removeEventListener("click", this.onOpened);
    // Materialize's destroy() leaves the picker's dialog in the page.
    this.instance?.containerEl.closest("dialog")?.remove();
    this.instance?.destroy();
    this.instance = null;
  }

  public unbinding(): void
  {
    this.fieldErrors.stop();
  }

  public valueChanged(): void
  {
    this.showValueInWidget();
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

  // Materialize 2.3.3 loses the Clear, Cancel and Ok buttons of the datepicker in the modal display: it
  // creates them in a footer that it then throws away. This creates them again in the footer of the
  // dialog, with the same markup the timepicker gets, calling Materialize's own handlers.
  private addModalButtons(instance: M.Datepicker): void
  {
    const footer = instance.containerEl.closest("dialog")?.querySelector(".modal-footer");
    if (footer == null)
      return;

    const texts = instance.options.i18n;

    if (instance.options.showClearBtn)
      footer.append(this.createButton(texts.clear, "datepicker-clear", instance._handleClearClick));

    if (!instance.options.autoSubmit)
    {
      const confirmation = document.createElement("div");
      confirmation.classList.add("confirmation-btns");
      confirmation.append(
        this.createButton(texts.cancel, "btn-cancel", instance._cancel),
        this.createButton(texts.done, "btn-confirm", instance._confirm));
      footer.append(confirmation);
    }
  }

  private createButton(text: string | undefined, name: string, onClick: () => void): HTMLButtonElement
  {
    const button = document.createElement("button");
    button.type = "button";
    button.classList.add(name, "btn", "waves-effect", "text");
    button.textContent = text ?? "";
    button.addEventListener("click", onClick);
    return button;
  }

  // On opening, Materialize 2.3.3 reads the date back from the text of the field as if it were in the
  // American format, and announces it as selected. With any other format that date is wrong, so the
  // announcement is held back while the picker opens, and the bound date is put back right after.
  private onOpening = (event: Event): void =>
  {
    if (event.target == this.input)
      this.isOpening = true;
  };

  private onOpened = (): void =>
  {
    this.showValueInWidget();
    this.isOpening = false;
  };

  // Shows the bound date in the field and in the calendar.
  private showValueInWidget = (): void =>
  {
    const instance = this.instance;
    if (instance == null)
      return;

    if (this.value == null)
    {
      instance.date = null as unknown as Date;
      this.input.value = "";
      instance.draw();
      return;
    }

    instance.setDate(new Date(this.value), true);
    instance.gotoDate(new Date(this.value));
    this.input.value = instance.toString();
  };

  // The user confirmed (or cleared) a date in the picker.
  private onWidgetChange = (event: Event): void =>
  {
    const instance = this.instance;
    if (instance == null)
      return;

    // The widget's own event stops here; the component announces the change after updating its value.
    event.stopPropagation();

    const date = instance.date == null ? null : new Date(instance.date);
    if (date?.getTime() != this.value?.getTime())
      this.value = date;

    fireEvent(this.host, "change");
    fireEvent(this.host, "blur");
  };
}
