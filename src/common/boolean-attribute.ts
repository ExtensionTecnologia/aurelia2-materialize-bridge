// Lets a boolean bindable be written as a bare attribute: <md-input disabled> means true.
export function booleanAttribute(value: unknown): boolean
{
  return value === true || value === "" || value === "true";
}

// The same for an option that may be left out: undefined stays undefined, so Materialize's default applies.
export function optionalBoolean(value: unknown): boolean | undefined
{
  return value === undefined ? undefined : booleanAttribute(value);
}

// A number option written in a template arrives as text.
export function optionalNumber(value: unknown): number | undefined
{
  return value === undefined ? undefined : Number(value);
}
