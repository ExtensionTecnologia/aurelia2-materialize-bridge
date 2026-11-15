import { bindable, customAttribute, INode, resolve } from "aurelia";
import * as M from "@materializecss/materialize";
import { booleanAttribute, optionalBoolean, optionalNumber } from "../common/boolean-attribute";
import { fireMaterializeEvent } from "../common/fire-event";
import { type CollapsibleOptions, givenOptions } from "../common/materialize-options";

// Turns a list into the Materialize collapsible:
//   <ul md-collapsible> <li> <div class="collapsible-header">…</div> <div class="collapsible-body">…</div> </li> </ul>
@customAttribute("md-collapsible")
export class MdCollapsible
{
  private readonly list = resolve(INode) as HTMLElement;
  private instance: M.Collapsible | null = null;

  // true (Materialize's default): opening a section closes the others.
  @bindable public accordion: boolean | undefined;
  @bindable({ set: booleanAttribute }) public popout: boolean = false;
  @bindable public inDuration: number | undefined;
  @bindable public outDuration: number | undefined;

  public attached(): void
  {
    this.list.classList.add("collapsible");
    this.list.classList.toggle("popout", this.popout);
    this.createWidget();
  }

  public detaching(): void
  {
    this.instance?.destroy();
    this.instance = null;
    this.list.classList.remove("collapsible", "popout");
  }

  public accordionChanged(): void
  {
    if (this.instance != null)
      this.createWidget();
  }

  // Opens the section at the given position, starting from 0.
  public open(index: number = 0): void
  {
    this.instance?.open(index);
  }

  public close(index: number = 0): void
  {
    this.instance?.close(index);
  }

  private createWidget(): void
  {
    this.instance?.destroy();
    this.instance = M.Collapsible.init(this.list, {
      ...givenOptions<CollapsibleOptions>({
        accordion: optionalBoolean(this.accordion),
        inDuration: optionalNumber(this.inDuration),
        outDuration: optionalNumber(this.outDuration)
      }),
      onOpenStart: el => fireMaterializeEvent(this.list, "open-start", { el }),
      onOpenEnd: el => fireMaterializeEvent(this.list, "open-end", { el }),
      onCloseStart: el => fireMaterializeEvent(this.list, "close-start", { el }),
      onCloseEnd: el => fireMaterializeEvent(this.list, "close-end", { el })
    });
  }
}
