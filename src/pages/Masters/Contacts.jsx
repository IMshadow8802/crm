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
  filename: "Contacts",
});

const Contacts = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const columns = [
    {
      accessorKey: "Name",
      header: "Name",
    },
    {
      accessorKey: "Company",
      header: "Company",
    },
    {
      accessorKey: "Mobile",
      header: "Mobile",
    },
    {
      accessorKey: "Phone",
      header: "Phone",
    },
    {
      accessorKey: "Address",
      header: "Address",
    },
    {
      accessorKey: "Email",
      header: "Email",
    },
    {
      accessorKey: "Remarks",
      header: "Remarks",
    },
  ];

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
    pdf.save("Contacts.pdf");
  };

  const handleSaveCell = async (cell, value) => {
    try {
      // Extract the relevant data
      const { id, row, column } = cell;
      const originalData = { ...row.original };
      console.log(originalData);
      const accessorKey = column.id;

      // Update the original data with the new value
      originalData[accessorKey] = value;
      console.log(originalData);

      await axios.post(
        `${API_BASE_URL}/Contact/SaveContactDetails`,
        originalData
      );
      await fetchData();
      enqueueSnackbar("Contact updated successfully!", {
        variant: "success",
      });
    } catch (error) {
      console.log("Error updating Contact:", error);
      enqueueSnackbar("Failed to update Contact!", { variant: "error" });
    }
  };

  const [tableData, setTableData] = useState([]);
  const fetchData = useCallback(async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/Contact/FetchContactDetails`,
        { Id: 0 }
      );
      //console.log(response.data);
      setTableData(response.data);
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Failed to fetch Contacts", { variant: "error" });
    }
  }, [setTableData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteRow = useCallback(
    async (row) => {
      console.log(row);
      enqueueSnackbar(`Are you sure you want to delete this Contact?`, {
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
            ID: row.original.ID,
          });
          setTableData((prevState) =>
            prevState.filter((item) => item.ID !== row.ID)
          );
          await fetchData(setTableData);
          enqueueSnackbar("Contact deleted successfully!", {
            variant: "success",
          });
        } catch (error) {
          console.log("Error deleting Contact:", error);
          enqueueSnackbar("Failed to delete Contact!", { variant: "error" });
        }
      };
    },
    [fetchData, closeSnackbar]
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
  });

  //   return <MaterialReactTable table={table} />;
  const theme = useTheme();
  return (
    <ThemeProvider theme={theme}>
      <Box display="flex" flexDirection="column" flexGrow={1}>
        <Navbar title="CONTACTS" />
        <Helmet>
          <title> Contacts</title>
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

export default Contacts;

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

  const validateField = (name, value) => {
    if (!value) {
      return `${name} is required.`;
    }

    if (name === "Mobile") {
      const regex = /^\d{10}$/;
      return regex.test(value) ? "" : "Mobile No should be a 10-digit number.";
    }

    if (name === "Phone") {
      const numericRegex = /^[0-9]+$/;
      return numericRegex.test(value) ? "" : "Phone should contain only numeric characters.";
    }

    if (name === "Email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) ? "" : "Please enter a valid email address.";
    }

    return "";
  };

  const [errors, setErrors] = useState({});
  //console.log(errors);

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
    const requiredFields = [
      "Name",
      "Company",
      "Mobile",
      "Address",
      "Email",
      "Remarks",
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
        ID: 0,
        BranchId: branchid,
        CompId: compid,
        CreateUid: 2,
        EditUid: 2,
        EditDate: formattedDate,
        CreateDate: formattedDate,
      };

      //console.log(updatedValues);

      await axios.post(
        `${API_BASE_URL}/Contact/SaveContactDetails`,
        updatedValues
      );

      await fetchData(setTableData);
      enqueueSnackbar("Contact created successfully!", { variant: "success" });
      resetValues();

      onClose();
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Failed to create Contact!", { variant: "error" });
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
        <DialogTitle>CREATE CONTACT</DialogTitle>
      </div>

      <DialogContent>
        <form onSubmit={(e) => e.preventDefault()}>
          <Box
            display="grid"
            gap="20px"
            gridTemplateColumns="repeat(4, minmax(0, 1fr))"
            sx={{
              "& >div": { gridColumn: isNonMobile ? undefined : "span 4" },
            }}
          >
            {columns.map((column, index) => (
              <React.Fragment key={index}>
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
                  sx={{ gridColumn: "span 2" }}
                />
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
