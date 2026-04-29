import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import DeckView from './pages/DeckView'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/decks/:slug" element={<DeckView />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
