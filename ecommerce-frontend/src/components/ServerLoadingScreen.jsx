import React from "react";

const ServerLoadingScreen = () => {
  return (
    <div className="loading">
      <h2>Starting backend…</h2>
      <p>Render free tier sleeps after inactivity. Please wait.</p>
      <p>Meanwhile ui screenshots are available in my github repo</p>
      <p>
        <a href="https://github.com/faizvk/ecommerce-app" target="_blank">
          https://github.com/faizvk/ecommerce-app
        </a>
      </p>
    </div>
  );
};

export default ServerLoadingScreen;
