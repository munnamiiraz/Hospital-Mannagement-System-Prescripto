import Banner from "../components/userComponents/Banner"
import Header from "../components/userComponents/Header";
import SpecialityMenu from "../components/userComponents/SpecialityMenu";
import TopDoctors from "../components/userComponents/TopDoctors";
// import Image from "next/image";

export default function Home() {
  return (
    <div>
      <Header />
      <SpecialityMenu />
      <TopDoctors />
      <Banner />
    </div>
  );
}
