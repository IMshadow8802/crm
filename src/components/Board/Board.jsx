import { useState } from "react";
import { MoreHorizontal } from "react-feather";
import Card from "../Card/Card";
import Dropdown from "../Dropdown/Dropdown";
import Editable from "../Editable/Editable";

const lightColors = [
    '#90CAF9', // Blue 200
  ];
  

function Board(props) {
  const [showDropdown, setShowDropdown] = useState(false);

  // Function to get a random light color
  const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * lightColors.length);
    return lightColors[randomIndex];
  };

  const boardStyle = {
    backgroundColor: getRandomColor(),
  };

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  return (
    <div className="min-w-[290px] w-[290px] max-h-full flex flex-col gap-20 rounded-lg p-4 shadow-md" style={boardStyle}>
      <div className="flex justify-between items-center">
        <p className="font-bold text-1rem flex gap-5 items-center">
          {props.board?.title}
          <span className="text-gray-600">{props.board?.cards?.length || 0}</span>
        </p>
        <div className="cursor-pointer relative" onClick={toggleDropdown}>
          <MoreHorizontal />
          {showDropdown && (
            <Dropdown >
              <p className="cursor-pointer" onClick={() => props.removeBoard()}>Delete Board</p>
            </Dropdown>
          )}
        </div>
      </div>
      <div className="p-2 flex flex-col gap-10 overflow-auto rounded-lg shadow-2xl" style={boardStyle}>
        {props.board?.cards?.map((item) => (
          <Card
            key={item.id}
            card={item}
            boardId={props.board.id}
            removeCard={props.removeCard}
            dragEntered={props.dragEntered}
            dragEnded={props.dragEnded}
            updateCard={props.updateCard}
          />
        ))}
        <Editable
          text="+ Add Card"
          placeholder="Enter Card Title"
          displayClass="bg-white text-black w-full text-center"
          editClass="bg-white p-4"
          onSubmit={(value) => props.addCard(props.board?.id, value)}
        />
      </div>
    </div>
  );
}

export default Board;
