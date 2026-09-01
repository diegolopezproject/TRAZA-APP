"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { es } from "@/content/es";
import type { TrazaImportCategory } from "@/domain/place-import";
import { MobileSheet } from "./mobile-sheet";

const options: ReadonlyArray<{ value: TrazaImportCategory; label: string }> = [
  { value: "food-drink", label: "Comer y beber" },
  { value: "museum-culture", label: "Cultura" },
  { value: "attraction", label: "Lugares" },
  { value: "shopping", label: "Compras" },
];

interface ImportCategorySheetProps {
  onCancel: () => void;
}

export function ImportCategorySheet({ onCancel }: ImportCategorySheetProps) {
  const [pending, setPending] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    if (pending) {
      event.preventDefault();
      return;
    }
    setPending(true);
  }

  return (
    <MobileSheet
      title="¿Dónde guardarías este sitio?"
      kicker="Guardados / Categoría"
      closeLabel={es.forms.close}
      onClose={onCancel}
      footer={
        <button className="secondary-button" type="button" onClick={onCancel} disabled={pending}>
          {es.forms.cancel}
        </button>
      }
    >
      <form
        className="assignment-placement"
        method="post"
        action="/api/imported-places/finalize"
        onSubmit={submit}
      >
        <p>Elige una de las categorías de TRAZA para terminar de guardarlo.</p>
        <div className="placement-options">
          {options.map((option, index) => (
            <button
              key={option.value}
              className="category-choice"
              type="submit"
              name="category"
              value={option.value}
              disabled={pending}
              autoFocus={index === 0}
            >
              <strong>{option.label}</strong>
            </button>
          ))}
        </div>
      </form>
    </MobileSheet>
  );
}
