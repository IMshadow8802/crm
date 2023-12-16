import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import useAuthStore from "../zustand/authStore";
import { Edit, Delete } from "@mui/icons-material";
import CardDialog from "./CardDialog";
import BoardDialog from "./BoardDialog";
import API_BASE_URL from "../config/config";
import axios from "axios";
import { useSnackbar } from "notistack";
import DraggableCard from "../components/DraggableCard";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const Board = () => {
  const {
    selectedWorkspace,
    selectedBoard,
    updateSelectedBoard,
    updateSelectedCard,
  } = useAuthStore();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [boardData, setBoardData] = useState([]);
  const [cardData, setCardData] = useState([]);
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardColor, setNewBoardColor] = useState("#90CAF9");
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const fixedColors = ["#90CAF9", "#FFC107", "#8BC34A", "#FF5722", "#E91E63"];

  const [combinedData, setCombinedData] = useState([]);
  //console.log(combinedData);

  useEffect(() => {
    // Combine boardData and cardData based on BoardId
    const combined = boardData.map((board) => {
      return {
        ...board,
        cards: cardData.filter(
          (card) => parseInt(card.BoardId, 10) === board.BoardId
        ),
      };
    });

    setCombinedData(combined);
  }, [boardData, cardData]);

  const fetchData = useCallback(async () => {
    try {
      const [boardResponse, cardResponse] = await Promise.all([
        axios.post(`${API_BASE_URL}/Board/FetchBoard`, {
          WorkId: selectedWorkspace.WorkId,
          BoardId: 0,
        }),
        axios.post(`${API_BASE_URL}/Task/fetchTask`, {
          TaskId: 0,
        }),
      ]);

      setBoardData(boardResponse.data);
      setCardData(cardResponse.data);
    } catch (error) {
      console.error("Error:", error);
      enqueueSnackbar("Failed to fetch data", { variant: "error" });
    }
  }, [setBoardData, setCardData, enqueueSnackbar, selectedWorkspace.WorkId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBoardChange = (e) => {
    setNewBoardName(e.target.value);
  };

  const handleColorSelection = (color, index) => {
    setNewBoardColor(color);
    setSelectedColorIndex(index);
  };

  const openBoardModal = (editBoard) => {
    setIsBoardModalOpen(true);
    setIsEditing(!!editBoard);
    setNewBoardName(editBoard ? editBoard.Board : "");
    setNewBoardColor(editBoard ? editBoard.Color : fixedColors[0]);
    setSelectedColorIndex(
      fixedColors.indexOf(editBoard ? editBoard.Color : fixedColors[0])
    );

    updateSelectedBoard(editBoard);
  };

  const closeBoardModal = () => {
    setIsBoardModalOpen(false);
    setIsEditing(false);
    setNewBoardName("");
    setNewBoardColor(fixedColors[0]);
    setSelectedColorIndex(0);

    updateSelectedBoard(null);
  };

  const openCardModal = (board) => {
    updateSelectedCard(null);
    updateSelectedBoard(board);
    setIsCardModalOpen(true);
  };

  const closeCardModal = () => {
    updateSelectedBoard(null);
    setIsCardModalOpen(false);
  };

  const addOrUpdateBoard = async () => {
    if (!selectedWorkspace) {
      console.error("No workspace selected.");
      return;
    }

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

    const boardPayload = {
      WorkId: selectedWorkspace.WorkId,
      BoardId: selectedBoard ? selectedBoard.BoardId : 0,
      Board: newBoardName,
      Color: newBoardColor,
      CompId: compid,
      BranchId: branchid,
      CreateUid: 1,
      CreateDate: formattedDate,
      EditUid: 1,
      EditDate: formattedDate,
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/Board/SaveBoard`,
        boardPayload
      );

      if (response.status === 200) {
        enqueueSnackbar(
          isEditing ? "Board updated successfully" : "Board added successfully",
          { variant: "success" }
        );
        fetchData();
        closeBoardModal();
      } else {
        enqueueSnackbar("Failed to save Board", { variant: "error" });
      }
    } catch (error) {
      console.error("Error:", error);
      enqueueSnackbar("Failed to save Board", { variant: "error" });
    }
  };

  const handleDeleteRow = useCallback(async (board) => {
    enqueueSnackbar(`Are you sure you want to delete this board?`, {
      variant: "default",
      persist: true,
      action: (key) => (
        <>
          <button
            className="text-white bg-red-500 hover:bg-red-600 py-2 px-4 rounded-lg shadow-lg mr-2"
            onClick={() => {
              deleteItem();
              closeSnackbar(key);
            }}
          >
            Yes
          </button>
          <button
            className="bg-green-500 hover:bg-green-600 text-white  px-4 py-2 rounded-lg shadow-xl"
            onClick={() => {
              closeSnackbar(key);
            }}
          >
            No
          </button>
        </>
      ),
    });

    const deleteItem = async () => {
      try {
        await axios.post(`${API_BASE_URL}/Board/DeleteBoard`, {
          BoardId: board.BoardId,
        });
        setBoardData((prevState) =>
          prevState.filter((item) => item.BoardId !== board.BoardId)
        );
        await fetchData();
        enqueueSnackbar("Board deleted successfully!", {
          variant: "success",
        });
        updateSelectedBoard(null);
      } catch (error) {
        console.log("Error deleting Board:", error);
        enqueueSnackbar("Failed to delete Board!", { variant: "error" });
      }
    };
  });

  const handleDragEnd = async (result) => {
    if (!result.destination) {
      return;
    }
  
    const sourceType = result.type;
    const destinationType = result.destination.droppableId.split("-")[0];
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
  
    if (sourceType === "CARD" && destinationType === "cards") {
      // Handle card drag within the same board
      const sourceBoardId = parseInt(result.source.droppableId.split("-")[2], 10);
      const destinationBoardId = parseInt(result.destination.droppableId.split("-")[2], 10);
  
      const updatedCombinedData = [...combinedData];
  
      if (sourceBoardId === destinationBoardId) {
        // Move the card within the same board
        const sourceBoardIndex = updatedCombinedData.findIndex(
          (board) => board.BoardId === sourceBoardId
        );
  
        const movedCard = updatedCombinedData[sourceBoardIndex].cards[sourceIndex];
  
        // Remove the card from the source index
        updatedCombinedData[sourceBoardIndex].cards.splice(sourceIndex, 1);
  
        // Insert the card at the destination index
        updatedCombinedData[sourceBoardIndex].cards.splice(
          destinationIndex,
          0,
          movedCard
        );
      } else {
        // Move the card between boards
        const sourceBoardIndex = updatedCombinedData.findIndex(
          (board) => board.BoardId === sourceBoardId
        );
        const destinationBoardIndex = updatedCombinedData.findIndex(
          (board) => board.BoardId === destinationBoardId
        );
  
        const sourceCardId = updatedCombinedData[sourceBoardIndex].cards[sourceIndex].TaskId;
  
        const movedCard = updatedCombinedData[sourceBoardIndex].cards[sourceIndex];
  
        // Remove the card from the source board
        updatedCombinedData[sourceBoardIndex].cards.splice(sourceIndex, 1);
  
        // Insert the card into the destination board
        updatedCombinedData[destinationBoardIndex].cards.splice(
          destinationIndex,
          0,
          movedCard
        );
  
        // Update the BoardId in the sourceCard
        movedCard.BoardId = destinationBoardId;
  
        console.log("Source Card:", movedCard);
  
        // Send the updated card data to the API
        try {
          const response = await axios.post(
            `${API_BASE_URL}/Task/SaveTask`,
            movedCard
          );
  
          if (response.status === 200) {
            console.log("Card data updated successfully!");
          } else {
            console.error("Failed to update card data");
          }
        } catch (error) {
          console.error("Error updating card data:", error);
        }
      }
  
      setCombinedData(updatedCombinedData);
    }
  };
  

  // const handleDragEnd = async (result) => {
  //   console.log(result);

  //   if (!result.destination) {
  //     return;
  //   }

  //   const sourceType = result.type;
  //   const destinationType = result.destination.droppableId.split("-")[0];
  //   const sourceIndex = result.source.index;
  //   const destinationIndex = result.destination.index;

  //   if (sourceType === "BOARD" && destinationType === "boards") {
  //     // Handle board drag within the board list
  //     const movedBoard = combinedData[sourceIndex];

  //     const updatedCombinedData = [...combinedData];
  //     updatedCombinedData.splice(sourceIndex, 1);
  //     updatedCombinedData.splice(destinationIndex, 0, movedBoard);

  //     setCombinedData(updatedCombinedData);
  //   } else if (sourceType === "CARD" && destinationType === "cards") {
  //     // Handle card drag within the same board
  //     const sourceBoardId = parseInt(
  //       result.source.droppableId.split("-")[2],
  //       10
  //     );
  //     const destinationBoardId = parseInt(
  //       result.destination.droppableId.split("-")[2],
  //       10
  //     );

  //     if (sourceBoardId === destinationBoardId) {
  //       const updatedCombinedData = [...combinedData];
  //       const sourceBoardIndex = updatedCombinedData.findIndex(
  //         (board) => board.BoardId === sourceBoardId
  //       );

  //       const sourceCardId =
  //         updatedCombinedData[sourceBoardIndex].cards[sourceIndex].TaskId;

  //       const movedCard =
  //         updatedCombinedData[sourceBoardIndex].cards[sourceIndex];

  //       // Remove the card from the source index
  //       updatedCombinedData[sourceBoardIndex].cards.splice(sourceIndex, 1);

  //       // Insert the card at the destination index
  //       updatedCombinedData[sourceBoardIndex].cards.splice(
  //         destinationIndex,
  //         0,
  //         movedCard
  //       );

  //       // Now you can use the sourceCardId to find the card in cardData
  //       const sourceCard = cardData.find(
  //         (card) => card.TaskId === sourceCardId
  //       );

  //       // Update the BoardId in the sourceCard
  //       sourceCard.BoardId = destinationBoardId;

  //       console.log("Source Card:", sourceCard);

  //       // Send the updated card data to the API
  //       try {
  //         const response = await axios.post(
  //           "http://103.30.72.63/eCRM/api/Task/SaveTask",
  //           sourceCard
  //         );

  //         if (response.status === 200) {
  //           console.log("Card data updated successfully!");
  //         } else {
  //           console.error("Failed to update card data");
  //         }
  //       } catch (error) {
  //         console.error("Error updating card data:", error);
  //       }

  //       setCombinedData(updatedCombinedData);
  //     } else {
  //       // Handle card drag between boards
  //       const sourceBoardIndex = combinedData.findIndex(
  //         (board) => board.BoardId === sourceBoardId
  //       );
  //       const destinationBoardIndex = combinedData.findIndex(
  //         (board) => board.BoardId === destinationBoardId
  //       );

  //       if (sourceBoardIndex === -1 || destinationBoardIndex === -1) {
  //         console.error(
  //           "Source or destination board not found in combined data"
  //         );
  //         console.log("Combined Data after failed update:", combinedData);
  //         return;
  //       }

  //       const sourceCardId =
  //         combinedData[sourceBoardIndex].cards[sourceIndex].TaskId;

  //       const movedCard = combinedData[sourceBoardIndex].cards[sourceIndex];

  //       // Remove the card from the source board
  //       combinedData[sourceBoardIndex].cards.splice(sourceIndex, 1);

  //       // Insert the card into the destination board
  //       combinedData[destinationBoardIndex].cards.splice(
  //         destinationIndex,
  //         0,
  //         movedCard
  //       );

  //       // Now you can use the sourceCardId to find the card in cardData
  //       const sourceCard = cardData.find(
  //         (card) => card.TaskId === sourceCardId
  //       );

  //       // Update the BoardId in the sourceCard
  //       sourceCard.BoardId = destinationBoardId;

  //       console.log("Source Card:", sourceCard);

  //       // Send the updated card data to the API
  //       try {
  //         const response = await axios.post(
  //           "http://103.30.72.63/eCRM/api/Task/SaveTask",
  //           sourceCard
  //         );

  //         if (response.status === 200) {
  //           console.log("Card data updated successfully!");
  //         } else {
  //           console.error("Failed to update card data");
  //         }
  //       } catch (error) {
  //         console.error("Error updating card data:", error);
  //       }

  //       setCombinedData([...combinedData]);
  //     }
  //   }
  // };

  return (
    <>
      <Navbar title={`Workspace: ${selectedWorkspace.WorkName}`} />
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => openBoardModal(null)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-xl mb-5"
        >
          Create Board
        </button>
      </div>
      <div className="pt-0 p-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable
            droppableId="boards-droppable"
            direction="horizontal"
            type="BOARD"
          >
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="grid grid-cols-1 gap-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
              >
                {combinedData.map((board, boardIndex) => (
                  <Draggable
                    key={board.BoardId}
                    draggableId={`board-${board.BoardId}`}
                    index={boardIndex}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        key={board.BoardId}
                        className="mr-4 mb-4 p-2"
                        style={{
                          backgroundColor: board.Color,
                          minWidth: 330,
                          borderRadius: "8px",
                        }}
                      >
                        <div className="rounded-lg shadow-lg p-2 mr-2 border-[2px] border-white text-md font-semibold flex justify-between mb-2 w-full items-center">
                          <div className="text-2xl font-body text-white">
                            {board.Board}
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="rounded-lg shadow-lg p-2 text-white  cursor-pointer"
                              onClick={() => openBoardModal(board)}
                            >
                              <Edit />
                            </button>
                            <button
                              className="rounded-lg shadow-lg p-2 text-white cursor-pointer"
                              onClick={() => handleDeleteRow(board)}
                            >
                              <Delete />
                            </button>
                          </div>
                        </div>
                        <div>
                          <Droppable
                            droppableId={`cards-droppable-${board.BoardId}`}
                            direction="vertical"
                            type="CARD"
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                              >
                                {board.cards.map((filteredCard, cardIndex) => (
                                  <Draggable
                                    key={`${filteredCard.TaskId}-${board.BoardId}`}
                                    draggableId={`card-${filteredCard.TaskId}`}
                                    index={cardIndex}
                                  >
                                    {(provided) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                      >
                                        <DraggableCard
                                          card={filteredCard}
                                          index={cardIndex}
                                          fetchCardData={fetchData}
                                        />
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </div>

                        <div>
                          <button
                            className="rounded-lg px-4 py-2 bg-[#3F4FAF] shadow-lg  text-white font-semibold"
                            onClick={() => openCardModal(board)}
                          >
                            Add Card
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <BoardDialog
          isModalOpen={isBoardModalOpen}
          closeBoardModal={closeBoardModal}
          isEditing={isEditing}
          newBoardName={newBoardName}
          handleBoardChange={handleBoardChange}
          fixedColors={fixedColors}
          selectedColorIndex={selectedColorIndex}
          handleColorSelection={handleColorSelection}
          addOrUpdateBoard={addOrUpdateBoard}
          selectedBoard={selectedBoard}
        />
        <CardDialog
          isCardModalOpen={isCardModalOpen}
          closeCardModal={closeCardModal}
          isCardEditing={false}
          fetchCardData={fetchData}
        />
      </div>
    </>
  );
};

export default Board;
