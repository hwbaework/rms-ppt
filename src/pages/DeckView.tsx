import { Link, Navigate, useParams } from 'react-router-dom'
import DeckPlayer from '../components/Deck'
import { getDeckBySlug } from '../data/deckList'

function DeckView() {
  const { slug } = useParams<{ slug: string }>()
  if (!slug) return <Navigate to="/" replace />

  const deck = getDeckBySlug(slug)
  if (!deck) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-900">
        <div className="text-center">
          <p className="text-2xl mb-4">발표를 찾을 수 없습니다.</p>
          <Link to="/" className="text-brand hover:underline">
            돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return <DeckPlayer deck={deck} />
}

export default DeckView
