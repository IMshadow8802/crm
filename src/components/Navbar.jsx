const Navbar = ({ title }) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-xl">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-[#3F4FAF] origin-left font-bold text-xl">{title}</h1>

        <h6 className="text-[#3F4FAF] origin-left font-bold text-lg">eCRM</h6>
      </div>
    </div>
  );
};

export default Navbar;
