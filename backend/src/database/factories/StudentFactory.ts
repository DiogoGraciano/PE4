import { setSeederFactory } from 'typeorm-extension';
import { Student } from '../../students/entities/student.entity';

export default setSeederFactory(Student, (faker) => {
  const student = new Student();
  student.codigo = `AL${faker.string.numeric(3)}`;
  student.responsavel = faker.person.fullName();
  student.observacao = faker.datatype.boolean({ probability: 0.7 }) ? faker.lorem.sentence() : null;

  return student;
});

