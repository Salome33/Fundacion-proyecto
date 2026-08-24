import { Component } from '@angular/core';
import { NursingNotesPanelComponent } from './nursing-notes-panel.component';

@Component({
  selector: 'app-nursing-notes-view',
  standalone: true,
  imports: [NursingNotesPanelComponent],
  styleUrl: './clinical-theme.css',
  template: `
    <div class="app-view app-view--wide">
      <app-nursing-notes-panel [embedded]="true" />
    </div>
  `,
})
export class NursingNotesViewComponent {}
