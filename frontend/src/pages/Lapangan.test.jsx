import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import Lapangan from "./lapangan";

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

describe("Lapangan", () => {
  beforeEach(() => {
    mockGetLapangan.mockReset();
    mockGetLapangan.mockResolvedValue([
      {
        id: "1",
        nama: "Galaxy Futsal Centre",
        tipe: "Futsal",
        alamat: "Jl. Pelita No.1, Parepare",
        rating: 4.8,
        reviews: 12,
        foto: ["https://example.com/futsal.jpg"],
      },
    ]);
  });

  test("menampilkan hero dan kartu lapangan", async () => {
    render(
      <MemoryRouter>
        <Lapangan />
      </MemoryRouter>
    );

    expect(
      await screen.findByRole("heading", {
        name: /jelajahi lapangan terbaik/i,
      })
    ).toBeInTheDocument();

    expect(
      await screen.findByText("Galaxy Futsal Centre")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /lihat detail lapangan/i })
    ).toBeInTheDocument();
  });
});