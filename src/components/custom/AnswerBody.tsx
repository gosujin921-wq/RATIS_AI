import { Fragment } from 'react'
import './AnswerBody.css'

/**
 * AI 답변 본문 렌더 (기획 §7 — 표현해야 하는 답변 형태).
 *
 * 기획이 요구하는 형태: 일반 텍스트 · 제목과 소제목 · 목록 · 표 · 인용.
 * 종전에는 `answer.split('\n\n')` 로 문단만 그려서, 모델이 목록이나 제목을 내려보내도
 * 화면에서는 전부 한 덩어리 문장으로 뭉개졌다.
 *
 * ★ 마크다운 라이브러리를 넣지 않았다. 계약(API-001)의 answer 는 **평문**이고,
 *   여기서 받는 것은 모델이 관습적으로 쓰는 몇 가지 표기뿐이다. 임의 HTML 을 그리지
 *   않으므로 새니타이저도 필요 없다 — 아는 표기만 조각으로 바꾸고 나머지는 글자로 둔다.
 *   (근거 표는 이것과 별개다. 그쪽은 서버가 만든 HTML 을 근거 카드가 그린다)
 *
 * 아는 표기
 *   ## 제목 · ### 소제목      제목 줄
 *   - 항목 · * 항목            글머리 목록
 *   1. 항목                    번호 목록
 *   > 인용                     인용 블록
 *   | a | b |                  표 (둘째 줄이 구분선이면 첫 줄을 머리로 본다)
 *   **굵게**                   강조
 */

type Block =
  | { kind: 'h'; level: 2 | 3; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }
  | { kind: 'quote'; text: string }
  | { kind: 'table'; head: string[]; rows: string[][] }

const isDivider = (line: string) => /^\|?[\s:|-]+\|?$/.test(line) && line.includes('-')
const cells = (line: string) =>
  line
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((c) => c.trim())

export function parseAnswer(text: string): Block[] {
  const lines = text.split('\n')
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const t = line.trim()

    if (t === '') {
      i += 1
      continue
    }

    const heading = /^(#{2,3})\s+(.*)$/.exec(t)
    if (heading) {
      blocks.push({ kind: 'h', level: heading[1].length === 2 ? 2 : 3, text: heading[2] })
      i += 1
      continue
    }

    if (t.startsWith('|') && i + 1 < lines.length && isDivider(lines[i + 1].trim())) {
      const head = cells(t)
      const rows: string[][] = []
      i += 2
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(cells(lines[i].trim()))
        i += 1
      }
      blocks.push({ kind: 'table', head, rows })
      continue
    }

    if (/^[-*]\s+/.test(t)) {
      const items: string[] = []
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ''))
        i += 1
      }
      blocks.push({ kind: 'ul', items })
      continue
    }

    if (/^\d+\.\s+/.test(t)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''))
        i += 1
      }
      blocks.push({ kind: 'ol', items })
      continue
    }

    if (t.startsWith('>')) {
      const parts: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        parts.push(lines[i].trim().replace(/^>\s?/, ''))
        i += 1
      }
      blocks.push({ kind: 'quote', text: parts.join(' ') })
      continue
    }

    // 그 밖은 문단 — 빈 줄이 나올 때까지 이어 붙인다
    const parts: string[] = []
    while (i < lines.length && lines[i].trim() !== '' && !/^(#{2,3}\s|[-*]\s|\d+\.\s|>|\|)/.test(lines[i].trim())) {
      parts.push(lines[i].trim())
      i += 1
    }
    blocks.push({ kind: 'p', text: parts.join(' ') })
  }

  return blocks
}

/** **굵게** 만 조각으로 바꾼다. 나머지는 글자 그대로 둔다 */
function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  )
}

export function AnswerBody({ text, className }: { text: string; className?: string }) {
  const blocks = parseAnswer(text)
  return (
    <div className={className ? `answer-body ${className}` : 'answer-body'}>
      {blocks.map((b, i) => {
        switch (b.kind) {
          case 'h':
            return b.level === 2 ? (
              <h3 key={i} className="answer-h2">
                {inline(b.text)}
              </h3>
            ) : (
              <h4 key={i} className="answer-h3">
                {inline(b.text)}
              </h4>
            )
          case 'ul':
            return (
              <ul key={i} className="answer-ul">
                {b.items.map((it, j) => (
                  <li key={j}>{inline(it)}</li>
                ))}
              </ul>
            )
          case 'ol':
            return (
              <ol key={i} className="answer-ol">
                {b.items.map((it, j) => (
                  <li key={j}>{inline(it)}</li>
                ))}
              </ol>
            )
          case 'quote':
            return (
              <blockquote key={i} className="answer-quote">
                {inline(b.text)}
              </blockquote>
            )
          case 'table':
            return (
              /* 표가 화면보다 넓으면 가로로 민다 (기획 §11) */
              <div key={i} className="answer-table">
                <table>
                  <thead>
                    <tr>
                      {b.head.map((h, j) => (
                        <th key={j} scope="col">
                          {inline(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((r, j) => (
                      <tr key={j}>
                        {r.map((c, k) => (
                          <td key={k}>{inline(c)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          default:
            return <p key={i}>{inline(b.text)}</p>
        }
      })}
    </div>
  )
}
