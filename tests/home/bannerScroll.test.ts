import { describe, expect, it, vi } from "vitest";

import { recoverBannerScroll } from "@/modules/home/utils/bannerScroll";

describe("recoverBannerScroll", () => {
  it("lleva la lista hasta el ultimo banner medido, sin animacion", () => {
    const list = { scrollToOffset: vi.fn() };

    recoverBannerScroll(list, { highestMeasuredFrameIndex: 2 }, 300);

    expect(list.scrollToOffset).toHaveBeenCalledWith({ offset: 600, animated: false });
  });

  it("nunca usa un desplazamiento negativo", () => {
    const list = { scrollToOffset: vi.fn() };

    recoverBannerScroll(list, { highestMeasuredFrameIndex: -1 }, 300);

    expect(list.scrollToOffset).toHaveBeenCalledWith({ offset: 0, animated: false });
  });

  it("no falla si la lista aun no existe", () => {
    expect(() => recoverBannerScroll(null, { highestMeasuredFrameIndex: 1 }, 300)).not.toThrow();
  });
});
