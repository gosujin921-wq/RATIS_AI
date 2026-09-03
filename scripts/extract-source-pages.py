"""원문 미리보기용 — 실제 PDF 에서 인용 쪽의 글자를 뽑아 데모 데이터로 만든다.

화면의 원문 패널은 실제 뷰어(PDF)가 붙기 전까지 지면이 앉을 자리만 잡고 있었다. 그 자리에
**진짜 문서의 글자**를 넣어, 쪽을 넘길 때 무엇이 보이는지 눈으로 확인할 수 있게 한다.

★ 만들어 낸 문장이 아니라 원문 그대로다. 손으로 옮겨 적지 않는다 — 옮기다 틀리면 화면이
  실제 보고서와 다른 말을 하게 된다.
⚠ 2022·2023년도 실태조사 보고서는 스캔본이라 글자층이 없다 (OCR 전에는 못 뽑는다).

    python3 scripts/extract-source-pages.py
"""
import json
import pathlib
import re
import sys

try:
    import pypdf
except ImportError:
    sys.exit('pypdf 가 필요하다: pip3 install pypdf')

ROOT = pathlib.Path(__file__).resolve().parents[2] / 'docs' / 'file_sample'
OUT = pathlib.Path(__file__).resolve().parents[1] / 'src' / 'demo' / 'data' / 'source-pages.ts'

# (파일명, PDF 물리 쪽 → 인쇄 쪽 보정, 뽑을 인쇄 쪽들)
TARGETS = [
    ('1. 방사선 및 방사성동위원소 이용실태조사 보고서/1. 보고서 최종본/'
     '2021년도 방사선 및 방사성동위원소 이용실태조사 보고서.pdf', 6, [13, 14, 15]),
    ('2. 이슈페이퍼/[2025 이슈페이퍼] 방사성의약품 신약 개발 현황과 전망.pdf', 0, [3, 4, 5]),
    ('3. 시장분석보고서/[2025 KARA RT REPORT] AI 기반 의료영상 분야 시장분석보고서.pdf', 4, [1, 2, 3]),
    ('5. 법령분석보고서/각론 5. 방사선 이용기관 안전규제 국내외 비교.pdf', 0, [3, 4, 5]),
]


TABULAR = re.compile(r'\S {2,}\S')


def reflow(t: str) -> str:
    """PDF 의 줄바꿈을 걷고 문단으로 다시 흘린다.

    PDF 한 줄은 **지면 폭에서 끊긴 것**이라, 화면 폭이 다르면 줄이 엉뚱한 자리에서 끊겨
    보인다 (2026-09-03 화면 검토 — 창을 넓혀도 글줄이 원본 폭에 갇혀 있었다).
    문단 안의 줄바꿈만 걷고 빈 줄(문단 경계)은 남긴다.

    ★ **표처럼 보이는 줄은 그대로 둔다.** 칸 사이를 공백으로 맞춰 놓은 줄이라, 이어 붙이면
      숫자가 뒤엉킨다. 판별은 「글자 사이에 두 칸 이상 공백이 있는가」다.
    """
    out = []
    for para in t.split('\n\n'):
        lines = [l.rstrip() for l in para.split('\n') if l.strip()]
        if not lines:
            continue
        if any(TABULAR.search(l) for l in lines):
            out.append('\n'.join(lines))  # 표·목차는 지면 그대로
            continue
        joined = ''
        for line in lines:
            if not joined:
                joined = line.strip()
            elif joined.endswith('-'):
                joined = joined[:-1] + line.strip()
            else:
                joined += ' ' + line.strip()
        out.append(joined)
    return '\n\n'.join(out)


def clean(t: str) -> str:
    """지면 모양을 살린 채 여백만 줄인다.

    ★ `extraction_mode="layout"` 으로 뽑는다. 기본 모드는 한글 PDF 에서 어절 사이 공백이
      사라져 「이용기관수는52,814개기관으로」처럼 붙어 나온다 (2026-09-03 실측).
      레이아웃 모드는 글자 좌표로 칸을 복원해 준다.
    여기서는 줄 안의 과한 공백과 빈 줄만 줄인다 — 내용은 건드리지 않는다.
    """
    t = t.replace('\r', '')
    t = re.sub(r'[ \t]{2,}', ' ', t)
    t = re.sub(r' +\n', '\n', t)
    t = re.sub(r'\n{3,}', '\n\n', t)
    return reflow(t.strip())


def main() -> None:
    out = {}
    for rel, offset, pages in TARGETS:
        path = ROOT / rel
        if not path.exists():
            print('없음:', rel)
            continue
        reader = pypdf.PdfReader(str(path))
        name = path.name
        got = {}
        for printed in pages:
            idx = printed + offset - 1
            if idx < 0 or idx >= len(reader.pages):
                continue
            text = clean(reader.pages[idx].extract_text(extraction_mode="layout") or "")
            if len(text) > 40:
                got[printed] = text
        if got:
            out[name] = got
            print('%-56s %s쪽' % (name[:54], list(got)))

    body = json.dumps(out, ensure_ascii=False, indent=2)
    OUT.write_text(
        '/* eslint-disable */\n'
        '/**\n'
        ' * 원문 미리보기 — **실제 PDF 에서 뽑은 글자다.**\n'
        ' *\n'
        ' * `scripts/extract-source-pages.py` 가 docs/file_sample 의 원본을 읽어 만든다.\n'
        ' * 손으로 고치지 않는다 — 고치면 화면이 실제 보고서와 다른 말을 하게 된다.\n'
        ' * 자료가 바뀌면 스크립트를 다시 돌린다.\n'
        ' *\n'
        ' * 실연동에서는 이 파일이 사라지고 문서 뷰어가 그 자리를 진다.\n'
        ' */\n'
        'export const SOURCE_PAGES: Record<string, Record<number, string>> =\n'
        + body + ' as const\n',
        encoding='utf-8',
    )
    print('→', OUT)


main()
