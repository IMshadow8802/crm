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
  Table,TableHead,TableRow,TableCell,TableBody
} from "@mui/material";
import {
  Delete,
  Edit,
  FileDownloadOutlined,
  PrintOutlined,
} from "@mui/icons-material";
import axios from "axios";
import { useSnackbar } from "notistack";
import API_BASE_URL from "../../config/config";
import Navbar from "../../components/Navbar";
import { Helmet } from "react-helmet-async";

const LeadStatus = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const columns = [
    {
      accessorKey: "LeadId",
      header: "Lead",
    },
    {
      accessorKey: "Date",
      header: "Date",
    },
    {
      accessorKey: "CompanyName",
      header: "Company Name",
    },
    {
      accessorKey: "FlowupDate",
      header: "Followup Date",
    },
    {
      accessorKey: "Source",
      header: "Source",
    },
    {
      accessorKey: "Status",
      header: "Status",
    },
    {
      accessorKey: "AssignTo",
      header: "Assigned To",
    },
    {
      accessorKey: "Remarks",
      header: "Remarks",
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
      accessorKey: "QueryType",
      header: "QueryType",
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
  ];

  const handleExportData = () => {
    const dataToExport = tableData.map((row) => {
      const {
        EnquiryId,
        BranchId,
        CompId,
        CreateUid,
        EditUid,
        EditDate,
        ...rest
      } = row;
      return rest;
    });

    const csvData = Papa.unparse(dataToExport);
    downloadCsv(csvData, "LeadsStatus.csv");
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

  const [detailTableData, setDetailTableData] = useState([]);

  // Function to fetch data for the second table
  const fetchDetailTableData = useCallback(
    async (leadId) => {
      try {
        const response = await axios.post(`${API_BASE_URL}/Leads/FetchLeads`, {
          Id: leadId,
        });
        console.log(response.data);
        setDetailTableData(response.data);
      } catch (error) {
        console.log(error);
        enqueueSnackbar("Failed to fetch Lead details", { variant: "error" });
      }
    },
    [setDetailTableData]
  );

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
      const response = await axios.post(
        `${API_BASE_URL}/LeadsStatus/FetchLeadsStatus`,
        { Id: 0,StartDate:formattedStartDate,EndDate:formattedEndDate },
      );
      console.log(response.data);
      setTableData(response.data);
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Failed to fetch Leadstaus", { variant: "error" });
    }
  }, [startDate, endDate, setTableData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const table = useMaterialReactTable({
    columns,
    data: tableData,
    createDisplayMode: "modal",
    editDisplayMode: "modal",
    enableEditing: true,
    getRowId: (row) => row.id,
    muiTableContainerProps: {
      sx: {
        maxHeight: "450px",
      },
    },
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
      <EditEnquiryModal
        onClose={() => table.setEditingRow(null)}
        fetchData={fetchData}
        setTableData={setTableData}
        columns={columns}
        row={row}
      />
    ),
    renderDetailPanel: ({ row }) => (
      <div
          style={{
            maxWidth: "1160px",
            overflowX: "auto",
            width: "100%",
            border: "3px solid #ddd",
            borderRadius: "8px",
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                {/* Apply styles for bold text and color in TableHead */}
                <TableCell style={{ fontWeight: "bold", color: "#2196F3" }}>
                  Date
                </TableCell>
                <TableCell style={{ fontWeight: "bold", color: "#2196F3" }}>
                  Remarks
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {detailTableData.map((detail) => (
                <TableRow key={detail.id}>
                  <TableCell>{detail.Date}</TableCell>
                  <TableCell>{detail.Remarks}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        {useEffect(() => {
          fetchDetailTableData(row.original.LeadId);
        }, [row.original.LeadId, fetchDetailTableData])}
      </div>
    ),
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Tooltip title="UPDATE STATUS">
          <IconButton color="primary" onClick={() => table.setEditingRow(row)}>
            <Edit />
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
  });

  //   return <MaterialReactTable table={table} />;
  const theme = useTheme();
  return (
    <ThemeProvider theme={theme}>
      <Box display="flex" flexDirection="column" flexGrow={1}>
        <Navbar title="LEAD STATUS" />
        <Helmet>
          <title> Lead Status</title>
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

export default LeadStatus;

export const EditEnquiryModal = ({
  onClose,
  fetchData,
  setTableData,
  columns,
  row,
}) => {
  const [values, setValues] = useState(row.original);
  console.log(values);

  const { enqueueSnackbar } = useSnackbar();
  const [sources, setSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState("");
  const [subject, setSubject] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");

  useEffect(() => {
    const fetchSources = async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/Source/FetchSource`,
          { SourceId: 0 }
        );
        setSources(response.data);

        // Check if row.original.Source exists and set the initial value
        if (row.original.Source) {
          const selectedSourceData = response.data.find(
            (sourceData) => sourceData.SourceId === row.original.Source
          );
          setSelectedSource(
            selectedSourceData ? selectedSourceData.SourceId : ""
          );
        }
      } catch (error) {
        console.error("Error fetching sources:", error);
      }
    };

    fetchSources();
  }, [row.original.Source]);

  const handleSourceChange = (event) => {
    setSelectedSource(event.target.value);
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/Subject/FetchSubject`,
          { SubjectId: 0 }
        );
        setSubject(response.data);

        // Check if row.original.SubjectId exists and set the initial value
        if (row.original.SubjectId) {
          const selectedSubjectData = response.data.find(
            (subjectData) => subjectData.SubjectId === row.original.SubjectId
          );
          setSelectedSubject(
            selectedSubjectData ? selectedSubjectData.SubjectId : ""
          );
        }
      } catch (error) {
        console.error("Error fetching subject:", error);
      }
    };

    fetchSubjects();
  }, [row.original.SubjectId]);

  const handleSubjectChange = (event) => {
    setSelectedSubject(event.target.value);
  };

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const response = await axios.post(`${API_BASE_URL}/Class/FetchClass`, {
          ClassId: 0,
        });
        setClasses(response.data);

        // Check if row.original.ClassId exists and set the initial value
        if (row.original.ClassId) {
          const selectedClassData = response.data.find(
            (classData) => classData.ClassId === row.original.ClassId
          );
          setSelectedClass(selectedClassData ? selectedClassData.ClassId : "");
        }
      } catch (error) {
        console.error("Error fetching class:", error);
      }
    };

    fetchClass();
  }, [row.original.ClassId]);

  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
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
        EnquiryId: row.original?.EnquiryId || 0,
        BranchId: row.original?.BranchId || branchid,
        CompId: row.original?.CompId || compid,
        CreateUid: row.original?.CreateUid || 2,
        EditUid: row.original?.EditUid || 2,
        EditDate: formattedDate,
        CreateDate: row.original?.CreateDate || formattedDate,
        Source: selectedSource,
        SubjectId: selectedSubject,
        ClassId: selectedClass,
      };

      console.log(updatedValues);

      await axios.post(
        `${API_BASE_URL}/Enquiry/SaveDataEnquiry`,
        updatedValues
      );

      await fetchData(setTableData);
      enqueueSnackbar("Leads Status updated successfully!", {
        variant: "success",
      });

      setValues({});
      onClose();
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Failed to update Lead Status!", { variant: "error" });
    }
  };

  const resetValues = () => {
    setValues({});
    setSelectedSource("");
    setSelectedSubject("");
    setSelectedClass("");
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
        <DialogTitle>{values.CompanyName}</DialogTitle>
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
                  {column.accessorKey === "FlowupDate"? (
                    <TextField
                      fullWidth
                      variant="standard"
                      type="date"
                      name={column.accessorKey}
                      label={column.header}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      //value={values[column.accessorKey]}
                      value={
                        values[column.accessorKey]
                          ? values[column.accessorKey].split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        setValues({
                          ...values,
                          [e.target.name]: e.target.value,
                        })
                      }
                      sx={{ gridColumn: "span 1" }}
                    />
                  )  :
                  column.accessorKey === "AssignTo" ? (
                    <FormControl sx={{ gridColumn: "span 1" }}>
                      <InputLabel>{column.header}</InputLabel>
                      <Select
                        fullWidth
                        variant="standard"
                        value={selectedSource}
                        onChange={handleSourceChange}
                      >
                        {sources.map((source) => (
                          <MenuItem
                            key={source.SourceId}
                            value={source.SourceId}
                          >
                            {source.Source}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : column.accessorKey === "Status" ? (
                    <FormControl sx={{ gridColumn: "span 1" }}>
                      <InputLabel>{column.header}</InputLabel>
                      <Select
                        fullWidth
                        variant="standard"
                        value={selectedSubject}
                        onChange={handleSubjectChange}
                      >
                        {subject.map((subject) => (
                          <MenuItem
                            key={subject.SubjectId}
                            value={subject.SubjectId}
                          >
                            {subject.SubjectName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : column.accessorKey === "Remarks" ? (
                    <TextField
                      fullWidth
                      variant="standard"
                      label={column.header}
                      name={column.accessorKey}
                      value={values[column.accessorKey]}
                      onChange={(e) =>
                        setValues({
                          ...values,
                          [e.target.name]: e.target.value,
                        })
                      }
                      sx={{ gridColumn: "span 4" }}
                    />
                  ) : (
                    <></>
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
            Update
          </Button>
        </DialogActions>
      </Dialog>
  );
};
