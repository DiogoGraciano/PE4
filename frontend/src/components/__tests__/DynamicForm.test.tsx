import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import DynamicForm from '../DynamicForm';
import type { QuestionField } from '../../types';

const fields: QuestionField[] = [
  { id: 'nome', type: 'input', label: 'Nome', required: true, placeholder: 'Seu nome' },
  { id: 'sobre', type: 'textarea', label: 'Sobre você', validation: { minLength: 5, maxLength: 50 } },
  { id: 'curso', type: 'select', label: 'Curso', options: ['ADS', 'Eng'] },
  { id: 'cores', type: 'checkbox', label: 'Cores', options: ['vermelho', 'azul'] },
  { id: 'turno', type: 'radio', label: 'Turno', options: ['manhã', 'tarde'] },
  { id: 'cpf', type: 'input', label: 'CPF', validation: { pattern: '^\\d{3}$' } },
];

describe('DynamicForm', () => {
  it('renders every supported field type', () => {
    render(<DynamicForm fields={fields} onSubmit={vi.fn()} />);
    expect(screen.getByPlaceholderText('Seu nome')).toBeInTheDocument();
    expect(screen.getAllByRole('textbox').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByLabelText('vermelho')).toBeInTheDocument();
    expect(screen.getByLabelText('manhã')).toBeInTheDocument();
  });

  it('blocks submit when required field is empty and shows error', async () => {
    const onSubmit = vi.fn();
    render(<DynamicForm fields={fields} onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
  });

  it('validates minLength, maxLength and pattern', async () => {
    const onSubmit = vi.fn();
    render(<DynamicForm fields={fields} onSubmit={onSubmit} />);
    const textareas = screen.getAllByRole('textbox');
    // index 0 = nome (input), 1 = sobre (textarea), 2 = cpf (input)
    await userEvent.type(textareas[0], 'John');
    await userEvent.type(textareas[1], 'abc');
    await userEvent.type(textareas[2], '12');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/pelo menos 5 caracteres/)).toBeInTheDocument();
    expect(screen.getByText(/CPF tem formato inválido/)).toBeInTheDocument();
  });

  it('submits when valid and includes typed values', async () => {
    const onSubmit = vi.fn();
    render(<DynamicForm fields={fields} onSubmit={onSubmit} />);
    const textboxes = screen.getAllByRole('textbox');
    await userEvent.type(textboxes[0], 'John');
    await userEvent.type(textboxes[2], '123');
    await userEvent.click(screen.getByLabelText('vermelho'));
    await userEvent.click(screen.getByLabelText('vermelho')); // uncheck
    await userEvent.click(screen.getByLabelText('azul'));
    await userEvent.click(screen.getByLabelText('manhã'));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'ADS' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      nome: 'John',
      curso: 'ADS',
      turno: 'manhã',
      cpf: '123',
      cores: ['azul'],
    });
  });

  it('does not render submit buttons in readOnly mode', () => {
    render(<DynamicForm fields={fields} onSubmit={vi.fn()} readOnly />);
    expect(screen.queryByRole('button', { name: 'Enviar' })).not.toBeInTheDocument();
  });

  it('calls onCancel when cancel button clicked', async () => {
    const onCancel = vi.fn();
    render(<DynamicForm fields={fields} onSubmit={vi.fn()} onCancel={onCancel} cancelLabel="X" />);
    await userEvent.click(screen.getByRole('button', { name: 'X' }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('handles non-array fields gracefully', () => {
    render(<DynamicForm fields={null as unknown as QuestionField[]} onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument();
  });
});
