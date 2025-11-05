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

    // Buscar funções existentes
    const functions = await functionRepository.find();
    const adminFunction = functions.find((f) => f.codigo === 'ADM');
    const profFunction = functions.find((f) => f.codigo === 'PROF');

    // Criar senha hash para admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const profPassword = await bcrypt.hash('prof123', 10);

    const employeesToInsert = [
      {
        nome: 'Administrador Sistema',
        email: 'admin@pe4.com',
        telefone: '(11) 99999-9999',
        cpf: '123.456.789-00',
        senha: adminPassword,
        cep: '01310-100',
        cidade: 'São Paulo',
        estado: 'SP',
        bairro: 'Bela Vista',
        pais: 'Brasil',
        numero_endereco: '100',
        complemento: null,
        funcao_id: adminFunction?.id,
      },
      {
        nome: 'Professor Teste',
        email: 'professor@pe4.com',
        telefone: '(11) 88888-8888',
        cpf: '987.654.321-00',
        senha: profPassword,
        cep: '01310-100',
        cidade: 'São Paulo',
        estado: 'SP',
        bairro: 'Bela Vista',
        pais: 'Brasil',
        numero_endereco: '200',
        complemento: null,
        funcao_id: profFunction?.id,
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

    // Usar factory para gerar mais funcionários (apenas se houver menos de 10 funcionários)
    const existingCount = await repository.count();
    if (existingCount < 10) {
      const employeeFactory = factoryManager.get(Employee);
      const toCreate = 10 - existingCount;
      const additionalEmployees = await employeeFactory.saveMany(Math.min(toCreate, 3));
      
      // Atribuir funções aleatórias aos funcionários gerados
      if (functions.length > 0 && additionalEmployees.length > 0) {
        for (const employee of additionalEmployees) {
          const randomFunction = functions[Math.floor(Math.random() * functions.length)];
          employee.funcao_id = randomFunction.id;
          await repository.save(employee);
        }
      }
    }
  }
}

