package utils

// AppError represents an application error with a message and HTTP status code
type AppError struct {
	Message    string
	StatusCode int
}

// Error implements the error interface
func (e *AppError) Error() string {
	return e.Message
}

// NewAppError creates a new application error
func NewAppError(message string, statusCode int) *AppError {
	return &AppError{
		Message:    message,
		StatusCode: statusCode,
	}
}