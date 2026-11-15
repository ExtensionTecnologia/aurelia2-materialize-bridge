import { bindable, customElement, INode, resolve } from "aurelia";
import * as M from "@materializecss/materialize";
import { createDropdown, type DropdownBindables } from "./create-dropdown";

// A button that opens a menu, the items given between its tags:
//   <md-dropdown title="Account" class="tonal"> <li><a>Profile</a></li> <li><a>Sign out</a></li> </md-dropdown>
// The element itself is the button. To open a menu from an element of your own, use the md-dropdown attribute.
@customElement("md-dropdown")
export class MdDropdownElement implements DropdownBindables
{
  private static nextId: number = 0;

  private readonly host = resolve(INode) as HTMLElement;
  private instance: M.Dropdown | null = null;

  // The <ul class="dropdown-content"> that holds the items.
  public content!: HTMLElement;
  public readonly controlId: string = `md-dropdown-element-${MdDropdownElement.nextId++}`;

  // The text of the button.
  @bindable public title: string = "";

  // Options of the Materialize dropdown, read once when the component is attached.
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
    this.host.classList.add("btn", "waves-effect", "dropdown-trigger");
    this.host.setAttribute("data-target", this.controlId);
    this.host.setAttribute("role", "button");
    // A custom element does not take the focus by itself; a button must, for the keyboard.
    if (!this.host.hasAttribute("tabindex"))
      this.host.tabIndex = 0;

    this.instance = createDropdown(this.host, this);
  }

  public detaching(): void
  {
    this.instance?.destroy();
    this.instance = null;

    // Materialize moved the list to just after the button. It goes back inside, where Aurelia rendered it.
    this.host.append(this.content);
    this.host.classList.remove("btn", "waves-effect", "dropdown-trigger");
    this.host.removeAttribute("data-target");
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
