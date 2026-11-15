import { bindable, INode, resolve } from "aurelia";
import * as M from "@materializecss/materialize";
import { booleanAttribute, optionalBoolean, optionalNumber } from "../common/boolean-attribute";
import { fireMaterializeEvent } from "../common/fire-event";
import { givenOptions, type SidenavOptions } from "../common/materialize-options";

export class MdSidenav
{
  private static nextId: number = 0;

  private readonly host = resolve(INode) as HTMLElement;
  private instance: M.Sidenav | null = null;

  // The <ul class="sidenav"> that holds the menu items.
  public sidenav!: HTMLElement;
  public readonly controlId: string = `md-sidenav-${MdSidenav.nextId++}`;

  // Always visible on large screens, instead of sliding in.
  @bindable({ set: booleanAttribute }) public fixed: boolean = false;

  // Options of the Materialize sidenav, read once when the component is attached.
  @bindable public edge: "left" | "right" | undefined;
  @bindable public draggable: boolean | undefined;
  @bindable public inDuration: number | undefined;
  @bindable public outDuration: number | undefined;

  public attached(): void
  {
    this.instance = M.Sidenav.init(this.sidenav, {
      ...givenOptions<SidenavOptions>({
        edge: this.edge,
        draggable: optionalBoolean(this.draggable),
        inDuration: optionalNumber(this.inDuration),
        outDuration: optionalNumber(this.outDuration)
      }),
      onOpenStart: elem => fireMaterializeEvent(this.host, "open-start", { elem }),
      onOpenEnd: elem => fireMaterializeEvent(this.host, "open-end", { elem }),
      onCloseStart: elem => fireMaterializeEvent(this.host, "close-start", { elem }),
      onCloseEnd: elem => fireMaterializeEvent(this.host, "close-end", { elem })
    });
  }

  public detaching(): void
  {
    this.instance?.destroy();
    this.instance = null;
  }

  public get isOpen(): boolean
  {
    return this.instance?.isOpen ?? false;
  }

  public open(): void
  {
    this.instance?.open();
  }

  public close(): void
  {
    this.instance?.close();
  }
}
