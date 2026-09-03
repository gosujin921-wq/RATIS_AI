import type { ChatProblem } from '../../api/types'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import './ProblemBanner.css'

/**
 * 오류·제한 안내 띠 (기획 §10.3) — 입력창 바로 위에 얹힌다.
 *
 * ★ **화면을 갈아 끼우지 않는다.** 기획이 「오류가 발생해도 사용자가 입력한 질문과 이미
 *   표시된 대화가 유지되는 방식」을 못박았다. 그래서 상태마다 다른 화면을 세우지 않고
 *   대화 위에 띠 하나를 얹는다.
 * ★ 문구는 **지금 뭘 할 수 있는지**를 함께 적는다. 「오류가 발생했습니다」만 있으면
 *   기다려야 하는지 다시 눌러야 하는지 알 수 없다.
 */
const TEXT: Record<
  ChatProblem['kind'],
  { tone: 'danger' | 'warning' | 'info'; title: string; desc: string; retry?: string }
> = {
  SERVER: {
    tone: 'danger',
    title: '일시적인 오류가 발생했습니다',
    desc: '잠시 후 다시 시도해 주세요. 입력하신 질문과 대화는 그대로 있습니다.',
    retry: '다시 시도',
  },
  OFFLINE: {
    tone: 'warning',
    title: '네트워크에 연결되어 있지 않습니다',
    desc: '연결을 확인한 뒤 다시 시도해 주세요.',
    retry: '다시 시도',
  },
  TIMEOUT: {
    tone: 'warning',
    title: '응답이 너무 오래 걸립니다',
    desc: '지금 접속이 몰렸을 수 있습니다. 잠시 후 다시 질문해 주세요.',
    retry: '다시 시도',
  },
  AUTH: {
    tone: 'info',
    title: '로그인이 만료되었습니다',
    desc: '다시 로그인하면 이 대화에서 이어서 질문할 수 있습니다.',
    retry: '다시 로그인',
  },
  FORBIDDEN: {
    tone: 'danger',
    title: '이 대화에 접근할 권한이 없습니다',
    desc: '본인이 만든 대화만 열 수 있습니다.',
  },
  RATE_LIMIT: {
    tone: 'warning',
    title: '요청이 너무 많습니다',
    desc: '잠시 후 다시 질문해 주세요.',
  },
  MAINTENANCE: {
    tone: 'info',
    title: '서비스 점검 중입니다',
    desc: '점검이 끝나면 정상적으로 이용할 수 있습니다.',
  },
}

export function ProblemBanner({ problem }: { problem: ChatProblem }) {
  const t = TEXT[problem.kind]
  return (
    <Alert tone={t.tone} title={t.title}>
      {t.desc}
      {problem.onRetry && t.retry && (
        <div className="chat-problem-step">
          <Button variant="secondary" size="small" onClick={problem.onRetry}>
            {t.retry}
          </Button>
        </div>
      )}
    </Alert>
  )
}
