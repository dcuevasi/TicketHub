import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Ticket } from '../../services/tickets.service';
import { StatusLabelPipe } from '../../pipes/status-label.pipe';

@Component({
  selector: 'app-ticket-details',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    StatusLabelPipe,
  ],
  templateUrl: './ticket-details.component.html',
  styleUrls: ['./ticket-details.component.scss']
})
export class TicketDetailsComponent {
  constructor(
    public dialogRef: MatDialogRef<TicketDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public ticket: Ticket
  ) {}

  close() {
    this.dialogRef.close();
  }

  getPriorityColor(priority?: string): string {
    switch (priority) {
      case 'urgent': return 'warn';
      case 'high': return 'accent';
      case 'medium': return 'primary';
      default: return '';
    }
  }

  getStatusColor(status?: string): string {
    switch (status) {
      case 'closed': return 'accent';
      case 'in_progress': return 'primary';
      default: return '';
    }
  }
}
