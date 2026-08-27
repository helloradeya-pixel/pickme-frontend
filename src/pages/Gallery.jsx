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

  // State & Ref untuk Slide Instagram-like
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const touchStartX = useRef(0)
  const currentTranslateX = useRef(0)

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

  // EFFECT UNTUK MENGUNCI BACKGROUND SCROLL KETIKA VIEWER AKTIF
  useEffect(() => {
    if (viewerIndex !== null) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [viewerIndex])

  // SELECT FOTO
  const toggle = (p, e) => {
    if (e) e.stopPropagation()

    if (!selected.includes(p) && selected.length >= max) {
      return alert(`Batas maksimal memilih foto adalah ${max} foto.`)
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
      `Selected Photos (${selected.length}/${max}):\n` +
      selected.map((p, i) => `${i + 1}. ${p.name || p.url}`).join("\n")

    let number = adminWA.replace(/[^0-9]/g, "")
    if (number.startsWith("0")) number = "62" + number.slice(1)
    if (!number.startsWith("62")) number = "62" + number

    const url = `https://wa.me/${number}?text=${encodeURIComponent(msg)}`
    window.open(url, "_blank")
  }

  // === HANDLER SLIDE DENGAN MENCEGAH SCROLL BACKGROUND (preventDefault) ===
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    setIsDragging(true)
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return
    
    // MENCEGAH BROWSER MELAKUKAN SCROLL / REFRESH SAAT DIGESER DI HP
    if (e.cancelable) {
      e.preventDefault()
    }

    const currentX = e.touches[0].clientX
    const diff = currentX - touchStartX.current
    currentTranslateX.current = diff
    setDragOffset(diff)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    const threshold = window.innerWidth * 0.2 // Geser 20% layar untuk pindah foto

    if (currentTranslateX.current > threshold && viewerIndex > 0) {
      setViewerIndex(viewerIndex - 1)
    } else if (currentTranslateX.current < -threshold && viewerIndex < photos.length - 1) {
      setViewerIndex(viewerIndex + 1)
    }

    setDragOffset(0)
    currentTranslateX.current = 0
  }

  return (
    <div style={{ padding: "24px 20px 100px 20px", fontFamily: "Roboto, Arial, sans-serif", backgroundColor: "#f8f9fa", minHeight: "100vh", boxSizing: "border-box" }}>

      {/* HEADER */}
      <div style={{ marginBottom: 20, borderBottom: "1px solid #dadce0", paddingBottom: 16 }}>
        <h1 style={{ fontSize: "20px", color: "#202124", margin: 0, fontWeight: 500 }}>📁 {clientName || "Radeya Gallery"}</h1>
        <p style={{ margin: "6px 0 0 0", color: "#5f6368", fontSize: "14px" }}>
          Ketuk foto untuk memilih. Terpilih: <b style={{ color: "#1a73e8" }}>{selected.length}</b> / {max}
        </p>
      </div>

      <div style={{ fontSize: "13px", color: "#5f6368", marginBottom: 12, fontWeight: 500, letterSpacing: "0.5px" }}>
        DAFTAR FOTO PROJECT
      </div>

      {/* GRID FOTO */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: 12
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
              onClick={() => toggle(p)}
              style={{ 
                position: "relative",
                backgroundColor: isSelected ? "#e8f0fe" : "#ffffff",
                border: isSelected ? "2px solid #1a73e8" : "1px solid #e0e0e0",
                borderRadius: 12,
                overflow: "hidden",
                cursor: "pointer",
                boxShadow: isHovered || isSelected ? "0 4px 12px rgba(60,64,67,0.12)" : "0 1px 2px rgba(60,64,67,0.06)",
                transition: "all 0.2s ease"
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 24,
                  height: 24,
                  backgroundColor: isSelected ? "#1a73e8" : "rgba(255, 255, 255, 0.85)",
                  border: isSelected ? "2px solid #1a73e8" : "2px solid #bdc1c6",
                  borderRadius: "50%",
                  zIndex: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 12,
                  fontWeight: "bold",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                  transition: "all 0.2s ease"
                }}
              >
                {isSelected ? "✓" : ""}
              </div>

              <div style={{ width: "100%", height: 140, overflow: "hidden", backgroundColor: "#f1f3f4" }}>
                <img
                  src={p.url}
                  loading="lazy"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.3s ease",
                    transform: isHovered ? "scale(1.04)" : "scale(1)"
                  }}
                />
              </div>

              <div style={{ padding: "8px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#3c4043", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "70%" }}>
                  {p.name || `Foto_${i + 1}`}
                </span>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setViewerIndex(i)
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    padding: "4px",
                    color: "#5f6368"
                  }}
                  title="Perbesar foto"
                >
                  🔍
                </button>
              </div>

            </div>
          )
        })}
      </div>

      {/* FLOATING ACTION BAR */}
      {selected.length > 0 && (
        <div style={{
          position: "fixed",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#202124",
          color: "white",
          padding: "12px 20px",
          borderRadius: 32,
          display: "flex",
          alignItems: "center",
          gap: 16,
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          zIndex: 998,
          animation: "slideUp 0.25s ease-out",
          width: "90%",
          maxWidth: "400px",
          justifyContent: "space-between",
          boxSizing: "border-box"
        }}>
          <span style={{ fontSize: "14px", fontWeight: 500 }}>
            <b>{selected.length}</b> foto dipilih
          </span>

          <button
            onClick={sendWA}
            style={{
              padding: "8px 16px",
              background: "#22c55e",
              color: "white",
              border: "none",
              borderRadius: 20,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            📤 Kirim ke WA
          </button>
        </div>
      )}

      {/* FULLSCREEN VIEWER - LOCKED TOUCH SCROLL */}
      {viewerIndex !== null && (
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.95)",
            zIndex: 9999,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            touchAction: "none" // Mengunci interaksi sentuhan browser agar murni untuk custom handler
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
              zIndex: 20,
              fontSize: "14px"
            }}
          >
            ✕ Tutup
          </button>

          {/* TOMBOL PILIH DI DALAM VIEWER */}
          <div
            onClick={(e) => toggle(photos[viewerIndex], e)}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              padding: "8px 16px",
              backgroundColor: selected.includes(photos[viewerIndex])
                ? "#1a73e8"
                : "rgba(255,255,255,0.2)",
              border: "1px solid white",
              borderRadius: 20,
              cursor: "pointer",
              zIndex: 20,
              color: "white",
              fontSize: "14px",
              fontWeight: 500
            }}
          >
            {selected.includes(photos[viewerIndex]) ? "✓ Terpilih" : "+ Pilih Foto Ini"}
          </div>

          {/* INDICATOR HALAMAN */}
          <div style={{
            position: "absolute",
            top: 28,
            left: "50%",
            transform: "translateX(-50%)",
            color: "white",
            fontSize: "14px",
            fontWeight: 500,
            zIndex: 20,
            background: "rgba(0,0,0,0.4)",
            padding: "4px 12px",
            borderRadius: 12
          }}>
            {viewerIndex + 1} / {photos.length}
          </div>

          {/* TOMBOL PREV */}
          {viewerIndex > 0 && (
            <button
              onClick={() => setViewerIndex(viewerIndex - 1)}
              style={{
                position: "absolute",
                left: 15,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 22,
                background: "rgba(255,255,255,0.2)",
                border: "none",
                color: "white",
                padding: "10px 14px",
                borderRadius: "50%",
                cursor: "pointer",
                zIndex: 20
              }}
            >
              ‹
            </button>
          )}

          {/* TOMBOL NEXT */}
          {viewerIndex < photos.length - 1 && (
            <button
              onClick={() => setViewerIndex(viewerIndex < photos.length - 1 ? viewerIndex + 1 : viewerIndex)}
              style={{
                position: "absolute",
                right: 15,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 22,
                background: "rgba(255,255,255,0.2)",
                border: "none",
                color: "white",
                padding: "10px 14px",
                borderRadius: "50%",
                cursor: "pointer",
                zIndex: 20
              }}
            >
              ›
            </button>
          )}

          {/* CAROUSEL TRACK */}
          <div style={{
            display: "flex",
            width: "100%",
            height: "100%",
            alignItems: "center",
            transform: `translateX(calc(${-viewerIndex * 100}vw + ${dragOffset}px))`,
            transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
            willChange: "transform"
          }}>
            {photos.map((p, idx) => (
              <div 
                key={idx} 
                style={{
                  minWidth: "100vw",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  boxSizing: "border-box",
                  padding: "60px 20px"
                }}
              >
                <img
                  src={p.url}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    pointerEvents: "none",
                    userSelect: "none"
                  }}
                />
              </div>
            ))}
          </div>

        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translate(-50%, 50px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>

    </div>
  )
}
