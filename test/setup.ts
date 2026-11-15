import { BrowserPlatform } from "@aurelia/platform-browser";
import { setPlatform, onFixtureCreated, type IFixture } from "@aurelia/testing";
import { beforeAll, afterEach } from "vitest";

const fixtures: IFixture<object>[] = [];

beforeAll(() =>
{
  const platform = new BrowserPlatform(window);
  setPlatform(platform);
  BrowserPlatform.set(globalThis, platform);
  onFixtureCreated(fixture => { fixtures.push(fixture); });
});

afterEach(() =>
{
  fixtures.forEach(async fixture =>
  {
    try { await fixture.stop(true); } catch { /* ignore */ }
  });
  fixtures.length = 0;
});

// jsdom has no innerText, which Materialize reads and writes. For the tests, textContent is close enough.
if (!("innerText" in HTMLElement.prototype))
{
  Object.defineProperty(HTMLElement.prototype, "innerText", {
    get(this: HTMLElement): string { return this.textContent ?? ""; },
    set(this: HTMLElement, text: string) { this.textContent = text; }
  });
}
