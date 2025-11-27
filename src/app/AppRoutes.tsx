import { Routes, Route } from "react-router-dom"
import MainLayout from "../layout/MainLayout"

import Home from "../pages/Home"
// import Editor from "../pages/Editor/Editor"

export default function AppRoutes() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/editor" element={<Editor />} /> */}
      </Routes>
    </MainLayout>
  )
}
