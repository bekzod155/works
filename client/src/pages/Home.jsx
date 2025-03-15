import React, { useEffect, useRef } from "react";
import { ReactTyped } from "react-typed";
const baseURL = process.env.REACT_APP_BASE_URL;

const Home = () => {
  const homeContRef = useRef(null);
  const hasMounted = useRef(false);
  const vantaEffectRef = useRef(null);

  // Track home visits
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      fetch(`${baseURL}/home_visits`, { method: "GET" })
        .then((response) => {
          if (!response.ok) {
            console.error("Failed to track home visit");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }, []);

  // Load Vanta scripts and initialize effect
  useEffect(() => {
    // Helper function to load a script
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    // Function to initialize Vanta effect
    const initVanta = () => {
      if (!vantaEffectRef.current && window.VANTA && window.VANTA.DOTS) {
        vantaEffectRef.current = window.VANTA.DOTS({
          el: homeContRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          scale: 1.0,
          scaleMobile: 1.0,
          backgroundColor: 0xffffff,
          color: 0xef4e,
          color2: 0xd1ff,
          size: 4.0,
          spacing: 40.0,
          showLines: false,
          speed: 4.0
        });
      }
    };

    // Load Three.js first, then Vanta DOTS
    const loadScripts = async () => {
      try {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js");
        await loadScript("https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.dots.min.js");
        initVanta();
      } catch (error) {
        console.error("Failed to load scripts:", error);
      }
    };

    loadScripts();

    // Cleanup
    return () => {
      if (vantaEffectRef.current) {
        vantaEffectRef.current.destroy();
        vantaEffectRef.current = null;
      }
    };
  }, []);

  return (
    <div 
  id="homeCont" 
  ref={homeContRef}
  className="container d-flex flex-column text-center"
  style={{ position: 'relative', minHeight: '80vh' }}
>
  <div id="animation" className="mt-5" style={{ position: 'relative', zIndex: 1 }}>
    <b className="tex">
      <ReactTyped
        strings={[
          "Ushbu loyiha Urganch shahar hokimligi tomonidan yoʻlga qoʻyilgan va sinov tarzida ishlamoqda.Platforma foydalanuvchilari oʻrtasida toʻgʻridan toʻgʻri muloqot boʻlishi tufayli shaxsga doir ma'lumotlar va pul munosabatlarida ehtiyot boʻlishingizni soʻraymiz.",
        ]}
        typeSpeed={4}
        className="w-100" // Add full width class
      />
    </b>
  </div>

  <div className="mt-3 d-flex flex-wrap justify-content-center align-items-center" style={{ position: 'relative', zIndex: 1 }}>
    <a id="btn" href="/auth" className="btn fs-4 m-2">
      Sotuvchi
    </a>
    <a id="btn" href="/worker" className="btn fs-4 m-2">
      Sotib oluvchi
    </a>
  </div>
</div>
  );
};

export default Home;