package algorithms

import (
	"match-service/src/services/algorithms/basic"
	"match-service/src/services/algorithms/compatibility"
	"match-service/src/services/algorithms/core"
	"match-service/src/services/algorithms/matrix"
	"match-service/src/services/algorithms/vector"
)

// Re-export constructors from all sub-packages
var (
	// Core services
	NewAlgorithmService = core.NewAlgorithmService
	NewAlgorithmRouter  = core.NewAlgorithmRouter
	// NewAlgorithmMetrics = core.NewAlgorithmMetrics

	// Algorithm implementations
	NewVectorMatchingService     = vector.NewVectorMatchingService
	NewBasicMatchingService      = basic.NewBasicMatchingService
	NewCompatibilityService      = compatibility.NewCompatibilityService
	NewMatrixService             = matrix.NewMatrixService
)

// Re-export types from all sub-packages
type (
	// Core types
	AlgorithmService  = core.AlgorithmService
	AlgorithmRouter   = core.AlgorithmRouter
	// AlgorithmMetrics  = core.AlgorithmMetrics

	// Algorithm implementation types
	VectorMatchingService   = vector.VectorMatchingService
	BasicMatchingService    = basic.BasicMatchingService
	CompatibilityService    = compatibility.CompatibilityService
	MatrixService           = matrix.MatrixService
)