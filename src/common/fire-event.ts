// Tells the component's users that something happened, as an event on the component's own element.
export function fireEvent(host: Element, name: string, detail: unknown = {}): void
{
  host.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
}

// The same, for what happens inside a Materialize widget: the event is named md-on-<name>.
export function fireMaterializeEvent(host: Element, name: string, detail: unknown = {}): void
{
  fireEvent(host, `md-on-${name}`, detail);
}
