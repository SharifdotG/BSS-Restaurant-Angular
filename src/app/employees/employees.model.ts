import { User } from '../auth/auth.model';

export interface Employee {
  id: string;
  designation: string;
  joinDate: string;
  amountSold?: number;
  user: User;
}

export interface CreateEmployeeRequest {
  designation: string;
  joinDate: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fatherName?: string;
  motherName?: string;
  spouseName?: string;
  dob: string;
  nid: string;
  genderId: number;
  image?: string;
  base64?: string;
}

export interface UpdateEmployeeRequest extends CreateEmployeeRequest {
  id: string;
}