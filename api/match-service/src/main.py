import os
from app import create_app


if __name__ == "__main__":
    app = create_app()
    port = int(os.environ.get("PORT", 8003))
    debug = os.environ.get("DEBUG", "True").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
