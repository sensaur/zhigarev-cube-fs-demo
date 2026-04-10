import { describe, it, expect } from "vitest";
import { routes } from "@/routes";

describe("routes configuration", () => {
  it("defines 6 routes", () => {
    expect(routes).toHaveLength(6);
  });

  it("every route has path, label, and component", () => {
    routes.forEach((route) => {
      expect(route.path).toBeTruthy();
      expect(route.label).toBeTruthy();
      expect(route.component).toBeDefined();
    });
  });

  it("includes the AI Chat route", () => {
    const aiRoute = routes.find((r) => r.path === "/ai-chat");
    expect(aiRoute).toBeDefined();
    expect(aiRoute!.label).toBe("AI Chat");
  });

  it("has home route at /", () => {
    const homeRoute = routes.find((r) => r.path === "/");
    expect(homeRoute).toBeDefined();
    expect(homeRoute!.label).toBe("Home");
  });
});
