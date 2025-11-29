import AppRoutes from './app/AppRoutes'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <AppRoutes />
    </>
  )
}

export default App
