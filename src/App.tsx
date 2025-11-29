import AppRoutes from './app/AppRoutes'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from "./context/AuthProvider";

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" />
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
