'use client'
import React, { useEffect, useRef, useState } from 'react'
import { normalizeGTIN } from '@/lib/gtin'
import { BrowserMultiFormatReader } from '@zxing/browser'

type Props = { onDetected: (gtin: string) => void }

export default function BarcodeScanner({ onDetected }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [supported, setSupported] = useState<boolean>(false)
  const [manual, setManual] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const zxingRef = useRef<BrowserMultiFormatReader | null>(null)

  useEffect(() => {
    const anyNav = navigator as any
    setSupported(Boolean(anyNav?.BarcodeDetector))
    return () => stopStream()
  }, [])

  async function startScan() {
    setError(null)
    const anyNav = navigator as any
    if (anyNav?.BarcodeDetector) {
      const BarcodeDetector = anyNav.BarcodeDetector
      const detector = new BarcodeDetector({ formats: ['ean_13', 'upc_a', 'upc_e', 'ean_8'] })
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        tickNative(detector)
      }
    } else {
      // ZXing fallback
      const codeReader = new BrowserMultiFormatReader()
      zxingRef.current = codeReader
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        await codeReader.decodeFromVideoDevice(undefined, videoRef.current, (res, err) => {
          if (res?.getText()) {
            handleDetect(res.getText())
          }
        })
      }
    }
  }

  async function tickNative(detector: any) {
    if (!videoRef.current) return
    try {
      const bitmap = await createImageBitmap(videoRef.current)
      const codes = await detector.detect(bitmap)
      if (codes && codes[0]?.rawValue) {
        handleDetect(codes[0].rawValue)
        return
      }
    } catch {}
    requestAnimationFrame(() => tickNative(detector))
  }

  function handleDetect(raw: string) {
    stopStream()
    const normalized = normalizeGTIN(raw)
    if (!normalized) {
      setError('Not a valid GTIN/EAN-13. Try manual entry.')
      return
    }
    onDetected(normalized)
  }

  function stopStream() {
    try {
      zxingRef.current?.reset()
    } catch {}
    const tracks = (videoRef.current?.srcObject as MediaStream | null)?.getTracks?.() || []
    tracks.forEach((t) => t.stop())
  }

  function submitManual(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const normalized = normalizeGTIN(manual.trim())
    if (!normalized) { setError('Please enter a valid 13-digit EAN or 12-digit UPC.'); return }
    onDetected(normalized)
  }

  return (
    <div className="card space-y-3">
      <h2 className="text-lg font-semibold">Scan a barcode</h2>
      <div className="flex gap-2 items-center flex-wrap">
        <button onClick={startScan} className="px-3 py-2 rounded-lg bg-black text-white">Use camera</button>
        <form onSubmit={submitManual} className="flex items-center gap-2">
          <input value={manual} onChange={e=>setManual(e.target.value)} placeholder="Enter GTIN (EAN-13 or UPC-A)" className="px-3 py-2 rounded-lg border" />
          <button className="px-3 py-2 rounded-lg bg-gray-200">Lookup</button>
        </form>
      </div>
      {error && <div className="text-sm text-red-700">{error}</div>}
      <video ref={videoRef} className="w-full rounded-lg" muted playsInline />
      {!supported && <div className="text-xs text-gray-500">Using ZXing fallback if camera is allowed.</div>}
    </div>
  )
}
