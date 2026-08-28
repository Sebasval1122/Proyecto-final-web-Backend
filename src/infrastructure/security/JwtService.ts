import jwt from 'jsonwebtoken';
import { ITokenService } from '../../application/services/ITokenService';
import { config } from '../../config';

export class JwtService implements ITokenService {
  private readonly secret = config.jwtSecret;
  private readonly expiresIn = '7d';

  generate(payload: { sub: string; email: string; role: string }): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  verify(token: string): { sub: string; email: string; role: string } {
    return jwt.verify(token, this.secret) as { sub: string; email: string; role: string };
  }
}
