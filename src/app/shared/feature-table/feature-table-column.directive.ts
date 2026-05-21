import { Directive, TemplateRef, inject, input } from '@angular/core';

export type FeatureTableColumnAlign = 'left' | 'center' | 'right';

@Directive({
  selector: '[ftColumn]',
  standalone: true,
})
export class FeatureTableColumnDirective {
  readonly template = inject<TemplateRef<{ $implicit: unknown; row: unknown }>>(TemplateRef);

  /** Unique column key. Use `actions` for the trailing action column. */
  readonly ftColumn = input.required<string>();
  /** Header label. Empty for image / actions columns. */
  readonly ftLabel = input<string>('');
  /** CSS width (e.g. "120px", "auto"). Used to build nzWidthConfig. */
  readonly ftWidth = input<string>('auto');
  /** Horizontal alignment for the cell content and header. */
  readonly ftAlign = input<FeatureTableColumnAlign>('left');
}
