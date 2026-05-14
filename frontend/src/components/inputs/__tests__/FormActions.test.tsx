import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import FormActions from '../FormActions';

describe('FormActions', () => {
  it('renders default labels and triggers callbacks', async () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    render(<FormActions onSubmit={onSubmit} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onSubmit).toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalled();
  });

  it('shows loading label and disables buttons', () => {
    render(<FormActions onSubmit={() => {}} onCancel={() => {}} isLoading />);
    expect(screen.getByRole('button', { name: 'Salvando...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  });

  it('uses custom labels', () => {
    render(
      <FormActions
        onSubmit={() => {}}
        onCancel={() => {}}
        submitLabel="Confirmar"
        cancelLabel="Voltar"
      />,
    );
    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Voltar' })).toBeInTheDocument();
  });
});
