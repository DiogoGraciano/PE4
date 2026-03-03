import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Questionnaire } from '../../questionnaires/entities/questionnaire.entity';

// Formato compatível com o frontend: array de QuestionField (id, type, label, required?, placeholder?, options?, validation?)
const questionnaireFields1 = [
  {
    id: 'desempenho_geral',
    type: 'input' as const,
    label: 'Como você avalia o desempenho geral do estagiário?',
    required: true,
    placeholder: 'Descreva brevemente',
  },
  {
    id: 'habilidades',
    type: 'checkbox' as const,
    label: 'Quais habilidades o aluno desenvolveu?',
    required: false,
    options: ['Comunicação', 'Trabalho em equipe', 'Liderança', 'Proatividade', 'Organização'],
  },
  {
    id: 'nivel_satisfacao',
    type: 'select' as const,
    label: 'Nível de satisfação com o estágio',
    required: true,
    options: ['Muito insatisfeito', 'Insatisfeito', 'Neutro', 'Satisfeito', 'Muito satisfeito'],
  },
  {
    id: 'comentarios',
    type: 'textarea' as const,
    label: 'Comentários adicionais',
    required: false,
    placeholder: 'Digite seus comentários...',
  },
];

const questionnaireFields2 = [
  {
    id: 'conhecimento_tecnico',
    type: 'select' as const,
    label: 'Nível de conhecimento técnico',
    required: true,
    options: ['Iniciante', 'Intermediário', 'Avançado'],
  },
  {
    id: 'habilidades_tecnicas',
    type: 'input' as const,
    label: 'Descreva as principais habilidades técnicas desenvolvidas',
    required: true,
    placeholder: 'Ex: React, Node.js, SQL...',
  },
  {
    id: 'ferramentas',
    type: 'checkbox' as const,
    label: 'Quais ferramentas foram utilizadas?',
    required: false,
    options: ['Git', 'Docker', 'Figma', 'Jira', 'Slack', 'VS Code'],
  },
  {
    id: 'dificuldades',
    type: 'textarea' as const,
    label: 'Principais dificuldades encontradas',
    required: false,
    placeholder: 'Opcional',
  },
];

export default class QuestionnaireSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const repository = dataSource.getRepository(Questionnaire);

    const questionnairesToInsert = [
      {
        nome: 'Avaliação de Desempenho',
        questionario_json: JSON.stringify(questionnaireFields1, null, 2),
      },
      {
        nome: 'Avaliação de Competências',
        questionario_json: JSON.stringify(questionnaireFields2, null, 2),
      },
    ];

    for (const questionnaireData of questionnairesToInsert) {
      const existing = await repository.findOne({
        where: { nome: questionnaireData.nome },
      });

      if (!existing) {
        await repository.save(questionnaireData);
      }
    }

    const existingCount = await repository.count();
    if (existingCount < 5) {
      const questionnaireFactory = factoryManager.get(Questionnaire);
      const toCreate = 5 - existingCount;
      await questionnaireFactory.saveMany(Math.min(toCreate, 3));
    }
  }
}

