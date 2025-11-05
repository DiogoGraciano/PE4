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

@Entity('perguntas')
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  questionario_id: number;

  @ManyToOne(() => Questionnaire)
  @JoinColumn({ name: 'questionario_id' })
  questionario: Questionnaire;

  @Column({
    type: 'enum',
    enum: ['checkbox', 'resposta_curta', 'combobox'],
  })
  tipo_pergunta: 'checkbox' | 'resposta_curta' | 'combobox';

  @Column({ type: 'text' })
  texto_pergunta: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

