import { useState } from 'react'
import { Flame, Heart, ThumbsUp } from 'lucide-react'

export function ActivityVoteButton({
  activityId,
  initialVotes = 2,
}: {
  activityId?: string
  initialVotes?: number
}) {
  const [votes, setVotes] = useState(initialVotes)
  const [userVoted, setUserVoted] = useState<string | null>(null)

  function handleReaction(type: string) {
    if (userVoted === type) {
      setUserVoted(null)
      setVotes((v) => Math.max(0, v - 1))
    } else {
      if (!userVoted) setVotes((v) => v + 1)
      setUserVoted(type)
    }
  }

  return (
    <div data-activity-id={activityId} className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5 shadow-2xs">
      <button
        type="button"
        title="Team Upvote"
        onClick={() => handleReaction('like')}
        className={`p-1 rounded-full transition-all ${
          userVoted === 'like' ? 'text-indigo-600 bg-indigo-100 scale-110' : 'text-slate-400 hover:text-slate-700'
        }`}
      >
        <ThumbsUp size={11} />
      </button>

      <button
        type="button"
        title="Must-Visit Favorite"
        onClick={() => handleReaction('heart')}
        className={`p-1 rounded-full transition-all ${
          userVoted === 'heart' ? 'text-pink-600 bg-pink-100 scale-110' : 'text-slate-400 hover:text-pink-600'
        }`}
      >
        <Heart size={11} />
      </button>

      <button
        type="button"
        title="Excited"
        onClick={() => handleReaction('fire')}
        className={`p-1 rounded-full transition-all ${
          userVoted === 'fire' ? 'text-amber-600 bg-amber-100 scale-110' : 'text-slate-400 hover:text-amber-600'
        }`}
      >
        <Flame size={11} />
      </button>

      <span className="text-[10px] font-bold text-slate-600 pl-0.5 pr-1">
        {votes}
      </span>
    </div>
  )
}
