import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Checkbox,
} from "@mui/material";
import { useSnackbar } from "notistack";
import axios from "axios";
import API_BASE_URL from "../config/config";
import useAuthStore from "../zustand/authStore";
import DateFormatter from "../components/DateFormatter";

const CardDialog = ({ isCardModalOpen, closeCardModal, isCardEditing,fetchCardData}) => {

  const { selectedBoard, selectedCard, selectedWorkspace } = useAuthStore(); 

  const { enqueueSnackbar } = useSnackbar();
  
  const [cardData, setCardData] = useState({
    title: selectedCard ? selectedCard.TitleName : "",
    description: selectedCard ? selectedCard.Description : "",
    date: selectedCard ? DateFormatter(selectedCard.DueDate) : "",
    label: selectedCard ? selectedCard.LableName : "",
    labelColor: selectedCard ? selectedCard.LableColor : "#90CAF9",
    tasks: selectedCard ? selectedCard.TaskDT : [],
    boardId: selectedCard ? selectedCard.BoardId : selectedBoard ? selectedBoard.BoardId : null,
  });

  useEffect(() => {
    // Update cardData when selectedCard or selectedBoard changes
    setCardData((prevData) => ({
      ...prevData,
      title: selectedCard ? selectedCard.TitleName : "",
      description: selectedCard ? selectedCard.Description : "",
      date: selectedCard ? DateFormatter(selectedCard.DueDate) : "",
      label: selectedCard ? selectedCard.LableName : "",
      labelColor: selectedCard ? selectedCard.LableColor : "#90CAF9",
      tasks: selectedCard ? selectedCard.TaskDT : [],
      boardId: selectedCard ? selectedCard.BoardId : selectedBoard ? selectedBoard.BoardId : null,
    }));
  }, [selectedCard, selectedBoard]);

  const handleTaskChange = (index, field, value) => {
    setCardData((prevData) => {
      const updatedTasks = [...prevData.tasks];
      updatedTasks[index] = { ...updatedTasks[index], [field]: value };
      return { ...prevData, tasks: updatedTasks };
    });
  };

  const handleAddTask = () => {
    setCardData((prevData) => ({
      ...prevData,
      tasks: [...prevData.tasks, { TaskName: "", Status: "N" }],
    }));
  };

  const handleRemoveTask = (index) => {
    setCardData((prevData) => {
      const updatedTasks = [...prevData.tasks];
      updatedTasks.splice(index, 1);
      return { ...prevData, tasks: updatedTasks };
    });
  };

  const handleCardChange = (field, value) => {
    setCardData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleLabelChange = (value) => {
    setCardData((prevData) => ({
      ...prevData,
      label: value,
    }));
  };

  const handleColorChange = (color) => {
    setCardData((prevData) => ({
      ...prevData,
      labelColor: color,
    }));
  };

  const addOrUpdateCard = async () => {
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${(
      currentDate.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${currentDate
      .getDate()
      .toString()
      .padStart(2, "0")}T${currentDate
      .getHours()
      .toString()
      .padStart(2, "0")}:${currentDate
      .getMinutes()
      .toString()
      .padStart(2, "0")}:${currentDate
      .getSeconds()
      .toString()
      .padStart(2, "0")}`;

    const userDataString = localStorage.getItem("userData");
    if (!userDataString) {
      enqueueSnackbar("User data not found.", { variant: "error" });
      return;
    }
    const userData = JSON.parse(userDataString);
    const compid = userData[0]?.CompId;
    const branchid = userData[0]?.BranchId;

    const cardPayload = {
      TaskId: selectedCard ? selectedCard.TaskId : 0,
      TitleName: cardData.title,
      Description: cardData.description,
      DueDate: cardData.date,
      LableName: cardData.label,
      LableColor: cardData.labelColor,
      BoardId: cardData.boardId,
      WorkId: selectedWorkspace.WorkId,
      CompId: 1,
      BranchId: 1,
      CreateUid: 1,
      CreateDate: formattedDate,
      EditUid: 1,
      EditDate: formattedDate,
      TaskDT: cardData.tasks.map((task) => ({
        TaskName: task.TaskName,
        Status: task.Status === "Y" ? "Y" : "N",
      })),
    };

    console.log(cardPayload);

    try {
      const response = await axios.post(`${API_BASE_URL}/Task/SaveTask`,
        cardPayload);

      if (response.status === 200) {
        enqueueSnackbar(
          isCardEditing
            ? "Card updated successfully"
            : "Card added successfully",
          { variant: "success" }
        );
        closeCardModal();
        fetchCardData();
      } else {
        enqueueSnackbar("Failed to save Card", { variant: "error" });
      }
    } catch (error) {
      console.error("Error:", error);
      enqueueSnackbar("Failed to save Card", { variant: "error" });
    }
  };

  return (
    <Dialog
      open={isCardModalOpen}
      onClose={closeCardModal}
      fullWidth={true}
      maxWidth="sm"
      PaperProps={{
        style: { backgroundColor: "white", borderRadius: 10 },
      }}
    >
      <DialogTitle
        style={{
          cursor: "move",
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        {isCardEditing ? "EDIT CARD" : "CREATE CARD"}
      </DialogTitle>
      <DialogContent>
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Card Title</label>
          <div className="flex">
            <input
              type="text"
              value={cardData.title}
              onChange={(e) => handleCardChange("title", e.target.value)}
              className="border rounded-lg shadow-lg text-black p-2 w-full"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Card Description</label>
          <div className="flex">
            <input
              type="text"
              value={cardData.description}
              onChange={(e) => handleCardChange("description", e.target.value)}
              className="border rounded-lg shadow-lg text-black p-2 w-full"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Due Date</label>
          <div className="flex">
            <input
              type="date"
              value={cardData.date}
              onChange={(e) => handleCardChange("date", e.target.value)}
              className="border rounded-lg shadow-lg text-black p-2 w-full"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Label</label>
          <div className="flex">
            <input
              type="text"
              value={cardData.label}
              onChange={(e) => handleLabelChange(e.target.value)}
              className="border rounded-lg shadow-lg text-black p-2 w-full"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Label Color</label>
          <div className="flex">
            {["#90CAF9", "#FFC107", "#8BC34A", "#FF5722", "#E91E63"].map(
              (color, index) => (
                <div
                  key={color}
                  className={`w-8 h-8 mr-2 cursor-pointer rounded-lg shadow-lg ${
                    cardData.labelColor === color ? "border-2 border-black" : ""
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                ></div>
              )
            )}
          </div>
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Tasks</label>
          {cardData.tasks.map((task, index) => (
            <div key={index} className="flex items-center mb-2">
              <Checkbox
                checked={task.Status === "Y"}
                onChange={(e) =>
                  handleTaskChange(
                    index,
                    "Status",
                    e.target.checked ? "Y" : "N"
                  )
                }
              />
              <input
                type="text"
                value={task.TaskName}
                onChange={(e) =>
                  handleTaskChange(index, "TaskName", e.target.value)
                }
                className="border rounded-lg shadow-lg text-black p-2 mr-2"
              />
              <button
                onClick={() => handleRemoveTask(index)}
                className={`${
                  isCardEditing
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600"
                } text-white px-2 py-1 rounded-lg ml-2`}
                disabled={isCardEditing}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={handleAddTask}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Add Task
          </button>
        </div>
      </DialogContent>
      <DialogActions>
        <button
          onClick={closeCardModal}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          Cancel
        </button>
        <button
          onClick={addOrUpdateCard}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          {isCardEditing ? "Save Changes" : "Add Card"}
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default CardDialog;
