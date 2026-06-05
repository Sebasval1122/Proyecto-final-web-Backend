import { v4 as uuidv4 } from 'uuid';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IPasswordHasher } from '../services/IPasswordHasher';
import { User } from '../../domain/entities/User';

export class RegisterUser {
  constructor(
    private userRepository: IUserRepository,
    private passwordHasher: IPasswordHasher
  ) {}

  async execute(data: { email: string, password: string, name?: string, role?: 'admin' | 'dealer' | 'user' }): Promise<User> {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) throw new Error('User already exists');

    const passwordHash = await this.passwordHasher.hash(data.password);
    const user: User = {
      id: uuidv4(),
      email: data.email,
      passwordHash,
      name: data.name,
      role: data.role || 'user'
    };

    return this.userRepository.create(user);
  }
}
