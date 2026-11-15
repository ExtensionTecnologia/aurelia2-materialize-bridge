import { bindable, customAttribute, INode, resolve } from "aurelia";
import * as M from "@materializecss/materialize";

// Shows a Materialize tooltip on the element: <button md-tooltip="html: Delete; position: top">
@customAttribute("md-tooltip")
export class MdTooltip
{
  private readonly target = resolve(INode) as HTMLElement;
  private instance: M.Tooltip | null = null;

  // The text of the tooltip. The name is the original bridge's; Materialize 2 shows it as plain text.
  @bindable public html: string = "";
  @bindable public position: "top" | "right" | "bottom" | "left" = "bottom";
  // Milliseconds the tooltip stays after the pointer leaves.
  @bindable public delay: number = 50;

  public attached(): void
  {
    this.createWidget();
  }

  public detaching(): void
  {
    this.destroyWidget();
  }

  public htmlChanged(): void
  {
    this.createWidget();
  }

  public positionChanged(): void
  {
    this.createWidget();
  }

  // No text, no tooltip.
  private createWidget(): void
  {
    this.destroyWidget();
    if (this.html)
      this.instance = M.Tooltip.init(this.target, { text: this.html, position: this.position, exitDelay: Number(this.delay) });
  }

  private destroyWidget(): void
  {
    this.instance?.destroy();
    this.instance = null;
  }
}
