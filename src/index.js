import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { SnackbarProvider } from "notistack";
import { ThemeProvider } from "@mui/system";
import theme from "./theme";
import {BrowserRouter,Router,route} from "react-router-dom"

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
    <ThemeProvider theme={theme}>
      <SnackbarProvider
            maxSnack={1}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            preventDuplicate
          >
            <App />
          </SnackbarProvider>
          </ThemeProvider>
      </BrowserRouter>
  </React.StrictMode>,
   document.getElementById('root')
);
