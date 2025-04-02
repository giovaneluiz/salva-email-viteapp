import { useState } from 'react';
import '../styles/DoctorForm.css';

const DoctorForm = () => {
  const [formData, setFormData] = useState({
    crm: '',
    email: ''
  });
  const [feedback, setFeedback] = useState({
    type: null, // 'success' ou 'error'
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    // Limpa o feedback quando o usuário começa a digitar novamente
    setFeedback({ type: null, message: '' });
  };

  const translateServerMessage = (response, statusCode) => {
    console.log(response)
    // Verifica se a resposta foi bem sucedida baseado no status HTTP
    if (statusCode >= 200 && statusCode < 300) {
      return {
        type: 'success',
        message: 'Cadastro realizado com sucesso! Seus dados foram salvos.'
      };
    }

    // Tratamento de erros específicos
    if (response.error?.toLowerCase().includes('already exists')) {
      return {
        type: 'error',
        message: 'Este e-mail já está cadastrado em nossa base de dados. Por favor, utilize outro e-mail.'
      };
    }

    if (response.error?.toLowerCase().includes('invalid email')) {
      return {
        type: 'error',
        message: 'O e-mail informado não é válido. Por favor, verifique e tente novamente.'
      };
    }

    // Mensagem genérica para outros casos de erro de erro
    return {
      type: 'error',
      message: 'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.'
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: null, message: '' });

    try {
      const response = await fetch('https://salva-email-huand5gad9a3a8b2.brazilsouth-01.azurewebsites.net/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      const translatedFeedback = translateServerMessage(data, response.status);
      setFeedback(translatedFeedback);

      // Limpa o formulário em caso de sucesso
      if (translatedFeedback.type === 'success') {
        setFormData({ crm: '', email: '' });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: 'Não foi possível conectar ao servidor. Por favor, verifique sua conexão e tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1>Cadastro de Médico</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="crm">CRM</label>
          <input
            type="text"
            id="crm"
            name="crm"
            value={formData.crm}
            onChange={handleChange}
            required
            placeholder="Digite seu CRM"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Digite seu e-mail"
          />
        </div>

        <button type="submit" disabled={loading} className={loading ? 'loading' : ''}>
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>

      {feedback.message && (
        <div className={`feedback-message ${feedback.type}`}>
          <div className="feedback-content">
            {feedback.type === 'success' ? (
              <svg className="feedback-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="feedback-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            <p>{feedback.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorForm;
