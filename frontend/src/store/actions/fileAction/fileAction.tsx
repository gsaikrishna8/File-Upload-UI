import * as actionTypes from "../actionTypes";

// Action Creators
export const fetchUsersFiles = () => ({
  type: actionTypes.SET_USERS_REQUEST,
});

export const fetchUsersFilesSuccess = (data: any) => {
  return {
    type: actionTypes.SET_USERS_FILES_SUCCESS,
    payload: data,
  };
};

export const fetchUsersFilesFailure = (error: any) => ({
  type: actionTypes.SET_USERS_FILES_FAILURE,
  payload: error,
});

// Async Actions
export const fetchData = () => {
  return async (dispatch: any) => {
    dispatch(fetchUsersFiles());
    try {
      const response = await fetch(
        "http://localhost:4000/api/routes/getuploadlist",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const responseData = await response.json();
      dispatch(fetchUsersFilesSuccess(responseData.users));
    } catch (error: any) {
      console.error("Fetch Data Error:", error);
      dispatch(fetchUsersFilesFailure(error.message));
    }
  };
};

export const uploadData = (file: File) => {
  console.log("fileformdata", file);
  return async (dispatch: any) => {
    dispatch(fetchUsersFiles());
    try {
      const formData = new FormData();
      formData.append("files", file);

      const response = await fetch("http://localhost:4000/api/routes/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      console.log("response", response);
      const responseData = await response.json();
      console.log("responseData", responseData);
      dispatch(fetchUsersFilesSuccess(responseData));
    } catch (error: any) {
      console.error("Upload Data Error:", error);
      dispatch(fetchUsersFilesFailure(error.message));
    }
  };
};

export const deleteData = (fileId: any) => {
  console.log("fileId", fileId);
  return async (dispatch: any) => {
    dispatch(fetchUsersFiles());
    try {
      // const fileId = file.
      const response = await fetch(
        "http://localhost:4000/api/routes/deletefile",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            _id: fileId,
          }),
        }
      );
      console.log("response", response);

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(
          `Error: ${response.statusText} - ${errorResponse.message}`
        );
      }

      const responseData = await response.json();
      console.log("responseData", responseData);
      dispatch(fetchUsersFilesSuccess(responseData));
    } catch (error: any) {
      console.error("Delete Data Error:", error);
      dispatch(fetchUsersFilesFailure(error.message));
    }
  };
};
