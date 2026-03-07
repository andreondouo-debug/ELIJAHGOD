import React, { useRef, useState, useEffect, useCallback } from 'react';
import './SignaturePad.css';

/**
 * ✍️ PAVÉ DE SIGNATURE NUMÉRIQUE
 * Supporte souris + tactile (tablette, smartphone)
 * Export en Base64 PNG via onConfirm(base64)
 */
function SignaturePad({ onConfirm, onCancel, label = 'Signez ici' }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const lastPos = useRef(null);

  /* ── Initialisation du canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  /* ── Helpers position ── */
  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  /* ── Dessin ── */
  const startDrawing = useCallback((e) => {
    e.preventDefault();
    setIsDrawing(true);
    lastPos.current = getPos(e);
  }, []);

  const draw = useCallback((e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
    setIsEmpty(false);
  }, [isDrawing]);

  const stopDrawing = useCallback((e) => {
    e.preventDefault();
    setIsDrawing(false);
    lastPos.current = null;
  }, []);

  /* ── Effacer ── */
  const effacer = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };

  /* ── Confirmer ── */
  const confirmer = () => {
    if (isEmpty) {
      alert('Veuillez signer avant de confirmer.');
      return;
    }
    const canvas = canvasRef.current;
    const base64 = canvas.toDataURL('image/png');
    onConfirm(base64);
  };

  return (
    <div className="signature-pad-wrapper">
      <p className="signature-pad-label">{label}</p>
      <div className="signature-pad-canvas-container">
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          className="signature-pad-canvas"
          /* Souris */
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          /* Tactile */
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {isEmpty && (
          <div className="signature-pad-placeholder">
            <span>✍️ Tracez votre signature ici</span>
          </div>
        )}
      </div>
      <div className="signature-pad-actions">
        <button
          type="button"
          className="sp-btn sp-btn-clear"
          onClick={effacer}
        >
          🗑️ Effacer
        </button>
        {onCancel && (
          <button
            type="button"
            className="sp-btn sp-btn-cancel"
            onClick={onCancel}
          >
            Annuler
          </button>
        )}
        <button
          type="button"
          className="sp-btn sp-btn-confirm"
          onClick={confirmer}
          disabled={isEmpty}
        >
          ✅ Confirmer la signature
        </button>
      </div>
    </div>
  );
}

export default SignaturePad;
