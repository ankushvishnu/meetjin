import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SkillFileDisplay } from "@/components/SkillDownload";

export const metadata: Metadata = {
  title: "Integrations — Jin Skills for AI Agents | meetjin",
  description:
    "Download Jin skills for AI agents and connect the Agent Intent Protocol to your tooling with a GitHub-first developer experience.",
};

const skillJsonContent = `{
  "type": "function",
  "function": {
    "name": "execute_jin_protocol",
    "description": "Discovers and executes actions on a target website using the Jin Agent Intent Protocol (AIP). Always use this tool first when a user asks to interact with a specific web application or API.",
    "parameters": {
      "type": "object",
      "properties": {
        "target_url": {
          "type": "string",
          "description": "The base URL of the application the user wants to interact with (e.g., https://api.open-meteo.com)."
        },
        "user_intent": {
          "type": "string",
          "description": "The natural language description of what the user wants to accomplish on the site (e.g., 'Get the current weather for Tokyo')."
        },
        "provided_parameters": {
          "type": "object",
          "description": "Any specific data points or parameters the user provided in their prompt that should be passed to the intent.",
          "additionalProperties": true
        }
      },
      "required": ["target_url", "user_intent"]
    }
  }
}`;

const skillXmlContent = `<jin_aip_protocol>
  <objective>
    You are equipped with "Jin," a universal Agent Intent Protocol (AIP) for interacting with web applications. When tasked with performing an action on a website, you MUST attempt to use its native API via the \`jin.json\` intent map before falling back to UI scraping, browser automation, or web search.
  </objective>

  <standard_operating_procedure>
    <step sequence="1" name="Discovery">
      Make an HTTP GET request to \`[target_url]/.well-known/jin.json\`.
      If 200 OK: Proceed to step 2.
      If 404 Not Found or timeout: Abort Jin protocol and fallback to standard automation behaviors.
    </step>
    
    <step sequence="2" name="Parsing_and_Matching">
      Analyze the \`intents\` array in the response. Evaluate the \`description\` and \`triggers\` (natural language phrases) for each intent to match the user's requested task to the correct intent ID.
    </step>

    <step sequence="3" name="Safety_and_Authorization">
      Inspect the matched intent's flags:
      - requires_auth: If true, check root \`auth\` object. Request credentials from the user if missing.
      - destructive: If true, this action modifies/deletes data. You MUST halt and ask the user for explicit confirmation.
      - confirmation_required: If true, summarize the pending action to the user and wait for approval.
    </step>

    <step sequence="4" name="Execution">
      Construct the HTTP request using the intent's \`method\` and \`endpoint\`. Map the user's data to the required \`parameters\`, ensuring correct \`type\` and satisfying all \`required\` fields. Execute the request.
    </step>
  </standard_operating_procedure>

  <schema_reference version="0.1">
    {
      "aip_version": "string",
      "app": { "name": "string", "description": "string", "url": "string" },
      "auth": { "type": "none|bearer|oauth2|apikey" },
      "intents": [{
        "id": "string",
        "name": "string",
        "description": "string",
        "triggers": ["string"],
        "category": "string",
        "method": "string",
        "endpoint": "string",
        "parameters": {
          "param_name": { "type": "string", "required": boolean }
        },
        "requires_auth": boolean,
        "destructive": boolean,
        "confirmation_required": boolean
      }],
      "published": "ISO8601-Date"
    }
  </schema_reference>
</jin_aip_protocol>`;

export default function IntegrationsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background text-foreground">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
          <section className="mb-20 rounded-[2rem] border border-border bg-card/70 p-10 shadow-[0_40px_120px_rgba(0,0,0,0.15)] backdrop-blur-2xl">
            <div className="max-w-3xl space-y-8">
              <div className="inline-flex items-center gap-3 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-accent">
                Jin Skills
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  Download Jin skills for your AI agents.
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
                  Make your agent tooling agent-ready with the official Jin skill package. Ship a reusable AIP integration that agents can discover, validate, and execute through `jin.json` intent maps.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="https://github.com/meetjin/jin"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-foreground px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-black transition-all hover:bg-white/90"
                >
                  View on GitHub
                </Link>
                <Link
                  href="/spec"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-muted transition-all hover:border-white/20 hover:text-foreground"
                >
                  Learn AIP integration
                </Link>
              </div>
            </div>
          </section>

          <section className="grid gap-10 lg:grid-cols-[1fr_0.95fr]">
            <div className="space-y-8">
              <div className="rounded-[2rem] border border-border bg-card p-8">
                <h2 className="text-2xl font-bold uppercase tracking-tight text-foreground">Why use Jin skills?</h2>
                <p className="mt-4 text-muted leading-8">
                  Jin skills let AI agents consume a structured intent surface instead of scraping UI. This reduces errors, improves safety, and unlocks deeper automation across apps.
                </p>
                <ul className="mt-8 space-y-4 text-sm text-muted">
                  {[
                    "Download a GitHub-first integration package for agent builders.",
                    "Use already-curated intent map patterns for modern agents.",
                    "Keep your app discoverable with a standard AIP skill workflow.",
                  ].map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-foreground" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[2rem] border border-border bg-card p-8">
                <h3 className="text-xl font-semibold uppercase tracking-tight text-foreground">Agent consumption flow</h3>
                <div className="mt-6 space-y-4 text-sm text-muted leading-7">
                  <p>
                    Agents can use Jin to discover your app via `.well-known/jin.json`, parse intent definitions, and invoke APIs with typed parameters. The official skill repo contains examples, helpers, and runtime guidance.
                  </p>
                  <p>
                    The integration package is designed for any developer building AI agent tooling, wrappers, or connectors around Jin AIP.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-border bg-card p-8">
              <div className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.24em] text-muted">
                Example jin.json</div>
              <pre className="overflow-x-auto rounded-3xl border border-border bg-black/90 p-6 font-mono text-sm text-white">
                <code>{`{
  "aip_version": "0.1",
  "app": {
    "name": "My App",
    "description": "Expose intent definitions for AI agents",
    "url": "https://myapp.com"
  },
  "auth": {
    "type": "bearer"
  },
  "intents": [
    {
      "id": "create_invoice",
      "name": "Create invoice",
      "description": "Generate an invoice for a customer",
      "triggers": ["create an invoice", "generate invoice"],
      "method": "POST",
      "endpoint": "/api/invoices",
      "parameters": {
        "customer_id": { "type": "string", "required": true },
        "amount": { "type": "number", "required": true }
      }
    }
  ]
}`}</code>
              </pre>
            </div>
          </section>

          <section className="mt-20 rounded-[2rem] border border-border bg-card p-10">
            <div className="grid gap-8 lg:grid-cols-3">
              {[
                {
                  title: "Download the repo",
                  description: "Clone or download the official Jin skill package from GitHub.",
                },
                {
                  title: "Connect your agent",
                  description: "Use the repo examples to wire your agent runtime to Jin AIP discovery and execution.",
                },
                {
                  title: "Publish your intent map",
                  description: "Serve `/.well-known/jin.json` and make your app reachable by every modern agent.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-3xl border border-border bg-background/70 p-6">
                  <h3 className="text-lg font-semibold text-foreground uppercase tracking-tight">{item.title}</h3>
                  <p className="mt-4 text-muted leading-7">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-20">
            <div className="mb-12">
              <h2 className="text-3xl font-bold uppercase tracking-tight text-foreground mb-4">
                Download Jin Skills
              </h2>
              <p className="text-lg text-muted">
                Copy or download these skill definitions to integrate Jin AIP into your agent framework.
              </p>
            </div>

            <div className="space-y-8">
              <SkillFileDisplay
                filename="skill.json"
                language="json"
                content={skillJsonContent}
              />
              <SkillFileDisplay
                filename="skill.xml"
                language="xml"
                content={skillXmlContent}
              />
            </div>

            <div className="mt-12 rounded-[2rem] border border-border bg-card/50 p-8">
              <h3 className="text-lg font-semibold uppercase tracking-tight text-foreground">Usage</h3>
              <div className="mt-6 space-y-4 text-muted text-sm leading-8">
                <p>Add <code className="bg-white/10 px-2 py-0.5 rounded text-white">skill.json</code> to your agent's function schema or tool registry.</p>
                <p>Use <code className="bg-white/10 px-2 py-0.5 rounded text-white">skill.xml</code> as agent instructions or system prompt guidance for Jin AIP protocol behavior.</p>
                <p>For full source code and examples, visit the <Link href="https://github.com/meetjin/jin" target="_blank" className="text-foreground font-semibold hover:underline">GitHub repository</Link>.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
