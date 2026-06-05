import { User } from '../../domain/entities/User';

export interface UserDTO {
  id: string;
  email: string;
  name?: string;
  role: string;
}

export function toUserDTO(user: User): UserDTO {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };
}
