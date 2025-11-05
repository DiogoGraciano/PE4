import { setSeederFactory } from 'typeorm-extension';
import { Company } from '../../companies/entities/company.entity';

export default setSeederFactory(Company, (faker) => {
  const company = new Company();
  company.razao_social = faker.company.name();
  company.cnpj = faker.string.numeric(14).replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  company.cep = faker.location.zipCode('#####-###');
  company.cidade = faker.location.city();
  company.estado = faker.location.state({ abbreviated: true });
  company.bairro = faker.location.county();
  company.pais = 'Brasil';
  company.numero_endereco = faker.location.buildingNumber();
  company.complemento = faker.datatype.boolean() ? faker.location.secondaryAddress() : null;

  return company;
});

