import { JwtPayload, verify } from "jsonwebtoken";

export type ConnectionIdGenerator = (token: string | JwtPayload) => string | null;
export class TokenValidator {
  #secret: string;
  #idGenerator: ConnectionIdGenerator;

  constructor(secret: string, idGenerator: ConnectionIdGenerator) {
    this.#secret = secret;
    this.#idGenerator = idGenerator;
  }

  validate(token: string): string | null {
    try {
      const jwt = verify(token, this.#secret);

      if (typeof jwt !== "string" && jwt.exp) {
        const expDate = new Date(0);
        expDate.setUTCSeconds(jwt.exp);

        if (new Date().getTime() >= expDate.getTime()) throw new Error();
      }

      return this.#idGenerator(jwt);
    } catch {
      return null;
    }
  }
}
