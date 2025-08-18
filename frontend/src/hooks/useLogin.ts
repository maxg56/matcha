import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginFormData {
  login: string; // pseudo ou email
  password: string;
}

export function useLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    login: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.login || !formData.password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // TODO: API call for login
      console.log('Login attempt:', formData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo, navigate to discover
      navigate('/discover');
    } catch (err) {
      setError('Identifiants incorrects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log('Forgot password');
  };

  const handleNavigateToSignup = () => {
    navigate('/inscription');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isEmail = (str: string) => {
    return str.includes('@');
  };

  const isFormValid = !!(formData.login && formData.password);

  return {
    formData,
    showPassword,
    isLoading,
    error,
    isFormValid,
    isEmail,
    handleInputChange,
    handleSubmit,
    handleForgotPassword,
    handleNavigateToSignup,
    togglePasswordVisibility,
  };
}
