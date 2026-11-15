import { type IContainer, Registration } from "aurelia";
import { IFieldErrorSource } from "../common/field-error-source";
import { ValidationFieldErrorSource } from "./validation-field-error-source";

// Makes every md-* form field show its own @aurelia/validation errors.
// Register it beside MaterializeBridge, only in systems that use @aurelia/validation-html.
export const MaterializeBridgeValidation = {
  register(container: IContainer): void
  {
    container.register(Registration.transient(IFieldErrorSource, ValidationFieldErrorSource));
  }
};
