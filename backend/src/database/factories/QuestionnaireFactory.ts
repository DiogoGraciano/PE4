import { setSeederFactory } from 'typeorm-extension';
import { Questionnaire } from '../../questionnaires/entities/questionnaire.entity';

export default setSeederFactory(Questionnaire, (faker) => {
  const questionnaire = new Questionnaire();
  questionnaire.nome = faker.helpers.arrayElement([
    'Avaliação de Desempenho',
    'Avaliação de Competências',
    'Avaliação de Satisfação',
    'Avaliação de Habilidades',
    'Avaliação de Conhecimento',
  ]);

  const questionTypes = ['resposta_curta', 'checkbox', 'combobox'];
  const questions = Array.from({ length: faker.number.int({ min: 3, max: 8 }) }, (_, i) => ({
    id: i + 1,
    type: faker.helpers.arrayElement(questionTypes),
    text: faker.lorem.sentence(),
    ...(faker.helpers.arrayElement(questionTypes) !== 'resposta_curta' && {
      options: Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () =>
        faker.lorem.word(),
      ),
    }),
  }));

  questionnaire.questionario_json = JSON.stringify({
    title: questionnaire.nome,
    description: faker.lorem.paragraph(),
    questions,
  });

  return questionnaire;
});

