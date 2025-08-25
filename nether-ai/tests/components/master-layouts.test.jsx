import React from 'react';
import { render } from '@testing-library/react';
import {
  MasterHero,
  MasterSplit,
  MasterGrid,
  MasterQuote,
  MasterDashboard
} from '../../src/components/layouts/master/';

describe('Master Layout Components', () => {
  test('MasterHero renders with title', () => {
    const { getByText } = render(
      <MasterHero content={{ title: 'Test Title' }} />
    );
    expect(getByText('Test Title')).toBeInTheDocument();
  });

  test('MasterSplit renders with left/right content', () => {
    const { getByText } = render(
      <MasterSplit 
        content={{
          left: { title: 'Left' },
          right: { title: 'Right' }
        }} 
      />
    );
    expect(getByText('Left')).toBeInTheDocument();
    expect(getByText('Right')).toBeInTheDocument();
  });

  test('MasterGrid renders items', () => {
    const { getAllByTestId } = render(
      <MasterGrid content={{
        items: [
          { title: 'Item 1' },
          { title: 'Item 2' }
        ]
      }} />
    );
    expect(getAllByTestId('grid-item').length).toBe(2);
  });

  test('MasterQuote renders quote text', () => {
    const { getByText } = render(
      <MasterQuote content={{ quote: 'Test Quote' }} />
    );
    expect(getByText('Test Quote')).toBeInTheDocument();
  });

  test('MasterDashboard renders KPIs', () => {
    const { getByText } = render(
      <MasterDashboard content={{
        kpis: [
          { label: 'Revenue', value: '$1M' }
        ]
      }} />
    );
    expect(getByText('Revenue')).toBeInTheDocument();
    expect(getByText('$1M')).toBeInTheDocument();
  });
});
