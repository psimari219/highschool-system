import React from 'react';
import { Sun, Moon, Droplet, Sunrise } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <select className="form-control" value={theme} onChange={e=>setTheme(e.target.value)} style={{ padding: '6px 10px', minWidth: 140 }}>
        <option value="dark">Dark (Default)</option>
        <option value="light">Light</option>
        <option value="ocean">Ocean</option>
        <option value="sunset">Sunset</option>
      </select>
    </div>
  );
}
