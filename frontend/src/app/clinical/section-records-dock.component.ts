import { Component, Input, computed, inject } from '@angular/core';
import {
  accordionBarTitle,
  sectionDisplayRows,
  sectionHasData,
} from './section-display';
import { IntakeRecord, IntakeStoreService } from './intake-store.service';
import { sectionByPath } from './clinical-sections';

@Component({
  selector: 'app-section-records-dock',
  standalone: true,
  template: `
    <section class="records-dock">
      <header class="records-dock-head">
        <h2>Información enviada en esta ficha</h2>
        @if (currentRecord(); as rec) {
          <p>
            Adulto mayor: <strong>{{ rec.nombre }}</strong>
            @if (rec.identificacion) {
              · Cédula {{ rec.identificacion }}
            }
            — pulse la barra para ver lo registrado en este apartado.
          </p>
        } @else {
          <p>Abra una ficha creada desde el inicio (no se accede por nombre/cédula aquí).</p>
        }
      </header>

      @if (!currentRecord()) {
        <div class="lun-empty">
          No hay ficha activa. Vaya al inicio y use «Crear ficha de ingreso» para una persona nueva.
        </div>
      } @else if (!hasDataForSection()) {
        <div class="lun-empty">
          Aún no hay datos en este apartado. Use el botón «Agregar…», complete y pulse Enviar.
        </div>
      } @else {
        <div class="record-bars">
          <details class="record-bar" open>
            <summary>{{ barTitle(currentRecord()!) }}</summary>
            <div class="record-bar-body">
              <table class="lun-table">
                <thead>
                  <tr>
                    <th>Campo</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  @for (row of rows(currentRecord()!); track row.label) {
                    <tr>
                      <td class="col-field">{{ row.label }}</td>
                      <td>{{ row.value }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </details>
        </div>
      }
    </section>
  `,
})
export class SectionRecordsDockComponent {
  @Input({ required: true }) sectionId = 'contrato';

  readonly store = inject(IntakeStoreService);

  readonly currentRecord = computed(() => this.store.currentRecord());

  hasDataForSection(): boolean {
    const rec = this.currentRecord();
    return rec ? sectionHasData(this.sectionId, rec.data) : false;
  }

  barTitle(rec: IntakeRecord): string {
    const label = sectionByPath(this.sectionId)?.label ?? 'Información';
    return accordionBarTitle(label, rec.nombre);
  }

  rows(rec: IntakeRecord) {
    return sectionDisplayRows(this.sectionId, rec.data);
  }
}
