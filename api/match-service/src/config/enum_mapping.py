# Enum mapping configuration for converting user attributes to numerical values
# Used for matrix calculations in the matching algorithm

ENUM_MAPPING = {
    # Yes/Sometimes/No enums (common pattern)
    "yes_sometimes_no_enum": {
        "yes": 1.0,
        "sometimes": 0.5,
        "no": 0.0
    },
    
    # Yes/No enums
    "yes_no_enum": {
        "yes": 1.0,
        "no": 0.0
    },
    
    # Activity levels (low to high scale)
    "activity_level_enum": {
        "low": 1.0,
        "medium": 2.0,
        "high": 3.0
    },
    
    # Education levels (progressive scale)
    "education_level_enum": {
        "none": 0.0,
        "primary": 1.0,
        "secondary": 2.0,
        "high_school": 2.5,
        "university": 3.0,
        "bachelor": 3.5,
        "master": 4.0,
        "phd": 4.5
    },
    
    # Religion (categorical, no hierarchy)
    "religion_enum": {
        "none": 0.0,
        "christian": 1.0,
        "muslim": 2.0,
        "jewish": 3.0,
        "hindu": 4.0,
        "buddhist": 5.0,
        "other": 6.0
    },
    
    # Relationship type
    "relationship_type_enum": {
        "single": 0.0,
        "complicated": 1.0,
        "open": 2.0,
        "married": 3.0
    },
    
    # Children status
    "children_status_enum": {
        "none": 0.0,
        "wants_children": 1.0,
        "has_children": 2.0,
        "doesnt_want": 3.0
    },
    
    # Physical attributes (categorical)
    "hair_color_enum": {
        "blonde": 1.0,
        "brown": 2.0,
        "black": 3.0,
        "red": 4.0,
        "grey": 5.0,
        "white": 6.0,
        "other": 0.0
    },
    
    "skin_color_enum": {
        "very_light": 1.0,
        "light": 2.0,
        "medium": 3.0,
        "dark": 4.0,
        "very_dark": 5.0
    },
    
    "eye_color_enum": {
        "blue": 1.0,
        "green": 2.0,
        "brown": 3.0,
        "black": 4.0,
        "grey": 5.0,
        "hazel": 6.0
    },
    
    # Gender and preferences
    "gender_enum": {
        "male": 1.0,
        "female": 2.0,
        "non_binary": 3.0,
        "other": 0.0
    },
    
    "sex_pref_enum": {
        "male": 1.0,
        "female": 2.0,
        "both": 0.0,
        "other": 3.0
    },
    
    # Political views (left-right scale)
    "political_view_enum": {
        "far_left": -2.0,
        "left": -1.0,
        "center_left": -0.5,
        "center": 0.0,
        "center_right": 0.5,
        "right": 1.0,
        "far_right": 2.0
    },
    
    # Zodiac signs (categorical, circular)
    "zodiac_enum": {
        "aries": 1.0,
        "taurus": 2.0,
        "gemini": 3.0,
        "cancer": 4.0,
        "leo": 5.0,
        "virgo": 6.0,
        "libra": 7.0,
        "scorpio": 8.0,
        "sagittarius": 9.0,
        "capricorn": 10.0,
        "aquarius": 11.0,
        "pisces": 12.0
    }
}

# Field to enum mapping - maps database fields to their corresponding enum type
FIELD_ENUM_MAPPING = {
    # Substance use
    "alcohol_consumption": "yes_sometimes_no_enum",
    "smoking": "yes_sometimes_no_enum", 
    "cannabis": "yes_sometimes_no_enum",
    "drugs": "yes_no_enum",
    "pets": "yes_no_enum",
    
    # Activity levels
    "social_activity_level": "activity_level_enum",
    "sport_activity": "activity_level_enum",
    
    # Education and background
    "education_level": "education_level_enum",
    "religion": "religion_enum",
    "relationship_type": "relationship_type_enum",
    "children_status": "children_status_enum",
    
    # Physical attributes
    "hair_color": "hair_color_enum",
    "skin_color": "skin_color_enum", 
    "eye_color": "eye_color_enum",
    "zodiac_sign": "zodiac_enum",
    
    # Identity and preferences
    "gender": "gender_enum",
    "sex_pref": "sex_pref_enum",
    "political_view": "political_view_enum"
}

def encode_enum_value(field_name: str, value: str) -> float:
    """
    Encode a string enum value to its numerical representation
    
    Args:
        field_name: Database field name
        value: String value to encode
        
    Returns:
        Numerical value (float) or 0.0 if not found
    """
    if not value or value == "":
        return 0.0
        
    # Normalize value (lowercase, strip spaces)
    normalized_value = value.lower().strip()
    
    # Get enum type for this field
    enum_type = FIELD_ENUM_MAPPING.get(field_name)
    if not enum_type:
        return 0.0
        
    # Get mapping for this enum type
    enum_map = ENUM_MAPPING.get(enum_type, {})
    
    # Return encoded value or 0.0 if not found
    return enum_map.get(normalized_value, 0.0)

def get_numerical_fields():
    """
    Returns list of fields that should be treated as numerical (not encoded)
    """
    return [
        "id", "age", "height", "fame", 
        "latitude", "longitude"
    ]

def get_encodable_fields():
    """
    Returns list of fields that need enum encoding
    """
    return list(FIELD_ENUM_MAPPING.keys())