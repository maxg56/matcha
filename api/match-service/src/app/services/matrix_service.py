from typing import List, Dict, Any, Optional
from utils.matrix_converter import UserMatrixConverter

class MatrixService:
    """Service layer for matrix operations"""
    
    def __init__(self):
        self.converter = UserMatrixConverter()
    
    def get_users_matrix(self, user_ids: Optional[List[int]] = None, 
                        include_metadata: bool = True) -> Dict[str, Any]:
        """
        Get users data in matrix format
        
        Args:
            user_ids: Optional list of specific user IDs
            include_metadata: Whether to include enum mapping metadata
            
        Returns:
            Dictionary with matrix data and optional metadata
        """
        return self.converter.users_to_json_matrix(user_ids, include_metadata)
    
    def get_compatible_users_matrix(self, user_id: int) -> List[Dict[str, float]]:
        """
        Get matrix of users compatible with specified user
        
        Args:
            user_id: ID of the target user
            
        Returns:
            List of compatible users in matrix format
        """
        return self.converter.get_compatible_users(user_id)
    
    def export_matrix_to_file(self, user_ids: Optional[List[int]] = None,
                             include_metadata: bool = True, 
                             filename: str = 'users_matrix.json') -> Dict[str, str]:
        """
        Export users matrix to file
        
        Args:
            user_ids: Optional list of specific user IDs
            include_metadata: Whether to include metadata
            filename: Output filename
            
        Returns:
            Dictionary with export result information
        """
        # Ensure filename ends with .json
        if not filename.endswith('.json'):
            filename += '.json'
        
        filepath = f"/tmp/{filename}"
        
        # Export to file
        self.converter.export_to_file(
            filepath=filepath,
            user_ids=user_ids,
            include_metadata=include_metadata
        )
        
        return {
            "message": f"Matrix exported to {filepath}",
            "filename": filename,
            "filepath": filepath
        }