import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Course {
  id: number;
  name: string;
}
export interface Assignment {
  id: number;
  name: string;
  due_at: string | null;
  points_possible: number | null;
  html_url: string;
  submission?: {
    workflow_state: string;
  };
}

@Service()
export class Api {
    private http = inject(HttpClient);

    getHello() {
    return this.http.get<{ message: string }>('http://localhost:3000/api/hello');
    }

    getCourses() {
        return this.http.get<Course[]>('http://localhost:3000/api/courses');
    }

    getAssignments(courseId: string) {
        return this.http.get<Assignment[]>(`http://localhost:3000/api/courses/${courseId}/assignments`);
    }
}
