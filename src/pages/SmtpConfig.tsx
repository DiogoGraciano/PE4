import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle, Server, Mail, Shield, Key } from 'lucide-react';
import apiService from '../services/api';

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from_email: string;
  from_name: string;
}

const SmtpConfig: React.FC = () => {
  const [config, setConfig] = useState<SmtpConfig>({
    host: '',
    port: 587,
    secure: false,
    user: '',
    password: '',
    from_email: '',
    from_name: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSmtpConfig();
  }, []);

  const loadSmtpConfig = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getSmtpConfig();
      if (response.success && response.data) {
        setConfig(response.data);
      }
    } catch (error: any) {
      console.error('Erro ao carregar configuração SMTP:', error);
      // Não mostrar erro se for a primeira vez configurando
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof SmtpConfig, value: string | number | boolean) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateConfig = () => {
    if (!config.host.trim()) {
      setError('O host do servidor SMTP é obrigatório.');
      return false;
    }

    if (!config.user.trim()) {
      setError('O usuário SMTP é obrigatório.');
      return false;
    }

    if (!config.password.trim()) {
      setError('A senha SMTP é obrigatória.');
      return false;
    }

    if (!config.from_email.trim()) {
      setError('O e-mail do remetente é obrigatório.');
      return false;
    }

    if (!config.from_name.trim()) {
      setError('O nome do remetente é obrigatório.');
      return false;
    }

    if (config.port <= 0 || config.port > 65535) {
      setError('A porta deve estar entre 1 e 65535.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateConfig()) {
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      setSuccess('');

      await apiService.saveSmtpConfig(config);
      setSuccess('Configuração SMTP salva com sucesso!');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao salvar configuração SMTP.');
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async () => {
    if (!validateConfig()) {
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await apiService.testSmtpConnection(config);
      setSuccess('Conexão SMTP testada com sucesso!');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao testar conexão SMTP.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !config.host) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Server className="h-6 w-6 text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">
              Configuração SMTP
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Configure as credenciais do servidor SMTP para envio de e-mails do sistema
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Servidor SMTP */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="host" className="block text-sm font-medium text-gray-700">
                Servidor SMTP *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Server className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="host"
                  type="text"
                  value={config.host}
                  onChange={(e) => handleInputChange('host', e.target.value)}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="smtp.gmail.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="port" className="block text-sm font-medium text-gray-700">
                Porta *
              </label>
              <div className="mt-1">
                <input
                  id="port"
                  type="number"
                  value={config.port}
                  onChange={(e) => handleInputChange('port', parseInt(e.target.value) || 587)}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="587"
                  min="1"
                  max="65535"
                />
              </div>
            </div>
          </div>

          {/* Segurança */}
          <div>
            <div className="flex items-center">
              <input
                id="secure"
                type="checkbox"
                checked={config.secure}
                onChange={(e) => handleInputChange('secure', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="secure" className="ml-2 block text-sm text-gray-700">
                Usar conexão segura (SSL/TLS)
              </label>
            </div>
          </div>

          {/* Credenciais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="user" className="block text-sm font-medium text-gray-700">
                Usuário SMTP *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="user"
                  type="email"
                  value={config.user}
                  onChange={(e) => handleInputChange('user', e.target.value)}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="seu-email@gmail.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha SMTP *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={config.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Sua senha de aplicativo"
                />
              </div>
            </div>
          </div>

          {/* Remetente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="from_email" className="block text-sm font-medium text-gray-700">
                E-mail do Remetente *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="from_email"
                  type="email"
                  value={config.from_email}
                  onChange={(e) => handleInputChange('from_email', e.target.value)}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="noreply@sistema.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="from_name" className="block text-sm font-medium text-gray-700">
                Nome do Remetente *
              </label>
              <div className="mt-1">
                <input
                  id="from_name"
                  type="text"
                  value={config.from_name}
                  onChange={(e) => handleInputChange('from_name', e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Sistema PE4"
                />
              </div>
            </div>
          </div>

          {/* Mensagens de erro/sucesso */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={testConnection}
              disabled={isLoading}
              className="inline-flex items-center justify-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              ) : (
                <Shield className="w-4 h-4 mr-2" />
              )}
              Testar Conexão
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar Configuração
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SmtpConfig;
