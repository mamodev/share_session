export const requestError = (action: string, message: string, status: number) =>
  JSON.stringify({ action, message, status });

export default class RequestError extends Error {
  status: number;
  action: string;

  constructor(action: string, message: string, status: number = 400) {
    super(message);
    this.status = status;
    this.action = action;
  }

  toString(): string {
    return JSON.stringify({ action: this.action, status: this.status, message: this.message });
  }
}
