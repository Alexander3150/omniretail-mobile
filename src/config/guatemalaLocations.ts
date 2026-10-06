// Copia de backend/src/main/resources/geo/guatemala-locations.json: el backend
// solo acepta departamento y municipio con el nombre exacto de esta lista.
import locations from "./guatemala-locations.json";

type LocationsFile = {
  departments: { name: string; municipalities: string[] }[];
};

const departments = (locations as LocationsFile).departments;

export const GUATEMALA_DEPARTMENTS: readonly string[] = departments
  .map((department) => department.name)
  .sort((left, right) => left.localeCompare(right, "es"));

export function getGuatemalaMunicipalities(department: string): readonly string[] {
  const municipalities =
    departments.find((item) => item.name === department)?.municipalities ?? [];

  return [...municipalities].sort((left, right) => left.localeCompare(right, "es"));
}

/** Busca el nombre canónico ignorando mayúsculas y tildes ("guatemala" → "Guatemala"). */
export function matchLocationName(
  value: string | undefined,
  options: readonly string[],
): string {
  const normalized = normalize(value ?? "");

  return options.find((option) => normalize(option) === normalized) ?? "";
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}
