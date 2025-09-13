import { usePasswordReset } from '@/hooks/auth/usePasswordReset';
import {
  SuccessView,
  InvalidTokenView,
  PasswordResetForm
} from '@/components/password-reset';

export default function ResetPasswordPage() {
  const {
    token,
    formData,
    showPassword,
    showConfirmPassword,
    isLoading,
    error,
    fieldErrors,
    isSuccess,
    isFormValid,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleSubmit,
    handleNavigateToLogin,
    handleRequestNewLink,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
  } = usePasswordReset();

  if (isSuccess) {
    return <SuccessView onNavigateToLogin={handleNavigateToLogin} />;
  }

  if (!token) {
    return <InvalidTokenView onRequestNewLink={handleRequestNewLink} />;
  }

  return (
    <PasswordResetForm
      formData={formData}
      showPassword={showPassword}
      showConfirmPassword={showConfirmPassword}
      isLoading={isLoading}
      error={error}
      fieldErrors={fieldErrors}
      isFormValid={isFormValid}
      onPasswordChange={handlePasswordChange}
      onConfirmPasswordChange={handleConfirmPasswordChange}
      onSubmit={handleSubmit}
      onTogglePassword={togglePasswordVisibility}
      onToggleConfirmPassword={toggleConfirmPasswordVisibility}
    />
  );
}