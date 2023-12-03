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
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import Papa from "papaparse";

const Leads = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

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
    },
    {
      accessorKey: "Status",
      header: "Status",
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
    {
      accessorKey: "Remarks",
      header: "Remarks",
    },
    {
      accessorKey: "AssignTo",
      header: "Assigned To",
    },
    {
      accessorKey: "FlowupDate",
      header: "Followup Date",
    },
  ];

  const handleExportData = () => {
    const dataToExport = tableData.map((row) => {
      const { Id,BranchId,CompId,CreateUid,EditUid,EditDate, ...rest } = row;
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

  const downloadPdf = () => {
    const docDefinition = {
      pageOrientation: 'landscape',
      content: [
        {
          text: "ENQUIRY",
          fontSize: 25,
          color: "#4285f4",
          bold: true,
          alignment: "left",
          margin: [0, 0, 0, 20],
        },
        {
          table: {
            headerRows: 1,
            // widths: ["*", "*", "*", "*", "*", "*", "*", "*", "*", "*", "*"],
            // Add "*" for each column to distribute the width equally
            body: [
              [
                { text: "Date", style: "tableHeader" },
                { text: "Name", style: "tableHeader" },
                { text: "MobileNo", style: "tableHeader" },
                { text: "EmailId", style: "tableHeader" },
                { text: "AltMobile", style: "tableHeader" },
                { text: "Class", style: "tableHeader" },
                { text: "Subject", style: "tableHeader" },
                { text: "School", style: "tableHeader" },
                { text: "Remarks", style: "tableHeader" },
                { text: "Source", style: "tableHeader" },
                { text: "RefName", style: "tableHeader" },
              ],
              ...tableData.map((item) => [
                item.Date,
                item.Name,
                item.MobileNo,
                item.EmailId,
                item.AltMobile,
                item.ClassId,
                item.SubjectId,
                item.School,
                item.Remarks,
                item.Source,
                item.RefName,
              ]),
            ],
          },
        },
      ],
      styles: {
        tableHeader: {
          fillColor: "#f2f2f2",
          bold: true,
        },
      },
    };
  
    pdfMake.createPdf(docDefinition).download("Enquiry.pdf");
  };

  const [tableData, setTableData] = useState([]);
  const fetchData = useCallback(async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/Leads/FetchLeads`,
        { Id: 0 }
      );
       console.log(response.data)
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
    editDisplayMode: "modal",
    enableEditing: true,
    getRowId: (row) => row.id,
    muiTableContainerProps: {
      sx: {
        maxHeight: "450px",
      },
    },

    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <CreateEnquiryModal
          onClose={() => table.setCreatingRow(null)}
          fetchData={fetchData}
          setTableData={setTableData}
          columns={columns}
        />
      </>
    ),
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
      <EditEnquiryModal
        onClose={() => table.setEditingRow(null)}
        fetchData={fetchData}
        setTableData={setTableData}
        columns={columns}
        row={row}
      />
    ),
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Tooltip title="Edit">
          <IconButton color="primary" onClick={() => table.setEditingRow(row)}>
            <Edit />
          </IconButton>
        </Tooltip>
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
  });

  //   return <MaterialReactTable table={table} />;
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
}) => {
  const [values, setValues] = useState(() =>
    columns.reduce((acc, column) => {
      acc[column.accessorKey ?? ""] = "";
      return acc;
    }, {})
  );

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
      } catch (error) {
        console.error("Error fetching sources:", error);
      }
    };

    fetchSources();
  }, []);

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
      } catch (error) {
        console.error("Error fetching subject:", error);
      }
    };

    fetchSubjects();
  }, []);

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
      } catch (error) {
        console.error("Error fetching class:", error);
      }
    };

    fetchClass();
  }, []);

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
        EnquiryId: 0,
        BranchId: branchid,
        CompId: compid,
        CreateUid: 2,
        EditUid: 2,
        EditDate: formattedDate,
        CreateDate: formattedDate,
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
      enqueueSnackbar("Enquiry created successfully!", { variant: "success" });

      setValues(() =>
        columns.reduce((acc, column) => {
          acc[column.accessorKey ?? ""] = "";
          return acc;
        }, {})
      );

      onClose();
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Failed to create Enquiry!", { variant: "error" });
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
    setSelectedSubject("");
    setSelectedClass("");
  };

  const theme = useTheme();
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <ThemeProvider theme={theme}>
      <Dialog
        open={open}
        fullWidth={true}
        maxWidth={isSmallScreen ? "xs" : "md"}
      >
        <DialogTitle textAlign="center">ADD LEADS</DialogTitle>
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
                      variant="filled"
                      //label={column.header}
                      type="date"
                      name={column.accessorKey}
                      value={values[column.accessorKey]}
                      onChange={(e) =>
                        setValues({
                          ...values,
                          [e.target.name]: e.target.value,
                        })
                      }
                      sx={{ gridColumn: "span 2" }}
                    />
                  ) : column.accessorKey === "SubjectId" ? (
                    <FormControl sx={{ gridColumn: "span 2" }}>
                      <InputLabel>{column.header}</InputLabel>
                      <Select
                        fullWidth
                        variant="filled"
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
                  ) : column.accessorKey === "ClassId" ? (
                    <FormControl sx={{ gridColumn: "span 2" }}>
                      <InputLabel>{column.header}</InputLabel>
                      <Select
                        fullWidth
                        variant="filled"
                        value={selectedClass}
                        onChange={handleClassChange}
                      >
                        {classes.map((classes) => (
                          <MenuItem
                            key={classes.ClassId}
                            value={classes.ClassId}
                          >
                            {classes.ClassName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : column.accessorKey === "Source" ? (
                    <FormControl sx={{ gridColumn: "span 2" }}>
                      <InputLabel>{column.header}</InputLabel>
                      <Select
                        fullWidth
                        variant="filled"
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
                  ) : (
                    <TextField
                      fullWidth
                      variant="filled"
                      label={column.header}
                      name={column.accessorKey}
                      onChange={(e) =>
                        setValues({
                          ...values,
                          [e.target.name]: e.target.value,
                        })
                      }
                      sx={{ gridColumn: "span 2" }}
                    />
                  )}
                </React.Fragment>
              ))}
            </Box>
          </form>
        </DialogContent>
        <DialogActions sx={{ p: "1.25rem" }}>
          <Button
            color="secondary"
            onClick={() => {
              onClose();
              resetValues();
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button color="secondary" onClick={handleSubmit} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

// Import necessary dependencies from MUI and other libraries

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
      enqueueSnackbar("Enquiry updated successfully!", { variant: "success" });

      setValues({});
      onClose();
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Failed to update Enquiry!", { variant: "error" });
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
    <ThemeProvider theme={theme}>
      <Dialog
        open={open}
        fullWidth={true}
        maxWidth={isSmallScreen ? "xs" : "md"}
      >
        <DialogTitle textAlign="center">EDIT LEADS</DialogTitle>
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
                      variant="filled"
                      type="date"
                      name={column.accessorKey}
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
                      sx={{ gridColumn: "span 2" }}
                    />
                  ) : column.accessorKey === "SubjectId" ? (
                    <FormControl sx={{ gridColumn: "span 2" }}>
                      <InputLabel>{column.header}</InputLabel>
                      <Select
                        fullWidth
                        variant="filled"
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
                  ) : column.accessorKey === "ClassId" ? (
                    <FormControl sx={{ gridColumn: "span 2" }}>
                      <InputLabel>{column.header}</InputLabel>
                      <Select
                        fullWidth
                        variant="filled"
                        value={selectedClass}
                        onChange={handleClassChange}
                      >
                        {classes.map((classes) => (
                          <MenuItem
                            key={classes.ClassId}
                            value={classes.ClassId}
                          >
                            {classes.ClassName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : column.accessorKey === "Source" ? (
                    <FormControl sx={{ gridColumn: "span 2" }}>
                      <InputLabel>{column.header}</InputLabel>
                      <Select
                        fullWidth
                        variant="filled"
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
                  ) : (
                    <TextField
                      fullWidth
                      variant="filled"
                      label={column.header}
                      name={column.accessorKey}
                      value={values[column.accessorKey]}
                      onChange={(e) =>
                        setValues({
                          ...values,
                          [e.target.name]: e.target.value,
                        })
                      }
                      sx={{ gridColumn: "span 2" }}
                    />
                  )}
                </React.Fragment>
              ))}
            </Box>
          </form>
        </DialogContent>
        <DialogActions sx={{ p: "1.25rem" }}>
          <Button
            color="secondary"
            onClick={() => {
              onClose();
              resetValues();
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button color="secondary" onClick={handleSubmit} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};