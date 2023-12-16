import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import Navbar from "../components/Navbar";
import useAuthStore from "../zustand/authStore";
import API_BASE_URL from "../config/config";
import { useSnackbar } from "notistack";
import axios from "axios";

const Workspace = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const { selectedWorkspace, updateSelectedWorkspace } = useAuthStore();

  console.log(selectedWorkspace);

  const [workspaceData, setWorkSpaceData] = useState([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceColor, setNewWorkspaceColor] = useState("#90CAF9");
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const fixedColors = [
    "#FFC107", // Amber
    "#8BC34A", // Light Green
    "#E91E63", // Pink
    "#4CAF50", // Green
    "#FF9800", // Orange
    "#9C27B0", // Purple
    "#FF5722", // Deep Orange
    "#2196F3", // Blue
    "#FFEB3B", // Yellow
    "#607D8B", // Blue Grey
    // Add more colors as needed
  ];

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/WorkSpace/FetchWorkSpace`,
        { WorkId: 0 }
      );
      setWorkSpaceData(response.data);
    } catch (error) {
      console.error("Error:", error);
      enqueueSnackbar("Failed to fetch Workspaces", { variant: "error" });
    }
  }, [setWorkSpaceData, enqueueSnackbar]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleWorkspaceChange = (e) => {
    setNewWorkspaceName(e.target.value);
  };

  const handleOpenButton = (workspace) => {
    updateSelectedWorkspace(workspace);
    localStorage.setItem('selectedWorkspace', JSON.stringify(workspace));
    navigate("/board");
  };


  const openWorkspaceModal = (editWorkspace) => {
    setIsModalOpen(true);
    setIsEditing(!!editWorkspace);
    setNewWorkspaceName(editWorkspace ? editWorkspace.WorkName : "");
    setNewWorkspaceColor(editWorkspace ? editWorkspace.Color : fixedColors[0]);
    setSelectedColorIndex(
      fixedColors.indexOf(editWorkspace ? editWorkspace.Color : fixedColors[0])
    );

    updateSelectedWorkspace(editWorkspace);
  };

  const closeWorkspaceModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setNewWorkspaceName("");
    setNewWorkspaceColor(fixedColors[0]);
    setSelectedColorIndex(0);

    updateSelectedWorkspace(null);
  };

  const addOrUpdateWorkspace = async () => {
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

    // Parse userdata array from JSON
    const userData = JSON.parse(userDataString);

    // Retrieve compid and branchid from the specific object inside userdata array
    const compid = userData[0]?.CompId;
    const branchid = userData[0]?.BranchId;

    const workspacePayload = {
      WorkId: isEditing ? selectedWorkspace.WorkId : 0,
      WorkName: newWorkspaceName,
      Color: newWorkspaceColor,
      BranchId: branchid,
      CompId: compid,
      CreateUid: 1,
      CreateDate: formattedDate,
      EditUid: 1,
      EditDate: formattedDate,
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/WorkSpace/SaveWorkSpace`,
        workspacePayload
      );

      if (response.status === 200) {
        enqueueSnackbar(
          isEditing
            ? "Workspace updated successfully"
            : "Workspace added successfully",
          { variant: "success" }
        );
        fetchData(); // Refresh workspaceData after adding/editing
        closeWorkspaceModal();
      } else {
        enqueueSnackbar("Failed to save Workspace", { variant: "error" });
      }
    } catch (error) {
      console.error("Error:", error);
      enqueueSnackbar("Failed to save Workspace", { variant: "error" });
    }
  };

  const handleDeleteRow = useCallback(
    async (workspace) => {
      //console.log(workspace);
      enqueueSnackbar(`Are you sure you want to delete this Workspace?`, {
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
          await axios.post(`${API_BASE_URL}/WorkSpace/DeleteWorkSpace`, {
            WorkId: workspace.WorkId,
          });
          setWorkSpaceData((prevState) =>
            prevState.filter((item) => item.WorkId !== workspace.WorkId)
          );
          await fetchData(setWorkSpaceData);
          enqueueSnackbar("Workspace deleted successfully!", {
            variant: "success",
          });
        } catch (error) {
          console.log("Error deleting Workspace:", error);
          enqueueSnackbar("Failed to delete Workspace!", { variant: "error" });
        }
      };
    },
    [fetchData, closeSnackbar]
  );

  return (
    <>
      <Navbar title="WORKSPACES" />
      <div className="p-4">
        <div className="mt-2 flex justify-end">
          <button
            onClick={() => openWorkspaceModal(null)}
            className="bg-green-500 hover:bg-green-600 text-white  px-4 py-2 rounded-lg shadow-xl mb-5"
          >
            Create Workspace
          </button>
        </div>
        <div>
          {workspaceData.map((workspace) => (
            <div
              key={workspace.WorkId}
              className="mb-4 p-4 rounded-lg shadow-lg flex items-center justify-between"
              style={{ backgroundColor: workspace.Color }}
            >
              <span className="text-white">{workspace.WorkName}</span>
              <div className="flex gap-4">
                <button
                  className="text-white bg-green-500 hover:bg-green-600 py-2 px-4 rounded-lg shadow-lg"
                  onClick={() => {
                    handleOpenButton(workspace);
                  }}
                >
                  Open
                </button>
                <button
                  className="text-white bg-red-500 hover:bg-red-600 py-2 px-4 rounded-lg shadow-lg"
                  onClick={() => handleDeleteRow(workspace)}
                >
                  Delete
                </button>
                <button
                  className="text-white bg-blue-500 hover:bg-blue-600 py-2 px-4 rounded-lg shadow-lg"
                  onClick={() => openWorkspaceModal(workspace)}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Workspace Modal */}
        <Dialog
          open={isModalOpen}
          onClose={closeWorkspaceModal}
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
            {isEditing ? "EDIT WORKSPACE" : "CREATE WORKSPACE"}
          </DialogTitle>
          <DialogContent>
            <div className="mb-4">
              <label className="block mb-2 font-semibold">Workspace Name</label>
              <div className="flex">
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={handleWorkspaceChange}
                  className="border rounded-lg shadow-lg text-black p-2 w-full"
                />
              </div>
            </div>
            <div className="">
              <label className="block mb-2 font-semibold">
                Workspace Color
              </label>
              <div className="flex">
                {fixedColors.map((color, index) => (
                  <div
                    key={color}
                    className={`w-8 h-8 mr-2 cursor-pointer rounded-lg shadow-lg ${
                      selectedColorIndex === index
                        ? "border-2 border-black"
                        : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setNewWorkspaceColor(color);
                      setSelectedColorIndex(index);
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <button
              onClick={closeWorkspaceModal}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow-lg"
            >
              Cancel
            </button>
            <button
              onClick={addOrUpdateWorkspace}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg"
            >
              {isEditing ? "Save Changes" : "Add Workspace"}
            </button>
          </DialogActions>
        </Dialog>
      </div>
    </>
  );
};

export default Workspace;
