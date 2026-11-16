import { afterEach, describe, expect, it, vi } from "vitest";
import { createFixture } from "@aurelia/testing";
import * as M from "@materializecss/materialize";
import { type AutocompleteEntry, MaterializeBridge } from "../index";

// The widget is Materialize's real one: what matters here is how the bridge reads its callbacks.
class Order
{
  public fruit: string = "";
  public fruits: AutocompleteEntry[] | Record<string, string | null> = [
    { id: 1, text: "Apple" },
    { id: 2, text: "Apricot" },
    { id: 3, text: "Banana" }
  ];
  public isVisible: boolean = true;
  public chosen: { text: string; entry: AutocompleteEntry }[] = [];
  public deselected: number = 0;

  public searched: string[] = [];
  public findFruits = (text: string): AutocompleteEntry[] | Promise<AutocompleteEntry[]> =>
  {
    this.searched.push(text);
    return [{ id: 9, text: `${text} from the server` }];
  };
}

const events = `md-on-autocomplete.trigger="chosen.push($event.detail)" md-on-deselect.trigger="deselected = deselected + 1"`;
const html = `<md-input if.bind="isVisible" id="fruit" label="Fruit" value.bind="fruit" md-autocomplete="values.bind: fruits" ${events}></md-input>`;
const searchHtml = `<md-input id="fruit" label="Fruit" value.bind="fruit" md-autocomplete="search.bind: findFruits; min-length: 2" ${events}></md-input>`;

// Starts the screen. The list of Materialize is filled as in a browser, but its box is not opened:
// placing it needs measures that only a browser has.
async function start<T extends Order>(template: string, component: new () => T)
{
  const view = await createFixture(template, component, [MaterializeBridge]).started;
  const input = view.queryBy("#fruit input") as HTMLInputElement | null;
  if (input != null)
  {
    const dropdown = M.Autocomplete.getInstance(input).dropdown;
    dropdown.open = vi.fn();
    dropdown.close = vi.fn();
    dropdown.recalculateDimensions = vi.fn();
  }

  return view;
}

type View = { getBy(selector: string): HTMLElement; getAllBy(selector: string): HTMLElement[] };

function field(view: View): HTMLInputElement
{
  return view.getBy("#fruit input") as HTMLInputElement;
}

// What the user sees in the list.
function offered(view: View): string[]
{
  return view.getAllBy("#fruit .autocomplete-content li").map(item => item.textContent ?? "");
}

// Types as a user does: the field is in focus, and the browser announces the edit before and after it.
function type(view: View, text: string): void
{
  const input = field(view);
  input.focus();
  input.dispatchEvent(new InputEvent("beforeinput", { bubbles: true }));
  input.value = text;
  input.dispatchEvent(new InputEvent("input", { bubbles: true }));
  input.dispatchEvent(new KeyboardEvent("keyup", { key: text.slice(-1), bubbles: true }));
}

// Chooses from the list. A click and the Enter key both end in this call of Materialize.
function choose(view: View, id: number | string): void
{
  M.Autocomplete.getInstance(field(view)).selectOption(id);
}

describe("md-autocomplete", () =>
{
  afterEach(() => vi.restoreAllMocks());

  it("offers the entries that match what is typed in an md-input", async () =>
  {
    const view = await start(html, Order);

    type(view, "ap");

    expect(offered(view)).toEqual(["Apple", "Apricot"]);
  });

  it("works on a plain input too", async () =>
  {
    const plain = `<div id="fruit"><input type="text" md-autocomplete="values.bind: fruits"></div>`;
    const view = await start(plain, Order);

    type(view, "ban");

    expect(offered(view)).toEqual(["Banana"]);
  });

  it("refuses any other element, and an md-input that is a text area", async () =>
  {
    const message = "md-autocomplete must be attached to either an input or md-input element";

    await expect(async () => await start(`<div md-autocomplete="values.bind: fruits"></div>`, Order)).rejects.toThrow(message);
    await expect(async () => await start(`<md-input text-area md-autocomplete="values.bind: fruits"></md-input>`, Order)).rejects.toThrow(message);
  });

  it("accepts the values of the original bridge, with one warning", async () =>
  {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const view = await start(html, class extends Order
    {
      public fruits: Record<string, string | null> = { Apple: null, Google: "logo.png" };
    });

    type(view, "goo");
    expect(offered(view)).toEqual(["Google"]);
    expect(view.getBy("#fruit .autocomplete-content img")?.getAttribute("src")).toBe("logo.png");

    view.component.fruits = { Pear: null };
    await vi.waitFor(() => { type(view, "pe"); expect(offered(view)).toEqual(["Pear"]); });
    expect(warn).toHaveBeenCalledOnce();
  });

  it("announces a choice, and only a choice", async () =>
  {
    const view = await start(html, Order);

    type(view, "a");
    type(view, "ap");
    expect(view.component.chosen).toEqual([]);

    choose(view, 2);

    expect(view.component.chosen).toEqual([{ text: "Apricot", entry: { id: 2, text: "Apricot" } }]);
    expect(view.component.fruit).toBe("Apricot");
    expect(view.component.deselected).toBe(0);
  });

  it("does not announce a field that starts with the text of an entry", async () =>
  {
    const view = await start(html, class extends Order
    {
      public fruit = "Apple";
      public fruits: Record<string, string | null> = { Apple: null };
    });

    expect(view.component.chosen).toEqual([]);
  });

  it("announces once that the choice was undone, when the user edits the text", async () =>
  {
    const view = await start(html, Order);
    type(view, "ap");
    choose(view, 2);

    type(view, "Apricots");
    type(view, "Apricot");
    type(view, "");

    expect(view.component.deselected).toBe(1);
    // Typing the text back did not choose again.
    expect(view.component.chosen.length).toBe(1);
  });

  it("no longer offers the entry whose choice was undone", async () =>
  {
    const view = await start(html, Order);
    type(view, "ap");
    choose(view, 2);

    type(view, "zzz");

    expect(offered(view)).toEqual([]);
  });

  it("forgets the choice in silence when the value is changed from code", async () =>
  {
    const view = await start(html, Order);
    type(view, "ap");
    choose(view, 2);

    view.component.fruit = "";
    await vi.waitFor(() => expect(field(view).value).toBe(""));
    type(view, "b");

    expect(view.component.deselected).toBe(0);
  });

  it("offers the new values when they are replaced, keeping the choice", async () =>
  {
    const view = await start(html, Order);
    type(view, "ap");
    choose(view, 2);

    view.component.fruits = [{ id: 7, text: "Carrot" }];
    await vi.waitFor(() => expect(M.Autocomplete.getInstance(field(view)).data).toEqual([{ id: 7, text: "Carrot" }]));

    expect(view.component.chosen.length).toBe(1);
    expect(view.component.deselected).toBe(0);
  });

  it("shows the replaced values at once while the user is typing", async () =>
  {
    const view = await start(html, Order);
    type(view, "car");
    expect(offered(view)).toEqual([]);

    view.component.fruits = [{ id: 7, text: "Carrot" }];

    await vi.waitFor(() => expect(offered(view)).toEqual(["Carrot"]));
    expect(view.component.chosen).toEqual([]);
  });

  it("asks the search function for the entries, from min-length on", async () =>
  {
    const view = await start(searchHtml, Order);

    type(view, "a");
    type(view, "ap");

    await vi.waitFor(() => expect(offered(view)).toEqual(["ap from the server"]));
    expect(view.component.searched).toEqual(["ap"]);
    expect(view.component.chosen).toEqual([]);
  });

  it("announces the choice of an entry that came from the search", async () =>
  {
    const view = await start(searchHtml, Order);
    type(view, "ap");
    await vi.waitFor(() => expect(offered(view).length).toBe(1));

    choose(view, 9);

    expect(view.component.chosen).toEqual([{ text: "ap from the server", entry: { id: 9, text: "ap from the server" } }]);
  });

  it("discards the answer of a search that a newer one overtook", async () =>
  {
    const answers: ((entries: AutocompleteEntry[]) => void)[] = [];
    const view = await start(searchHtml, class extends Order
    {
      public findFruits = (): Promise<AutocompleteEntry[]> => new Promise(resolve => answers.push(resolve));
    });

    type(view, "ap");
    type(view, "apr");
    answers[1]([{ id: 2, text: "Apricot" }]);
    answers[0]([{ id: 1, text: "Apple" }, { id: 2, text: "Apricot" }]);

    await vi.waitFor(() => expect(offered(view)).toEqual(["Apricot"]));
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(offered(view)).toEqual(["Apricot"]);
  });

  it("empties the list and reports on the console when the search fails", async () =>
  {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    let isFailing = false;
    const view = await start(searchHtml, class extends Order
    {
      public findFruits = async (text: string): Promise<AutocompleteEntry[]> =>
      {
        if (isFailing)
          throw new Error("server is down");

        return [{ id: 1, text }];
      };
    });
    type(view, "ap");
    await vi.waitFor(() => expect(offered(view)).toEqual(["ap"]));

    isFailing = true;
    type(view, "apr");

    await vi.waitFor(() => expect(error).toHaveBeenCalledOnce());
    expect(offered(view)).toEqual([]);
    expect(view.getBy("#fruit .status-info")?.innerHTML).toBe("");
  });

  it("ignores values when there is a search function, with a warning", async () =>
  {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const both = `<md-input id="fruit" label="Fruit" value.bind="fruit" md-autocomplete="values.bind: fruits; search.bind: findFruits"></md-input>`;
    const view = await start(both, Order);

    type(view, "ap");

    await vi.waitFor(() => expect(offered(view)).toEqual(["ap from the server"]));
    expect(warn).toHaveBeenCalledOnce();
  });

  it("offers nothing in a read-only field, which the list would otherwise change", async () =>
  {
    const readonly = `<md-input id="fruit" label="Fruit" value.bind="fruit" readonly.bind="isReadonly" md-autocomplete="values.bind: fruits; min-length: 0"></md-input>`;
    const view = await start(readonly, class extends Order
    {
      public isReadonly: boolean = false;
    });
    type(view, "ap");
    choose(view, 2);

    view.component.isReadonly = true;
    await vi.waitFor(() => expect(field(view).readOnly).toBe(true));
    field(view).blur();
    field(view).focus();
    field(view).click();

    expect(offered(view)).toEqual([]);
  });

  it("gives min-length to Materialize as a number, and nothing when it is not set", async () =>
  {
    const init = vi.spyOn(M.Autocomplete, "init");

    await start(searchHtml, Order);
    await start(html, Order);

    expect((init.mock.calls[0][1] as { minLength: number }).minLength).toBe(2);
    expect("minLength" in (init.mock.calls[1][1] as object)).toBe(false);
  });

  it("removes the widget with the field", async () =>
  {
    const view = await start(`<section id="page">${html}</section>`, Order);
    const input = field(view);

    view.component.isVisible = false;

    await vi.waitFor(() => expect(M.Autocomplete.getInstance(input)).toBeUndefined());
  });
});
