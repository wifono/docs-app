import { Routes, Route } from "react-router-dom"
import MainLayout from "../layout/MainLayout"

import Home from "../pages/Home"

export default function AppRoutes() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </MainLayout>
  )
}
