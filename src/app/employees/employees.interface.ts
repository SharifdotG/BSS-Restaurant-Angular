export interface ResponseListOfEmployees {
  pageNumber: number
  current_page: number
  per_page: number
  pageSize: number
  firstPage: string
  lastPage: string
  last_page: number
  totalPages: number
  totalRecords: number
  total: number
  from: number
  to: number
  next_page_url: any
  prev_page_url: any
  data: Employee[]
}

export interface Employee {
  id: string
  designation: string
  joinDate: string
  amountSold: any
  user: User
}

export interface User {
  id: string
  userName: string
  email: string
  fullName: string
  phoneNumber: string
  label: any
  firstName: string
  middleName: string
  lastName: string
  fatherName: string
  motherName: string
  spouseName: string
  dob: string
  address: any
  nid: string
  image: string
  existingImage: string
  facebook: any
  linkedin: any
  twitter: any
  instagram: any
  github: any
  genderId: number
  genderName: string
}

export interface CreateEmployee {
  designation: string;
  joinDate: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  fatherName: string;
  motherName: string;
  spouseName: string;
  dob: string;
  nid: string;
  genderId: number;
  image: string;
  base64: string;
}