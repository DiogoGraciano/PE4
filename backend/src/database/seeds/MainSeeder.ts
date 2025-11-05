import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import FunctionSeeder from './FunctionSeeder';
import CompanySeeder from './CompanySeeder';
import EmployeeSeeder from './EmployeeSeeder';
import StudentSeeder from './StudentSeeder';
import QuestionnaireSeeder from './QuestionnaireSeeder';
import QuestionSeeder from './QuestionSeeder';
import SmtpConfigSeeder from './SmtpConfigSeeder';

export default class MainSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    console.log('Iniciando seeders...');

    // Executar seeders na ordem correta (respeitando dependências)
    console.log('1. Executando FunctionSeeder...');
    const functionSeeder = new FunctionSeeder();
    await functionSeeder.run(dataSource, factoryManager);

    console.log('2. Executando CompanySeeder...');
    const companySeeder = new CompanySeeder();
    await companySeeder.run(dataSource, factoryManager);

    console.log('3. Executando EmployeeSeeder...');
    const employeeSeeder = new EmployeeSeeder();
    await employeeSeeder.run(dataSource, factoryManager);

    console.log('4. Executando StudentSeeder...');
    const studentSeeder = new StudentSeeder();
    await studentSeeder.run(dataSource, factoryManager);

    console.log('5. Executando QuestionnaireSeeder...');
    const questionnaireSeeder = new QuestionnaireSeeder();
    await questionnaireSeeder.run(dataSource, factoryManager);

    console.log('6. Executando QuestionSeeder...');
    const questionSeeder = new QuestionSeeder();
    await questionSeeder.run(dataSource, factoryManager);

    console.log('7. Executando SmtpConfigSeeder...');
    const smtpConfigSeeder = new SmtpConfigSeeder();
    await smtpConfigSeeder.run(dataSource, factoryManager);

    console.log('Todos os seeders foram executados com sucesso!');
  }
}

