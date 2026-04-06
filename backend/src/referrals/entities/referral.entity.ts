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

@Entity('encaminhamentos')
export class Referral {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  aluno_id: number;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'aluno_id' })
  aluno: Student;

  @Column({ type: 'int' })
  empresa_id: number;

  @ManyToOne(() => Company, { nullable: false })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Company;

  @Column({ type: 'varchar', length: 255, nullable: true })
  funcao: string | null;

  @Column({ type: 'date', nullable: true })
  data_admissao: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contato_rh: string | null;

  @Column({ type: 'date', nullable: true })
  data_desligamento: Date | null;

  @Column({ type: 'text', nullable: true })
  observacao: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
