import { useId, useRef, useState } from 'react'
import { Paperclip, Upload, X } from 'lucide-react'
import { cx } from '../custom/util'
import { Button } from './Button'
import './FileUpload.css'

/** 사람이 읽는 크기. 표시 자리가 좁아 소수 한 자리까지만 */
function fileSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}

/**
 * 파일 올리는 칸 — 끌어다 놓거나 골라서 올린다.
 *
 * ★ **끌어놓기만 두지 않는다.** 끌어놓기는 마우스가 있고 파일 창을 나란히 띄울 수 있는
 *   사람만 쓸 수 있다. 버튼을 함께 세워야 키보드로도 올릴 수 있다.
 * ★ **막는 조건을 미리 적는다** (`description`). 형식·개수·용량은 고르기 전에 알아야
 *   하는 것이지, 올린 뒤에 물리며 알려 줄 일이 아니다.
 * ★ 걸린 파일은 **왜 걸렸는지**를 파일 이름과 함께 말한다. 「올릴 수 없는 파일입니다」만
 *   뜨면 여러 개를 한꺼번에 끌어다 놓았을 때 어느 것이 문제인지 알 수 없다.
 *
 * 실제 전송은 이 부품의 몫이 아니다 — 고른 파일을 `onChange` 로 넘기고, 어디로 어떻게
 * 보낼지는 화면과 서버 연동이 정한다.
 */
export function FileUpload({
  title,
  description,
  uploadText = '파일을 끌어다 놓거나 파일선택 버튼을 눌러 주세요',
  maxFiles = 1,
  maxFileSize,
  acceptedFileTypes,
  onChange,
  disabled,
  className,
}: {
  /** 무엇을 올리는 자리인지 (이름표) */
  title?: string
  /** 형식·개수·용량 안내 한 줄 */
  description?: string
  /** 빈 상자 안에 서는 안내 */
  uploadText?: string
  maxFiles?: number
  /** 한 개당 상한 (바이트) */
  maxFileSize?: number
  /** 받는 형식 (MIME 또는 확장자). 생략하면 가리지 않는다 */
  acceptedFileTypes?: string[]
  onChange?: (files: File[]) => void
  disabled?: boolean
  className?: string
}) {
  const inputId = useId()
  const input = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [over, setOver] = useState(false)
  const [rejected, setRejected] = useState<string[]>([])

  const accepts = (f: File) =>
    !acceptedFileTypes?.length ||
    acceptedFileTypes.some((t) =>
      t.startsWith('.') ? f.name.toLowerCase().endsWith(t.toLowerCase()) : f.type === t,
    )

  const take = (incoming: FileList | null) => {
    if (!incoming?.length) return
    const problems: string[] = []
    const next = [...files]
    for (const f of incoming) {
      if (next.length >= maxFiles) {
        problems.push(`${f.name}은(는) 올리지 못했습니다. 최대 ${maxFiles}개까지 올릴 수 있습니다.`)
        continue
      }
      if (!accepts(f)) {
        problems.push(`${f.name}은(는) 올릴 수 없는 형식입니다.`)
        continue
      }
      if (maxFileSize && f.size > maxFileSize) {
        problems.push(`${f.name}은(는) 용량 상한 ${fileSize(maxFileSize)}을(를) 넘습니다.`)
        continue
      }
      next.push(f)
    }
    setRejected(problems)
    setFiles(next)
    onChange?.(next)
    /* 같은 파일을 다시 고를 수 있게 비운다. 안 비우면 지운 뒤 같은 것을 골라도 아무 일이
       일어나지 않는다 (값이 안 바뀌어 change 가 안 난다) */
    if (input.current) input.current.value = ''
  }

  const remove = (at: number) => {
    const next = files.filter((_, i) => i !== at)
    setFiles(next)
    onChange?.(next)
  }

  return (
    <div className={cx('ratis-upload', className)}>
      {title && (
        <label className="ratis-field-label" htmlFor={inputId}>
          {title}
        </label>
      )}
      {description && <p className="ratis-upload-desc">{description}</p>}

      <div
        className="ratis-upload-drop"
        data-over={over || undefined}
        data-disabled={disabled || undefined}
        onDragOver={(e) => {
          if (disabled) return
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          if (disabled) return
          e.preventDefault()
          setOver(false)
          take(e.dataTransfer.files)
        }}
      >
        <Upload className="ratis-upload-mark" aria-hidden />
        <p className="ratis-upload-text">{uploadText}</p>
        <input
          ref={input}
          id={inputId}
          type="file"
          className="visually-hidden"
          multiple={maxFiles > 1}
          accept={acceptedFileTypes?.join(',')}
          disabled={disabled}
          onChange={(e) => take(e.currentTarget.files)}
        />
        <Button size="small" variant="secondary" disabled={disabled} onClick={() => input.current?.click()}>
          파일선택
        </Button>
      </div>

      {rejected.length > 0 && (
        /* 올리다 걸린 것들. 동작의 결과라 즉시 읽어 준다 */
        <ul className="ratis-upload-rejected" role="alert">
          {rejected.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <ul className="ratis-upload-list">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="ratis-upload-item">
              <Paperclip aria-hidden />
              <span className="ratis-upload-name">{f.name}</span>
              <span className="ratis-upload-size">{fileSize(f.size)}</span>
              <button
                type="button"
                className="ratis-upload-remove"
                aria-label={`${f.name} 지우기`}
                onClick={() => remove(i)}
              >
                <X aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
