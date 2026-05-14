import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import QuestionnaireResponseModal from '../QuestionnaireResponseModal';
import {
  makeQuestionnaire,
  makeQuestionnaireResponse,
  makeStudent,
} from '../../test/utils';

const baseQuestionnaire = makeQuestionnaire({
  questionario_json: JSON.stringify([
    { id: 'nome', type: 'input', label: 'Nome', required: true },
    { id: 'gostou', type: 'checkbox', label: 'Gostou?' },
    { id: 'aceita', type: 'select', label: 'Aceita?' },
  ]),
});

describe('QuestionnaireResponseModal', () => {
  it('returns null when not open', () => {
    const { container } = render(
      <QuestionnaireResponseModal
        isOpen={false}
        onClose={() => {}}
        response={null}
        questionnaire={null}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('returns null when no response', () => {
    const { container } = render(
      <QuestionnaireResponseModal
        isOpen
        onClose={() => {}}
        response={null}
        questionnaire={baseQuestionnaire}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders student info, fields, and formatted values', () => {
    const response = makeQuestionnaireResponse({
      respostas_json: JSON.stringify({
        nome: 'João',
        gostou: true,
        aceita: ['sim', 'parcial'],
      }),
    });
    const student = makeStudent({ nome: 'Maria', codigo: 'A123' });
    render(
      <QuestionnaireResponseModal
        isOpen
        onClose={() => {}}
        response={response}
        questionnaire={baseQuestionnaire}
        student={student}
      />,
    );
    expect(screen.getByText('Maria')).toBeInTheDocument();
    expect(screen.getByText('A123')).toBeInTheDocument();
    expect(screen.getByText('João')).toBeInTheDocument();
    expect(screen.getByText('Sim')).toBeInTheDocument();
    expect(screen.getByText('sim, parcial')).toBeInTheDocument();
  });

  it('falls back to response.questionario when questionnaire is null', () => {
    const response = makeQuestionnaireResponse({
      respostas_json: JSON.stringify({ nome: 'Z' }),
      questionario: baseQuestionnaire,
    });
    render(
      <QuestionnaireResponseModal
        isOpen
        onClose={() => {}}
        response={response}
        questionnaire={null}
      />,
    );
    expect(screen.getByText('Z')).toBeInTheDocument();
  });

  it('falls back to "Não respondido" for missing fields and N/A for absent student', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const response = makeQuestionnaireResponse({
      respostas_json: JSON.stringify({}),
    });
    render(
      <QuestionnaireResponseModal
        isOpen
        onClose={() => {}}
        response={response}
        questionnaire={baseQuestionnaire}
      />,
    );
    expect(screen.getAllByText('Não respondido').length).toBeGreaterThan(0);
    expect(screen.getAllByText('N/A').length).toBeGreaterThan(0);
  });

  it('logs error when JSON is invalid but still renders', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const response = makeQuestionnaireResponse({ respostas_json: 'INVALID' });
    render(
      <QuestionnaireResponseModal
        isOpen
        onClose={() => {}}
        response={response}
        questionnaire={null}
      />,
    );
    expect(errSpy).toHaveBeenCalled();
  });

  it('calls onClose on Close button', async () => {
    const onClose = vi.fn();
    const response = makeQuestionnaireResponse({
      respostas_json: JSON.stringify({ nome: 'x' }),
    });
    render(
      <QuestionnaireResponseModal
        isOpen
        onClose={onClose}
        response={response}
        questionnaire={baseQuestionnaire}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onClose).toHaveBeenCalled();
  });
});
