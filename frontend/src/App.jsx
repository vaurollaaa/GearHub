import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import { GuestRoute, ProtectedRoute, RequireVerified } from './components/RouteGuards'
import AddGearPage from './pages/AddGearPage'
import ComingSoonPage from './pages/ComingSoonPage'
import DetailPage from './pages/DetailPage'
import HelpPage from './pages/HelpPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import MyGearsPage from './pages/MyGearsPage'
import PaymentPage from './pages/PaymentPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'
import RentRequestPage from './pages/RentRequestPage'
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
            <Route path="/gear-saya" element={<MyGearsPage />} />
            <Route path="/aktivitas" element={<ComingSoonPage title="Aktivitas sewa" />} />
          </Route>
        </Route>

        <Route element={<RequireVerified />}>
          <Route path="/tambah-gear" element={<AddGearPage />} />
          <Route path="/gear/:id/sewa" element={<RentRequestPage />} />
          <Route path="/gear/:id/bayar" element={<PaymentPage />} />
        </Route>
        <Route path="/gear/:id" element={<DetailPage />} />
        <Route path="/verifikasi" element={<VerificationPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/beranda" replace />} />
    </Routes>
  )
}

export default App