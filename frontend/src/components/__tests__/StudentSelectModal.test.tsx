import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import StudentSelectModal from '../StudentSelectModal';
import { makeStudent } from '../../test/utils';

describe('StudentSelectModal', () => {
  it('filters by name, email, codigo and cpf digits', async () => {
    const students = [
      makeStudent({ id: 1, nome: 'Ana', email: 'ana@x.com', codigo: 'C1', cpf: '11111111111' }),
      makeStudent({ id: 2, nome: 'Bruno', email: 'bruno@x.com', codigo: 'C2', cpf: '22222222222' }),
    ];

    const { rerender } = render(
      <StudentSelectModal
        isOpen
        onClose={() => {}}
        onSelect={() => {}}
        selectedId=""
        students={students}
      />,
    );
    expect(screen.getAllByText(/Ana|Bruno/).length).toBeGreaterThanOrEqual(2);

    await userEvent.type(screen.getByPlaceholderText(/Buscar/), 'Ana');
    expect(screen.queryByText('Bruno')).not.toBeInTheDocument();

    rerender(
      <StudentSelectModal
        isOpen
        onClose={() => {}}
        onSelect={() => {}}
        selectedId=""
        students={students}
      />,
    );
  });

  it('shows empty state and falls back to codigo when nome missing', () => {
    const { rerender } = render(
      <StudentSelectModal
        isOpen
        onClose={() => {}}
        onSelect={() => {}}
        selectedId=""
        students={[]}
      />,
    );
    expect(screen.getByText('Nenhum aluno encontrado')).toBeInTheDocument();

    rerender(
      <StudentSelectModal
        isOpen
        onClose={() => {}}
        onSelect={() => {}}
        selectedId=""
        students={[makeStudent({ id: 5, nome: undefined, email: undefined, codigo: 'XYZ' })]}
      />,
    );
    expect(screen.getByText('XYZ')).toBeInTheDocument();
    expect(screen.getByText('Código: XYZ')).toBeInTheDocument();
  });

  it('selecting fires onSelect and onClose, ignores students without id', async () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(
      <StudentSelectModal
        isOpen
        onClose={onClose}
        onSelect={onSelect}
        selectedId="3"
        students={[
          makeStudent({ id: 3, nome: 'Carla' }),
          makeStudent({ id: undefined, nome: 'Daniela' }),
        ]}
      />,
    );
    await userEvent.click(screen.getByText('Daniela'));
    expect(onSelect).not.toHaveBeenCalled();

    await userEvent.click(screen.getByText('Carla'));
    expect(onSelect).toHaveBeenCalledWith('3');
    expect(onClose).toHaveBeenCalled();
  });

  it('clear button emits empty selection', async () => {
    const onSelect = vi.fn();
    render(
      <StudentSelectModal
        isOpen
        onClose={() => {}}
        onSelect={onSelect}
        selectedId="1"
        students={[makeStudent({ id: 1, nome: 'X' })]}
      />,
    );
    await userEvent.click(screen.getByText(/Remover aluno selecionado/));
    expect(onSelect).toHaveBeenCalledWith('');
  });
});
