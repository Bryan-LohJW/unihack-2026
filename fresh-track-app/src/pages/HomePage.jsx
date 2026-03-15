import MainInventory from "../components/Fridge/MainInventory";

const HomePage = ({ onShowToast, onKarmaChange }) => {
  return (
    <div className="relative w-full aspect-[3/5] shadow-2xl cursor-pointer">
      <MainInventory onShowToast={onShowToast} onKarmaChange={onKarmaChange} />
    </div>
  );
};
export default HomePage;
