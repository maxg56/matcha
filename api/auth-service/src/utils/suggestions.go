package utils

import (
	"strconv"
	"strings"
	"time"
)

// GenerateUsernameSuggestions generates alternative username suggestions
func GenerateUsernameSuggestions(baseUsername string) []string {
	suggestions := make([]string, 0, 5)
	baseUsername = strings.ToLower(baseUsername)
	
	for i := 1; i <= 5; i++ {
		var suggestion string
		
		switch i {
		case 1:
			suggestion = baseUsername + strconv.Itoa(generateRandomNumber(10, 99))
		case 2:
			suggestion = baseUsername + strconv.Itoa(time.Now().Year())
		case 3:
			suggestion = baseUsername + strconv.Itoa(generateRandomNumber(100, 999))
		case 4:
			suggestion = baseUsername + "_" + strconv.Itoa(generateRandomNumber(1, 999))
		case 5:
			suggestion = baseUsername + strconv.Itoa(generateRandomNumber(1000, 9999))
		}
		
		available, err := CheckUsernameAvailability(suggestion)
		if err == nil && available {
			suggestions = append(suggestions, suggestion)
		}
	}
	
	return suggestions
}

// generateRandomNumber generates a random number between min and max (inclusive)
func generateRandomNumber(min, max int) int {
	seed := time.Now().UnixNano()
	return min + int(seed%(int64(max-min+1)))
}