// Card.js
import React from "react";

const Card = ({ title, onClickDelete, onClickEdit }) => {
  return (
    <div className="p-4 rounded-lg shadow-lg bg-white">
      <div className="flex items-center justify-center h-16">
        <span className="text-black">{title}</span>
      </div>
      <div className="flex justify-center mt-2">
        <button
          className="text-white bg-red-500 hover:bg-red-600 py-2 px-4 rounded-lg shadow-lg"
          onClick={onClickDelete}
        >
          Delete
        </button>
        <button
          className="text-white bg-blue-500 hover:bg-blue-600 py-2 px-4 rounded-lg shadow-lg"
          onClick={onClickEdit}
        >
          Edit
        </button>
      </div>
    </div>
  );
};

export default Card;
