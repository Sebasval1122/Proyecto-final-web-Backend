import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UserDTO, toUserDTO } from '../dtos/UserDTO';

export class GetUserById {
  constructor(private userRepository: IUserRepository) {}

  async execute(id: string): Promise<UserDTO | null> {
    const user = await this.userRepository.findById(id);
    return user ? toUserDTO(user) : null;
  }
}
