import { Directive, TemplateRef, inject, input } from '@angular/core';

export type FeatureTableColumnAlign = 'left' | 'center' | 'right';

@Directive({
  selector: '[ftColumn]',
  standalone: true,
})
export class FeatureTableColumnDirective {
  readonly template = inject<TemplateRef<{ $implicit: unknown; row: unknown }>>(TemplateRef);

  readonly ftColumn = input.required<string>();
  readonly ftLabel = input<string>('');
  readonly ftWidth = input<string>('auto');
  readonly ftAlign = input<FeatureTableColumnAlign>('left');
}
