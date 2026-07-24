import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'

import Live from "./components/001live";
import LiveNew from "./components/001live_new"

export default function App() {
  return (
    <BrowserRouter basename='/project-vit-room-finder'>
      <Routes>
        <Route path="/" element={<LiveNew />} />
      </Routes>
    </BrowserRouter>

  )
}