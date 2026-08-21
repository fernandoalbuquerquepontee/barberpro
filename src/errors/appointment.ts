export class CannotCreateAppointmentInThePastError extends Error {
  constructor() {
    super("Cannot create an appointment in the past");
    this.name = "CannotCreateAppointmentInThePastError";
  }
}

export class CannotCreateAppointmentInTheSameTimeError extends Error {
  constructor(date: Date | string) {
    super(`Cannot create an appointment in the same time: ${date}`);
    this.name = "CannotCreateAppointmentInTheSameTimeError";
  }
}
