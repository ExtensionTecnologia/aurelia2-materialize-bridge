import { DI } from "aurelia";
import { type DatepickerOptions, type TimepickerOptions } from "./common/materialize-options";

// Defaults for every component of one kind, set once with MaterializeBridge.customize().
// An option given on a component itself wins over these.
export class MaterializeBridgeOptions
{
  // Modal, because without a display plugin Materialize draws the pickers permanently open in the page.
  public datepicker: DatepickerOptions = { displayPlugin: "modal" };
  public timepicker: TimepickerOptions = { displayPlugin: "modal" };
}

export const IMaterializeBridgeOptions = DI.createInterface<MaterializeBridgeOptions>("IMaterializeBridgeOptions", x => x.singleton(MaterializeBridgeOptions));
