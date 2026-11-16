import { bindable, CustomElement, customAttribute, INode, resolve } from "aurelia";
import * as M from "@materializecss/materialize";
import { optionalNumber } from "../common/boolean-attribute";
import { fireMaterializeEvent } from "../common/fire-event";
import { type AutocompleteEntry, type AutocompleteOptions, givenOptions } from "../common/materialize-options";
import { type MdInput } from "../input/md-input";

// The values as the original bridge took them: the text of each entry, with its image or null.
type OriginalValues = Record<string, string | null>;

// Offers a list of entries under a text field while the user types:
//   <md-input label="Fruit" value.bind="fruit" md-autocomplete="values.bind: fruits"></md-input>
// The field keeps the text. Which entry was chosen is told by md-on-autocomplete, and md-on-deselect
// tells that the text is no longer the one of that entry.
@customAttribute("md-autocomplete")
export class MdAutocomplete
{
  private readonly host = resolve(INode) as HTMLElement;
  private input: HTMLInputElement | null = null;
  private instance: M.Autocomplete | null = null;

  // The entry the user chose, while the field still shows its text.
  private chosen: AutocompleteEntry | null = null;
  // True while the bridge itself changes the list: Materialize then reports the old choice again, as if just made.
  private isChangingList: boolean = false;
  // Counts the calls of the search function, to tell the answer of the latest one from the others.
  private searchCount: number = 0;
  private hasWarnedOfOriginalValues: boolean = false;

  // The entries to offer: [{ id, text, image, description }]. Only id is required.
  @bindable public values: AutocompleteEntry[] | OriginalValues = [];
  // Finds the entries for the typed text, instead of values: it may ask a server and return a Promise.
  @bindable public search: ((text: string) => AutocompleteEntry[] | Promise<AutocompleteEntry[]>) | null = null;
  // How many characters before the list appears. When not set, Materialize's own (1).
  @bindable({ set: optionalNumber }) public minLength: number | undefined;

  public attached(): void
  {
    this.input = this.findInput();
    if (this.search != null && this.readValues().length > 0)
      console.warn("md-autocomplete: values is ignored when search is given.");

    // The field may start with the text of an entry, which Materialize then reports as chosen. Nobody chose it.
    this.isChangingList = true;
    this.instance = M.Autocomplete.init(this.input, {
      ...givenOptions<Partial<AutocompleteOptions>>({ minLength: this.minLength }),
      data: this.search == null ? this.readValues() : [],
      onSearch: text => { void this.findEntries(text); },
      onAutocomplete: entries => this.onAutocomplete(entries)
    });
    this.instance.selectedValues = [];
    this.isChangingList = false;

    this.input.addEventListener("beforeinput", this.onBeforeInput);
    this.input.addEventListener("input", this.onInput);
  }

  public detaching(): void
  {
    this.input?.removeEventListener("beforeinput", this.onBeforeInput);
    this.input?.removeEventListener("input", this.onInput);
    this.instance?.destroy();
    this.instance = null;
    this.input = null;
    this.chosen = null;
    // An answer of the search that is still to come finds a newer count and is discarded.
    this.searchCount++;
  }

  public valuesChanged(): void
  {
    if (this.instance == null || this.input == null || this.search != null)
      return;

    const entries = this.readValues();
    this.instance.data = entries;
    this.instance.menuItems = entries;
    this.instance.options.data = entries;

    // The user is typing: the list on show is of the old values.
    if (document.activeElement == this.input)
      void this.findEntries(this.input.value);
  }

  public minLengthChanged(): void
  {
    if (this.instance != null)
      this.instance.options.minLength = this.minLength ?? M.Autocomplete.defaults.minLength;
  }

  private findInput(): HTMLInputElement
  {
    if (this.host instanceof HTMLInputElement)
      return this.host;

    const mdInput = CustomElement.for<MdInput>(this.host, { optional: true })?.viewModel;
    if (mdInput?.input instanceof HTMLInputElement)
      return mdInput.input;

    throw new Error("md-autocomplete must be attached to either an input or md-input element");
  }

  private readValues(): AutocompleteEntry[]
  {
    if (Array.isArray(this.values))
      return this.values;

    if (!this.hasWarnedOfOriginalValues)
    {
      this.hasWarnedOfOriginalValues = true;
      console.warn('md-autocomplete: values is in the format of the original bridge, { "Text": image or null }. '
        + 'Give a list instead: [{ id: 1, text: "Text", image: "..." }].');
    }

    return Object.entries(this.values ?? {}).map(([text, image]) => image == null ? { id: text, text } : { id: text, text, image });
  }

  // Called by Materialize when the text of the field changes.
  private async findEntries(text: string): Promise<void>
  {
    if (this.instance == null || this.input == null)
      return;

    // Materialize would let the user change a read-only field by choosing from the list.
    // With nothing to offer it offers the entry it holds as chosen, so that one is taken from it too.
    if (this.input.readOnly)
    {
      this.instance.selectedValues = [];
      this.showEntries([], false);
      return;
    }

    if (this.search == null)
    {
      // Materialize's own filter of values.
      this.isChangingList = true;
      M.Autocomplete.defaults.onSearch(text, this.instance);
      this.isChangingList = false;
      return;
    }

    const searchNumber = ++this.searchCount;
    let entries: AutocompleteEntry[] = [];
    if (text.length >= (this.minLength ?? M.Autocomplete.defaults.minLength))
    {
      try
      {
        entries = await this.search(text);
      }
      catch (error)
      {
        console.error("md-autocomplete: the search failed.", error);
      }
    }

    // A newer search began, or the field left the page, while this one waited.
    if (searchNumber != this.searchCount || this.instance == null)
      return;

    // Opens the list only if the user is still in the field.
    this.showEntries(entries, document.activeElement == this.input);
  }

  private showEntries(entries: AutocompleteEntry[], isOpening: boolean): void
  {
    this.isChangingList = true;
    this.instance?.setMenuItems(entries, undefined, isOpening);
    this.isChangingList = false;
  }

  // Materialize calls this for a choice, and also on every change of the list and when the field is emptied.
  private onAutocomplete(entries: AutocompleteEntry[]): void
  {
    if (this.isChangingList || entries.length != 1)
      return;

    this.chosen = entries[0];
    fireMaterializeEvent(this.host, "autocomplete", { text: this.textOf(this.chosen), entry: this.chosen });
  }

  // The text Materialize writes in the field for an entry.
  private textOf(entry: AutocompleteEntry): string
  {
    return String(entry.text || entry.id);
  }

  // Before an edit of the user: if the text is already another one, the value was changed from code,
  // and the system that did it knows. The choice is forgotten without an event.
  private onBeforeInput = (): void =>
  {
    if (this.chosen != null && this.input?.value != this.textOf(this.chosen))
      this.forgetChoice();
  };

  // After an edit of the user: the text is no longer the one of the chosen entry.
  private onInput = (): void =>
  {
    if (this.chosen == null || this.input?.value == this.textOf(this.chosen))
      return;

    this.forgetChoice();
    fireMaterializeEvent(this.host, "deselect");
  };

  private forgetChoice(): void
  {
    this.chosen = null;
    // Materialize keeps the entry as chosen until the field is empty, and offers it when nothing matches.
    if (this.instance != null)
      this.instance.selectedValues = [];
  }
}
