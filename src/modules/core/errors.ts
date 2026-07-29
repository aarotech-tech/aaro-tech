export class DomainStateTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainStateTransitionError";
  }
}
