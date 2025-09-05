import json
import psycopg2
import psycopg2.extras
from typing import List, Dict, Any, Optional
import os
from config.enum_mapping import (
    encode_enum_value, 
    get_numerical_fields, 
    get_encodable_fields,
    ENUM_MAPPING
)

class UserMatrixConverter:
    """
    Converts SQL user data to JSON matrix format for matching algorithm calculations
    """
    
    def __init__(self, db_config: Optional[Dict] = None):
        """
        Initialize converter with database configuration
        
        Args:
            db_config: Database configuration dict. If None, uses environment variables.
        """
        if db_config is None:
            self.db_config = {
                'host': os.getenv('DB_HOST', 'localhost'),
                'port': os.getenv('DB_PORT', '5432'),
                'database': os.getenv('DB_NAME', 'matcha_dev'),
                'user': os.getenv('DB_USER', 'postgres'),
                'password': os.getenv('DB_PASSWORD', 'password')
            }
        else:
            self.db_config = db_config
    
    def get_connection(self):
        """Get database connection"""
        return psycopg2.connect(**self.db_config)
    
    def fetch_users(self, user_ids: Optional[List[int]] = None) -> List[Dict[str, Any]]:
        """
        Fetch users from database
        
        Args:
            user_ids: Optional list of specific user IDs to fetch
            
        Returns:
            List of user dictionaries
        """
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                if user_ids:
                    # Fetch specific users
                    placeholders = ','.join(['%s'] * len(user_ids))
                    query = f"""
                        SELECT id, age, height, fame, 
                               alcohol_consumption, smoking, cannabis, drugs, pets,
                               social_activity_level, sport_activity, education_level,
                               religion, relationship_type, children_status,
                               hair_color, skin_color, eye_color, zodiac_sign,
                               gender, sex_pref, political_view,
                               latitude, longitude
                        FROM users 
                        WHERE id IN ({placeholders})
                        AND latitude IS NOT NULL 
                        AND longitude IS NOT NULL
                    """
                    cur.execute(query, user_ids)
                else:
                    # Fetch all users with valid location data
                    query = """
                        SELECT id, age, height, fame, 
                               alcohol_consumption, smoking, cannabis, drugs, pets,
                               social_activity_level, sport_activity, education_level,
                               religion, relationship_type, children_status,
                               hair_color, skin_color, eye_color, zodiac_sign,
                               gender, sex_pref, political_view,
                               latitude, longitude
                        FROM users 
                        WHERE latitude IS NOT NULL 
                        AND longitude IS NOT NULL
                    """
                    cur.execute(query)
                
                return [dict(row) for row in cur.fetchall()]
    
    def convert_user_to_matrix_row(self, user: Dict[str, Any]) -> Dict[str, float]:
        """
        Convert a single user record to matrix row with numerical values
        
        Args:
            user: User dictionary from database
            
        Returns:
            Dictionary with numerical values for matrix calculations
        """
        matrix_row = {}
        
        # Handle numerical fields directly
        numerical_fields = get_numerical_fields()
        for field in numerical_fields:
            value = user.get(field)
            if value is not None:
                matrix_row[field] = float(value)
            else:
                matrix_row[field] = 0.0
        
        # Handle encodable enum fields
        encodable_fields = get_encodable_fields()
        for field in encodable_fields:
            value = user.get(field)
            if value is not None:
                matrix_row[field] = encode_enum_value(field, str(value))
            else:
                matrix_row[field] = 0.0
        
        return matrix_row
    
    def users_to_json_matrix(self, user_ids: Optional[List[int]] = None, 
                            include_metadata: bool = True) -> Dict[str, Any]:
        """
        Convert users to JSON matrix format
        
        Args:
            user_ids: Optional list of specific user IDs
            include_metadata: Whether to include enum mapping metadata
            
        Returns:
            Dictionary with matrix data and optional metadata
        """
        # Fetch users from database
        users = self.fetch_users(user_ids)
        
        # Convert each user to matrix row
        matrix_data = []
        for user in users:
            matrix_row = self.convert_user_to_matrix_row(user)
            matrix_data.append(matrix_row)
        
        # Build result
        result = {
            "users_matrix": matrix_data,
            "count": len(matrix_data)
        }
        
        # Add metadata if requested
        if include_metadata:
            result["metadata"] = {
                "enum_mapping": ENUM_MAPPING,
                "numerical_fields": get_numerical_fields(),
                "encodable_fields": get_encodable_fields(),
                "description": "User data converted to numerical matrix for matching algorithm"
            }
        
        return result
    
    def export_to_file(self, filepath: str, user_ids: Optional[List[int]] = None,
                       include_metadata: bool = True, indent: int = 2) -> None:
        """
        Export users matrix to JSON file
        
        Args:
            filepath: Output file path
            user_ids: Optional list of specific user IDs
            include_metadata: Whether to include metadata
            indent: JSON indentation level
        """
        matrix_data = self.users_to_json_matrix(user_ids, include_metadata)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(matrix_data, f, indent=indent, ensure_ascii=False)
    
    def get_compatible_users(self, target_user_id: int) -> List[Dict[str, float]]:
        """
        Get users compatible with target user based on sexual preferences
        
        Args:
            target_user_id: ID of the target user
            
        Returns:
            List of compatible users in matrix format
        """
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                # First, get target user's gender and preferences
                cur.execute("""
                    SELECT gender, sex_pref FROM users WHERE id = %s
                """, (target_user_id,))
                
                target_user = cur.fetchone()
                if not target_user:
                    return []
                
                target_gender = target_user['gender']
                target_pref = target_user['sex_pref']
                
                # Find compatible users
                compatibility_conditions = []
                params = [target_user_id]
                
                # Target user is interested in these genders
                if target_pref == 'both':
                    # Target likes everyone, so find people who like target's gender
                    compatibility_conditions.append(
                        "(sex_pref = %s OR sex_pref = 'both')"
                    )
                    params.append(target_gender)
                else:
                    # Target likes specific gender, find people of that gender who like target's gender
                    compatibility_conditions.append(
                        "gender = %s AND (sex_pref = %s OR sex_pref = 'both')"
                    )
                    params.extend([target_pref, target_gender])
                
                query = f"""
                    SELECT id, age, height, fame, 
                           alcohol_consumption, smoking, cannabis, drugs, pets,
                           social_activity_level, sport_activity, education_level,
                           religion, relationship_type, children_status,
                           hair_color, skin_color, eye_color, zodiac_sign,
                           gender, sex_pref, political_view,
                           latitude, longitude
                    FROM users 
                    WHERE id != %s
                    AND latitude IS NOT NULL 
                    AND longitude IS NOT NULL
                    AND ({' OR '.join(compatibility_conditions)})
                """
                
                cur.execute(query, params)
                compatible_users = [dict(row) for row in cur.fetchall()]
                
                # Convert to matrix format
                return [self.convert_user_to_matrix_row(user) for user in compatible_users]


def main():
    """Example usage of the converter"""
    converter = UserMatrixConverter()
    
    # Export all users to JSON file
    print("Exporting all users to users_matrix.json...")
    converter.export_to_file("users_matrix.json")
    print("Export completed!")
    
    # Get matrix for specific users
    print("\nGetting matrix for user IDs [1, 2, 3]...")
    matrix = converter.users_to_json_matrix(user_ids=[1, 2, 3])
    print(f"Retrieved {matrix['count']} users")
    
    # Get compatible users for user ID 1
    print("\nGetting compatible users for user ID 1...")
    compatible = converter.get_compatible_users(1)
    print(f"Found {len(compatible)} compatible users")


if __name__ == "__main__":
    main()