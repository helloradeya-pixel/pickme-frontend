import { useState } from "react"
import { API } from "../config"

export default function Dashboard() {
  const [name, setName] = useState("")
  const [wa, setWa] = useState("08211251570") // ⬅️ Nomor admin default terpasang
  const [maxPhotos, setMaxPhotos] = useState("") 
  const [driveLink, setDriveLink] = useState("")
  const [link, setLink] = useState("")
  const [loading, setLoading] = useState(false)

  const create = async () => {
    if (!name || !wa || !maxPhotos) {
      return alert("Isi semua field dulu")
    }

    try {
      setLoading(true)

      const res = await fetch(`${API}/create-project`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          admin_whatsapp: wa,
          max_photos: maxPhotos,
          drive_link: driveLink
        })
      })

      const data = await res.json()

      if (!res.ok) {
        return alert(data.error || "Gagal create project")
      }

      setLink(data.link)

    } catch (err) {
      console.log(err)
      alert("Backend tidak konek / CORS error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f3f4f6"
      }}
    >
      {/* CARD */}
      <div
        style={{
          width: 380,
          padding: 25,
          background: "white",
          borderRadius: 12,
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>
          DASHBOARD
        </h2>

        {/* NAME */}
        <input
          placeholder="Nama client"
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />

        {/* WA (DEFAULT TERISI) */}
        <input
          placeholder="WhatsApp admin"
          value={wa}
          onChange={(e) => setWa(e.target.value)}
          style={inputStyle}
        />

        {/* MAX PHOTOS */}
        <input
          type="number"
          placeholder="Max pilihan foto"
          value={maxPhotos}
          onChange={(e) => setMaxPhotos(e.target.value)}
          style={inputStyle}
        />

        {/* DRIVE LINK */}
        <input
          placeholder="Link Google Drive folder"
          onChange={(e) => setDriveLink(e.target.value)}
          style={inputStyle}
        />

        {/* BUTTON */}
        <button
          onClick={create}
          disabled={loading}
          style={{
            width: "100%",
            padding: 10,
            background: "#22c55e",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: "bold",
            marginTop: 10
          }}
        >
          {loading ? "Creating..." : "Generate project link"}
        </button>

        {/* RESULT */}
        {link && (
          <div style={{ marginTop: 15, wordBreak: "break-all" }}>
            <p style={{ fontWeight: "bold" }}>Gallery Link:</p>
            <a href={link} target="_blank" rel="noreferrer">
              {link}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

// INPUT STYLE
const inputStyle = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
  borderRadius: 8,
  border: "1px solid #ddd",
  outline: "none"
}
