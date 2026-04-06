import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Company } from '../../companies/entities/company.entity';

export type EventType =
  | 'visita_aluno'
  | 'visita_empresa'
  | 'visita_ambos'
  | 'generico';

@Entity('eventos')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descricao: string | null;

  @Column({ type: 'timestamp' })
  data_inicio: Date;

  @Column({ type: 'timestamp' })
  data_fim: Date;

  @Column({ type: 'varchar', length: 30, default: 'generico' })
  tipo: EventType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  local: string | null;

  @Column({ type: 'text', nullable: true })
  observacao: string | null;

  @Column({ type: 'int', nullable: true })
  aluno_id: number | null;

  @ManyToOne(() => Student, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'aluno_id' })
  aluno: Student | null;

  @Column({ type: 'int', nullable: true })
  empresa_id: number | null;

  @ManyToOne(() => Company, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Company | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
