import * as actionTypes from "../../actions/actionTypes";
const initialState = {
  loading: false,
  data: [],
  error: "",
};
export default function (state = initialState, action: any) {
  switch (action.type) {
    case actionTypes.SET_USERS_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case actionTypes.SET_USERS_FILES_SUCCESS:
      return {
        ...state,
        data: action.payload,
      };
    case actionTypes.SET_USERS_FILES_FAILURE:
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
}
