import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

const BoardDialog = ({
  isModalOpen,
  closeBoardModal,
  isEditing,
  newBoardName,
  handleBoardChange,
  fixedColors,
  selectedColorIndex,
  handleColorSelection,
  addOrUpdateBoard,
  selectedBoard,
}) => {
  return (
    <Dialog
      open={isModalOpen}
      onClose={closeBoardModal}
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
        {isEditing ? "EDIT BOARD" : "CREATE BOARD"}
      </DialogTitle>
      <DialogContent>
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Board Name</label>
          <div className="flex">
            <input
              type="text"
              value={newBoardName}
              onChange={handleBoardChange}
              className="border rounded-lg shadow-lg text-black p-2 w-full"
            />
          </div>
        </div>
        <div className="">
          <label className="block mb-2 font-semibold">Board Color</label>
          <div className="flex">
            {fixedColors.map((color, index) => (
              <div
                key={color}
                className={`w-8 h-8 mr-2 cursor-pointer rounded-lg shadow-lg ${
                  selectedColorIndex === index ? "border-2 border-black" : ""
                }`}
                style={{ backgroundColor: color }}
                onClick={() => {
                  handleColorSelection(color, index);
                }}
              />
            ))}
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <button
          onClick={closeBoardModal}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          Cancel
        </button>
        <button
          onClick={addOrUpdateBoard}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          {isEditing ? "Save Changes" : "Add Board"}
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default BoardDialog;
