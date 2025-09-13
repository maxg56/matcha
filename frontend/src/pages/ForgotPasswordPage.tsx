import { useForgotPassword } from '@/hooks/auth/useForgotPassword';
import {
  ForgotPasswordForm,
  EmailSentView
} from '@/components/forgot-password';

export default function ForgotPasswordPage() {
  const {
    email,
    isLoading,
    error,
    isSuccess,
    message,
    isFormValid,
    handleEmailChange,
    handleSubmit,
    handleNavigateToLogin,
    handleResendEmail,
  } = useForgotPassword();

  if (isSuccess) {
    return (
      <EmailSentView
        message={message}
        onNavigateToLogin={handleNavigateToLogin}
        onResendEmail={handleResendEmail}
      />
    );
  }

  return (
    <ForgotPasswordForm
      email={email}
      isLoading={isLoading}
      error={error}
      isFormValid={isFormValid}
      onEmailChange={handleEmailChange}
      onSubmit={handleSubmit}
    />
  );
}