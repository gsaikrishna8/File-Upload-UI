import React from "react";
import "./App.css";
import Fileupload from "./Fileupload/Fileupload";
import { Provider } from "react-redux";
import store from "./store/store";
function App() {
  return (
    <div className="App">
      <Provider store={store}>
        <Fileupload />
      </Provider>
    </div>
  );
}

export default App;
