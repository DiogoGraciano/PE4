import { setSeederFactory } from 'typeorm-extension';
import { Questionnaire } from '../../questionnaires/entities/questionnaire.entity';

// Tipos de campo compatíveis com o frontend (QuestionField)
const fieldTypes = ['input', 'textarea', 'select', 'checkbox', 'radio'] as const;
const optionTypes = ['select', 'checkbox', 'radio'];

export default setSeederFactory(Questionnaire, (faker) => {
  const questionnaire = new Questionnaire();
  questionnaire.nome = faker.helpers.arrayElement([
    'Avaliação de Satisfação',
    'Avaliação de Habilidades',
    'Avaliação de Conhecimento',
    'Feedback do Estágio',
    'Avaliação Final',
  ]);

  const fieldCount = faker.number.int({ min: 3, max: 6 });
  const fields = Array.from({ length: fieldCount }, (_, i) => {
    const type = faker.helpers.arrayElement(fieldTypes);
    const id = `campo_${Date.now()}_${i}`;
    const label = faker.lorem.sentence().replace(/\.$/, '');
    const field: Record<string, unknown> = {
      id,
      type,
      label,
      required: faker.datatype.boolean(),
    };
    if (type === 'input' || type === 'textarea') {
      field.placeholder = `Digite ${type === 'input' ? 'o texto' : 'o conteúdo'}...`;
    }
    if (optionTypes.includes(type)) {
      field.options = Array.from(
        { length: faker.number.int({ min: 2, max: 5 }) },
        () => faker.lorem.words(2),
      );
    }
    return field;
  });

  questionnaire.questionario_json = JSON.stringify(fields, null, 2);

  return questionnaire;
});

