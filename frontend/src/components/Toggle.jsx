import React from "react";

const Toggle = ({ checked, onChange, label }) => {
  return (
    <label className="toggle">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="toggle-slider" />
      {label && <span className="toggle-label">{label}</span>}
    </label>
  );
};

export default Toggle;
