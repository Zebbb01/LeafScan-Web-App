from flask import Flask, jsonify, request
import os
import numpy as np
from tensorflow.keras.models import load_model # type: ignore
from sklearn.metrics import precision_score, recall_score, f1_score
from PIL import Image
from statsmodels.tsa.statespace.sarimax import SARIMAX
from sklearn.metrics import mean_absolute_error
from statsmodels.tsa.api import ExponentialSmoothing
import pandas as pd

def init_ml_routes(app):
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