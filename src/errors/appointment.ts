export class CannotCreateAppointmentInThePastError extends Error {
  constructor() {
    super("Cannot create an appointment in the past");
    this.name = "CannotCreateAppointmentInThePastError";
  }
}
