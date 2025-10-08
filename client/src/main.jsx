import { AnimatePresence, motion } from 'framer-motion'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import './index.css'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import RepoPage from './pages/RepoPage'

function PageWrapper({ children }){
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.32 }}>
      {children}
    </motion.div>
  )
}

function AppRoutes(){
  const { token } = useAuth()
  return (
    <BrowserRouter>
      <Toaster />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/login" element={<PageWrapper><Login/></PageWrapper>} />
          <Route path="/register" element={<PageWrapper><Register/></PageWrapper>} />
          <Route path="/" element={<PageWrapper>{token ? <Dashboard/> : <Navigate to="/login" />}</PageWrapper>} />
          <Route path="/repo/:id" element={<PageWrapper>{token ? <RepoPage/> : <Navigate to="/login" />}</PageWrapper>} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  )
}

function App(){
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

createRoot(document.getElementById('root')).render(<App />)
