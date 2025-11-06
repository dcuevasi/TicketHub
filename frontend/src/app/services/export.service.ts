import { Injectable } from '@angular/core';

export interface ExportableTicket {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  exportToCSV(tickets: ExportableTicket[], filename: string = 'tickets.csv'): void {
    if (!tickets || tickets.length === 0) {
      console.warn('No hay tickets para exportar');
      return;
    }

    const headers = ['ID', 'Título', 'Descripción', 'Estado', 'Prioridad', 'Fecha Creación', 'Última Actualización'];
    
    const rows = tickets.map(ticket => [
      ticket.id,
      this.escapeCsvValue(ticket.title),
      this.escapeCsvValue(ticket.description),
      this.formatStatus(ticket.status),
      this.formatPriority(ticket.priority),
      this.formatDate(ticket.created_at),
      this.formatDate(ticket.updated_at)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToExcel(tickets: ExportableTicket[], filename: string = 'tickets.xlsx'): void {
    this.exportToCSV(tickets, filename.replace('.xlsx', '.csv'));
  }

  private escapeCsvValue(value: string): string {
    if (!value) return '""';
    
    const escaped = value.replace(/"/g, '""');
    
    if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')) {
      return `"${escaped}"`;
    }
    
    return `"${escaped}"`;
  }

  private formatStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'open': 'Abierto',
      'in_progress': 'En Progreso',
      'closed': 'Cerrado'
    };
    return `"${statusMap[status] || status}"`;
  }

  private formatPriority(priority: string): string {
    const priorityMap: { [key: string]: string } = {
      'low': 'Baja',
      'medium': 'Media',
      'high': 'Alta',
      'urgent': 'Urgente'
    };
    return `"${priorityMap[priority] || priority}"`;
  }

  private formatDate(dateString: string): string {
    if (!dateString) return '""';
    
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `"${day}/${month}/${year} ${hours}:${minutes}"`;
  }
}
