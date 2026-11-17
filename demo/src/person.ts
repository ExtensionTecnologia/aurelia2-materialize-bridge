import { type IValidationRules } from "@aurelia/validation";

export class Person
{
  public name: string = "";
  public email: string = "";
  public phone: string = "";
  public notes: string = "";
  public state: string = "";
  public languages: string[] = [];
  // 3 April 2026: day and month can be confused, which shows a picker that reads dates the American way.
  public birthDate: Date | null = new Date(2026, 3, 3);
  public contractDate: Date | null = null;
  public meetingTime: string = "14:30";
  public alarmTime: string = "";
  public plan: string = "monthly";
  public receivesEmails: boolean = false;
  public acceptsTerms: boolean = false;
  public document: File[] | null = [];
  public photos: File[] | null = [];

  public static defineRules(rules: IValidationRules): void
  {
    rules.off(Person);
    rules.on(Person)
      .ensure("name")
        .displayName("Name")
        .required()
          .withMessage("${$displayName} is required.")
      .ensure("email")
        .displayName("E-mail")
        .required()
          .withMessage("${$displayName} is required.")
        .matches(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)
          .withMessage("${$displayName} is not valid.")
      .ensure("state")
        .displayName("State")
        .required()
          .withMessage("${$displayName} is required.")
      .ensure("contractDate")
        .displayName("Contract date")
        .required()
          .withMessage("${$displayName} is required.")
      .ensure("alarmTime")
        .displayName("Alarm")
        .required()
          .withMessage("${$displayName} is required.")
      .ensure("acceptsTerms")
        .satisfies((value: boolean) => value)
          .withMessage("The terms must be accepted.")
      .ensure("document")
        .satisfies((files: File[] | null) => files != null && files.length > 0)
          .withMessage("Attach the document.");
  }
}
