import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Icons from "./pages/Icons";

import "./App.css";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import Error404 from "./pages/Error404";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/icons" element={<Icons />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/' element={<Signin />} />
        <Route path='*' element={<Error404 />} />
      </Routes>
    </div>
  );
}

export default App;
