import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IPasswordHasher } from '../services/IPasswordHasher';
import { ITokenService } from '../services/ITokenService';
import { UserDTO, toUserDTO } from '../dtos/UserDTO';

export class LoginUser {
  constructor(
    private userRepository: IUserRepository,
    private passwordHasher: IPasswordHasher,
    private tokenService: ITokenService
  ) {}

  async execute(email: string, password: string): Promise<{ user: UserDTO, token: string } | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return null;

    const isValid = await this.passwordHasher.compare(password, user.passwordHash);
    if (!isValid) return null;

    const token = this.tokenService.generate({ sub: user.id, email: user.email, role: user.role });
    return {
      user: toUserDTO(user),
      token
    };
  }
}
