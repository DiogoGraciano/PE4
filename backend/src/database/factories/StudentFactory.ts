import { setSeederFactory } from 'typeorm-extension';
import { Student } from '../../students/entities/student.entity';

export default setSeederFactory(Student, (faker) => {
  const student = new Student();
  student.codigo = `AL${faker.string.numeric(3)}`;
  student.responsavel = faker.person.fullName();
  student.observacao = faker.datatype.boolean({ probability: 0.7 }) ? faker.lorem.sentence() : null;
  student.data_admissao = faker.date.past({ years: 2 });
  student.contato_rh = faker.datatype.boolean({ probability: 0.8 }) ? faker.internet.email() : null;
  student.data_desligamento = faker.datatype.boolean({ probability: 0.2 }) ? faker.date.past({ years: 1 }) : null;

  return student;
});

