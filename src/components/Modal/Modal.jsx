import React from "react";

function Modal(props) {
  return (
    <div
      className="fixed top-0 left-0 h-full min-h-screen w-full bg-black bg-opacity-46 flex justify-center items-center z-20 rounded-lg"
      onClick={() => (props.onClose ? props.onClose() : "")}
    >
      <div
        className="overflow-y-auto max-h-95vh bg-white rounded-lg"
        onClick={(event) => event.stopPropagation()}
      >
        {props.children}
      </div>
    </div>
  );
}

export default Modal;
