import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useSettings } from '../contexts/SettingsContext';

const COLOR_PRESETS = [
  '#7A5BFF',
  '#39D77D',
  '#F97316',
  '#22A7F0',
  '#FF6BB5',
  '#FACC15',
  '#1E1E2F',
  '#22C7B7',
];

const getContrastColor = (hexColor) => {
  if (!hexColor) return '#FFFFFF';
  const hex = hexColor.replace('#', '');
  const bigint = parseInt(hex, 16);
  if (Number.isNaN(bigint)) return '#FFFFFF';
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 140 ? '#1E1E2F' : '#FFFFFF';
};

const SettingsPage = () => {
  const navigate = useNavigate();
  const {
    accentColor,
    loading,
    error,
    updateSettings,
  } = useSettings();

  const [selectedColor, setSelectedColor] = useState(accentColor);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const presetSet = useMemo(() => new Set(COLOR_PRESETS.map((c) => c.toUpperCase())), []);
  const hasChanges = selectedColor.toUpperCase() !== accentColor.toUpperCase();

  useEffect(() => {
    setSelectedColor(accentColor);
  }, [accentColor]);

  const handleNavigation = (section) => {
    if (section === 'dashboard') {
      navigate('/dashboard');
    }
  };

  const handleColorChange = (value) => {
    if (!value) return;
    setSelectedColor(value.toUpperCase());
    setSuccessMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    try {
      await updateSettings({ accent_color: selectedColor });
      setSuccessMessage('Colore aggiornato con successo!');
    } catch (err) {
      // L'errore è già gestito dal context
    } finally {
      setSaving(false);
    }
  };

  const isPreset = presetSet.has(selectedColor.toUpperCase());

  return (
    <DashboardLayout
      activeNav="settings"
      onNavigate={handleNavigation}
      title="Impostazioni"
      subtitle="Personalizza l'aspetto della tua dashboard"
    >
      <div className="max-w-3xl mx-auto mt-8">
        <div className="bg-dash-card rounded-2xl shadow-dash border border-dash-border p-6 sm:p-8">
          <h2 className="text-lg font-semibold mb-2">Colore accento</h2>
          <p className="text-sm text-dash-muted mb-6">
            Seleziona il colore che verrà utilizzato per gli elementi principali dell&apos;interfaccia.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h3 className="text-sm font-medium text-dash-muted mb-3">Palette consigliata</h3>
              <div className="flex flex-wrap gap-3">
                {COLOR_PRESETS.map((color) => {
                  const isActive = selectedColor.toUpperCase() === color.toUpperCase();
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorChange(color)}
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-transform ${
                        isActive ? 'scale-105 border-dash-primary' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {isActive && <Check size={18} color={getContrastColor(color)} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-dash-muted mb-3">Colore personalizzato</h3>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(event) => handleColorChange(event.target.value)}
                  className="w-16 h-16 rounded-full border border-dash-border cursor-pointer"
                  aria-label="Seleziona un colore personalizzato"
                />
                <div>
                  <p className="text-sm font-medium">{selectedColor}</p>
                  {!isPreset && (
                    <p className="text-xs text-dash-muted">
                      Questo colore non è nella palette suggerita, verrà comunque applicato.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
                {successMessage}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="submit"
                disabled={saving || loading || !hasChanges}
                className="px-5 py-3 rounded-full text-sm font-semibold shadow-dash transition-transform hover:scale-105"
                style={{
                  backgroundColor: selectedColor,
                  color: getContrastColor(selectedColor),
                  opacity: saving || loading || !hasChanges ? 0.6 : 1,
                }}
              >
                {saving ? 'Salvataggio...' : 'Salva modifiche'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;


