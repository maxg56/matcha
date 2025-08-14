package types

type Gender string

const (
	GenderMale   Gender = "man"
	GenderFemale Gender = "woman"
)

type SexPref string

const (
	SexPrefMale   SexPref = "man"
	SexPrefFemale SexPref = "woman"
	SexPrefBoth   SexPref = "both"
)

type RelationshipType string

const (
	RelationshipTypeFriendship RelationshipType = "friendship"
	RelationshipTypeShortTerm  RelationshipType = "short_term"
	RelationshipTypeLongTerm   RelationshipType = "long_term"
	RelationshipTypeLife       RelationshipType = "life"
	RelationshipTypeOther      RelationshipType = "other"
)
