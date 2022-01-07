import React, { useEffect } from "react";
import "./styles.css";
import image1 from "../../assets/image1.png";
import image2 from "../../assets/image2.png";
import image3 from "../../assets/image3.png";
import image4 from "../../assets/image4.png";
import image5 from "../../assets/image5.png";
import "aos/dist/aos.css";
import AOS from "aos";
const data: Array<string> = [image1, image2, image3, image4, image5];
const Team = () => {
  useEffect(() => {
    AOS.init({});
  }, []);
  return (
    <div data-aos="fade-up" data-aos-duration="1000" className="team">
      {data.map((item, index) => (
        <img key={index} src={item} alt="" />
      ))}
    </div>
  );
};

export default Team;
