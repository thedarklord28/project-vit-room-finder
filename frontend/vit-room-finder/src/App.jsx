import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'

import Live from "./components/001live";

export default function App() {
  return (
    <BrowserRouter basename='/project-vit-room-finder'>
      <Routes>
        <Route path="/" element={<Live />} />
      </Routes>
    </BrowserRouter>

  )
}