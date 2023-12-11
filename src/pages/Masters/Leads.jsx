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
import { Helmet } from "react-helmet-async";
import readXlsxFile from "read-excel-file";
import Papa from "papaparse";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { mkConfig, generateCsv, download } from "export-to-csv";

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
  filename:"Leads"
});

const Leads = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [sources, setSources] = useState([]);
  const [query, setQuery] = useState([]);
  const [status, setStatus] = useState([]);
  const [assign, setAssign] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const columns = [
    {
      accessorKey: "CompanyName",
      header: "Company Name",
    },
    {
      accessorKey: "Date",
      header: "Date",
    },
    {
      accessorKey: "Address",
      header: "Address",
    },
    {
      accessorKey: "Phone",
      header: "Phone",
    },
    {
      accessorKey: "Name",
      header: "Name",
    },
    {
      accessorKey: "Title",
      header: "Title",
    },
    {
      accessorKey: "Email",
      header: "Email",
    },
    {
      accessorKey: "MobileNo",
      header: "Mobile No",
    },
    {
      accessorKey: "Website",
      header: "Website",
    },
    {
      accessorKey: "Source",
      header: "Source",
      editVariant: "select",
      editSelectOptions: sources.map((source) => source.SourceName),
    },
    {
      accessorKey: "Status",
      header: "Status",
      editVariant: "select",
      editSelectOptions: status.map((status) => status.Status),
    },
    {
      accessorKey: "QueryType",
      header: "QueryType",
      editVariant: "select",
      editSelectOptions: query.map((queryType) => queryType.QueryType),
    },
    {
      accessorKey: "AssignTo",
      header: "Assigned To",
      editVariant: "select",
      editSelectOptions: assign.map((assignedTo) => assignedTo.UserName),
    },
    {
      accessorKey: "NoOfEmp",
      header: "NoOfEmp",
    },
    {
      accessorKey: "AnnualRevenue",
      header: "Annual Revenue",
    },
    {
      accessorKey: "Rating",
      header: "Rating",
    },
    {
      accessorKey: "Remarks",
      header: "Remarks",
    },
    {
      accessorKey: "FlowupDate",
      header: "Followup Date",
    },
  ];

  useEffect(() => {
    const fetchSources = async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/EnquirySource/FetchEnquirySource`,
          { Id: 0 }
        );
        setSources(response.data);
      } catch (error) {
        console.error("Error fetching sources:", error);
      }
    };

    fetchSources();
  }, []);

  useEffect(() => {
    const fetchQuery = async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/QueryType/FetchQueryType`,
          { Id: 0 }
        );
        setQuery(response.data);
      } catch (error) {
        console.error("Error fetching Query:", error);
      }
    };

    fetchQuery();
  }, []);

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
    const dataWithoutId = tableData.map(({ Id,
      BranchId,
      CompId,
      CreatedUid,
      CreatedDate,
      Edituid,
      EditDate,
      EditUid,
      ...rest}) => rest);
    const csv = generateCsv(csvConfig)(dataWithoutId);
    download(csvConfig)(csv);
  };

  const downloadPdf = () => {
    // Create a new jsPDF instance
    const pdf = new jsPDF({ orientation: "landscape" });
  
    // Set up the header row in the PDF
    const headers = columns.map((column) => column.header);
    const data = tableData.map((row) => columns.map((column) => row[column.accessorKey]));
  
    // Add the data to the PDF
    pdf.autoTable({
      head: [headers],
      body: data,
    });
  
    // Save the PDF with a filename
    pdf.save("Leads.pdf");
  };

  function formatDates(originalData) {
    // Create a new object to avoid modifying the original data
    const formattedData = { ...originalData };

    // Format 'Date'
    const dateParts = formattedData.Date.split("-");
    const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    formattedData.Date = formattedDate;

    // Format 'FlowupDate'
    const flowupDateParts = formattedData.FlowupDate.split("-");
    const formattedFlowupDate = `${flowupDateParts[2]}-${flowupDateParts[1]}-${flowupDateParts[0]}`;
    formattedData.FlowupDate = formattedFlowupDate;

    return formattedData;
  }

  const [currentRowData, setCurrentRowData] = useState(null);
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

        //console.log(updatedRow)
  
        // Validate Phone
        const phone = updatedRow.Phone.toString(); // Convert to string
        const phoneValidation = /^\d+$/;
        if (!phoneValidation.test(phone)) {
          enqueueSnackbar('Invalid Phone. It should be numeric.', {
            variant: 'error',
          });
          return;
        }
  
        // Validate Mobile
        const mobile = updatedRow.MobileNo.toString(); // Convert to string
        const mobileValidation = /^\d{10}$/;
        if (!mobileValidation.test(mobile)) {
          enqueueSnackbar('Invalid Mobile. It should be a 10-digit number.', {
            variant: 'error',
          });
          return;
        }
  
        // Validate Email
        const email = updatedRow.Email.toString(); // Convert to string
        const emailValidation = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailValidation.test(email)) {
          enqueueSnackbar('Invalid Email. Please enter a valid email address.', {
            variant: 'error',
          });
          return;
        }
  
        // Validate required fields
        const requiredFields = ['Source', 'Status', 'QueryType', 'AssignTo'];
        const missingFields = requiredFields.filter(
          (field) => !updatedRow[field]
        );
  
        if (missingFields.length > 0) {
          enqueueSnackbar(
            `The following fields are required: ${missingFields.join(', ')}`,
            {
              variant: 'error',
            }
          );
          return;
        }
  
        // Retrieve the IDs for Source, Status, QueryType, and AssignTo from updatedRow
        const sourceId = sources.find(
          (source) => source.SourceName === updatedRow.Source
        )?.Id;
        const statusId = status.find(
          (status) => status.Status === updatedRow.Status
        )?.Id;
        const queryTypeId = query.find(
          (queryType) => queryType.QueryType === updatedRow.QueryType
        )?.Id;
        const assignToId = assign.find(
          (assignedTo) => assignedTo.UserName === updatedRow.AssignTo
        )?.UserId;
  
        // Update formattedData with the retrieved IDs
        const formattedData = {
          ...formatDates(updatedRow),
          Source: sourceId,
          Status: statusId,
          QueryType: queryTypeId,
          AssignTo: assignToId,
        };
  
        await axios.post(`${API_BASE_URL}/Leads/SaveLeads`, formattedData);
        await fetchData();
        enqueueSnackbar('Leads updated successfully!', {
          variant: 'success',
        });
  
        // Clear the current row data after the update
        setCurrentRow(null);
        setCurrentRowData(null);
      } else {
        enqueueSnackbar('No data to update.', { variant: 'warning' });
      }
    } catch (error) {
      console.log('Error updating Leads:', error);
      enqueueSnackbar('Failed to update Leads!', { variant: 'error' });
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
    const formattedStartDate = startDate ? new Date(startDate).toISOString().split('T')[0] : '';
    const formattedEndDate = endDate ? new Date(endDate).toISOString().split('T')[0] : '';
    try {
      const response = await axios.post(`${API_BASE_URL}/Leads/FetchLeads`, {
        Id: 0,
        StartDate: formattedStartDate,
        EndDate: formattedEndDate,
      });
      //console.log(response.data)
      setTableData(response.data);
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Failed to fetch Leads", { variant: "error" });
    }
  }, [startDate, endDate, setTableData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteRow = useCallback(
    async (row) => {
      console.log(row);
      enqueueSnackbar(`Are you sure you want to delete this Lead?`, {
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
    muiTableBodyCellProps: ({ table, cell }) => ({
      onBlur: (event) => {
        handleSaveCell(cell, event.target.value);
      },
    }),
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <CreateEnquiryModal
          onClose={() => table.setCreatingRow(null)}
          fetchData={fetchData}
          setTableData={setTableData}
          columns={columns}
          sources={sources}
          query={query}
          status={status}
          assign={assign}
        />
      </>
    ),
    renderRowActions: ({ row, table }) => (
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
          EXPORT CSV
        </Button>
        <Button
          color="error"
          onClick={downloadPdf}
          startIcon={<PrintOutlined />}
          variant="contained"
        >
          PRINT PDF
        </Button>
      </Box>
    ),
    renderBottomToolbarCustomActions: ({ table }) => (
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

  const theme = useTheme();
  return (
    <ThemeProvider theme={theme}>
      <Box display="flex" flexDirection="column" flexGrow={1}>
        <Navbar title="LEADS" />
        <Helmet>
          <title> Leads</title>
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

export default Leads;

export const CreateEnquiryModal = ({
  onClose,
  fetchData,
  setTableData,
  columns,
  sources,
  query,
  status,
  assign,
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

  const validateField = (name, value) => {
    if (!value) {
      return `${name} is required.`;
    }

    if (name === "MobileNo") {
      const regex = /^\d{10}$/;
      return regex.test(value) ? "" : "Mobile No should be a 10-digit number.";
    }

    if (name === "Phone"||name==="Rating"||name==="NoOfEmp"||name==="AnnualRevenue") {
      const numericRegex = /^[0-9]+$/;
      return numericRegex.test(value) ? "" : "Only numeric characters are allowed.";
    }

    if (name === "Email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) ? "" : "Please enter a valid email address.";
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

  const handleSubmit = async () => {
    const requiredFields = ["CompanyName", "Address","Phone","Name","Title","Email","MobileNo","Website","Source","Status","QueryType","AssignTo","NoOfEmp","AnnualRevenue","Rating","Remarks"];

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
    const compid = userData[0]?.CompId; // Assuming compid is in the first object of userdata array
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
        BranchId: branchid,
        CompId: compid,
        CreatedUid: 2,
        EditUid: 2,
        EditDate: formattedDate,
        CreatedDate: formattedDate,
      };

      //console.log(updatedValues);

      await axios.post(`${API_BASE_URL}/Leads/SaveLeads`, updatedValues);

      fetchData();
      enqueueSnackbar("Lead created successfully!", { variant: "success" });

      resetValues();

      onClose();
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Failed to create Lead!", { variant: "error" });
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
      maxWidth={isSmallScreen ? "xs" : "lg"}
      PaperProps={{
        style: { borderRadius: 10 },
      }}
    >
      <div className="bg-[#3F4FAF] p-4 text-white text-center font-bold">
        <DialogTitle>CREATE LEAD</DialogTitle>
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
                {column.accessorKey === "Date" ||
                column.accessorKey === "FlowupDate" ? (
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
                ) : column.accessorKey === "QueryType" ? (
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
                    {query.map((qu) => (
                        <MenuItem key={qu.Id} value={qu.Id}>
                          {qu.QueryType}
                        </MenuItem>
                      ))}
                  </TextField>
                ) : column.accessorKey === "Source" ? (
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
                    {sources.map((source) => (
                        <MenuItem key={source.Id} value={source.Id}>
                          {source.SourceName}
                        </MenuItem>
                      ))}
                  </TextField>
                ) : column.accessorKey === "AssignTo" ? (
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
