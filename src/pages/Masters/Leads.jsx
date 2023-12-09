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

const Leads = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [sources, setSources] = useState([]);
  const [query, setQuery] = useState([]);
  const [status, setStatus] = useState([]);
  const [assign, setAssign] = useState([]);

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
    const dataToExport = tableData.map((row) => {
      const { Id, BranchId, CompId, CreateUid, EditUid, EditDate, ...rest } =
        row;
      return rest;
    });

    const csvData = Papa.unparse(dataToExport);
    downloadCsv(csvData, "Leads.csv");
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
        enqueueSnackbar("Leads updated successfully!", {
          variant: "success",
        });

        // Clear the current row data after the update
        setCurrentRow(null);
        setCurrentRowData(null);
      } else {
        enqueueSnackbar("No data to update.", { variant: "warning" });
      }
    } catch (error) {
      console.log("Error updating Leads:", error);
      enqueueSnackbar("Failed to update Leads!", { variant: "error" });
    }
  };

  const [tableData, setTableData] = useState([]);
  const fetchData = useCallback(async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/Leads/FetchLeads`, {
        Id: 0,
      });
      //console.log(response.data)
      setTableData(response.data);
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Failed to fetch Leads", { variant: "error" });
    }
  }, [setTableData]);

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
  const [selectedSource, setSelectedSource] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedQuery, setSelectedQuery] = useState("");
  const [selectedAssign, setSelectedAssign] = useState("");

  const handleSourceChange = (event) => {
    setSelectedSource(event.target.value);
  };

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  const handleQueryChange = (event) => {
    setSelectedQuery(event.target.value);
  };

  const handleAssignChange = (event) => {
    setSelectedAssign(event.target.value);
  };

  const handleSubmit = async () => {
    const requiredFields = ["Name", "MobileNo"]; // Add other required fields here

    const missingFields = requiredFields.filter((field) => !values[field]);

    if (missingFields.length > 0) {
      missingFields.forEach((field) => {
        enqueueSnackbar(`${field} is required.`, { variant: "error" });
      });
      return; // Do not proceed with submission if fields are missing
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
        Source: selectedSource,
        Status: selectedStatus,
        QueryType: selectedQuery,
        AssignTo: selectedAssign,
      };

      console.log(updatedValues);

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
    setSelectedSource("");
    setSelectedStatus("");
    setSelectedQuery("");
    setSelectedAssign("");
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
      <div className="bg-[#3F4FAF] p-4 text-white text-center">
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
                ) : column.accessorKey === "QueryType" ? (
                  <FormControl sx={{ gridColumn: "span 1" }}>
                    <InputLabel>{column.header}</InputLabel>
                    <Select
                      fullWidth
                      variant="standard"
                      value={selectedQuery}
                      onChange={handleQueryChange}
                    >
                      {query.map((qu) => (
                        <MenuItem key={qu.Id} value={qu.Id}>
                          {qu.QueryType}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : column.accessorKey === "Source" ? (
                  <FormControl sx={{ gridColumn: "span 1" }}>
                    <InputLabel>{column.header}</InputLabel>
                    <Select
                      fullWidth
                      variant="standard"
                      value={selectedSource}
                      onChange={handleSourceChange}
                    >
                      {sources.map((source) => (
                        <MenuItem key={source.Id} value={source.Id}>
                          {source.SourceName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : column.accessorKey === "AssignTo" ? (
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
