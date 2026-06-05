import jwt from 'jsonwebtoken';
import { ITokenService } from '../../application/services/ITokenService';
import { config } from '../../config';

export class JwtService implements ITokenService {
  private readonly secret = config.jwtSecret;
  private readonly expiresIn = '7d';

  generate(payload: any): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  verify(token: string): any {
    return jwt.verify(token, this.secret);
  }
}
