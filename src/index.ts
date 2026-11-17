import { type IContainer, Registration } from "aurelia";
import { MdAutocomplete } from "./autocomplete/md-autocomplete";
import { MdButton } from "./button/md-button";
import { MdCard } from "./card/md-card";
import { MdCheckbox } from "./checkbox/md-checkbox";
import { MdCollapsible } from "./collapsible/md-collapsible";
import { IMaterializeBridgeOptions, MaterializeBridgeOptions } from "./configuration";
import { MdDatepicker } from "./datepicker/md-datepicker";
import { MdDropdown } from "./dropdown/md-dropdown";
import { MdDropdownElement } from "./dropdown/md-dropdown-element";
import { MdFile } from "./file/md-file";
import { MdInput } from "./input/md-input";
import { MdModal } from "./modal/md-modal";
import { MdNavbar } from "./navbar/md-navbar";
import { MdPagination } from "./pagination/md-pagination";
import { MdProgress } from "./progress/md-progress";
import { MdRadio } from "./radio/md-radio";
import { MdSelect } from "./select/md-select";
import { MdSidenav } from "./sidenav/md-sidenav";
import { MdSidenavCollapse } from "./sidenav/md-sidenav-collapse";
import { MdSwitch } from "./switch/md-switch";
import { MdTabs } from "./tabs/md-tabs";
import { MdTimepicker } from "./timepicker/md-timepicker";
import { MdToastService } from "./toast/md-toast-service";
import { MdTooltip } from "./tooltip/md-tooltip";

export { IFieldErrorSource } from "./common/field-error-source";
export { type AutocompleteEntry, type DatepickerOptions, type FormSelectOptions, type TimepickerOptions } from "./common/materialize-options";
export { IMaterializeBridgeOptions, MaterializeBridgeOptions };
export
{
  MdAutocomplete, MdButton, MdCard, MdCheckbox, MdCollapsible, MdDatepicker, MdDropdown, MdDropdownElement, MdFile, MdInput, MdModal, MdNavbar, MdPagination,
  MdProgress, MdRadio, MdSelect, MdSidenav, MdSidenavCollapse, MdSwitch, MdTabs, MdTimepicker, MdToastService, MdTooltip
};

const components = [
  MdAutocomplete, MdButton, MdCard, MdCheckbox, MdCollapsible, MdDatepicker, MdDropdown, MdDropdownElement, MdFile, MdInput, MdModal, MdNavbar, MdPagination,
  MdProgress, MdRadio, MdSelect, MdSidenav, MdSidenavCollapse, MdSwitch, MdTabs, MdTimepicker, MdTooltip
];

// Registers every component of the bridge: Aurelia.register(MaterializeBridge).
export const MaterializeBridge = {
  register(container: IContainer): void
  {
    container.register(...components);
  },

  // The same, with defaults of your own for the Materialize widgets:
  //   Aurelia.register(MaterializeBridge.customize(options => { options.datepicker.format = "dd/mm/yyyy"; }))
  customize(configure: (options: MaterializeBridgeOptions) => void)
  {
    return {
      register(container: IContainer): void
      {
        const options = new MaterializeBridgeOptions();
        configure(options);
        container.register(Registration.instance(IMaterializeBridgeOptions, options), ...components);
      }
    };
  }
};
