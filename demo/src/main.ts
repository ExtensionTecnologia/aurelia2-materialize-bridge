import Aurelia from "aurelia";
import { RouterConfiguration } from "@aurelia/router";
import { ValidationHtmlConfiguration, ValidationTrigger } from "@aurelia/validation-html";
import { MaterializeBridge } from "aurelia2-materialize-bridge";
import { MaterializeBridgeValidation } from "aurelia2-materialize-bridge/validation";
import "@materializecss/materialize/dist/css/materialize.min.css";
import { DemoShell } from "./demo-shell";

const Validation = ValidationHtmlConfiguration.customize(options =>
{
  options.DefaultTrigger = ValidationTrigger.manual;
});

// Defaults for every picker of the demo: day first in dates, 24-hour clock.
const Bridge = MaterializeBridge.customize(options =>
{
  options.datepicker.format = "dd/mm/yyyy";
  options.timepicker.twelveHour = false;
});

Aurelia
  .register(RouterConfiguration, Bridge, MaterializeBridgeValidation, Validation)
  .app({ host: document.querySelector("demo-shell") as HTMLElement, component: DemoShell })
  .start();
