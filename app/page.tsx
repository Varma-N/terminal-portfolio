"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";

const IDCard3D = dynamic(() => import("./components/IDCard3D"), { ssr: false });

const ASCII_VARMA = `
   _    __                                  _   __                  __ _ 
  | |  / /____ _ _____ ____ ___   ____ _   / | / /____ _ ____  ____/ /(_)
  | | / // __ \`// ___// __ \`__ \\ / __ \`/  /  |/ // __ \`// __ \\/ __  // / 
  | |/ // /_/ // /   / / / / / // /_/ /  / /|  // /_/ // / / / /_/ // /  
  |___/ \\__,_//_/   /_/ /_/ /_/ \\__,_/  /_/ |_/ \\__,_//_/ /_/\\__,_//_/   
`;

const COMMANDS = ["help", "about", "projects", "skills", "certs", "stats", "clear"];

interface HistoryItem {
  id: string;
  cmd: string;
  output: string;
}

export default function Home() {
  const [timeStr, setTimeStr] = useState<string>("");
  const [inputVal, setInputVal] = useState<string>("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const hasWelcomeRun = useRef(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Live system clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleDateString("en-CA") +
          " " +
          now.toLocaleTimeString("en-US", { hour12: false })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Run initial welcome typewriter once on mount
  useEffect(() => {
    if (hasWelcomeRun.current) return;
    hasWelcomeRun.current = true;

    const welcomeMsg =
      "Hi, I'm Nandi Madan Gopal Varma, a Data Science and Engineering professional.\nWelcome to my interactive portfolio!\nType 'help' to explore my profile, projects, skills, and certifications.";
    runTypewriter("welcome", welcomeMsg);
  }, []);

  // Auto-scroll and keep input focused smoothly
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    inputRef.current?.focus();
  }, [history, isTyping]);

  const runTypewriter = (cmdText: string, fullText: string) => {
    setIsTyping(true);
    const itemId = Math.random().toString();
    setHistory((prev) => [...prev, { id: itemId, cmd: cmdText, output: "" }]);

    let index = 0;
    const timer = setInterval(() => {
      index += 3;
      if (index >= fullText.length) {
        setHistory((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, output: fullText } : item
          )
        );
        setIsTyping(false);
        clearInterval(timer);
        setTimeout(() => inputRef.current?.focus(), 10);
      } else {
        const slice = fullText.slice(0, index);
        setHistory((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, output: slice } : item
          )
        );
      }
    }, 20);
  };

  const handleCommand = (cmd: string) => {
    if (isTyping) return;
    const cleanCmd = cmd.trim().toLowerCase();
    if (!cleanCmd) return;

    if (cleanCmd === "clear") {
      setHistory([]);
      setInputVal("");
      setHistoryIndex(-1);
      setTimeout(() => inputRef.current?.focus(), 10);
      return;
    }

    setCmdHistory((prev) => [...prev, cleanCmd]);
    setHistoryIndex(-1);

    let output = "";
    switch (cleanCmd) {
      case "help":
        output =
          "Available commands:\n  • about     - Profile summary\n  • skills    - Technical capabilities\n  • projects  - Recent engineering work\n  • certs     - Certifications\n  • stats     - System status\n  • clear     - Clear terminal history";
        break;
      case "about":
        output =
          "Nandi Madan Gopal Varma — Technology professional at ANZ with experience in Python automation, data validation, analytics, and hands-on machine learning projects.";
        break;
      case "skills":
        output =
          "Programming: Python, SQL, Java fundamentals.\nData & ML: Pandas, NumPy, Scikit-learn, XGBoost, data preprocessing, classification, predictive modelling, data validation.\nPlatforms & Tools: Google BigQuery, GCP, MySQL, SQLite, Excel, Tableau, Power BI, Flask, Streamlit, Docker, REST APIs, Git, GitHub, Jupyter, Jira, Confluence.";
        break;
      case "projects":
        output =
          "1. Predictive Maintenance — Python, XGBoost, Scikit-learn, Streamlit, Docker.\n2. EV Fleet Monitoring — Flask, SQLite, Pandas, Random Forest, OpenChargeMap API; prototype using simulated station data.\n3. ETL Superstore Pipeline — Python, SQL, MySQL, Pandas, Power BI; idempotent processing and data-quality checks.\n4. Tech Stack Visualizer — automated repository language visuals with GitHub Actions.\nTech Stack Visualizer: https://github.com/Varma-N/Tech-Stack-Visualizer\nETL Pipeline: https://github.com/Varma-N/ETL_Superstore_pipeline\nPredictive Maintenance: https://github.com/Varma-N/Predictive-Maintenance-for-IoT-Connected-Manufacturing-Systems\nEV Fleet: https://github.com/Varma-N/Real-Time-EV-Monitoring-And-Predictive-Analytics-Solution";
        break;
      case "certs":
        output =
          "• [Google Cloud Associate Cloud Engineer](https://www.credly.com/badges/6605e53c-cdf1-4834-9744-bdf2a18f178f/public_url)\n\n" +
          "• [Google Cloud Professional Data Engineer](https://www.credly.com/badges/0f82e32b-7d47-4d17-afc7-dedb7b986b73/public_url)\n\n" +
          "• [Credly Profile](https://www.credly.com/users/madan-nandi)";
        break;
      case "stats":
        output =
          "Current role: Data Analyst Apprentice, ANZ (Jan 2026–Present).\nAchievement: Python automation reduced manual effort by 96%.\nFocus: Data science, machine learning, analytics, and dependable automation.";
        break;
      default:
        output = `command not found: "${cleanCmd}". Type 'help' for available actions.`;
    }

    setInputVal("");
    runTypewriter(cleanCmd, output);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const current = inputVal.trim().toLowerCase();
      if (!current) return;
      const match = COMMANDS.find((c) => c.startsWith(current));
      if (match) {
        setInputVal(match);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIndex =
        historyIndex === -1 ? cmdHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInputVal(cmdHistory[nextIndex] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (cmdHistory.length === 0 || historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= cmdHistory.length) {
        setHistoryIndex(-1);
        setInputVal("");
      } else {
        setHistoryIndex(nextIndex);
        setInputVal(cmdHistory[nextIndex] || "");
      }
    }
  };

  return (
    <main className="flex h-screen w-screen flex-col bg-[#050608] font-mono text-[#00ff66] overflow-hidden select-none">
      {/* HEADER */}
      <header className="flex items-center justify-between border-b border-[#00ff66]/20 px-8 py-3 shrink-0">
        <div>
          <pre className="text-[9px] sm:text-[11px] leading-tight text-[#22d3ee] font-bold whitespace-pre drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
            {ASCII_VARMA}
          </pre>
          <p className="mt-1 text-[11px] text-[#71717a] tracking-widest uppercase">
            DATA SCIENCE & ENGINEERING // PORTFOLIO
          </p>
        </div>

        <div className="text-right">
          <div className="flex items-center justify-end gap-2 text-xs text-[#22d3ee]">
            <span className="inline-block h-2 w-2 rounded-full bg-[#22d3ee] animate-pulse" />
            <span className="tracking-wide">SYS_ONLINE</span>
          </div>
          <div className="mt-1 text-xs text-[#71717a]">{timeStr}</div>
        </div>
      </header>

      {/* WORKSPACE */}
      <div className="flex flex-1 flex-row overflow-hidden min-h-0">
        {/* Left Side: 3D ID Card */}
        <section className="relative h-full w-5/12 min-h-[500px] border-r border-[#00ff66]/20 shrink-0">
          <div className="absolute inset-0 h-full w-full">
            <IDCard3D />
          </div>
          <span className="absolute bottom-3 left-4 text-[10px] text-[#3f3f46] tracking-wider pointer-events-none">
            [INTERACTIVE 3D BADGE — DRAG TO TILT]
          </span>
        </section>

        {/* Right Side: Terminal */}
        <section
          onClick={() => inputRef.current?.focus()}
          className="relative flex flex-1 flex-col overflow-y-auto bg-[#07080c]/80 cursor-text select-text"
        >
          {/* FROZEN TOP OPTIONS BAR */}
          <div className="sticky top-0 z-20 flex items-center gap-2 px-8 py-4 bg-[#07080c] border-b border-[#00ff66]/15 flex-wrap shrink-0 select-none">
            {COMMANDS.map((btn) => (
              <button
                key={btn}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCommand(btn);
                }}
                className="rounded-full border border-[#22d3ee]/40 bg-[#0c1222]/60 px-4 py-1 text-xs text-[#22d3ee] hover:bg-[#22d3ee]/20 hover:border-[#22d3ee] transition-colors cursor-pointer"
              >
                {btn}
              </button>
            ))}
          </div>

          {/* Terminal Logs & Output */}
          <div className="p-8 space-y-4 text-xs sm:text-sm leading-relaxed">
            {history.map((item) => (
              <div key={item.id} className="space-y-1">
                {/* Prompt in cyan, command in green */}
                <div className="text-xs text-[#22d3ee]">
                  varma@portfolio:~$ <span className="text-[#00ff66] font-semibold">{item.cmd}</span>
                </div>
                {/* Output/Answer in crisp white with Markdown Link Parsing */}
                {item.output && (
                  <div className="text-xs text-[#f4f4f5] whitespace-pre-line pl-2 leading-relaxed">
                    {item.output.split(/(\[[^\]]+\]\([^)]+\))/g).map((part, i) => {
                      // Check if the current segment is a fully formed markdown link
                      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
                      if (linkMatch) {
                        return (
                          <a
                            key={i}
                            href={linkMatch[2]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#22d3ee] underline hover:text-[#00ff66] transition-colors cursor-pointer relative z-10"
                          >
                            {linkMatch[1]}
                          </a>
                        );
                      }
                      // Otherwise, render the plain text (including partial links while typing)
                      return <span key={i}>{part}</span>;
                    })}
                  </div>
                )}
              </div>
            ))}

            {/* Active Command Input Line */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCommand(inputVal);
              }}
              className="flex items-center gap-2 pt-1"
            >
              <span className="text-xs text-[#22d3ee] shrink-0 select-none">
                varma@portfolio:~$
              </span>

              {/* Input keeps focus uninterrupted */}
              <div className="relative inline-flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  autoComplete="off"
                  spellCheck="false"
                  className="bg-transparent text-xs text-[#00ff66] font-semibold outline-none border-none font-mono caret-transparent p-0 m-0 w-auto min-w-[2px]"
                  style={{ width: `${Math.max(1, inputVal.length)}ch` }}
                />
                {/* Binary step-blink block cursor */}
                <span className="cursor-blink inline-block w-[8px] h-[15px] bg-[#00ff66] shrink-0 ml-[1px]" />
              </div>
            </form>

            <div ref={terminalEndRef} />
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="flex items-center justify-between border-t border-[#00ff66]/20 px-8 py-2 text-[11px] text-[#71717a] shrink-0">
        <div>varma@portfolio:~$</div>
        <div className="text-[#3f3f46]">SYS_READY</div>
      </footer>
    </main>
  );
}