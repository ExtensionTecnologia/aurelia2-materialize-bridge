import { bindable, customAttribute, INode, resolve } from "aurelia";
import * as M from "@materializecss/materialize";
import { booleanAttribute, optionalBoolean, optionalNumber } from "../common/boolean-attribute";
import { fireMaterializeEvent } from "../common/fire-event";
import { givenOptions, type TabsOptions } from "../common/materialize-options";

// Turns a list of links into Materialize tabs:
//   <ul md-tabs> <li><a href="#first">First</a></li> <li><a href="#second">Second</a></li> </ul>
//   <div id="first">…</div> <div id="second">…</div>
@customAttribute("md-tabs")
export class MdTabs
{
  private readonly list = resolve(INode) as HTMLElement;
  private instance: M.Tabs | null = null;

  // Tabs share the whole width equally.
  @bindable({ set: booleanAttribute }) public fixed: boolean = false;
  @bindable({ set: booleanAttribute }) public transparent: boolean = false;
  @bindable public swipeable: boolean | undefined;
  @bindable public responsiveThreshold: number | undefined;

  public attached(): void
  {
    this.list.classList.add("tabs");
    this.fixedChanged();
    this.transparentChanged();
    this.createWidget();
  }

  public detaching(): void
  {
    this.destroyWidget();
    this.list.classList.remove("tabs", "tabs-fixed-width", "tabs-transparent");
  }

  public fixedChanged(): void
  {
    this.list.classList.toggle("tabs-fixed-width", this.fixed);
  }

  public transparentChanged(): void
  {
    this.list.classList.toggle("tabs-transparent", this.transparent);
  }

  // The position of the tab on show, starting from 0.
  public get selectedTab(): number
  {
    return this.instance?.index ?? 0;
  }

  // Shows the tab whose content has the given id. Materialize does it by clicking the tab,
  // so md-on-selected is announced as for a click of the user.
  public select(id: string): void
  {
    this.instance?.select(id);
  }

  // Rebuilds the tabs. Call it after adding or removing tabs.
  public refresh(): void
  {
    if (this.instance != null)
      this.createWidget();
  }

  public updateTabIndicator(): void
  {
    this.instance?.updateTabIndicator();
  }

  private createWidget(): void
  {
    this.destroyWidget();

    for (const tab of this.list.querySelectorAll("li"))
      tab.classList.add("tab");

    for (const link of this.list.querySelectorAll("li a"))
    {
      // Keeps the Aurelia router from taking "#first" for a route.
      link.setAttribute("external", "");
      link.addEventListener("click", this.onTabClick);
    }

    this.instance = M.Tabs.init(this.list, {
      ...givenOptions<TabsOptions>({
        swipeable: optionalBoolean(this.swipeable),
        responsiveThreshold: optionalNumber(this.responsiveThreshold)
      }),
      onShow: newContent => fireMaterializeEvent(this.list, "show", { newContent })
    });
  }

  private destroyWidget(): void
  {
    if (this.instance == null)
      return;

    this.instance.destroy();
    this.instance = null;

    for (const link of this.list.querySelectorAll("li a"))
      link.removeEventListener("click", this.onTabClick);
  }

  private onTabClick = (event: Event): void =>
  {
    const link = event.currentTarget as HTMLAnchorElement;
    fireMaterializeEvent(this.list, "selected", link.getAttribute("href") ?? "");
  };
}
