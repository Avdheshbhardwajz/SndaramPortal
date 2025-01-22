import type React from "react"
import { useRef, useEffect } from "react"

interface OTPInputProps {
  otp: string[]
  setOTP: React.Dispatch<React.SetStateAction<string[]>>
}

export const OTPInput: React.FC<OTPInputProps> = ({ otp, setOTP }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return

    const newOTP = [...otp]
    newOTP[index] = value.slice(-1)
    setOTP(newOTP)

    // Move to next input if value is entered
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Move to previous input on backspace if current input is empty
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").slice(0, 6)
    const digits = pastedData.split("").filter(char => !isNaN(Number(char)))

    const newOTP = [...otp]
    digits.forEach((digit, index) => {
      if (index < 6) newOTP[index] = digit
    })
    setOTP(newOTP)

    // Focus last filled input or first empty input
    const lastFilledIndex = digits.length - 1
    if (lastFilledIndex < 5 && inputRefs.current[lastFilledIndex + 1]) {
      inputRefs.current[lastFilledIndex + 1]?.focus()
    }
  }

  return (
    <div className="flex justify-between gap-2 sm:gap-3 md:gap-4">
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <input
          key={index}
          ref={el => inputRefs.current[index] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={otp[index]}
          onChange={e => handleChange(index, e.target.value)}
          onKeyDown={e => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="w-10 h-12 sm:w-12 sm:h-14 md:w-14 md:h-16 text-center text-lg font-semibold border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent transition-all duration-200"
          style={{ appearance: 'textfield' }}
        />
      ))}
    </div>
  )
}
