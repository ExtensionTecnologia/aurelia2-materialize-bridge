import { DI } from "aurelia";

// Where a form field gets the error messages it shows under itself.
// The bridge has no implementation of its own: "aurelia2-materialize-bridge/validation"
// registers one that reads them from @aurelia/validation-html.
export interface IFieldErrorSource
{
  // Reports the messages of the field rendered in `host` every time they change.
  // Returns the function that stops the reports.
  watch(host: Element, onChange: (messages: string[]) => void): () => void;
}

export const IFieldErrorSource = DI.createInterface<IFieldErrorSource>("IFieldErrorSource");
