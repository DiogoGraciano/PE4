import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Questionnaire } from '../../questionnaires/entities/questionnaire.entity';
import { Student } from '../../students/entities/student.entity';

@Entity('respostas_questionarios')
export class QuestionnaireResponse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  questionario_id: number;

  @ManyToOne(() => Questionnaire)
  @JoinColumn({ name: 'questionario_id' })
  questionario: Questionnaire;

  @Column({ type: 'int' })
  aluno_id: number;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'aluno_id' })
  aluno: Student;

  @Column({ type: 'text' })
  respostas_json: string;

  @Column({ type: 'timestamp' })
  data_envio: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

