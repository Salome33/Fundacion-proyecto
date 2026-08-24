import { Component } from '@angular/core';
import { DailyVitalsPanelComponent } from './daily-vitals-panel.component';

@Component({
  selector: 'app-vitals-view',
  standalone: true,
  imports: [DailyVitalsPanelComponent],
  styleUrl: './clinical-theme.css',
  template: `
    <div class="app-view app-view--wide">
      <app-daily-vitals-panel [embedded]="true" />
    </div>
  `,
})
export class VitalsViewComponent {}
