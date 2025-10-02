import Banner from "../components/userComponents/Banner"
import Header from "../components/userComponents/Header";
import SpecialityMenu from "../components/userComponents/SpecialityMenu";
import TopDoctors from "../components/userComponents/TopDoctors";

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
