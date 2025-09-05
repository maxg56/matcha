import json
import redis
from typing import Any, Optional, Union
from flask_caching import Cache
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Flask-Caching instance
cache = Cache()

class RedisCache:
    """Redis cache wrapper for complex caching needs"""
    
    def __init__(self):
        self.redis_client = None
        self._connect()
    
    def _connect(self):
        """Connect to Redis"""
        try:
            if settings.ENABLE_CACHING:
                self.redis_client = redis.from_url(
                    settings.redis_url,
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5
                )
                # Test connection
                self.redis_client.ping()
                logger.info("Connected to Redis cache")
            else:
                logger.info("Caching disabled")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self.redis_client = None
    
    def is_available(self) -> bool:
        """Check if Redis is available"""
        try:
            if self.redis_client:
                self.redis_client.ping()
                return True
        except:
            pass
        return False
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.is_available():
            return None
            
        try:
            value = self.redis_client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Cache get error for key {key}: {e}")
            return None
    
    def set(self, key: str, value: Any, expire: int = None) -> bool:
        """Set value in cache"""
        if not self.is_available():
            return False
            
        try:
            expire = expire or settings.CACHE_EXPIRE_SECONDS
            json_value = json.dumps(value, default=str)  # Handle datetime serialization
            self.redis_client.setex(key, expire, json_value)
            return True
        except Exception as e:
            logger.error(f"Cache set error for key {key}: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        if not self.is_available():
            return False
            
        try:
            self.redis_client.delete(key)
            return True
        except Exception as e:
            logger.error(f"Cache delete error for key {key}: {e}")
            return False
    
    def delete_pattern(self, pattern: str) -> int:
        """Delete keys matching pattern"""
        if not self.is_available():
            return 0
            
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                return self.redis_client.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"Cache delete pattern error for {pattern}: {e}")
            return 0

# Global Redis cache instance
redis_cache = RedisCache()

# Cache key generators
def make_user_matches_key(user_id: int) -> str:
    """Generate cache key for user matches"""
    return f"matches:user:{user_id}"

def make_user_preferences_key(user_id: int) -> str:
    """Generate cache key for user preferences"""
    return f"preferences:user:{user_id}"

def make_compatibility_key(user_id: int, target_id: int) -> str:
    """Generate cache key for compatibility score"""
    # Ensure consistent ordering
    u1, u2 = min(user_id, target_id), max(user_id, target_id)
    return f"compatibility:{u1}:{u2}"

def make_user_vector_key(user_id: int) -> str:
    """Generate cache key for user vector"""
    return f"vector:user:{user_id}"

def make_algorithm_results_key(user_id: int, params: dict) -> str:
    """Generate cache key for algorithm results"""
    # Create hash of parameters for consistent key
    params_str = json.dumps(params, sort_keys=True)
    params_hash = hash(params_str) % 10000  # Simple hash
    return f"algorithm:user:{user_id}:params:{params_hash}"

# Cache decorators
def cache_user_matches(expire: int = None):
    """Decorator to cache user matches"""
    def decorator(func):
        def wrapper(self, user_id: int, *args, **kwargs):
            if not settings.ENABLE_CACHING:
                return func(self, user_id, *args, **kwargs)
                
            cache_key = make_user_matches_key(user_id)
            cached_result = redis_cache.get(cache_key)
            
            if cached_result is not None:
                logger.debug(f"Cache hit for user matches: {user_id}")
                return cached_result
            
            result = func(self, user_id, *args, **kwargs)
            redis_cache.set(cache_key, result, expire or settings.CACHE_EXPIRE_SECONDS)
            logger.debug(f"Cache set for user matches: {user_id}")
            
            return result
        return wrapper
    return decorator

def cache_compatibility_score(expire: int = None):
    """Decorator to cache compatibility scores"""
    def decorator(func):
        def wrapper(self, user_id: int, target_id: int, *args, **kwargs):
            if not settings.ENABLE_CACHING:
                return func(self, user_id, target_id, *args, **kwargs)
                
            cache_key = make_compatibility_key(user_id, target_id)
            cached_result = redis_cache.get(cache_key)
            
            if cached_result is not None:
                logger.debug(f"Cache hit for compatibility: {user_id}:{target_id}")
                return cached_result
            
            result = func(self, user_id, target_id, *args, **kwargs)
            redis_cache.set(cache_key, result, expire or settings.CACHE_EXPIRE_SECONDS)
            logger.debug(f"Cache set for compatibility: {user_id}:{target_id}")
            
            return result
        return wrapper
    return decorator

def invalidate_user_cache(user_id: int):
    """Invalidate all cache entries for a user"""
    patterns = [
        f"matches:user:{user_id}",
        f"preferences:user:{user_id}",
        f"vector:user:{user_id}",
        f"algorithm:user:{user_id}:*",
        f"compatibility:{user_id}:*",
        f"compatibility:*:{user_id}"
    ]
    
    for pattern in patterns:
        count = redis_cache.delete_pattern(pattern)
        if count > 0:
            logger.debug(f"Invalidated {count} cache entries for pattern: {pattern}")

def init_cache(app):
    """Initialize cache with Flask app"""
    # Configure Flask-Caching
    cache_config = {
        'CACHE_TYPE': 'redis' if settings.ENABLE_CACHING else 'null',
        'CACHE_REDIS_URL': settings.redis_url,
        'CACHE_DEFAULT_TIMEOUT': settings.CACHE_EXPIRE_SECONDS
    }
    
    app.config.update(cache_config)
    cache.init_app(app)
    
    logger.info(f"Cache initialized - Type: {cache_config['CACHE_TYPE']}")
    
    return cache