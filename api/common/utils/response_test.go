package utils

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func init() {
	gin.SetMode(gin.TestMode)
}

func TestRespondSuccess(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	testData := map[string]string{"message": "success"}
	RespondSuccess(c, testData)

	assert.Equal(t, http.StatusOK, w.Code)

	var response StandardResponse
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.True(t, response.Success)
	assert.NotNil(t, response.Data)
	assert.Empty(t, response.Error)
}

func TestRespondSuccessWithStatus(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	testData := map[string]string{"message": "created"}
	RespondSuccessWithStatus(c, http.StatusCreated, testData)

	assert.Equal(t, http.StatusCreated, w.Code)

	var response StandardResponse
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.True(t, response.Success)
	assert.NotNil(t, response.Data)
}

func TestRespondError(t *testing.T) {
	tests := []struct {
		name           string
		status         int
		message        string
		expectedStatus int
		expectedError  string
	}{
		{
			name:           "Bad Request",
			status:         http.StatusBadRequest,
			message:        "invalid input",
			expectedStatus: http.StatusBadRequest,
			expectedError:  "invalid input",
		},
		{
			name:           "Unauthorized",
			status:         http.StatusUnauthorized,
			message:        "authentication required",
			expectedStatus: http.StatusUnauthorized,
			expectedError:  "authentication required",
		},
		{
			name:           "Internal Server Error",
			status:         http.StatusInternalServerError,
			message:        "something went wrong",
			expectedStatus: http.StatusInternalServerError,
			expectedError:  "something went wrong",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)

			// Test the parameter order: context, status, message
			RespondError(c, tt.status, tt.message)

			assert.Equal(t, tt.expectedStatus, w.Code)

			var response StandardResponse
			err := json.Unmarshal(w.Body.Bytes(), &response)
			assert.NoError(t, err)
			assert.False(t, response.Success)
			assert.Equal(t, tt.expectedError, response.Error)
			assert.Nil(t, response.Data)
		})
	}
}

func TestRespondBadRequest(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	RespondBadRequest(c, "invalid request")

	assert.Equal(t, http.StatusBadRequest, w.Code)

	var response StandardResponse
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.False(t, response.Success)
	assert.Equal(t, "invalid request", response.Error)
}

func TestRespondUnauthorized(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	RespondUnauthorized(c, "unauthorized access")

	assert.Equal(t, http.StatusUnauthorized, w.Code)

	var response StandardResponse
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.False(t, response.Success)
	assert.Equal(t, "unauthorized access", response.Error)
}

func TestRespondNotFound(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	RespondNotFound(c, "resource not found")

	assert.Equal(t, http.StatusNotFound, w.Code)

	var response StandardResponse
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.False(t, response.Success)
	assert.Equal(t, "resource not found", response.Error)
}

func TestRespondInternalError(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	RespondInternalError(c, "internal error")

	assert.Equal(t, http.StatusInternalServerError, w.Code)

	var response StandardResponse
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.False(t, response.Success)
	assert.Equal(t, "internal error", response.Error)
}

func TestRespondErrorWithAbort(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	RespondErrorWithAbort(c, http.StatusForbidden, "access denied")

	assert.Equal(t, http.StatusForbidden, w.Code)
	assert.True(t, c.IsAborted())

	var response StandardResponse
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.False(t, response.Success)
	assert.Equal(t, "access denied", response.Error)
}

// Test to verify parameter order is correct (regression test)
func TestRespondError_ParameterOrder(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	// IMPORTANT: This test ensures parameters are ordered as: context, status, message
	// This was the bug in match-service where parameters were reversed
	RespondError(c, 400, "bad request")

	assert.Equal(t, 400, w.Code, "Status code should be 400")

	var response StandardResponse
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "bad request", response.Error, "Error message should be 'bad request'")
	assert.False(t, response.Success)
}
