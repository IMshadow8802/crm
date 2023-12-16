import { useState,useEffect } from "react";
import { AssignmentTurnedIn, Visibility } from "@mui/icons-material";
import CardDialog from "../pages/CardDialog";
import useAuthStore from "../zustand/authStore";
import DateFormatter from "./DateFormatter";

const DraggableCard = ({ card, index,fetchCardData}) => {
  const { selectedCard, updateSelectedCard } = useAuthStore();

  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  // Function to open Card modal
  const openCardModal = () => {
    updateSelectedCard(card);
    setIsCardModalOpen(true);
  };

  // Function to close Card modal
  const closeCardModal = () => {
    setIsCardModalOpen(false);
    updateSelectedCard(null);
  };
  return (
    <>
      <div
        className="mb-2 bg-white rounded-lg shadow-lg p-2"
      >
        {/* Card content */}
        <div className="font-bold shadow-xl p-2 rounded-lg flex justify-between items-center">
        <div className="truncate max-w-[200px] text-lg">{card.TitleName}</div>
          <button
            className="rounded-lg shadow-lg p-2 text-black cursor-pointer"
            onClick={openCardModal}
          >
            <Visibility />
          </button>
        </div>
        <div className="max-w-[300px] break-words font-semibold text-md text-gray-500">{card.Description}</div>
        <div className="mt-2 text-sm text-black font-bold">{`Due Date: ${DateFormatter(card.DueDate)}`}</div>
        <div className="flex mt-2 flex-col">
          <div
            className="rounded-lg px-2 py-1 text-white w-fit"
            style={{ backgroundColor: card.LableColor }}
          >
            {card.LableName}
          </div>
          <div className="flex items-center mt-2">
            <AssignmentTurnedIn color="action" />
            <span className="ml-1 font-bold">
              {`${card.TaskDT.filter((task) => task.Status === "Y").length}/${
                card.TaskDT.length
              }`}{" "}
              tasks completed
            </span>
          </div>
        </div>
      </div>

      <CardDialog
        isCardModalOpen={isCardModalOpen}
        closeCardModal={closeCardModal}
        isCardEditing={true}
        fetchCardData = {fetchCardData}
      />
    </>
  );
};

export default DraggableCard;
