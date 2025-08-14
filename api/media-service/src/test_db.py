"""
Tests for Media Service with Database Integration
"""

import os
import shutil
import tempfile
from io import BytesIO

import pytest
from models import Image, db
from PIL import Image as PILImage
from test_config import create_test_app


@pytest.fixture
def client():
    """Create a test client with database"""
    app = create_test_app()

    with app.test_client() as client:
        yield client

    # Cleanup
    if os.path.exists(app.config["UPLOAD_FOLDER"]):
        shutil.rmtree(app.config["UPLOAD_FOLDER"])


@pytest.fixture
def sample_image():
    """Create a sample image for testing"""
    img = PILImage.new("RGB", (100, 100), color="red")
    img_io = BytesIO()
    img.save(img_io, "JPEG")
    img_io.seek(0)
    return img_io


@pytest.fixture
def auth_headers():
    """Headers with test user ID"""
    return {"X-Test-User-ID": "1"}


class TestDatabaseIntegration:
    """Test database integration"""

    def test_health_check(self, client):
        """Test health check still works"""
        response = client.get("/health")
        assert response.status_code == 200

        data = response.get_json()
        assert data["success"] is True
        assert data["data"]["status"] == "ok"

    def test_upload_with_database(self, client, sample_image, auth_headers):
        """Test upload saves to database"""
        response = client.post(
            "/api/v1/media/upload",
            data={"file": (sample_image, "test.jpg")},
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data["success"] is True
        assert "id" in data["data"]
        assert "filename" in data["data"]
        assert data["data"]["original_name"] == "test.jpg"

        # Verify in database
        image = Image.query.filter_by(id=data["data"]["id"]).first()
        assert image is not None
        assert image.user_id == 1
        assert image.original_name == "test.jpg"
        assert image.is_active is True

    def test_upload_without_auth(self, client, sample_image):
        """Test upload requires authentication"""
        response = client.post(
            "/api/v1/media/upload", data={"file": (sample_image, "test.jpg")}
        )

        assert response.status_code == 401
        data = response.get_json()
        assert data["success"] is False
        assert "Authentication required" in data["error"]

    def test_get_file_from_database(self, client, sample_image, auth_headers):
        """Test file retrieval uses database"""
        # First upload
        upload_response = client.post(
            "/api/v1/media/upload",
            data={"file": (sample_image, "test.jpg")},
            headers=auth_headers,
        )
        upload_data = upload_response.get_json()
        filename = upload_data["data"]["filename"]

        # Then retrieve
        response = client.get(f"/api/v1/media/get/{filename}")
        assert response.status_code == 200
        assert response.content_type.startswith("image/")

    def test_delete_with_ownership(self, client, sample_image, auth_headers):
        """Test deletion checks ownership"""
        # Upload as user 1
        upload_response = client.post(
            "/api/v1/media/upload",
            data={"file": (sample_image, "test.jpg")},
            headers=auth_headers,
        )
        upload_data = upload_response.get_json()
        filename = upload_data["data"]["filename"]

        # Try to delete as user 2 (should fail)
        other_user_headers = {"X-Test-User-ID": "2"}
        delete_response = client.delete(
            f"/api/v1/media/delete/{filename}", headers=other_user_headers
        )
        assert delete_response.status_code == 403

        # Delete as user 1 (should succeed)
        delete_response = client.delete(
            f"/api/v1/media/delete/{filename}", headers=auth_headers
        )
        assert delete_response.status_code == 200

        # Verify soft delete in database
        image = Image.query.filter_by(filename=filename).first()
        assert image is not None
        assert image.is_active is False

    def test_list_user_media(self, client, auth_headers):
        """Test listing user's media"""
        # Upload multiple files - create separate BytesIO for each
        img1 = BytesIO()
        PILImage.new("RGB", (100, 100), color="red").save(img1, "JPEG")
        img1.seek(0)
        client.post(
            "/api/v1/media/upload",
            data={"file": (img1, "test1.jpg")},
            headers=auth_headers,
        )

        img2 = BytesIO()
        PILImage.new("RGB", (100, 100), color="blue").save(img2, "JPEG")
        img2.seek(0)
        client.post(
            "/api/v1/media/upload",
            data={"file": (img2, "test2.jpg")},
            headers=auth_headers,
        )

        # List media
        response = client.get("/api/v1/media/my", headers=auth_headers)
        assert response.status_code == 200

        data = response.get_json()
        assert data["success"] is True
        assert data["data"]["count"] == 2
        assert len(data["data"]["media"]) == 2

    def test_resize_with_database(self, client, sample_image, auth_headers):
        """Test resize creates new database record"""
        # Upload original
        upload_response = client.post(
            "/api/v1/media/upload",
            data={"file": (sample_image, "test.jpg")},
            headers=auth_headers,
        )
        upload_data = upload_response.get_json()
        filename = upload_data["data"]["filename"]

        # Resize
        resize_data = {"filename": filename, "width": 50, "height": 50}
        resize_response = client.post(
            "/api/v1/media/resize", json=resize_data, headers=auth_headers
        )

        assert resize_response.status_code == 200
        resize_data = resize_response.get_json()
        assert resize_data["success"] is True
        assert "id" in resize_data["data"]

        # Verify both images exist in database
        original_image = Image.query.filter_by(filename=filename).first()
        resized_image = Image.query.filter_by(id=resize_data["data"]["id"]).first()

        assert original_image is not None
        assert resized_image is not None
        assert resized_image.width == 50
        assert resized_image.height == 50
        assert resized_image.user_id == original_image.user_id

    def test_set_profile_image(self, client, sample_image, auth_headers):
        """Test setting profile image"""
        # Upload image
        upload_response = client.post(
            "/api/v1/media/upload",
            data={"file": (sample_image, "test.jpg")},
            headers=auth_headers,
        )
        upload_data = upload_response.get_json()
        image_id = upload_data["data"]["id"]

        # Set as profile
        profile_data = {"image_id": image_id}
        response = client.post(
            "/api/v1/media/profile", json=profile_data, headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data["success"] is True

        # Verify in database
        image = Image.query.filter_by(id=image_id).first()
        assert image.is_profile is True


class TestImageModel:
    """Test Image model methods"""

    def test_image_model_creation(self):
        """Test creating Image model instances"""
        app = create_test_app()
        with app.app_context():

            image = Image(
                user_id=1,
                filename="test.jpg",
                original_name="original.jpg",
                file_path="/path/to/file.jpg",
                file_size=1024,
                mime_type="image/jpeg",
                width=100,
                height=100,
            )

            db.session.add(image)
            db.session.commit()

            # Test retrieval
            found_image = Image.get_by_filename("test.jpg")
            assert found_image is not None
            assert found_image.user_id == 1
            assert found_image.is_active is True

            # Test soft delete
            found_image.soft_delete()
            assert found_image.is_active is False

            # Should not be found by get_by_filename (only active images)
            not_found = Image.get_by_filename("test.jpg")
            assert not_found is None
