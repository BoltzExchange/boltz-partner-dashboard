import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DenominationProvider } from '../contexts/DenominationContext';
import MonthlyTable from './MonthlyTable';
import { MonthlyStats } from '../types';

const mockData: MonthlyStats[] = [
  { month: 'Nov', year: 2025, volumeBtc: 10, swapCount: 100, avgSwapSize: 100000, volumeChange: 5, swapChange: 10 },
  { month: 'Dec', year: 2025, volumeBtc: 15, swapCount: 150, avgSwapSize: 100000, volumeChange: 50, swapChange: 50 },
  { month: 'Jan', year: 2026, volumeBtc: 20, swapCount: 200, avgSwapSize: 100000, volumeChange: 33.3, swapChange: 33.3 },
];

function renderWithProvider(data: MonthlyStats[] = mockData) {
  return render(
    <DenominationProvider>
      <MonthlyTable data={data} />
    </DenominationProvider>
  );
}

describe('MonthlyTable', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders table with correct headers', () => {
    renderWithProvider();
    expect(screen.getByText('Month')).toBeInTheDocument();
    expect(screen.getByText('Volume')).toBeInTheDocument();
    expect(screen.getByText('Swaps')).toBeInTheDocument();
    expect(screen.getByText('Avg Size')).toBeInTheDocument();
  });

  it('defaults to sorting by date descending', () => {
    renderWithProvider();
    const rows = screen.getAllByRole('row');
    const firstDataRow = rows[1];
    expect(within(firstDataRow).getByText('Jan 2026')).toBeInTheDocument();
  });

  it('sorts by volume when volume header clicked', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByText('Volume'));

    const rows = screen.getAllByRole('row');
    const firstDataRow = rows[1];
    expect(within(firstDataRow).getByText('Jan 2026')).toBeInTheDocument();
  });

  it('reverses sort direction when same header clicked twice', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByText('Volume'));
    await user.click(screen.getByText('Volume'));

    const rows = screen.getAllByRole('row');
    const firstDataRow = rows[1];
    expect(within(firstDataRow).getByText('Nov 2025')).toBeInTheDocument();
  });

  it('shows sort indicator on active column', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const monthHeader = screen.getByText('Month').closest('th');
    expect(monthHeader?.querySelector('svg')).toBeInTheDocument();

    await user.click(screen.getByText('Volume'));

    const volumeHeader = screen.getByText('Volume').closest('th');
    expect(volumeHeader?.querySelector('svg')).toBeInTheDocument();
  });
});

describe('MonthlyTable - current month highlighting', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-15'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('highlights current month row', () => {
    renderWithProvider();
    const rows = screen.getAllByRole('row');
    const janRow = rows.find(row => within(row).queryByText('Jan 2026'));
    expect(janRow).toHaveClass('bg-text-muted/5');
  });

  it('styles current month text as muted', () => {
    renderWithProvider();
    const janCell = screen.getByText('Jan 2026');
    expect(janCell).toHaveClass('text-text-muted');
  });
});
