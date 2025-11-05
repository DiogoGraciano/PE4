import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { SmtpConfig } from '../../smtp-config/entities/smtp-config.entity';

export default class SmtpConfigSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const repository = dataSource.getRepository(SmtpConfig);

    // Verifica se já existe uma configuração SMTP
    const existing = await repository.findOne({});

    if (!existing) {
      await repository.save({
        host: 'smtp.gmail.com',
        port: 587,
        user: 'sistema@pe4.com',
        password: 'senha123',
        from: 'Sistema PE4 <sistema@pe4.com>',
        secure: false,
      });
    }
  }
}

