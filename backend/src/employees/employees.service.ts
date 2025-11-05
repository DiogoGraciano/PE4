import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    const existingEmployee = await this.employeesRepository.findOne({
      where: [
        { email: createEmployeeDto.email },
        { cpf: createEmployeeDto.cpf },
      ],
    });

    if (existingEmployee) {
      if (existingEmployee.email === createEmployeeDto.email) {
        throw new ConflictException('Email já cadastrado');
      }
      if (existingEmployee.cpf === createEmployeeDto.cpf) {
        throw new ConflictException('CPF já cadastrado');
      }
    }

    const employee = this.employeesRepository.create(createEmployeeDto);
    const saved = await this.employeesRepository.save(employee);

    const { senha, ...result } = saved;

    return {
      success: true,
      message: 'Funcionário criado com sucesso',
      data: result,
    };
  }

  async findAll() {
    const employees = await this.employeesRepository.find({
      relations: ['funcao'],
      order: { nome: 'ASC' },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        cpf: true,
        cep: true,
        cidade: true,
        estado: true,
        bairro: true,
        pais: true,
        numero_endereco: true,
        complemento: true,
        contato_empresarial: true,
        funcao_id: true,
        created_at: true,
        updated_at: true,
      },
    });

    return {
      success: true,
      message: 'Funcionários recuperados com sucesso',
      data: employees,
    };
  }

  async findOne(id: number) {
    const employee = await this.employeesRepository.findOne({
      where: { id },
      relations: ['funcao'],
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        cpf: true,
        cep: true,
        cidade: true,
        estado: true,
        bairro: true,
        pais: true,
        numero_endereco: true,
        complemento: true,
        contato_empresarial: true,
        funcao_id: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!employee) {
      throw new NotFoundException('Funcionário não encontrado');
    }

    return {
      success: true,
      message: 'Funcionário recuperado com sucesso',
      data: employee,
    };
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    const employee = await this.employeesRepository.findOne({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException('Funcionário não encontrado');
    }

    if (updateEmployeeDto.email && updateEmployeeDto.email !== employee.email) {
      const existingEmployee = await this.employeesRepository.findOne({
        where: { email: updateEmployeeDto.email },
      });

      if (existingEmployee) {
        throw new ConflictException('Email já cadastrado');
      }
    }

    if (updateEmployeeDto.cpf && updateEmployeeDto.cpf !== employee.cpf) {
      const existingEmployee = await this.employeesRepository.findOne({
        where: { cpf: updateEmployeeDto.cpf },
      });

      if (existingEmployee) {
        throw new ConflictException('CPF já cadastrado');
      }
    }

    Object.assign(employee, updateEmployeeDto);
    const updated = await this.employeesRepository.save(employee);

    const { senha, ...result } = updated;

    return {
      success: true,
      message: 'Funcionário atualizado com sucesso',
      data: result,
    };
  }

  async remove(id: number) {
    const employee = await this.employeesRepository.findOne({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException('Funcionário não encontrado');
    }

    await this.employeesRepository.remove(employee);

    return {
      success: true,
      message: 'Funcionário removido com sucesso',
      data: null,
    };
  }
}

