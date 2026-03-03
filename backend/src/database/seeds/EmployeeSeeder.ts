import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { Function } from '../../functions/entities/function.entity';
import * as bcrypt from 'bcrypt';

export default class EmployeeSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const repository = dataSource.getRepository(Employee);
    const functionRepository = dataSource.getRepository(Function);

    // Buscar funções existentes (obrigatório para RBAC: cada funcionário deve ter cargo)
    const functions = await functionRepository.find();
    const getFunctionByCodigo = (codigo: string) => functions.find((f) => f.codigo === codigo);
    const adminFunction = getFunctionByCodigo('ADM');
    const profFunction = getFunctionByCodigo('PROF');
    const rhFunction = getFunctionByCodigo('RH');
    const coordFunction = getFunctionByCodigo('COORD');
    const dirFunction = getFunctionByCodigo('DIR');

    const defaultPassword = await bcrypt.hash('senha123', 10);

    const employeesToInsert = [
      {
        nome: 'Administrador Sistema',
        email: 'admin@pe4.com',
        telefone: '(11) 99999-9999',
        cpf: '123.456.789-00',
        senha: await bcrypt.hash('admin123', 10),
        cep: '01310-100',
        cidade: 'São Paulo',
        estado: 'SP',
        bairro: 'Bela Vista',
        pais: 'Brasil',
        numero_endereco: '100',
        complemento: null,
        contato_empresarial: 'admin@pe4.com',
        funcao_id: adminFunction?.id,
      },
      {
        nome: 'Professor Teste',
        email: 'professor@pe4.com',
        telefone: '(11) 88888-8888',
        cpf: '987.654.321-00',
        senha: await bcrypt.hash('prof123', 10),
        cep: '01310-100',
        cidade: 'São Paulo',
        estado: 'SP',
        bairro: 'Bela Vista',
        pais: 'Brasil',
        numero_endereco: '200',
        complemento: null,
        contato_empresarial: 'professor@pe4.com',
        funcao_id: profFunction?.id,
      },
      {
        nome: 'Recursos Humanos Teste',
        email: 'rh@pe4.com',
        telefone: '(11) 77777-7777',
        cpf: '111.222.333-44',
        senha: defaultPassword,
        cep: '01310-100',
        cidade: 'São Paulo',
        estado: 'SP',
        bairro: 'Bela Vista',
        pais: 'Brasil',
        numero_endereco: '300',
        complemento: null,
        contato_empresarial: 'rh@pe4.com',
        funcao_id: rhFunction?.id,
      },
      {
        nome: 'Coordenador Teste',
        email: 'coordenador@pe4.com',
        telefone: '(11) 66666-6666',
        cpf: '555.666.777-88',
        senha: defaultPassword,
        cep: '01310-100',
        cidade: 'São Paulo',
        estado: 'SP',
        bairro: 'Bela Vista',
        pais: 'Brasil',
        numero_endereco: '400',
        complemento: null,
        contato_empresarial: 'coordenador@pe4.com',
        funcao_id: coordFunction?.id,
      },
      {
        nome: 'Diretor Teste',
        email: 'diretor@pe4.com',
        telefone: '(11) 55555-5555',
        cpf: '999.888.777-66',
        senha: defaultPassword,
        cep: '01310-100',
        cidade: 'São Paulo',
        estado: 'SP',
        bairro: 'Bela Vista',
        pais: 'Brasil',
        numero_endereco: '500',
        complemento: null,
        contato_empresarial: 'diretor@pe4.com',
        funcao_id: dirFunction?.id,
      },
    ];

    // Verifica e insere apenas se não existir
    for (const employeeData of employeesToInsert) {
      const existing = await repository.findOne({
        where: [{ email: employeeData.email }, { cpf: employeeData.cpf }],
      });

      if (!existing) {
        await repository.save(employeeData);
      }
    }

    // Usar factory para gerar mais funcionários (apenas se houver cargos e menos de 10 funcionários)
    const existingCount = await repository.count();
    if (existingCount < 10 && functions.length > 0) {
      const employeeFactory = factoryManager.get(Employee);
      const toCreate = 10 - existingCount;
      const additionalEmployees = await employeeFactory.saveMany(Math.min(toCreate, 3));

      for (const employee of additionalEmployees) {
        const randomFunction = functions[Math.floor(Math.random() * functions.length)];
        employee.funcao_id = randomFunction.id;
        await repository.save(employee);
      }
    }
  }
}

