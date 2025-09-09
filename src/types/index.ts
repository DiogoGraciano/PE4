export interface User {
  id: number;
  nome: string;
  email: string;
  tipo_usuario: 'admin' | 'funcionario' | 'aluno';
  telefone: string;
  cpf: string;
  cep: string;
  cidade: string;
  estado: string;
  bairro: string;
  pais: string;
  numero_endereco: string;
  complemento?: string;
  created_at: string;
  updated_at: string;
}

export interface Student extends User {
  codigo: string;
  responsavel: string;
  observacao?: string;
  empresa_id?: number;
  funcao_id?: number;
  data_admissao?: string;
  contato_rh?: string;
  data_desligamento?: string;
}

export interface Employee extends User {
  contato_empresarial: string;
  funcao_id: number;
  senha?: string;
  confirmacao_senha?: string;
}

export interface Company {
  id: number;
  razao_social: string;
  cnpj: string;
  cep: string;
  cidade: string;
  estado: string;
  bairro: string;
  pais: string;
  numero_endereco: string;
  complemento?: string;
  created_at: string;
  updated_at: string;
}

export interface Function {
  id: number;
  codigo: string;
  nome_funcao: string;
  created_at: string;
  updated_at: string;
}

export interface ExperienceEvaluation {
  id: number;
  aluno_id: number;
  aluno?: Student;
  ingresso: string;
  avaliacoes: string;
  resultado_final: string;
  created_at: string;
  updated_at: string;
}

export interface JobMarketFollowUp {
  id: number;
  nome: string;
  data_admissao: string;
  empresa_id: number;
  empresa?: Company;
  responsavel_rh: string;
  data_visita: string;
  contato_com: string;
  parecer_geral: string;
  created_at: string;
  updated_at: string;
}

export interface Questionnaire {
  id: number;
  nome: string;
  questionario_json: string; // JSON string contendo a definição dos campos
  created_at: string;
  updated_at: string;
}

// Interface para definir a estrutura do JSON do questionário
export interface QuestionField {
  id: string;
  type: 'input' | 'textarea' | 'select' | 'checkbox' | 'radio';
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: string[]; // Para select, radio e checkbox
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

export interface QuestionFormData {
  [key: string]: string | boolean | string[];
}

export interface Question {
  id: number;
  questionario_id: number;
  questionario?: Questionnaire;
  tipo_pergunta: 'checkbox' | 'resposta_curta' | 'combobox';
  texto_pergunta: string;
  created_at: string;
  updated_at: string;
}

export interface Answer {
  id: number;
  pergunta_id: number;
  pergunta?: Question;
  aluno_id: number;
  aluno?: Student;
  resposta_texto?: string;
  resposta_opcao?: string;
  data_entrada: string;
  data_avaliacao: string;
  professor_id: number;
  professor?: Employee;
  created_at: string;
  updated_at: string;
}

// Interfaces para respostas de questionários
export interface QuestionnaireResponse {
  id: number;
  questionario_id: number;
  questionario?: Questionnaire;
  aluno_id: number;
  aluno?: Student;
  respostas_json: string; // JSON com todas as respostas do questionário
  data_envio: string;
  created_at: string;
  updated_at: string;
}

export interface QuestionnaireResponseData {
  [fieldId: string]: string | boolean | string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}
