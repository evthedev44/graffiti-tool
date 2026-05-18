import { useState } from 'react';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(selected);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const base64 = preview.split(',')[1];
      const mediaType = file.type;

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64, mediaType }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong');
      setResult(data.result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="header">
        <div className="logo">GraffitiMC</div>
        <div className="tagline">P&L Forecast Tool</div>
      </div>

      <div className="card">
        <h1>Upload Your P&L</h1>
        <p className="subtitle">
          Drop in a screenshot or image of your P&L and we'll generate a
          top-down financial forecast with key insights.
        </p>

        <div className="upload-area" onClick={() => document.getElementById('fileInput').click()}>
          {preview ? (
            <img src={preview} alt="P&L preview" className="preview-img" />
          ) : (
            <>
              <div className="upload-icon">↑</div>
              <div className="upload-text">Click to upload a P&L image</div>
              <div className="upload-sub">PNG, JPG supported</div>
            </>
          )}
        </div>

        <input
          id="fileInput"
          type="file"
          accept="image/png, image/jpeg"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {file && (
          <button className="btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Analyzing...' : 'Generate Forecast →'}
          </button>
        )}

        {error && <div className="error">{error}</div>}
      </div>

      {result && (
        <div className="card result-card">
          <h2>Forecast & Analysis</h2>
          <div className="result-body">{result}</div>
        </div>
      )}

      <div className="footer">
        GraffitiMC · Austin, TX · graffitimc.com
      </div>
    </div>
  );
}

export default App;
