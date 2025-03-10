import { BaseService } from "@/commons/base.service";
import { UserData } from "../hooks/useUser";

class UserService extends BaseService {
    private static instance: UserService;

    private constructor() {
        super();
    }

    public static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }

    async getCurrentUser(): Promise<UserData> {
        return this.request<UserData>({
            method: 'GET',
            url: '/user',
            mockResponse: () => new Promise((resolve) => {
                // Mock response for development/testing
                setTimeout(() => resolve({
                    id: '1',
                    name: 'Người Dùng',
                    email: 'user@example.com',
                    avatar: ''
                }), 500);
            })
        });
    }
}

export const userService = UserService.getInstance();
