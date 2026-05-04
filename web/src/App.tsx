import { EducationProvider } from './store/education/EducationProvider.tsx'
import Login from './app/Login.tsx'
import EducationList from './app/EducationList.tsx'

function AppContent() {
  sessionStorage.setItem('apiURL', import.meta.env.VITE_API_URL);

  return (
    <div className='flex flex-col bg-neutral-200 w-full h-full text-neutral-800'>
      <Login />
      <EducationList />
    </div>
  )
}

function App() {
  return (
    <EducationProvider>
      <AppContent />
    </EducationProvider>
  )
}

export default App
