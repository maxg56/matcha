import logging
import logging.handlers
import sys
from typing import Optional
from app.core.config import settings

def setup_logging(app_name: str = "match-service") -> logging.Logger:
    """
    Setup comprehensive logging for the application
    
    Args:
        app_name: Name of the application
        
    Returns:
        Configured logger instance
    """
    
    # Create logger
    logger = logging.getLogger(app_name)
    logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper()))
    
    # Remove any existing handlers to avoid duplicates
    logger.handlers.clear()
    
    # Create formatter
    formatter = logging.Formatter(
        fmt=settings.LOG_FORMAT,
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, settings.LOG_LEVEL.upper()))
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # File handler (optional, for production)
    if not settings.DEBUG:
        try:
            file_handler = logging.handlers.RotatingFileHandler(
                filename=f"/var/log/{app_name}.log",
                maxBytes=10*1024*1024,  # 10MB
                backupCount=5,
                encoding='utf-8'
            )
            file_handler.setLevel(logging.INFO)
            file_handler.setFormatter(formatter)
            logger.addHandler(file_handler)
        except (PermissionError, FileNotFoundError):
            # If can't write to /var/log, try current directory
            try:
                file_handler = logging.handlers.RotatingFileHandler(
                    filename=f"{app_name}.log",
                    maxBytes=10*1024*1024,
                    backupCount=3,
                    encoding='utf-8'
                )
                file_handler.setLevel(logging.INFO)
                file_handler.setFormatter(formatter)
                logger.addHandler(file_handler)
            except:
                logger.warning("Could not set up file logging")
    
    # Set levels for external libraries
    logging.getLogger('werkzeug').setLevel(logging.WARNING)
    logging.getLogger('urllib3').setLevel(logging.WARNING)
    logging.getLogger('redis').setLevel(logging.WARNING)
    logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)
    
    logger.info(f"Logging configured - Level: {settings.LOG_LEVEL}")
    
    return logger

class MatchingLogger:
    """Specialized logger for matching algorithm operations"""
    
    def __init__(self, logger: Optional[logging.Logger] = None):
        self.logger = logger or logging.getLogger("matching")
    
    def log_user_interaction(self, user_id: int, target_id: int, interaction_type: str):
        """Log user interaction"""
        self.logger.info(
            f"User interaction: {user_id} -> {target_id} ({interaction_type})",
            extra={
                'user_id': user_id,
                'target_id': target_id,
                'interaction_type': interaction_type,
                'event_type': 'user_interaction'
            }
        )
    
    def log_match_created(self, user1_id: int, user2_id: int):
        """Log new match creation"""
        self.logger.info(
            f"New match created: {user1_id} <-> {user2_id}",
            extra={
                'user1_id': user1_id,
                'user2_id': user2_id,
                'event_type': 'match_created'
            }
        )
    
    def log_algorithm_run(self, user_id: int, algorithm_type: str, matches_found: int, duration_ms: float):
        """Log matching algorithm execution"""
        self.logger.info(
            f"Algorithm run: user={user_id}, type={algorithm_type}, matches={matches_found}, duration={duration_ms:.2f}ms",
            extra={
                'user_id': user_id,
                'algorithm_type': algorithm_type,
                'matches_found': matches_found,
                'duration_ms': duration_ms,
                'event_type': 'algorithm_run'
            }
        )
    
    def log_preference_update(self, user_id: int, interaction_type: str, learning_rate: float):
        """Log preference vector update"""
        self.logger.debug(
            f"Preference update: user={user_id}, interaction={interaction_type}, lr={learning_rate}",
            extra={
                'user_id': user_id,
                'interaction_type': interaction_type,
                'learning_rate': learning_rate,
                'event_type': 'preference_update'
            }
        )
    
    def log_compatibility_calculation(self, user_id: int, target_id: int, score: float, cached: bool = False):
        """Log compatibility score calculation"""
        self.logger.debug(
            f"Compatibility: {user_id}:{target_id} = {score:.3f} {'(cached)' if cached else ''}",
            extra={
                'user_id': user_id,
                'target_id': target_id,
                'compatibility_score': score,
                'cached': cached,
                'event_type': 'compatibility_calculation'
            }
        )
    
    def log_error(self, operation: str, error: Exception, user_id: int = None, **kwargs):
        """Log operation error"""
        self.logger.error(
            f"Error in {operation}: {str(error)}",
            extra={
                'operation': operation,
                'error_type': type(error).__name__,
                'user_id': user_id,
                'event_type': 'error',
                **kwargs
            },
            exc_info=True
        )
    
    def log_performance_warning(self, operation: str, duration_ms: float, threshold_ms: float = 1000):
        """Log performance warning for slow operations"""
        if duration_ms > threshold_ms:
            self.logger.warning(
                f"Slow operation: {operation} took {duration_ms:.2f}ms (threshold: {threshold_ms}ms)",
                extra={
                    'operation': operation,
                    'duration_ms': duration_ms,
                    'threshold_ms': threshold_ms,
                    'event_type': 'performance_warning'
                }
            )

# Global logger instances
app_logger = setup_logging("match-service")
matching_logger = MatchingLogger(app_logger)