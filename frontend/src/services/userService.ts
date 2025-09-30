import { apiService } from './api';

export interface DeleteAccountResponse {
  message: string;
}

class UserService {
  async deleteAccount(userId: number): Promise<DeleteAccountResponse> {
    return apiService.delete<DeleteAccountResponse>(`/api/v1/users/profile/${userId}`);
  }
}

export const userService = new UserService();
