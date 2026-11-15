import { newInstanceForScope, resolve } from "aurelia";
import { type MdCollapsible, type MdModal, type MdSidenav, type MdTabs, MdToastService } from "aurelia2-materialize-bridge";
import { IValidationRules } from "@aurelia/validation";
import { IValidationController } from "@aurelia/validation-html";
import { Person } from "./person";

export class DemoApp
{
  private readonly validationController = resolve(newInstanceForScope(IValidationController));

  private readonly toastService = resolve(MdToastService);

  // The components opened and closed from code, filled by ref in the template.
  public menu!: MdSidenav;
  public confirmation!: MdModal;
  public tabs!: MdTabs;
  public questions!: MdCollapsible;

  // What the components with script announced, newest first.
  public events: string[] = [];
  public tooltipText: string = "Deletes the record";
  public isBusy: boolean = false;
  public nickname: string = "";
  public progress: number = 25;
  public page: number = 1;
  // A grey rectangle, so the demo needs no image file.
  public picture: string = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect width='400' height='200' fill='%23b0bec5'/%3E%3C/svg%3E";
  public isAccordion: boolean = true;

  public person: Person = new Person();
  public states: string[] = ["São Paulo", "Rio de Janeiro"];
  public savedMessage: string = "";
  public lastSelected: string = "";

  // Switches of the demo itself, to see each state of the components.
  public isDisabled: boolean = false;
  public isReadonly: boolean = false;
  public isSelectVisible: boolean = true;

  public constructor()
  {
    Person.defineRules(resolve(IValidationRules));
  }

  public async save(): Promise<void>
  {
    this.savedMessage = "";

    const result = await this.validationController.validate();
    if (!result.valid)
      return;

    this.savedMessage = `Saved: ${JSON.stringify(this.person)}`;
  }

  public clear(): void
  {
    this.validationController.reset();
    this.person = new Person();
    this.savedMessage = "";
  }

  public chooseRio(): void
  {
    this.person.state = "Rio de Janeiro";
  }

  public log(event: string): void
  {
    this.events.unshift(event);
  }

  public async showToast(): Promise<void>
  {
    await this.toastService.show("Record saved!", 1500);
    this.log("toast gone");
  }

  public confirm(): void
  {
    this.confirmation.close();
    this.log("confirmed");
  }

  public chooseChristmas(): void
  {
    this.person.birthDate = new Date(2026, 11, 25);
    this.person.meetingTime = "08:05";
  }

  public addState(): void
  {
    this.states.push("Minas Gerais");
  }
}
