export class NotLinkedConnectionError extends Error {
  constructor(id: string) {
    super(`Connnection ${id} isn't connected to any page`);
  }
}
