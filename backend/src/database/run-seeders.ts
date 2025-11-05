import { dataSource } from './data-source';
import { runSeeders } from 'typeorm-extension';

(async () => {
  try {
    console.log('Inicializando conexão com o banco de dados...');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_PORT:', process.env.DB_PORT);
    console.log('DB_NAME:', process.env.DB_NAME);
    
    await dataSource.initialize();
    console.log('Conexão estabelecida com sucesso!');
    
    console.log('Executando seeders...');
    await runSeeders(dataSource);
    console.log('Seeders executados com sucesso!');
    
    await dataSource.destroy();
    console.log('Conexão fechada.');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao executar seeders:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
})();

