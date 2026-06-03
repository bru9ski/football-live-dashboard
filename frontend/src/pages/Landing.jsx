import React, { useEffect, useState } from "react";

const Landing = ({ onEnter }) => {
  const [loading, setLoading] = useState(false);

  const handleEnter = () => {
    setLoading(true);
    setTimeout(() => {
      onEnter();
    }, 800);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="landing">
      <div className="landing-inner">
        <div className="logo-mark large" />
        <h1>LiveSports IQ</h1>
        <p>
          Um dashboard ao vivo com visual premium para acompanhar métricas,
          eventos e alertas em tempo real.
        </p>
        <button className="landing-button" onClick={handleEnter} disabled={loading}>
          {loading ? "Entrando no painel..." : "Entrar no painel"}
        </button>
      </div>
    </div>
  );
};

export default Landing;
