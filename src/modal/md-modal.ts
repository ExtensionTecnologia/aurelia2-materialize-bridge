import { bindable, customAttribute, INode, resolve } from "aurelia";
import { booleanAttribute } from "../common/boolean-attribute";
import { fireMaterializeEvent } from "../common/fire-event";

// Turns an element into a Materialize modal, opened and closed from code:
//   <div md-modal md-modal.ref="confirmation"> <div class="modal-content">…</div> <div class="modal-footer">…</div> </div>
//   this.confirmation.open();
// Materialize 2 has no script for modals; the modal is the browser's own popover with Materialize's look.
@customAttribute("md-modal")
export class MdModal
{
  private readonly modal = resolve(INode) as HTMLElement;
  // The button marked "modal-action default", clicked when the user presses Enter.
  private defaultAction: HTMLElement | null = null;
  private isShown: boolean = false;

  // true: a click outside or the Esc key closes the modal.
  @bindable({ set: booleanAttribute }) public dismissible: boolean = true;
  @bindable({ set: booleanAttribute }) public bottomSheet: boolean = false;

  public attached(): void
  {
    this.modal.classList.add("modal");
    // Lets the modal itself take the focus when it opens, so that Enter and Esc reach it.
    if (!this.modal.hasAttribute("tabindex"))
      this.modal.tabIndex = -1;
    this.bottomSheetChanged();
    this.dismissibleChanged();

    this.modal.addEventListener("beforetoggle", this.onBeforeToggle);
    this.modal.addEventListener("toggle", this.onToggle);
    this.modal.addEventListener("keydown", this.onKeydown);
    this.defaultAction = this.modal.querySelector<HTMLElement>(".modal-action.default");
  }

  public detaching(): void
  {
    this.close();
    this.modal.removeEventListener("beforetoggle", this.onBeforeToggle);
    this.modal.removeEventListener("toggle", this.onToggle);
    this.modal.removeEventListener("keydown", this.onKeydown);
    this.modal.removeAttribute("popover");
    this.modal.classList.remove("modal", "bottom-sheet");
  }

  public dismissibleChanged(): void
  {
    // "auto" closes on a click outside and on Esc; "manual" only from code.
    this.modal.setAttribute("popover", this.dismissible ? "auto" : "manual");
  }

  public bottomSheetChanged(): void
  {
    this.modal.classList.toggle("bottom-sheet", this.bottomSheet);
  }

  public get isOpen(): boolean
  {
    return this.isShown;
  }

  public open(): void
  {
    if (this.isShown)
      return;

    this.modal.showPopover();
    this.modal.focus();
  }

  public close(): void
  {
    if (this.isShown)
      this.modal.hidePopover();
  }

  // The browser announces every change, also the ones it makes itself (Esc, a click outside).
  private onBeforeToggle = (event: Event): void =>
  {
    this.isShown = (event as ToggleEvent).newState == "open";
    fireMaterializeEvent(this.modal, (event as ToggleEvent).newState == "open" ? "open-start" : "close-start");
  };

  private onToggle = (event: Event): void =>
  {
    fireMaterializeEvent(this.modal, (event as ToggleEvent).newState == "open" ? "open-end" : "close-end");
  };

  private onKeydown = (event: KeyboardEvent): void =>
  {
    if (event.key != "Enter" || this.defaultAction == null)
      return;

    // Without this, when the action closes the modal the same Enter goes on to press the button that
    // gets the focus back, usually the one that opened the modal, and the modal opens again.
    event.preventDefault();
    this.defaultAction.click();
  };
}
