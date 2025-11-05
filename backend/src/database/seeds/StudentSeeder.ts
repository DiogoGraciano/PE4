import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Company } from '../../companies/entities/company.entity';
import { Function } from '../../functions/entities/function.entity';

export default class StudentSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const repository = dataSource.getRepository(Student);
    const companyRepository = dataSource.getRepository(Company);
    const functionRepository = dataSource.getRepository(Function);

    // Buscar empresas e funções existentes
    const companies = await companyRepository.find();
    const functions = await functionRepository.find();

    const students = [
      {
        codigo: 'AL001',
        responsavel: 'João Silva',
        observacao: 'Aluno dedicado e pontual',
        empresa_id: companies.length > 0 ? companies[0].id : null,
        funcao_id: functions.length > 0 ? functions[0].id : null,
        data_admissao: new Date('2024-01-15'),
        contato_rh: 'rh@empresa.com',
        data_desligamento: null,
      },
      {
        codigo: 'AL002',
        responsavel: 'Maria Santos',
        observacao: null,
        empresa_id: companies.length > 1 ? companies[1].id : null,
        funcao_id: functions.length > 1 ? functions[1]?.id : null,
        data_admissao: new Date('2024-02-20'),
        contato_rh: 'rh@empresa2.com',
        data_desligamento: null,
      },
    ];

    // Verifica e insere apenas se não existir
    for (const studentData of students) {
      const existing = await repository.findOne({
        where: { codigo: studentData.codigo },
      });

      if (!existing) {
        await repository.save(studentData);
      }
    }

    // Usar factory para gerar mais alunos (apenas se houver menos de 10 alunos)
    const existingCount = await repository.count();
    if (existingCount < 10) {
      const studentFactory = factoryManager.get(Student);
      const toCreate = 10 - existingCount;
      await studentFactory.saveMany(Math.min(toCreate, 5));
    }
  }
}

