import React, { useEffect, useLayoutEffect, useRef } from 'react'

interface AutoGrowInputProps {
  value: string
  onChange?: (next: string) => void
  placeholder?: string
  readOnly?: boolean
  className?: string // applied to ROOT container for width control
  inputClassName?: string // applied to contenteditable div
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
  const ref = useRef<HTMLDivElement>(null)
  const hasAutofocusedRef = useRef(false)

  // 내부 텍스트를 외부 value와 동기화
  useLayoutEffect(() => {
    if (!ref.current) return
    if (ref.current.innerText !== value) {
      ref.current.innerText = value
    }
    autoResize()
  }, [value])

  // autoFocus는 최초 1회만 수행 (값 변경 시마다 커서가 끝으로 가지 않도록)
  useEffect(() => {
    if (!ref.current) return
    if (!autoFocus || readOnly || hasAutofocusedRef.current) return
    hasAutofocusedRef.current = true
    ref.current.focus()
    const sel = window.getSelection()
    const range = document.createRange()
    range.selectNodeContents(ref.current)
    range.collapse(false)
    sel?.removeAllRanges()
    sel?.addRange(range)
  }, [autoFocus, readOnly])

  // 높이 자동 조절
  const autoResize = () => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  const handleInput = () => {
    autoResize()
    if (onChange && ref.current) {
      onChange(ref.current.innerText)
    }
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = e => {
    // 상위 카드 토글 등으로 이벤트 전파되지 않도록 차단
    e.stopPropagation()
    // Enter 차단 (한 줄 입력 유지)
    if (e.key === 'Enter') {
      e.preventDefault()
    }
  }

  const handlePaste: React.ClipboardEventHandler<HTMLDivElement> = e => {
    // 붙여넣기 시 줄바꿈을 공백으로 치환
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\n/g, ' ')
    document.execCommand('insertText', false, text)
  }

  return (
    <div className={`relative w-full ${className}`} style={style}>
      {(!value || value.length === 0) && !!placeholder && (
        <div className="pointer-events-none absolute inset-x-0 top-0 p-1 text-[#A5BAAF] font-normal text-base leading-tight font-pretendard whitespace-nowrap overflow-hidden text-ellipsis">
          {placeholder}
        </div>
      )}
      <div
        ref={ref}
        contentEditable={!readOnly}
        tabIndex={0}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onClick={e => {
          e.stopPropagation()
          onClick?.(e)
        }}
        spellCheck={false}
        className={`w-full p-1 text-[#405347] font-normal text-base leading-tight font-pretendard bg-transparent border-none outline-none whitespace-pre-wrap break-words ${
          readOnly ? 'cursor-default' : ''
        } ${inputClassName}`}
        style={{ minHeight: 24 }}
        aria-label={placeholder}
      />
    </div>
  )
}

export default AutoGrowInput
