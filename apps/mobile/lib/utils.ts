import { clsx, type ClassValue } from "clsx";
import { artDevotional, artSecular, artPregnancy } from "./content";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function resolveImageSource(art: any, category?: string) {
  if (typeof art === "string" && art.trim().length > 0) {
    return { uri: art };
  }
  // If art is already an object (like { uri: ... }) or local asset require number
  if (art && (typeof art === "object" || typeof art === "number")) {
    return art;
  }
  // Fallbacks based on category
  if (category === "devotional") return artDevotional;
  if (category === "secular") return artSecular;
  if (category === "pregnancy") return artPregnancy;
  return artDevotional; // default fallback
}

