import Nav from "../components/Nav";
import DataField from "../components/DataField";
import Rotator from "../components/Rotator";
import Counter from "../components/Counter";
import Marquee from "../components/Marquee";
import Story from "../components/Story";
import Cases from "../components/Cases";
import Skills from "../components/Skills";

const chain = [
  { k: "User", v: "Leads and clients, including offline RM-assisted journeys" },
  { k: "Behavior", v: "Tracked by defining LSQ activity" },
  { k: "Metric", v: "Entity type, revenue and GWP" },
  { k: "Insight", v: "Which leads deserve which relationship coverage" },
  { k: "Decision", v: "RM allocation logic across India" },
];

const Word = ({ text, base = 0 }) => (
  <span className="word">
    {[...text].map((c, i) => (
      <span className="ch" key={i} style={{ "--i": base + i }}>{c}</span>
    ))}
  </span>
);

export default function Home() {
  return (
    <>
      <div className="ambient" aria-hidden="true"><i /><i /><i /></div>
      <Nav />

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow rv" style={{ "--d": "0s" }}>
              <b>DATA</b><em>×</em><b>PRODUCT</b><em>×</em><b>BUSINESS</b>
            </p>
            <h1 aria-label="Biswajit Saha">
              <span className="line" aria-hidden="true"><Word text="Biswajit" /></span>
              <span className="line" aria-hidden="true"><Word text="Saha" base={8} /></span>
            </h1>
            <p className="lead rv" style={{ "--d": ".55s" }}>
              Building data-driven systems that turn complex business problems into actionable decisions.
            </p>
            <div className="rv" style={{ "--d": ".7s" }}><Rotator /></div>
            <p className="sub rv" style={{ "--d": ".85s" }}>
              Business Analyst (Product &amp; Analytics) at BimaKavach. MCA in Data Science, pivoting into Product Management,
              Product Analytics and Business Intelligence.
            </p>
            <div className="actions rv" style={{ "--d": "1s" }}>
              <a className="btn btn-primary" href="#work"><span>See the work</span></a>
              <a className="btn btn-secondary" href="#contact"><span>Get in touch</span></a>
            </div>
          </div>
          <div className="hero-vis rv" style={{ "--d": ".4s" }}>
            <DataField />
          </div>
          <a href="#kpis" className="scroll-hint" aria-label="Scroll to results"><span /></a>
        </section>

        <section id="kpis" className="kpis" aria-label="Results at a glance">
          <div className="kpi race-kpi glow" data-reveal>
            <p className="k-l">Client cohort analysis turnaround</p>
            <div className="k-v"><s>~2 days</s> <i>→</i> <strong>~5 min</strong></div>
            <div className="race" aria-hidden="true">
              <span className="lane"><i className="slow" /></span>
              <span className="lane"><i className="fast" /></span>
            </div>
          </div>
          <div className="kpi glow" data-reveal style={{ "--d": ".1s" }}>
            <p className="k-v"><strong><Counter to={90000} suffix="+" /></strong></p>
            <p className="k-l">Policies migrated across ~40 data points</p>
          </div>
          <div className="kpi glow" data-reveal style={{ "--d": ".2s" }}>
            <p className="k-v"><strong><Counter to={3000} suffix="+" /></strong></p>
            <p className="k-l">Daily inbound leads in the AI voice bot pilot</p>
          </div>
          <div className="kpi glow" data-reveal style={{ "--d": ".3s" }}>
            <p className="k-v"><strong><Counter to={100} prefix="Rs. " suffix=" Cr" /></strong></p>
            <p className="k-l">Series-A fundraise supported with analysis</p>
          </div>
        </section>

        <Marquee />

        <section id="story" className="sec">
          <div className="sec-head" data-reveal>
            <p className="sec-k">01 · The story</p>
            <h2>From raw data to <em>impact</em></h2>
            <p className="sec-sub">Data isn&rsquo;t just something I analyze. I use it to understand problems, build systems, and help businesses make better decisions.</p>
          </div>
          <Story />
        </section>

        <section id="work" className="sec">
          <div className="sec-head" data-reveal>
            <p className="sec-k">02 · Case studies</p>
            <h2>Business impact first, <em>tools second</em></h2>
            <p className="sec-sub">Each study shows the problem, what I did, and what changed.</p>
          </div>
          <div data-reveal><Cases /></div>
        </section>

        <section id="product" className="sec">
          <div className="sec-head" data-reveal>
            <p className="sec-k">03 · Product thinking</p>
            <h2>User → behavior → metric → insight → <em>decision</em></h2>
            <p className="sec-sub">How I connect analysis to what a team does next, shown through my RM allocation work.</p>
          </div>
          <ol className="chain" data-reveal>
            {chain.map((c, n) => (
              <li key={c.k} style={{ "--n": n }}>
                <span className="n">{String(n + 1).padStart(2, "0")}</span>
                <b>{c.k}</b>
                <p>{c.v}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="skills" className="sec">
          <div className="sec-head" data-reveal>
            <p className="sec-k">04 · Skills ecosystem</p>
            <h2>Everything points at <em>decisions</em></h2>
            <p className="sec-sub">How the pieces connect, not how many percent of each I know.</p>
          </div>
          <div data-reveal><Skills /></div>
        </section>

        <section id="experience" className="sec">
          <div className="sec-head" data-reveal>
            <p className="sec-k">05 · Experience</p>
            <h2>Where I&rsquo;ve <em>done it</em></h2>
          </div>
          <div className="timeline">
            <div className="role glow" data-reveal>
              <div className="when">Nov 2025 – Present</div>
              <h3>Business Analyst (Product &amp; Analytics) <small>BimaKavach · Bengaluru</small></h3>
              <ul>
                <li>Drove a 0-to-1 Greylabs <b>AI voice bot pilot qualifying 3,000+ daily inbound leads</b>; optimized auto-dialer workflows with queue management, prioritization and CRM handoffs.</li>
                <li>Led company-level financial and operational metric analysis supporting a <b>Rs. 100 Cr Series-A fundraise</b>, with insights for investor pitch decks and due diligence.</li>
                <li>Engineered an automated client cohort analysis framework: <b>~2 days to ~5 minutes</b>. Formulated customer segmentation strategies to evaluate cross-sell and upsell performance.</li>
                <li>Led the end-to-end <b>migration of 90,000+ policies</b> across ~40 data points to Vaatun, restructuring architectures for 12K direct and 40K partner clients to enable RCA-ready reporting.</li>
                <li>Defined LSQ activity tracking for offline RM-assisted journeys; owned <b>RM allocation logic across India</b> (entity type, revenue, GWP).</li>
                <li>Developed centralized <b>Power BI and Metabase dashboards</b> tracking operational and financial KPIs, standardizing logic for faster management decisions.</li>
              </ul>
            </div>
            <div className="role glow" data-reveal>
              <div className="when">Nov 2023 – Nov 2025</div>
              <h3>MCA, Data Science <small>Presidency College (Autonomous) · Bengaluru</small></h3>
            </div>
            <div className="role glow" data-reveal>
              <div className="when">Oct 2019 – Oct 2022</div>
              <h3>BCA <small>Royal Global University · Guwahati</small></h3>
            </div>
          </div>

          <div className="mini">
            <div className="glow" data-reveal>
              <span className="tag">Project</span>
              <b>SmartShelf — semantic book recommender</b>
              <p>AI recommendation engine mapping user emotional cues to book embeddings across 10k+ titles. Top-5 precision up 12+ pts in offline evals; median latency under 300ms. Python, HuggingFace, LangChain, Gradio.</p>
            </div>
            <div className="glow" data-reveal style={{ "--d": ".1s" }}>
              <span className="tag">Leadership</span>
              <b>Mentoring &amp; event leadership</b>
              <p>Mentored students for 5+ years at Northeast India&rsquo;s largest interschool IT fest and conceptualized Technophilia, an inter-university IT fest.</p>
            </div>
          </div>
        </section>

        <section id="contact" className="contact">
          <p className="sec-k" data-reveal>06 · Contact</p>
          <h2 data-reveal>Let&rsquo;s turn your data into <em>decisions.</em></h2>
          <div className="actions" data-reveal>
            <a className="btn btn-primary btn-lg" href="mailto:biswajit2001june@gmail.com"><span>biswajit2001june@gmail.com</span></a>
            <a className="btn btn-secondary btn-lg" href="https://www.linkedin.com/in/biswajit-saha-72681b1a0/" target="_blank" rel="noreferrer"><span>LinkedIn ↗</span></a>
          </div>
        </section>
      </main>

      <footer className="foot">
        <span>© {new Date().getFullYear()} Biswajit Saha</span>
        <a href="#top">Back to top ↑</a>
      </footer>
    </>
  );
}
