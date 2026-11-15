import { bindable, customAttribute, INode, resolve } from "aurelia";
import { type MdSidenav } from "./md-sidenav";

// Makes an element open and close a sidenav:
//   <a md-sidenav-collapse="ref.bind: menu"><i class="material-icons">menu</i></a>
//   <md-sidenav component.ref="menu">…</md-sidenav>
@customAttribute("md-sidenav-collapse")
export class MdSidenavCollapse
{
  private readonly trigger = resolve(INode) as HTMLElement;

  // The md-sidenav component to open and close.
  @bindable public ref: MdSidenav | null = null;

  public attached(): void
  {
    this.trigger.addEventListener("click", this.onClick);
  }

  public detaching(): void
  {
    this.trigger.removeEventListener("click", this.onClick);
  }

  private onClick = (): void =>
  {
    if (this.ref == null)
      return;

    if (this.ref.isOpen)
      this.ref.close();
    else
      this.ref.open();
  };
}
