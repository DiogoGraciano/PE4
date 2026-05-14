import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FormSection from '../FormSection';

describe('FormSection', () => {
  it('renders title and children', () => {
    render(
      <FormSection title="Seção" className="extra">
        <p>conteúdo</p>
      </FormSection>,
    );
    expect(screen.getByRole('heading', { name: 'Seção' })).toBeInTheDocument();
    expect(screen.getByText('conteúdo')).toBeInTheDocument();
  });
});
