import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ReportModal from '../ReportModal';
import { apiService } from '../../services/api';

vi.mock('../../services/api', () => ({
  apiService: { downloadReport: vi.fn() },
}));

const mocked = vi.mocked(apiService);

const options = [
  { label: 'Lista', type: 'full', description: 'Tudo' },
  { label: 'Por estado', type: 'by-state' },
];

beforeEach(() => {
  mocked.downloadReport.mockReset();
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
});

afterEach(() => vi.restoreAllMocks());

describe('ReportModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <ReportModal isOpen={false} onClose={() => {}} title="X" entity="companies" options={options} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders title, options and disables generate button until selection', () => {
    render(
      <ReportModal isOpen onClose={() => {}} title="Empresas" entity="companies" options={options} />,
    );
    expect(screen.getByText('Empresas')).toBeInTheDocument();
    expect(screen.getByText('Lista')).toBeInTheDocument();
    expect(screen.getByText('Tudo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Gerar PDF/i })).toBeDisabled();
  });

  it('selecting an option enables Gerar PDF and triggers download with the entity-specific filename', async () => {
    const blob = new Blob(['x']);
    mocked.downloadReport.mockResolvedValueOnce(blob);
    const onClose = vi.fn();
    const click = vi.fn();
    HTMLAnchorElement.prototype.click = click;

    render(
      <ReportModal isOpen onClose={onClose} title="Empresas" entity="companies" options={options} />,
    );
    await userEvent.click(screen.getByDisplayValue('full'));
    await userEvent.click(screen.getByRole('button', { name: /Gerar PDF/i }));
    await waitFor(() => expect(mocked.downloadReport).toHaveBeenCalledWith('companies', 'full'));
    expect(click).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('shows error when download fails', async () => {
    mocked.downloadReport.mockRejectedValueOnce(new Error('boom'));
    render(
      <ReportModal isOpen onClose={() => {}} title="Empresas" entity="companies" options={options} />,
    );
    await userEvent.click(screen.getByDisplayValue('full'));
    await userEvent.click(screen.getByRole('button', { name: /Gerar PDF/i }));
    expect(await screen.findByText(/Erro ao gerar relatório/)).toBeInTheDocument();
  });

  it('cancel closes the modal', async () => {
    const onClose = vi.fn();
    render(
      <ReportModal isOpen onClose={onClose} title="X" entity="employees" options={options} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalled();
  });
});
