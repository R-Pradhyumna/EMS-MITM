import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import GlobalStyles from "./styles/GlobalStyles";
import HomePage from "./pages/HomePage";
import Faculty from "./pages/Faculty";
import CoE from "./pages/CoE";
import BoE from "./pages/BoE";
import Principal from "./pages/Principal";
import Login from "./pages/Login";
import Users from "./pages/Users";
import PageNotFound from "./pages/PageNotFound";
import AppLayout from "./ui/AppLayout";

function App() {
  return (
    <>
      <GlobalStyles />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate replace to="homepage" />} />
            <Route path="homepage" element={<HomePage />} />
            <Route path="faculty" element={<Faculty />} />
            <Route path="coe" element={<CoE />} />
            <Route path="boe" element={<BoE />} />
            <Route path="principal" element={<Principal />} />
            <Route path="users" element={<Users />} />
          </Route>

          <Route path="login" element={<Login />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
