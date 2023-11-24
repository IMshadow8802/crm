import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = ({ title }) => {
  const location = useLocation();

  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getPathnames = () => {
    const pathnames = location.pathname.split("/").filter((x) => x);
    return pathnames.map((path, index) => (
      <Link
        to={`/${path}`}
        key={path}
        className="text-[#3F4FAF] font-sans font-semibold hover:underline"
      >
        {index === 0 ? `/${capitalizeFirstLetter(path)}` : capitalizeFirstLetter(path)}
      </Link>
    ));
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-xl">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-[#3F4FAF] origin-left font-medium text-xl duration-200 font-sans">{title}</h1>

        <div className="text-[#3F4FAF] text-sm">
          {getPathnames().map((link, index, array) => (
            <React.Fragment key={index}>
              {link}
              {index < array.length - 1 && <span className="mx-2">/</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
