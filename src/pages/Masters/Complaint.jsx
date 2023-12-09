import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  MRT_EditActionButtons,
  MaterialReactTable,
  // createRow,
  useMaterialReactTable,
} from "material-react-table";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
  ThemeProvider,
  Select,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Delete,
  Edit,
  FileDownloadOutlined,
  PrintOutlined,
  AddOutlined,
  FileUploadOutlined,
} from "@mui/icons-material";
import axios from "axios";
import { useSnackbar } from "notistack";
import API_BASE_URL from "../../config/config";
import Navbar from "../../components/Navbar";
import { Helmet } from "react-helmet";
import readXlsxFile from "read-excel-file";
import Papa from "papaparse";

const Complaint = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [status, setStatus] = useState([]);
  const [assign, setAssign] = useState([]);
  const [ctype, setCtype] = useState([]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/Status/FetchStatus`,
          {
            Id: 0,
          }
        );
        setStatus(response.data);
      } catch (error) {
        console.error("Error fetching Status:", error);
      }
    };

    fetchStatus();
  }, []);

  useEffect(() => {
    const fetchCType = async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/ComplainType/FetchComplainType`,
          {
            Id: 0,
          }
        );
        setCtype(response.data);
      } catch (error) {
        console.error("Error fetching Complaint Type:", error);
      }
    };

    fetchCType();
  }, []);

  useEffect(() => {
    const fetchAssign = async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/UserList/FetchUserList`,
          {
            UserId: 0,
          }
        );
        setAssign(response.data);
      } catch (error) {
        console.error("Error fetching Assign:", error);
      }
    };

    fetchAssign();
  }, []);

  const columns = [
    {
      accessorKey: "Date",
      header: "Date",
    },
    // {
    //   accessorKey: "ComplainNo",
    //   header: "Complain No",
    // },
    {
      accessorKey: "ComplainType",
      header: "Complaint Type",
      editVariant: "select",
      editSelectOptions: ctype.map((ct) => ct.ComplainType),
    },
    {
      accessorKey: "CustomerName",
      header: "Customer Name",
    },
    {
      accessorKey: "ContactName",
      header: "Contact Name",
    },
    {
      accessorKey: "ContactNo",
      header: "Contact No",
    },
    {
      accessorKey: "Address",
      header: "Address",
    },
    {
      accessorKey: "Complain",
      header: "Complain",
    },
    {
      accessorKey: "Assign",
      header: "Assigned To",
      editVariant: "select",
      editSelectOptions: assign.map((assignedTo) => assignedTo.UserName),
    },
    {
      accessorKey: "Status",
      header: "Status",
      editVariant: "select",
      editSelectOptions: status.map((status) => status.Status),
    },
  ];

  const handleExportData = () => {
    const dataToExport = tableData.map((row) => {
      const {
        Id,
        BranchId,
        CompId,
        CreateUid,
        Edituid,
        EditDate,
        EditUid,
        ...rest
      } = row;
      return rest;
    });

    const csvData = Papa.unparse(dataToExport);
    downloadCsv(csvData, "Complaint.csv");
  };

  const downloadCsv = (csvData, filename) => {
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const downloadPdf = () => {};

  function formatDates(originalData) {
    // Create a new object to avoid modifying the original data
    const formattedData = { ...originalData };

    // Format 'Date'
    const dateParts = formattedData.Date.split("-");
    const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    formattedData.Date = formattedDate;
    return formattedData;
  }

  const [currentRowData, setCurrentRowData] = useState(null);
  //console.log(currentRowData);
  const [currentRow, setCurrentRow] = useState(null);

  const handleSaveCell = (cell, value) => {
    const { row, column } = cell;
    setCurrentRow(row);
    const accessorKey = column.id;

    // Update the changes for the current row
    setCurrentRowData((prevData) => ({
      ...prevData,
      [accessorKey]: value,
    }));
  };

  const handleUpdate = async () => {
    try {
      if (Object.keys(currentRowData).length > 0 && currentRow) {
        // Include the original data of the row
        const updatedRow = {
          ...currentRow.original,
          ...currentRowData,
        };
        const statusId = status.find(
          (status) => status.Status === updatedRow.Status
        )?.Id;
        const assignToId = assign.find(
          (assignedTo) => assignedTo.UserName === updatedRow.Assign
        )?.UserId;

        const cTypeId = ctype.find(
          (ct) => ct.ComplainType === updatedRow.ComplainType
        )?.Id;

        // Update formattedData with the retrieved IDs
        const formattedData = {
          ...formatDates(updatedRow),
          Status: statusId,
          Assign: assignToId,
          ComplainType:cTypeId
        };

        console.log(formattedData);
        await axios.post(
          `${API_BASE_URL}/Complain/SaveComplainRegister`,
          formattedData
        );
        await fetchData();
        enqueueSnackbar("Complaint updated successfully!", {
          variant: "success",
        });

        // Clear the current row data after the update
        setCurrentRow(null);
        setCurrentRowData(null);
      } else {
        enqueueSnackbar("No data to update.", { variant: "warning" });
      }
    } catch (error) {
      console.log("Error updating Complaint:", error);
      enqueueSnackbar("Failed to update Complaint!", { variant: "error" });
    }
  };

  const [tableData, setTableData] = useState([]);
  const fetchData = useCallback(async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/Complain/FetchComplainRegister`,
        { Id: 0 }
      );
      //console.log(response.data);
      setTableData(response.data);
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Failed to fetch Complaint", { variant: "error" });
    }
  }, [setTableData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteRow = useCallback(
    async (row) => {
      console.log(row);
      enqueueSnackbar(`Are you sure you want to delete this Complaint?`, {
        variant: "warning",
        persist: true,
        action: (key) => (
          <>
            <Button
              onClick={() => {
                deleteItem();
                closeSnackbar(key);
              }}
            >
              Yes
            </Button>
            <Button
              onClick={() => {
                closeSnackbar(key);
              }}
            >
              No
            </Button>
          </>
        ),
      });

      const deleteItem = async () => {
        try {
          await axios.post(`${API_BASE_URL}/Leads/DeleteLeads`, {
            Id: row.original.Id,
          });
          setTableData((prevState) =>
            prevState.filter((item) => item.Id !== row.Id)
          );
          await fetchData(setTableData);
          enqueueSnackbar("Lead deleted successfully!", {
            variant: "success",
          });
        } catch (error) {
          console.log("Error deleting Lead:", error);
          enqueueSnackbar("Failed to delete Lead!", { variant: "error" });
        }
      };
    },
    [fetchData, closeSnackbar, enqueueSnackbar]
  );

  const table = useMaterialReactTable({
    columns,
    data: tableData,
    createDisplayMode: "modal",
    editDisplayMode: "cell",
    enableEditing: true,
    enableRowActions: true,
    getRowId: (row) => row.id,
    muiTableContainerProps: {
      sx: {
        maxHeight: "450px",
      },
    },
    muiTableBodyCellProps: ({ cell }) => ({
      onBlur: (event) => {
        handleSaveCell(cell, event.target.value);
      },
    }),
    renderCreateRowDialogContent: ({ table }) => (
      <>
        <CreateEnquiryModal
          onClose={() => table.setCreatingRow(null)}
          fetchData={fetchData}
          setTableData={setTableData}
          columns={columns}
          status={status}
          assign={assign}
          ctype={ctype}
        />
      </>
    ),
    renderRowActions: ({ row }) => (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() => handleDeleteRow(row)}>
            <Delete />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Box
        sx={{
          display: "flex",
          gap: "1rem",
          p: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        <Button
          color="primary"
          startIcon={<AddOutlined />}
          onClick={() => table.setCreatingRow(true)}
          variant="contained"
        >
          Create
        </Button>
        <Button
          color="primary"
          onClick={handleExportData}
          startIcon={<FileDownloadOutlined />}
          variant="contained"
        >
          Export All Data
        </Button>
        <Button
          color="error"
          onClick={downloadPdf}
          startIcon={<PrintOutlined />}
          variant="contained"
        >
          Print as PDF
        </Button>
      </Box>
    ),
    renderBottomToolbarCustomActions: () => (
      <Box
        sx={{
          display: "flex",
          gap: "1rem",
          p: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        <Button
          color="success"
          onClick={handleUpdate}
          variant="contained"
          disabled={!currentRowData}
        >
          Update
        </Button>
      </Box>
    ),
  });

  //   return <MaterialReactTable table={table} />;
  const theme = useTheme();
  return (
    <ThemeProvider theme={theme}>
      <Box display="flex" flexDirection="column" flexGrow={1}>
        <Navbar title="COMPLAINT REGISTER" />
        <Helmet>
          <title> Complaint</title>
        </Helmet>
        <div
          style={{
            maxWidth: "100%",
            overflowX: "auto",
            width: "100%",
            marginTop: "20px",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        >
          <MaterialReactTable table={table} />
        </div>
      </Box>
    </ThemeProvider>
  );
};

export default Complaint;

export const CreateEnquiryModal = ({
  onClose,
  fetchData,
  columns,
  status,
  assign,
  ctype
}) => {
  const [values, setValues] = useState(() => {
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${currentDate.getDate().toString().padStart(2, "0")}`;
  
    return {
      ...columns.reduce((acc, column) => {
        acc[column.accessorKey ?? ""] = "";
        return acc;
      }, {}),
      Date: formattedDate,
    };
  });  

  const { enqueueSnackbar } = useSnackbar();
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedAssign, setSelectedAssign] = useState("");
  const [selectedCType, setSelectedCType] = useState("");

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  const handleAssignChange = (event) => {
    setSelectedAssign(event.target.value);
  };

  const handleCTypeChange = (event) => {
    setSelectedCType(event.target.value);
  };

  const handleSubmit = async () => {
    const requiredFields = ["CustomerName", "ContactNo"];

    const missingFields = requiredFields.filter((field) => !values[field]);

    if (missingFields.length > 0) {
      missingFields.forEach((field) => {
        enqueueSnackbar(`${field} is required.`, { variant: "error" });
      });
      return;
    }
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

    try {
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
      const updatedValues = {
        ...values,
        Id: 0,
        ComplainNo:0,
        BranchId: branchid,
        CompId: compid,
        CreateUid: 2,
        EditUid: 2,
        EditDate: formattedDate,
        CreateDate: formattedDate,
        Status: selectedStatus,
        Assign: selectedAssign,
        ComplainType:selectedCType
      };

      console.log(updatedValues);

      await axios.post(
        `${API_BASE_URL}/Complain/SaveComplainRegister`,
        updatedValues
      );

      fetchData();
      enqueueSnackbar("Complaint created successfully!", {
        variant: "success",
      });

      resetValues();

      onClose();
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Failed to create Complaint!", { variant: "error" });
    }
  };

  const resetValues = () => {
    setValues(() =>
      columns.reduce((acc, column) => {
        acc[column.accessorKey ?? ""] = "";
        return acc;
      }, {})
    );
    setSelectedStatus("");
    setSelectedAssign("");
    setSelectedCType("");
  };

  const theme = useTheme();
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog
      open={open}
      fullWidth={true}
      maxWidth={isSmallScreen ? "xs" : "md"}
      PaperProps={{
        style: { borderRadius: 10 },
      }}
    >
      <div className="bg-[#3F4FAF] p-4 text-white text-center">
        <DialogTitle>CREATE COMPLAINT</DialogTitle>
      </div>
      <DialogContent>
        <form onSubmit={(e) => e.preventDefault()}>
          <Box
            display="grid"
            gap="30px"
            gridTemplateColumns="repeat(4, minmax(0, 1fr))"
            sx={{
              "& >div": { gridColumn: isNonMobile ? undefined : "span 4" },
            }}
          >
            {columns.map((column, index) => (
              <React.Fragment key={index}>
                {column.accessorKey === "Date" ? (
                  <TextField
                    fullWidth
                    variant="standard"
                    label={column.header}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    type="date"
                    name={column.accessorKey}
                    value={values[column.accessorKey]}
                    onChange={(e) =>
                      setValues({
                        ...values,
                        [e.target.name]: e.target.value,
                      })
                    }
                    sx={{ gridColumn: "span 1" }}
                  />
                ): column.accessorKey === "ComplainType" ? (
                  <FormControl sx={{ gridColumn: "span 1" }}>
                    <InputLabel>{column.header}</InputLabel>
                    <Select
                      fullWidth
                      variant="standard"
                      value={selectedCType}
                      onChange={handleCTypeChange}
                    >
                      {ctype.map((ct) => (
                        <MenuItem key={ct.Id} value={ct.Id}>
                          {ct.ComplainType}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )  : column.accessorKey === "Status" ? (
                  <FormControl sx={{ gridColumn: "span 1" }}>
                    <InputLabel>{column.header}</InputLabel>
                    <Select
                      fullWidth
                      variant="standard"
                      value={selectedStatus}
                      onChange={handleStatusChange}
                    >
                      {status.map((stat) => (
                        <MenuItem key={stat.Id} value={stat.Id}>
                          {stat.Status}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : column.accessorKey === "Assign" ? (
                  <FormControl sx={{ gridColumn: "span 1" }}>
                    <InputLabel>{column.header}</InputLabel>
                    <Select
                      fullWidth
                      variant="standard"
                      value={selectedAssign}
                      onChange={handleAssignChange}
                    >
                      {assign.map((assign) => (
                        <MenuItem key={assign.UserId} value={assign.UserId}>
                          {assign.UserName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    fullWidth
                    variant="standard"
                    label={column.header}
                    name={column.accessorKey}
                    onChange={(e) =>
                      setValues({
                        ...values,
                        [e.target.name]: e.target.value,
                      })
                    }
                    sx={{ gridColumn: "span 1" }}
                  />
                )}
              </React.Fragment>
            ))}
          </Box>
        </form>
      </DialogContent>
      <DialogActions sx={{ p: "1.25rem" }}>
        <Button
          color="error"
          onClick={() => {
            onClose();
            resetValues();
          }}
          variant="contained"
        >
          Cancel
        </Button>
        <Button color="success" onClick={handleSubmit} variant="contained">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};
