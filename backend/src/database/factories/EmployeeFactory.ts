import { setSeederFactory } from 'typeorm-extension';
import { Employee } from '../../employees/entities/employee.entity';
import * as bcrypt from 'bcrypt';

export default setSeederFactory(Employee, async (faker) => {
  const employee = new Employee();
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  
  employee.nome = `${firstName} ${lastName}`;
  employee.email = faker.internet.email({ firstName, lastName }).toLowerCase();
  employee.telefone = faker.phone.number('(##) #####-####');
  employee.cpf = faker.string.numeric(11).replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  employee.senha = await bcrypt.hash('senha123', 10);
  employee.cep = faker.location.zipCode('#####-###');
  employee.cidade = faker.location.city();
  employee.estado = faker.location.state({ abbreviated: true });
  employee.bairro = faker.location.county();
  employee.pais = 'Brasil';
  employee.numero_endereco = faker.location.buildingNumber();
  employee.complemento = faker.datatype.boolean() ? faker.location.secondaryAddress() : null;
  employee.contato_empresarial = faker.datatype.boolean() ? faker.phone.number() : null;

  return employee;
});

