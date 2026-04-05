import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import SalesTablePage from '@/pages/SalesTablePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SalesTablePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
