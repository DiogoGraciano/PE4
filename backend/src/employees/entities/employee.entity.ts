import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Function as FunctionEntity } from '../../functions/entities/function.entity';

@Entity('funcionarios')
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nome: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20 })
  telefone: string;

  @Column({ type: 'varchar', length: 14, unique: true })
  cpf: string;

  @Column({ type: 'varchar', length: 255 })
  senha: string;

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

  @Column({ type: 'varchar', length: 255, nullable: true })
  contato_empresarial: string | null;

  @Column({ type: 'int', nullable: true })
  funcao_id: number;

  @ManyToOne(() => FunctionEntity, { nullable: true })
  @JoinColumn({ name: 'funcao_id' })
  funcao: FunctionEntity;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reset_password_token: string | null;

  @Column({ type: 'timestamp', nullable: true })
  reset_password_expires: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.senha && !this.senha.startsWith('$2')) {
      this.senha = await bcrypt.hash(this.senha, 10);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.senha);
  }
}

