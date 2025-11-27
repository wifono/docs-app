import { BrowserRouter } from 'react-router-dom'
// import './App.css'
// import "./index.css";
import AppRoutes from './app/AppRoutes'

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
