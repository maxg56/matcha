package utils

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

// PaginationParams holds pagination parameters
type PaginationParams struct {
	Limit  int
	Offset int
}

// Pagination holds pagination metadata for responses
type Pagination struct {
	Total  int64 `json:"total"`
	Limit  int   `json:"limit"`
	Offset int   `json:"offset"`
}

// ParsePaginationParams extracts and validates pagination parameters from query string
func ParsePaginationParams(c *gin.Context) PaginationParams {
	// Parse limit parameter
	limitStr := c.DefaultQuery("limit", "20")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 20
	}

	// Parse offset parameter
	offsetStr := c.DefaultQuery("offset", "0")
	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	return PaginationParams{
		Limit:  limit,
		Offset: offset,
	}
}

// NewPagination creates pagination metadata
func NewPagination(total int64, limit, offset int) Pagination {
	return Pagination{
		Total:  total,
		Limit:  limit,
		Offset: offset,
	}
}