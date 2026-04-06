import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Student } from '../../students/entities/student.entity';

export default class StudentSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const repository = dataSource.getRepository(Student);

    const students = [
      {
        codigo: 'AL001',
        responsavel: 'João Silva',
        observacao: 'Aluno dedicado e pontual',
      },
      {
        codigo: 'AL002',
        responsavel: 'Maria Santos',
        observacao: null,
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

