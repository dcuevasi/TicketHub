import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <canvas baseChart
      [type]="chartType"
      [data]="chartData"
      [options]="chartOptions">
    </canvas>
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
      height: 300px;
    }
  `]
})
export class ChartComponent implements OnChanges {
  @Input() chartType: ChartType = 'doughnut';
  @Input() labels: string[] = [];
  @Input() data: number[] = [];
  @Input() colors: string[] = [];

  chartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: []
  };

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12
          }
        }
      }
    }
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['labels'] || changes['data'] || changes['colors']) {
      this.updateChart();
    }
  }

  updateChart() {
    this.chartData = {
      labels: this.labels,
      datasets: [{
        data: this.data,
        backgroundColor: this.colors,
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  }
}
