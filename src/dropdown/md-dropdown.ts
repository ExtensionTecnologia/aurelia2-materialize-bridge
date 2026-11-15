import { bindable, customAttribute, INode, resolve } from "aurelia";
import * as M from "@materializecss/materialize";
import { createDropdown, type DropdownBindables } from "./create-dropdown";

// Makes an element open a Materialize dropdown, the list given by id or by reference:
//   <a md-dropdown="activates: account-menu" class="btn tonal">Account</a>
//   <ul id="account-menu"> <li><a>Profile</a></li> </ul>
@customAttribute("md-dropdown")
export class MdDropdown implements DropdownBindables
{
  private static nextId: number = 0;

  private readonly trigger = resolve(INode) as HTMLElement;
  private instance: M.Dropdown | null = null;
  private content: HTMLElement | null = null;
  // Where the list was before Materialize moved it beside the trigger.
  private contentParent: HTMLElement | null = null;

  // The id of the list to open, or the list itself in ref.
  @bindable public activates: string = "";
  @bindable public ref: HTMLElement | null = null;

  // Options of the Materialize dropdown, read once when the element is attached.
  @bindable public alignment: "left" | "right" | undefined;
  @bindable public constrainWidth: boolean | undefined;
  @bindable public container: HTMLElement | string | undefined;
  @bindable public coverTrigger: boolean | undefined;
  @bindable public closeOnClick: boolean | undefined;
  @bindable public hover: boolean | undefined;
  @bindable public inDuration: number | undefined;
  @bindable public outDuration: number | undefined;

  public attached(): void
  {
    if (this.ref != null)
    {
      if (!this.ref.id)
        this.ref.id = `md-dropdown-${MdDropdown.nextId++}`;
      this.activates = this.ref.id;
    }

    this.content = document.getElementById(this.activates);
    if (this.content == null)
      return;

    this.contentParent = this.content.parentElement;
    this.trigger.classList.add("dropdown-trigger");
    this.trigger.setAttribute("data-target", this.activates);
    this.content.classList.add("dropdown-content");

    this.instance = createDropdown(this.trigger, this);
  }

  public detaching(): void
  {
    if (this.instance == null || this.content == null)
      return;

    this.instance.destroy();
    this.instance = null;

    // Puts the list back where Aurelia rendered it, so Aurelia can remove it.
    if (this.contentParent != null && this.content.parentElement != this.contentParent)
      this.contentParent.append(this.content);

    this.trigger.removeAttribute("data-target");
    this.trigger.classList.remove("dropdown-trigger");
    this.content.classList.remove("dropdown-content");
    this.content = null;
    this.contentParent = null;
  }

  public open(): void
  {
    this.instance?.open();
  }

  public close(): void
  {
    this.instance?.close();
  }

  public recalculateDimensions(): void
  {
    this.instance?.recalculateDimensions();
  }
}
