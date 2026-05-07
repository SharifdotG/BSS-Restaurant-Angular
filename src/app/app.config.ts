import {
  ApplicationConfig,
  provideZoneChangeDetection,
  importProvidersFrom,
  InjectionToken,
  isDevMode,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withRouterConfig } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ReactiveFormsModule } from '@angular/forms';

// NgZorro imports
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { provideNzConfig } from 'ng-zorro-antd/core/config';

// Icons
import { IconDefinition } from '@ant-design/icons-angular';
import {
  AccountBookFill,
  AlertFill,
  AlertOutline,
  UserOutline,
  TeamOutline,
  MenuOutline,
  AndroidOutline,
  MenuFoldOutline,
  MenuUnfoldOutline,
  UsergroupAddOutline,
  IdcardOutline,
  GroupOutline,
  OrderedListOutline,
  PlusSquareOutline,
  PieChartOutline,
  PoweroffOutline,
  UserAddOutline,
  LoadingOutline,
  PlusOutline,
  PictureTwoTone,
  WarningOutline,
  PlusCircleOutline,
  CloseCircleOutline,
  PlusCircleTwoTone,
  StarTwoTone,
  CloseOutline,
  ShoppingCartOutline,
  StopOutline,
  EditOutline,
  LogoutOutline,
  EyeOutline,
  EyeInvisibleOutline,
  DashboardOutline,
  DollarOutline,
  CoffeeOutline,
  CalendarOutline,
  CheckCircleOutline,
  InboxOutline,
  AreaChartOutline,
  BarChartOutline,
  FundOutline,
  FallOutline,
  RiseOutline,
} from '@ant-design/icons-angular/icons';

import { routes } from './app.routes';
import { authInterceptor } from './auth/auth.interceptor';

// API Configuration
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');
// As I didn't have the local backend, I used the same URL for both development and production.
// You can change the development URL to your local backend if needed.
const apiBaseUrl = isDevMode() ? 'https://bssrms.runasp.net' : 'https://bssrms.runasp.net';

registerLocaleData(en);

const icons: IconDefinition[] = [
  AccountBookFill,
  AlertOutline,
  AlertFill,
  UserOutline,
  TeamOutline,
  MenuOutline,
  AndroidOutline,
  MenuFoldOutline,
  MenuUnfoldOutline,
  UsergroupAddOutline,
  IdcardOutline,
  GroupOutline,
  OrderedListOutline,
  PlusSquareOutline,
  PieChartOutline,
  PoweroffOutline,
  UserAddOutline,
  LoadingOutline,
  PlusOutline,
  PictureTwoTone,
  WarningOutline,
  PlusCircleOutline,
  CloseCircleOutline,
  PlusCircleTwoTone,
  StarTwoTone,
  CloseOutline,
  ShoppingCartOutline,
  StopOutline,
  EditOutline,
  LogoutOutline,
  EyeOutline,
  EyeInvisibleOutline,
  DashboardOutline,
  DollarOutline,
  CoffeeOutline,
  CalendarOutline,
  CheckCircleOutline,
  InboxOutline,
  AreaChartOutline,
  BarChartOutline,
  FundOutline,
  FallOutline,
  RiseOutline,
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideNzIcons(icons),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withRouterConfig({
        paramsInheritanceStrategy: 'always',
      }),
    ),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: API_BASE_URL, useValue: apiBaseUrl },
    provideNzI18n(en_US),
    provideNzConfig({
      modal: { nzMaskClosable: true },
    }),
    importProvidersFrom(ReactiveFormsModule),
    provideAnimationsAsync(),
  ],
};
