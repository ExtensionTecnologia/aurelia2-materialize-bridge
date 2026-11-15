import * as M from "@materializecss/materialize";

// Materialize does not export the types of its options, so they are taken from the init functions.
export type DatepickerOptions = NonNullable<Parameters<typeof M.Datepicker.init>[1]>;
export type TimepickerOptions = NonNullable<Parameters<typeof M.Timepicker.init>[1]>;
export type FormSelectOptions = NonNullable<Parameters<typeof M.FormSelect.init>[1]>;
export type DropdownOptions = NonNullable<Parameters<typeof M.Dropdown.init>[1]>;
export type SidenavOptions = NonNullable<Parameters<typeof M.Sidenav.init>[1]>;
export type TabsOptions = NonNullable<Parameters<typeof M.Tabs.init>[1]>;
export type CollapsibleOptions = NonNullable<Parameters<typeof M.Collapsible.init>[1]>;
export type TooltipOptions = NonNullable<Parameters<typeof M.Tooltip.init>[1]>;
export type ToastOptions = ConstructorParameters<typeof M.Toast>[0];

// Removes the options that were not given. Materialize would take an undefined option
// as a value and lose its own default.
export function givenOptions<T extends object>(options: T): T
{
  const given: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(options))
  {
    if (value !== undefined)
      given[name] = value;
  }

  return given as T;
}
