import { optional, resolve } from "aurelia";
import { IValidationController, type ValidationEvent, type ValidationResultTarget } from "@aurelia/validation-html";
import { type IFieldErrorSource } from "../common/field-error-source";

// Reads a field's error messages from the validation controller of the component that uses the field.
// It is created once per field, so resolve() finds the controller nearest to that field.
// A field used where nothing created a controller simply has no messages.
export class ValidationFieldErrorSource implements IFieldErrorSource
{
  private readonly validationController = resolve(optional(IValidationController));

  public watch(host: Element, onChange: (messages: string[]) => void): () => void
  {
    const validationController = this.validationController;
    if (validationController == null)
      return () => {};

    let failures: ValidationResultTarget[] = [];

    const subscriber = {
      handleValidationEvent: (event: ValidationEvent): void =>
      {
        const removed = event.removedResults.map(target => target.result);
        const added = event.addedResults.filter(target => !target.result.valid && target.targets.includes(host));

        failures = failures.filter(target => !removed.includes(target.result)).concat(added);
        onChange(failures.map(target => target.result.message ?? ""));
      }
    };

    validationController.addSubscriber(subscriber);
    return () => validationController.removeSubscriber(subscriber);
  }
}
