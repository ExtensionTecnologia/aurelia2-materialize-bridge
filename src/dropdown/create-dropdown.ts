import * as M from "@materializecss/materialize";
import { optionalBoolean, optionalNumber } from "../common/boolean-attribute";
import { fireMaterializeEvent } from "../common/fire-event";
import { type DropdownOptions, givenOptions } from "../common/materialize-options";

// The options of Materialize's dropdown as the md-dropdown attribute and element receive them from a template.
export interface DropdownBindables
{
  alignment: "left" | "right" | undefined;
  constrainWidth: boolean | undefined;
  container: HTMLElement | string | undefined;
  coverTrigger: boolean | undefined;
  closeOnClick: boolean | undefined;
  hover: boolean | undefined;
  inDuration: number | undefined;
  outDuration: number | undefined;
}

// Builds Materialize's dropdown on the trigger, which must already point to its list with data-target.
// What the dropdown does is announced on the trigger as md-on events.
export function createDropdown(trigger: HTMLElement, bindables: DropdownBindables): M.Dropdown
{
  const container = typeof bindables.container == "string" ? document.querySelector(bindables.container) : bindables.container;

  return M.Dropdown.init(trigger, {
    ...givenOptions<DropdownOptions>({
      alignment: bindables.alignment,
      constrainWidth: optionalBoolean(bindables.constrainWidth),
      container: container ?? undefined,
      coverTrigger: optionalBoolean(bindables.coverTrigger),
      closeOnClick: optionalBoolean(bindables.closeOnClick),
      hover: optionalBoolean(bindables.hover),
      inDuration: optionalNumber(bindables.inDuration),
      outDuration: optionalNumber(bindables.outDuration)
    }),
    onOpenStart: () => fireMaterializeEvent(trigger, "open-start"),
    onOpenEnd: () => fireMaterializeEvent(trigger, "open-end"),
    onCloseStart: () => fireMaterializeEvent(trigger, "close-start"),
    onCloseEnd: () => fireMaterializeEvent(trigger, "close-end")
  });
}
