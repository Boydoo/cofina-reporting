import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout    from './components/Layout'
import Dashboard from './pages/Dashboard'
import Indicators from './pages/Indicators'
import Bailleurs  from './pages/Bailleurs'
import MasterFile from './pages/MasterFile'
import Reports    from './pages/Reports'
import Settings   from './pages/Settings'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index        element={<Dashboard  />} />
          <Route path="indicators" element={<Indicators />} />
          <Route path="bailleurs"  element={<Bailleurs  />} />
          <Route path="masterfile" element={<MasterFile />} />
          <Route path="reports"    element={<Reports    />} />
          <Route path="settings"   element={<Settings   />} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
