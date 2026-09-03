import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { IconButton } from './IconButton'

/**
 * 복사 — 답변과 질문이 같이 쓴다 (`label` 로 어느 쪽인지 가른다).
 *
 * 글자 없이 글리프 하나로 서므로 **이름은 aria-label 이 진다.** 복사 직후엔 글리프뿐
 * 아니라 이름도 같이 바뀌어야 한다 — 체크로 바뀐 것만으로는 눈으로 보는 사람에게만
 * 결과가 전해진다. `title` 은 마우스 쪽 몫이다(라벨이 없으니 무엇인지 물을 데가 필요하다).
 */
export function CopyButton({ text, label = '답변 복사' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false)
  const name = done ? '복사됨' : label
  return (
    <IconButton
      size="sm"
      className="chat-action"
      aria-label={name}
      title={name}
      onClick={() => {
        void navigator.clipboard?.writeText(text)
        setDone(true)
        setTimeout(() => setDone(false), 1600)
      }}
    >
      {done ? <Check aria-hidden /> : <Copy aria-hidden />}
    </IconButton>
  )
}
