import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { useThemeStore } from "@/store/themeStore";

const THEME_STORAGE_KEY = "eu-retail-theme";

describe("themeStore", () => {
  beforeEach(() => {
    localStorage.removeItem(THEME_STORAGE_KEY);
    useThemeStore.setState({ theme: "dark" });
  });

  afterEach(() => {
    localStorage.removeItem(THEME_STORAGE_KEY);
  });

  it("matches app default (dark) after explicit reset", () => {
    expect(useThemeStore.getState().theme).toBe("dark");
  });

  it("toggles from dark to light", () => {
    useThemeStore.getState().toggle();
    expect(useThemeStore.getState().theme).toBe("light");
  });

  it("toggles back from light to dark", () => {
    useThemeStore.getState().toggle();
    useThemeStore.getState().toggle();
    expect(useThemeStore.getState().theme).toBe("dark");
  });
});
