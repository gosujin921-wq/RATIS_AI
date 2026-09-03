/**
 * 날짜 한 벌 — 이 서비스의 날짜는 **`YYYY.MM.DD` 글자열**로 오간다.
 *
 * Date 객체로 들고 다니지 않는 까닭: 화면이 다루는 것은 「사람이 고른 날」이지 시각이 아니다.
 * Date 는 시각과 시간대를 함께 지고 다녀서, 자정 근처에서 하루가 밀리거나 서버가 다른
 * 시간대로 읽는 사고가 난다. 달력 안에서만 Date 로 셈하고, 밖으로 나갈 때는 글자열로 돌린다.
 *
 * 이 파일은 달력·날짜 입력·기간 필터 셋이 함께 읽는다. 형식을 한 곳에서만 정하기 위한 것이라
 * 화면이 자기 형식을 따로 만들지 않는다.
 */

/** 화면에 서는 형식. 자릿수가 고정이라 표에서 세로로 훑어 읽힌다 */
export const DATE_FORMAT = 'YYYY.MM.DD'

const pad = (n: number) => String(n).padStart(2, '0')

/** Date → `YYYY.MM.DD`. 시간대에 걸리지 않게 현지 기준 연·월·일만 읽는다 */
export function toDateString(d: Date) {
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
}

/**
 * `YYYY.MM.DD` → Date. 형식이 아니거나 없는 날(2월 30일)이면 null 이다.
 * 있는 날인지는 되돌려 만든 글자열이 원래와 같은지로 판별한다 — Date 는 2월 30일을
 * 3월 2일로 조용히 넘겨 버려서, 자릿수만 봐서는 걸러지지 않는다.
 */
export function fromDateString(s: string): Date | null {
  const m = /^(\d{4})\.(\d{2})\.(\d{2})$/.exec(s.trim())
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return toDateString(d) === s.trim() ? d : null
}

/**
 * 치는 대로 점을 끼워 넣는다 — 숫자만 눌러도 `2026.09.03` 이 된다.
 *
 * ★ 여덟 자리를 다 치기 전에도 친 만큼만 점을 단다. 다 쳐야 형식이 잡히면 치는 동안
 *   화면이 「형식이 틀린 값」을 보여 주는 셈이라, 무엇이 잘못됐는지 오해하게 만든다.
 */
export function formatDateDigits(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 8)
  return [digits.slice(0, 4), digits.slice(4, 6), digits.slice(6, 8)].filter(Boolean).join('.')
}

/**
 * 점을 끼워 넣은 뒤 커서를 어디에 둘지.
 *
 * ★ 무조건 맨 끝으로 보내면 안 된다 — 가운데를 눌러 한 글자 고치려 할 때마다 커서가 끝으로
 *   튀어 값이 계속 어긋난다. 커서 앞에 **숫자가 몇 개 있었는지**를 세어 두고, 점을 새로
 *   끼운 뒤에도 같은 숫자 개수 뒤에 커서를 놓는다. 점은 세지 않으므로 점이 하나 늘어도
 *   커서는 사람이 보던 글자 뒤에 그대로 남는다.
 */
export function caretAfterFormat(formatted: string, digitsBeforeCaret: number) {
  if (digitsBeforeCaret === 0) return 0
  let seen = 0
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i])) seen++
    if (seen === digitsBeforeCaret) return i + 1
  }
  return formatted.length
}

/** 같은 날인가 — 시각을 빼고 연·월·일만 견준다 */
export function isSameDay(a: Date, b: Date) {
  return toDateString(a) === toDateString(b)
}

/** 그 달의 1일 */
export function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

/** 달을 옮긴다. 31일에서 2월로 넘어가도 그 달 안에 머문다 (1일 기준으로 셈한다) */
export function addMonths(d: Date, step: number) {
  return new Date(d.getFullYear(), d.getMonth() + step, 1)
}

/** 화면에 적는 달 이름 */
export function monthLabel(d: Date) {
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월`
}

/** 요일 머리. 일요일부터 — 달력은 일요일 시작이 기본이다 */
export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const

/**
 * 한 달 표에 깔 날들. **여섯 줄 42칸으로 고정한다.**
 * 달마다 줄 수가 달라지면(4~6줄) 달을 넘길 때 표 높이가 들썩여 아래 버튼이 따라 움직인다.
 * 앞뒤 달의 날은 그대로 두되 흐리게 그린다 — 빈칸으로 두면 그 주가 끊겨 보인다.
 */
export function monthGrid(month: Date) {
  const first = startOfMonth(month)
  const start = new Date(first)
  start.setDate(1 - first.getDay())
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return { date: d, outside: d.getMonth() !== month.getMonth() }
  })
}
