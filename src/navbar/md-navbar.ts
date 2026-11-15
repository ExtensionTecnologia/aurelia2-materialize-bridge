import { bindable } from "aurelia";
import { booleanAttribute } from "../common/boolean-attribute";

export class MdNavbar
{
  // The bar stays at the top of the screen while the page scrolls.
  @bindable({ set: booleanAttribute }) public fixed: boolean = false;
  // The bar grows with its content instead of keeping Materialize's fixed height.
  @bindable({ set: booleanAttribute }) public autoHeight: boolean = false;
}
