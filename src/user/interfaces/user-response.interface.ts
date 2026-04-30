import { UserDocument } from '../schemas/user.schema';

export interface BaseResponse {
    status: 'success' | 'error';
    message: string;
}

export interface UserResponse extends BaseResponse {
    data: {
        user: UserDocument;
    };
}

export interface UsersResponse extends BaseResponse {
    data: {
        users: UserDocument[];
    };
}

export type DeleteUserResponse = BaseResponse;
