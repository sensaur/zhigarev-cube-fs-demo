import { NavLink } from "react-router-dom";
import { routes } from "@/routes";
import { useThemeStore } from "@/store/themeStore";

const linkBase: React.CSSProperties = {
  padding: "6px 14px",
  borderRadius: 6,
  fontSize: "0.85rem",
  fontWeight: 500,
  textDecoration: "none",
  transition: "background 0.15s, color 0.15s",
};

const activeStyle: React.CSSProperties = {
  ...linkBase,
  background: "var(--bs-primary)",
  color: "#fff",
};

const inactiveStyle: React.CSSProperties = {
  ...linkBase,
  background: "transparent",
  color: "var(--bs-secondary-color)",
};

const toggleStyle: React.CSSProperties = {
  fontSize: "0.8rem",
  border: "1px solid var(--bs-border-color)",
  borderRadius: 6,
  padding: "4px 10px",
  color: "var(--bs-body-color)",
  background: "var(--bs-tertiary-bg)",
};

function navLinkStyle({ isActive }: { isActive: boolean }): React.CSSProperties {
  return isActive ? activeStyle : inactiveStyle;
}

export default function AppNavbar() {
  const theme = useThemeStore((s) => s.theme);
  const toggle = useThemeStore((s) => s.toggle);
  const isDark = theme === "dark";

  return (
    <nav className="d-flex align-items-center gap-2 px-3 py-2 border-bottom">
      <span className="fw-bold me-3" style={{ fontSize: "0.95rem" }}>
        EU Retail
      </span>

      {routes.map((r) => (
        <NavLink key={r.path} to={r.path} end style={navLinkStyle}>
          {r.label}
        </NavLink>
      ))}

      <button
        type="button"
        onClick={toggle}
        className="btn btn-sm ms-auto d-flex align-items-center gap-1"
        style={toggleStyle}
      >
        {isDark ? "\u2600\uFE0F" : "\u{1F319}"} {isDark ? "Light" : "Dark"}
      </button>
    </nav>
  );
}
