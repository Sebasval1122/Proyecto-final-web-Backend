export interface ITokenService {
  generate(payload: { sub: string; email: string; role: string }): string;
  verify(token: string): { sub: string; email: string; role: string };
}
