import axios from 'axios';

export const api = axios.create({ baseURL: '/api' });

export type Student = {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  createdAt?: string;
};

export type Course = {
  id?: number;
  code: string;
  title: string;
  description?: string;
  credits: number;
};

export type Enrollment = {
  id?: number;
  student: Student;
  course: Course;
  term: string;
  grade?: string;
  enrolledAt?: string;
};
