import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const submit = (container: HTMLElement) => {
  fireEvent.submit(container.querySelector('form')!);
};
import EventForm, { emptyEventForm } from '../EventForm';
import { makeStudent, makeCompany } from '../../../test/utils';

const students = [makeStudent({ id: 1, nome: 'Aluno A' })];
const companies = [makeCompany({ id: 1, razao_social: 'Empresa A' })];

describe('EventForm', () => {
  it('shows error when titulo empty on submit', () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <EventForm
        formData={{ ...emptyEventForm, data_inicio: '', data_fim: '' }}
        onFormDataChange={() => {}}
        students={students}
        companies={companies}
        onSubmit={onSubmit}
        onCancel={() => {}}
        isEditing={false}
      />,
    );
    submit(container);
    expect(screen.getByText(/Título é obrigatório/)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows error when data_fim earlier than data_inicio', () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <EventForm
        formData={{
          ...emptyEventForm,
          titulo: 'X',
          data_inicio: '2026-05-15T10:00',
          data_fim: '2026-05-15T09:00',
        }}
        onFormDataChange={() => {}}
        students={students}
        companies={companies}
        onSubmit={onSubmit}
        onCancel={() => {}}
        isEditing={false}
      />,
    );
    submit(container);
    expect(screen.getByText(/data de fim deve ser maior/)).toBeInTheDocument();
  });

  it('shows aluno required when tipo=visita_aluno', () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <EventForm
        formData={{
          ...emptyEventForm,
          titulo: 'X',
          tipo: 'visita_aluno',
          data_inicio: '2026-05-15T10:00',
          data_fim: '2026-05-15T11:00',
        }}
        onFormDataChange={() => {}}
        students={students}
        companies={companies}
        onSubmit={onSubmit}
        onCancel={() => {}}
        isEditing={false}
      />,
    );
    submit(container);
    expect(screen.getByText(/Selecione um aluno para este tipo/)).toBeInTheDocument();
  });

  it('shows empresa required when tipo=visita_empresa', () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <EventForm
        formData={{
          ...emptyEventForm,
          titulo: 'X',
          tipo: 'visita_empresa',
          data_inicio: '2026-05-15T10:00',
          data_fim: '2026-05-15T11:00',
        }}
        onFormDataChange={() => {}}
        students={students}
        companies={companies}
        onSubmit={onSubmit}
        onCancel={() => {}}
        isEditing={false}
      />,
    );
    submit(container);
    expect(screen.getByText(/Selecione uma empresa para este tipo/)).toBeInTheDocument();
  });

  it('submits when all required fields valid', () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <EventForm
        formData={{
          ...emptyEventForm,
          titulo: 'X',
          tipo: 'generico',
          data_inicio: '2026-05-15T10:00',
          data_fim: '2026-05-15T11:00',
        }}
        onFormDataChange={() => {}}
        students={students}
        companies={companies}
        onSubmit={onSubmit}
        onCancel={() => {}}
        isEditing={false}
      />,
    );
    submit(container);
    expect(onSubmit).toHaveBeenCalled();
  });

  it('shows Excluir button when editing and calls onDelete', async () => {
    const onDelete = vi.fn();
    render(
      <EventForm
        formData={emptyEventForm}
        onFormDataChange={() => {}}
        students={students}
        companies={companies}
        onSubmit={() => {}}
        onCancel={() => {}}
        onDelete={onDelete}
        isEditing
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    expect(onDelete).toHaveBeenCalled();
  });

  it('triggers updateField for every input', () => {
    const onChange = vi.fn();
    render(
      <EventForm
        formData={emptyEventForm}
        onFormDataChange={onChange}
        students={students}
        companies={companies}
        onSubmit={() => {}}
        onCancel={() => {}}
        isEditing={false}
      />,
    );
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach((input, i) => fireEvent.change(input, { target: { value: `v${i}` } }));
    const datetime = document.querySelectorAll('input[type="datetime-local"]');
    datetime.forEach((input, i) =>
      fireEvent.change(input, { target: { value: `2026-01-0${i + 1}T10:00` } }),
    );
    expect(onChange.mock.calls.length).toBeGreaterThanOrEqual(5);
  });

  it('renders selected student/empresa when tipo requires them', () => {
    render(
      <EventForm
        formData={{
          ...emptyEventForm,
          tipo: 'visita_ambos',
          aluno_id: '1',
          empresa_id: '1',
        }}
        onFormDataChange={() => {}}
        students={students}
        companies={companies}
        onSubmit={() => {}}
        onCancel={() => {}}
        isEditing={false}
      />,
    );
    expect(screen.getByText('Aluno A')).toBeInTheDocument();
    expect(screen.getByText('Empresa A')).toBeInTheDocument();
  });

  it('updates tipo via SelectInput', async () => {
    const onChange = vi.fn();
    render(
      <EventForm
        formData={emptyEventForm}
        onFormDataChange={onChange}
        students={students}
        companies={companies}
        onSubmit={() => {}}
        onCancel={() => {}}
        isEditing={false}
      />,
    );
    await userEvent.selectOptions(screen.getByRole('combobox'), 'visita_empresa');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ tipo: 'visita_empresa' }));
  });
});
