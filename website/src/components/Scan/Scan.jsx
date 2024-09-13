import { useState } from 'react';
import './Scan.css';

const Scan = () => {
  const [image, setImage] = useState(null);
  const [disease, setDisease] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [prevention, setPrevention] = useState(null);
  const [metrics, setMetrics] = useState({ accuracy: null, precision: null, recall: null, f1_score: null });
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setDisease(null);
        setConfidence(null);
        setPrevention(null);
        setMetrics({ accuracy: null, precision: null, recall: null, f1_score: null });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!image) return;

    setLoading(true);

    try {
      const base64Response = await fetch(image);
      const blob = await base64Response.blob();

      const formData = new FormData();
      formData.append('image', blob, 'image.jpg');

      const response = await fetch('/api/upload_image', {
        method: 'POST',
        body: formData,
      }, { withCredentials: true });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setDisease(data.disease);
      setConfidence(data.confidence ? (data.confidence * 100).toFixed(2) : null);
      setPrevention(data.prevention);
      setMetrics(data.metrics);
    } catch (error) {
      console.error('There was an error scanning the image:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeImage = () => {
    setImage(null);
    setDisease(null);
    setConfidence(null);
    setPrevention(null);
    setMetrics({ accuracy: null, precision: null, recall: null, f1_score: null });
  };

  return (
    <div className="scan-container">
      {loading && <div className="spinner"></div>}
      {image ? (
        <div className="image-preview">
          <div className="info-container">
            <div className="scan-info">
              <img src={image} alt="Uploaded" />
              <p>Disease: {disease || 'N/A'}</p>
              <p>Confidence: {confidence ? `${confidence}%` : 'N/A'}</p>
              <div className="button-group">
                <button className="change-button" onClick={handleChangeImage}>Change Image</button>
                <button className="scan-button" onClick={handleScan}>Scan</button>
              </div>
            </div>
            <div className="prevention-info">
              <h3>Prevention</h3>
              <p>{prevention || 'No prevention information available.'}</p>
              {metrics.accuracy !== null && (
                <div className="metrics-info">
                  <h3>Performance Metrics</h3>
                  <p>Accuracy: {metrics.accuracy.toFixed(2)}</p>
                  <p>Precision: {metrics.precision.toFixed(2)}</p>
                  <p>Recall: {metrics.recall.toFixed(2)}</p>
                  <p>F1 Score: {metrics.f1_score.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="upload-container">
          <input type="file" id="fileUpload" onChange={handleImageUpload} hidden />
          <label htmlFor="fileUpload" className="upload-label">
            Drag and drop an image or <span className="browse-link">browse to upload.</span>
          </label>
          <p>File must be JPEG, JPG, or PNG and up to 40MB</p>
          <button className="upload-button" onClick={() => document.getElementById('fileUpload').click()}>Upload your Photo</button>
        </div>
      )}
    </div>
  );
};

export default Scan;
