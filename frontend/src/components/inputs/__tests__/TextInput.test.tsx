import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TextInput from '../TextInput';

describe('TextInput', () => {
  it('renders label and required marker', () => {
    const { container } = render(
      <TextInput label="Nome" value="" onChange={() => {}} required />,
    );
    const label = container.querySelector('label');
    expect(label?.textContent).toContain('Nome');
    expect(label?.textContent).toContain('*');
  });

  it('emits changes via onChange callback', async () => {
    const onChange = vi.fn();
    render(<TextInput label="Nome" value="" onChange={onChange} />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'abc');
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange).toHaveBeenLastCalledWith('c');
  });

  it('honors disabled flag', () => {
    render(<TextInput label="Nome" value="x" onChange={() => {}} disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('passes type and placeholder', () => {
    render(<TextInput label="Senha" type="password" value="" onChange={() => {}} placeholder="****" />);
    const input = screen.getByPlaceholderText('****');
    expect(input).toHaveAttribute('type', 'password');
  });
});
