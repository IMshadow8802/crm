import { useEffect, useRef } from "react";

function Dropdown(props) {
  const dropdownRef = useRef();

  const handleClick = (event) => {
    if (
      dropdownRef &&
      !dropdownRef.current?.contains(event.target) &&
      props.onClose
    )
      props.onClose();
  };

  useEffect(() => {
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  });

  return (
    <div
      ref={dropdownRef}
      className={`absolute right-0 top-full bg-white border rounded-lg overflow-hidden shadow-lg p-4 w-max`}
    >
      <div className="flex flex-row">{props.children}</div>
    </div>
  );
}

export default Dropdown;
