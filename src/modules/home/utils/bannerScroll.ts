type ScrollableList = {
  scrollToOffset: (params: { offset: number; animated?: boolean }) => void;
};

type ScrollToIndexFailure = {
  highestMeasuredFrameIndex: number;
};

/**
 * `FlatList` exige manejar `onScrollToIndexFailed`: si se pide un indice que aun no se midio
 * (por ejemplo, al cambiar de banners fijos a diapositivas del panel) lanzaria una excepcion no
 * capturada. En su lugar se lleva la lista hasta el ultimo banner medido.
 */
export function recoverBannerScroll(
  list: ScrollableList | null,
  info: ScrollToIndexFailure,
  bannerWidth: number,
): void {
  list?.scrollToOffset({
    offset: Math.max(0, info.highestMeasuredFrameIndex) * bannerWidth,
    animated: false,
  });
}
