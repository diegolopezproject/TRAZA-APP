import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button } from "./actions";
import { StatusBadge } from "./content";
import { TextField } from "./forms";
import { BottomNavigation } from "./navigation";
import { sheetFocusableSelector } from "./feedback";
import { coreStatusVariants } from "../foundations/foundations";

describe("Core interactive contracts", () => {
  it("marks exactly one navbar destination as current", () => {
    const markup = renderToStaticMarkup(<BottomNavigation items={[{ id: "journey", label: "Días", icon: "D" }, { id: "saved", label: "Guardados", icon: "G" }, { id: "trip", label: "Viaje", icon: "V" }]} active="saved" onChange={() => undefined} label="Secciones" />);
    expect(markup.match(/aria-current="page"/g)).toHaveLength(1); expect(markup).toContain("Guardados");
  });
  it("keeps loading buttons named, busy and disabled", () => { const markup = renderToStaticMarkup(<Button loading>Guardar</Button>); expect(markup).toContain("aria-busy=\"true\""); expect(markup).toContain("disabled=\"\""); expect(markup).toContain("Cargando…"); });
  it("connects form errors to invalid fields", () => { const markup = renderToStaticMarkup(<TextField id="place" label="Lugar" error="Campo obligatorio" />); expect(markup).toContain("aria-invalid=\"true\""); expect(markup).toContain("aria-describedby=\"place-error\""); expect(markup).toContain("role=\"alert\""); });
  it("renders every stable status variant", () => { const markup = coreStatusVariants.map((status) => renderToStaticMarkup(<StatusBadge status={status} />)).join(""); for (const status of coreStatusVariants) expect(markup).toContain(`ds-status-badge--${status}`); });
  it("keeps all sheet control families in the focus trap", () => { for (const control of ["button", "a[href]", "input", "select", "textarea", "tabindex"]) expect(sheetFocusableSelector).toContain(control); });
});
