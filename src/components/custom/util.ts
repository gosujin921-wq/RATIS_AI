/** 클래스 결합용. 단순 필터·join (Tailwind 미사용 프로젝트라 tailwind-merge 불필요). */
export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
