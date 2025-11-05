import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Questionnaire } from '../../questionnaires/entities/questionnaire.entity';

export default class QuestionnaireSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const repository = dataSource.getRepository(Questionnaire);

    const questionnaireJson1 = JSON.stringify({
      title: 'Avaliação de Desempenho',
      description: 'Questionário para avaliação de desempenho do aluno',
      questions: [
        {
          id: 1,
          type: 'resposta_curta',
          text: 'Como você avalia o desempenho geral?',
        },
        {
          id: 2,
          type: 'checkbox',
          text: 'Quais habilidades você desenvolveu?',
          options: ['Comunicação', 'Trabalho em equipe', 'Liderança'],
        },
      ],
    });

    const questionnaireJson2 = JSON.stringify({
      title: 'Avaliação de Competências',
      description: 'Questionário para avaliação de competências técnicas',
      questions: [
        {
          id: 1,
          type: 'combobox',
          text: 'Nível de conhecimento técnico',
          options: ['Iniciante', 'Intermediário', 'Avançado'],
        },
        {
          id: 2,
          type: 'resposta_curta',
          text: 'Descreva suas principais habilidades técnicas',
        },
      ],
    });

    const questionnairesToInsert = [
      {
        nome: 'Avaliação de Desempenho',
        questionario_json: questionnaireJson1,
      },
      {
        nome: 'Avaliação de Competências',
        questionario_json: questionnaireJson2,
      },
    ];

    // Verifica e insere apenas se não existir
    for (const questionnaireData of questionnairesToInsert) {
      const existing = await repository.findOne({
        where: { nome: questionnaireData.nome },
      });

      if (!existing) {
        await repository.save(questionnaireData);
      }
    }

    // Usar factory para gerar mais questionários (apenas se houver menos de 5 questionários)
    const existingCount = await repository.count();
    if (existingCount < 5) {
      const questionnaireFactory = factoryManager.get(Questionnaire);
      const toCreate = 5 - existingCount;
      await questionnaireFactory.saveMany(Math.min(toCreate, 3));
    }
  }
}

