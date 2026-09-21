import { Component, signal, inject, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Api, Course, Assignment } from '../api';

@Component({
  imports: [FormsModule, DatePipe],
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

  // Assignments sorted by due date, with undated ones at the bottom
  protected readonly sortedAssignments = computed(() =>
    [...this.assignments()].sort((a, b) => {
      if (!a.due_at && !b.due_at) return 0;
      if (!a.due_at) return 1;
      if (!b.due_at) return -1;
      return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
    })
  );

  constructor() {
    this.api.getCourses().subscribe({
      next: (data) => {
        this.courses.set(data.filter((course) => course.name));
      },
      error: (err: HttpErrorResponse) => this.showError(err),
    });
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

  // Decides the label and Bootstrap badge color for one assignment
  protected urgency(assignment: Assignment): { label: string; badgeClass: string } {
    // check submitted first so a finished assignment never shows as overdue
    const state = assignment.submission?.workflow_state;
    if (state === 'submitted' || state === 'graded' || state === 'pending_review') {
      return { label: 'Submitted', badgeClass: 'text-bg-success' };
    }
    if (!assignment.due_at) {
      return { label: 'No due date', badgeClass: 'text-bg-secondary' };
    }
    const hoursLeft = (new Date(assignment.due_at).getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursLeft < 0) {
      return { label: 'Overdue', badgeClass: 'text-bg-danger' };
    }
    if (hoursLeft <= 48) {
      return { label: 'Due soon', badgeClass: 'text-bg-warning' };
    }
    return { label: 'Upcoming', badgeClass: 'text-bg-primary' };
  }
  
  private showError(err: HttpErrorResponse) {
    if (err.status === 0) {
      this.errorMessage.set("Can't reach the server. Is Express running?");
    } else {
      this.errorMessage.set(err.error?.error ?? 'Something went wrong. Please try again.');
    }
  }
}