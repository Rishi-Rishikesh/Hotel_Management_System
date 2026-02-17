import React from "react";
import Slider from "../components/Slider";
import Header from "../layouts/Header";
//import Header from "../layouts/header";
import ServiceSection from "../components/ServiceSection";
import Gallery from "../components/Gallery";
import End from "../components/End";

const Home = () => {
  return (
    <div>
      <Header />
      <Slider />
      <ServiceSection />
      <Gallery />
      <End />
    </div>
  );
};

export default Home;
