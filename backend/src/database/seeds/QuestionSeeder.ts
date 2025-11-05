import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Question } from '../../questions/entities/question.entity';
import { Questionnaire } from '../../questionnaires/entities/questionnaire.entity';

export default class QuestionSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const repository = dataSource.getRepository(Question);
    const questionnaireRepository = dataSource.getRepository(Questionnaire);

    // Buscar questionários existentes
    const questionnaires = await questionnaireRepository.find();

    if (questionnaires.length === 0) {
      console.log('Nenhum questionário encontrado. Execute o QuestionnaireSeeder primeiro.');
      return;
    }

    const questions: Array<{
      questionario_id: number;
      tipo_pergunta: 'resposta_curta' | 'checkbox' | 'combobox';
      texto_pergunta: string;
    }> = [];

    for (const questionnaire of questionnaires) {
      // Criar algumas perguntas para cada questionário
      questions.push(
        {
          questionario_id: questionnaire.id,
          tipo_pergunta: 'resposta_curta',
          texto_pergunta: 'Como você avalia seu desempenho geral?',
        },
        {
          questionario_id: questionnaire.id,
          tipo_pergunta: 'checkbox',
          texto_pergunta: 'Quais habilidades você desenvolveu? (marque todas que se aplicam)',
        },
        {
          questionario_id: questionnaire.id,
          tipo_pergunta: 'combobox',
          texto_pergunta: 'Qual seu nível de satisfação?',
        },
      );
    }

    await repository.insert(questions);

    // Usar factory para gerar mais perguntas
    const questionFactory = factoryManager.get(Question);
    const additionalQuestions = await questionFactory.saveMany(5);
    
    // Atribuir questionários aleatórios às perguntas geradas
    if (questionnaires.length > 0 && additionalQuestions.length > 0) {
      for (const question of additionalQuestions) {
        const randomQuestionnaire = questionnaires[Math.floor(Math.random() * questionnaires.length)];
        question.questionario_id = randomQuestionnaire.id;
        await repository.save(question);
      }
    }
  }
}

