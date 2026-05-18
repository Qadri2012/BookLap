import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import Home from "./home";

const mockGetLapangan = vi.hoisted(() => vi.fn());

vi.mock("../services/api", () => ({
  getLapangan: mockGetLapangan,
}));

vi.mock("../components/navbar", () => ({
  default: () => <div>Navbar</div>,
}));

vi.mock("../components/Footer", () => ({
  default: () => <div>Footer</div>,
}));

vi.mock("../components/BallImageSection", () => ({
  default: () => <div>BallImageSection</div>,
}));

describe("Home", () => {
  beforeEach(() => {
    mockGetLapangan.mockReset();
    mockGetLapangan.mockResolvedValue([]);
  });

  test("menampilkan hero utama dan tombol pencarian", async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(
      await screen.findByRole("heading", {
        name: /selamat datang di website booklap/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /cari lapangan sekarang!/i })
    ).toBeInTheDocument();
  });
});