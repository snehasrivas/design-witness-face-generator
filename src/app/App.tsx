import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Cpu,
  Activity,
  Shield,
  Target,
  Eye,
  ChevronRight,
  RefreshCw,
  Crosshair,
  Wifi,
  AlertTriangle,
  BarChart3,
  User,
  Layers,
} from "lucide-react";

type FaceType = {
  id: number;
  url: string;
  confidence: number;
  candidateId: string;
  match: string;
};

const initialFaces: FaceType[] = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=280&h=340&fit=crop&auto=format&q=80",
    confidence: 97.3,
    candidateId: "WFG-001",
    match: "STRONG",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=280&h=340&fit=crop&auto=format&q=80",
    confidence: 94.1,
    candidateId: "WFG-002",
    match: "STRONG",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=280&h=340&fit=crop&auto=format&q=80",
    confidence: 91.8,
    candidateId: "WFG-003",
    match: "HIGH",
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=280&h=340&fit=crop&auto=format&q=80",
    confidence: 88.5,
    candidateId: "WFG-004",
    match: "HIGH",
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=280&h=340&fit=crop&auto=format&q=80",
    confidence: 85.2,
    candidateId: "WFG-005",
    match: "HIGH",
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=280&h=340&fit=crop&auto=format&q=80",
    confidence: 82.7,
    candidateId: "WFG-006",
    match: "MODERATE",
  },
  {
    id: 7,
    url: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=280&h=340&fit=crop&auto=format&q=80",
    confidence: 79.4,
    candidateId: "WFG-007",
    match: "MODERATE",
  },
  {
    id: 8,
    url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=280&h=340&fit=crop&auto=format&q=80",
    confidence: 76.1,
    candidateId: "WFG-008",
    match: "MODERATE",
  },
  {
    id: 9,
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=280&h=340&fit=crop&auto=format&q=80",
    confidence: 73.8,
    candidateId: "WFG-009",
    match: "LOW",
  },
  {
    id: 10,
    url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=280&h=340&fit=crop&auto=format&q=80",
    confidence: 71.2,
    candidateId: "WFG-010",
    match: "LOW",
  },
];

const ATTRIBUTES = [
  { label: "Age Range", value: "30–35 yrs", confidence: 91, tag: "AGE" },
  { label: "Gender", value: "Male", confidence: 96, tag: "GEN" },
  { label: "Facial Hair", value: "Full Beard", confidence: 88, tag: "HAIR" },
  { label: "Eye Color", value: "Dark Brown", confidence: 84, tag: "EYE" },
  { label: "Face Shape", value: "Oval", confidence: 79, tag: "FSHP" },
  { label: "Expression", value: "Serious / Neutral", confidence: 94, tag: "EXP" },
  { label: "Skin Tone", value: "Medium (ITA 35)", confidence: 89, tag: "SKIN" },
  { label: "Hair Color", value: "Dark Brown", confidence: 92, tag: "HCLR" },
  { label: "Est. Height", value: "175–182 cm", confidence: 63, tag: "HGT" },
];

function getMatchColor(match: string) {
  switch (match) {
    case "STRONG":
      return { text: "#00d4ff", bg: "rgba(0,212,255,0.12)", border: "rgba(0,212,255,0.35)" };
    case "HIGH":
      return { text: "#3b82f6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.35)" };
    case "MODERATE":
      return { text: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)" };
    default:
      return { text: "#64748b", bg: "rgba(100,116,139,0.12)", border: "rgba(100,116,139,0.3)" };
  }
}

function getConfidenceColor(conf: number) {
  if (conf >= 90) return "#00d4ff";
  if (conf >= 80) return "#3b82f6";
  if (conf >= 70) return "#f59e0b";
  return "#ef4444";
}

function CornerBracket({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const size = 10;
  const isLeft = position.endsWith("l");
  const isTop = position.startsWith("t");
  return (
    <div
      className="absolute"
      style={{
        top: isTop ? 0 : "auto",
        bottom: isTop ? "auto" : 0,
        left: isLeft ? 0 : "auto",
        right: isLeft ? "auto" : 0,
        width: size,
        height: size,
        borderTop: isTop ? "1.5px solid #00d4ff" : "none",
        borderBottom: isTop ? "none" : "1.5px solid #00d4ff",
        borderLeft: isLeft ? "1.5px solid #00d4ff" : "none",
        borderRight: isLeft ? "none" : "1.5px solid #00d4ff",
      }}
    />
  );
}

function ScanBar({ active }: { active: boolean }) {
  return active ? (
    <div
      className="absolute inset-x-0 pointer-events-none z-10"
      style={{
        height: "2px",
        background: "linear-gradient(90deg, transparent, #00d4ff, transparent)",
        animation: "scanBar 1.6s linear infinite",
        top: 0,
      }}
    />
  ) : null;
}

function FaceCard({
  face,
  selected,
  generating,
  onClick,
  rank,
}: {
  face: FaceType;
  selected: boolean;
  generating: boolean;
  onClick: () => void;
  rank: number;
}) {
  const matchStyle = getMatchColor(face.match);
  const confColor = getConfidenceColor(face.confidence);

  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer group overflow-hidden"
      style={{
        background: "#0a1220",
        border: selected
          ? "1px solid rgba(0,212,255,0.7)"
          : "1px solid rgba(0,180,240,0.12)",
        boxShadow: selected
          ? "0 0 18px rgba(0,212,255,0.25), inset 0 0 12px rgba(0,212,255,0.04)"
          : "none",
        transition: "all 0.2s ease",
        borderRadius: 2,
      }}
    >
      {/* Scanlines overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 3px)",
        }}
      />

      {/* Active scan bar */}
      <ScanBar active={generating} />

      {/* Rank badge */}
      <div
        className="absolute top-2 left-2 z-20 flex items-center justify-center"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          color: selected ? "#00d4ff" : "#4e6a8a",
          letterSpacing: "0.05em",
        }}
      >
        #{rank.toString().padStart(2, "0")}
      </div>

      {/* Corner brackets on hover/selected */}
      <div
        style={{
          opacity: selected ? 1 : 0,
          transition: "opacity 0.2s",
        }}
        className="group-hover:opacity-100"
      >
        <CornerBracket position="tl" />
        <CornerBracket position="tr" />
        <CornerBracket position="bl" />
        <CornerBracket position="br" />
      </div>

      {/* Image */}
      <div className="relative" style={{ aspectRatio: "4/5", background: "#070c18" }}>
        {generating ? (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "#070c18" }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  border: "2px solid rgba(0,212,255,0.15)",
                  borderTop: "2px solid #00d4ff",
                  animation: "spin 0.8s linear infinite",
                  margin: "0 auto 8px",
                }}
              />
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 8,
                  color: "#4e6a8a",
                  letterSpacing: "0.1em",
                }}
              >
                PROCESSING
              </div>
            </div>
          </div>
        ) : (
          <img
         src={face.url.startsWith('data:') ? face.url : `data:image/jpeg;base64,${face.url}`}
        alt={`Generated candidate ${face.candidateId}`}
        className="w-full h-full object-cover"
        style={{ display: "block" }}
        onError={(e) => {
          console.error("Image render error!");}}

          />
        )}

        {/* Image overlay gradient */}
        {!generating && (
          <div
            className="absolute inset-x-0 bottom-0"
            style={{
              height: "50%",
              background: "linear-gradient(to top, rgba(7,9,15,0.85) 0%, transparent 100%)",
            }}
          />
        )}

        {/* Confidence badge */}
        {!generating && (
          <div
            className="absolute bottom-2 left-0 right-0 px-2 flex items-end justify-between z-20"
          >
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 8,
                color: "#4e6a8a",
                letterSpacing: "0.05em",
              }}
            >
              {face.candidateId}
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                fontWeight: 600,
                color: confColor,
                letterSpacing: "0.02em",
              }}
            >
              {face.confidence}%
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div
        className="flex items-center justify-between px-2 py-1.5"
        style={{ borderTop: "1px solid rgba(0,180,240,0.08)" }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 8,
            color: matchStyle.text,
            background: matchStyle.bg,
            border: `1px solid ${matchStyle.border}`,
            padding: "1px 5px",
            letterSpacing: "0.08em",
            borderRadius: 1,
          }}
        >
          {face.match}
        </div>

        {/* Confidence micro-bar */}
        <div
          style={{
            width: 40,
            height: 2,
            background: "rgba(255,255,255,0.06)",
            borderRadius: 1,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${face.confidence}%`,
              background: confColor,
              borderRadius: 1,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function AttributeRow({ attr, index }: { attr: (typeof ATTRIBUTES)[0]; index: number }) {
  const barColor = getConfidenceColor(attr.confidence);
  return (
    <div
      className="group"
      style={{
        padding: "8px 12px",
        borderBottom: "1px solid rgba(0,180,240,0.07)",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "rgba(0,180,240,0.04)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 8,
              color: "#00c8e8",
              background: "rgba(0,200,232,0.1)",
              border: "1px solid rgba(0,200,232,0.2)",
              padding: "1px 4px",
              letterSpacing: "0.06em",
              borderRadius: 1,
            }}
          >
            {attr.tag}
          </span>
          <span
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 11,
              color: "#4e6a8a",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {attr.label}
          </span>
        </div>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            color: barColor,
          }}
        >
          {attr.confidence}%
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div
          style={{
            flex: 1,
            height: 2,
            background: "rgba(255,255,255,0.05)",
            borderRadius: 1,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${attr.confidence}%`,
              background: `linear-gradient(90deg, ${barColor}88, ${barColor})`,
              borderRadius: 1,
              transition: "width 0.6s ease",
            }}
          />
        </div>
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 11,
            color: "#c8d8e8",
            minWidth: 90,
            textAlign: "right",
          }}
        >
          {attr.value}
        </span>
      </div>
    </div>
  );
}

export default function App() {
  const [prompt, setPrompt] = useState("bearded male, 30-35, serious face");
  const [generating, setGenerating] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const [selectedId, setSelectedId] = useState<number>(1);
  const [generatedFaces, setGeneratedFaces] = useState<FaceType[]>(initialFaces);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [sessionId] = useState("SID-2024-0618-A");
  const [tick, setTick] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const mapResponseToFaces = (data: any): FaceType[] => {
    const normalizeItem = (item: any, fallbackId: number): FaceType => {
      const metrics = item.metrics || item;
      const confidence = Number(metrics.confidence ?? metrics.confidence_score ?? 0);
      const candidateId = String(metrics.candidate_id ?? metrics.candidateId ?? metrics.id ?? `GEN-${fallbackId}`);
      const match =
        String(metrics.match ?? metrics.match_level ?? metrics.label ?? "MODERATE").toUpperCase();
      const normalizedMatch =
        match === "STRONG" || match === "HIGH" || match === "MODERATE" || match === "LOW"
          ? match
          : confidence >= 90
          ? "STRONG"
          : confidence >= 80
          ? "HIGH"
          : confidence >= 70
          ? "MODERATE"
          : "LOW";

      const imageBase64 =
        item.image_base64 ??
        item.imageBase64 ??
        metrics.image_base64 ??
        metrics.imageBase64 ??
        item.image ??
        metrics.image ??
        "";

      return {
        id: Number(item.id ?? fallbackId),
        url: imageBase64 ? `data:image/jpeg;base64,${imageBase64}` : "",
        confidence,
        candidateId,
        match: normalizedMatch,
      };
    };

    if (Array.isArray(data)) {
      return data.map((item, index) => normalizeItem(item, index + 1));
    }
    return [normalizeItem(data, 1)];
  };

const handleGenerateFaces = async () => {
    if (!prompt.trim() || generating) return;
    setGenerating(true);
    setShowResults(false);

    try {
      const response = await axios.post("http://127.0.0.1:8000/generate", { prompt });
      const apiData = response.data;
      
      console.log("Backend Se Aaya Data:", apiData); // Yeh browser console mein dikhega

      // 1. Ek safe array banate hain agar mapResponseToFaces fail ho jaye
      let newFaces: any[] = [];
      
      // Backend ke alag-alag patterns ko handle karne ke liye smart parse:
      const responseCandidates = apiData.candidates || apiData.images || (Array.isArray(apiData) ? apiData : []);
      const normalizedCandidates = Array.isArray(responseCandidates)
        ? responseCandidates.map((cand: any, idx: number) => {
            const imageValue =
              typeof cand === "string"
                ? cand
                : cand.image_base64 || cand.imageBase64 || cand.image || cand.url || "";
            return {
              ...(typeof cand === "object" && cand !== null ? cand : {}),
              image_base64: imageValue,
              id: cand?.id ?? cand?.candidateId ?? idx + 1,
            };
          })
        : [];
      setCandidates(normalizedCandidates);
      
      if (normalizedCandidates.length > 0) {
        newFaces = normalizedCandidates.map((cand: any, idx: number) => {
          return {
            id: idx + 1,
            url: `data:image/jpeg;base64,${cand.image_base64}`,
            confidence: apiData.metrics?.gender?.confidence || cand.confidence || 95,
            candidateId: cand.id || cand.candidateId || `GEN-${idx + 1}`,
            match: "STRONG",
          };
        });
      } else {
        // Agar candidates array nahi mila toh purane fallback function ko try karte hain
        try {
          // @ts-ignore
          newFaces = mapResponseToFaces(apiData);
        } catch (e) {
          console.error("Fallback mapper also failed", e);
        }
      }

      // 2. State merge logic (Aapka original logic jo ekdum perfect tha)
      setGeneratedFaces((previous) => {
        const base = previous.slice(0, 9);
        const merged = [...newFaces, ...base].map((face, idx) => ({
          ...face,
          id: idx + 1,
        }));
        return merged;
      });
    } catch (error) {
      console.error("Face generation failed", error);
    } finally {
      setGenerating(false);
    }
  };

  const selectedFace = generatedFaces.find((f) => f.id === selectedId) || generatedFaces[0];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "#07090f",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes scanBar {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          49% { opacity: 1; }
          50% { opacity: 0; }
          99% { opacity: 0; }
        }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,180,240,0.2); border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0,212,255,0.35); }
        textarea:focus { outline: none; }
        textarea::placeholder { color: #2d4860; }
      `}</style>

      {/* Top Bar */}
      <header
        style={{
          background: "#070b14",
          borderBottom: "1px solid rgba(0,180,240,0.12)",
          padding: "0 24px",
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 3,
              background: "rgba(0,212,255,0.08)",
              border: "1px solid rgba(0,212,255,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Crosshair size={15} color="#00d4ff" />
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: 15,
                fontWeight: 700,
                color: "#dde4ef",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                lineHeight: 1,
              }}
            >
              Witness Face Generator
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 8,
                color: "#2d5070",
                letterSpacing: "0.1em",
                marginTop: 2,
              }}
            >
              FORENSIC AI SYSTEM v4.1.2
            </div>
          </div>
        </div>

        {/* Center: Status */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#10b981",
                animation: "pulse 2s ease infinite",
              }}
            />
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                color: "#10b981",
                letterSpacing: "0.1em",
              }}
            >
              SYSTEM ONLINE
            </span>
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              color: "#2d5070",
              letterSpacing: "0.06em",
            }}
          >
            SESSION: {sessionId}
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              color: "#2d5070",
              letterSpacing: "0.06em",
            }}
          >
            {new Date().toISOString().slice(0, 10)} {" "}
            {String(new Date().getHours()).padStart(2, "0")}:
            {String(new Date().getMinutes()).padStart(2, "0")}:
            {String(new Date().getSeconds()).padStart(2, "0")}
            <span style={{ animation: "blink 1s step-end infinite" }}>_</span>
          </div>
        </div>

        {/* Right: System indicators */}
        <div className="flex items-center gap-4">
          {[
            { icon: <Cpu size={11} />, label: "GPU", value: "94%" },
            { icon: <Activity size={11} />, label: "NET", value: "12ms" },
            { icon: <Wifi size={11} />, label: "DB", value: "LIVE" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span style={{ color: "#2d5070" }}>{item.icon}</span>
              <div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 7,
                    color: "#2d5070",
                    letterSpacing: "0.08em",
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9,
                    color: "#00c8e8",
                    letterSpacing: "0.06em",
                  }}
                >
                  {item.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* Main content */}
      <div
        className="flex flex-1 overflow-hidden"
        style={{ minHeight: 0 }}
      >
        {/* Left: Main area */}
        <div
          className="flex flex-col flex-1 overflow-y-auto"
          style={{ padding: "20px 20px 20px 24px" }}
        >
          {/* Prompt area */}
          <div
            style={{
              background: "#0a1220",
              border: "1px solid rgba(0,180,240,0.14)",
              borderRadius: 3,
              padding: "14px 16px",
              marginBottom: 14,
            }}
          >
            <div
              className="flex items-center gap-2 mb-3"
              style={{ borderBottom: "1px solid rgba(0,180,240,0.08)", paddingBottom: 10 }}
            >
              <Eye size={12} color="#00c8e8" />
              <span
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#4e6a8a",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}
              >
                Witness Description Input
              </span>
              <div style={{ flex: 1 }} />
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 8,
                  color: "#2d5070",
                  letterSpacing: "0.06em",
                }}
              >
                {prompt.length}/512 chars
              </span>
            </div>

            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the subject: age, gender, hair, facial features, expression, distinguishing marks..."
              rows={3}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerateFaces();
              }}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                resize: "none",
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                color: "#c8d8e8",
                lineHeight: 1.6,
              }}
            />

            <div className="flex items-center justify-between mt-3">
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 8,
                  color: "#2d4860",
                  letterSpacing: "0.08em",
                }}
              >
                TIP: Ctrl+Enter to generate · Be as specific as possible for better results
              </div>

              <button
                onClick={handleGenerateFaces}
                disabled={generating || !prompt.trim()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 20px",
                  background: generating
                    ? "rgba(0,200,232,0.04)"
                    : "rgba(0,200,232,0.1)",
                  border: generating
                    ? "1px solid rgba(0,200,232,0.2)"
                    : "1px solid rgba(0,200,232,0.45)",
                  borderRadius: 2,
                  cursor: generating ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: generating
                    ? "none"
                    : "0 0 20px rgba(0,200,232,0.15), inset 0 0 12px rgba(0,200,232,0.04)",
                }}
                onMouseEnter={(e) => {
                  if (!generating) {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 0 30px rgba(0,200,232,0.3), inset 0 0 16px rgba(0,200,232,0.08)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(0,200,232,0.16)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!generating) {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 0 20px rgba(0,200,232,0.15), inset 0 0 12px rgba(0,200,232,0.04)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(0,200,232,0.1)";
                  }
                }}
              >
                {generating ? (
                  <div
                    style={{
                      width: 13,
                      height: 13,
                      borderRadius: "50%",
                      border: "1.5px solid rgba(0,200,232,0.2)",
                      borderTop: "1.5px solid #00c8e8",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                ) : (
                  <Target size={13} color="#00c8e8" />
                )}
                <span
                  style={{
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#00c8e8",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                  }}
                >
                  {generating ? "Generating..." : "Generate Faces"}
                </span>
              </button>
            </div>
          </div>

          {/* Results header */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className="flex items-center gap-2"
              style={{ flex: 1 }}
            >
              <Layers size={11} color="#4e6a8a" />
              <span
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#4e6a8a",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}
              >
                FORENSIC COMPOSITE SKETCH
              </span>
              <div
                style={{
                  width: 1,
                  height: 12,
                  background: "rgba(0,180,240,0.15)",
                  margin: "0 4px",
                }}
              />
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9,
                  color: generating ? "#f59e0b" : showResults ? "#10b981" : "#4e6a8a",
                  letterSpacing: "0.08em",
                }}
              >
                {generating ? "● PROCESSING" : showResults ? `● ${generatedFaces.length} MATCHES FOUND` : "● AWAITING INPUT"}
              </span>
            </div>
            {showResults && (
              <button
                onClick={handleGenerateFaces}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  background: "transparent",
                  border: "1px solid rgba(0,180,240,0.12)",
                  borderRadius: 2,
                  padding: "4px 10px",
                  cursor: "pointer",
                }}
              >
                <RefreshCw size={10} color="#4e6a8a" />
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9,
                    color: "#4e6a8a",
                    letterSpacing: "0.08em",
                  }}
                >
                  REFRESH
                </span>
              </button>
            )}
          </div>

          {/* Face Grid: 2 columns × 5 rows */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 10,
            }}
          >
            {candidates[0] ? (
              <div
                className="relative overflow-hidden"
                style={{
                  background: "#0a1220",
                  border: "1px solid rgba(0,180,240,0.12)",
                  borderRadius: 2,
                  position: "relative",
                }}
              >
                <div
                  className="relative"
                  style={{ aspectRatio: "4/5", background: "#070c18" }}
                >
                  <img
                    src={`data:image/jpeg;base64,${candidates[0].image_base64}`}
                    alt="Forensic Composite Sketch"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      imageRendering: "pixelated",
                    }}
                  />
                </div>

                <div
                  style={{
                    position: "absolute",
                    bottom: 12,
                    left: 12,
                    right: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    color: "#c8d8e8",
                  }}
                >
                  <span>
                    {candidates[0].candidate_id || candidates[0].candidateId || "PRIMARY COMPOSITE"}
                  </span>
                  <span>{candidates[0].confidence ? `${candidates[0].confidence}%` : "—"}</span>
                </div>
              </div>
            ) : (
              <div
                className="relative overflow-hidden"
                style={{
                  background: "#0a1220",
                  border: "1px dashed rgba(0,180,240,0.2)",
                  borderRadius: 2,
                  minHeight: 260,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 20,
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                    color: "#4e6a8a",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12,
                    lineHeight: 1.5,
                  }}
                >
                  No forensic composite sketch yet.<br />
                  Generate a new prompt to create the primary sketch.
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 8,
              color: "#1e3a52",
              textAlign: "center",
              marginTop: 14,
              letterSpacing: "0.08em",
            }}
          >
            FORENSIC AI SYSTEM · RESULTS ARE PROBABILISTIC ESTIMATES ONLY · NOT ADMISSIBLE AS SOLE EVIDENCE
          </div>
        </div>

        {/* Right Panel */}
        <div
          style={{
            width: 300,
            flexShrink: 0,
            background: "#070b14",
            borderLeft: "1px solid rgba(0,180,240,0.1)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Panel header */}
          <div
            style={{
              padding: "14px 16px 12px",
              borderBottom: "1px solid rgba(0,180,240,0.1)",
              flexShrink: 0,
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 size={12} color="#00c8e8" />
              <span
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#4e6a8a",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                }}
              >
                Attribute Analysis
              </span>
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 8,
                color: "#2d4860",
                letterSpacing: "0.06em",
              }}
            >
              EXTRACTED FROM PROMPT · NLP MODEL v3.2
            </div>
          </div>

          {/* Attributes list */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {ATTRIBUTES.map((attr, i) => (
              <AttributeRow key={attr.tag} attr={attr} index={i} />
            ))}
          </div>

          {/* Rankings section */}
          <div
            style={{
              borderTop: "1px solid rgba(0,180,240,0.1)",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                padding: "12px 16px 8px",
                borderBottom: "1px solid rgba(0,180,240,0.07)",
              }}
            >
              <div className="flex items-center gap-2">
                <Shield size={11} color="#00c8e8" />
                <span
                  style={{
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#4e6a8a",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                  }}
                >
                  Top Rankings
                </span>
              </div>
            </div>

            <div style={{ padding: "6px 0" }}>
              {generatedFaces.slice(0, 5).map((face, idx) => {
                const isSelected = selectedId === face.id;
                const confColor = getConfidenceColor(face.confidence);
                return (
                  <div
                    key={face.id}
                    onClick={() => setSelectedId(face.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "6px 16px",
                      cursor: "pointer",
                      background: isSelected ? "rgba(0,200,232,0.06)" : "transparent",
                      borderLeft: isSelected
                        ? "2px solid #00c8e8"
                        : "2px solid transparent",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected)
                        (e.currentTarget as HTMLElement).style.background =
                          "rgba(0,180,240,0.03)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected)
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 9,
                        color: isSelected ? "#00c8e8" : "#2d5070",
                        width: 14,
                        textAlign: "right",
                        flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </span>

                    <div
                      style={{
                        width: 28,
                        height: 34,
                        borderRadius: 1,
                        overflow: "hidden",
                        flexShrink: 0,
                        background: "#0a1220",
                        border: isSelected
                          ? "1px solid rgba(0,212,255,0.4)"
                          : "1px solid rgba(0,180,240,0.1)",
                      }}
                    >
                      <img
                        src={face.url}
                        alt={face.candidateId}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 9,
                          color: isSelected ? "#c8d8e8" : "#4e6a8a",
                          letterSpacing: "0.04em",
                          marginBottom: 3,
                        }}
                      >
                        {face.candidateId}
                      </div>
                      <div
                        style={{
                          height: 2,
                          background: "rgba(255,255,255,0.05)",
                          borderRadius: 1,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${face.confidence}%`,
                            background: confColor,
                            borderRadius: 1,
                          }}
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 10,
                        fontWeight: 600,
                        color: confColor,
                        flexShrink: 0,
                      }}
                    >
                      {face.confidence}%
                    </div>

                    <ChevronRight
                      size={10}
                      color={isSelected ? "#00c8e8" : "#2d5070"}
                      style={{ flexShrink: 0 }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Selected candidate detail */}
            {showResults && (
              <div
                style={{
                  margin: "8px 12px 12px",
                  background: "rgba(0,200,232,0.04)",
                  border: "1px solid rgba(0,200,232,0.12)",
                  borderRadius: 2,
                  padding: "10px 12px",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <User size={10} color="#00c8e8" />
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 8,
                      color: "#00c8e8",
                      letterSpacing: "0.1em",
                    }}
                  >
                    ACTIVE CANDIDATE
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    style={{
                      width: 40,
                      height: 50,
                      borderRadius: 2,
                      overflow: "hidden",
                      border: "1px solid rgba(0,212,255,0.3)",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={selectedFace.url}
                      alt={selectedFace.candidateId}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "'Rajdhani', sans-serif",
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#dde4ef",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {selectedFace.candidateId}
                    </div>
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 18,
                        fontWeight: 600,
                        color: getConfidenceColor(selectedFace.confidence),
                        lineHeight: 1.2,
                      }}
                    >
                      {selectedFace.confidence}%
                    </div>
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 8,
                        color: getMatchColor(selectedFace.match).text,
                        letterSpacing: "0.08em",
                        marginTop: 2,
                      }}
                    >
                      {selectedFace.match} MATCH
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Warning */}
            <div
              className="flex items-start gap-2"
              style={{
                padding: "8px 12px 12px",
                borderTop: "1px solid rgba(0,180,240,0.07)",
              }}
            >
              <AlertTriangle size={10} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 9,
                  color: "#2d4860",
                  lineHeight: 1.5,
                }}
              >
                Results are AI-generated approximations. Verify with human witnesses before acting on these results.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
