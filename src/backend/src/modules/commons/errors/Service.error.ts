export class ServiceError extends Error {
  constructor(
    name: string,
    private readonly msg: string,
  ) {
    super(name);
  }

  get message() {
    return this.msg;
  }
}
