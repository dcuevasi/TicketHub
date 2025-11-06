import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { TicketsService, Ticket } from '../../services/tickets.service';
import { StatusLabelPipe } from '../../pipes/status-label.pipe';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';
import { fadeInOut, slideIn } from '../../animations/route-animations';

interface DashboardStats {
  total: number;
  open: number;
  in_progress: number;
  closed: number;
  urgent: number;
  high: number;
  medium: number;
  low: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    StatusLabelPipe,
    BaseChartDirective,
    SkeletonLoaderComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [fadeInOut, slideIn]
})
export class DashboardComponent implements OnInit {
  loading = true;
  stats: DashboardStats = {
    total: 0,
    open: 0,
    in_progress: 0,
    closed: 0,
    urgent: 0,
    high: 0,
    medium: 0,
    low: 0,
  };
  recentTickets: Ticket[] = [];

  constructor(
    private ticketsService: TicketsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    
    // Obtener todos los tickets para calcular estadísticas (máximo 200 por el límite del backend)
    this.ticketsService.list(1, 200).subscribe({
      next: (response) => {
        console.log('Dashboard data loaded:', response);
        const tickets = response.items;
        
        // Calcular estadísticas
        this.stats.total = tickets.length;
        this.stats.open = tickets.filter(t => t.status === 'open').length;
        this.stats.in_progress = tickets.filter(t => t.status === 'in_progress').length;
        this.stats.closed = tickets.filter(t => t.status === 'closed').length;
        this.stats.urgent = tickets.filter(t => t.priority === 'urgent').length;
        this.stats.high = tickets.filter(t => t.priority === 'high').length;
        this.stats.medium = tickets.filter(t => t.priority === 'medium').length;
        this.stats.low = tickets.filter(t => t.priority === 'low').length;
        
        console.log('Stats calculated:', this.stats);
        
        // Actualizar gráficos
        this.updateCharts();
        
        // Obtener los 5 tickets más recientes
        this.recentTickets = tickets.slice(0, 5);
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.loading = false;
      }
    });
  }

  getStatusPercentage(count: number): number {
    return this.stats.total > 0 ? Math.round((count / this.stats.total) * 100) : 0;
  }

  getPriorityPercentage(count: number): number {
    return this.stats.total > 0 ? Math.round((count / this.stats.total) * 100) : 0;
  }

  public statusChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Abiertos', 'En Progreso', 'Cerrados'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: [
        '#2196f3',
        '#ff9800',
        '#4caf50',
      ],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  public statusChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 12 }
        }
      }
    }
  };

  priorityChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Urgente', 'Alta', 'Media', 'Baja'],
    datasets: [{
      data: [0, 0, 0, 0],
      backgroundColor: [
        '#f44336',
        '#ff9800',
        '#2196f3',
        '#4caf50',
      ],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  public priorityChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 12 }
        }
      }
    }
  };

  updateCharts() {
    // Actualizar datos del gráfico de estados
    this.statusChartData.datasets[0].data = [
      this.stats.open,
      this.stats.in_progress,
      this.stats.closed
    ];

    // Actualizar datos del gráfico de prioridades
    this.priorityChartData.datasets[0].data = [
      this.stats.urgent,
      this.stats.high,
      this.stats.medium,
      this.stats.low
    ];
  }
}
