import React, { useEffect } from "react";
import "./styles.css";
import ufo from "../../assets/ufo.png";

import "aos/dist/aos.css";
import AOS from "aos";

const Comms = () => {
  useEffect(() => {
    AOS.init({});
  }, []);
  return (
    <div data-aos="fade-up" data-aos-duration="1000" className="comms">
      <h4>comms in</h4>
      <h4>
        <a target="_blank" href="https://discord.gg/thealiendudes">
          discord
        </a>{" "}
        &{" "}
        <a target="_blank" href="https://twitter.com/thealiendudes">
          twitter
        </a>
      </h4>
      <img src={ufo} alt="" />
    </div>
  );
};

export default Comms;
