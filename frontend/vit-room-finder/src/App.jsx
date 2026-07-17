import { Routes, Route, useNavigate } from 'react-router-dom'

import Live from "./components/001live";

export default function App(){
  return(
    <Routes>
      <Route path="/" element={<Live/>} />
    </Routes>
  )
}