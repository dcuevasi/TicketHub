import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketsService, Ticket, PaginatedTickets, TicketFilters } from '../../services/tickets.service';
import { ExportService } from '../../services/export.service';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { TicketFormComponent } from '../ticket-form/ticket-form.component';
import { TicketDetailsComponent } from '../ticket-details/ticket-details.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';
import { StatusLabelPipe } from '../../pipes/status-label.pipe';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { fadeInOut } from '../../animations/route-animations';

@Component({
  selector: 'app-tickets-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatMenuModule,
    StatusLabelPipe,
    SkeletonLoaderComponent,
  ],
  templateUrl: './tickets-list.component.html',
  styleUrls: ['./tickets-list.component.scss'],
  animations: [fadeInOut]
})
export class TicketsListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  tickets: Ticket[] = [];
  displayedColumns = ['id', 'title', 'status', 'priority', 'description', 'actions'];
  totalItems = 0;
  currentPage = 1;
  pageSize = 20;
  loading = false;
  allTickets: Ticket[] = [];

  searchText = '';
  selectedStatus: string | null = null;
  selectedPriority: string | null = null;
  statuses = ['open', 'in_progress', 'closed'];
  priorities = ['low', 'medium', 'high', 'urgent'];

  private searchSubject = new Subject<string>();

  constructor(
    private svc: TicketsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private exportService: ExportService
  ) {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 1;
      this.load();
    });
  }

  ngOnInit() {
    this.load();
    this.loadAllTickets();
  }

  load() {
    this.loading = true;
    const filters: TicketFilters = {};
    
    if (this.searchText) filters.search = this.searchText;
    if (this.selectedStatus) filters.status = this.selectedStatus;
    if (this.selectedPriority) filters.priority = this.selectedPriority;

    this.svc.list(this.currentPage, this.pageSize, filters).subscribe({
      next: (res: PaginatedTickets) => {
        this.tickets = res.items;
        this.totalItems = res.total;
        this.loading = false;
      },
      error: () => {
        this.tickets = [];
        this.totalItems = 0;
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.load();
  }

  refresh() {
    this.load();
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(TicketFormComponent, {
      width: '600px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showMessage('Ticket created successfully!', 'success');
        this.load();
      }
    });
  }

  openEditDialog(ticket: Ticket) {
    const dialogRef = this.dialog.open(TicketFormComponent, {
      width: '600px',
      data: { ticket }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showMessage('Ticket updated successfully!', 'success');
        this.load();
      }
    });
  }

  openDetailsDialog(ticket: Ticket) {
    this.dialog.open(TicketDetailsComponent, {
      width: '600px',
      data: ticket
    });
  }

  deleteTicket(ticket: Ticket) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: {
        title: 'Delete Ticket',
        message: `Are you sure you want to delete the ticket "${ticket.title}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.svc.delete(ticket.id).subscribe({
          next: () => {
            this.showMessage('Ticket deleted successfully!', 'success');
            this.load();
          },
          error: (err) => {
            this.showMessage('Error deleting ticket. Please try again.', 'error');
            console.error('Error deleting ticket:', err);
          }
        });
      }
    });
  }

  private showMessage(message: string, type: 'success' | 'error' | 'info' = 'success') {
    const config: any = {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    };

    if (type === 'success') {
      config.panelClass = ['success-snackbar'];
    } else if (type === 'error') {
      config.panelClass = ['error-snackbar'];
    } else {
      config.panelClass = ['info-snackbar'];
    }

    this.snackBar.open(message, 'Close', config);
  }

  onSearchChange() {
    this.searchSubject.next(this.searchText);
  }

  applyFilters() {
    this.currentPage = 1;
    this.load();
  }

  clearSearch() {
    this.searchText = '';
    this.applyFilters();
  }

  clearFilters() {
    this.searchText = '';
    this.selectedStatus = null;
    this.selectedPriority = null;
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchText || this.selectedStatus || this.selectedPriority);
  }

  loadAllTickets() {
    this.svc.list(1, 10000, {}).subscribe({
      next: (res: PaginatedTickets) => {
        this.allTickets = res.items;
      },
      error: () => {
        this.allTickets = [];
      }
    });
  }

  exportCurrentPage() {
    if (this.tickets.length === 0) {
      this.showMessage('No hay tickets para exportar en esta página', 'info');
      return;
    }

    const exportData = this.tickets.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description || '',
      status: t.status || 'open',
      priority: t.priority || 'low',
      created_at: t.created_at || '',
      updated_at: t.updated_at || ''
    }));

    const filename = `tickets_page_${this.currentPage}_${new Date().toISOString().split('T')[0]}.csv`;
    this.exportService.exportToCSV(exportData, filename);
    this.showMessage('Página exportada exitosamente', 'success');
  }

  exportAll() {
    if (this.allTickets.length === 0) {
      this.showMessage('No hay tickets para exportar', 'info');
      return;
    }

    const exportData = this.allTickets.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description || '',
      status: t.status || 'open',
      priority: t.priority || 'low',
      created_at: t.created_at || '',
      updated_at: t.updated_at || ''
    }));

    const filename = `tickets_all_${new Date().toISOString().split('T')[0]}.csv`;
    this.exportService.exportToCSV(exportData, filename);
    this.showMessage(`${this.allTickets.length} tickets exportados exitosamente`, 'success');
  }

  exportFiltered() {
    const filters: TicketFilters = {
      search: this.searchText || undefined,
      status: this.selectedStatus || undefined,
      priority: this.selectedPriority || undefined
    };

    this.svc.list(1, 10000, filters).subscribe({
      next: (res: PaginatedTickets) => {
        if (res.items.length === 0) {
          this.showMessage('No hay tickets que coincidan con los filtros', 'info');
          return;
        }

        const exportData = res.items.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description || '',
          status: t.status || 'open',
          priority: t.priority || 'low',
          created_at: t.created_at || '',
          updated_at: t.updated_at || ''
        }));

        const filename = `tickets_filtered_${new Date().toISOString().split('T')[0]}.csv`;
        this.exportService.exportToCSV(exportData, filename);
        this.showMessage(`${res.items.length} tickets filtrados exportados exitosamente`, 'success');
      },
      error: () => {
        this.showMessage('Error al exportar tickets filtrados', 'error');
      }
    });
  }
}
