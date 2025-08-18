import { useLogin } from '@/hooks';
import { 
  LoginHeader,
  LoginForm,
  SignupSection,
  LoginFooter
} from '@/components/login';

export default function LoginPage() {
  const {
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
  } = useLogin();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <LoginHeader />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Welcome Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Bon retour !
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Connectez-vous pour continuer votre aventure
              </p>
            </div>

            {/* Login Form */}
            <LoginForm
              formData={formData}
              showPassword={showPassword}
              isLoading={isLoading}
              error={error}
              isFormValid={isFormValid}
              isEmail={isEmail}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
              onForgotPassword={handleForgotPassword}
              onTogglePassword={togglePasswordVisibility}
            />

            {/* Signup Section */}
            <SignupSection onNavigateToSignup={handleNavigateToSignup} />
          </div>

          {/* Footer */}
          <LoginFooter />
        </div>
      </div>
    </div>
  );
}