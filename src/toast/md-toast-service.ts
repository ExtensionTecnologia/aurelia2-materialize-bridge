import * as M from "@materializecss/materialize";
import { givenOptions, type ToastOptions } from "../common/materialize-options";

// Shows Materialize toasts. Get it with resolve(MdToastService).
export class MdToastService
{
  // Shows a toast. The promise resolves when the toast has gone.
  public show(text: string, displayLength?: number, className?: string, activationPercent?: number, inDuration?: number, outDuration?: number): Promise<M.Toast>
  {
    return new Promise(resolvePromise =>
    {
      const toast: M.Toast = new M.Toast({
        ...givenOptions<ToastOptions>({ text, displayLength, classes: className, activationPercent, inDuration, outDuration }),
        completeCallback: () => resolvePromise(toast)
      });
    });
  }

  // Removes every toast on screen.
  public removeAll(): void
  {
    M.Toast.dismissAll();
  }
}
