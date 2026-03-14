import MainInventory from "../components/Fridge/MainInventory";

const HomePage = ({ onShowToast }) => {
  return (
    <div className="relative w-full aspect-[3/5] shadow-2xl cursor-pointer">
      <MainInventory onShowToast={onShowToast} />
    </div>
  );
};
export default HomePage;
