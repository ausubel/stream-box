export interface UserBase {
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface UserCreate extends UserBase {
  password: string;
  role_id: number;
}

export interface UserResponse extends UserBase {
  id: number;
  role_id: number;
  status: string;
  profile_picture?: string;
  last_login?: string;
  created_at: string;
}

export interface StandardResponse<T> {
  data: T;
  message: string;
}
