import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatsCard from './StatsCard';
import { TrendingUp } from 'lucide-react';

describe('StatsCard', () => {
  const defaultProps = {
    title: 'Test Title',
    value: '1,234',
    icon: <TrendingUp data-testid="icon" />,
  };

  it('renders title and value', () => {
    render(<StatsCard {...defaultProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<StatsCard {...defaultProps} subtitle="Test subtitle" />);
    expect(screen.getByText('Test subtitle')).toBeInTheDocument();
  });

  it('shows change indicator when change is provided', () => {
    render(<StatsCard {...defaultProps} change={5.5} />);
    expect(screen.getByText('+5.5%')).toBeInTheDocument();
  });

  it('hides change indicator when showChange is false', () => {
    render(<StatsCard {...defaultProps} change={5.5} showChange={false} />);
    expect(screen.queryByText('+5.5%')).not.toBeInTheDocument();
  });

  it('shows positive change with correct styling', () => {
    render(<StatsCard {...defaultProps} change={10} />);
    const changeElement = screen.getByText('+10.0%').closest('div');
    expect(changeElement).toHaveClass('text-boltz-primary');
  });

  it('shows negative change with correct styling', () => {
    render(<StatsCard {...defaultProps} change={-10} />);
    const changeElement = screen.getByText('-10.0%').closest('div');
    expect(changeElement).toHaveClass('text-red-400');
  });

  it('shows zero change with muted styling', () => {
    render(<StatsCard {...defaultProps} change={0} />);
    const changeElement = screen.getByText('0.0%').closest('div');
    expect(changeElement).toHaveClass('text-text-muted');
  });

  it('renders icon', () => {
    render(<StatsCard {...defaultProps} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});
