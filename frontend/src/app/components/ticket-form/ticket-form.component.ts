import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TicketsService, Ticket } from '../../services/tickets.service';
import { StatusLabelPipe } from '../../pipes/status-label.pipe';

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    StatusLabelPipe,
  ],
  templateUrl: './ticket-form.component.html',
  styleUrls: ['./ticket-form.component.scss']
})
export class TicketFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  isSubmitting = false;

  statuses = ['open', 'in_progress', 'closed'];
  priorities = ['low', 'medium', 'high', 'urgent'];

  constructor(
    private fb: FormBuilder,
    private ticketsService: TicketsService,
    public dialogRef: MatDialogRef<TicketFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { ticket?: Ticket }
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(1000)]],
      status: ['open'],
      priority: ['medium'],
      due_date: ['', Validators.required],
    });
  }

  ngOnInit() {
    if (this.data?.ticket) {
      this.isEditMode = true;
      this.form.patchValue(this.data.ticket);
    }
  }

  onSubmit() {
    if (this.form.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    const payload = this.form.value;

    if (this.isEditMode && this.data.ticket) {
      this.ticketsService.update(this.data.ticket.id, payload).subscribe({
        next: (ticket) => {
          this.isSubmitting = false;
          this.dialogRef.close(ticket);
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Error updating ticket:', err);
        },
      });
    } else {
      this.ticketsService.create(payload).subscribe({
        next: (ticket) => {
          this.isSubmitting = false;
          this.dialogRef.close(ticket);
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Error creating ticket:', err);
        },
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  getErrorMessage(field: string): string {
    const control = this.form.get(field);
    if (!control) return '';

    if (control.hasError('required')) {
      if (field === 'due_date') {
        return 'Please select a due date';
      }
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
    if (control.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Minimum ${minLength} characters required`;
    }
    if (control.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength'].requiredLength;
      return `Maximum ${maxLength} characters allowed`;
    }
    return '';
  }
}
