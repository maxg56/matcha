import json
from typing import List, Dict, Any, Optional
from sqlalchemy import text
from flask import current_app
from config.enum_mapping import (
    encode_enum_value, 
    get_numerical_fields, 
    get_encodable_fields,
    ENUM_MAPPING
)

class UserMatrixConverter:
    """Converts SQL user data to JSON matrix format for matching algorithm calculations"""
    
    def __init__(self):
        """Initialize converter"""
        pass
    
    def fetch_users(self, user_ids: Optional[List[int]] = None) -> List[Dict[str, Any]]:
        """
        Fetch users from database
        
        Args:
            user_ids: Optional list of specific user IDs to fetch
            
        Returns:
            List of user dictionaries
        """
        # Import here to avoid circular imports
        from app.models import User
        
        # Build query
        query = User.query.filter(
            User.latitude.isnot(None),
            User.longitude.isnot(None)
        )
        
        # Filter by specific user IDs if provided
        if user_ids:
            query = query.filter(User.id.in_(user_ids))
        
        # Execute query and convert to dict
        users = query.all()
        return [user.to_dict() for user in users]
    
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
        # Import here to avoid circular imports
        from app.models import User
        from app.config.database import db
        
        # Get target user's preferences
        target_user = User.query.filter_by(id=target_user_id).first()
        if not target_user:
            return []
        
        target_gender = target_user.gender
        target_pref = target_user.sex_pref
        
        # Build query for compatible users
        query = User.query.filter(
            User.id != target_user_id,
            User.latitude.isnot(None),
            User.longitude.isnot(None)
        )
        
        # Apply compatibility filters
        if target_pref == 'both':
            # Target likes everyone, find people who like target's gender
            query = query.filter(
                db.or_(
                    User.sex_pref == target_gender,
                    User.sex_pref == 'both'
                )
            )
        else:
            # Target likes specific gender, find people of that gender who like target's gender
            query = query.filter(
                User.gender == target_pref,
                db.or_(
                    User.sex_pref == target_gender,
                    User.sex_pref == 'both'
                )
            )
        
        # Execute query and convert to matrix format
        compatible_users = query.all()
        return [user.to_matrix_dict() for user in compatible_users]


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