import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';

import { AuthService } from '../../auth/auth.service';
import { Profile } from '../profile/profile';
import { Cart } from '../../new-order/cart/cart';
import { NewOrderService } from '../../new-order/new-order.service';
import { API_BASE_URL } from '../../app.config';
import { ThemeService } from '../../core/theme.service';

interface SideBarItem {
  label: string;
  icon: string;
  route: string;
  headerTitle: string;
}

const SIDE_BAR_ITEMS: readonly SideBarItem[] = [
  { label: 'Dashboard', icon: 'pie-chart', route: 'home', headerTitle: 'Dashboard' },
  { label: 'Employees', icon: 'team', route: 'employees', headerTitle: 'Employee Management' },
  { label: 'Tables', icon: 'appstore', route: 'tables', headerTitle: 'Table Management' },
  { label: 'Foods', icon: 'coffee', route: 'foods', headerTitle: 'Food Item Management' },
  { label: 'New Order', icon: 'shopping-cart', route: 'new-order', headerTitle: 'Create New Order' },
  { label: 'Orders', icon: 'profile', route: 'orders', headerTitle: 'Order Management' },
  { label: 'Expenses', icon: 'wallet', route: 'expenses', headerTitle: 'Expense Management' },
];

@Component({
  selector: 'app-nav',
  imports: [
    NgOptimizedImage,
    RouterOutlet,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzAvatarModule,
    NzDropDownModule,
    NzBadgeModule,
    NzTooltipModule,
    NzDrawerModule,
    Profile,
    Cart,
  ],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Nav implements OnInit {
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  readonly authService = inject(AuthService);
  readonly newOrderService = inject(NewOrderService);
  readonly themeService = inject(ThemeService);
  readonly sideBarItems = SIDE_BAR_ITEMS;

  readonly cartActive = computed(() => this.newOrderService.hasCartItems());
  readonly cartFlash = computed(() => this.newOrderService.cartFlash());
  readonly themeIcon = computed(() => (this.themeService.mode() === 'dark' ? 'sun' : 'moon'));
  readonly themeLabel = computed(() =>
    this.themeService.mode() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
  );

  cycleTheme(): void {
    this.themeService.cycle();
  }

  openCart(): void {
    this.newOrderService.showCart.set(true);
  }

  openProfile(event: MouseEvent): void {
    this.authService.showProfile.set(true);
    // Drop focus from the trigger so it doesn't render as hovered/active after the modal closes.
    (event.currentTarget as HTMLElement | null)?.blur?.();
    (document.activeElement as HTMLElement | null)?.blur?.();
  }

  isCollapsed = signal(false);
  isMobileNavOpen = signal(false);
  currentRoute = signal('home');

  readonly headerTitle = computed(() => {
    const item = SIDE_BAR_ITEMS.find((i) => i.route === this.currentRoute());
    return item?.headerTitle ?? 'Dashboard';
  });

  readonly userImageUrl = computed(() => {
    const image = this.authService.currentUserProfile().image;
    return image ? `${this.baseUrl}/images/user/${image}` : '';
  });

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.updateCurrentRoute());
  }

  ngOnInit(): void {
    this.updateCurrentRoute();
  }

  private updateCurrentRoute(): void {
    const childRoute = this.activatedRoute.firstChild;
    const path = childRoute?.snapshot.routeConfig?.path;
    if (path) {
      this.currentRoute.set(path);
    } else {
      this.currentRoute.set('home');
    }
  }

  navigateTo(item: SideBarItem): void {
    this.currentRoute.set(item.route);
    this.isMobileNavOpen.set(false);
    this.router.navigate(['dashboard', item.route]);
  }

  onLogout(): void {
    this.authService.logout();
  }
}
