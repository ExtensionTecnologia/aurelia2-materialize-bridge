import { bindable, BindingMode, INode, resolve } from "aurelia";
import { booleanAttribute } from "../common/boolean-attribute";
import { FieldErrors } from "../common/field-errors";
import { fireMaterializeEvent } from "../common/fire-event";

// A field that chooses files: a button and, beside it, the names of the chosen files.
//   <md-file label="Attachments" files.bind="attachments" multiple accept=".pdf"></md-file>
export class MdFile
{
  private readonly host = resolve(INode) as HTMLElement;

  public fileInput!: HTMLInputElement;

  // Validation messages of this field, shown under the outlined box.
  public readonly fieldErrors = new FieldErrors();

  @bindable public label: string = "";
  // The text of the button.
  @bindable public caption: string = "File";
  // The files the user chose. Set it to [] or null from code to clear the choice.
  @bindable({ mode: BindingMode.twoWay }) public files: File[] | null = [];
  // The kinds of file offered by the browser's window, as in <input type="file" accept>: ".pdf,image/*".
  @bindable public accept: string | null = null;
  @bindable({ set: booleanAttribute }) public multiple: boolean = false;
  @bindable({ set: booleanAttribute }) public disabled: boolean = false;
  // The names stay on show, as in a normal field, but no other file can be chosen.
  @bindable({ set: booleanAttribute }) public readonly: boolean = false;

  // What the outlined box shows. Materialize joins the names the same way.
  public get names(): string
  {
    return (this.files ?? []).map(file => file.name).join(", ");
  }

  public binding(): void
  {
    this.fieldErrors.start();
  }

  public unbinding(): void
  {
    this.fieldErrors.stop();
  }

  // The choice was cleared from code: the browser's own input forgets its files too,
  // so that choosing the same file again is a change.
  public filesChanged(): void
  {
    if (this.fileInput != null && (this.files == null || this.files.length == 0))
      this.fileInput.value = "";
  }

  // Called when the user chooses, by the window or by dropping files on the field.
  public onChange(): void
  {
    this.files = Array.from(this.fileInput.files ?? []);
    fireMaterializeEvent(this.host, "change", { files: this.files });
  }
}
