from app import create_app
from config import get_config
import os

config_name = os.getenv('FLASK_ENV', 'development')
app = create_app(get_config(config_name))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
