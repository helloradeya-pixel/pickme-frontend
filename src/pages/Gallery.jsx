import { useEffect, useState, useRef } from "react"
import { useParams } from "react-router-dom"
import { API } from "../config"

export default function Gallery() {
  const { code } = useParams()

  const [photos, setPhotos] = useState([])
  const [selected, setSelected] = useState([])
  const [adminWA, setAdminWA] = useState("")
  const [clientName, setClientName] = useState("")
  const [max, setMax] = useState(10)

  const [viewerIndex, setViewerIndex] = useState(null)
  const [hoveredIndex, setHoveredIndex] = useState(null)

  // State untuk menangani sentuhan (swipe) di mobile
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  useEffect(() => {
    fetch(`${API}/project/${code}`)
      .then(res => res.json())
      .then(data => {
        setPhotos(data.photos || [])
        setAdminWA(data.admin_whatsapp || "")
        setClientName(data.name || "")
        setMax(data.max_photos || 10)
      })
  }, [code])

  // SELECT FOTO
  const toggle = (p) => {
    if (!selected.includes(p) && selected.length >= max) {
      return alert("Limit foto tercapai")
    }

    setSelected(prev =>
      prev.includes(p)
        ? prev.filter(x => x !== p)
        : [...prev, p]
    )
  }

  // SEND WA
  const sendWA = () => {
    if (selected.length === 0) {
      return alert("Pilih foto dulu")
    }

    const msg =
      `📸 Client: ${clientName}\n\n` +
      `Selected Photos:\n` +
      selected.map((p, i) => `${i + 1}. ${p.name || p.url}`).join("\n")

    let number = adminWA.replace(/[^0-9]/g, "")
    if (number.startsWith("0")) number = "62" + number.slice(1)
    if (!number.startsWith("62")) number = "62" + number

    const url = `https://wa.me/${number}?text=${encodeURIComponent(msg)}`
    window.open(url, "_blank")
  }

  // Handle Swipe Touch untuk Mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    const distance = touchStartX.current - touchEndX.current
    const minSwipeDistance = 50

    if (distance > minSwipeDistance && viewerIndex < photos.length - 1) {
      // Swipe kiri -> Next
      setViewerIndex(viewerIndex + 1)
    }

    if (distance < -minSwipeDistance && viewerIndex > 0) {
      // Swipe kanan -> Prev
      setViewerIndex(viewerIndex - 1)
    }

    touchStartX.current = 0
    touchEndX.current = 0
  }

  return (
    <div style={{ padding: "24px 32px", fontFamily: "Roboto, Arial, sans-serif", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, borderBottom: "1px solid #dadce0", paddingBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: "22px", color: "#202124", margin: 0, fontWeight: 500 }}>📁 {clientName || "Radeya Gallery"}</h1>
          <p style={{ margin: "4px 0 0 0", color: "#5f6368", fontSize: "14px" }}>
            Dipilih: <b>{selected.length}</b> dari {max} foto maksimum
          </p>
        </div>

        <button
          onClick={sendWA}
          style={{
            padding: "10px 20px",
            background: "#1a73e8",
            color: "white",
            border: "none",
            borderRadius: 24,
            cursor: "pointer",
            fontWeight: 500,
            fontSize: "14px",
            boxShadow: "0 1px 2px 0 rgba(60,64,67,0.3)",
            transition: "all 0.2s ease"
          }}
        >
          📤 Kirim ke WhatsApp
        </button>
      </div>

      {/* GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16
        }}
      >
        {photos.map((p, i) => {
          const isSelected = selected.includes(p)
          const isHovered = hoveredIndex === i

          return (
            <div 
              key={i} 
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ 
                position: "relative",
                backgroundColor: isSelected ? "#e8f0fe" : "#f1f3f4",
                border: isSelected ? "2px solid #1a73e8" : "1px solid transparent",
                borderRadius: 12,
                overflow: "hidden",
                cursor: "pointer",
                boxShadow: isHovered ? "0 4px 12px rgba(60,64,67,0.15)" : "none",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)" // Efek smooth transition
              }}
            >
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  toggle(p)
                }}
                style={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  width: 22,
                  height: 22,
                  backgroundColor: isSelected ? "#1a73e8" : "rgba(255, 255, 255, 0.7)",
                  border: isSelected ? "2px solid #1a73e8" : "2px solid #5f6368",
                  borderRadius: 4,
                  cursor: "pointer",
                  zIndex: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 13,
                  fontWeight: "bold",
                  opacity: isSelected || isHovered ? 1 : 0,
                  transition: "opacity 0.2s ease"
                }}
              >
                {isSelected ? "✓" : ""}
              </div>

              <div onClick={() => setViewerIndex(i)} style={{ width: "100%", height: 160, overflow: "hidden" }}>
                <img
                  src={p.url}
                  loading="lazy"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    transform: isHovered ? "scale(1.05)" : "scale(1)"
                  }}
                />
              </div>

              <div style={{ padding: "8px 10px", fontSize: "12px", color: "#3c4043", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {p.name || `Foto_${i + 1}`}
              </div>
            </div>
          )
        })}
      </div>

      {/* FULLSCREEN VIEWER DENGAN ANIMASI FADE & SWIPE */}
      {viewerIndex !== null && (
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.9)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            animation: "fadeIn 0.25s ease-out" // Animasi buka modal mulus
          }}
        >
          {/* TOMBOL TUTUP */}
          <button
            onClick={() => setViewerIndex(null)}
            style={{
              position: "absolute",
              top: 20,
              left: 20,
              background: "rgba(255,255,255,0.2)",
              border: "none",
              color: "white",
              padding: "8px 14px",
              borderRadius: 20,
              cursor: "pointer",
              zIndex: 10,
              transition: "background 0.2s"
            }}
          >
            ✕ Tutup
          </button>

          {/* TOMBOL PILIH DI VIEWER */}
          <div
            onClick={(e) => {
              e.stopPropagation()
              toggle(photos[viewerIndex])
            }}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              padding: "6px 14px",
              backgroundColor: selected.includes(photos[viewerIndex])
                ? "#1a73e8"
                : "rgba(255,255,255,0.2)",
              border: "1px solid white",
              borderRadius: 20,
              cursor: "pointer",
              zIndex: 10,
              color: "white",
              fontSize: "14px",
              fontWeight: 500,
              transition: "all 0.2s"
            }}
          >
            {selected.includes(photos[viewerIndex]) ? "✓ Terpilih" : "+ Pilih Foto"}
          </div>

          {/* TOMBOL PREV */}
          {viewerIndex > 0 && (
            <button
              onClick={() => setViewerIndex(viewerIndex - 1)}
              style={{
                position: "absolute",
                left: 20,
                fontSize: 24,
                background: "rgba(255,255,255,0.2)",
                border: "none",
                color: "white",
                padding: "12px 16px",
                borderRadius: "50%",
                cursor: "pointer",
                zIndex: 10,
                transition: "background 0.2s"
              }}
            >
              ‹
            </button>
          )}

          {/* TOMBOL NEXT */}
          {viewerIndex < photos.length - 1 && (
            <button
              onClick={() => setViewerIndex(viewerIndex + 1)}
              style={{
                position: "absolute",
                right: 20,
                fontSize: 24,
                background: "rgba(255,255,255,0.2)",
                border: "none",
                color: "white",
                padding: "12px 16px",
                borderRadius: "50%",
                cursor: "pointer",
                zIndex: 10,
                transition: "background 0.2s"
              }}
            >
              ›
            </button>
          )}

          {/* GAMBAR UTAMA DENGAN TRANSISI HALUS */}
          <img
            key={viewerIndex} // Key ini memaksa React me-render ulang dengan efek fade saat gambar diganti
            src={photos[viewerIndex].url}
            style={{
              maxWidth: "85vw",
              maxHeight: "85vh",
              objectFit: "contain",
              animation: "scaleUp 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          />

          {/* CSS KEYFRAMES UNTUK ANIMASI HALUS */}
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes scaleUp {
              from { transform: scale(0.95); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      )}

    </div>
  )
}
