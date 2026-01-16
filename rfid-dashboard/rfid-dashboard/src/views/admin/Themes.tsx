import React, { useState, useEffect } from "react";
import { Header, Sidebar, bgImage } from "./import";

const Themes: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main
          className="flex-1 p-6 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})` }}
        ></main>
      </div>
    </div>
  );
};

export default Themes;
