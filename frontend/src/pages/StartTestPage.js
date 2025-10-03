import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const StartTestPage = () => {
  const location = useLocation();

  // ✅ Safe destructuring from navigation state
  const { code = "" } = location.state || {};

  const [result, setResult] = useState("Results will appear here…");
  const [skulptReady, setSkulptReady] = useState(false);

  // ✅ Load Skulpt dynamically
  useEffect(() => {
    const loadSkulpt = async () => {
      try {
        if (window.Sk) {
          setSkulptReady(true);
          return;
        }

        await Promise.all([
          new Promise((resolve) => {
            if (!document.getElementById("skulpt-main")) {
              const script1 = document.createElement("script");
              script1.id = "skulpt-main";
              script1.src =
                "https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt.min.js";
              script1.onload = resolve;
              document.body.appendChild(script1);
            } else {
              resolve();
            }
          }),
          new Promise((resolve) => {
            if (!document.getElementById("skulpt-lib")) {
              const script2 = document.createElement("script");
              script2.id = "skulpt-lib";
              script2.src =
                "https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt-stdlib.js";
              script2.onload = resolve;
              document.body.appendChild(script2);
            } else {
              resolve();
            }
          }),
        ]);

        setSkulptReady(true);
      } catch (err) {
        console.error("❌ Failed to load Skulpt:", err);
        setResult(
          '<div style="color:#ef4444;">❌ Failed to load Skulpt library.</div>'
        );
      }
    };

    loadSkulpt();
  }, []);

  // ✅ Skulpt file loader
  function builtinRead(x) {
    if (
      window.Sk.builtinFiles === undefined ||
      window.Sk.builtinFiles["files"][x] === undefined
    ) {
      throw new Error(`File not found: '${x}'`);
    }
    return window.Sk.builtinFiles["files"][x];
  }

  // ✅ Analyze function
  const analyze = () => {
    if (!skulptReady) {
      setResult('<div style="color:#f87171;">⚠ Skulpt not loaded yet!</div>');
      return;
    }

    if (!code.trim()) {
      setResult('<div style="color:#f87171;">⚠ No code provided.</div>');
      return;
    }

    setResult("🔍 Analyzing…");

    try {
      window.Sk.configure({ output: () => {}, read: builtinRead });

      window.Sk.misceval
        .asyncToPromise(() =>
          window.Sk.importMainWithBody("<stdin>", false, code, true)
        )
        .then(() => {
          let output =
            '<div style="color:#10b981;font-weight:bold;">✔ No syntax/runtime errors detected.</div>';

          // ✅ Suggestions
          if (!/print\s*\(/.test(code)) {
            output +=
              '<div style="color:#fbbf24;">⚠ Suggestion: No print statements found. Did you forget to output something?</div>';
          }
          if (/==/.test(code) && !/===/.test(code)) {
            output +=
              '<div style="color:#fbbf24;">⚠ Suggestion: Consider stricter comparisons.</div>';
          }

          setResult(output);
        })
        .catch((err) => {
          setResult(
            `<div style="color:#ef4444;">❌ Error: ${err.message || err.toString()}</div>`
          );
        });
    } catch (err) {
      setResult(
        `<div style="color:#ef4444;">❌ Error: ${err.message || err.toString()}</div>`
      );
    }
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        background: "#0f172a",
        color: "#e5e7eb",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h2 style={{ marginBottom: "10px" }}>Python Code Analyzer</h2>
        <p style={{ color: "#94a3b8", marginBottom: "20px" }}>
          Submitted code is shown below. Click <b>Start Test</b> to analyze it.
        </p>

        <textarea
          value={code}
          readOnly
          style={{
            width: "100%",
            minHeight: "300px",
            background: "#0a1020",
            color: "#e2e8f0",
            border: "1px solid #1f2937",
            borderRadius: "8px",
            padding: "12px",
            fontFamily: "monospace",
            fontSize: "14px",
          }}
        />

        <br />
        <button
          onClick={analyze}
          disabled={!skulptReady}
          style={{
            background: skulptReady ? "#22d3ee" : "#6b7280",
            color: "#021522",
            padding: "10px 16px",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            marginTop: "12px",
            cursor: skulptReady ? "pointer" : "not-allowed",
          }}
        >
          ▶ Start Test
        </button>

        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            background: "#111827",
            borderRadius: "8px",
            border: "1px solid #1f2937",
            minHeight: "100px",
          }}
          dangerouslySetInnerHTML={{ __html: result }}
        />
      </div>
    </div>
  );
};

export default StartTestPage;
