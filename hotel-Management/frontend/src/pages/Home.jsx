import React from "react";
import Slider from "../components/Slider";
import Header from "../layouts/Header";
import ServiceSection from "../components/ServiceSection";
import Gallery from "../components/Gallery";
import End from "../components/End";
import RoomsPreview from "../components/RoomsPreview";

const Home = () => {
  return (
    <div>
      <Header />
      <Slider />
      <RoomsPreview />
      <ServiceSection />
      <Gallery />
      <End />
    </div>
  );
};

export default Home;
