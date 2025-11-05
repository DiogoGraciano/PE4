import { setSeederFactory } from 'typeorm-extension';
import { Question } from '../../questions/entities/question.entity';

export default setSeederFactory(Question, (faker) => {
  const question = new Question();
  question.questionario_id = 1; // Será definido no seeder
  question.tipo_pergunta = faker.helpers.arrayElement([
    'resposta_curta',
    'checkbox',
    'combobox',
  ]);
  question.texto_pergunta = faker.lorem.sentence() + '?';

  return question;
});

