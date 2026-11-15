import { route } from "@aurelia/router";
import { DemoApp } from "./demo-app";

// The demo is shown through the router on purpose: a system that uses the bridge shows its screens the
// same way, and some problems only appear there (the router takes every <a href> for a route).
@route({ routes: [{ path: "", component: DemoApp }] })
export class DemoShell {}
