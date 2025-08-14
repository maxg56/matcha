"""
Tests for Media Service
"""
import os
import pytest
import tempfile
import shutil
from io import BytesIO
from PIL import Image
from pathlib import Path

from main import app


@pytest.fixture
def client():
    """Create a test client"""
    app.config['TESTING'] = True
    app.config['UPLOAD_FOLDER'] = tempfile.mkdtemp()
    
    with app.test_client() as client:
        yield client
    
    # Cleanup
    if os.path.exists(app.config['UPLOAD_FOLDER']):
        shutil.rmtree(app.config['UPLOAD_FOLDER'])


@pytest.fixture
def sample_image():
    """Create a sample image for testing"""
    img = Image.new('RGB', (100, 100), color='red')
    img_io = BytesIO()
    img.save(img_io, 'JPEG')
    img_io.seek(0)
    return img_io


@pytest.fixture
def sample_png_image():
    """Create a sample PNG image for testing"""
    img = Image.new('RGB', (200, 150), color='blue')
    img_io = BytesIO()
    img.save(img_io, 'PNG')
    img_io.seek(0)
    return img_io


class TestHealthCheck:
    """Test health check endpoint"""
    
    def test_health_check(self, client):
        """Test health check returns correct response"""
        response = client.get('/health')
        assert response.status_code == 200
        
        data = response.get_json()
        assert data['success'] is True
        assert data['data']['status'] == 'ok'
        assert data['data']['service'] == 'media-service'


class TestFileUpload:
    """Test file upload functionality"""
    
    def test_upload_valid_image(self, client, sample_image):
        """Test uploading a valid image"""
        response = client.post('/api/v1/media/upload', data={
            'file': (sample_image, 'test.jpg')
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'filename' in data['data']
        assert 'url' in data['data']
        assert 'original_name' in data['data']
        assert data['data']['original_name'] == 'test.jpg'
    
    def test_upload_png_image(self, client, sample_png_image):
        """Test uploading a PNG image"""
        response = client.post('/api/v1/media/upload', data={
            'file': (sample_png_image, 'test.png')
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['data']['original_name'] == 'test.png'
    
    def test_upload_no_file(self, client):
        """Test upload without file"""
        response = client.post('/api/v1/media/upload')
        
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        assert 'No file part in request' in data['error']
    
    def test_upload_empty_filename(self, client):
        """Test upload with empty filename"""
        response = client.post('/api/v1/media/upload', data={
            'file': (BytesIO(b''), '')
        })
        
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        assert 'No file selected' in data['error']
    
    def test_upload_invalid_file_type(self, client):
        """Test upload with invalid file type"""
        response = client.post('/api/v1/media/upload', data={
            'file': (BytesIO(b'test content'), 'test.txt')
        })
        
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        assert 'File type not allowed' in data['error']


class TestFileRetrieval:
    """Test file retrieval functionality"""
    
    def test_get_existing_file(self, client, sample_image):
        """Test retrieving an existing file"""
        # First upload a file
        upload_response = client.post('/api/v1/media/upload', data={
            'file': (sample_image, 'test.jpg')
        })
        upload_data = upload_response.get_json()
        filename = upload_data['data']['filename']
        
        # Then retrieve it
        response = client.get(f'/api/v1/media/get/{filename}')
        assert response.status_code == 200
        assert response.content_type.startswith('image/')
    
    def test_get_nonexistent_file(self, client):
        """Test retrieving a non-existent file"""
        response = client.get('/api/v1/media/get/nonexistent.jpg')
        
        assert response.status_code == 404
        data = response.get_json()
        assert data['success'] is False
        assert 'File not found' in data['error']


class TestFileDeletion:
    """Test file deletion functionality"""
    
    def test_delete_existing_file(self, client, sample_image):
        """Test deleting an existing file"""
        # First upload a file
        upload_response = client.post('/api/v1/media/upload', data={
            'file': (sample_image, 'test.jpg')
        })
        upload_data = upload_response.get_json()
        filename = upload_data['data']['filename']
        
        # Then delete it
        response = client.delete(f'/api/v1/media/delete/{filename}')
        assert response.status_code == 200
        
        data = response.get_json()
        assert data['success'] is True
        assert data['data']['filename'] == filename
        
        # Verify file is actually deleted
        get_response = client.get(f'/api/v1/media/get/{filename}')
        assert get_response.status_code == 404
    
    def test_delete_nonexistent_file(self, client):
        """Test deleting a non-existent file"""
        response = client.delete('/api/v1/media/delete/nonexistent.jpg')
        
        assert response.status_code == 404
        data = response.get_json()
        assert data['success'] is False
        assert 'File not found' in data['error']


class TestImageResize:
    """Test image resizing functionality"""
    
    def test_resize_existing_image(self, client, sample_image):
        """Test resizing an existing image"""
        # First upload a file
        upload_response = client.post('/api/v1/media/upload', data={
            'file': (sample_image, 'test.jpg')
        })
        upload_data = upload_response.get_json()
        filename = upload_data['data']['filename']
        
        # Then resize it
        resize_data = {
            'filename': filename,
            'width': 50,
            'height': 50
        }
        response = client.post('/api/v1/media/resize', json=resize_data)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['data']['original_filename'] == filename
        assert data['data']['width'] == 50
        assert data['data']['height'] == 50
        assert 'resized_filename' in data['data']
        assert 'url' in data['data']
    
    def test_resize_missing_filename(self, client):
        """Test resize without filename"""
        resize_data = {
            'width': 50,
            'height': 50
        }
        response = client.post('/api/v1/media/resize', json=resize_data)
        
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        assert 'Filename is required' in data['error']
    
    def test_resize_missing_dimensions(self, client):
        """Test resize without width or height"""
        resize_data = {
            'filename': 'test.jpg',
            'width': 50
        }
        response = client.post('/api/v1/media/resize', json=resize_data)
        
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        assert 'Width and height are required' in data['error']
    
    def test_resize_invalid_dimensions(self, client):
        """Test resize with invalid dimensions"""
        resize_data = {
            'filename': 'test.jpg',
            'width': 'invalid',
            'height': 50
        }
        response = client.post('/api/v1/media/resize', json=resize_data)
        
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        assert 'Width and height must be valid integers' in data['error']
    
    def test_resize_negative_dimensions(self, client):
        """Test resize with negative dimensions"""
        resize_data = {
            'filename': 'test.jpg',
            'width': -50,
            'height': 50
        }
        response = client.post('/api/v1/media/resize', json=resize_data)
        
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        assert 'Width and height must be positive integers' in data['error']
    
    def test_resize_oversized_dimensions(self, client):
        """Test resize with oversized dimensions"""
        resize_data = {
            'filename': 'test.jpg',
            'width': 5000,
            'height': 5000
        }
        response = client.post('/api/v1/media/resize', json=resize_data)
        
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        assert 'Width and height cannot exceed 4096 pixels' in data['error']
    
    def test_resize_nonexistent_file(self, client):
        """Test resizing a non-existent file"""
        resize_data = {
            'filename': 'nonexistent.jpg',
            'width': 50,
            'height': 50
        }
        response = client.post('/api/v1/media/resize', json=resize_data)
        
        assert response.status_code == 404
        data = response.get_json()
        assert data['success'] is False
        assert 'File not found' in data['error']
    
    def test_resize_no_json_data(self, client):
        """Test resize without JSON data"""
        response = client.post('/api/v1/media/resize')
        
        # Flask returns 500 when Content-Type is not application/json
        # Our error handling catches this and returns our standard error format
        assert response.status_code == 500
        data = response.get_json()
        assert data['success'] is False
        assert 'Internal server error during image resizing' in data['error']


class TestIntegration:
    """Integration tests for complete workflows"""
    
    def test_complete_workflow(self, client, sample_image):
        """Test complete upload -> get -> resize -> delete workflow"""
        # 1. Upload
        upload_response = client.post('/api/v1/media/upload', data={
            'file': (sample_image, 'workflow_test.jpg')
        })
        assert upload_response.status_code == 200
        upload_data = upload_response.get_json()
        filename = upload_data['data']['filename']
        
        # 2. Get
        get_response = client.get(f'/api/v1/media/get/{filename}')
        assert get_response.status_code == 200
        
        # 3. Resize
        resize_data = {
            'filename': filename,
            'width': 75,
            'height': 75
        }
        resize_response = client.post('/api/v1/media/resize', json=resize_data)
        assert resize_response.status_code == 200
        resize_response_data = resize_response.get_json()
        resized_filename = resize_response_data['data']['resized_filename']
        
        # 4. Get resized image
        get_resized_response = client.get(f'/api/v1/media/get/{resized_filename}')
        assert get_resized_response.status_code == 200
        
        # 5. Delete original
        delete_response = client.delete(f'/api/v1/media/delete/{filename}')
        assert delete_response.status_code == 200
        
        # 6. Delete resized
        delete_resized_response = client.delete(f'/api/v1/media/delete/{resized_filename}')
        assert delete_resized_response.status_code == 200
        
        # 7. Verify both files are gone
        final_get_original = client.get(f'/api/v1/media/get/{filename}')
        assert final_get_original.status_code == 404
        
        final_get_resized = client.get(f'/api/v1/media/get/{resized_filename}')
        assert final_get_resized.status_code == 404