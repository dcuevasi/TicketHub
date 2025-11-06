import { Component, ViewEncapsulation, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-logout-screen',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './logout-screen.component.html',
  styleUrl: './logout-screen.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class LogoutScreenComponent implements OnInit {
  themeService = inject(ThemeService);
  isDarkMode = false;

  ngOnInit() {
    this.isDarkMode = this.themeService.isDarkMode();
  }
}
