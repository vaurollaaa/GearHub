import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import { GuestRoute, ProtectedRoute, RequireVerified } from './components/RouteGuards'
import ComingSoonPage from './pages/ComingSoonPage'
import DetailPage from './pages/DetailPage'
import HelpPage from './pages/HelpPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'
import SearchPage from './pages/SearchPage'
import VerificationPage from './pages/VerificationPage'

function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/daftar" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/beranda" element={<HomePage />} />
          <Route path="/pencarian" element={<SearchPage />} />
          <Route path="/profil" element={<ProfilePage />} />
          <Route path="/profil/edit" element={<ComingSoonPage title="Edit profil" />} />
          <Route path="/pengaturan" element={<ComingSoonPage title="Pengaturan" />} />
          <Route path="/bahasa" element={<ComingSoonPage title="Pilihan bahasa" />} />
          <Route path="/bantuan" element={<HelpPage />} />
          <Route element={<RequireVerified />}>
            <Route path="/gear-saya" element={<ComingSoonPage title="Gear saya" />} />
            <Route path="/tambah-gear" element={<ComingSoonPage title="Tambah gear" />} />
            <Route path="/aktivitas" element={<ComingSoonPage title="Aktivitas sewa" />} />
          </Route>
        </Route>
        <Route path="/gear/:id" element={<DetailPage />} />
        <Route path="/verifikasi" element={<VerificationPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/beranda" replace />} />
    </Routes>
  )
}

export default App