import { bindable, BindingMode, INode, resolve } from "aurelia";
import { booleanAttribute } from "../common/boolean-attribute";
import { fireMaterializeEvent } from "../common/fire-event";

export class MdPagination
{
  private readonly host = resolve(INode) as HTMLElement;

  // The page on show, starting from 1.
  @bindable({ mode: BindingMode.twoWay, set: Number }) public activePage: number = 1;
  // How many pages there are.
  @bindable({ set: Number }) public pages: number = 5;
  // How many page numbers are shown at most.
  @bindable({ set: Number }) public visiblePageLinks: number = 15;
  @bindable({ set: booleanAttribute }) public showFirstLast: boolean = true;
  @bindable({ set: booleanAttribute }) public showPrevNext: boolean = true;
  @bindable({ set: booleanAttribute }) public showPageLinks: boolean = true;

  // The page numbers on show: a window of visiblePageLinks pages around the active one.
  public get pageLinks(): number[]
  {
    const count = Math.min(this.visiblePageLinks, this.pages);

    // The window starts half its size before the active page, without leaving the first or the last page.
    let first = this.activePage - Math.ceil(count / 2) + 1;
    first = Math.min(first, this.pages - count + 1);
    first = Math.max(first, 1);

    const links: number[] = [];
    for (let page = first; page < first + count; page++)
      links.push(page);

    return links;
  }

  // A different number of pages starts again from the first.
  public pagesChanged(): void
  {
    this.setActivePage(1);
  }

  public setActivePage(page: number): void
  {
    this.activePage = page;
    fireMaterializeEvent(this.host, "page-changed", page);
  }

  public setFirstPage(): void
  {
    if (this.activePage > 1)
      this.setActivePage(1);
  }

  public setPreviousPage(): void
  {
    if (this.activePage > 1)
      this.setActivePage(this.activePage - 1);
  }

  public setNextPage(): void
  {
    if (this.activePage < this.pages)
      this.setActivePage(this.activePage + 1);
  }

  public setLastPage(): void
  {
    if (this.activePage < this.pages)
      this.setActivePage(this.pages);
  }
}
