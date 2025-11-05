import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Question } from '../../questions/entities/question.entity';
import { Student } from '../../students/entities/student.entity';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('respostas')
export class Answer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  pergunta_id: number;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'pergunta_id' })
  pergunta: Question;

  @Column({ type: 'int' })
  aluno_id: number;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'aluno_id' })
  aluno: Student;

  @Column({ type: 'text', nullable: true })
  resposta_texto: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resposta_opcao: string;

  @Column({ type: 'date' })
  data_entrada: Date;

  @Column({ type: 'date' })
  data_avaliacao: Date;

  @Column({ type: 'int' })
  professor_id: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'professor_id' })
  professor: Employee;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

