import { useState } from "react";
import { CheckSquare, Clock, MoreHorizontal } from "react-feather";

import Dropdown from "../Dropdown/Dropdown";
import CardInfo from "./CardInfo/CardInfo";

function Card(props) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { id, title, date, tasks, labels, desc } = props.card;

  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (!date) return "";

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Aprl",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    return day + " " + month;
  };

  return (
    <>
      {showModal && (
        <CardInfo
          onClose={() => setShowModal(false)}
          card={props.card}
          boardId={props.boardId}
          updateCard={props.updateCard}
        />
      )}
      <div
        className="p-4 flex flex-col gap-4 bg-white rounded-lg cursor-pointer shadow-xl"
        draggable
        onDragEnd={() => props.dragEnded(props.boardId, id)}
        onDragEnter={() => props.dragEntered(props.boardId, id)}
        onClick={() => setShowModal(true)}
      >
        <div className="flex items-start">
          <div className="flex-1 flex flex-wrap gap-2 text-xs">
            {labels?.map((item, index) => (
              <label
                key={index}
                style={{ backgroundColor: item.color }}
                className="rounded-full bg-gray-700 text-white px-2"
              >
                {item.text}
              </label>
            ))}
          </div>
          <div
            className="w-6 h-4 flex items-center justify-center cursor-pointer opacity-0 transition-opacity duration-200"
            onClick={(event) => {
              event.stopPropagation();
              setShowDropdown(true);
            }}
          >
            <MoreHorizontal />
            {showDropdown && (
              <Dropdown
                class="board_dropdown"
                onClose={() => setShowDropdown(false)}
              >
                <p
                  onClick={() => props.removeCard(props.boardId, id)}
                  className="cursor-pointer"
                >
                  Delete Card
                </p>
              </Dropdown>
            )}
          </div>
        </div>
        <div className="font-bold text-2rem">{title}</div>
        <div className="font-semibold text-1rem">{desc}</div>
        <div className="flex justify-between items-center">
          {date && (
            <p className="rounded-full bg-gray-200 text-black px-2 flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDate(date)}
            </p>
          )}
          {tasks && tasks?.length > 0 && (
            <p className="rounded-full bg-gray-200 text-black px-2 flex items-center gap-1">
              <CheckSquare className="h-4 w-4" />
              {tasks?.filter((item) => item.completed)?.length}/{tasks?.length}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default Card;
