import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test } from "vitest";
import Login from "./login";

describe("Login Page", () => {
  test("menampilkan form login awal", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /masuk →/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/lupa password/i)).toBeInTheDocument();
  });

  test("berpindah ke mode register", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/daftar sekarang/i));

    expect(screen.getByText(/buat akun baru/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/nama lengkap/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/nomor hp/i)).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/konfirmasi password/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /daftar sekarang →/i })
    ).toBeInTheDocument();
  });
});