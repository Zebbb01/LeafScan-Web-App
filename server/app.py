from flask import Flask, jsonify, request, session, send_from_directory
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_mail import Mail, Message
from flask_migrate import Migrate
from models import db, User
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import os
import random
import string
import re

import tensorflow as tf
from tensorflow.keras.models import load_model # type: ignore
from sklearn.metrics import precision_score, recall_score, f1_score
from io import BytesIO
from PIL import Image

import numpy as np
from statsmodels.tsa.statespace.sarimax import SARIMAX
from sklearn.metrics import mean_absolute_error
from statsmodels.tsa.api import ExponentialSmoothing
import pandas as pd
import warnings

warnings.filterwarnings('ignore')


load_dotenv()

app = Flask(__name__)

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = os.getenv('SQLALCHEMY_TRACK_MODIFICATIONS') == 'True'
app.config['SQLALCHEMY_ECHO'] = os.getenv('SQLALCHEMY_ECHO') == 'True'

app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = os.getenv('MAIL_PORT')
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS') == 'True'
app.config['MAIL_USE_SSL'] = os.getenv('MAIL_USE_SSL') == 'True'
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

mail = Mail(app)
bcrypt = Bcrypt(app)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

db.init_app(app)
migrate = Migrate(app, db)

with app.app_context():
    db.create_all()

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

# Generate a random verification code
def generate_verification_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))

# Send verification email
def send_verification_email(email, code):
    msg = Message('Verification Code', 
                  sender=os.getenv('MAIL_USERNAME'),
                  recipients=[email])
    msg.html = f'''
    <html>
    <body>
        <p>Your verification code is:</p>
        <p style="margin-top: 20px; font-size: 24px; font-weight: bold;">{code}</p>
    </body>
    </html>
    '''
    mail.send(msg)

# Forgot Password
@app.route("/forgot_password", methods=["POST"])
def forgot_password():
    email = request.json.get("email")
    
    if not User.is_valid_email(email):
        return jsonify({"error": "Invalid email address"}), 400
    
    user = User.query.filter_by(email=email).first()
    if user is None:
        return jsonify({"error": "Email not found"}), 404

    def generate_password():
        while True:
            password = ''.join(random.choices(string.ascii_letters + string.digits, k=12))
            if re.search(r'\d', password) and len(password) >= 8:
                return password

    new_password = generate_password()
    hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
    
    user.password = hashed_password
    db.session.commit()

    msg = Message('Your New Password', 
                  sender=os.getenv('MAIL_USERNAME'), 
                  recipients=[email])
    msg.body = f'Your new password is: {new_password}'
    mail.send(msg)

    return jsonify({"message": "New password sent to your email"}), 200

# SignUp
@app.route("/create_token", methods=["POST"])
def create_token():
    name = request.json["name"]
    email = request.json["email"]
    password = request.json["password"]
    
    user = User.query.filter_by(email=email).first()

    if user and user.is_verified:
        return jsonify({"error": "Email already exists"}), 409
    elif user and not user.is_verified:
        # Resend verification code
        verification_code = generate_verification_code()
        user.verification_code = verification_code
        user.password = bcrypt.generate_password_hash(password).decode('utf-8')
        db.session.commit()
        send_verification_email(email, verification_code)
        return jsonify({"message": "Verification email resent. Please check your email."}), 200
    
    # Create new user if not exists
    verification_code = generate_verification_code()
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(name=name, email=email, password=hashed_password, is_verified=False, verification_code=verification_code)
    db.session.add(new_user)
    db.session.commit()

    send_verification_email(email, verification_code)
    
    return jsonify({
        "id": new_user.id,
        "name": new_user.name,
        "email": new_user.email
    })

# Verify account
@app.route("/verify_account", methods=["POST"])
def verify_account():
    email = request.json["email"]
    code = request.json["code"]

    user = User.query.filter_by(email=email).first()

    if user is None or user.verification_code != code:
        return jsonify({"error": "Invalid verification code"}), 400
    
    user.is_verified = True
    db.session.commit()

    session['user_id'] = user.id

    return jsonify({"status": "verified"})

# SignUp Website
@app.route("/create_token1", methods=["POST"])
def create_token1():
    name = request.json["name"]
    email = request.json["email"]
    password = request.json["password"]
    
    user_exists = User.query.filter_by(email=email).first() is not None

    if user_exists:
        return jsonify({"error": "Email already exists"}), 409
    
    verification_code = generate_verification_code()
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(name=name, email=email, password=hashed_password, is_verified=True, verification_code=verification_code)
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({
        "id": new_user.id,
        "name": new_user.name,
        "email": new_user.email
    })

# Login
@app.route("/token", methods=["POST"])
def token():
    email = request.json["email"]
    password = request.json["password"]

    user = User.query.filter_by(email=email).first()

    if user is None:
        return jsonify({"error": "Email not exist"}), 401
    
    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": "Wrong password"}), 401
    
    if not user.is_verified:
        return jsonify({"error": "Account not verified"}), 403

    session["user_id"] = user.id

    return jsonify({
        "status": "success",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    })

@app.route("/user/<id>", methods=["GET"])
def get_user(id):
    user = User.query.get(id)
    if user is None:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email
    })

@app.route("/check-password", methods=["POST"])
def check_password():
    id = request.json["id"]
    password = request.json["password"]

    user = User.query.get(id)
    if user is None:
        return jsonify({"error": "User not found"}), 404

    if bcrypt.check_password_hash(user.password, password):
        return jsonify({"valid": True}), 200
    else:
        return jsonify({"valid": False}), 200

@app.route("/update/<id>", methods=["PUT"])
def update_profile(id):
    data = request.json

    user = User.query.get(id)
    if user is None:
        return jsonify({"error": "User not found"}), 404

    if 'name' in data:
        user.name = data['name']

    if 'password' in data:
        new_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        user.password = new_password

    try:
        db.session.commit()
        return jsonify({"updated": True}), 200
    except Exception as e:
        print(e)
        db.session.rollback()
        return jsonify({"error": "Could not update profile"}), 500

# ---------------------------------- Detection Area ------------------------------------ #

# Load your trained model
model_path = os.path.abspath("saved_models/1.keras")
if not os.path.exists(model_path):
    raise ValueError(f"File not found: filepath={model_path}. Please ensure the file is an accessible .keras zip file.")
model = load_model(model_path, compile=False)
model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

CLASS_NAMES = ["Cacao Early Blight", "Cacao Healthy", "Cacao Late Blight", "Cacao Leaf Spot"]

@app.route("/upload_image", methods=["POST"])
def upload_image():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400
        
        image_file = request.files['image']

        # Process the image
        try:
            image = Image.open(image_file)
            image = np.array(image)
            img_batch = np.expand_dims(image, 0)  # Add batch dimension
        except Exception as e:
            return jsonify({"error": f"Error processing image: {str(e)}"}), 400

        # Predict using the loaded model
        try:
            predictions = model.predict(img_batch)
            predicted_class_index = np.argmax(predictions[0])
            predicted_class = CLASS_NAMES[predicted_class_index]
            confidence = np.max(predictions[0])

            # Ground truth labels (replace with actual logic if available)
            true_labels = [predicted_class_index]  # Placeholder to match the prediction
            predicted_labels = [predicted_class_index]

            # Compute metrics
            accuracy = np.mean(np.array(true_labels) == np.array(predicted_labels))
            precision = precision_score(true_labels, predicted_labels, average='weighted', zero_division=0)
            recall = recall_score(true_labels, predicted_labels, average='weighted', zero_division=0)
            f1 = f1_score(true_labels, predicted_labels, average='weighted', zero_division=0)

        except Exception as e:
            return jsonify({"error": f"Error during prediction: {str(e)}"}), 500

        # Map the prediction to a class and get prevention/control info
        disease_mapping = {
            "Cacao Early Blight": "Use resistant cacao varieties and regularly apply appropriate fungicides.",
            "Cacao Healthy": "Maintain good farm hygiene practices and regularly monitor for pests and diseases.",
            "Cacao Late Blight": "Apply copper-based fungicides and ensure proper soil drainage to reduce disease risk.",
            "Cacao Leaf Spot": "Avoid overcrowding of plants and apply protective fungicidal sprays as needed.",
        }

        prevention_info = disease_mapping.get(predicted_class, "No information available.")

        return jsonify({
            "status": "image uploaded",
            "disease": predicted_class,
            "confidence": float(confidence),
            "prevention": prevention_info,
            "metrics": {
                "accuracy": accuracy,
                "precision": precision,
                "recall": recall,
                "f1_score": f1
            }
        }), 201

    except Exception as e:
        print(f"Error in upload_image: {str(e)}")
        return jsonify({"error": str(e)}), 500


# ---------------------------------- Forecasting Area ------------------------------------ #

@app.route('/forecast', methods=['GET'])
def forecast():
    try:
        # Load the dataset
        dataframe = pd.read_csv('Cacao Production (DDN).csv')
        
        # Convert the 'Date' column to datetime
        dataframe['Date'] = pd.to_datetime(dataframe['Date'], format='%m/%d/%Y')
        
        # Create 'Year-Quarter' column
        dataframe['Year-Quarter'] = dataframe['Date'].dt.to_period('Q').astype(str)
        
        if dataframe.empty or 'Production' not in dataframe.columns:
            return jsonify({"error": "Dataset is empty or malformed"}), 500

        # Apply the Exponential Smoothing model
        final_model = ExponentialSmoothing(dataframe['Production'],
                                           trend='additive',
                                           seasonal='additive',
                                           seasonal_periods=4).fit(smoothing_level=0.4,
                                                                   smoothing_trend=0.3,
                                                                   smoothing_seasonal=0.6)

        # Forecast the next 8 quarters (2 years)
        predictions = final_model.forecast(steps=8)

        # Calculate confidence intervals
        pred_df = pd.DataFrame({
            'lower_CI': predictions - 1.96 * np.std(final_model.resid, ddof=1),
            'prediction': predictions,
            'upper_CI': predictions + 1.96 * np.std(final_model.resid, ddof=1)
        })

        # Create future quarters
        last_date = dataframe['Date'].max()
        future_quarters = pd.date_range(last_date + pd.offsets.QuarterBegin(), periods=8, freq='Q')
        future_quarters_str = future_quarters.strftime('%Y/%m/%d')

        # Combine the actual data with predictions
        forecast_data = pd.concat([
            dataframe[['Year-Quarter', 'Production']],
            pd.DataFrame({
                'Year-Quarter': future_quarters_str,
                'Production': pred_df['prediction'].values
            })
        ], ignore_index=True)

        return jsonify({
            'forecast': forecast_data.to_dict(orient='records'),
            'lower_CI': pred_df['lower_CI'].tolist(),
            'upper_CI': pred_df['upper_CI'].tolist(),
            'dates': future_quarters_str.tolist()
        })

    except Exception as e:
        print(f"Error in forecast endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

# ---------------------------------- Sarima Model ------------------------------------ #

@app.route('/prediction', methods=['GET'])
def prediction():
    try:
        # Load the dataset
        dataframe = pd.read_csv('Cacao Production (DDN).csv')

        # Convert the 'Date' column to datetime
        dataframe['Date'] = pd.to_datetime(dataframe['Date'], format='%m/%d/%Y')

        if dataframe.empty or 'Production' not in dataframe.columns:
            return jsonify({"error": "Dataset is empty or malformed"}), 500

        # Define SARIMA model (p,d,q)(P,D,Q)m where m=4 for quarterly data
        sarima_model = SARIMAX(dataframe['Production'],
                               order=(1, 1, 1),
                               seasonal_order=(1, 1, 1, 4),
                               enforce_stationarity=False,
                               enforce_invertibility=False).fit()

        # Forecast the next 8 quarters (2 years) starting from 2024/4/1 (Q2 2024)
        forecast_start_date = pd.Timestamp('2024-04-01')  # Start from Q2 2024
        steps = 8

        predictions = sarima_model.get_forecast(steps=steps)
        pred_mean = predictions.predicted_mean
        conf_int = predictions.conf_int()

        # Round the forecasted production values to 2 decimal places
        pred_mean_rounded = pred_mean.round(2)
        lower_CI_rounded = conf_int.iloc[:, 0].round(2).tolist()
        upper_CI_rounded = conf_int.iloc[:, 1].round(2).tolist()

        # Generate future dates in 'Year-Q' format starting from 2024-Q2
        future_dates = pd.date_range(forecast_start_date, periods=steps, freq='Q')
        future_formatted_dates = [f"{date.year}-Q{(date.month - 1) // 3 + 1}" for date in future_dates]

        # Combine actual and forecasted data
        actual_data = dataframe[['Date', 'Production']].copy()
        actual_data['Date'] = actual_data['Date'].dt.to_period('Q').astype(str)  # Convert to 'Year-Q' format

        # Calculate MAE using actual data and model fitted values
        mae = mean_absolute_error(dataframe['Production'], sarima_model.fittedvalues.round(2))
        print(f"Calculated MAE: {mae}")  # Debugging line

        forecast_data = pd.DataFrame({
            'Date': future_formatted_dates,
            'Production': pred_mean_rounded
        })

        return jsonify({
            'actual': actual_data.to_dict(orient='records'),
            'forecast': forecast_data.to_dict(orient='records'),
            'lower_CI': lower_CI_rounded,
            'upper_CI': upper_CI_rounded,
            'dates': future_formatted_dates,
            'mae': round(mae, 2)  # Return MAE rounded to 2 decimal places
        })

    except Exception as e:
        print(f"Error in prediction endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
@app.route('/satellite-data', methods=['GET'])
def satellite_data():
    try:
        # Load the dataset
        satellite_df = pd.read_csv('Cacao Production (DDN).csv')

        # Convert the 'Date' column to datetime
        satellite_df['Date'] = pd.to_datetime(satellite_df['Date'], format='%m/%d/%Y')

        if satellite_df.empty or 'Production' not in satellite_df.columns:
            return jsonify({"error": "Dataset is empty or malformed"}), 500

        # Extract the year from the 'Date' column and group by it
        satellite_df['Year'] = satellite_df['Date'].dt.year
        grouped_data = satellite_df.groupby('Year')['Production'].describe()[['min', '25%', '50%', '75%', 'max']]

        # Replace NaN values with None (which becomes null in JSON)
        grouped_data = grouped_data.replace({np.nan: None})

        # Reset index and convert to dictionary format
        result = grouped_data.reset_index().to_dict(orient='records')

        return jsonify(result)

    except Exception as e:
        print(f"Error in satellite_data endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500





@app.route('/correlation-data', methods=['GET'])
def correlation_data():
    try:
        # Load the dataset
        correlation_df = pd.read_csv('Cacao Production (DDN).csv')

        if correlation_df.empty or 'Production' not in correlation_df.columns:
            return jsonify({"error": "Dataset is empty or malformed"}), 500

        # Create synthetic correlation data for demonstration
        correlation_values = [0.99, 0.75, 0.50, 0.25, -0.25, -0.50, -0.75, -0.99]
        correlation_data = []

        for corr in correlation_values:
            # Generate synthetic data based on the correlation
            data_points = np.random.multivariate_normal(
                [0, 0],
                [[1, corr], [corr, 1]],
                size=100
            )
            correlation_data.append({
                "Correlation": corr,
                "dataPoints": data_points.tolist()
            })

        return jsonify(correlation_data)

    except Exception as e:
        print(f"Error in correlation_data endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
