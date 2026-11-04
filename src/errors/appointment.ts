export class AppointmentNotFoundError extends Error {
  constructor() {
    super("Appointment not found");
    this.name = "AppointmentNotFoundError";
  }
}

export class AppointmentNotBelongsToUserError extends Error {
  constructor(userId: string, appointmentUserId: string) {
    super(
      `Appointment not belongs to user: ${userId} and ${appointmentUserId}`,
    );
    this.name = "AppointmentNotBelongsToUserError";
  }
}
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

export class ServiceNotFoundError extends Error {
  constructor() {
    super("Service not found");
    this.name = "ServiceNotFoundError";
  }
}
