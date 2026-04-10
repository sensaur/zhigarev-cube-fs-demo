import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";

function renderNavbar() {
  return render(
    <MemoryRouter>
      <AppNavbar />
    </MemoryRouter>,
  );
}

describe("AppNavbar", () => {
  it("renders the brand text", () => {
    renderNavbar();
    expect(screen.getByText("EU Retail")).toBeInTheDocument();
  });

  it("renders all navigation links", () => {
    renderNavbar();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Sales Table")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Live Map")).toBeInTheDocument();
    expect(screen.getByText("Request Log")).toBeInTheDocument();
    expect(screen.getByText("AI Chat")).toBeInTheDocument();
  });

  it("renders the theme toggle with an accessible name", () => {
    renderNavbar();
    expect(
      screen.getByRole("button", { name: /light|dark/i }),
    ).toBeInTheDocument();
  });
});
