package interactions

import (
	"match-service/src/services/interactions/core"
)

// InteractionService type alias for external compatibility
type InteractionService = core.InteractionService

// NewInteractionService creates a new InteractionService instance
func NewInteractionService() *InteractionService {
	return core.NewInteractionService()
}