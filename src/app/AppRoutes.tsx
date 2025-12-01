import { Routes, Route } from "react-router-dom"
import MainLayout from "../layout/MainLayout"

import Home from "../pages/Home"
import Documents from "../pages/Documents"

export default function AppRoutes() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/documents" element={<Documents />} />
      </Routes>
    </MainLayout>
  )
}
