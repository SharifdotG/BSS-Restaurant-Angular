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
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzBadgeModule } from 'ng-zorro-antd/badge';

import { AuthService } from '../../auth/auth.service';
import { Profile } from '../profile/profile';
import { Cart } from '../../new-order/cart/cart';
import { NewOrderService } from '../../new-order/new-order.service';
import { API_BASE_URL } from '../../app.config';

interface SideBarItem {
  label: string;
  icon: string;
  route: string;
  headerTitle: string;
}

const SIDE_BAR_ITEMS: readonly SideBarItem[] = [
  { label: 'Dashboard', icon: 'dashboard', route: 'home', headerTitle: 'Dashboard' },
  { label: 'Employees', icon: 'idcard', route: 'employees', headerTitle: 'Employee Management' },
  { label: 'Tables', icon: 'group', route: 'tables', headerTitle: 'Table Management' },
  { label: 'Foods', icon: 'pie-chart', route: 'foods', headerTitle: 'Food Item Management' },
  { label: 'New Order', icon: 'plus-square', route: 'new-order', headerTitle: 'Create New Order' },
  { label: 'Orders', icon: 'ordered-list', route: 'orders', headerTitle: 'Order Management' },
  { label: 'Expenses', icon: 'dollar', route: 'expenses', headerTitle: 'Expense Management' },
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
  private readonly responsive = inject(BreakpointObserver);
  readonly authService = inject(AuthService);
  readonly newOrderService = inject(NewOrderService);
  readonly sideBarItems = SIDE_BAR_ITEMS;

  readonly cartItemCount = computed(() =>
    this.newOrderService.cartFood().reduce((sum, item) => sum + item.quantity, 0),
  );

  openCart(): void {
    this.newOrderService.showCart.set(true);
  }

  isCollapsed = signal(true);
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

    this.responsive
      .observe([Breakpoints.Large])
      .pipe(takeUntilDestroyed())
      .subscribe((result) => this.isCollapsed.set(!result.matches));
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
    this.router.navigate(['dashboard', item.route]);
  }

  onLogout(): void {
    this.authService.logout();
  }

  showSider(): void {
    this.isCollapsed.set(false);
  }

  hideSider(): void {
    this.isCollapsed.set(true);
  }
}
