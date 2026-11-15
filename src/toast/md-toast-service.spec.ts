import { afterEach, describe, expect, it, vi } from "vitest";
import { DI } from "aurelia";
import * as M from "@materializecss/materialize";
import { MdToastService } from "../index";

describe("MdToastService", () =>
{
  afterEach(() => M.Toast.dismissAll());

  it("shows a toast with the text and the extra classes", () =>
  {
    const service = DI.createContainer().get(MdToastService);

    void service.show("Record saved!", 5000, "rounded");

    const toast = Array.from(document.querySelectorAll(".toast")).pop();
    expect(toast?.textContent).toBe("Record saved!");
    expect(toast?.classList.contains("rounded")).toBe(true);
  });

  it("removes every toast on screen", () =>
  {
    const service = DI.createContainer().get(MdToastService);
    const dismissAll = vi.spyOn(M.Toast, "dismissAll");

    service.removeAll();

    expect(dismissAll).toHaveBeenCalledOnce();
  });
});
