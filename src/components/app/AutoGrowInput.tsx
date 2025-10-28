import React, { useEffect, useRef } from 'react'

interface AutoGrowInputProps {
  value: string
  onChange?: (next: string) => void
  placeholder?: string
  readOnly?: boolean
  className?: string // applied to ROOT container for width control
  inputClassName?: string // applied to textarea
  style?: React.CSSProperties
  autoFocus?: boolean
  onClick?: (e: React.MouseEvent) => void
}

function AutoGrowInput({
  value,
  onChange,
  placeholder,
  readOnly = false,
  className = '',
  inputClassName = '',
  style,
  autoFocus = false,
  onClick,
}: AutoGrowInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  // 높이 자동 조절
  const autoResize = () => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  // value가 변경될 때마다 높이 조절
  useEffect(() => {
    autoResize()
  }, [value])

  // autoFocus 처리
  useEffect(() => {
    if (autoFocus && ref.current && !readOnly) {
      ref.current.focus()
      // 커서를 끝으로 이동
      const len = ref.current.value.length
      ref.current.setSelectionRange(len, len)
    }
  }, [autoFocus, readOnly])

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget
    // 줄바꿈이 있으면 공백으로 치환
    if (textarea.value.includes('\n')) {
      const cursorPos = textarea.selectionStart
      const newValue = textarea.value.replace(/\n/g, ' ')
      textarea.value = newValue

      if (onChange) {
        onChange(newValue)
      }

      // 커서 위치 복원
      textarea.setSelectionRange(cursorPos, cursorPos)
    } else {
      if (onChange) {
        onChange(textarea.value)
      }
    }

    autoResize()
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = e => {
    // 상위 카드 토글 등으로 이벤트 전파되지 않도록 차단
    e.stopPropagation()
    // Enter 차단 (한 줄 입력 유지)
    if (e.key === 'Enter') {
      e.preventDefault()
    }
  }

  return (
    <div className={`relative w-full ${className}`} style={style}>
      <textarea
        ref={ref}
        value={value}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onClick={e => {
          e.stopPropagation()
          onClick?.(e)
        }}
        placeholder={placeholder}
        readOnly={readOnly}
        spellCheck={false}
        rows={1}
        className={`w-full p-1 text-[#405347] font-normal text-base leading-tight font-pretendard bg-transparent border-none outline-none resize-none ${
          readOnly ? 'cursor-default' : ''
        } ${inputClassName} placeholder:text-[#A5BAAF]`}
        style={{ minHeight: 24, ...style }}
        aria-label={placeholder}
      />
    </div>
  )
}

export default AutoGrowInput
