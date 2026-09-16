/** Ajustes del iframe de impresión (el tema completo se copia desde la página). */
export const CLINICAL_PRINT_IFRAME_OVERRIDES = `
@media print {
  html,
  body,
  .section-card,
  .clinical-header--intake,
  .field-grid label,
  .entry-card,
  .clinical-field-box,
  .info-box,
  .vgi-box {
    print-color-adjust: unset !important;
    -webkit-print-color-adjust: unset !important;
  }

  .photo-attach-img,
  .body-graphic-print-view img,
  .clinical-header--intake img {
    print-color-adjust: exact !important;
    -webkit-print-color-adjust: exact !important;
  }

  /* Evita cortar números/bordes de escalas entre páginas */
  .scale-question-option {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    align-items: center !important;
    overflow: visible !important;
  }

  .scale-option-label {
    flex: 1 1 auto !important;
    min-width: 0 !important;
    padding-right: 0.35rem !important;
  }

  .scale-option-score {
    flex: 0 0 1.85rem !important;
    width: 1.85rem !important;
    min-width: 1.85rem !important;
    height: 1.85rem !important;
    padding: 0 !important;
    overflow: hidden !important;
    box-sizing: border-box !important;
  }

  .scale-question-option--selected .scale-option-score,
  .scale-question-option:has(input:checked) .scale-option-score {
    print-color-adjust: exact !important;
    -webkit-print-color-adjust: exact !important;
    border-color: var(--lun-gold) !important;
    background: linear-gradient(145deg, #f5c518, #c8922d) !important;
    color: #fff !important;
  }

  .scale-question-text,
  .scale-question-text--title,
  .scale-question-text--section {
    break-after: avoid !important;
    page-break-after: avoid !important;
  }

  .scale-total {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }

  .section-card,
  .field-grid label,
  .clinical-header--intake,
  .entry-card,
  .clinical-field-box,
  .scale-question-item,
  .scale-question-item--group-box {
    box-decoration-break: clone !important;
    -webkit-box-decoration-break: clone !important;
  }
}

body.clinical-print-mode app-clinical-body-scratch,
body.clinical-print-mode .body-graphic-hint,
body.clinical-print-mode .btn:not(.intake-print-banner-btn),
body.clinical-print-mode button:not(.intake-print-banner-btn),
body.clinical-print-mode .photo-attach-clear,
body.clinical-print-mode .pdf-attach-clear,
body.clinical-print-mode .pdf-attach-replace,
body.clinical-print-mode .link-remove,
body.clinical-print-mode .section-action-row,
body.clinical-print-mode .photo-attach-overlay,
body.clinical-print-mode .photo-attach-plus,
body.clinical-print-mode .photo-attach-hover,
body.clinical-print-mode input[type='file'],
body.clinical-print-mode .multi-photo-add,
body.clinical-print-mode .intake-form-toast,
body.clinical-print-mode .intake-form-error {
  display: none !important;
}

body.clinical-print-mode .body-graphic-print-sheet {
  display: grid !important;
  grid-template-columns: 1fr 1fr;
  gap: 0.65rem;
}

body.clinical-print-mode .photo-attach-readonly-label {
  display: none !important;
}

body.clinical-print-mode .intake-print-banner {
  display: block !important;
}

body.clinical-print-mode .intake-print-banner-actions {
  display: flex !important;
  flex-wrap: wrap;
  gap: 0.5rem;
}

body.clinical-print-mode .intake-print-banner-btn {
  display: inline-flex !important;
  pointer-events: auto !important;
}

body.clinical-print-mode .personal-with-photo,
body.clinical-print-mode .acudiente-with-photo {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  flex-wrap: nowrap;
  gap: 1.5rem;
  width: 100%;
}

body.clinical-print-mode .personal-with-photo .field-grid,
body.clinical-print-mode .acudiente-with-photo .field-grid {
  order: 1;
  flex: 1;
  min-width: 0;
}

body.clinical-print-mode .personal-with-photo .photo-attach-col,
body.clinical-print-mode .acudiente-with-photo .photo-attach-col {
  order: 2;
  flex-shrink: 0;
  align-self: stretch;
}

body.clinical-print-mode .acudiente-with-photo .photo-attach-col .photo-attach--portrait:not(.photo-attach--filled) {
  height: 100%;
  min-height: 4.5cm;
}
`;

/** Respaldo mínimo si falla la copia de estilos del tema. */
export const CLINICAL_PRINT_STYLES = `
@page { size: A4 portrait; margin: 12mm 14mm; }
html, body { margin: 0; background: #fff; color: #3d2b1f; font-family: Inter, 'Segoe UI', system-ui, sans-serif; }
`;
