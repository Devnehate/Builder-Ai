import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthLayout, GuestLayout } from './pages/Layout'
import Authpage from './pages/Authpage'
import Homepage from './pages/Homepage'
import Builderpage from './pages/Builderpage'
import Previewpage from './pages/Previewpage'
import { Toaster } from 'react-hot-toast'

const App = () => {
  return (
    <>
      <Toaster />
    <Routes>
      <Route element={<GuestLayout />}>
        <Route path='/login' element={<Authpage mode="login" />} />
        <Route path='/register' element={<Authpage mode="register" />} />
      </Route>
      <Route element={<AuthLayout />}>
        <Route path='/' element={<Homepage />} />
        <Route path='/builder/:id' element={<Builderpage />} />
        <Route path='/preview/:id' element={<Previewpage />} />
      </Route>
        <Route path='*' element={<Navigate to="/" replace />} />
      </Routes>
      </>
  )
}

export default App