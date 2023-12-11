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
  TextField,
  MenuItem,
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
import { Helmet } from "react-helmet-async";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { mkConfig, generateCsv, download } from "export-to-csv";

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
  filename: "Complaint",
});

const Complaint = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [status, setStatus] = useState([]);
  const [assign, setAssign] = useState([]);
  const [ctype, setCtype] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const columns = [
    {
      accessorKey: "Date",
      header: "Date",
    },
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

  const handleExportData = () => {
    const dataWithoutId = tableData.map(
      ({
        Id,
        BranchId,
        CompId,
        CreateUid,
        CreateDate,
        Edituid,
        EditDate,
        EditUid,
        ...rest
      }) => rest
    );
    const csv = generateCsv(csvConfig)(dataWithoutId);
    download(csvConfig)(csv);
  };

  const downloadPdf = () => {
    // Create a new jsPDF instance
    const pdf = new jsPDF();

    // Set up the header row in the PDF
    const headers = columns.map((column) => column.header);
    const data = tableData.map((row) =>
      columns.map((column) => row[column.accessorKey])
    );

    // Add the data to the PDF
    pdf.autoTable({
      head: [headers],
      body: data,
    });

    // Save the PDF with a filename
    pdf.save("Complaints.pdf");
  };

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
        // Validate ContactNo
        const contactNo = updatedRow.ContactNo.toString(); // Convert to string
        const contactNoValidation = /^[0-9]{10}$/;
        if (!contactNoValidation.test(contactNo)) {
          enqueueSnackbar(
            "Invalid ContactNo. It should be a 10-digit number.",
            {
              variant: "error",
            }
          );
          return;
        }

        const requiredFields = ["ComplainType", "Assign", "Status"];
        const missingFields = requiredFields.filter(
          (field) => !updatedRow[field]
        );

        if (missingFields.length > 0) {
          enqueueSnackbar(
            `The following fields are required: ${missingFields.join(", ")}`,
            {
              variant: "error",
            }
          );
          return;
        }

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
          ComplainType: cTypeId,
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

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const [tableData, setTableData] = useState([]);
  const fetchData = useCallback(async () => {
    const formattedStartDate = startDate
      ? new Date(startDate).toISOString().split("T")[0]
      : "";
    const formattedEndDate = endDate
      ? new Date(endDate).toISOString().split("T")[0]
      : "";
    try {
      const response = await axios.post(
        `${API_BASE_URL}/Complain/FetchComplainRegister`,
        { Id: 0, StartDate: formattedStartDate, EndDate: formattedEndDate }
      );
      //console.log(response.data);
      setTableData(response.data);
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Failed to fetch Complaint", { variant: "error" });
    }
  }, [startDate, endDate, setTableData]);

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
        setCurrentRowData(null);
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
          gap: "0.9rem",
          p: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        <div className="flex items-center space-x-2">
          <label className="text-sm font-bold">Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            className="border border-black rounded p-2 shadow-lg"
          />
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-bold">End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            className="border border-black rounded p-2 shadow-lg"
          />
        </div>
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
          Export CSV
        </Button>
        <Button
          color="error"
          onClick={downloadPdf}
          startIcon={<PrintOutlined />}
          variant="contained"
        >
          Print PDF
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
  ctype,
}) => {
  const [values, setValues] = useState(() => {
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${(
      currentDate.getMonth() + 1
    )
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

  const validateField = (name, value) => {
    if (!value) {
      return `${name} is required.`;
    }
    if (name === "ContactNo") {
      const regex = /^\d{10}$/;
      return regex.test(value) ? "" : "Contact No should be a 10-digit number.";
    }
    return "";
  };

  const [errors, setErrors] = useState({});
  console.log(errors);

  const handleFieldChange = (name, value) => {
    setValues({
      ...values,
      [name]: value,
    });
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const handleFieldBlur = (name) => {
    const error = validateField(name, values[name]);
    setErrors({
      ...errors,
      [name]: error,
    });
  };

  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async () => {
    const requiredFields = [
      "CustomerName",
      "ContactNo",
      "ComplainType",
      "ContactName",
      "Address",
      "Complain",
      "Assign",
      "Status",
    ];

    const formErrors = {};
    requiredFields.forEach((field) => {
      const error = validateField(field, values[field]);
      if (error) {
        formErrors[field] = error;
      }
    });

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      enqueueSnackbar("Please fill in all required fields.", {
        variant: "error",
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
        ComplainNo: 0,
        BranchId: branchid,
        CompId: compid,
        CreateUid: 2,
        EditUid: 2,
        EditDate: formattedDate,
        CreateDate: formattedDate,
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
                ) : column.accessorKey === "ComplainType" ? (
                  <TextField
                    fullWidth
                    variant="standard"
                    label={column.header}
                    select
                    onChange={(e) =>
                      handleFieldChange(column.accessorKey, e.target.value)
                    }
                    onBlur={() => handleFieldBlur(column.accessorKey)}
                    helperText={errors[column.accessorKey]}
                    error={Boolean(errors[column.accessorKey])}
                    sx={{ gridColumn: "span 1" }}
                  >
                    {ctype.map((ct) => (
                      <MenuItem key={ct.Id} value={ct.Id}>
                        {ct.ComplainType}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : column.accessorKey === "Status" ? (
                  <TextField
                    fullWidth
                    variant="standard"
                    label={column.header}
                    select
                    onChange={(e) =>
                      handleFieldChange(column.accessorKey, e.target.value)
                    }
                    onBlur={() => handleFieldBlur(column.accessorKey)}
                    helperText={errors[column.accessorKey]}
                    error={Boolean(errors[column.accessorKey])}
                    sx={{ gridColumn: "span 1" }}
                  >
                    {status.map((stat) => (
                      <MenuItem key={stat.Id} value={stat.Id}>
                        {stat.Status}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : column.accessorKey === "Assign" ? (
                  <TextField
                    fullWidth
                    variant="standard"
                    label={column.header}
                    select
                    onChange={(e) =>
                      handleFieldChange(column.accessorKey, e.target.value)
                    }
                    onBlur={() => handleFieldBlur(column.accessorKey)}
                    helperText={errors[column.accessorKey]}
                    error={Boolean(errors[column.accessorKey])}
                    sx={{ gridColumn: "span 1" }}
                  >
                    {assign.map((assign) => (
                      <MenuItem key={assign.UserId} value={assign.UserId}>
                        {assign.UserName}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : (
                  <TextField
                    fullWidth
                    variant="standard"
                    label={column.header}
                    name={column.accessorKey}
                    onChange={(e) =>
                      handleFieldChange(column.accessorKey, e.target.value)
                    }
                    onBlur={() => handleFieldBlur(column.accessorKey)}
                    helperText={errors[column.accessorKey]}
                    error={Boolean(errors[column.accessorKey])}
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
