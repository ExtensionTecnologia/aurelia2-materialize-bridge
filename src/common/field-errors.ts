import { INode, optional, resolve } from "aurelia";
import { IFieldErrorSource } from "./field-error-source";

// The validation messages of one form field. Create it in a field initialiser of the component
// (it uses resolve()), call start() in binding() and stop() in unbinding().
export class FieldErrors
{
  private readonly host = resolve(INode) as Element;
  private readonly source = resolve(optional(IFieldErrorSource));
  private stopWatching: (() => void) | null = null;

  public messages: string[] = [];

  public start(): void
  {
    if (this.source == null)
      return;

    this.stopWatching = this.source.watch(this.host, messages =>
    {
      this.messages = messages;
      // The component's CSS draws the Material Design 3 error state from this class.
      this.host.classList.toggle("invalid", messages.length > 0);
    });
  }

  public stop(): void
  {
    this.stopWatching?.();
    this.stopWatching = null;
    this.messages = [];
    this.host.classList.remove("invalid");
  }
}
