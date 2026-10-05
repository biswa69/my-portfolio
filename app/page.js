import Story from "../components/Story";
import Cases from "../components/Cases";
import Skills from "../components/Skills";

const kpis = [
  { v: "~2 days → ~5 min", l: "Client cohort analysis turnaround", big: true },
  { v: "90,000+", l: "Policies migrated · ~40 data points" },
  { v: "3,000+", l: "Daily inbound leads in AI voice bot pilot" },
  { v: "Rs. 100 Cr", l: "Series-A fundraise supported with analysis" },
];

const chain = [
  { k: "User", v: "Leads and clients, including offline RM-assisted journeys" },
  { k: "Behavior", v: "Tracked through LSQ activity definitions" },
  { k: "Metric", v: "Revenue, GWP and entity type" },
  { k: "Insight", v: "Which leads deserve which relationship coverage" },
  { k: "Decision", v: "RM allocation logic across India" },
];

export default function Home() {
  return (
    <>
      <header className="nav">
        <a href="#top" className="brand">Biswajit Saha</a>
        <nav>
          <a href="#story">Story</a>
          <a href="#work">Case studies</a>
          <a href="#product">Product thinking</a>
          <a href="#skills">Skills</a>
          <a href="#experience">Experience</a>
          <a href="#contact" className="cta">Contact</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">DATA <span>×</span> PRODUCT <span>×</span> BUSINESS</p>
            <h1>Biswajit Saha</h1>
            <p className="lead">
              Building data-driven systems that turn complex business problems into actionable decisions.
            </p>
            <p className="sub">
              Business Analyst (Product &amp; Analytics) at BimaKavach. MCA in Data Science. I use SQL, Power BI, Metabase and
              automation to understand problems, build systems and help teams decide faster.
            </p>
            <div className="actions">
              <a className="btn primary" href="#work">See the work</a>
              <a className="btn" href="#contact">Get in touch</a>
            </div>
          </div>

          <aside className="panel" aria-label="Impact snapshot">
            <div className="panel-head"><span>Impact snapshot</span><em>BimaKavach · Nov 2025 – Present</em></div>
            <div className="kpis">
              {kpis.map((k) => (
                <div key={k.l} className={k.big ? "kpi big" : "kpi"}>
                  <strong>{k.v}</strong>
                  <span>{k.l}</span>
                </div>
              ))}
            </div>
            <div className="bars" aria-hidden="true">
              <div><label>Before</label><i style={{ width: "100%" }} /><b>~2 days</b></div>
              <div><label>After</label><i className="after" style={{ width: "4%" }} /><b>~5 min</b></div>
            </div>
          </aside>
        </section>

        <section id="story" className="sec">
          <h2>From raw data to impact</h2>
          <p className="sec-sub">Data isn&rsquo;t just something I analyze. I use it to understand problems, build systems, and help businesses make better decisions.</p>
          <Story />
        </section>

        <section id="work" className="sec">
          <h2>Case studies</h2>
          <p className="sec-sub">Business impact first, tools second.</p>
          <Cases />
        </section>

        <section id="product" className="sec">
          <h2>Product thinking</h2>
          <p className="sec-sub">How I connect analysis to decisions, shown with RM allocation work.</p>
          <ol className="chain">
            {chain.map((c, n) => (
              <li key={c.k}>
                <span className="n">{n + 1}</span>
                <b>{c.k}</b>
                <p>{c.v}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="skills" className="sec">
          <h2>Skills ecosystem</h2>
          <p className="sec-sub">How the pieces connect, not how many percent of each I know.</p>
          <Skills />
        </section>

        <section id="experience" className="sec">
          <h2>Experience &amp; education</h2>
          <div className="timeline">
            <div className="role">
              <div className="when">Nov 2025 – Present</div>
              <h3>Business Analyst (Product &amp; Analytics) <small>BimaKavach, Bengaluru</small></h3>
              <ul>
                <li>Drove a 0-to-1 Greylabs AI voice bot pilot qualifying 3,000+ daily inbound leads; optimized auto-dialer workflows with queue management, prioritization and CRM handoffs.</li>
                <li>Led company-level financial and operational metric analysis supporting a Rs. 100 Cr Series-A fundraise.</li>
                <li>Engineered an automated client cohort analysis framework: ~2 days to ~5 minutes.</li>
                <li>Led end-to-end migration of 90,000+ policies across ~40 data points to Vaatun for 12K direct and 40K partner clients.</li>
                <li>Defined LSQ activity tracking for offline RM-assisted journeys; owned RM allocation logic across India (entity type, revenue, GWP).</li>
                <li>Built centralized Power BI and Metabase dashboards for operational and financial KPIs.</li>
              </ul>
            </div>
            <div className="role">
              <div className="when">Nov 2023 – Nov 2025</div>
              <h3>MCA, Data Science <small>Presidency College (Autonomous), Bengaluru</small></h3>
            </div>
            <div className="role">
              <div className="when">Oct 2019 – Oct 2022</div>
              <h3>BCA <small>Royal Global University, Guwahati</small></h3>
            </div>
          </div>

          <h3 className="sub-h">Also built</h3>
          <div className="mini">
            <div>
              <b>SmartShelf — semantic book recommender</b>
              <p>AI recommendation engine mapping user emotional cues to book embeddings across 10k+ titles. Top-5 precision up 12+ pts in offline evals; median latency under 300ms. Python, HuggingFace, LangChain, Gradio.</p>
            </div>
            <div>
              <b>Leadership &amp; mentoring</b>
              <p>Mentored students for 5+ years at Northeast India&rsquo;s largest interschool IT fest and conceptualized Technophilia, an inter-university IT fest.</p>
            </div>
          </div>
        </section>

        <section id="contact" className="sec contact">
          <h2>Let&rsquo;s talk</h2>
          <p className="sec-sub">Open to Data, Product, Business and BI Analyst roles.</p>
          <div className="actions">
            <a className="btn primary" href="mailto:biswajit2001june@gmail.com">biswajit2001june@gmail.com</a>
            <a className="btn" href="https://linkedin.com/in/biswajit-saha" target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </section>
      </main>
      <footer className="foot">© {new Date().getFullYear()} Biswajit Saha</footer>
    </>
  );
}
