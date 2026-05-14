import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SelectInput from '../SelectInput';

describe('SelectInput', () => {
  const options = [
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' },
  ];

  it('renders label, placeholder option and provided options', () => {
    render(
      <SelectInput
        label="Tipo"
        value=""
        onChange={() => {}}
        options={options}
        placeholder="Escolha"
      />,
    );
    expect(screen.getByText(/Tipo/)).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Escolha' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Option A' })).toBeInTheDocument();
  });

  it('emits change when option is picked', async () => {
    const onChange = vi.fn();
    render(<SelectInput label="Tipo" value="" onChange={onChange} options={options} />);
    await userEvent.selectOptions(screen.getByRole('combobox'), 'b');
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('respects disabled prop', () => {
    render(<SelectInput label="Tipo" value="" onChange={() => {}} options={options} disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});
