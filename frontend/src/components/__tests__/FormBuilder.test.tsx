import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import FormBuilder from '../FormBuilder';
import type { QuestionField } from '../../types';

function Harness({ initial }: { initial: QuestionField[] }) {
  const [fields, setFields] = useState<QuestionField[]>(initial);
  return <FormBuilder fields={fields} onChange={setFields} />;
}

const inputField = (id: string, type: QuestionField['type'] = 'input'): QuestionField => ({
  id,
  type,
  label: `Campo ${id}`,
  required: false,
  ...(type === 'select' || type === 'checkbox' || type === 'radio'
    ? { options: ['A', 'B'] }
    : {}),
});

describe('FormBuilder', () => {
  it('renders empty state when fields empty', () => {
    render(<FormBuilder fields={[]} onChange={() => {}} />);
    expect(screen.getByText('Nenhum campo adicionado')).toBeInTheDocument();
  });

  it('opens add field modal and adds each field type', async () => {
    const onChange = vi.fn();
    render(<FormBuilder fields={[]} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: /Adicionar Campo/ }));
    for (const label of [
      'Campo de Texto',
      'Área de Texto',
      'Seleção Única',
      'Seleção Múltipla',
      'Opção Única',
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    await userEvent.click(screen.getByText('Seleção Única'));
    expect(onChange).toHaveBeenCalled();
    const newField = onChange.mock.calls[0][0][0];
    expect(newField.type).toBe('select');
    expect(newField.options).toEqual(['Opção 1', 'Opção 2']);
  });

  it('toggles preview visibility', async () => {
    render(<Harness initial={[inputField('a', 'input')]} />);
    expect(screen.getByText('Preview do Formulário')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Ocultar Preview/ }));
    expect(screen.queryByText('Preview do Formulário')).not.toBeInTheDocument();
  });

  it('renders all preview field types', () => {
    render(
      <FormBuilder
        fields={[
          inputField('a', 'input'),
          inputField('b', 'textarea'),
          inputField('c', 'select'),
          inputField('d', 'checkbox'),
          inputField('e', 'radio'),
        ]}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText('Preview do Formulário')).toBeInTheDocument();
    // preview select inside has a disabled select with option "Selecione uma opção"
    expect(screen.getAllByText('Selecione uma opção').length).toBeGreaterThan(0);
  });

  it('moves a field up/down and deletes it', async () => {
    function Harness2() {
      const [fields, setFields] = useState<QuestionField[]>([
        inputField('a'),
        inputField('b'),
        inputField('c'),
      ]);
      return <FormBuilder fields={fields} onChange={setFields} />;
    }
    render(<Harness2 />);
    const upButtons = screen.getAllByTitle('Mover para cima');
    // first card's up should be disabled
    expect(upButtons[0]).toBeDisabled();

    // move second item up
    await userEvent.click(upButtons[1]);
    const labelInputs = screen.getAllByDisplayValue(/^Campo /);
    // first card labels should now reflect the swap (a <-> b)
    expect(labelInputs[0]).toHaveValue('Campo b');

    // delete first field
    await userEvent.click(screen.getAllByTitle('Excluir campo')[0]);
    const remaining = screen.getAllByDisplayValue(/^Campo /);
    expect(remaining).toHaveLength(2);
  });

  it('adds, edits and removes options for a select field', async () => {
    render(<Harness initial={[inputField('a', 'select')]} />);
    await userEvent.click(screen.getByRole('button', { name: /Adicionar opção/ }));
    expect(screen.getAllByDisplayValue(/Opção/)).toHaveLength(1);

    const optionInputs = screen.getAllByDisplayValue(/^[AB]$/);
    fireEvent.change(optionInputs[0], { target: { value: 'Modificado' } });
    expect(screen.getByDisplayValue('Modificado')).toBeInTheDocument();

    const removeButtons = screen.getAllByTitle('Remover opção');
    await userEvent.click(removeButtons[0]);
    expect(screen.queryByDisplayValue('Modificado')).not.toBeInTheDocument();
  });

  it('updates id, required toggle and validation inputs', async () => {
    render(<Harness initial={[inputField('a', 'input')]} />);

    const requiredCheckbox = screen.getByLabelText('Campo obrigatório');
    await userEvent.click(requiredCheckbox);
    expect((requiredCheckbox as HTMLInputElement).checked).toBe(true);

    const numberInputs = screen.getAllByRole('spinbutton');
    fireEvent.change(numberInputs[0], { target: { value: '3' } });
    fireEvent.change(numberInputs[1], { target: { value: '10' } });
    fireEvent.change(numberInputs[0], { target: { value: '' } });
    expect((numberInputs[1] as HTMLInputElement).value).toBe('10');

    const idInput = screen.getAllByRole('textbox')[0];
    fireEvent.change(idInput, { target: { value: 'novo_id' } });
    expect(screen.getByDisplayValue('novo_id')).toBeInTheDocument();
  });

  it('closes add modal via X', async () => {
    render(<Harness initial={[]} />);
    await userEvent.click(screen.getByRole('button', { name: /Adicionar Campo/ }));
    await userEvent.click(screen.getByRole('button', { name: '✕' }));
    expect(screen.queryByText('Selecione uma opção')).toBeNull();
  });

  it('tolerates non-array fields without crashing', () => {
    render(<FormBuilder fields={null as unknown as QuestionField[]} onChange={() => {}} />);
    expect(screen.getByText('Nenhum campo adicionado')).toBeInTheDocument();
  });
});
