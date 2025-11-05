import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { Function as FunctionEntity } from '../../functions/entities/function.entity';

@Entity('alunos')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nome: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefone: string | null;

  @Column({ type: 'varchar', length: 14, nullable: true })
  cpf: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  cep: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  cidade: string | null;

  @Column({ type: 'varchar', length: 2, nullable: true })
  estado: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  bairro: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  pais: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  numero_endereco: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  complemento: string | null;

  @Column({ type: 'varchar', length: 50, unique: true })
  codigo: string;

  @Column({ type: 'varchar', length: 255 })
  responsavel: string;

  @Column({ type: 'text', nullable: true })
  observacao: string | null;

  @Column({ type: 'int', nullable: true })
  empresa_id: number | null;

  @ManyToOne(() => Company, { nullable: true })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Company | null;

  @Column({ type: 'int', nullable: true })
  funcao_id: number | null;

  @ManyToOne(() => FunctionEntity, { nullable: true })
  @JoinColumn({ name: 'funcao_id' })
  funcao: FunctionEntity | null;

  @Column({ type: 'date', nullable: true })
  data_admissao: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contato_rh: string | null;

  @Column({ type: 'date', nullable: true })
  data_desligamento: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

