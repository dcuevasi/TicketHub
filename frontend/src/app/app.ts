import { Component, ViewChild } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, ChildrenOutletContexts } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { routeAnimations } from './animations/route-animations';
import { LogoutScreenComponent } from './components/logout-screen/logout-screen.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatSlideToggleModule,
    LogoutScreenComponent,
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  animations: [routeAnimations]
})
export class App {
  @ViewChild('drawer') drawer!: MatDrawer;
  protected title = 'frontend';
  
  isMobile = false;
  drawerMode: 'side' | 'over' = 'side';
  drawerOpened = true;
  isLoggingOut = false;

  constructor(
    private auth: AuthService, 
    private router: Router,
    public themeService: ThemeService,
    private breakpointObserver: BreakpointObserver,
    private contexts: ChildrenOutletContexts
  ) {
    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet])
      .subscribe(result => {
        this.isMobile = result.matches;
        this.drawerMode = this.isMobile ? 'over' : 'side';
        this.drawerOpened = !this.isMobile;
      });
  }

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }

  logout() {
    this.isLoggingOut = true;
    
    setTimeout(() => {
      this.auth.logout();
      this.router.navigate(['/login']);
      this.isLoggingOut = false;
    }, 1500);
  }

  isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }
}
