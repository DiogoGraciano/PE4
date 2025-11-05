import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
  ) {}

  async create(createStudentDto: CreateStudentDto) {
    const existingStudent = await this.studentsRepository.findOne({
      where: { codigo: createStudentDto.codigo },
    });

    if (existingStudent) {
      throw new ConflictException('Código de aluno já existe');
    }

    const student = this.studentsRepository.create(createStudentDto);
    const saved = await this.studentsRepository.save(student);

    return {
      success: true,
      message: 'Aluno criado com sucesso',
      data: saved,
    };
  }

  async findAll() {
    const students = await this.studentsRepository.find({
      relations: ['empresa', 'funcao'],
      order: { codigo: 'ASC' },
    });

    return {
      success: true,
      message: 'Alunos recuperados com sucesso',
      data: students,
    };
  }

  async findOne(id: number) {
    const student = await this.studentsRepository.findOne({
      where: { id },
      relations: ['empresa', 'funcao'],
    });

    if (!student) {
      throw new NotFoundException('Aluno não encontrado');
    }

    return {
      success: true,
      message: 'Aluno recuperado com sucesso',
      data: student,
    };
  }

  async update(id: number, updateStudentDto: UpdateStudentDto) {
    const student = await this.studentsRepository.findOne({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException('Aluno não encontrado');
    }

    if (updateStudentDto.codigo && updateStudentDto.codigo !== student.codigo) {
      const existingStudent = await this.studentsRepository.findOne({
        where: { codigo: updateStudentDto.codigo },
      });

      if (existingStudent) {
        throw new ConflictException('Código de aluno já existe');
      }
    }

    Object.assign(student, updateStudentDto);
    const updated = await this.studentsRepository.save(student);

    return {
      success: true,
      message: 'Aluno atualizado com sucesso',
      data: updated,
    };
  }

  async remove(id: number) {
    const student = await this.studentsRepository.findOne({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException('Aluno não encontrado');
    }

    await this.studentsRepository.remove(student);

    return {
      success: true,
      message: 'Aluno removido com sucesso',
      data: null,
    };
  }
}

