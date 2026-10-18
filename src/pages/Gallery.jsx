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

  // State untuk Pop-up TNC
  const [showTnc, setShowTnc] = useState(true)

  const [viewerIndex, setViewerIndex] = useState(null)
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const carouselRef = useRef(null)

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

  // EFFECT UNTUK MENGUNCI BACKGROUND SCROLL KETIKA VIEWER ATAU TNC AKTIF
  useEffect(() => {
    if (viewerIndex !== null || showTnc) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [viewerIndex, showTnc])

  // SCROLL KE FOTO SESUAI VIEWER INDEX
  useEffect(() => {
    if (viewerIndex !== null && carouselRef.current) {
      carouselRef.current.scrollTo({
        left: viewerIndex * window.innerWidth,
        behavior: "instant"
      })
    }
  }, [viewerIndex])

  // HANDLER UNTUK DETEKSI FOTO AKTIF SAAT DIPUTAR/DISWIPE
  const handleScroll = () => {
    if (carouselRef.current) {
      const index = Math.round(carouselRef.current.scrollLeft / window.innerWidth)
      if (index !== viewerIndex && index >= 0 && index < photos.length) {
        setViewerIndex(index)
      }
    }
  }

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

  return (
    <div style={{ padding: "24px 20px 100px 20px", fontFamily: "Roboto, Arial, sans-serif", backgroundColor: "#f8f9fa", minHeight: "100vh", boxSizing: "border-box" }}>

      {/* POP-UP MODAL TNC */}
      {showTnc && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          boxSizing: "border-box"
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: 16,
            width: "100%",
            maxWidth: "420px",
            padding: "24px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            boxSizing: "border-box",
            animation: "slideUp 0.25s ease-out"
          }}>
            <h2 style={{ margin: "0 0 12px 0", fontSize: "18px", color: "#202124", fontWeight: 600 }}>
              ⚠️ Peringatan & Ketentuan
            </h2>

            <div style={{
              fontSize: "13px",
              color: "#5f6368",
              lineHeight: "1.6",
              maxHeight: "240px",
              overflowY: "auto",
              marginBottom: "20px",
              paddingRight: "6px"
            }}>
              <p style={{ margin: "0 0 10px 0" }}>
                • Editing akan diproses menggunakan sistem antrian, apabila ada revisi dalam list edit maka antriannya akan diulang.
              </p>
              <p style={{ margin: "0 0 10px 0" }}>
                • Penyerahan list edit ke kami maksimal <b>H+7</b> dari file original yg sudah diberikan, lebih dari itu list edit tidak akan diproses lebih lanjut.
              </p>
              <p style={{ margin: "0", fontWeight: 500, color: "#202124" }}>
                Terima kasih kak atas pengertian dan kerja samanya 🙏
              </p>
            </div>

            <button
              onClick={() => setShowTnc(false)}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#1a73e8",
                color: "white",
                border: "none",
                borderRadius: 24,
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(26,115,232,0.3)"
              }}
            >
              Saya Mengerti & Lanjutkan
            </button>
          </div>
        </div>
      )}

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
              {/* BADGE NOMOR URUT DI POJOK KIRI ATAS */}
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  backgroundColor: "rgba(0, 0, 0, 0.65)",
                  color: "white",
                  padding: "2px 8px",
                  borderRadius: 12,
                  zIndex: 2,
                  fontSize: 11,
                  fontWeight: "bold",
                  backdropFilter: "blur(2px)"
                }}
              >
                #{i + 1}
              </div>

              {/* LINGKARAN CENTANG SELEKSI DI POJOK KANAN ATAS */}
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
                <span style={{ fontSize: "12px", color: "#3c4043", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "80%", fontWeight: 500 }}>
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

      {/* FULLSCREEN VIEWER - SUPPORT SWIPE & PINCH TO ZOOM & RESPONSIVE LANDSCAPE */}
      {viewerIndex !== null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.95)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center"
          }}
        >
          {/* TOMBOL TUTUP */}
          <button
            onClick={() => setViewerIndex(null)}
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              background: "rgba(255,255,255,0.2)",
              border: "none",
              color: "white",
              padding: "6px 12px",
              borderRadius: 20,
              cursor: "pointer",
              zIndex: 20,
              fontSize: "13px"
            }}
          >
            ✕ Tutup
          </button>

          {/* TOMBOL PILIH DI DALAM VIEWER */}
          <div
            onClick={(e) => toggle(photos[viewerIndex], e)}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              padding: "6px 14px",
              backgroundColor: selected.includes(photos[viewerIndex])
                ? "#1a73e8"
                : "rgba(255,255,255,0.2)",
              border: "1px solid white",
              borderRadius: 20,
              cursor: "pointer",
              zIndex: 20,
              color: "white",
              fontSize: "13px",
              fontWeight: 500
            }}
          >
            {selected.includes(photos[viewerIndex]) ? "✓ Terpilih" : "+ Pilih Foto Ini"}
          </div>

          {/* INDICATOR HALAMAN */}
          <div style={{
            position: "absolute",
            top: 22,
            left: "50%",
            transform: "translateX(-50%)",
            color: "white",
            fontSize: "13px",
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
              onClick={() => {
                const prev = viewerIndex - 1
                setViewerIndex(prev)
                carouselRef.current?.scrollTo({ left: prev * window.innerWidth, behavior: "smooth" })
              }}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 22,
                background: "rgba(255,255,255,0.2)",
                border: "none",
                color: "white",
                padding: "8px 12px",
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
              onClick={() => {
                const next = viewerIndex + 1
                setViewerIndex(next)
                carouselRef.current?.scrollTo({ left: next * window.innerWidth, behavior: "smooth" })
              }}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 22,
                background: "rgba(255,255,255,0.2)",
                border: "none",
                color: "white",
                padding: "8px 12px",
                borderRadius: "50%",
                cursor: "pointer",
                zIndex: 20
              }}
            >
              ›
            </button>
          )}

          {/* CAROUSEL TRACK DENGAN NATIVE SCROLL SNAP */}
          <div
            ref={carouselRef}
            onScroll={handleScroll}
            style={{
              display: "flex",
              width: "100vw",
              height: "100vh",
              overflowX: "auto",
              overflowY: "hidden",
              scrollSnapType: "x mandatory",
              scrollBehavior: "smooth",
              WebkitOverflowScrolling: "touch"
            }}
          >
            {photos.map((p, idx) => (
              <div 
                key={idx} 
                style={{
                  minWidth: "100vw",
                  height: "100vh",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  boxSizing: "border-box",
                  padding: "12px",
                  scrollSnapAlign: "start",
                  scrollSnapStop: "always",
                  flexShrink: 0
                }}
              >
                <img
                  src={p.url}
                  style={{
                    maxWidth: "calc(100vw - 32px)",
                    maxHeight: "calc(100vh - 90px)",
                    objectFit: "contain",
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
          from { transform: translate(0, 30px); opacity: 0; }
          to { transform: translate(0, 0); opacity: 1; }
        }
      `}</style>

    </div>
  )
}
