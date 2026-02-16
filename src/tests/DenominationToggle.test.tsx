import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import DenominationToggle from "../components/DenominationToggle";
import { DenominationProvider } from "../contexts/DenominationContext";

function renderWithProvider() {
    return render(
        <DenominationProvider>
            <DenominationToggle />
        </DenominationProvider>,
    );
}

describe("DenominationToggle", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("renders BTC and sats buttons", () => {
        renderWithProvider();
        expect(screen.getByText("BTC")).toBeInTheDocument();
        expect(screen.getByText("sats")).toBeInTheDocument();
    });

    it("highlights sats button by default", () => {
        renderWithProvider();
        const satsButton = screen.getByText("sats");
        expect(satsButton).toHaveClass("bg-boltz-primary");
    });

    it("switches to BTC when BTC button clicked", async () => {
        const user = userEvent.setup();
        renderWithProvider();

        await user.click(screen.getByText("BTC"));

        const btcButton = screen.getByText("BTC");
        const satsButton = screen.getByText("sats");
        expect(btcButton).toHaveClass("bg-boltz-primary");
        expect(satsButton).not.toHaveClass("bg-boltz-primary");
    });

    it("switches back to sats when sats button clicked", async () => {
        const user = userEvent.setup();
        renderWithProvider();

        await user.click(screen.getByText("BTC"));
        await user.click(screen.getByText("sats"));

        const satsButton = screen.getByText("sats");
        expect(satsButton).toHaveClass("bg-boltz-primary");
    });

    it("persists selection to localStorage", async () => {
        const user = userEvent.setup();
        renderWithProvider();

        await user.click(screen.getByText("BTC"));
        expect(localStorage.getItem("denomination")).toBe("btc");
    });
});
