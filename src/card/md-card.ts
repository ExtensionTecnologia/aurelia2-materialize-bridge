import { bindable } from "aurelia";
import * as M from "@materializecss/materialize";
import { booleanAttribute } from "../common/boolean-attribute";

export class MdCard
{
  private instance: M.Cards | null = null;

  // The <div class="card">.
  public card!: HTMLElement;

  @bindable public mdTitle: string = "";
  // The address of the picture shown at the top (or at the side, when horizontal).
  @bindable public image: string | null = null;
  @bindable({ set: booleanAttribute }) public horizontal: boolean = false;
  // The card has a hidden panel (the content given for "reveal-text") that slides over it.
  @bindable({ set: booleanAttribute }) public reveal: boolean = false;
  // The card has a row of actions (the content given for "action").
  @bindable({ set: booleanAttribute }) public action: boolean = false;
  @bindable({ set: booleanAttribute }) public stickyAction: boolean = false;
  // small, medium or large: a fixed height.
  @bindable public size: string = "";
  @bindable public mdClass: string = "";

  // The old name of md-title.
  @bindable public title: string = "";

  public binding(): void
  {
    if (this.title && !this.mdTitle)
      this.mdTitle = this.title;
  }

  public attached(): void
  {
    // Materialize's script is only needed to slide the hidden panel in and out.
    if (this.reveal)
      this.instance = M.Cards.init(this.card, {});
  }

  public detaching(): void
  {
    this.instance?.destroy();
    this.instance = null;
  }

  public titleChanged(): void
  {
    this.mdTitle = this.title;
  }
}
