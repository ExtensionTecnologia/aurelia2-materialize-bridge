import { vi } from "vitest";

// Stands in for a Materialize widget whose real behaviour needs a browser (it is checked in the demo app).
// The tests then check what the bridge asks of Materialize: when it builds the widget, with which
// options, and when it destroys it.
export function fakeWidget<Extra extends object>(widgetClass: { init: unknown }, extra: () => Extra)
{
  const widgets: (Extra & { destroy: ReturnType<typeof vi.fn> })[] = [];
  // The options of each build, in order.
  const options: Record<string, any>[] = [];

  const init = vi.spyOn(widgetClass as { init: (...args: unknown[]) => unknown }, "init").mockImplementation((_element, given) =>
  {
    // The same object extra() made, so that its own methods keep working on it.
    const widget = Object.assign(extra(), { destroy: vi.fn() });
    widgets.push(widget);
    options.push(given as Record<string, any>);
    return widget;
  });

  return {
    init,
    options,
    get widget() { return widgets[widgets.length - 1]; },
    get lastOptions() { return options[options.length - 1]; }
  };
}
