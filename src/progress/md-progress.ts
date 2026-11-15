import { bindable } from "aurelia";

export class MdProgress
{
  // linear: a bar. circular: a spinner.
  @bindable public type: "linear" | "circular" = "linear";
  // Linear only. A percentage from 0 to 100; without it the bar runs endlessly.
  @bindable public value: number | null = null;
  // Circular only. blue, red, yellow or green; "flashing" goes through the four.
  @bindable public color: string = "blue";
  // Circular only. big, small, or empty for the middle size.
  @bindable public size: string = "big";
  // Circular only. An exact size in pixels, instead of size.
  @bindable public pixelSize: number | null = null;

  // The colours of the spinner's layers. One layer for a single colour, four for "flashing".
  public get layers(): string[]
  {
    if (this.color == "flashing")
      return ["spinner-blue", "spinner-red", "spinner-yellow", "spinner-green"];

    return [`spinner-${this.color}-only`];
  }

  public get hasValue(): boolean
  {
    return this.value !== null && this.value !== undefined && String(this.value) != "";
  }

  public get pixels(): string
  {
    return this.pixelSize == null ? "" : `${this.pixelSize}px`;
  }
}
