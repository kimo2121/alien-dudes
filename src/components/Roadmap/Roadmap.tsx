import React, { useEffect } from "react";
import "./styles.css";

import "aos/dist/aos.css";
import AOS from "aos";

interface RoadmapType {
  data: {
    question: string;
    answer: string;
  }[];
}

const data: RoadmapType["data"] = [
  {
    question: "01 | Presale",
    answer: "Plenty opportunites for whitelist spots",
  },
  {
    question: "02 | The Mothership",
    answer: `100 Alien Giveaway during Mint Phase ${(
      <a target="_blank" href="/">
        Discord
      </a>
    )}`,
  },
  {
    question: "03 | Multi-verse",
    answer: "Aliens Collaborate w/ projects across the metaverse.",
  },
  {
    question: "04 | Planets",
    answer: "A universe begins. Interoperable with multiple games",
  },
];

const Roadmap = () => {
  useEffect(() => {
    AOS.init({});
  }, []);
  return (
    <div data-aos="fade-up" data-aos-duration="1000" className="roadmap">
      <h2>ROAD MAP</h2>
      {data.map((item, index) => (
        <div className="question" key={index}>
          <p>{item.question}</p>
          <p>{item.answer}</p>
        </div>
      ))}
    </div>
  );
};

export default Roadmap;
