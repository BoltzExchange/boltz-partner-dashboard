import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import {
    Denomination,
    DenominationProvider,
    useDenomination,
} from "./DenominationContext";

function TestComponent() {
    const {
        denomination,
        setDenomination,
        toggleDenomination,
        formatValue,
        formatSats,
    } = useDenomination();
    return (
        <div>
            <span data-testid="denomination">{denomination}</span>
            <span data-testid="formatted-btc">{formatValue(1.23456789)}</span>
            <span data-testid="formatted-sats">{formatSats(123456789)}</span>
            <button onClick={() => setDenomination(Denomination.BTC)}>
                Set BTC
            </button>
            <button onClick={() => setDenomination(Denomination.SAT)}>
                Set SAT
            </button>
            <button onClick={toggleDenomination}>Toggle</button>
        </div>
    );
}

describe("DenominationContext", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("defaults to SAT denomination", () => {
        render(
            <DenominationProvider>
                <TestComponent />
            </DenominationProvider>,
        );
        expect(screen.getByTestId("denomination")).toHaveTextContent("sat");
    });

    it("formats BTC value as sats when in SAT mode", () => {
        render(
            <DenominationProvider>
                <TestComponent />
            </DenominationProvider>,
        );
        expect(screen.getByTestId("formatted-btc")).toHaveTextContent(
            "123,456,789 sats",
        );
    });

    it("formats sats value as sats when in SAT mode", () => {
        render(
            <DenominationProvider>
                <TestComponent />
            </DenominationProvider>,
        );
        expect(screen.getByTestId("formatted-sats")).toHaveTextContent(
            "123,456,789 sats",
        );
    });

    it("switches to BTC denomination", async () => {
        const user = userEvent.setup();
        render(
            <DenominationProvider>
                <TestComponent />
            </DenominationProvider>,
        );

        await user.click(screen.getByText("Set BTC"));

        expect(screen.getByTestId("denomination")).toHaveTextContent("btc");
        expect(screen.getByTestId("formatted-btc")).toHaveTextContent(
            "1.23456789 BTC",
        );
        expect(screen.getByTestId("formatted-sats")).toHaveTextContent(
            "1.23456789 BTC",
        );
    });

    it("toggles between denominations", async () => {
        const user = userEvent.setup();
        render(
            <DenominationProvider>
                <TestComponent />
            </DenominationProvider>,
        );

        expect(screen.getByTestId("denomination")).toHaveTextContent("sat");

        await user.click(screen.getByText("Toggle"));
        expect(screen.getByTestId("denomination")).toHaveTextContent("btc");

        await user.click(screen.getByText("Toggle"));
        expect(screen.getByTestId("denomination")).toHaveTextContent("sat");
    });

    it("persists denomination to localStorage", async () => {
        const user = userEvent.setup();
        render(
            <DenominationProvider>
                <TestComponent />
            </DenominationProvider>,
        );

        await user.click(screen.getByText("Set BTC"));
        expect(localStorage.getItem("denomination")).toBe("btc");

        await user.click(screen.getByText("Set SAT"));
        expect(localStorage.getItem("denomination")).toBe("sat");
    });

    it("loads denomination from localStorage", () => {
        localStorage.setItem("denomination", "btc");

        render(
            <DenominationProvider>
                <TestComponent />
            </DenominationProvider>,
        );

        expect(screen.getByTestId("denomination")).toHaveTextContent("btc");
    });

    it("throws error when used outside provider", () => {
        const consoleError = console.error;
        console.error = () => {};

        expect(() => render(<TestComponent />)).toThrow(
            "useDenomination must be used within a DenominationProvider",
        );

        console.error = consoleError;
    });
});

describe("formatValue", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("formats zero correctly in SAT mode", () => {
        render(
            <DenominationProvider>
                <TestComponent />
            </DenominationProvider>,
        );
        expect(screen.getByTestId("formatted-btc")).toHaveTextContent("sats");
    });

    it("always shows 8 decimal places in BTC mode", async () => {
        const user = userEvent.setup();

        function TestSmallValue() {
            const { formatValue, setDenomination } = useDenomination();
            return (
                <div>
                    <span data-testid="small">{formatValue(0.001)}</span>
                    <button onClick={() => setDenomination(Denomination.BTC)}>
                        BTC
                    </button>
                </div>
            );
        }

        render(
            <DenominationProvider>
                <TestSmallValue />
            </DenominationProvider>,
        );

        await user.click(screen.getByText("BTC"));
        expect(screen.getByTestId("small")).toHaveTextContent("0.00100000 BTC");
    });
});
