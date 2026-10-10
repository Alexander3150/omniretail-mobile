import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import type { BusinessConfig, BusinessHeroSlide } from "@/core";
import { useRepositories } from "@/infrastructure";

/** Nombre que se muestra mientras llega la configuración o si no se puede leer. */
export const DEFAULT_STORE_NAME = "FERREPHARMA";

// Referencia estable: evita recalcular el carrusel en cada render mientras no hay configuracion.
const NO_SLIDES: BusinessHeroSlide[] = [];

/**
 * Configuración pública de la tienda (nombre, logo, carrusel y contacto) configurada desde el
 * panel web. Se vuelve a leer cada vez que la pantalla toma el foco; el servicio la cachea unos
 * segundos, así que varias pantallas no repiten la petición. Sin conexión se conservan los
 * últimos valores leídos (o los valores por defecto).
 */
export function useBusinessConfig() {
  const { businessConfigRepository } = useRepositories();
  const [config, setConfig] = useState<BusinessConfig | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      businessConfigRepository.getCurrent().then(
        (current) => {
          if (active) setConfig(current);
        },
        () => undefined,
      );

      return () => {
        active = false;
      };
    }, [businessConfigRepository]),
  );

  return {
    config,
    storeName: config?.name?.trim() || DEFAULT_STORE_NAME,
    logoUri: config?.logoUri,
    heroSlides: config?.heroSlides ?? NO_SLIDES,
  };
}
