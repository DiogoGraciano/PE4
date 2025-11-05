import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('empresas')
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  razao_social: string;

  @Column({ type: 'varchar', length: 18, unique: true })
  cnpj: string;

  @Column({ type: 'varchar', length: 10 })
  cep: string;

  @Column({ type: 'varchar', length: 100 })
  cidade: string;

  @Column({ type: 'varchar', length: 2 })
  estado: string;

  @Column({ type: 'varchar', length: 100 })
  bairro: string;

  @Column({ type: 'varchar', length: 100 })
  pais: string;

  @Column({ type: 'varchar', length: 20 })
  numero_endereco: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  complemento: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

