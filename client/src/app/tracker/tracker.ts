import { Component, signal, inject } from '@angular/core';
import { Api, Course, Assignment } from '../api';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule],
  selector: 'app-tracker',
  styleUrl: './tracker.css',
  templateUrl: './tracker.html',
})
export class Tracker {
  private api = inject(Api);
  protected readonly courses = signal<Course[]>([]);
  protected readonly selectedCourseId = signal<string | null>(null);
  protected readonly assignments = signal<Assignment[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    this.api.getCourses().subscribe({
      next: (data) => {
        this.courses.set(data.filter((course) => course.name));
      },
      error: (err: HttpErrorResponse) => this.showError(err),
    });
  }

  private showError(err: HttpErrorResponse) {
    if (err.status === 0) {
      this.errorMessage.set("Can't reach the server. Is Express running?");
    } else {
      this.errorMessage.set(err.error?.error ?? 'Something went wrong. Please try again.');
    }
  }

  protected loadAssignments() {
    const courseId = this.selectedCourseId();
    if (!courseId) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.assignments.set([]);

    this.api.getAssignments(courseId).subscribe({
      next: (data) => {
        this.assignments.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.showError(err);
        this.loading.set(false);
      },
    });
  }
  
}
