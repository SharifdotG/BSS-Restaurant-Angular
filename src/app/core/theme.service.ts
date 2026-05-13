import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'bss-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly win = this.doc.defaultView!;
  private readonly systemQuery = this.win.matchMedia('(prefers-color-scheme: dark)');

  readonly mode = signal<ThemeMode>(this.initialMode());
  readonly resolvedTheme = computed<ThemeMode>(() => this.mode());

  constructor() {
    effect(() => {
      const theme = this.mode();
      const root = this.doc.documentElement;
      root.setAttribute('data-theme', theme);
      root.style.colorScheme = theme;
      try {
        this.win.localStorage.setItem(STORAGE_KEY, theme);
      } catch {
        /* storage may be blocked — non-fatal */
      }
    });
  }

  setMode(mode: ThemeMode): void {
    this.mode.set(mode);
  }

  /** Toggle between light and dark. */
  cycle(): void {
    this.mode.set(this.mode() === 'dark' ? 'light' : 'dark');
  }

  private initialMode(): ThemeMode {
    try {
      const v = this.win.localStorage.getItem(STORAGE_KEY);
      if (v === 'light' || v === 'dark') return v;
    } catch {
      /* ignore */
    }
    return this.systemQuery.matches ? 'dark' : 'light';
  }
}
