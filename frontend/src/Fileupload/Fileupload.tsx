import * as React from "react";
import {
  Grid,
  Button,
  Checkbox,
  Card,
  Box,
  Typography,
  Modal,
} from "@mui/material";
import {
  CloudArrowUp48Regular,
  DocumentPdf24Regular,
  Delete24Regular,
} from "@fluentui/react-icons";
import { Delete20Regular } from "@fluentui/react-icons";
import { Spinner, SpinnerSize } from "@fluentui/react/lib/Spinner";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarQuickFilter,
  useGridApiContext,
} from "@mui/x-data-grid";
import { MessageBar, MessageBarType } from "@fluentui/react";
import * as actions from "../store/actions";
import { connect } from "react-redux";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import "./Fileupload.css";
import { setWarningCallback } from "@fluentui/react";
import { Download, FileUpload } from "@mui/icons-material";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};
interface fileUploadProps {
  uploadData: (data: any) => void;
  fetchData: () => void;
  deleteData: (id: any) => void;
  fetchedData: any;
}
const Fileupload: React.FunctionComponent<fileUploadProps> = ({
  uploadData,
  fetchData,
  deleteData,
  fetchedData,
}) => {
  const [files, setFiles] = React.useState<Array<File>>([]);
  const [Fileuploaded, setFileUploaded] = React.useState<boolean>(false);
  const [open, setOpen] = React.useState<boolean>(false);
  const [showLoader, setShowLoader] = React.useState<boolean>(false);
  const [rows, setRows] = React.useState<Array<any>>([]);
  const [selectedFilesId, setSelectedFilesId] = React.useState<Array<any>>([]);
  const [message, setMessage] = React.useState<string>("");
  const [error, setError] = React.useState<boolean>(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [newFilesCount, setNewFilesCount] = React.useState<number>(0);
  const [duplicateFile, setDuplicateFile] = React.useState<Array<string>>([]);
  const [warning, setWarning] = React.useState<boolean>(false);
  const [fileUrl, setFileUrl] = React.useState<string | null>(null);
  const [fileProgress, setFilesProgress] = React.useState<any>({});
  const [successfullyUploaded, setSuccessfullyUploaded] = React.useState<
    Array<string>
  >([]);
  const [successfullyDeleted, setSuccessfullyDeleted] = React.useState<
    Array<string>
  >([]);
  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  const handleDeleteModalOpen = () => {
    console.log("delete");
    rows.forEach((row) => {
      if (selectedFilesId.findIndex((val) => val === row._id) > -1) {
        setSuccessfullyDeleted((prevFiles) => [
          ...prevFiles,
          row.file.fileName,
        ]);
      }
    });
    setDeleteModalOpen(true);
  };

  const handleDeleteModalClose = () => setDeleteModalOpen(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  React.useEffect(() => {
    fetchData();
  }, []);
  React.useEffect(() => {
    const flattenedData = fetchedData.map((item: any) => {
      return {
        ...item,
        fileName: item.file.fileName,
        fileType: item.file.fileType,
        filePath: item.file.filePath,
      };
    });
    setRows(flattenedData);
    // console.log("fetchedData", fetchedData);
  }, [fetchedData]);
  console.log("rows", rows);

  const handleExportSelectedRow = () => {
    if (selectedFilesId.length === 0) {
      alert("No rows selected for export.");
      return;
    }

    const selectedRows = rows.filter((row) =>
      selectedFilesId.includes(row._id)
    );

    // Extract headers from the first row
    const headers = [
      "_id",
      "fileName",
      "fileType",
      "filePath",
      "createdAt",
      "updatedAt",
    ];
    // Create CSV content
    const csvContent = [
      headers.join(","), // Headers row
      ...selectedRows.map((row) => {
        const { _id, file, createdAt, updatedAt } = row;
        const { fileName, fileType, filePath } = file || {};
        return [_id, fileName, fileType, filePath, createdAt, updatedAt].join(
          ","
        );
      }),
    ].join("\n");

    console.log("csvContent", csvContent);
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exported_rows.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  const handleDuplicateFiles = (file: any) => {
    setDuplicateFile((prevFiles: any) => {
      if (!prevFiles.includes(file.name)) {
        return [...prevFiles, file.name];
      }
      return prevFiles;
    });
    setWarning(true);
  };
  console.log("duplicatefile", files);

  const handleChange = (files: any) => {
    setFileUploaded(true);
    const uniqueFiles: File[] = [];
    const duplicatedFiles: File[] = [];
    const fileArray = Array.from(files);
    fileArray.forEach((file: any) => {
      if (rows.some((row) => row.file.fileName === file.name)) {
        duplicatedFiles.push(file);
      } else {
        uniqueFiles.push(file);
      }
    });

    setFiles((prevFiles) => [...prevFiles, ...uniqueFiles]);
    setSuccessfullyUploaded((prevFiles) => [
      ...prevFiles,
      ...uniqueFiles.map((d: any) => d.name),
    ]);
    if (duplicatedFiles.length > 0) {
      duplicatedFiles.forEach((d: any) => handleDuplicateFiles(d));
    }

    if (uniqueFiles.length === 0) {
      setFileUploaded(false);
    } else {
      setFileUploaded(true);
    }
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    console.log("UNiqueeee", uniqueFiles.length > 0);
  };
  console.log("fileuploaded", Fileuploaded);
  const handleClear = () => {
    setFileUploaded(false);
    setFiles([]);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };
  const handleUpload = async () => {
    setShowLoader(true);
    setOpen(true);
    try {
      if (files && files.length > 0) {
        const fileData = Array.from(files);
        setSuccessfullyUploaded(fileData.map((d) => d.name));
        for (const file of fileData) {
          await uploadData(file);
        }
        setMessage(
          ` ${successfullyUploaded.length}files ${
            successfullyUploaded.length > 1 ? "s" : ""
          } uploaded successfully ${successfullyUploaded.join(", ")}`
        );

        await fetchData();
      }
    } catch (error) {
      console.log(error);
      setError(true);
    } finally {
      setShowLoader(false);
      setOpen(false);
      setFileUploaded(false);
      setFiles([]);
      setSuccessfullyUploaded([]);
    }
  };

  console.log("duplicateeed", duplicateFile);
  const handleFileClick = async (fileId: any) => {
    console.log("fileIDD", fileId);
    try {
      const response = await fetch(
        `http://localhost:4000/api/routes/file/${fileId}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const fileBlob = await response.blob();
      const fileUrl = URL.createObjectURL(fileBlob);
      setFileUrl(fileUrl);
      window.open(fileUrl, "_blank");
    } catch (error) {
      console.error("Fetch File Error:", error);
      // Handle error (e.g., display error message)
    }
  };
  const columns: GridColDef[] = [
    {
      field: "fileName",
      headerName: "Name",
      width: 450,
      renderCell: (params) => {
        return <div>{params.row.file.fileName}</div>;
      },

      headerAlign: "left",
    },
    {
      field: "fileType",
      headerName: "Type",
      width: 450,
      renderCell: (params) => <div>{params.row.file.fileType}</div>,
      headerAlign: "left",
    },
    {
      field: "filePath",
      headerName: "File Path",
      width: 600,
      renderCell: (params: any) => {
        const filePath = params.row.filePath;
        // const encodedFilePath = encodeURI(params.row.filePath);
        const fileId = params.row._id;
        // console.log("filepath", filePath);
        return (
          <div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleFileClick(fileId);
              }}
            >
              {params.row.file.filePath}
            </a>
          </div>
        );
      },
      headerAlign: "left",
    },
  ];
  const handleFileDelete = (file: any, index: any) => {
    const fileToDelete = files[index];
    if (fileToDelete) {
      setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
      setSuccessfullyUploaded((prevFiles) =>
        prevFiles.filter((d, i) => d !== file)
      );
    }
    console.log("deltedfile", files);
    if (files.length === 1) {
      setFileUploaded(false);
    }
  };
  const handleMultipleFilesDelete = async () => {
    handleDeleteModalClose();
    handleModalClose();
    setShowLoader(true);
    setOpen(true);
    try {
      let tempFileNames: Array<any> = [];

      rows.forEach((row) => {
        if (selectedFilesId.findIndex((val) => row._id === val) > -1) {
          tempFileNames.push(row._id);
        }
      });
      setMessage(
        `${successfullyDeleted.length}files ${
          successfullyDeleted.length > 1 ? "s" : ""
        } Deleted Successfully ${successfullyDeleted.join(", ")}`
      );
      await deleteData(tempFileNames);
      console.log("successfullydeleted", successfullyDeleted);

      await fetchData();
    } catch (error) {
      setError(true);
      console.log(error);
    } finally {
      setShowLoader(false);
      setOpen(false);
      setSuccessfullyDeleted([]);
    }
  };
  const CustomToolbar = () => {
    const apiRef = useGridApiContext();
    return (
      <GridToolbarContainer style={{ justifyContent: "space-between" }}>
        <div>
          <GridToolbarExport />
          <>
            <Button
              variant="text"
              startIcon={<Delete20Regular />}
              style={{ marginLeft: "16px" }}
              onClick={handleModalOpen}
            >
              Delete all
            </Button>
            <Button
              variant="text"
              startIcon={<Delete20Regular />}
              style={{ marginLeft: "16px" }}
              onClick={handleDeleteModalOpen}
              disabled={selectedFilesId.length === 0}
            >
              Delete
            </Button>
            <Button
              variant="text"
              startIcon={<Download />}
              style={{ marginLeft: "16px" }}
              onClick={handleExportSelectedRow}
              disabled={selectedFilesId.length === 0}
            >
              Export Selected
            </Button>
          </>
        </div>
        <GridToolbarQuickFilter debounceMs={500} />
      </GridToolbarContainer>
    );
  };

  const renderFilesName = () => {
    let tempRows: Array<any> = [];
    let tempAllRows: Array<any> = [];
    rows?.forEach((row: any) => {
      if (selectedFilesId.findIndex((val) => row._id === val) > -1)
        tempRows.push(row);
      tempAllRows.push(row);
    });

    console.log("tempallrows", tempAllRows);
    console.log("temprows", tempRows);
    return (
      <div>
        {deleteModalOpen ? (
          <Box>
            {tempRows?.map((row, index) => (
              <Typography key={row.file.fileName + index}>
                {index + 1}.{row.file.fileName}
              </Typography>
            ))}
          </Box>
        ) : (
          <Box>
            {tempAllRows?.map((row, index) => (
              <Typography key={row.file.fileName + index}>
                {index + 1}.{row.file.fileName}
              </Typography>
            ))}
          </Box>
        )}
      </div>
    );
  };
  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const handleDeleteAllFiles = async () => {
    handleDeleteModalClose();
    handleModalClose();
    setShowLoader(true);
    setOpen(true);
    try {
      let tempFiles: Array<any> = [];
      rows.forEach((row) => {
        tempFiles.push(row._id);
      });
      await deleteData(tempFiles);
      setMessage("Successfully Deleted All Files");
      await fetchData();
    } catch (error) {
      setError(true);
    } finally {
      setShowLoader(false);
      setOpen(false);
      setSuccessfullyDeleted([]);
    }
  };
  const handleMessageClose = () => {
    setWarning(false);
    setDuplicateFile([]);
  };
  return (
    <div>
      <div className="uploadCard">
        <div className="header">
          <div className="title">Upload Documents to the Knowledge Base</div>
        </div>
        <Grid
          container
          spacing={2}
          margin={0}
          style={{ width: "100%" }}
          alignItems="center"
          justifyContent="center"
        >
          <Grid item md={6} sm={12}>
            <div
              className="cardContainer"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={(e: React.DragEvent<HTMLDivElement>) => {
                handleDrag(e);
                handleChange(e.dataTransfer.files);
              }}
            >
              <label
                htmlFor="upload-multiple-file"
                className="uploadInputLabel"
                style={{
                  borderColor: files && files.length ? "#0288d1" : "#a89d9d",
                }}
              >
                <div
                  style={{
                    color: files && files.length ? "#0288d1" : "#a89d9d",
                  }}
                >
                  <CloudArrowUp48Regular />
                </div>

                <Button variant="contained">
                  <label
                    htmlFor="upload-multiple-file"
                    style={{ cursor: "pointer" }}
                  >
                    browse file
                  </label>
                </Button>
                <p style={{ fontSize: "small", color: "#aaa" }}>
                  Drag and Drop File Here
                </p>
                <div
                  className="subheading"
                  style={{ fontSize: "16px", color: "black" }}
                >
                  Limit 200MB per file .pdf, .jpeg, .jpg, .png
                </div>
                <input
                  type="file"
                  id="upload-multiple-file"
                  multiple
                  accept=".pdf,.jpeg,.jpg,.png"
                  className="browseFileInput"
                  onChange={(e: any) => handleChange(e.target.files)}
                  ref={inputRef}
                />
              </label>
            </div>
            <div>
              <Button
                variant="contained"
                style={{ marginRight: "10px" }}
                disabled={!Fileuploaded}
                onClick={handleUpload}
              >
                {" "}
                upload
              </Button>
              <Button
                variant="contained"
                color="warning"
                disabled={!Fileuploaded}
                onClick={handleClear}
              >
                {" "}
                clear
              </Button>
            </div>
          </Grid>
          {files && files.length > 0 && (
            <Grid item md={6} sm={12}>
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: "500",
                  textAlign: "left",
                  margin: 0,
                }}
              >
                Uploaded Files:
              </p>
              <div className="filesNameWrapper">
                {files?.map((item, index) => (
                  <div key={item.name + index}>
                    <div>
                      <DocumentPdf24Regular
                        style={{ marginRight: "10px", color: "blue" }}
                      />
                      <div style={{ width: "90%" }}>
                        <p className="fileName">{item.name}</p>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          style={{ textAlign: "left" }}
                        >{`File uploaded`}</Typography>
                      </div>
                    </div>
                    <Delete24Regular
                      style={{ cursor: "pointer", color: "red" }}
                      onClick={() => handleFileDelete(item.name, index)}
                    />
                  </div>
                ))}
              </div>
            </Grid>
          )}
        </Grid>
      </div>
      <Card
        style={{
          position: "relative",
          textAlign: "center",
        }}
      >
        {rows && rows.length > 0 ? (
          <DataGrid
            rows={rows}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 5,
                },
              },
            }}
            rowSelection
            onRowSelectionModelChange={(rowSelectionModel) =>
              setSelectedFilesId(rowSelectionModel)
            }
            pageSizeOptions={[5]}
            sx={{ padding: "16px" }}
            disableColumnFilter
            disableColumnSelector
            disableDensitySelector
            slots={{ toolbar: CustomToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            checkboxSelection
            disableRowSelectionOnClick
            getRowId={(row) => row._id}
          />
        ) : (
          <>
            <p style={{ textAlign: "center", fontSize: "20px", color: "#999" }}>
              No Data Available!!
            </p>
          </>
        )}
      </Card>
      <Snackbar
        open={open}
        autoHideDuration={1000000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleClose}
          variant="filled"
          severity={error ? "error" : "success"}
        >
          {message}
        </Alert>
      </Snackbar>
      {showLoader && (
        <div className="loaderWrapper">
          <Spinner
            label={files && files.length ? "Uploading..." : "Wait a moment..."}
            ariaLive="assertive"
            labelPosition="top"
            size={SpinnerSize.large}
            styles={{
              label: { fontSize: "24px" },
              circle: { width: "50px", height: "50px" },
            }}
          />
        </div>
      )}
      {warning && (
        <MessageBar
          onDismiss={() => setWarning(false)}
          dismissButtonAriaLabel="Close"
          messageBarType={MessageBarType.warning}
          styles={{
            root: {
              width: "fit-content",
              minWidth: "400px",
              maxWidth: "600px",
              position: "fixed",
              top: "5px",
              left: "calc(50% - 200px)",
              zIndex: 2000,
            },
            innerText: {
              overflow: "inherit",
            },
            text: {
              fontSize: "16px",
            },
          }}
        >
          <b>{`Duplicate file name detected: ${duplicateFile.join(", ")}`}</b>
        </MessageBar>
      )}
      <Modal open={modalOpen} onClose={handleModalClose}>
        <Box sx={style}>
          <Typography component="p" style={{ marginBottom: "10px" }}>
            Are you sure? You want to delete {rows.length} files.
          </Typography>
          {renderFilesName()}

          <Button
            variant="contained"
            onClick={handleDeleteAllFiles}
            style={{ marginRight: "20px" }}
          >
            Confirm
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleModalClose}
          >
            Cancel
          </Button>
        </Box>
      </Modal>
      <Modal open={deleteModalOpen} onClose={handleDeleteModalClose}>
        <Box sx={style}>
          <Typography component="p" style={{ marginBottom: "10px" }}>
            Are you sure? You want to delete {selectedFilesId.length} files.
          </Typography>
          {renderFilesName()}
          <Button
            variant="contained"
            onClick={handleMultipleFilesDelete}
            style={{ marginRight: "20px" }}
          >
            Confirm
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleDeleteModalClose}
          >
            Cancel
          </Button>
        </Box>
      </Modal>
    </div>
  );
};
const mapStateToProps = (state: any) => {
  return {
    fetchedData: state.fileReducer.data,
  };
};
const mapDispatchToProps = (dispatch: any) => {
  return {
    fetchData: () => dispatch(actions.fetchData()),
    uploadData: (data: any) => dispatch(actions.uploadData(data)),
    deleteData: (id: any) => dispatch(actions.deleteData(id)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Fileupload);
