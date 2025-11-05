import { setSeederFactory } from 'typeorm-extension';
import { Function } from '../../functions/entities/function.entity';

export default setSeederFactory(Function, (faker) => {
  const functionEntity = new Function();
  functionEntity.codigo = faker.string.alpha({ length: 5, casing: 'upper' });
  functionEntity.nome_funcao = faker.person.jobTitle();

  return functionEntity;
});

