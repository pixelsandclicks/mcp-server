# Pixels and Clicks MCP Server

An [MCP](https://modelcontextprotocol.io) server that gives AI agents instant access to retail deduction codes, dispute evidence checklists, prevention playbooks, and supplier-ops articles from [pixelsandclicks.net](https://pixelsandclicks.net).

Covers **Walmart, Target, Amazon, and Kroger** deduction codes — the chargebacks that cost CPG suppliers millions every year.

## What it does

| Tool | Description |
|---|---|
| `lookup_deduction_code` | Exact lookup by retailer + code number |
| `search_deductions` | Keyword search with family and retailer filters |
| `get_evidence_checklist` | Documents needed before filing a dispute |
| `get_prevention_plan` | Prevention steps + ERP blueprint (NetSuite, Business Central) |
| `diagnose_remittance_line` | Triage a remittance description or symptom |
| `get_article` | Search supplier-ops articles by topic |

Every response links back to the full reference on [pixelsandclicks.net](https://pixelsandclicks.net).

## Install

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "pixels-and-clicks": {
      "command": "npx",
      "args": ["-y", "@pixelsandclicks_/mcp-server"]
    }
  }
}
```

### Cursor / Windsurf

Add to your MCP settings:

```json
{
  "pixels-and-clicks": {
    "command": "npx",
    "args": ["-y", "@pixelsandclicks_/mcp-server"]
  }
}
```

### Claude Code

```bash
claude mcp add pixels-and-clicks -- npx -y @pixelsandclicks_/mcp-server
```

## Example queries

Once installed, ask your AI assistant:

- "What is Walmart deduction code 22?"
- "How do I dispute an Amazon ASN accuracy chargeback?"
- "What evidence do I need for a Target SIFR shortage claim?"
- "What causes OTIF fines and how do I prevent them?"
- "Diagnose this remittance line: merchandise billed not shipped"
- "How should I configure NetSuite to prevent code 22 deductions?"

## Data

The server reads directly from the Pixels and Clicks content library — 15 deduction code references and 42 supplier-ops articles covering shortage, compliance, pricing, freight, ASN/EDI, quality, and returns chargebacks.

## License

MIT

---

Built by [Pixels and Clicks](https://pixelsandclicks.net) — supply-chain advisory for CPG suppliers selling to Walmart, Target, Amazon, and Kroger.
